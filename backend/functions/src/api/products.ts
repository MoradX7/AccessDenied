import express from "express";
import { db } from "../lib/firebaseAdmin";
import { Product } from "../types";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    let query: FirebaseFirestore.Query = db.collection("products");

    if (category) {
      query = query.where("category", "==", category);
    }

    const snap = await query.get();
    const products: Product[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        brand: data.brand,
        price: data.price,
        rating: data.rating,
        category: data.category,
        image: data.image,
        description: data.description,
      };
    });

    return res.json({ products });
  } catch (err) {
    console.error("products list error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }

    const data = doc.data()!;
    const product: Product = {
      id: doc.id,
      title: data.title,
      brand: data.brand,
      price: data.price,
      rating: data.rating,
      category: data.category,
      image: data.image,
      description: data.description,
    };

    return res.json({ product });
  } catch (err) {
    console.error("product get error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

