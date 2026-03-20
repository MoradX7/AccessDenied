"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "@/lib/firebaseClient";

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both passwords are the same.",
      });
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );

      await updateProfile(cred.user, { displayName: name });

      // Send verification email in the background so UI updates instantly.
      const loginUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`;
      const actionCodeSettings = {
        url: loginUrl,
        handleCodeInApp: false,
      };
      sendEmailVerification(cred.user, actionCodeSettings).catch((err) =>
        console.warn("Verification email send (background)", err)
      );

      // Firestore user doc in background (profile/login will create if missing).
      setDoc(doc(firebaseDb, "users", cred.user.uid), {
        email,
        name,
        role: "user",
        avatarUrl: null,
        emailVerified: false,
        createdAt: serverTimestamp(),
      }).catch((err) => console.warn("Firestore user doc write", err));

      await signOut(firebaseAuth);

      toast({
        title: "Check your email",
        description:
          "We sent a verification link. Check your inbox and spam folder, then click the link and log in.",
      });

      router.push("/login");
    } catch (error: unknown) {
      const err = error as { code?: string };
      console.error("Registration error", err);
      let message = "Registration failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        message = "An account with that email already exists.";
      } else if (err.code === "auth/weak-password") {
        message = "Password is too weak. Please use a stronger password.";
      }

      toast({
        title: "Registration error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16 px-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-card rounded-2xl p-8 card-shadow-light dark:card-shadow-dark"
        >
          <h1 className="font-heading font-bold text-2xl text-foreground mb-6 text-center">
            Register
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                className="h-12 rounded-xl bg-muted/50 focus:ring-2 focus:ring-primary/50 focus:bg-background"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 rounded-xl bg-muted/50 focus:ring-2 focus:ring-primary/50 focus:bg-background"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl bg-muted/50 focus:ring-2 focus:ring-primary/50 focus:bg-background"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl bg-muted/50 focus:ring-2 focus:ring-primary/50 focus:bg-background"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl btn-glow transition-all duration-200 hover:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}