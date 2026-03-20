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

export const categories: Category[] = ["Makeup", "Clothes", "Groceries", "Electronics"];

export const products: Product[] = [
  {
    id: "1",
    title: "Velvet Matte Lipstick",
    brand: "Luxe Beauty",
    price: 28.99,
    rating: 4.8,
    category: "Makeup",
    image: "/products/lipstick.jpg",
    description:
      "A rich, long-lasting velvet matte lipstick that glides on effortlessly for a flawless finish. Infused with vitamin E and jojoba oil to keep lips hydrated all day. Available in a stunning range of bold and natural shades to complement every skin tone. The precision tip applicator ensures a perfect outline every time.",
  },
  {
    id: "2",
    title: "HD Liquid Foundation",
    brand: "Luxe Beauty",
    price: 42.0,
    rating: 4.5,
    category: "Makeup",
    image: "/products/foundation.jpg",
    description:
      "Achieve a flawless, airbrushed look with this lightweight HD liquid foundation. Buildable coverage from sheer to full, with a natural satin finish that lasts up to 24 hours. Formulated with hyaluronic acid for all-day hydration and SPF 15 protection.",
  },
  {
    id: "3",
    title: "Leather Biker Jacket",
    brand: "Urban Edge",
    price: 189.0,
    rating: 4.9,
    category: "Clothes",
    image: "/products/jacket.jpg",
    description:
      "A timeless black leather biker jacket crafted from premium genuine leather. Features asymmetric zip closure, multiple pockets, and a comfortable quilted lining. The perfect statement piece that pairs effortlessly with any outfit, from casual denim to evening wear.",
  },
  {
    id: "4",
    title: "Essential Cotton Tee",
    brand: "Minimal Co.",
    price: 34.0,
    rating: 4.3,
    category: "Clothes",
    image: "/products/tshirt.jpg",
    description:
      "The perfect everyday essential. Made from 100% organic Pima cotton for an incredibly soft feel. Relaxed fit with reinforced stitching for lasting durability. Pre-shrunk and garment-dyed for a lived-in look from day one.",
  },
  {
    id: "5",
    title: "Organic Hass Avocados",
    brand: "Green Harvest",
    price: 6.99,
    rating: 4.6,
    category: "Groceries",
    image: "/products/avocado.jpg",
    description:
      "Premium organic Hass avocados sourced from sustainable farms. Rich in healthy fats, fiber, and essential vitamins. Perfectly ripe and ready to enjoy in salads, smoothies, or on toast. Each pack contains 6 hand-selected avocados.",
  },
  {
    id: "6",
    title: "Extra Virgin Olive Oil",
    brand: "Terra Oliva",
    price: 18.5,
    rating: 4.7,
    category: "Groceries",
    image: "/products/olive-oil.jpg",
    description:
      "Cold-pressed extra virgin olive oil from century-old olive groves in the Mediterranean. Rich, fruity flavor with peppery notes, perfect for drizzling over salads, pasta, and grilled vegetables. First harvest, single-origin, 750ml bottle.",
  },
  {
    id: "7",
    title: "Studio Pro Headphones",
    brand: "SoundWave",
    price: 249.0,
    rating: 4.8,
    category: "Electronics",
    image: "/products/headphones.jpg",
    description:
      "Immerse yourself in studio-quality sound with these premium wireless headphones. Featuring active noise cancellation, 40mm custom drivers, and up to 30 hours of battery life. Memory foam ear cushions and an adjustable headband ensure all-day comfort.",
  },
  {
    id: "8",
    title: "Ultra Smartphone X12",
    brand: "TechNova",
    price: 899.0,
    rating: 4.4,
    category: "Electronics",
    image: "/products/smartphone.jpg",
    description:
      "The flagship Ultra Smartphone X12 features a stunning 6.7-inch AMOLED display with 120Hz refresh rate. Powered by the latest octa-core processor with 12GB RAM and 256GB storage. Triple camera system with 108MP main sensor, 5000mAh battery with 65W fast charging.",
  },
];