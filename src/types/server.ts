import { AlgoType } from "../lib/loadBalancingAlgos/LBAlgoFactory";

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
  lbAlgo: AlgoType;
}

export interface IError extends Error {
  code: string | number;
}
