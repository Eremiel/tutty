import * as express from "express";
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import http = require('http');
import https = require('https'); 
import cookieParser = require("cookie-parser");

import ReadConfiguration from "./config";
import logger from './logger';
import events from './emitter'; 

import { Server } from './interfaces';
import * as socket from 'socket.io';
import SocketIO from 'socket.io';
import { isUndefined } from 'lodash';
import path = require('path');

let config = ReadConfiguration('server.config.json');

const trim = (str: string): string => str.replace(/\/*$/, '');

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
    // .use(morgan('combined', 
    //   { stream: {write (message: string): void {
    //       logger.info(message);
    //     } 
    //   }}))
    .use(helmet())
    .use(cookieParser())
    .use('/',express.static(path.join(app.path(), 'public')));

  return socket(
     http.createServer(app).listen(port, host, () => {
          events.server(port, 'http');
        }),
    { path: `${basePath}/socket.io` }
  );
}
