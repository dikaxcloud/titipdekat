import { cn } from "@/lib/utils";

const gradients = [
  "from-amber-100 to-orange-50 text-amber-700",
  "from-emerald-100 to-teal-50 text-emerald-700",
  "from-rose-100 to-pink-50 text-rose-700",
  "from-sky-100 to-blue-50 text-sky-700",
  "from-violet-100 to-purple-50 text-violet-700",
  "from-lime-100 to-green-50 text-lime-700",
];

function hash(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

interface ProductThumbProps {
  name: string;
  emoji: string;
  image?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductThumb({
  name,
  emoji,
  image,
  size = "md",
  className,
}: ProductThumbProps) {
  const sizes = {
    sm: "size-9 rounded-lg text-lg",
    md: "size-12 rounded-xl text-2xl",
    lg: "size-16 rounded-2xl text-3xl",
  };

  if (image) {
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 overflow-hidden bg-mist ring-1 ring-line",
          sizes[size],
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={name} className="size-full object-cover" />
      </span>
    );
  }

  const gradient = gradients[hash(name) % gradients.length];

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-gradient-to-br ring-1 ring-line/70",
        gradient,
        sizes[size],
        className,
      )}
    >
      {emoji}
    </span>
  );
}
