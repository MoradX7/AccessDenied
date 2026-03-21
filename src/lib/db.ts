import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("WARNING: DATABASE_URL is missing. Database calls will fail at runtime.");
}

// If missing at build time, assign a dummy function that throws only when explicitly called.
export const sql = dbUrl
  ? neon(dbUrl)
  : ((...args: any[]) => { throw new Error("DATABASE_URL is not set"); }) as any;
