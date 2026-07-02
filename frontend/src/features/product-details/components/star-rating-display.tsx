import { Star } from "lucide-react";
import { PRODUCT_DETAIL_RATING_CLASSES } from "@/constants";
import { cn } from "@/lib/utils";

interface StarRatingDisplayProps {
  value: number;
  count?: number;
  size?: 20;
}

export function StarRatingDisplay({ value, count, size = 20 }: StarRatingDisplayProps) {
  const sizeClass =
    size === 20 ? PRODUCT_DETAIL_RATING_CLASSES.size20 : PRODUCT_DETAIL_RATING_CLASSES.size20;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = value >= i + 1;
          return (
            <Star
              key={i}
              className={cn(
                sizeClass,
                filled
                  ? PRODUCT_DETAIL_RATING_CLASSES.starFilled
                  : PRODUCT_DETAIL_RATING_CLASSES.starEmpty,
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {count != null ? (
        <span className={PRODUCT_DETAIL_RATING_CLASSES.count}>
          ({count.toLocaleString("en-IN")})
        </span>
      ) : null}
    </div>
  );
}
