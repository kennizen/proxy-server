import { RequestOptions, ServerResponse, request } from "http";
import type { URL } from "url";
import logger from "../utils/logger";

export class Proxy {
  private options: RequestOptions;
  private clientRes: ServerResponse;

  constructor(opt: RequestOptions, res: ServerResponse) {
    this.options = opt;
    this.clientRes = res;
  }

  request() {
    return request(this.options, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));

      res.on("error", () => {
        console.error("Error fetching data from destination server");
        this.clientRes.writeHead(500, { "Content-type": "application/json" });
        this.clientRes.end(
          JSON.stringify({
            message: "Something went wrong",
          })
        );
      });

      res.on("end", () => {
        this.clientRes.writeHead(res.statusCode ?? 500, res.headers);
        logger.info({
          msg: "Response from server",
          status: res.statusCode,
          headers: res.headers,
          server: this.options,
          data,
        });
        this.clientRes.end(data);
      });
    }).on("error", (err) => {
      console.error("Proxy error:", err);
      this.clientRes.writeHead(500);
      this.clientRes.end("Internal Server Error cannot forward request using proxy");
    });
  }
}
