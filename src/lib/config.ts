import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  STORAGE_PATH: z.string().default("./storage/replays"),
  MAX_REPLAY_SIZE_MB: z.coerce.number().default(20),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  STORAGE_PATH: process.env.STORAGE_PATH,
  MAX_REPLAY_SIZE_MB: process.env.MAX_REPLAY_SIZE_MB,
});
