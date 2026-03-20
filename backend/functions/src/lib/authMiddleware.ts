import { Request, Response, NextFunction, ParamsDictionary } from "express";
import { auth, db } from "./firebaseAdmin";

export interface AuthedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: "user" | "admin";
  };
  params: ParamsDictionary;
  headers: any;
  cookies?: any;
}

export async function verifyAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    const sessionCookie = req.cookies?.__session as string | undefined;

    let idToken: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      idToken = authHeader.substring("Bearer ".length);
    } else if (sessionCookie) {
      idToken = sessionCookie;
    }

    if (!idToken) {
      return res.status(401).json({ error: "AUTH_REQUIRED" });
    }

    const decoded = await auth.verifyIdToken(idToken);

    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() as
      | { role?: "user" | "admin"; email?: string }
      | undefined;

    req.user = {
      uid: decoded.uid,
      email: decoded.email ?? userData?.email,
      role: userData?.role ?? "user",
    };

    next();
  } catch (err) {
    console.error("verifyAuth error", err);
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({ error: "AUTH_REQUIRED" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "ADMIN_REQUIRED" });
  }

  return next();
}

