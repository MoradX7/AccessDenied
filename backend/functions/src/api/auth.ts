import express from "express";
import { z } from "zod";
import { auth, db } from "../lib/firebaseAdmin";
import { ApiUser } from "../types";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const passwordResetSchema = z.object({
  email: z.string().email(),
});

function userToApiUser(
  uid: string,
  userRecord: FirebaseFirestore.DocumentData | undefined,
  emailVerified: boolean,
): ApiUser {
  return {
    id: uid,
    email: (userRecord?.email as string) ?? "",
    name: (userRecord?.name as string) ?? "",
    role: (userRecord?.role as "user" | "admin") ?? "user",
    avatarUrl: userRecord?.avatarUrl as string | undefined,
    emailVerified,
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existing = await auth.getUserByEmail(email).catch(() => null);
    if (existing) {
      return res.status(400).json({ error: "EMAIL_ALREADY_IN_USE" });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      role: "user",
      avatarUrl: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });

    await auth.generateEmailVerificationLink(email).catch((err) => {
      console.error("Error sending verification email", err);
    });

    const profileDoc = await db.collection("users").doc(userRecord.uid).get();
    const profileData = profileDoc.data();

    const apiUser = userToApiUser(
      userRecord.uid,
      profileData,
      userRecord.emailVerified,
    );

    return res.status(201).json({
      user: apiUser,
      requiresEmailVerification: true,
    });
  } catch (err) {
    console.error("register error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "INVALID_INPUT", details: err.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    if (!userRecord) {
      return res.status(400).json({ error: "INVALID_CREDENTIALS" });
    }

    if (!userRecord.emailVerified) {
      return res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
    }

    // NOTE: In a real app you would verify the password via client SDK or
    // custom endpoint. Admin SDK cannot verify passwords directly.
    // Here we assume the client uses Firebase client SDK to obtain an ID token
    // and calls other endpoints with that token.
    return res
      .status(200)
      .json({ message: "USE_CLIENT_SDK_FOR_LOGIN", email });
  } catch (err) {
    console.error("login error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "INVALID_INPUT", details: err.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

router.post("/request-password-reset", async (req, res) => {
  try {
    const { email } = passwordResetSchema.parse(req.body);
    await auth.generatePasswordResetLink(email);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("password reset error", err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "INVALID_INPUT", details: err.errors });
    }
    return res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;

