import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const firebaseUid = 'LiRQEcEQkxfaaOtL0LPRmQssdUX2';
    
    // Exact same query as GET /api/orders
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

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
