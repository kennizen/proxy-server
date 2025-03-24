import { ServerConfig } from "../../server";

export interface AlgoClass {
  getServer: (servers: ServerConfig["resources"]) => ServerConfig["resources"][0];
}
