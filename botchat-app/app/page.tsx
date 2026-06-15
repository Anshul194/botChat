"use client";

import PageMeta from "@/components/PageMeta";
import Navbar from "./landing/components/Navbar";
import Hero from "./landing/components/Hero";
import FeaturesOverview from "./landing/components/FeaturesOverview";
import BioLinkShowcase from "./landing/components/BioLinkShowcase";
import MotiveSection from "./landing/components/MotiveSection";
import Features from "./landing/components/Features";
import ScrollWritingSection from "./landing/components/ScrollWritingSection";
import TrendyStacks from "./landing/components/TrendyStacks";
import CreatorProof from "./landing/components/CreatorProof";
import Testimonials from "./landing/components/Testimonials";
import Pricing from "./landing/components/Pricing";
import FAQ from "./landing/components/FAQ";
import Footer from "./landing/components/Footer";
import GrowthSections from "./landing/components/GrowthSections";
import TrustAndFinalCTA from "./landing/components/TrustAndFinalCTA";
import PerformanceChart from "./landing/components/PerformanceChart";
import StepsSection from "./landing/components/StepsSection";
import BlogSection from "./landing/components/BlogSection";
import SmoothScrollingUI from "./landing/components/SmoothScrollingUI";

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
        {/* Social Proof handled inside Hero/CreatorProof */}

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
