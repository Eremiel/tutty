export interface Server {
  port: number;
  host: string;
  base: string;
}

export interface SSH {
  user: string;
  host: string;
  auth: string;
  port: number;
  pass?: string;
  key?: string;
}

export interface Group {
  groupname:  string;
  gid:        number;
}

export interface User {
  username:   string;
  uid:        number;
  gid:        number;
}