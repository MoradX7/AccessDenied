import "dotenv/config";
import { sql } from "../src/lib/db";

async function setAdminRole() {
  console.log("Starting role alteration...");

  try {
    // 1. Add role column if it doesn't exist
    console.log("Adding role column to users table...");
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'`;

    // 2. Set 'pilotst02@gmail.com' to admin
    console.log("Setting pilotst02@gmail.com to admin...");
    const res = await sql`UPDATE users SET role = 'admin' WHERE email = 'pilotst02@gmail.com' RETURNING *`;
    
    if (res.length > 0) {
      console.log("Successfully updated admin:", res[0]);
    } else {
      console.log("User pilotst02@gmail.com not found in the database yet. (They will need to register/login first, then this script can be run again).");
    }

    console.log("Role alteration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Role alteration failed:", error);
    process.exit(1);
  }
}

setAdminRole();
