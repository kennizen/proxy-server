import { IncomingMessage, request, ServerResponse } from "http";
import { ILBAlgo } from "../lib/loadBalancingAlgos/abstract";
import { ServerPool } from "../lib/serverPool/serverPool";
import logger from "../utils/logger";

interface ILoadbalancer {
  serverPool: ServerPool;
  lbAlgo: ILBAlgo;
  request: (clientRequest: IncomingMessage, clientRes: ServerResponse<IncomingMessage>) => void;
}

export class LoadBalancer implements ILoadbalancer {
  lbAlgo: ILBAlgo;
  serverPool: ServerPool;

  constructor(serverPool: ServerPool, algo: ILBAlgo) {
    this.lbAlgo = algo;
    this.serverPool = serverPool;
  }

  request(clientRequest: IncomingMessage, clientRes: ServerResponse<IncomingMessage>) {
    const healthyServers = this.serverPool.getHealthyServers();

    if (healthyServers.length <= 0) {
      clientRes.writeHead(503);
      return clientRes.end("Service not available");
    }

    const server = this.lbAlgo.getServer(healthyServers);
    const options = {
      hostname: server.details.host,
      port: server.details.port,
      path: clientRequest.url,
      method: clientRequest.method,
      headers: clientRequest.headers,
    };

    logger.info(server, "SERVER FOR SERVING REQUEST");

    const req = request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));

      res.on("error", () => {
        logger.error(options, "ERROR FETCHING DATA FROM DESTINATION SERVER");

        clientRes.writeHead(500);
        clientRes.end("Internal server error");
      });

      res.on("end", () => {
        clientRes.writeHead(res.statusCode ?? 500, res.headers);
        clientRes.end(data);
      });
    }).on("error", (err) => {
      logger.error(err, "PROXY ERROR");

      // set the server as unhealthy
      this.serverPool.setUnhealthyServer(server);

      // health monitoring start
      this.serverPool.monitorHealth();

      // request a new server
      this.request(clientRequest, clientRes);
    });

    clientRequest.pipe(req);
  }
}
