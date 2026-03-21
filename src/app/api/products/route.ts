export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const products = await sql`SELECT * FROM products WHERE id = ${id}`;
      if (products.length === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      const product = {
        ...products[0],
        price: Number(products[0].price),
        rating: Number(products[0].rating)
      };
      return NextResponse.json(product);
    }

    const products = await sql`SELECT * FROM products ORDER BY id ASC`;
    const formattedProducts = products.map((p: any) => ({
      ...p,
      price: Number(p.price),
      rating: Number(p.rating)
    }));
    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
