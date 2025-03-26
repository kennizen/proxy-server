import { createServer } from "http";
import serverConfig from "../config/config.json";
import { RoundRobin } from "../lib/loadBalancingAlgos/roundRobin";
import { ServerPool } from "../lib/serverPool/serverPool";
import { LoadBalancer } from "../proxy/loadBalancer";
import { Proxy } from "../proxy/proxy";
import logger from "../utils/logger";

const PORT = serverConfig.port ?? 8080;
const serverPool = new ServerPool(serverConfig.resources);
const loadBalancer = new LoadBalancer(new RoundRobin());

const server = createServer((req, res) => {
  logger.info(req);

  if (serverPool.no_op === "unavailable") {
    res.writeHead(500);
    res.end("Server is not ready to serve requests");
    return;
  }

  const healthyServers = serverPool.getHealthyServers();
  const toBeForwardedServer = loadBalancer.getServer(healthyServers);

  const proxyReq = new Proxy(
    {
      hostname: toBeForwardedServer.details.host,
      port: toBeForwardedServer.details.port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    res
  ).request();

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log("server running on port" + " " + PORT);
});
