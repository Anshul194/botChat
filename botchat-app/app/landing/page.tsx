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

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-white selection:bg-[#FF2D78]/20 selection:text-[#FF2D78]">
      <Navbar />

      {/* HERO: The main entry point */}
      <Hero />

      {/* SUBSEQUENT SECTIONS: White backgrounds */}
      <div className="relative z-10 bg-white">
        {/* Social Proof handled inside Hero/CreatorProof */}

        <FeaturesOverview />
        <ScrollWritingSection />
        <PerformanceChart />
        <MotiveSection />
        <Features />
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
