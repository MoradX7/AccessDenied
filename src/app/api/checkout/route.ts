export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
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

    // 2. Parse Request Body
    let items;
    try {
      const body = await req.json();
      items = body.items;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }
    } catch (err) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // 3. Find User by firebase_uid
    const users = await sql`SELECT id FROM users WHERE firebase_uid = ${firebaseUid}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }
    const internalUserId = users[0].id;

    // 4. Create Tables Safely using dynamic data types for FKs to prevent type mismatch
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
          EXECUTE 'CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id ' || (SELECT data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id') || ' NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            total_price NUMERIC(10,2) NOT NULL,
            status TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )';
        END IF;

        IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'order_items') THEN
          EXECUTE 'CREATE TABLE order_items (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
            product_id ' || (SELECT data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'id') || ' NOT NULL REFERENCES products(id),
            quantity INTEGER NOT NULL,
            price NUMERIC(10,2) NOT NULL
          )';
        END IF;
      END $$;
    `;

    // 5. Build order_items mapping and validate products
    const productIdsStr = items.map((i: any) => String(i.productId));
    const productsInDb = await sql`SELECT * FROM products WHERE id::text = ANY(${productIdsStr})`;
    
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const p = productsInDb.find(prod => String(prod.id) === String(item.productId));
      if (!p) {
        return NextResponse.json({ error: `Product ${item.productId} not found in database` }, { status: 400 });
      }

      // NO stock logic per user requirements
      const quantity = parseInt(item.quantity, 10);
      const dbPrice = parseFloat(p.price);
      
      totalPrice += dbPrice * quantity;

      orderItemsData.push({
        product_id: p.id, // Using raw typed DB value reference
        quantity: quantity,
        price: dbPrice
      });
    }

    // 6. Create Order First
    const newOrders = await sql`
      INSERT INTO orders (user_id, total_price, status, payment_method)
      VALUES (${internalUserId}, ${totalPrice}, 'completed', 'lab')
      RETURNING id
    `;
    const orderId = newOrders[0].id;

    // 7. Insert Order Items After
    for (const oi of orderItemsData) {
      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (${orderId}, ${oi.product_id}, ${oi.quantity}, ${oi.price})
      `;
    }

    // 8. Return Success response
    return NextResponse.json({ 
      success: true,
      order: {
        id: orderId,
        totalPrice: totalPrice,
        status: "completed"
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Database or API logic error during checkout:", error);
    // Explicitly returning actual error message down to the frontend for debugging
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
