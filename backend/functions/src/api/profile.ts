import express from "express";
import { z } from "zod";
import { db, storage } from "../lib/firebaseAdmin";
import { AuthedRequest, verifyAuth } from "../lib/authMiddleware";
import { ApiUser } from "../types";

const router = express.Router();

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
});

function docToApiUser(uid: string, doc: FirebaseFirestore.DocumentData): ApiUser {
  return {
    id: uid,
    email: (doc.email as string) ?? "",
    name: (doc.name as string) ?? "",
    role: (doc.role as "user" | "admin") ?? "user",
    avatarUrl: doc.avatarUrl as string | undefined,
    emailVerified: Boolean(doc.emailVerified),
  };
}

router.get("/", verifyAuth, async (req: AuthedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const snap = await db.collection("users").doc(uid).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "PROFILE_NOT_FOUND" });
    }
    const apiUser = docToApiUser(uid, snap.data()!);
    return res.json({ user: apiUser });
  } catch (err) {
    console.error("profile get error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.patch("/", verifyAuth, async (req: AuthedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const updates = updateProfileSchema.parse(req.body);

    await db.collection("users").doc(uid).set(updates, { merge: true });

    const snap = await db.collection("users").doc(uid).get();
    const apiUser = docToApiUser(uid, snap.data()!);
    return res.json({ user: apiUser });
  } catch (err) {
    console.error("profile patch error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "INVALID_INPUT", details: err.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/avatar", verifyAuth, async (req: AuthedRequest, res) => {
  try {
    const uid = req.user!.uid;

    // For simplicity, this endpoint expects the frontend to upload directly
    // to Storage using the Firebase client SDK. Here we just return a
    // suggested path and later the client would call PATCH /profile with the URL.
    const bucket = storage.bucket();
    const filePath = `avatars/${uid}/${Date.now()}.jpg`;

    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: "image/jpeg",
    });

    return res.json({ uploadUrl: url, storagePath: filePath });
  } catch (err) {
    console.error("avatar upload URL error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

