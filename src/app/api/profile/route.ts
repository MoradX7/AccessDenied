import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, name, email, avatar_url } = await req.json();

    if (!id || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sql`
      INSERT INTO users (firebase_uid, name, email, avatar_url)
      VALUES (${id}, ${name}, ${email}, ${avatar_url || null})
      ON CONFLICT (firebase_uid) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, users.name),
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const result = await sql`SELECT * FROM users WHERE firebase_uid = ${id}`;
    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Profile Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
