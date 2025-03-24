import { ServerConfig } from "../../server";
import { AlgoClass } from "./abstract";

export class RoundRobin implements AlgoClass {
  private static instance: RoundRobin | null = null;
  private lastSelectedServer: number = 0;

  private constructor() {}

  static getInstance() {
    if (RoundRobin.instance === null) {
      RoundRobin.instance = new RoundRobin();
    }
    return RoundRobin.instance;
  }

  getServer(servers: ServerConfig["resources"]) {
    const curServer = (this.lastSelectedServer + 1) % servers.length;
    this.lastSelectedServer = curServer;
    return servers[curServer];
  }
}
