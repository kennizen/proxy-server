import { Server } from "../serverPool/serverPool";

export interface ILBAlgo {
  getServer: (servers: Server[]) => Server;
}
