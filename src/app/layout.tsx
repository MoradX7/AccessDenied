import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AccessDenied - Security Testing Platform",
  description: "A security testing platform built to challenge real-world defenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <CartProvider>
          <Toaster />
          <SonnerToaster />
          <Navbar />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}