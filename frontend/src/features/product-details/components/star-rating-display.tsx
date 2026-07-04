import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const classes = {
  starFilled: "fill-amber-400 text-amber-400",
  starEmpty: "fill-gray-200 text-gray-200",
  count: "text-sm text-gray-600",
  size20: "h-5 w-5",
} as const;

interface StarRatingDisplayProps {
  value: number;
  count?: number;
  size?: 20;
}

export function StarRatingDisplay({ value, count, size = 20 }: StarRatingDisplayProps) {
  const sizeClass = size === 20 ? classes.size20 : classes.size20;

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
                filled ? classes.starFilled : classes.starEmpty,
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {count != null ? (
        <span className={classes.count}>
          ({count.toLocaleString("en-IN")})
        </span>
      ) : null}
    </div>
  );
}
