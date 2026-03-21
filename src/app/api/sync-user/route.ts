export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { uid, email, name } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert logic (ON CONFLICT) matching the user requirements
    await sql`
      INSERT INTO users (firebase_uid, email, name)
      VALUES (${uid}, ${email}, ${name || null})
      ON CONFLICT (firebase_uid) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
