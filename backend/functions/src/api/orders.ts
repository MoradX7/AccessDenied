import express from "express";
import { z } from "zod";
import { db } from "../lib/firebaseAdmin";
import { AuthedRequest, verifyAuth } from "../lib/authMiddleware";
import { Order, OrderItem, Product } from "../types";

const router = express.Router();

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

router.post("/", verifyAuth, async (req: AuthedRequest, res) => {
  try {
    const { items } = createOrderSchema.parse(req.body);
    const uid = req.user!.uid;

    const productIds = items.map((i) => i.productId);
    const productSnaps = await db.getAll(
      ...productIds.map((id) => db.collection("products").doc(id)),
    );

    const productsById = new Map<string, Product>();
    productSnaps.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data()!;
        productsById.set(doc.id, {
          id: doc.id,
          title: data.title,
          brand: data.brand,
          price: data.price,
          rating: data.rating,
          category: data.category,
          image: data.image,
          description: data.description,
        });
      }
    });

    const orderItems: OrderItem[] = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = productsById.get(item.productId);
      if (!product) {
        return res.status(400).json({ error: "INVALID_PRODUCT", productId: item.productId });
      }
      const priceAtPurchase = product.price;
      totalPrice += priceAtPurchase * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase,
      });
    }

    const now = new Date().toISOString();

    const orderRef = await db.collection("orders").add({
      userId: uid,
      items: orderItems,
      totalPrice,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    const order: Order = {
      id: orderRef.id,
      userId: uid,
      items: orderItems,
      totalPrice,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    return res.status(201).json({ order });
  } catch (err) {
    console.error("create order error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "INVALID_INPUT", details: err.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/", verifyAuth, async (req: AuthedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const snap = await db
      .collection("orders")
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .get();

    const orders: Order[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        items: data.items,
        totalPrice: data.totalPrice,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    return res.json({ orders });
  } catch (err) {
    console.error("list orders error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

