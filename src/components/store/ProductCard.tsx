"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import StarRating from "./StarRating";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl bg-card shadow-card hover:shadow-card-hover border border-transparent hover:border-primary/30 transition-all duration-300"
    >
      <Link href={`/store/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-t-xl bg-secondary/50">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-4">
          <h3 className="font-heading font-semibold text-sm leading-tight mb-1 truncate">
            {product.title}
          </h3>
          <StarRating rating={product.rating} />
          <p className="mt-2 font-heading font-bold text-lg">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
        className="absolute bottom-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-button hover:scale-110 active:scale-95 transition-transform duration-200"
        aria-label={`Add ${product.title} to cart`}
      >
        <Plus size={18} />
      </button>
    </motion.div>
  );
};

export default ProductCard;