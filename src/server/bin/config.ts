interface AuthRequestConfig {
  redirect_uri:   string;
  client_id:      string;
  client_secret:  string;
  scope:          string;
}

export interface Configuration {
  AUTH_REQUEST:       AuthRequestConfig;
  SESSION_DURATION:   number;
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
  LDAP_ADMIN_PASSWORD:string;
  LDAP_ID_RANGE_START:number;
}

function ReadConfiguration(configFile: string) : Configuration {
  
  let config: Configuration = JSON.parse('{ "myString": "string", "myNumber": 4 }');

  // Allow for ENV variable to overwrite the callback uri for Github OAuth2
  if (process.env.AUTH_REQUEST_REDIRECT_URI) {
    config.AUTH_REQUEST.redirect_uri = process.env.AUTH_REQUEST_REDIRECT_URI;
  }

  if (process.env.AUTH_REQUEST_ID) {
    config.AUTH_REQUEST.client_id = process.env.AUTH_REQUEST_ID;
  }

  if (process.env.AUTH_REQUEST_SECRET) {
    config.AUTH_REQUEST.client_secret = process.env.AUTH_REQUEST_SECRET;
  }

  return config;
}

export default ReadConfiguration;

 