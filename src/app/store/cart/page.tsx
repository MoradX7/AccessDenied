"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/lib/firebaseClient";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      
      const user = firebaseAuth.currentUser;
      if (!user) {
        toast.error("Please log in to purchase items.");
        setIsCheckingOut(false);
        return;
      }

      const token = await user.getIdToken();
      
      const checkoutItems = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: checkoutItems }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process checkout");
      }

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/store/checkout-success?orderId=${data.order.id}`);
      
    } catch (err: any) {
      console.error("Checkout error", err);
      toast.error(err.message || "An error occurred during checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground/40 mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Discover products and add them to your cart.</p>
        <Link href="/store">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        href="/store"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Continue Shopping
      </Link>

      <h1 className="font-heading text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="space-y-0 divide-y divide-border">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-4 py-5">
            <Link href={`/store/product/${product.id}`} className="shrink-0">
              <img
                src={product.image}
                alt={product.title}
                className="w-20 h-20 rounded-lg object-cover bg-secondary/50"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-sm truncate">{product.title}</h3>
              <p className="text-muted-foreground text-xs mt-0.5">{product.brand}</p>
              <p className="font-heading font-bold mt-1">${product.price.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeFromCart(product.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="px-2 py-1 hover:bg-accent transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 py-1 text-xs font-medium">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="px-2 py-1 hover:bg-accent transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <div className="flex items-center justify-between mb-6">
          <span className="font-heading text-lg font-semibold">Total</span>
          <span className="font-heading text-2xl font-bold">${totalPrice.toFixed(2)}</span>
        </div>
        <Button 
          size="lg" 
          className="w-full gap-2"
          onClick={handleCheckout}
          disabled={isCheckingOut}
        >
          {isCheckingOut ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <ShoppingBag size={18} />
          )}
          {isCheckingOut ? "Processing..." : "Purchase"}
        </Button>
      </div>
    </div>
  );
};

export default Cart;