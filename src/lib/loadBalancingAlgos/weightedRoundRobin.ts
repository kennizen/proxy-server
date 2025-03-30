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
    return Math.max(...servers.map((s) => s.details.weight ?? 0));
  }

  private getGCD(servers: Server[]) {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    return servers.map((s) => s.details.weight ?? 0).reduce((a, b) => gcd(a, b));
  }

  getServer(servers: Server[]) {
    return servers[0];
  }
}
