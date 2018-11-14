import axios from 'axios';

var jwt = require('jsonwebtoken');
var config = require('./config.json');

/*
Name:    githubUsername 
Purpose: obtains the github username associated with an oauth token
@param {object} token a struct describing the authentication token as returned from GitHub
                (e.g., {"access_token":"some value","token_type":"bearer","scope":"user"})

@return {Promise} Promise providing the username if successful
*/
export function githubUsername(token) {

  const authorization = token.token_type + ' ' + token.access_token;

  var promise = new Promise( (resolve, reject) => {
    axios.get('https://api.github.com/user', { headers: {'Authorization': authorization}})
    .then( (res) => { resolve(res.data.login); }, 
           (err) => { reject(err); }
    )
  });

  return promise;
}

/*
Name:    validateAuthToken 
Purpose: validates the authentication cookie
@param {token} the encrypten JWT authentication token

@return {string} The decrypten authentication Token or undefined if no valid token was provided
*/
export function validateAuthToken(token) {
  
  return (token === undefined) ? undefined : jwt.verify(token, config.PUBLIC_KEY.trim(), { algorithms: ['RS256'] });
}

/*
Name:    createAuthToken 
Purpose: create a new authentication token and encrypts it

@param {string} Username
@return {token} the encrypten JWT authentication token

*/
export function createAuthToken(username) {
  return jwt.sign(
    { username: username,
      lastAuthenticatedOn: new Date()
    },
    config.PRIVATE_KEY.trim(),
    {
      audience: config.APPNAME,
      subject: username,
      expiresIn: config.SESSION_DURATION,
      algorithm: 'RS256'
    } // Options
  )
}

export default { githubUsername, validateAuthToken, createAuthToken }

