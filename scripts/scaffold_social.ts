import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

async function scaffold() {
  const { sql } = await import("../src/lib/db");
  console.log("Starting social interactions db scaffolding...");

  try {
    console.log("Ensuring pgcrypto extension exists...");
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

    console.log("Dropping existing posts and comments tables if they exist...");
    await sql`DROP TABLE IF EXISTS comments CASCADE`;
    await sql`DROP TABLE IF EXISTS posts CASCADE`;

    console.log("Creating posts table...");
    await sql`
      CREATE TABLE posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("Creating comments table...");
    await sql`
      CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Seed dummy data
    console.log("Seeding dummy data...");
    const usersRes = await sql`SELECT id FROM users LIMIT 1`;
    let dummyUserId;
    if (usersRes.length > 0) {
      dummyUserId = usersRes[0].id;
    } else {
      console.log("No users found to seed dummy data correctly. Skipping seeding.");
      process.exit(0);
    }

    const dummyPostContent = "Just completed the Auth Bypass Challenge — the token validation flaw was subtle but devastating. If you haven't tried it yet, highly recommend starting with the session fixation vector. Documented my full methodology in the findings section.";
    
    console.log("Inserting dummy post...");
    const postRes = await sql`
      INSERT INTO posts (user_id, title, content) 
      VALUES (${dummyUserId}, 'Auth Bypass Challenge Completion', ${dummyPostContent})
      RETURNING id
    `;
    const newPostId = postRes[0].id;

    console.log("Inserting dummy comment...");
    await sql`
      INSERT INTO comments (post_id, user_id, content)
      VALUES (${newPostId}, ${dummyUserId}, 'Great job! The session fixation vector is tricky indeed.')
    `;

    console.log("Social interactions db scaffold complete!");
    process.exit(0);
  } catch (error) {
    console.error("Database scaffolding failed:", error);
    process.exit(1);
  }
}

scaffold();
