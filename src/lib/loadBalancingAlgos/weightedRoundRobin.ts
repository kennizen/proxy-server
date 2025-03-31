import { Server } from "../serverPool/serverPool";
import { ILBAlgo } from "./abstract";

export class WeightedRoundRobin implements ILBAlgo {
  curIdx: number;
  curWeight: number;

  constructor() {
    this.curIdx = -1;
    this.curWeight = 0;
  }

  private getMaxWeight(servers: Server[]) {
    return Math.max(...servers.map((s) => s.details.weight ?? 1));
  }

  private getGCD(servers: Server[]) {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    return servers.map((s) => s.details.weight ?? 1).reduce((a, b) => gcd(a, b));
  }

  private getWeights(servers: Server[]) {
    return servers.map((s) => s.details.weight ?? 1);
  }

  getServer(servers: Server[]) {
    const weights = this.getWeights(servers);
    const maxWeight = this.getMaxWeight(servers);
    const gcdWeight = this.getGCD(servers);

    if (this.curIdx >= servers.length) {
      this.curIdx = 0;
    }

    while (true) {
      this.curIdx = (this.curIdx + 1) % servers.length;

      if (this.curIdx === 0) {
        this.curWeight -= gcdWeight;

        if (this.curWeight <= 0) {
          this.curWeight = maxWeight;
        }
      }

      if (weights[this.curIdx] >= this.curWeight) {
        return servers[this.curIdx];
      }
    }
  }
}
