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

function SectionLoader() {
  return (
    <div className="w-full h-40 animate-pulse rounded-2xl"
      style={{ background: "color-mix(in srgb, var(--muted) 50%, transparent)" }} />
  );
}

const SmoothScrollingUI = dynamic(() => import("./landing/components/SmoothScrollingUI"), { ssr: false });
const FeaturesOverview = dynamic(() => import("./landing/components/FeaturesOverview"), { loading: () => <SectionLoader /> });
const BioLinkShowcase = dynamic(() => import("./landing/components/BioLinkShowcase"), { loading: () => <SectionLoader /> });
const DMAutomationShowcase = dynamic(() => import("./landing/components/DMAutomationShowcase"), { loading: () => <SectionLoader /> });
const MotiveSection = dynamic(() => import("./landing/components/MotiveSection"), { loading: () => <SectionLoader /> });
const Features = dynamic(() => import("./landing/components/Features"), { loading: () => <SectionLoader /> });
const ScrollWritingSection = dynamic(() => import("./landing/components/ScrollWritingSection"), { loading: () => <SectionLoader /> });
const TrendyStacks = dynamic(() => import("./landing/components/TrendyStacks"), { loading: () => <SectionLoader /> });
const CreatorProof = dynamic(() => import("./landing/components/CreatorProof"), { loading: () => <SectionLoader /> });
const Testimonials = dynamic(() => import("./landing/components/Testimonials"), { loading: () => <SectionLoader /> });
const Pricing = dynamic(() => import("./landing/components/Pricing"), { loading: () => <SectionLoader /> });
const FAQ = dynamic(() => import("./landing/components/FAQ"), { loading: () => <SectionLoader /> });
const Footer = dynamic(() => import("./landing/components/Footer"), { loading: () => <SectionLoader /> });
const GrowthSections = dynamic(() => import("./landing/components/GrowthSections"), { loading: () => <SectionLoader /> });
const TrustAndFinalCTA = dynamic(() => import("./landing/components/TrustAndFinalCTA"), { loading: () => <SectionLoader /> });
const PerformanceChart = dynamic(() => import("./landing/components/PerformanceChart"), { loading: () => <SectionLoader /> });
const StepsSection = dynamic(() => import("./landing/components/StepsSection"), { loading: () => <SectionLoader /> });
const BlogSection = dynamic(() => import("./landing/components/BlogSection"), { loading: () => <SectionLoader /> });

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
      // landingPageEnabled is normalized to boolean by Redux normalizeGeneralSettings()
      if (general.landingPageEnabled === false) {
        router.replace("/auth/sign-in");
      }
    }
  }, [isInitialized, isAuthenticated, general, router]);

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
          <DMAutomationShowcase />
          <MotiveSection />
          <Features />
          <ScrollWritingSection />
          <PerformanceChart />
          <div id="solutions">
            {/* <GrowthSections /> */}
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
