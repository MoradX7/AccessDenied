export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
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

    // 2. Query Database
    // Note: We use json_agg to group the order_items alongside their respective abstract product details
    const orders = await sql`
      SELECT 
        o.id, 
        o.total_price, 
        o.status, 
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'title', p.title,
              'image', p.image
            )
          ) FILTER (WHERE oi.id IS NOT NULL), 
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id::text = p.id::text
      WHERE o.user_id::text = (SELECT id::text FROM users WHERE firebase_uid = ${firebaseUid})
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ orders }, { status: 200 });

  } catch (error: any) {
    console.error("Fetch orders API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
