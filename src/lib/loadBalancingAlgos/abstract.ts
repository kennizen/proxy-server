import { Server } from "../serverPool/serverPool";

export interface AlgoClass {
  getServer: (servers: Server[]) => Server;
}
