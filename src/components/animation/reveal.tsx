"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Children carrying data-reveal are staggered; otherwise the wrapper animates. */
  stagger?: number;
  y?: number;
  start?: string;
}

export function Reveal({
  children,
  className,
  stagger = 0.08,
  y = 16,
  start = "top 85%",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const marked = gsap.utils.toArray<HTMLElement>("[data-reveal]", element);
      const targets = marked.length > 0 ? marked : [element];

      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger,
          scrollTrigger: {
            trigger: element,
            start,
            once: true,
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [stagger, y, start]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
