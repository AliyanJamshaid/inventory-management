"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplierRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function SupplierRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  className,
}: SupplierRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        const isHalfFilled = starValue - 0.5 === rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={cn(
              "relative transition-transform",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
          >
            {isHalfFilled ? (
              <div className="relative">
                <Star
                  className={cn(sizeClasses[size], "text-muted-foreground")}
                  fill="none"
                />
                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                  <Star
                    className={cn(sizeClasses[size], "text-yellow-500")}
                    fill="currentColor"
                  />
                </div>
              </div>
            ) : (
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled ? "text-yellow-500" : "text-muted-foreground"
                )}
                fill={isFilled ? "currentColor" : "none"}
              />
            )}
          </button>
        );
      })}
      <span className="ml-1 text-sm text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
