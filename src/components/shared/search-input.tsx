"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari…",
  className,
  ariaLabel = "Cari data",
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-9 text-sm text-ink shadow-sm outline-none transition-colors placeholder:text-muted/60 focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-200 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink"
          aria-label="Hapus pencarian"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
