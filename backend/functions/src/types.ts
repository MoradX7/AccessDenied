export type UserRole = "user" | "admin";

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
}

export type Category = "Makeup" | "Clothes" | "Groceries" | "Electronics";

export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  rating: number;
  category: Category;
  image: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "paid" | "failed" | "shipped";
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

