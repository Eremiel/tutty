import * as express from "express";

import * as helmet from 'helmet'; 
import * as morgan from 'morgan';

import http = require('http');
import https = require('https'); 
import cookieParser = require("cookie-parser");

import config from "./config";
import logger from './logger';
import events from './emitter'; 

import * as passport from 'passport';
import { githubStrategy, tokenStrategy, createAuthToken, lookupUser } from './auth';
import { User } from './interfaces';

import { Server } from './interfaces';
import * as socket from 'socket.io';
import * as SocketIO from 'socket.io'; 

import path = require('path');

const trim = (str: string): string => str.replace(/\/*$/, '');


/****************************************************************************************
 * Initialise passport 
 ****************************************************************************************/

passport.use(githubStrategy());
passport.use(tokenStrategy(config.Instance.WEBTOKEN.COOKIE_NAME));

/*
Serialize the user object into the session by storing the username
*/
passport.serializeUser(
  (user: User, done) => { 
    done(null, user.username); 
  }
);

/*
Retrieve the username object from the session by looking up in
ldap
*/
passport.deserializeUser(
  (username: string, done) => { 
    lookupUser(username, (user) => {
      done(null, user); 
    });
  }
);

/****************************************************************************************
 * Initialise express 
 ****************************************************************************************/

 export default function createServer({ base, port, host }: Server ): SocketIO.Server {
  const basePath = trim(base);
  events.emit(
    'debug',
    `port: ${port}, base: ${base}`
  );

  const app = express();
  
  
  app
    .use(morgan('combined', 
      { stream: {write (message: string): void {
          logger.info(message);
        } 
      }}))
    .use(helmet())
    .use(cookieParser())
    .use(passport.initialize())
    .get(config.Instance.LOGIN_PATH, passport.authenticate('github', (req,res) => {}))
    .get(config.Instance.CALLBACK_PATH, 
      passport.authenticate('github'), (req,res) => {
        if ( req.user ) {
          // Create a jwt and stor in a cookie for socket.io access
          res.cookie(config.Instance.WEBTOKEN.COOKIE_NAME, createAuthToken(req.user.username));
          logger.info(`Validated new login for user: ${req.user.username}`);
        } else {
          logger.info('Callback error. Request does not have a user object.')
          res.redirect('/404.html');
        }

        res.redirect(config.Instance.AUTH_REQUEST.redirect_uri);
      }
    )
    .use('/', 
      passport.authenticate('cookie', {failureRedirect: config.Instance.LOGIN_PATH}),
      express.static(path.join(app.path(), 'public')));
  
  return socket(
     http.createServer(app).listen(port, host, () => {
          events.server(port, 'http');
        }),
    { path: `${basePath}/socket.io` }
  );
}
