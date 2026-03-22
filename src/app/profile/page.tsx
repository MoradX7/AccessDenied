"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import {
  firebaseAuth,
} from "@/lib/firebaseClient";

const withTimeout = (promise: Promise<any>, ms: number, message: string) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
};

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
}

interface Order {
  id: string;
  total_price: string;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (current) => {
      if (!current) {
        router.push("/login");
        return;
      }

      setUser(current);
      setDisplayName(current.displayName ?? "");

      try {
        const res = await fetch(`/api/profile?id=${current.uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
          if (data.name) {
            setDisplayName(data.name);
          }
        } else if (res.status === 404) {
          // Create initial profile
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: current.uid,
              name: current.displayName || "",
              email: current.email,
              avatar_url: current.photoURL || null,
            })
          });
        }
      } catch (err) {
        console.error("Error fetching profile from db", err);
      }

      // Fetch Orders
      try {
        setLoadingOrders(true);
        const token = await current.getIdToken();
        const ordersRes = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoadingOrders(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return null;
  }

  async function handleSaveProfile() {
    if (!displayName) {
      toast({
        title: "Name required",
        description: "Please enter a display name.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      await withTimeout(updateProfile(user, { displayName }), 10000, "Update profile timed out");

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.uid,
          name: displayName,
          email: user.email,
          avatar_url: avatarUrl
        })
      });

      if (!res.ok) throw new Error("Database update failed");

      toast({
        title: "Profile updated",
        description: "Your display name has been saved.",
      });
    } catch (error: any) {
      console.error("Save profile error", error);
      toast({
        title: "Error",
        description: error.message || "Could not update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image file (e.g. JPG, PNG).",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);

      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = "Upload failed";
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch (e) { }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setAvatarUrl(data.url);

      toast({
        title: "Profile picture updated",
        description: "Your new avatar has been uploaded.",
      });
    } catch (error: any) {
      console.error("Avatar upload error", error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload. Make sure Storage is enabled and rules allow uploads to avatars/ (see storage.rules).",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  }

  async function handleLogout() {
    await signOut(firebaseAuth);
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-16 px-6 min-h-screen container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 w-full max-w-6xl mx-auto items-start">
          
          {/* Profile Section (Left Side) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-4 flex flex-col items-start w-full space-y-8 pr-0 lg:pr-4"
          >
            <h1 className="font-heading font-bold text-4xl text-foreground">
              Profile
            </h1>

            <div className="flex flex-col items-start gap-5 w-full">
              <div className="h-32 w-32 lg:h-40 lg:w-40 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-border shadow-sm">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-semibold text-muted-foreground">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </div>
              <div className="w-full mt-3">
                {uploading && <p className="text-sm font-medium text-primary animate-pulse mb-2">Uploading...</p>}
                <div className="relative w-full max-w-[18rem]">
                  <Input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button asChild disabled={uploading} className="w-full cursor-pointer text-base py-5">
                    <label htmlFor="avatar-upload">
                      Update picture
                    </label>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6 w-full max-w-[18rem]">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input value={user.email ?? ""} disabled className="bg-secondary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Display name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 w-full max-w-[18rem]">
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full text-base py-5">
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full text-base py-5"
              >
                Log out
              </Button>
            </div>
          </motion.div>

          {/* Purchase History Section (Right Side) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-8 w-full bg-card border border-border shadow-sm rounded-2xl p-6 sm:p-8 card-shadow-light dark:card-shadow-dark"
          >
            <h2 className="font-heading font-bold text-3xl text-foreground mb-8">
              Purchase History
            </h2>
            
            {loadingOrders ? (
              <p className="text-muted-foreground text-sm">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-muted-foreground text-sm">You have no past orders.</p>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-border rounded-xl p-5 space-y-4 bg-background/50 hover:bg-muted/10 transition-colors">
                    <div className="flex justify-between items-start border-b border-border pb-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wider font-semibold">Order Reference Number</p>
                        <p className="font-mono text-sm font-semibold text-foreground">{order.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary capitalize mt-1 border border-primary/20">
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 group">
                          <div className="w-14 h-14 rounded-md bg-secondary overflow-hidden shrink-0 border border-border/50">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full bg-muted"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{item.title || "Unknown Product"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-foreground">${Number(item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-border mt-3">
                      <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Amount</span>
                      <span className="font-heading text-lg font-bold text-foreground">${Number(order.total_price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
