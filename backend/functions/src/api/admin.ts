import express from "express";
import { z } from "zod";
import { auth, db } from "../lib/firebaseAdmin";
import { AuthedRequest, verifyAuth, requireAdmin } from "../lib/authMiddleware";
import { ApiUser } from "../types";

const router = express.Router();

const userIdSchema = z.object({
  id: z.string(),
});

function docToApiUser(uid: string, data: FirebaseFirestore.DocumentData): ApiUser {
  return {
    id: uid,
    email: (data.email as string) ?? "",
    name: (data.name as string) ?? "",
    role: (data.role as "user" | "admin") ?? "user",
    avatarUrl: data.avatarUrl as string | undefined,
    emailVerified: Boolean(data.emailVerified),
  };
}

router.use(verifyAuth, requireAdmin);

router.get("/users", async (_req: AuthedRequest, res) => {
  try {
    const snap = await db.collection("users").get();
    const users: ApiUser[] = snap.docs.map((doc) =>
      docToApiUser(doc.id, doc.data()),
    );
    return res.json({ users });
  } catch (err) {
    console.error("admin list users error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/users/:id/promote", async (req: AuthedRequest, res) => {
  try {
    const { id } = userIdSchema.parse(req.params);

    await db.collection("users").doc(id).set(
      {
        role: "admin",
      },
      { merge: true },
    );

    await db.collection("adminLogs").add({
      adminId: req.user!.uid,
      targetUserId: id,
      action: "PROMOTE_ADMIN",
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("promote admin error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/users/:id/demote", async (req: AuthedRequest, res) => {
  try {
    const { id } = userIdSchema.parse(req.params);

    await db.collection("users").doc(id).set(
      {
        role: "user",
      },
      { merge: true },
    );

    await db.collection("adminLogs").add({
      adminId: req.user!.uid,
      targetUserId: id,
      action: "DEMOTE_ADMIN",
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("demote admin error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.delete("/users/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = userIdSchema.parse(req.params);

    await auth.deleteUser(id);
    await db.collection("users").doc(id).delete();

    await db.collection("adminLogs").add({
      adminId: req.user!.uid,
      targetUserId: id,
      action: "DELETE_USER",
      createdAt: new Date().toISOString(),
    });

    return res.status(204).send();
  } catch (err) {
    console.error("delete user error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/logs", async (_req: AuthedRequest, res) => {
  try {
    const snap = await db
      .collection("adminLogs")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const logs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return res.json({ logs });
  } catch (err) {
    console.error("list logs error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

