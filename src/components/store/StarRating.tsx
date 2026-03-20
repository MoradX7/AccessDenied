import { Star } from "lucide-react";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= Math.round(rating) ? "fill-primary text-primary" : "text-border"}
        />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground">{rating}</span>
    </div>
  );
};

export default StarRating;