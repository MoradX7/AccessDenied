"use client";

import { categories, Category } from "@/data/products";
import { Sparkles, Shirt, ShoppingBasket, Cpu } from "lucide-react";

const iconMap: Record<Category, React.ReactNode> = {
  Makeup: <Sparkles size={18} />,
  Clothes: <Shirt size={18} />,
  Groceries: <ShoppingBasket size={18} />,
  Electronics: <Cpu size={18} />,
};

interface Props {
  selected: Category | null;
  onSelect: (cat: Category | null) => void;
}

const CategoryFilter = ({ selected, onSelect }: Props) => {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <button
        onClick={() => onSelect(null)}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === null
            ? "bg-primary text-primary-foreground shadow-button"
            : "bg-secondary text-secondary-foreground hover:bg-accent"
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === cat
              ? "bg-primary text-primary-foreground shadow-button"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          }`}
        >
          {iconMap[cat]}
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;