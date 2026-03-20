"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";

export default function Social() {
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<string[]>([
    "Great writeup on the auth bypass!",
  ]);
  const [input, setInput] = useState("");

  const submitComment = () => {
    if (!input.trim()) return;
    setComments((prev) => [...prev, input.trim()]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16 px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-2xl p-6 card-shadow-light dark:card-shadow-dark"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-heading font-semibold text-sm">SR</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">security_researcher</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          <p className="text-foreground leading-relaxed mb-6">
            Just completed the Auth Bypass Challenge — the token validation flaw was subtle but
            devastating. If you haven't tried it yet, highly recommend starting with the session
            fixation vector. Documented my full methodology in the findings section.
          </p>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label={liked ? "Unlike post" : "Like post"}
            >
              <Heart size={18} className={liked ? "fill-primary text-primary" : ""} />
              {liked ? 1 : 0}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle size={18} />
              {comments.length}
            </span>
          </div>
          <div className="border-t border-border pt-4 space-y-3">
            {comments.map((c, i) => (
              <div key={i} className="bg-muted/50 rounded-xl px-4 py-3">
                <p className="text-sm text-foreground">{c}</p>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitComment()}
                placeholder="Write a comment..."
                className="flex-1 h-12 rounded-xl bg-muted/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-background outline-none transition-all duration-200"
                aria-label="Comment input"
              />
              <Button
                onClick={submitComment}
                className="h-12 px-4 rounded-xl btn-glow transition-all duration-200 hover:scale-[0.98]"
                aria-label="Submit comment"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}