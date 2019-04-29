import jwt from 'jsonwebtoken';
import config from './config.json';

/*
Name:    validateAuthToken 
Purpose: validates the authentication cookie
@param {token} the encrypten JWT authentication token

@return {string} The decrypten authentication Token or undefined if no valid token was provided
*/
export function validateAuthToken(token) {
  
  if (token === undefined) throw new Error("Invalid token [undefined]");

  return jwt.verify(token, config.PUBLIC_KEY.trim(), { algorithms: ['RS256'] });
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

export default { validateAuthToken, createAuthToken }

