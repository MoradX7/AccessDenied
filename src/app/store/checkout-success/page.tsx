"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/button";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center mt-10">
      <div className="bg-primary/20 text-primary w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle size={48} />
      </div>
      <h1 className="font-heading text-4xl font-bold mb-4">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Thank you for your purchase. Your payment was skipped because this is the lab environment, but your order has been successfully placed.
      </p>
      
      {orderId && (
        <div className="bg-secondary/30 border border-border rounded-xl p-6 w-full mb-10 text-left">
          <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Order Reference Number</p>
          <p className="font-mono text-xl font-bold break-all">{orderId}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/store" className="w-full sm:w-auto">
          <Button className="w-full gap-2" size="lg">
            <ShoppingBag size={18} /> Continue Shopping
          </Button>
        </Link>
        <Link href="/profile" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full gap-2" size="lg">
            <User size={18} /> View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-32 text-center text-muted-foreground">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
