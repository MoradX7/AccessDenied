"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16 px-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="font-heading font-bold text-6xl text-foreground mb-4">404</h1>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-6">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button className="h-11 px-8 rounded-xl">
            <Link href="/">Go Home</Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}