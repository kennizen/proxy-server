import { ServerResponse, IncomingMessage } from "http";
import pino from "pino-http";

export function logger(req: IncomingMessage, res: ServerResponse) {
  pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  })(req, res);
}
