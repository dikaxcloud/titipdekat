"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Subtle hover/tap feedback for landing-page calls to action. */
export function MotionTap({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  const className = "inline-flex w-full [&>*]:w-full sm:w-auto sm:[&>*]:w-auto";

  if (reduceMotion) return <span className={className}>{children}</span>;

  return (
    <motion.span
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {children}
    </motion.span>
  );
}
