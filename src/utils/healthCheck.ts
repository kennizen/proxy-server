import { get } from "http";
import { ServerPool } from "../lib/serverPool/serverPool";
import serverConfig from "../config/config.json";

const TIMEOUT = serverConfig.healthCheck.timeout;

export async function healthCheck(domain: string): Promise<ServerPool["no_op"]> {
  let res: ServerPool["no_op"] = "unavailable";

  try {
    res = await new Promise((resolve, reject) => {
      const req = get(`${domain}`, (res) => {
        const statusCode = res.statusCode ?? 500;
        if (statusCode >= 200 && statusCode < 300) {
          resolve("available");
        }
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.setTimeout(TIMEOUT, () => {
        req.destroy();
        reject({ code: 504 });
      });
    });
  } catch (error) {
    res = "unavailable";
  }

  return res;
}
