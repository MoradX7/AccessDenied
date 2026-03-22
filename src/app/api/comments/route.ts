export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "Missing postId query parameter" }, { status: 400 });
    }

    // Join comments heavily with users table to provide full profile context downstream
    const comments = await sql`
      SELECT 
        c.id, c.content, c.created_at,
        u.name as user_name, u.avatar_url as user_avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `;

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error("Failed to fetch comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
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
    const { post_id, content } = body;

    // Rejections strictly
    if (!post_id) return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
    if (!content || !content.trim()) return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });

    const postExists = await sql`SELECT id FROM posts WHERE id = ${post_id}`;
    if (postExists.length === 0) {
      return NextResponse.json({ error: "Target post no longer exists or invalid ID" }, { status: 404 });
    }

    // 4. Secure Append Operation
    const newComment = await sql`
      INSERT INTO comments (post_id, user_id, content) 
      VALUES (${post_id}, ${userId}, ${content.trim()})
      RETURNING id, content, created_at
    `;

    return NextResponse.json({ success: true, comment: newComment[0] }, { status: 201 });
  } catch (error: any) {
    console.error("Post comment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
