import * as github from 'passport-github2';
import * as CookieStrategy from 'passport-cookie';
import * as jwt from 'jsonwebtoken';
import LdapUser from './ldap'
import config from "./config"
import logger from './logger';

/****************************************************************************************
 * User database actions
 ****************************************************************************************/
export function lookupUser(username: string, cb: (err: Error, user: LdapUser) => void) {
  LdapUser.FindByName(username, (err,user) => { cb(err,user); });
}

/****************************************************************************************
 * Passport initialisation
 ****************************************************************************************/

// Github is used as the main identity source
export function githubStrategy():github.Strategy { 

  return new github.Strategy({
    clientID: config.Instance.AUTH_REQUEST.client_id,
    clientSecret: config.Instance.AUTH_REQUEST.client_secret,
    callbackURL: config.Instance.CALLBACK_PATH
    },
    function(accessToken: string, refreshToken:string, profile, done) {
      
      logger.info(`New authentication with username: ${profile.username}`);

      /* 
        Obtain user data from ldap service or create new record if user 
        is unknown.
      */
      LdapUser.FindByName(profile.username, (err, user) => {
        
        if ( err === null || err === undefined) {
          return done(err,user);
        } else {
          LdapUser.CreateUser(profile.username, (err, user) => {
            logger.info(`Added user: ${JSON.stringify(user)}`);
            return done(err, user);
          })
        }
      }
    );
  });

}


// // A jwt token strategy is used for fast authentication of previously 
// // authenticated identities
export function tokenStrategy(cookieName: string): CookieStrategy {
  return new CookieStrategy(
    {
      cookieName: cookieName,
    }, 
    function(token, done) {    
      try {
        var user = validateAuthToken(token);
        return done(null, user);
      } catch(err) {
        logger.error( `Cookie strategy failed with error: ${err}` )
        return done(err, null);
      }
    }
  );
}



// /****************************************************************************************
//  * Web token
//  ****************************************************************************************/

/*
Name:    validateAuthToken 
Purpose: validates the authentication cookie
@param {token} the encrypten JWT authentication token

@return {string} The decrypten authentication Token or undefined if no valid token was provided
*/
export function validateAuthToken(token: string): string | object {
  
  if (token === undefined) throw new Error("Invalid token [undefined]");
  var data = jwt.verify(token, config.Instance.PUBLIC_KEY.trim(), { algorithms: ['RS256'] })
  if ( data === null ) throw new Error("Could not verify token.")
  return data;
}

/*
Name:    createAuthToken 
Purpose: create a new authentication token and encrypts it

@param {string} Username
@return {token} the encrypten JWT authentication token

*/
export function createAuthToken(username: string): string {
  return jwt.sign(
    { username: username,
      lastAuthenticatedOn: new Date()
    },
    config.Instance.PRIVATE_KEY.trim(),
    {
      audience: config.Instance.APPNAME,
      subject: username,
      expiresIn: config.Instance.WEBTOKEN.DURATION,
      algorithm: 'RS256'
    } // Options
  )
}