"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturesOverview from "./components/FeaturesOverview";
import MotiveSection from "./components/MotiveSection";
import Features from "./components/Features";
import ScrollWritingSection from "./components/ScrollWritingSection";
import TrendyStacks from "./components/TrendyStacks";
import CreatorProof from "./components/CreatorProof";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import GrowthSections from "./components/GrowthSections";
import TrustAndFinalCTA from "./components/TrustAndFinalCTA";
import PerformanceChart from "./components/PerformanceChart";
import StepsSection from "./components/StepsSection";

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-[#0c0c0f] selection:bg-[#f472b6]/20 selection:text-[#f472b6]">
      <Navbar />

      {/* HERO: The main entry point */}
      <Hero />


      {/* SUBSEQUENT SECTIONS */}
      <div className="relative z-10 bg-[#0c0c0f]">
        {/* Social Proof handled inside Hero/CreatorProof */}

        <FeaturesOverview />

        <MotiveSection />
        <Features />
        <ScrollWritingSection />
        <PerformanceChart />
        <GrowthSections />
        <TrendyStacks />

        <CreatorProof />

        <Testimonials />

        <Pricing />

        <FAQ />

        <TrustAndFinalCTA />

        <Footer />
      </div>
    </main>
  );
}
