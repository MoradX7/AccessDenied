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
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  firebaseAuth,
  firebaseDb,
  firebaseStorage,
} from "@/lib/firebaseClient";

const withTimeout = (promise: Promise<any>, ms: number, message: string) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  ]);
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `avatars/${user.uid}/${Date.now()}-${safeName}`;

    try {
      setUploading(true);
      const storageRef = ref(firebaseStorage, path);
      
      await uploadBytes(storageRef, file, {
        contentType: file.type || "image/jpeg",
      });
      
      const url = await getDownloadURL(storageRef);
      setAvatarUrl(url);

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.uid,
          name: displayName,
          email: user.email,
          avatar_url: url
        })
      });

      if (!res.ok) throw new Error("Database avatar update failed");

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
      <main className="pt-28 pb-16 px-6 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-card rounded-2xl p-8 card-shadow-light dark:card-shadow-dark space-y-6"
        >
          <h1 className="font-heading font-bold text-2xl text-foreground text-center">
            Profile
          </h1>

          <div className="flex flex-col items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-muted-foreground">
                  {user.email?.[0]?.toUpperCase() ?? "U"}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                Profile picture
                {uploading && <span className="text-xs text-primary animate-pulse">(Uploading...)</span>}
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <Input value={user.email ?? ""} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Display name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

