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
Name:    validateCookie 
Purpose: validates the authentication cookie
@param {request} the HTTP request for which the cookie should be validated

@return {bool} True if the request carries a valid authentication cookie
*/
export function validateCookie(req) {
  const token = req.cookies['authToken'];
  return (token === undefined) ? undefined : jwt.verify(token, config.PUBLIC_KEY.trim(), { algorithms: ['RS256'] });
}

export default {githubUsername, validateCookie}
