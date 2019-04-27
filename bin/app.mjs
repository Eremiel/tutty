import express from 'express';
import http from 'http';
import https from 'https';
import path from 'path';
import server from 'socket.io';
import { spawn } from 'node-pty';
import EventEmitter from 'events';
import favicon from 'serve-favicon';
import util from 'util';

const { exec } = require('child_process');
import cookieParser from 'cookie-parser';
var cookie = require('cookie')
import { validateAuthToken, createAuthToken } from './oauth.mjs';

/* First step - initialise router */
const app = express();

/****************************************************************************************
 * Process configuration 
 ****************************************************************************************/

var config = require('./config.json');

// Allow for ENV variable to overwrite the callback uri for Github OAuth2
if (process.env.AUTH_REQUEST_REDIRECT_URI) {
  config.AUTH_REQUEST.redirect_uri = process.env.AUTH_REQUEST_REDIRECT_URI;
}

if (process.env.AUTH_REQUEST_ID) {
  config.AUTH_REQUEST.client_id = process.env.AUTH_REQUEST_ID;
}

if (process.env.AUTH_REQUEST_SECRET) {
  config.AUTH_REQUEST.client_secret = process.env.AUTH_REQUEST_SECRET;
}


/****************************************************************************************
 * Redis key-value store 
 ****************************************************************************************/

 // TODO make IP/Port configurable

var redis = require('redis');
var redis_client = redis.createClient(config.REDIS_PORT, config.REDIS_URL); // this creates a new client
var redis_error = false;
redis_client.on("error", (err) => {
  console.log("Error " + err);
  redis_error = true;
});

/****************************************************************************************
 * Passport initialisation
 ****************************************************************************************/
import passport from 'passport';
import GitHubStrategy from 'passport-github2';

/* passport middleware */
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
    clientID: config.AUTH_REQUEST.client_id,
    clientSecret: config.AUTH_REQUEST.client_secret,
    callbackURL: config.CALLBACK_PATH
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log(`New authentication with profile: ${util.inspect(profile)}`);
    console.log(`New authentication with username: ${profile.username}`);
    return done(null, profile.username);
  }
));

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(user, done) { done(null, user); });

/*
  Local validation of requests
*/
function validRequest(req, res, next) {

  try {
    const token = validateAuthToken(req.cookies.authToken)
    if ( token ) { 
      next();
    } else {
      throw new Error(`Invalid token [${token}]`);
    }
  } catch (Error) {
    res.redirect(config.LOGIN_PATH);
    res.send();
  }
  
}

/****************************************************************************************
 * Express routes 
 ****************************************************************************************/

// app.use(favicon(`public/favicon.ico`));

// Check if authentication cookie is configured and redirect if not
app.use(cookieParser());

app.get(config.LOGIN_PATH, passport.authenticate('github'));

app.get(config.CALLBACK_PATH, 
  passport.authenticate('github'), (req,res) => {
    if ( req.user ) {
      // Create a jwt and stor in a cookie for socket.io access
      res.cookie('authToken', createAuthToken(req.user));
      res.redirect(config.AUTH_REQUEST.redirect_uri);
      //res.send('success')
      console.log(`Validated new login for user: ${req.user}`);
    } else {
      console.error('Callback error. Request does not have a user object.')
      res.redirect('/404.html');
    }
  }
);

// For serving css and javascript
app.use('/', validRequest, 
  express.static(path.join(app.path(), 'public'))
);

/****************************************************************************************
 * HTTP Server Implementaiton
 ****************************************************************************************/

/*
Name:    createServer 
Purpose: creates a new HTTP/HTTPS server to serve the application 
Inputs:  port       - int       the port to listen at
         sslopts    - struct    ssl options

Returns: none
*/
function createServer(port, sslopts) {
  return sslopts && sslopts.key && sslopts.cert
    ? https.createServer(sslopts, app).listen(port, () => {
      console.log(`https on port ${port}`);
    })
    : http.createServer(app).listen(port, () => {
      console.log(`http on port ${port}`);
    });
}

function ensureUserEnvironment(username) {

  // TODO Need to find way to ensure same UID and GID across instances to share home directories
  //      Current idea: use a redis instance to manage UIDs and GIDs

  console.log(`Ensuring user exists for login ${username}`)

  getUserId(username)
    .then((uid) => {
      // Previously seen user. Create environment and reassign uid
      exec(`id -u ${username} &>/dev/null || (useradd --shell /bin/bash --home-dir /home/${username} -m --groups tutorial --uid ${uid} ${username})`, 
        { shell: "/bin/bash" },
        (err, stdout, stderr) => {
          if (err) {
            throw new Error(err);
          }
        });
    })
    .catch((error) => {
      // New user. Create environment and store uid for future use
      exec(`(id -u ${username} &>/dev/null || useradd --shell /bin/bash --home-dir /home/${username} -m --groups tutorial ${username} &>/dev/null) && id -u ${username}`, 
        { shell: "/bin/bash" },
        (err, stdout, stderr) => {
          if (err) {
            throw new Error(err);
          } else {
            redis_client.set(username, stdout.trim());
            console.log(`New user ${username} assigned UID ${stdout}`);
          }
        });
    });
}

function getUserId(username) {
  return new Promise((resolve, reject) => {
    
    if (redis_error) {
      return reject("Redis not available");
    }

    redis_client.get(username, function (error, result) {
      if (error) {
        console.log(`Error accessing redis store.`);
        reject(error)
      } else {
        if (result == null) {
          console.log(`User ${username} unknown.`);
          reject("Unknown username");
        }
        console.log(`User ${username} known -> UID: ${result}`);
        resolve(result.trim());
      }
    });
  });
}

function getLoginShellCommand(socket) {
  const { request } = socket;

  const c = cookie.parse(socket.handshake.headers.cookie);
  const token = validateAuthToken(c.authToken)
  console.log("Token: %j", token);
  if ( token === undefined ) {
    throw new Error("UNAUTHORISED - Authentication Token missing");
  }

  const user = token.sub;
  console.log(`Preparing login shell for ${user}`)
  
  return [
    ['login', '-h', socket.client.conn.remoteAddress.split(':')[3], '-f', user]
    ,
    user,
  ];
}

/****************************************************************************************
 * Module export
 ****************************************************************************************/

export default function start(port, sslopts) {
  const events = new EventEmitter();

  /* Start websocket */
  const io = server(createServer(port, sslopts), { path: '/wetty/socket.io' });
  io.on('connection', socket => {
    console.log(`${new Date()} Connection accepted.`);

    const [args, user] = getLoginShellCommand(socket);
  
    // Prepare user
    ensureUserEnvironment(user);

    // Start terminal session
    console.log(`Issiung command: ${args}`)
    const term = spawn('/usr/bin/env', args, {
      name: 'xterm-256color',
      cols: 80,
      rows: 30,
    });

    console.log(`${new Date()} PID=${term.pid} STARTED on behalf of user=${user}`);
    term.on('data', data => socket.emit('output', data));
    term.on('exit', code => {
      console.log(`${new Date()} PID=${term.pid} ENDED`);
      socket.emit('logout');
      events.emit('exit', code);
    });
    socket.on('resize', ({ col, row }) => term.resize(col, row));
    socket.on('input', input => term.write(input));
    socket.on('disconnect', () => {
      term.end();
      term.destroy();
      events.emit('disconnect');
    });
  });

  


  return events;
}
