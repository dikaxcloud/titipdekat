import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Benefits } from "@/components/landing/benefits";
import { About } from "@/components/landing/about";
import { CtaSection } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { SmoothScroll } from "@/components/animation/smooth-scroll";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SmoothScroll />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Benefits />
        <About />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
