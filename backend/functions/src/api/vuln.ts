import express from "express";
import { db } from "../lib/firebaseAdmin";

const router = express.Router();

// Intentionally vulnerable: stores unsanitized input without auth.
router.post("/comments/unsafe", async (req, res) => {
  const { content } = req.body;
  await db.collection("vulnComments").add({
    content,
    createdAt: new Date().toISOString(),
  });
  return res.json({ ok: true });
});

// Intentionally vulnerable: direct object access without ownership validation.
router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const doc = await db.collection("users").doc(id).get();
  if (!doc.exists) {
    return res.status(404).json({ error: "NOT_FOUND" });
  }
  return res.json({ user: { id: doc.id, ...doc.data() } });
});

// Intentionally vulnerable: weak token validation.
router.post("/token-check", async (req, res) => {
  const { token } = req.body;
  if (typeof token === "string" && token.startsWith("letmein-")) {
    return res.json({ admin: true });
  }
  return res.json({ admin: false });
});

// Intentionally vulnerable: missing authorization checks for orders.
router.get("/orders", async (_req, res) => {
  const snap = await db.collection("orders").get();
  const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res.json({ orders });
});

export default router;

