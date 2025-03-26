import { AlgoClass } from "../lib/loadBalancingAlgos/abstract";
import { Server } from "../lib/serverPool/serverPool";

export class LoadBalancer {
  algo: AlgoClass;

  constructor(algo: AlgoClass) {
    this.algo = algo;
  }

  getServer(servers: Server[]): Server {
    return this.algo.getServer(servers);
  }
}
