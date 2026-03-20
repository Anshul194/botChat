"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturesOverview from "./components/FeaturesOverview";
import MotiveSection from "./components/MotiveSection";
import Features from "./components/Features";
import TrendyStacks from "./components/TrendyStacks";
import CreatorProof from "./components/CreatorProof";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Blogs from "./components/Blogs";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

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
        <MotiveSection />
        <Features />
        <TrendyStacks />
        <CreatorProof />

        <Testimonials />

        <Pricing />

        <Blogs />

        <FAQ />

        <Footer />
      </div>
    </main>
  );
}
