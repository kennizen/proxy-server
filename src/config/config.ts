import { z } from "zod";

const serverConfig = z.object({
  port: z.number(),
  resources: z.array(
    z.object({
      name: z.string(),
      endpoint: z.string(),
      host: z.string(),
      port: z.number(),
      base_url: z.string(),
      weight: z.optional(z.number()),
    })
  ),
  healthCheck: z.object({
    interval: z.number(),
    timeout: z.number(),
  }),
  lbAlgo: z.union([z.literal("round_robin"), z.literal("weighted_round_robin"), z.literal("random")]),
});

export function validate(config: any) {
  const val = serverConfig.safeParse(config);
  return val;
}
