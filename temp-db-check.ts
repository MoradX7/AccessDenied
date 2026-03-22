import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "./src/lib/db";

async function checkSchema() {
  try {
    const res = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `;
    console.log("Products schema:", res);
    
    // Also check constraints
    const constraints = await sql`
      SELECT conname, contype
      FROM pg_constraint
      WHERE conrelid = 'products'::regclass;
    `;
    console.log("Products constraints:", constraints);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkSchema();
