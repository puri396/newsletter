import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { Features } from "@/components/landing/Features";
import { AiTools } from "@/components/landing/AiTools";
import { UseCases } from "@/components/landing/UseCases";
import { Integrations } from "@/components/landing/Integrations";
import { MidCtaShowcase } from "@/components/landing/MidCtaShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      {/* Neon-style header + hero backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[720px] bg-[url('/bg-illustration.png')] bg-cover bg-center bg-no-repeat opacity-80" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-gradient-to-b from-slate-950 via-slate-950/70 to-slate-950/10" />

      <Navbar />

      <main className="mx-auto flex  flex-col  pb-24 pt-28 ">
        <Hero />
        <TrustedBy />
        <HowItWorks />
        <ProductShowcase />
        <Features />
        <AiTools />
     
        <Integrations />
       
        <FAQ />
       
      </main>

      <Footer />
    </div>
  );
}
