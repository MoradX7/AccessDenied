import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be an environment variable");
}

export const sql = neon(process.env.DATABASE_URL);
