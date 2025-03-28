import { Server } from "../serverPool/serverPool";
import { AlgoClass } from "./abstract";

export class RoundRobin implements AlgoClass {
  private lastSelectedServer: number;

  constructor() {
    this.lastSelectedServer = -1;
  }

  getServer(servers: Server[]) {
    const curServer = (this.lastSelectedServer + 1) % servers.length;
    this.lastSelectedServer = curServer;
    return servers[curServer] ?? null;
  }
}
