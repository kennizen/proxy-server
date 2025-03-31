import { createServer } from "http";
import serverConfig from "../config/config.json";
import { LBAlgoFactory } from "../lib/loadBalancingAlgos/LBAlgoFactory";
import { ServerPool } from "../lib/serverPool/serverPool";
import { LoadBalancer } from "../loadBalancer/loadBalancer";
import logger from "../utils/logger";
import { validate } from "../config/config";
import { inspect } from "util";

const isConfigValid = validate(serverConfig);

if (!isConfigValid.success) {
  console.error(inspect(isConfigValid.error, false, null, true));
  process.kill(process.pid, "SIGTERM");
}

const PORT = serverConfig.port ?? 8080;
const serverPool = new ServerPool(serverConfig.resources);
const loadBalancer = new LoadBalancer(serverPool, LBAlgoFactory.getAlgo("weighted_round_robin"));

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
