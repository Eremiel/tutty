import express from 'express';
import http from 'http';
import https from 'https';
import path from 'path';
import server from 'socket.io';
import { spawn } from 'node-pty';
import EventEmitter from 'events';
import favicon from 'serve-favicon';
import githubOAuth from 'github-oauth';
import {githubUsername,validateAuthToken, createAuthToken} from './oauth.mjs';
const { exec } = require('child_process');
var jwt = require('jsonwebtoken');
import cookieParser from 'cookie-parser';
var cookie = require('cookie')

var config = require('./config.json');

/****************************************************************************************
 * Express routes 
 ****************************************************************************************/

const app = express();
// app.use(favicon(`public/favicon.ico`));

/* oauth handler */
const oauth = githubOAuth({
  githubClient: config.AUTH_REQUEST.client_id,
  githubSecret: config.AUTH_REQUEST.client_secret,
  scope: config.AUTH_REQUEST.scope, // optional, default scope is set to user
  baseURL: config.AUTH_REQUEST.redirect_uri,
  loginURI: config.LOGIN_PATH,
  callbackURI: config.CALLBACK_PATH
});

app.get(config.LOGIN_PATH, (req,res) => {
  return oauth.login(req, res);
})

app.get(config.CALLBACK_PATH, (req,res) => {
  return oauth.callback(req, res);
})

// Check if authentication cookie is configured and redirect if not
app.use(cookieParser());
app.use( (req, res, next) => {
  const token = req.cookies['authToken'];
  var cookie = validateAuthToken(token);

  if (cookie === undefined) {
    res.redirect(config.LOGIN_PATH);
    res.send();
  } else {
    next();
  }
});

// For serving css and javascript
app.use('/', express.static(path.join(app.path(), 'public')));

oauth.on('error', function(err) {
  console.error('there was a login error', err)
})

oauth.on('token', function(token, res) {
  // Obtain username, sign new web token, and store as cookie
  // Then redirect to landing page
  githubUsername(token)
    .then( (username) => {
        res.cookie('authToken', createAuthToken(username));
        res.redirect(config.AUTH_REQUEST.redirect_uri);
        res.send();
        console.log(`Validated new login for user: ${username}`);
      },
      (err) => {
        res.redirect('/404.html');
      }
    );
  
});

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
  exec(`id -u ${username} &>/dev/null || adduser -s /bin/bash -h /home/${username} -D ${username}`, (err, stdout, stderr) => {
    if (err) {
      throw new Error(err);
    }
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
