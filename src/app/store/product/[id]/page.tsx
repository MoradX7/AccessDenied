"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, CreditCard, ArrowLeft } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import StarRating from "@/components/store/StarRating";
import { Button } from "@/components/ui/button";

const ProductDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const res = await fetch(`/api/products?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const handleIncrease = () => setQuantity((q) => q + 1);
  const handleDecrease = () => setQuantity((q) => Math.max(1, q - 1));

  const handleAddToCart = () => {
    addToCart(product);
    updateQuantity(product.id, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-secondary/50 aspect-square">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-foreground">{product.title}</h1>
          <StarRating rating={product.rating} />

          <p className="font-heading text-3xl font-bold mt-6 text-foreground">${product.price.toFixed(2)}</p>

          <p className="text-muted-foreground leading-relaxed mt-6">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mt-8">
            <span className="text-sm font-medium text-foreground">Quantity</span>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={handleDecrease}
                className="px-3 py-2 hover:bg-accent transition-colors"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 font-medium text-sm min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-3 py-2 hover:bg-accent transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button onClick={handleAddToCart} size="lg" className="flex-1 gap-2">
              <ShoppingCart size={18} /> Add to Cart
            </Button>
            <Button
              onClick={() => {
                handleAddToCart();
                router.push("/store/cart");
              }}
              size="lg"
              variant="outline"
              className="flex-1 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <CreditCard size={18} /> Purchase
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;