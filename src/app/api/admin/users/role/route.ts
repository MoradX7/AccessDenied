export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function PATCH(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      console.error("Firebase token verification failed:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const firebaseUid = decodedToken.uid;

    // 2. Fetch Requester info to ensure they are actually an admin
    const requesterRows = await sql`SELECT id, role FROM users WHERE firebase_uid = ${firebaseUid}`;
    if (requesterRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const requester = requesterRows[0];
    
    // Safety fallback: if the database doesn't have the column yet
    if (requester.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 3. Parse input
    const body = await req.json();
    const { userId, newRole } = body;

    if (!userId || !newRole || !["admin", "user"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid payload parameters" }, { status: 400 });
    }

    // 4. Protect against self-demotion
    if (String(requester.id) === String(userId)) {
      return NextResponse.json({ error: "Forbidden: Cannot alter your own administrative privileges" }, { status: 403 });
    }

    // 5. Run Database update (Fail-safe adding role if it historically didn't exist)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`;
    
    const updateRes = await sql`
      UPDATE users
      SET role = ${newRole}
      WHERE id = ${userId}
      RETURNING id, role
    `;

    if (updateRes.length === 0) {
      return NextResponse.json({ error: "User not found to update" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updateRes[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Update role API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
