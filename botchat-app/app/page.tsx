"use client";

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

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white selection:bg-[#FF2D78]/20 selection:text-[#FF2D78]">
      <Navbar />

      {/* HERO: The main entry point */}
      <Hero />


      {/* SUBSEQUENT SECTIONS: White backgrounds */}
      <div className="relative z-10 bg-white">
        {/* Social Proof handled inside Hero/CreatorProof */}

        <FeaturesOverview />
        <BioLinkShowcase />
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
