"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-4">
            Ready to Test Your Skills?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of security researchers and start your journey today. 
            No experience required - just curiosity and determination.
          </p>
          <Button className="h-12 px-8 rounded-xl text-base font-medium btn-glow transition-all duration-200 hover:scale-[0.98]">
            <Link href="/register">Get Started Now</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}