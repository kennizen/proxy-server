import serverConfig from "../../config/config.json";
import { IServerConfig } from "../../types/server";
import { healthCheck } from "../../utils/healthCheck";
import logger from "../../utils/logger";

export type ServerHealth = "Healthy" | "Unhealthy";

export type Server = {
  details: IServerConfig["resources"][0];
  status: {
    code: number | string;
    health: ServerHealth;
  };
};

const INTERVAL = serverConfig.healthCheck.interval;

export class ServerPool {
  pool: Map<string, Server>;
  private monitorInterval: NodeJS.Timeout | null = null;
  private monitorCycle: boolean;
  private servers: IServerConfig["resources"];
  no_op: "available" | "unavailable";

  constructor(servers: IServerConfig["resources"]) {
    this.pool = new Map();
    this.monitorCycle = false;
    this.servers = servers;
    this.no_op = "unavailable";
    this.init();
  }

  init() {
    logger.info("INITAILIZING SERVER POOL");
    this.initialHealthMonitoring();
  }

  private async initialHealthMonitoring() {
    const servers = this.servers;

    for (const server of servers) {
      const serverFit = await healthCheck(server.base_url);

      if (serverFit === "available") {
        this.pool.set(`${server.base_url}`, {
          details: server,
          status: {
            code: 200,
            health: "Healthy",
          },
        });
      } else {
        this.pool.set(`${server.base_url}`, {
          details: server,
          status: {
            code: 500,
            health: "Unhealthy",
          },
        });
      }
    }

    this.checkIfNoOp();

    if (this.no_op === "available") logger.info([...this.pool.values()], "SERVER POOL INITIALIZED");
    else {
      logger.error("SERVER POOL EMPTY, FAILED TO INITIALIZE");
      logger.info("STARTING HEALTH CHECK");
      this.monitorHealth();
    }
  }

  monitorHealth() {
    this.stopMonitoring();

    this.monitorInterval = setInterval(async () => {
      if (this.monitorCycle) return;

      this.monitorCycle = true;

      const unheatlhyServers = this.getUnhealthyServers();

      for (const srvr of unheatlhyServers) {
        const serverFit = await healthCheck(srvr.details.base_url);

        if (serverFit === "available") {
          this.pool.set(srvr.details.base_url, {
            details: srvr.details,
            status: {
              code: 200,
              health: "Healthy",
            },
          });
        }
      }

      if (unheatlhyServers.length <= 0) this.stopMonitoring();

      this.monitorCycle = false;

      logger.info(
        [...this.pool.values()].map((v) => ({ url: v.details.base_url, ...v.status })),
        "SERVER POOL STATUS"
      );
    }, INTERVAL);
  }

  private checkIfNoOp() {
    if (this.getHealthyServers().length <= 0) this.no_op = "unavailable";
    else this.no_op = "available";
  }

  setUnhealthyServer(server: Server) {
    this.pool.set(server.details.base_url, {
      details: server.details,
      status: {
        code: 500,
        health: "Unhealthy",
      },
    });
  }

  stopMonitoring() {
    if (this.monitorInterval) clearInterval(this.monitorInterval);
  }

  getHealthyServers() {
    return [...this.pool.values()].map((v) => v).filter((s) => s.status.health !== "Unhealthy");
  }

  getUnhealthyServers() {
    return [...this.pool.values()].map((v) => v).filter((s) => s.status.health !== "Healthy");
  }

  getServers() {
    return [...this.pool.values()].map((v) => v);
  }
}
