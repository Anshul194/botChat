"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchGeneralSettings } from "../store/slices/settingsSlice";
import dynamic from "next/dynamic";
import PageMeta from "@/components/PageMeta";
import Navbar from "./landing/components/Navbar";
import Hero from "./landing/components/Hero";

// Heavy sections are code-split for performance
const SmoothScrollingUI = dynamic(() => import("./landing/components/SmoothScrollingUI"), { ssr: false });
const FeaturesOverview   = dynamic(() => import("./landing/components/FeaturesOverview"));
const Features           = dynamic(() => import("./landing/components/Features"));
const TrendyStacks       = dynamic(() => import("./landing/components/TrendyStacks"));
const Testimonials       = dynamic(() => import("./landing/components/Testimonials"));
const Pricing            = dynamic(() => import("./landing/components/Pricing"));
const FAQ                = dynamic(() => import("./landing/components/FAQ"));
const Footer             = dynamic(() => import("./landing/components/Footer"));

// Legacy sections kept for backwards-compat (shown only when content exists)
const BioLinkShowcase      = dynamic(() => import("./landing/components/BioLinkShowcase"));
const DMAutomationShowcase = dynamic(() => import("./landing/components/DMAutomationShowcase"));
const MotiveSection        = dynamic(() => import("./landing/components/MotiveSection"));
const ScrollWritingSection = dynamic(() => import("./landing/components/ScrollWritingSection"));
const PerformanceChart     = dynamic(() => import("./landing/components/PerformanceChart"));
const CreatorProof         = dynamic(() => import("./landing/components/CreatorProof"));
const BlogSection          = dynamic(() => import("./landing/components/BlogSection"));
const TrustAndFinalCTA     = dynamic(() => import("./landing/components/TrustAndFinalCTA"));

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const { general } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    if (isAuthenticated && !general) {
      dispatch(fetchGeneralSettings({}));
    }
  }, [isAuthenticated, general, dispatch]);

  useEffect(() => {
    if (isInitialized && isAuthenticated && general) {
      if (general.landingPageEnabled === false) {
        router.replace("/auth/sign-in");
      }
    }
  }, [isInitialized, isAuthenticated, general, router]);

  return (
    <>
      <PageMeta
        title="BotChat — AI-Powered Social Media Automation Platform"
        description="Manage Facebook, Instagram, WhatsApp & Telegram from one platform. Smart Inbox, AI Bot Builder, Social Posting, Bio Links, Broadcast Campaigns and Analytics. Trusted by 11,000+ creators and agencies. Fully Meta compliant."
      />
      <main className="min-h-screen w-full selection:bg-[#FF2D78]/20 selection:text-[#FF2D78]">
        <SmoothScrollingUI />
        <Navbar />

        {/* ── HERO ─────────────────────────────────────────── */}
        <Hero />

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="relative z-10">

          {/* Platform Modules — immediately after hero */}
          <div id="modules">
            <FeaturesOverview />
          </div>

          {/* Legacy showcase sections — rich storytelling */}
          <BioLinkShowcase />
          <DMAutomationShowcase />
          <MotiveSection />
          <ScrollWritingSection />

          {/* Registry-powered features grid */}
          <div id="features">
            <Features />
          </div>

          {/* Performance metrics */}
          <PerformanceChart />

          {/* Integrations + Stats */}
          <div id="integrations">
            <TrendyStacks />
          </div>

          {/* Social proof */}
          <CreatorProof />
          <Testimonials />

          {/* Blog */}
          <BlogSection />

          {/* Dynamic pricing preview */}
          <div id="pricing">
            <Pricing />
          </div>

          {/* FAQ */}
          <div id="faq">
            <FAQ />
          </div>

          {/* Final CTA */}
          <div id="company">
            <TrustAndFinalCTA />
          </div>

          <Footer />
        </div>
      </main>
    </>
  );
}
