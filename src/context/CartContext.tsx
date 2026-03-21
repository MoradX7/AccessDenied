"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Product } from "@/data/products";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firebaseAuth, firebaseDb } from "@/lib/firebaseClient";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  totalItems: number;
  totalPrice: number;
  justAdded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartToFirestore(items: CartItem[]) {
  return items.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
}

async function firestoreToCart(data: { productId: string; quantity: number }[]): Promise<CartItem[]> {
  if (!Array.isArray(data)) return [];
  const out: CartItem[] = [];
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to fetch products");
    const products: Product[] = await res.json();
    for (const row of data) {
      const product = products.find((p) => p.id === row.productId);
      if (product && row.quantity >= 1) {
        out.push({ product, quantity: row.quantity });
      }
    }
  } catch (err) {
    console.error(err);
  }
  return out;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const lastLoadedUid = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        lastLoadedUid.current = null;
        setItems([]);
        return;
      }
      if (lastLoadedUid.current === user.uid) return;
      lastLoadedUid.current = user.uid;
      try {
        const snap = await getDoc(doc(firebaseDb, "users", user.uid));
        const data = snap.data();
        const cart = data?.cart;
        const loaded = Array.isArray(cart) ? await firestoreToCart(cart) : [];
        setItems(loaded);
      } catch (err) {
        console.warn("Cart load failed", err);
      }
    });
    return () => unsubscribe();
  }, []);

  const persistCart = useCallback((nextItems: CartItem[]) => {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) return;
    updateDoc(doc(firebaseDb, "users", uid), {
      cart: cartToFirestore(nextItems),
      updatedAt: serverTimestamp(),
    }).catch((err) => console.warn("Cart save failed", err));
  }, []);

  const addToCart = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        const next =
          existing ?
            prev.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...prev, { product, quantity: 1 }];
        persistCart(next);
        return next;
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 600);
    },
    [persistCart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => i.product.id !== productId);
        persistCart(next);
        return next;
      });
    },
    [persistCart]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) => {
        const next = prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        );
        persistCart(next);
        return next;
      });
    },
    [persistCart]
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        totalItems,
        totalPrice,
        justAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};