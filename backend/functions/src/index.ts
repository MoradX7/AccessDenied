import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./api/auth";
import profileRoutes from "./api/profile";
import productsRoutes from "./api/products";
import ordersRoutes from "./api/orders";
import commentsRoutes from "./api/comments";
import adminRoutes from "./api/admin";
import vulnRoutes from "./api/vuln";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/comments", commentsRoutes);
app.use("/admin", adminRoutes);
app.use("/vuln", vulnRoutes);

exports.api = functions.https.onRequest(app);

