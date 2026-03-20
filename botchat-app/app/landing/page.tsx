"use client";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full bg-white selection:bg-[#FF2D78]/20 selection:text-[#FF2D78]">
      {/* 
          NAVBAR: Glassmorphism effect, 
          transparent on black hero, 
          white-solid on white sections 
      */}
      <Navbar />

      {/* 
          HERO: The only black section 
          with the rich animated background 
      */}
      <Hero />

      {/* 
          SUBSEQUENT SECTIONS: 
          All white backgrounds as requested 
      */}
      <div className="relative z-10 bg-white">
        <Features />
        <Pricing />
        <Footer />
      </div>
    </main>
  );
}
