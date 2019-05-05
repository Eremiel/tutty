import * as fs from 'fs';
import logger from './logger';

interface AuthRequestConfig {
  redirect_uri:   string;
  client_id:      string;
  client_secret:  string;
  scope:          string;
}

interface WebtokenConfig {
  DURATION:       string;
  SECRET:         string;
  COOKIE_NAME:    string;
}

interface BackendConfig {
  HOST:           string;
  PORT:           number;
  AUTH_METHOD:    string;
}

export class Configuration {

  AUTH_REQUEST:       AuthRequestConfig;
  WEBTOKEN:           WebtokenConfig;
  BACKEND:            BackendConfig;
  SESSION_SECRET:     string;
  CALLBACK_PATH:      string;
  LOGIN_PATH:         string;
  ORGANIZATION:       string;
  APPNAME:            string;
  PRIVATE_KEY:        string;
  PUBLIC_KEY:         string;
  REDIS_URL:          string;
  REDIS_PORT:         number;
  LDAP_SERVER_URL:    string;
  LDAP_BASE:          string;
  LDAP_ADMIN_DN:      string;
  LDAP_ADMIN_PASSWORD:string;
  LDAP_ID_RANGE_START:number;

  private static _instance: Configuration;

  private constructor() {}

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this());
  }

  public static ReadFromFile(configFile: string) {
    
    var data = fs.readFileSync(configFile);
    var fileData = JSON.parse(data.toString());

    Configuration._instance = {...Configuration._instance, ...fileData};
    logger.debug(`Read configuration from ${configFile}`);
    
  }

  public static ReadFromEnv() {

    var envData = new Configuration()

    // Allow for ENV variable to overwrite the callback uri for Github OAuth2
    if (process.env.AUTH_REQUEST_REDIRECT_URI) {
      envData.AUTH_REQUEST.redirect_uri = process.env.AUTH_REQUEST_REDIRECT_URI;
    }

    if (process.env.AUTH_REQUEST_ID) {
      envData.AUTH_REQUEST.client_id = process.env.AUTH_REQUEST_ID;
    }

    if (process.env.AUTH_REQUEST_SECRET) {
      envData.AUTH_REQUEST.client_secret = process.env.AUTH_REQUEST_SECRET;
    }

    Configuration._instance = {...Configuration._instance, ...envData};
  }

}

export default Configuration;

 