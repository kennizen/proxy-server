import { Server } from "../serverPool/serverPool";
import { ILBAlgo } from "./abstract";

export class Random implements ILBAlgo {
  constructor() {}

  getServer(servers: Server[]) {
    const idx = Math.floor(Math.random() * servers.length);
    return servers[idx];
  }
}
