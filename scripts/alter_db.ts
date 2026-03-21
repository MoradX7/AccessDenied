import "dotenv/config";
import { sql } from "../src/lib/db";

async function alterDb() {
  console.log("Starting database alteration...");

  try {
    // 1. Drop existing users table to ensure fresh schema
    console.log("Dropping existing users table...");
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    // 2. Create users table with new schema
    console.log("Creating new users table...");
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Database alteration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Database alteration failed:", error);
    process.exit(1);
  }
}

alterDb();
