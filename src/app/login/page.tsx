"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "@/lib/firebaseClient";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter your email and password.",
      });
      return;
    }

    try {
      setLoading(true);

      const cred = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password,
      );

      if (!cred.user.emailVerified) {
        await signOut(firebaseAuth);
        toast({
          title: "Email not verified",
          description:
            "Click the verification link we sent to your email, then log in again.",
        });
        return;
      }

      const userRef = doc(firebaseDb, "users", cred.user.uid);
      getDoc(userRef).then((userDoc) => {
        if (!userDoc.exists()) {
          setDoc(userRef, {
            email: cred.user.email ?? "",
            name: cred.user.displayName ?? "",
            role: "user",
            avatarUrl: null,
            emailVerified: true,
            createdAt: serverTimestamp(),
          }).catch((err) => console.warn("Firestore user doc create", err));
        }
      }).catch(() => {});

      router.push("/profile");
    } catch (error: any) {
      console.error("Login error", error);
      let message = "Login failed. Please check your credentials.";
      if (error.code === "auth/invalid-credential") {
        message = "Invalid email or password.";
      } else if (error.code === "auth/user-not-found") {
        message = "No user found with that email.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password.";
      }

      toast({
        title: "Login error",
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
            Login
          </h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
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
            <Button
              type="submit"
              className="w-full h-11 rounded-xl btn-glow transition-all duration-200 hover:scale-[0.98]"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}