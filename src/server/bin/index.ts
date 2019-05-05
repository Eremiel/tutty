import logger from './logger';

/* Reading the configuration is the first thing to do */
import config from './config';
config.ReadFromFile('server.config.json'); 
config.ReadFromEnv();

import optimist = require("optimist");
import wetty from './emitter';

/* Options */

const opts = optimist
  .options({
    port: {
      demand     : false,
      alias      : 'p',
      description: 'server listen port',
    },
    help: {
      demand     : false,
      alias      : 'h',
      description: 'Print help message',
    },
    interface: {
      demand     : false,
      alias      : 'i',
      description: 'IP of the interface the server will listen on',
    },
    sshhost: {
      demand     : false,
      alias      : 's',
      description: "Host address for ssh connections to backing instances"
    },
    sshuser: {
      demand     : false,
      alias      : 'u',
      description: "Username for ssh connections to backing instances"
    },
    sshpassword: {
      demand     : false,
      alias      : 'p',
      description: "Password for ssh connections to backing instances (requires sshuser)"
    },
    sshport: {
      demand     : false,
      description: "Port where the ssh server is listening for connections",
    },
    sshauth: {
      demand     : false,
      description: "Authentication method for ssh (publickey, password, hostbased)"
    }

  })
  .boolean('allow_discovery').argv;

/* Consants and override properties with environment variables */
const port      = opts.port || process.env.PORT || 3000;
const iface     = opts.interface || process.env.INTERFACE || "0.0.0.0";
const sshhost   = opts.sshhost || config.Instance.BACKEND.HOST || process.env.SSH_HOST || ""; // defaults to this machine (diables ssh)
const sshport   = opts.sshport || config.Instance.BACKEND.PORT || process.env.SSH_PORT || 22;
const sshauth   = opts.sshauth || config.Instance.BACKEND.AUTH_METHOD || process.env.SSH_AUTH_METHOD || "hostbased";

const base      = "/wetty"

/* Start the application */

wetty.start(
  {user:"",host:sshhost,port:sshport,auth:sshauth},
  {base:base,port:port,host:iface},"bash"
);
//createServer({base:'/wetty',port:port,host:'localhost'});
