import { AlgoClass } from "../lib/loadBalancingAlgos/abstract";
import { ServerConfig } from "../server";

export class LoadBalancer {
  private static instance: LoadBalancer | null = null;
  algo: AlgoClass | null = null;

  private constructor() {}

  static getInstance() {
    if (LoadBalancer.instance === null) {
      LoadBalancer.instance = new LoadBalancer();
    }
    return LoadBalancer.instance;
  }

  set balancingAlgo(algo: AlgoClass) {
    this.algo = algo;
  }

  getServer(servers: ServerConfig["resources"]): ServerConfig["resources"][0] {
    if (this.algo === null) throw new Error("Loadbalancing algo in not initialised");

    return this.algo.getServer(servers);
  }
}
