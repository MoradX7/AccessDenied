import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "./src/lib/db";

async function checkOrders() {
  try {
    const orders = await sql`SELECT * FROM orders`;
    console.log("Total orders in DB:", orders.length);
    if (orders.length > 0) {
      console.log("Sample order:", orders[0]);
    }

    const order_items = await sql`SELECT * FROM order_items`;
    console.log("Total order_items in DB:", order_items.length);

    const users = await sql`SELECT id, firebase_uid, email FROM users LIMIT 5`;
    console.log("Sample users:", users);

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    process.exit(0);
  }
}

checkOrders();
