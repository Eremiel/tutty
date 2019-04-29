import fs from 'fs-extra';
import path from 'path';
import optimist from 'optimist';
import app from './app';

/****************************************************************************************
 * Main
 ****************************************************************************************/

 /* Options */

const opts = optimist
  .options({
    sslkey: {
      demand     : false,
      description: 'path to SSL key',
    },
    sslcert: {
      demand     : false,
      description: 'path to SSL certificate',
    },
    sshhost: {
      demand     : false,
      description: 'ssh server host',
    },
    sshport: {
      demand     : false,
      description: 'ssh server port',
    },
    port: {
      demand     : false,
      alias      : 'p',
      description: 'wetty listen port',
    },
    help: {
      demand     : false,
      alias      : 'h',
      description: 'Print help message',
    },
  })
  .boolean('allow_discovery').argv;

if (opts.help) {
  optimist.showHelp();
  process.exit(0);
}

 /* Define port for application */
const port = opts.port || process.env.PORT || 3000;

/* Setup SSL */
loadSSL(opts)
  .then(ssl => {
    opts.ssl = ssl;
  })
  .catch(err => {
    console.error(`Error: ${err}`);
    process.exit(1);
  });

/* Handle exceptions */
process.on('uncaughtException', err => {
  console.error(`Error: ${err}`);
});

/* Initialise wetty terminal */
const tty = app(port, opts.ssl);
tty.on('exit', code => {
  console.log(`exit with code: ${code}`);
});
tty.on('disconnect', () => {
  console.log('disconnect');
});

/* Configure OAuth */


/****************************************************************************************
 * SSL Support functions
 ****************************************************************************************/

/*
Name:    loadSSL 
Purpose: Load SSL certificate and key asynchronosly
Inputs:  sslkey     - string    filename of the ssl key
         sslcert    - string    filename of the ssl cert

Returns: promise with ssl key and cert
*/
function loadSSL({ sslkey, sslcert }) {
  return new Promise((resolve, reject) => {
    const ssl = {};
    if (sslkey && sslcert) {
      fs
        .readFile(path.resolve(sslkey))
        .then(key => {
          ssl.key = key;
        })
        .then(fs.readFile(path.resolve(sslcert)))
        .then(cert => {
          ssl.cert = cert;
        })
        .then(resolve(ssl))
        .catch(reject);
    }
    resolve(ssl);
  });
}
