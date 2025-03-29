import { createServer } from "http";
import serverConfig from "../config/config.json";
import { RoundRobin } from "../lib/loadBalancingAlgos/roundRobin";
import { ServerPool } from "../lib/serverPool/serverPool";
import { LoadBalancer } from "../loadBalancer/loadBalancer";
import logger from "../utils/logger";
import { Random } from "../lib/loadBalancingAlgos/random";

const PORT = serverConfig.port ?? 8080;
const serverPool = new ServerPool(serverConfig.resources);
const loadBalancer = new LoadBalancer(serverPool, new Random());

const server = createServer((req, res) => {
  logger.info(req, "CLIENT REQUEST");

  // To handle preflight request/OPTIONS request
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  loadBalancer.request(req, res);
});

server.listen(PORT, () => {
  console.log("server running on port" + " " + PORT);
});
