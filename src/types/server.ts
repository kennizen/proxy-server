export interface IServerConfig {
  port: number;
  resources: {
    name: string;
    endpoint: string;
    host: string;
    port: number;
    base_url: string;
    weight?: number;
  }[];
  healthCheck: {
    interval: number;
    timeout: number;
  };
}

export interface IError extends Error {
  code: string | number;
}
