import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  value: number;
  indicatorClassName?: string;
}

function Progress({ className, value, indicatorClassName, ...props }: ProgressProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-mist", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-brand-500 transition-[width] duration-500",
          indicatorClassName,
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export { Progress };
