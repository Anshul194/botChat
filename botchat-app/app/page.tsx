"use client";

import dynamic from "next/dynamic";
import PageMeta from "@/components/PageMeta";
import Navbar from "./landing/components/Navbar";
import Hero from "./landing/components/Hero";

const SmoothScrollingUI = dynamic(() => import("./landing/components/SmoothScrollingUI"), { ssr: false });
const FeaturesOverview = dynamic(() => import("./landing/components/FeaturesOverview"));
const BioLinkShowcase = dynamic(() => import("./landing/components/BioLinkShowcase"));
const MotiveSection = dynamic(() => import("./landing/components/MotiveSection"));
const Features = dynamic(() => import("./landing/components/Features"));
const ScrollWritingSection = dynamic(() => import("./landing/components/ScrollWritingSection"));
const TrendyStacks = dynamic(() => import("./landing/components/TrendyStacks"));
const CreatorProof = dynamic(() => import("./landing/components/CreatorProof"));
const Testimonials = dynamic(() => import("./landing/components/Testimonials"));
const Pricing = dynamic(() => import("./landing/components/Pricing"));
const FAQ = dynamic(() => import("./landing/components/FAQ"));
const Footer = dynamic(() => import("./landing/components/Footer"));
const GrowthSections = dynamic(() => import("./landing/components/GrowthSections"));
const TrustAndFinalCTA = dynamic(() => import("./landing/components/TrustAndFinalCTA"));
const PerformanceChart = dynamic(() => import("./landing/components/PerformanceChart"));
const StepsSection = dynamic(() => import("./landing/components/StepsSection"));
const BlogSection = dynamic(() => import("./landing/components/BlogSection"));

export default function Home() {
  return (
    <>
      <PageMeta
        title="BotChat — Instagram DM & Facebook Messenger Automation"
        description="Automate Instagram DMs and Facebook Messenger with AI-powered chatbots. Convert comments into customers in under 1 second. Trusted by 47,000+ creators and brands. Fully Meta policy compliant."
      />
      <main className="min-h-screen w-full selection:bg-[#FF2D78]/20 selection:text-[#FF2D78]">
      <SmoothScrollingUI />
      <Navbar />

      {/* HERO: The main entry point */}
      <Hero />

      {/* SUBSEQUENT SECTIONS */}
      <div className="relative z-10">
        <div id="features">
          <FeaturesOverview />
        </div>
        <BioLinkShowcase />
        <MotiveSection />
        <Features />
        <ScrollWritingSection />
        <PerformanceChart />
        <div id="solutions">
          <GrowthSections />
        </div>
        <TrendyStacks />

        <CreatorProof />

        <Testimonials />

        <BlogSection />

        <div id="pricing">
          <Pricing />
        </div>

        <FAQ />

        <div id="company">
          <TrustAndFinalCTA />
        </div>

        <Footer />
      </div>
    </main>
    </>
  );
}
