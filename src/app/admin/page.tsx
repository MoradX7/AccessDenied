"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";

export default function Admin() {
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
          <h1 className="font-heading font-bold text-3xl text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-4">Admin functionality coming soon</p>
        </motion.div>
      </main>
    </div>
  );
}