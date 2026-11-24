"use client";

import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface SegmentedFilterProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedFilter({
  options,
  value,
  onChange,
  className,
  ariaLabel = "Filter data",
}: SegmentedFilterProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-1.5", className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                : "border-line bg-white text-muted hover:border-brand-200 hover:text-ink",
            )}
          >
            {option.label}
            {typeof option.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-bold",
                  active ? "bg-white/20 text-white" : "bg-mist text-muted",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
