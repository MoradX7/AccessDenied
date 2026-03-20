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
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

export default function ResendVerificationPage() {
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
        description: "Enter your email and password.",
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

      if (cred.user.emailVerified) {
        await signOut(firebaseAuth);
        toast({
          title: "Already verified",
          description: "Your email is already verified. You can log in.",
        });
        router.push("/login");
        return;
      }

      const loginUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`;
      await sendEmailVerification(cred.user, {
        url: loginUrl,
        handleCodeInApp: false,
      });

      await signOut(firebaseAuth);

      toast({
        title: "Verification email sent",
        description:
          "Check your inbox (and spam). Click the link, then log in to go to your profile.",
      });
      router.push("/login");
    } catch (error: unknown) {
      const err = error as { code?: string };
      console.error("Resend verification error", err);
      let message = "Could not send verification email.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        message = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many attempts. Wait a few minutes and try again.";
      }
      toast({
        title: "Error",
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
          <h1 className="font-heading font-bold text-2xl text-foreground mb-2 text-center">
            Resend verification email
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your email and password. We&apos;ll send a new verification link. After
            clicking it you&apos;ll be taken to login, then to your profile.
          </p>
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
              {loading ? "Sending..." : "Send verification email"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
