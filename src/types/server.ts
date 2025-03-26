export interface ServerConfig {
  port: number;
  resources: {
    name: string;
    endpoint: string;
    host: string;
    port: number;
    base_url: string;
  }[];
  healthCheck: {
    interval: number;
    timeout: number;
  };
}
