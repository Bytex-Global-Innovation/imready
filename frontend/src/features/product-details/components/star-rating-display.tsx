import { Star } from "@/components/icons";
import { cn } from "@/lib/utils";

interface StarRatingDisplayProps {
  value: number;
  count?: number;
  size?: 20;
}

export function StarRatingDisplay({ value, count }: StarRatingDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => {
          const filled = value >= i + 1;
          return (
            <Star
              key={i}
              className={cn(
                "h-5 w-5",
                filled ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200",
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          );
        })}
      </div>
      {count != null ? (
        <span className="text-sm text-muted">({count.toLocaleString("en-IN")})</span>
      ) : null}
    </div>
  );
}
