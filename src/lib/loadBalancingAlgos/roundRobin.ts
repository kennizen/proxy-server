import { Server } from "../serverPool/serverPool";
import { ILBAlgo } from "./abstract";

export class RoundRobin implements ILBAlgo {
  private lastIndx: number;

  constructor() {
    this.lastIndx = -1;
  }

  getServer(servers: Server[]) {
    if (this.lastIndx < servers.length) {
      const newIdx = (this.lastIndx + 1) % servers.length;
      this.lastIndx = newIdx;
      return servers[newIdx];
    }

    this.lastIndx = 0;
    return servers[this.lastIndx];
  }
}
