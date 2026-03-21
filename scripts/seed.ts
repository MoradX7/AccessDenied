import { sql } from "../src/lib/db";
import { products } from "../src/data/products";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

async function seed() {
  console.log("Starting seed process...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Please create .env.local and add it.");
  }

  try {
    // 1. Create products table
    console.log("Creating products table...");
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        rating DECIMAL(3, 2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        description TEXT NOT NULL
      );
    `;

    // 2. Create users table for admin panel
    console.log("Creating users table...");
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        avatar_url VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Clear existing products (optional, for idempotency)
    console.log("Clearing existing products...");
    await sql`TRUNCATE TABLE products;`;

    // 4. Insert products
    console.log("Inserting products...");
    for (const p of products) {
      await sql`
        INSERT INTO products (id, title, brand, price, rating, category, image, description)
        VALUES (${p.id}, ${p.title}, ${p.brand}, ${p.price}, ${p.rating}, ${p.category}, ${p.image}, ${p.description})
      `;
    }

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
