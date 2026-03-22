"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
      });
      return;
    }

    try {
      setLoading(true);

      const actionCodeSettings = {
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/login`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(firebaseAuth, email, actionCodeSettings);

      setSent(true);
      toast({
        title: "Reset link sent",
        description:
          "If an account exists for that email, you will receive a link to reset your password. Check your inbox and spam folder.",
      });
    } catch (error: unknown) {
      console.error("Password reset error", error);
      const err = error as { code?: string };
      let message = "Could not send reset email. Please try again.";
      if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with that email.";
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
            Forgot password
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          {sent ? (
            <div className="space-y-4">
              <p className="text-sm text-foreground text-center">
                A verification link has been sent to your email address. Please check your inbox, If you do not see it, check your spam folder.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Back to login
              </Button>
            </div>
          ) : (
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
              <Button
                type="submit"
                className="w-full h-11 rounded-xl btn-glow transition-all duration-200 hover:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}

          <p className="text-sm text-muted-foreground text-center mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
