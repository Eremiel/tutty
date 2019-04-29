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