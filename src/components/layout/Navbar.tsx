"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, ShoppingCart } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

export default function Navbar() {
  const { isDark, toggle, mounted } = useTheme();
  const pathname = usePathname();
  const { totalItems, justAdded } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Check if we're in the store section
  const isStoreRoute = pathname.startsWith('/store');

  if (isStoreRoute) {
    return (
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link href="/" className="font-heading text-xl font-bold tracking-tight">
            Access<span className="text-green-500">Denied</span>
          </Link>
          <Link href="/store/cart" className="relative p-2 rounded-full hover:bg-accent transition-colors">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span
                key={totalItems}
                className={`absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold ${justAdded ? "animate-badge-pop" : ""}`}
              >
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 h-14 px-6 rounded-full bg-background/70 backdrop-blur-md navbar-shadow flex items-center gap-1"
      role="navigation"
      aria-label="Main navigation"
    >
      <NavLink href="/">Home</NavLink>
      <NavLink href="/store">Store</NavLink>
      <NavLink href="/social">Social</NavLink>
      {isLoggedIn ? (
        <NavLink href="/profile">Profile</NavLink>
      ) : (
        <NavLink href="/login">Login</NavLink>
      )}
      {mounted && (
        <Button
          onClick={toggle}
          variant="ghost"
          size="icon"
          className="ml-2"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      )}
    </nav>
  );
}