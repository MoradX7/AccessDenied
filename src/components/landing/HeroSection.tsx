"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Dramatic background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/30 blur-[80px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 h-64 mx-auto mb-6 flex items-center justify-center drop-shadow-[0_0_40px_hsla(152,60%,42%,0.5)]"
        >
          <Image src={logo} alt="AccessDenied logo" className="w-full h-full object-contain" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="font-heading font-bold text-xl md:text-2xl lg:text-3xl text-foreground tracking-[-0.03em] text-balance mb-3"
        >
          A security testing platform built to challenge real-world defenses.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty mb-8"
        >
          Think like an attacker, analyze like a researcher, and help push the platform closer to being truly unbreakable.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {isLoggedIn ? (
            <Button asChild className="h-11 px-8 rounded-xl btn-glow transition-all duration-200 hover:scale-[0.98]">
              <Link href="/profile">Profile</Link>
            </Button>
          ) : (
            <Button asChild className="h-11 px-8 rounded-xl btn-glow transition-all duration-200 hover:scale-[0.98]">
              <Link href="/register">Register</Link>
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}