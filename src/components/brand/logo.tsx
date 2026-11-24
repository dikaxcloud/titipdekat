import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-9", className)}
    >
      <defs>
        <linearGradient id="titipdekat-mark" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#22a173" />
          <stop offset="100%" stopColor="#0f6b4e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#titipdekat-mark)" />
      <rect
        x="9"
        y="11"
        width="14"
        height="14"
        rx="4.5"
        fill="white"
        opacity="0.95"
      />
      <rect
        x="18.5"
        y="16.5"
        width="13"
        height="13"
        rx="4.5"
        fill="white"
        opacity="0.5"
      />
      <circle cx="20.5" cy="19" r="2.1" fill="#0f6b4e" />
      <path
        d="M27.5 9.5c2.6 0 4.5 1.9 4.5 4.4-2.7.5-4.9-1-5.4-3.4.3-.6.6-1 .9-1Z"
        fill="#b0e9cf"
      />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={compact ? "size-8" : "size-9"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-ink",
            compact ? "text-lg" : "text-xl",
          )}
        >
          Titip<span className="text-brand-600">Dekat</span>
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Konsinyasi terhubung
        </span>
      </span>
    </span>
  );
}
