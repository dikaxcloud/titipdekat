"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  index?: number;
  as?: "div" | "article";
}

/**
 * Shared entrance + hover motion for cards. Entrance runs once when the card
 * enters the viewport; hover is deliberately subtle and touch devices simply
 * ignore it. Reduced motion renders the plain element.
 */
export function MotionCard({
  children,
  className,
  index = 0,
  as = "div",
}: MotionCardProps) {
  const reduceMotion = useReducedMotion();
  const Tag = as === "article" ? motion.article : motion.div;

  if (reduceMotion) {
    const PlainTag = as;
    return <PlainTag className={className}>{children}</PlainTag>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.45,
        delay: Math.min(index * 0.06, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3 }}
    >
      {children}
    </Tag>
  );
}
