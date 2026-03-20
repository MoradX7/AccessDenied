"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { products, Category } from "@/data/products";
import CategoryFilter from "@/components/store/CategoryFilter";
import ProductCard from "@/components/store/ProductCard";

export default function Store() {
  const [selected, setSelected] = useState<Category | null>(null);
  const filtered = selected ? products.filter((p) => p.category === selected) : products;

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen pt-20">
        <section className="container mx-auto px-4 pt-10 pb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-center mb-2 text-foreground">
            {selected ?? "All"}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {selected
              ? `Browse our ${selected.toLowerCase()} collection`
              : "Curated essentials for every lifestyle"}
          </p>
          <CategoryFilter selected={selected} onSelect={setSelected} />
        </section>

        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mt-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}