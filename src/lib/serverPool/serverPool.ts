import { get } from "http";
import { ServerConfig } from "../../server";
import logger from "../../utils/logger";

export type ServerHealth = "Healthy" | "Unhealthy";

export type Server = {
  details: ServerConfig["resources"][0];
  status: {
    code: number | string;
    health: ServerHealth;
  };
};

export class ServerPool {
  static pool: Map<string, Server>;

  constructor(servers: ServerConfig["resources"]) {
    ServerPool.pool = new Map();
    this.init(servers);
  }

  private async init(servers: ServerConfig["resources"]) {
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

          req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error("Cannot get server status"));
          });
        });

        ServerPool.pool.set(`${data.details.base_url}`, data);
      } catch (error) {
        const e = error as Error & { code: string };
        const sv = ServerPool.pool.get(`${server.base_url}`);
        if (sv) {
          sv.status = {
            code: e.code,
            health: "Unhealthy",
          };
          ServerPool.pool.set(`${server.base_url}`, sv);
        }
        logger.error(e);
      }
    }

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.init(servers));
      }, 5000);
    });
  }

  static getHealthyServers() {
    const servers = ServerPool.pool;
    return Array.from(
      servers
        .entries()
        .map(([_, v]) => v)
        .filter((s) => s.status.health !== "Unhealthy")
    );
  }
}
