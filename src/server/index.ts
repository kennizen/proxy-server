import { createServer } from "http";
import serverConfig from "../config/config.json";
import { Proxy } from "../proxy/proxy";
import { LoadBalancer } from "../proxy/loadBalancer";
import { RoundRobin } from "../lib/loadBalancingAlgos/roundRobin";
import logger from "../utils/logger";
import { ServerPool } from "../lib/serverPool/serverPool";

export interface ServerConfig {
  resources: {
    name: string;
    endpoint: string;
    host: string;
    port: number;
    base_url: string;
  }[];
}

const PORT = 8080;

const server = createServer((req, res) => {
  const servers: ServerConfig = serverConfig;

  logger.info(req);

  new ServerPool(servers.resources);

  const lb = LoadBalancer.getInstance();
  lb.algo = RoundRobin.getInstance();

  const toBeForwardedServer = lb.getServer(servers.resources);

  const proxy = new Proxy(
    {
      hostname: toBeForwardedServer.host,
      port: toBeForwardedServer.port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    res
  );

  const proxyReq = proxy.request();

  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log("server running on port" + " " + PORT);
});
