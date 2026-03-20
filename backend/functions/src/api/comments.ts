import express from "express";
import { z } from "zod";
import { db } from "../lib/firebaseAdmin";
import { AuthedRequest, verifyAuth, requireAdmin } from "../lib/authMiddleware";
import { Comment, Post } from "../types";

const router = express.Router();

const createCommentSchema = z.object({
  content: z.string().min(1),
});

router.get("/posts", async (_req, res) => {
  try {
    const snap = await db.collection("posts").orderBy("createdAt", "desc").get();
    const posts: Post[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        authorId: data.authorId,
        content: data.content,
        createdAt: data.createdAt,
        likeCount: data.likeCount ?? 0,
        commentCount: data.commentCount ?? 0,
      };
    });

    return res.json({ posts });
  } catch (err) {
    console.error("list posts error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.get("/posts/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;

    const snap = await db
      .collection("posts")
      .doc(postId)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .get();

    const comments: Comment[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        postId,
        authorId: data.authorId,
        content: data.content,
        createdAt: data.createdAt,
      };
    });

    return res.json({ comments });
  } catch (err) {
    console.error("list comments error", err);
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post(
  "/posts/:postId/comments",
  verifyAuth,
  async (req: AuthedRequest, res) => {
    try {
      const { postId } = req.params;
      const { content } = createCommentSchema.parse(req.body);
      const uid = req.user!.uid;

      const now = new Date().toISOString();
      const postRef = db.collection("posts").doc(postId);
      const commentsRef = postRef.collection("comments");

      const commentRef = await commentsRef.add({
        authorId: uid,
        content,
        createdAt: now,
      });

      await postRef.update({
        commentCount: admin.firestore.FieldValue.increment(1),
      } as never);

      const comment: Comment = {
        id: commentRef.id,
        postId,
        authorId: uid,
        content,
        createdAt: now,
      };

      return res.status(201).json({ comment });
    } catch (err) {
      console.error("create comment error", err);
      if (err instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "INVALID_INPUT", details: err.errors });
      }
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  },
);

router.delete(
  "/posts/:postId/comments/:commentId",
  verifyAuth,
  async (req: AuthedRequest, res) => {
    try {
      const { postId, commentId } = req.params;
      const uid = req.user!.uid;

      const commentRef = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .doc(commentId);
      const snap = await commentRef.get();

      if (!snap.exists) {
        return res.status(404).json({ error: "COMMENT_NOT_FOUND" });
      }

      const data = snap.data()!;

      const userDoc = await db.collection("users").doc(uid).get();
      const role = (userDoc.data()?.role as "user" | "admin") ?? "user";

      if (data.authorId !== uid && role !== "admin") {
        return res.status(403).json({ error: "FORBIDDEN" });
      }

      await commentRef.delete();

      return res.status(204).send();
    } catch (err) {
      console.error("delete comment error", err);
      return res.status(500).json({ error: "INTERNAL_ERROR" });
    }
  },
);

export default router;

