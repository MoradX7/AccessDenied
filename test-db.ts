import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "./src/lib/db";

async function test() {
  try {
    console.log("Testing DB update...");
    const id = "test_user_id_1";
    const name = "Test User";
    const email = "testuser@example.com";
    const avatar_url = "https://firebasestorage.googleapis.com/v0/b/accessdenied-6bc25.appspot.com/o/avatars%2FuS23fklsdfj?alt=media&token=12345678-1234-1234-1234-123456789012";

    await sql`
      INSERT INTO users (firebase_uid, name, email, avatar_url)
      VALUES (${id}, ${name}, ${email}, ${avatar_url})
      ON CONFLICT (firebase_uid) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, users.name),
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        updated_at = CURRENT_TIMESTAMP
    `;
    console.log("success");
  } catch (e) {
    console.error("Error expected or actual:", e);
  } finally {
    process.exit();
  }
}

test();
