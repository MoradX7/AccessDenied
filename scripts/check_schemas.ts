import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { sql } from "../src/lib/db";

async function main() {
  try {
    console.log("DB URL starts with:", process.env.DATABASE_URL?.substring(0, 15));
    
    const res = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `;
    console.log("Users schema:", res);
    
    const postsRes = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'posts';
    `;
    console.log("Posts schema:", postsRes);
    
    const commentsRes = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'comments';
    `;
    console.log("Comments schema:", commentsRes);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
