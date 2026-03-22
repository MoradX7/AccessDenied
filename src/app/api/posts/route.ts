export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    let posts = await sql`
      SELECT 
        p.id, p.title, p.content, p.created_at,
        u.name as user_name, u.avatar_url as user_avatar
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate globally via token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const firebaseUid = decodedToken.uid;

    // 2. Safely resolve to internal PostgreSQL User ID
    const userRows = await sql`SELECT id FROM users WHERE firebase_uid = ${firebaseUid}`;
    if (userRows.length === 0) {
      return NextResponse.json({ error: "User profile not fully synchronized on backend" }, { status: 404 });
    }
    const userId = userRows[0].id;

    // 3. Process the explicit JSON Payload
    const body = await req.json();
    const { title, content } = body;

    // Rejections strictly
    if (!title || !title.trim()) return NextResponse.json({ error: "Post title cannot be empty" }, { status: 400 });
    if (!content || !content.trim()) return NextResponse.json({ error: "Post content cannot be empty" }, { status: 400 });

    // 4. Secure Append Operation
    const newPost = await sql`
      INSERT INTO posts (user_id, title, content) 
      VALUES (${userId}, ${title.trim()}, ${content.trim()})
      RETURNING id, title, content, created_at
    `;

    return NextResponse.json({ success: true, post: newPost[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
