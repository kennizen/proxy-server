import { Random } from "./random";
import { RoundRobin } from "./roundRobin";
import { WeightedRoundRobin } from "./weightedRoundRobin";

export type AlgoType = "round_robin" | "weighted_round_robin" | "random";

export class LBAlgoFactory {
  static getAlgo(type: AlgoType) {
    switch (type) {
      case "random":
        return new Random();
      case "round_robin":
        return new RoundRobin();
      case "weighted_round_robin":
        return new WeightedRoundRobin();
    }
  }
}
