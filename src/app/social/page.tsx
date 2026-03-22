"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import { onAuthStateChanged, User } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_name: string | null;
  user_avatar: string | null;
}

export default function Social() {
  const [user, setUser] = useState<User | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState("");
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
    });

    async function initialize() {
      try {
        const postRes = await fetch("/api/posts");
        if (postRes.ok) {
          const postsData: Post[] = await postRes.json();
          if (postsData.length > 0) {
            setPost(postsData[0]);
            
            // Bring in comments for this specific post natively
            const commentsRes = await fetch(`/api/comments?postId=${postsData[0].id}`);
            if (commentsRes.ok) {
              setComments(await commentsRes.json());
            }
          }
        }
      } catch (err) {
        console.error("Failed to load feed data", err);
      } finally {
        setLoading(false);
      }
    }

    initialize();
    return () => unsubscribe();
  }, []);

  const submitComment = async () => {
    if (!input.trim() || !post) return;
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to leave a comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = await user.getIdToken();
      
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ post_id: post.id, content: input.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");

      // Refetch comments seamlessly to load generated user metadata from joined PG table
      const commentsRes = await fetch(`/api/comments?postId=${post.id}`);
      if (commentsRes.ok) {
        setComments(await commentsRes.json());
      }
      
      setInput("");
      toast({
        title: "Comment added",
        description: "Your thought was shared successfully.",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Action Failed",
        description: err.message || "Could not publish your comment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 pb-16 px-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !post ? (
          <div className="text-center text-muted-foreground py-20">No active posts available.</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-2xl p-6 card-shadow-light dark:card-shadow-dark"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {post.user_avatar ? (
                  <img src={post.user_avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary font-heading font-semibold text-sm">
                    {post.user_name ? post.user_name.substring(0, 2).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{post.user_name || "Unknown User"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <p className="text-foreground leading-relaxed mb-6 whitespace-pre-wrap">
              {post.content}
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
              {comments.map((c) => (
                <div key={c.id} className="bg-muted/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-secondary overflow-hidden shrink-0">
                      {c.user_avatar ? (
                        <img src={c.user_avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {c.user_name ? c.user_name[0].toUpperCase() : "U"}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {c.user_name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground ml-8 whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
              
              <div className="flex gap-2 mt-4 pt-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  placeholder={user ? "Write a comment..." : "Login to post comments"}
                  disabled={submitting}
                  className="flex-1 h-12 rounded-xl bg-muted/50 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:bg-background outline-none transition-all duration-200 disabled:opacity-50"
                  aria-label="Comment input"
                />
                <Button
                  onClick={submitComment}
                  disabled={submitting || !input.trim() || !user}
                  className="h-12 px-4 rounded-xl btn-glow transition-all duration-200 hover:scale-[0.98]"
                  aria-label="Submit comment"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}