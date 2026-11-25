"use client";

import { Fragment, useLayoutEffect, useRef, type Ref } from "react";
import { gsap } from "@/lib/gsap";

type RevealTag = "span" | "h1" | "h2" | "h3";

interface WordRevealProps {
  text: string;
  as?: RevealTag;
  className?: string;
}

/**
 * Word-by-word reveal for headings. The heading semantics stay intact and a
 * screen-reader-only copy carries the full text while the animated words are
 * hidden from assistive technology.
 */
export function WordReveal({ text, as = "span", className }: WordRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-word]", element);
      gsap.fromTo(
        words,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, element);

    return () => context.revert();
  }, [text]);

  const words = text.split(" ");
  const content = (
    <Fragment>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span data-word className="inline-block will-change-[transform,opacity]">
              {word}
            </span>
            {index < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Fragment>
  );

  if (as === "h1") {
    return <h1 ref={ref as Ref<HTMLHeadingElement>} className={className}>{content}</h1>;
  }
  if (as === "h2") {
    return <h2 ref={ref as Ref<HTMLHeadingElement>} className={className}>{content}</h2>;
  }
  if (as === "h3") {
    return <h3 ref={ref as Ref<HTMLHeadingElement>} className={className}>{content}</h3>;
  }
  return <span ref={ref as Ref<HTMLSpanElement>} className={className}>{content}</span>;
}
