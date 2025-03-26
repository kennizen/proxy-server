import { get } from "http";
import logger from "../../utils/logger";
import { ServerConfig } from "../../types/server";
import serverConfig from "../../config/config.json";

export type ServerHealth = "Healthy" | "Unhealthy";

export type Server = {
  details: ServerConfig["resources"][0];
  status: {
    code: number | string;
    health: ServerHealth;
  };
};

const INTERVAL = serverConfig.healthCheck.interval;
const TIMEOUT = serverConfig.healthCheck.timeout;

export class ServerPool {
  pool: Map<string, Server>;
  private monitorInterval: NodeJS.Timeout | null = null;
  private monitorCycle: boolean;
  private servers: ServerConfig["resources"];
  no_op: "available" | "unavailable";

  constructor(servers: ServerConfig["resources"]) {
    this.pool = new Map();
    this.monitorCycle = false;
    this.servers = servers;
    this.no_op = "unavailable";
    this.init();
  }

  init() {
    this.monitorInterval = setInterval(async () => {
      if (this.monitorCycle) return;
      this.monitorCycle = true;
      await this.monitorHealth();
      this.monitorCycle = false;
    }, INTERVAL);
  }

  private async monitorHealth() {
    const servers = this.servers;

    for (const server of servers) {
      let data: Server;

      try {
        data = await new Promise((resolve, reject) => {
          const req = get(`${server.base_url}`, (res) => {
            const statusCode = res.statusCode ?? 500;
            if (statusCode >= 200 && statusCode < 300) {
              resolve({
                details: server,
                status: {
                  code: statusCode,
                  health: "Healthy",
                },
              });
            }
          });

          req.on("error", (err) => {
            reject(err);
          });

          req.setTimeout(TIMEOUT, () => {
            req.destroy();
            reject(new Error("Cannot get server status"));
          });
        });

        this.pool.set(`${data.details.base_url}`, data);
        logger.info(data, "Healthy server");
      } catch (error) {
        const e = error as Error & { code: string };
        const sv = this.pool.get(`${server.base_url}`);
        if (sv) {
          sv.status = {
            code: e.code,
            health: "Unhealthy",
          };
          this.pool.set(`${server.base_url}`, sv);
        }
        logger.error(e);
      }
    }

    this.checkIfNoOp();
  }

  private checkIfNoOp() {
    if ([...this.pool].length <= 0) this.no_op = "unavailable";
    else this.no_op = "available";
  }

  stopMonitoring() {
    if (this.monitorInterval) clearInterval(this.monitorInterval);
  }

  getHealthyServers() {
    return Array.from(
      this.pool
        .entries()
        .map(([_, v]) => v)
        .filter((s) => s.status.health !== "Unhealthy")
    );
  }

  getUnhealthyServers() {
    return Array.from(
      this.pool
        .entries()
        .map(([_, v]) => v)
        .filter((s) => s.status.health !== "Healthy")
    );
  }

  getServers() {
    return Array.from(this.pool.entries().map(([_, v]) => v));
  }
}
