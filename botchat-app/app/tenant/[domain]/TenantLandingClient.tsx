"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { shallowEqual } from "react-redux";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

// Dynamically import Simulator with ssr: false to prevent hydration mismatches
const Simulator = dynamic(() => import("../../landing/components/Simulator"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center rounded-3xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
    </div>
  ),
});

/* ─── Inline SVG icons ─── */
const Check = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 6 9 17l-5-5"/></svg>
);
const Zap = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const Shield = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
);
const Clock = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const ChevronDown = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
const Menu = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const X = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const Send = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/></svg>
);
const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

/* ─── Navigation Links ─── */
const NAV_ITEMS = [
  { label: "Features", href: "#workflow" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact Us", href: "#contact-us" },
];

const STEPS = [
  { n: "01", title: "Connect Account", desc: "Link your Instagram or Facebook account in 2 clicks. No complex setup required." },
  { n: "02", title: "Set Trigger", desc: "Choose your keyword trigger. When someone comments it, MegaDM responds instantly." },
  { n: "03", title: "Automate DM", desc: "Send your link, free guide, or product link automatically in 0.8 seconds." },
  { n: "04", title: "Scale Revenue", desc: "Watch conversion rates surge as automation handles 100% of your incoming traffic." },
];

const FEATURES = [
  { icon: Clock, title: "Smart Delays", desc: "Natural delays between responses so Meta algorithms never flag your account." },
  { icon: Zap, title: "Human-like Flow", desc: "Typing indicators and natural delays make interactions feel genuinely personal." },
  { icon: Shield, title: "100% Meta Compliant", desc: "Built exclusively on Meta's official API. Your accounts remain completely safe." },
];

const PRICING = [
  { name: "Starter", price: "₹99", period: "/mo", desc: "For creators & solos", highlight: false, badge: null, features: ["1 Instagram Account", "Basic Automations", "Comment & DM Automation", "Email Support"] },
  { name: "Pro", price: "₹499", period: "/mo", desc: "Everything to scale faster", highlight: true, badge: "Most Popular", features: ["5 Instagram Accounts", "Advanced Automations", "Story & Reel Automation", "Priority Support"] },
  { name: "Agency", price: "₹999", period: "/mo", desc: "For teams & agencies", highlight: false, badge: null, features: ["10 Instagram Accounts", "Unlimited Automations", "Team Access", "Priority Support"] },
];

const FAQS = [
  { q: "Is MegaDM safe to use?", a: "Yes, 100%. MegaDM operates strictly on Meta's official Graph API and adheres to all compliance guidelines." },
  { q: "Do you use official Meta APIs?", a: "Yes. We use official Instagram & Facebook Graph APIs. No passwords needed, no dangerous scraping." },
  { q: "Can I automate story and reel replies?", a: "Yes! Pro and Agency plans include story reactions, reel comments, and bio-link trigger automations." },
  { q: "Will my account get restricted?", a: "No. Our built-in rate limit protection and human timing engine keep your account safe at all times." },
  { q: "Can I connect multiple accounts?", a: "Yes! Depending on your plan, you can manage 1 to 10+ social accounts seamlessly." },
];

const TESTIMONIALS = [
  { name: "Rahul Sharma", handle: "@rahul_brands", text: "Grew my DM lead rate by 10x in the first week. Incredible ROI for our store.", stars: 5 },
  { name: "Priya Kapoor", handle: "@priya.coach", text: "Saved over 15 hours a week replying to 'LINK' comments manually. Game changer!", stars: 5 },
  { name: "Vikram Nair", handle: "@vikram.agency", text: "We run 8 client accounts on MegaDM. The setup is fast, reliable, and completely hands-free.", stars: 5 },
];

/* ─── Navbar ─── */
function Navbar({ open, setOpen, tenantData }: { open: boolean; setOpen: (v: boolean) => void; tenantData: TenantData }) {
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { isAuthenticated, user } = useAppSelector((state) => ({ isAuthenticated: state.auth.isAuthenticated, user: state.auth.user }), shallowEqual);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const companyName = tenantData.branding?.company_name || 'MegaDM';
  const logo = tenantData.branding?.logo;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-3.5 sm:px-6 pt-3 sm:pt-5 pointer-events-none">
      <nav
        className="pointer-events-auto w-full max-w-5xl flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl transition-all duration-300 relative"
        style={{
          background: scrolled ? "rgba(6,0,13,0.92)" : "rgba(6,0,13,0.60)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div className="flex items-center gap-2.5">
          {logo ? (
            <img src={logo} alt={companyName} className="h-7 sm:h-8 rounded object-contain max-w-[120px]" />
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)" }}>
              <Send className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-black text-base text-white tracking-tight">{companyName}</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold transition-colors hover:text-white"
              style={{ color: "rgba(255,255,255,0.70)" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4 relative">
          {!isAuthenticated ? (
            <>
              <a href="/auth/sign-in" className="text-sm font-semibold transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.70)" }}>
                Sign In
              </a>
              <a
                href={tenantData.landing_page?.cta_text ? "/auth/sign-up" : "/auth/sign-up"}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)", boxShadow: "0 4px 18px rgba(255,45,120,0.35)" }}
              >
                {tenantData.landing_page?.cta_text || 'Get Started'} →
              </a>
            </>
          ) : (
            <div>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center p-1 rounded-full border transition-all bg-white/10 border-white/10 text-white"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF2D78] to-[#E1306C] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                  {(user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
                </div>
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 p-2 rounded-2xl bg-white border border-gray-100 shadow-2xl z-[60] animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-4 py-3 border-b border-gray-50 mb-2">
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <a
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </a>
                  <button
                    onClick={() => {
                      dispatch(logoutUser());
                      router.push('/');
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white/80 transition-colors" aria-label="Toggle menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div
          className="absolute top-16 sm:top-20 inset-x-3.5 sm:inset-x-6 z-40 p-5 rounded-2xl border shadow-2xl pointer-events-auto md:hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: "rgba(10,1,20,0.98)", borderColor: "rgba(255,255,255,0.10)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex flex-col gap-3.5">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold hover:text-white transition-colors py-1"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {item.label}
              </a>
            ))}
            <div className="h-px my-1" style={{ background: "rgba(255,255,255,0.10)" }} />
            {!isAuthenticated ? (
              <>
                <a
                  href="/auth/sign-in"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-xl font-semibold text-white/80 hover:text-white border border-white/10 text-sm transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/auth/sign-up"
                  onClick={() => setOpen(false)}
                  className="text-center py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 shadow-md"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)" }}
                >
                  {tenantData.landing_page?.cta_text || 'Get Started'} →
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-xl font-semibold text-white/80 hover:text-white border border-white/10 text-sm flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </a>
                <button
                  onClick={() => {
                    setOpen(false);
                    dispatch(logoutUser());
                    router.push('/');
                  }}
                  className="text-center py-2.5 rounded-xl font-semibold text-red-400 hover:text-red-300 border border-red-500/20 text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Badge Pill ─── */
function SectionBadge({ children, isDark }: { children: React.ReactNode; isDark?: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm"
      style={
        isDark
          ? { background: "rgba(255,45,120,0.12)", border: "1px solid rgba(255,45,120,0.25)", color: "#ff80ab" }
          : { background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.20)", color: "#FF2D78" }
      }
    >
      {children}
    </div>
  );
}

export interface TenantData {
  tenant: { id: number; name?: string; slug?: string };
  domain: { hostname: string };
  branding: {
    logo?: string;
    favicon?: string;
    primary_color?: string;
    company_name?: string;
    tagline?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  pricing: any[];
  faqs: any[];
  landing_page: {
    enabled: boolean;
    hero_title?: string;
    hero_description?: string;
    cta_text?: string;
  };
}

/* ─── Reseller Landing Page ─── */
export default function TenantLandingClient({ tenantData }: { tenantData: TenantData }) {
  const [open, setOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen" style={{ background: "#06000d" }} />;
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#06000d", color: "#f0e0f0" }}>
      <Navbar open={open} setOpen={setOpen} tenantData={tenantData} />

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 1: HERO — DARK (#06000d)                      */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #06000d 0%, #0a0114 100%)" }}>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] sm:w-[600px] md:w-[750px] h-[220px] sm:h-[360px] md:h-[450px] pointer-events-none max-w-full"
          style={{ background: "radial-gradient(ellipse, rgba(255,45,120,0.14) 0%, transparent 65%)", filter: "blur(50px)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div>
            <SectionBadge isDark>⚡ AI-Powered Automation</SectionBadge>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.12] sm:leading-[1.08] tracking-tight mb-4 sm:mb-6 text-white">
              {tenantData.landing_page?.hero_title || (
                <>
                  The Best Auto DM Tool<br className="hidden sm:inline" />
                  {" "}for{" "}
                  <span style={{ background: "linear-gradient(135deg, #FF2D78 0%, #ff80ab 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Instagram &amp; Facebook
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto font-medium px-2 sm:px-0" style={{ color: "rgba(255,255,255,0.60)" }}>
              {tenantData.landing_page?.hero_description || "Auto DMs from comments, stories & messages. Turn engagement into conversations, leads & customers — automatically."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-10 w-full max-w-xs sm:max-w-none mx-auto">
              <a
                href="/auth/sign-up"
                className="w-full sm:w-auto text-center px-8 py-3.5 rounded-2xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-95 shadow-lg"
                style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)", boxShadow: "0 8px 28px rgba(255,45,120,0.40)" }}
              >
                Get Started Free →
              </a>
              <a
                href="#simulator"
                className="w-full sm:w-auto text-center px-7 py-3.5 rounded-2xl font-semibold text-base hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.80)" }}
              >
                See Live Demo ↓
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              {["Built on Meta's official API", "No bans — human delay engine", "11,000+ creators trust us"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs sm:text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,45,120,0.15)", border: "1px solid rgba(255,45,120,0.35)" }}>
                    <Check className="w-2.5 h-2.5" style={{ color: "#ff80ab" }} />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 2: THE WORKFLOW — ELEGANT WHITE (bg-white)    */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="workflow" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none max-w-full" style={{ background: "rgba(255,45,120,0.04)", filter: "blur(90px)" }} />

        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center mb-10 sm:mb-16">
            <SectionBadge>The Workflow</SectionBadge>
            <h2 className="font-black text-black leading-tight mb-3 sm:mb-4 text-2xl sm:text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              Four simple steps to <span style={{ color: "#FF2D78" }}>hyper-growth.</span>
            </h2>
            <p className="text-sm sm:text-base font-medium max-w-md mx-auto" style={{ color: "#6b7280" }}>
              Set up in under 5 minutes. Let automation handle 100% of your incoming engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 w-full"
                style={{ background: "#fffdfd", border: "1px solid rgba(255,45,120,0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
              >
                <div className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3" style={{ color: "rgba(255,45,120,0.20)" }}>
                  {step.n}
                </div>
                <h3 className="text-base font-black text-black mb-1.5">{step.title}</h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "#4b5563" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 3: LIVE SIMULATOR — DARK (#0a0114)             */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="simulator" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0114 0%, #0d0617 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center mb-10 sm:mb-14">
            <SectionBadge isDark>✨ Interactive Demo</SectionBadge>
            <h2 className="font-black text-white mb-3 sm:mb-4 text-2xl sm:text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              Watch it work in{" "}
              <span style={{ background: "linear-gradient(135deg, #FF2D78, #ff80ab)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                real time
              </span>
            </h2>
            <p className="text-sm sm:text-base font-medium max-w-md mx-auto px-2 sm:px-0" style={{ color: "rgba(255,255,255,0.55)" }}>
              Comment → DM → Follow gate → Reward delivery. Instant and 100% automated.
            </p>
          </div>

          <Simulator />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 4: FEATURES — ELEGANT WHITE (bg-white)        */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center mb-10 sm:mb-14">
            <SectionBadge>Why MegaDM</SectionBadge>
            <h2 className="font-black text-black leading-tight mb-3 sm:mb-4 text-2xl sm:text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              Automation that feels <span style={{ color: "#FF2D78" }}>human.</span>
            </h2>
            <p className="text-sm sm:text-base font-medium max-w-sm mx-auto" style={{ color: "#6b7280" }}>
              Smart, safe, and indistinguishable from real manual engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {FEATURES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 w-full"
                  style={{ background: "#fafafa", border: "1px solid #f0e6ed", boxShadow: "0 4px 16px rgba(0,0,0,0.02)" }}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-4 sm:mb-5" style={{ background: "rgba(255,45,120,0.08)", color: "#FF2D78" }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-black mb-1.5 sm:mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "#4b5563" }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 5: TESTIMONIALS — DARK (#06000d)              */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #06000d 0%, #0a0114 100%)" }}>
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center mb-10 sm:mb-12">
            <SectionBadge isDark>✨ Social Proof</SectionBadge>
            <h2 className="font-black text-white leading-tight text-2xl sm:text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              Loved by{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ff80ab, #FF2D78)" }}>
                top creators
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl w-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array(t.stars)
                    .fill(0)
                    .map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5" style={{ color: "#fbbf24" }} />
                    ))}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed mb-4 font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
                  &quot;{t.text}&quot;
                </p>
                <div className="text-sm font-bold text-white">{t.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
                  {t.handle}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 6: PRICING — ELEGANT WHITE (bg-white)         */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto w-full">
          <div className="text-center mb-10 sm:mb-16">
            <SectionBadge>Pricing</SectionBadge>
            <h2 className="font-black text-black leading-tight mb-2 sm:mb-3 text-2xl sm:text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              Simple, <span style={{ color: "#FF2D78" }}>transparent</span> pricing.
            </h2>
            <p className="text-sm sm:text-base font-medium" style={{ color: "#6b7280" }}>
              No hidden fees. Upgrade or cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full items-stretch">
            {(tenantData.pricing && tenantData.pricing.length > 0 ? tenantData.pricing : PRICING).map((plan, idx) => (
              <div
                key={idx}
                className="relative p-7 sm:p-8 rounded-3xl transition-all duration-300 flex flex-col justify-between w-full min-w-0"
                style={
                  plan.is_highlighted || plan.highlight
                    ? { background: "#06000d", border: "1px solid rgba(255,45,120,0.40)", boxShadow: "0 24px 80px rgba(255,45,120,0.20)" }
                    : { background: "#fafafa", border: "1px solid #ede4ec" }
                }
              >
                <div>
                  {(plan.badge || (plan.is_highlighted && 'Recommended')) && (
                    <div
                      className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black text-white whitespace-nowrap shadow-md"
                      style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)" }}
                    >
                      {plan.badge || (plan.is_highlighted && 'Recommended')}
                    </div>
                  )}
                  <h3 className={"text-base font-black mb-1 " + (plan.is_highlighted || plan.highlight ? "text-white" : "text-black")}>{plan.name}</h3>
                  <p className="text-xs sm:text-sm mb-5" style={{ color: plan.is_highlighted || plan.highlight ? "rgba(255,255,255,0.60)" : "#6b7280" }}>
                    {plan.description || plan.desc}
                  </p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={"text-4xl sm:text-5xl font-black " + (plan.is_highlighted || plan.highlight ? "text-white" : "text-black")}>
                      {plan.price != null && !isNaN(plan.price) ? `₹${plan.price}` : plan.price}
                    </span>
                    <span className="text-sm font-medium" style={{ color: plan.is_highlighted || plan.highlight ? "rgba(255,255,255,0.60)" : "#6b7280" }}>
                      {plan.period || (plan.duration_type ? `/${plan.duration_type}` : '')}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {((plan.features && Array.isArray(plan.features)) ? plan.features.map((f: any) => f.feature_key || f) : []).map((feat: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-center gap-3 text-xs sm:text-sm font-medium" style={{ color: plan.is_highlighted || plan.highlight ? "rgba(255,255,255,0.85)" : "#374151" }}>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,45,120,0.15)", border: "1px solid rgba(255,45,120,0.35)" }}>
                          <Check className="w-2.5 h-2.5" style={{ color: "#FF2D78" }} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="/auth/sign-up"
                  className="block w-full text-center py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-98 shadow-md"
                  style={(plan.is_highlighted || plan.highlight) ? { background: "linear-gradient(135deg, #FF2D78, #E1306C)", boxShadow: "0 4px 20px rgba(255,45,120,0.35)" } : { background: "#111", color: "#fff" }}
                >
                  Get Started →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 7: FAQ — DARK (#0a0114)                       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0114 0%, #06000d 100%)" }}>
        <div className="max-w-3xl mx-auto relative z-10 w-full">
          <div className="text-center mb-10 sm:mb-12">
            <SectionBadge isDark>FAQ</SectionBadge>
            <h2 className="font-black text-white leading-tight text-2xl sm:text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              Got{" "}
              <span style={{ background: "linear-gradient(135deg, #FF2D78, #ff80ab)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                questions?
              </span>
            </h2>
          </div>

          <div className="space-y-3">
            {(tenantData.faqs && tenantData.faqs.length > 0 ? tenantData.faqs : FAQS).map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm sm:text-base font-semibold text-white pr-4">{faq.question || faq.q}</span>
                  <ChevronDown className={"w-4 h-4 flex-shrink-0 transition-transform duration-200 " + (openFaq === idx ? "rotate-180" : "rotate-0")} style={{ color: "rgba(255,255,255,0.40)" }} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-2 text-xs sm:text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.60)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {faq.answer || faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION 8: FINAL CTA — ELEGANT WHITE (bg-white)       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[200px] sm:h-[300px] rounded-full pointer-events-none max-w-full"
          style={{ background: "radial-gradient(ellipse, rgba(255,45,120,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center w-full">
          <div>
            <h2 className="font-black text-black leading-tight mb-3 sm:mb-5 text-2xl sm:text-4xl md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
              Start automating in <span style={{ color: "#FF2D78" }}>under 5 minutes.</span>
            </h2>
            <p className="text-sm sm:text-base font-medium mb-8 sm:mb-10 px-2 sm:px-0" style={{ color: "#6b7280" }}>
              No credit card required. Free 14-day trial on all plans.
            </p>
            <a
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-white transition-all hover:opacity-90 active:scale-95 shadow-xl"
              style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)", boxShadow: "0 10px 40px rgba(255,45,120,0.35)" }}
            >
              Get Started Free →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* FOOTER — DARK (#06000d)                               */}
      {/* ══════════════════════════════════════════════════════ */}
      <footer id="contact-us" className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8" style={{ background: "#06000d", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
                {tenantData.branding?.logo ? (
                  <img src={tenantData.branding.logo} alt="Logo" className="h-7 rounded object-contain max-w-[120px]" />
                ) : (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)" }}>
                    <Send className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <span className="font-black text-sm text-white">{tenantData.branding?.company_name || 'MegaDM'}</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
                {tenantData.branding?.tagline || 'Auto DM tool for Instagram & Facebook. Turn engagement into revenue — automatically.'}
              </p>
            </div>
            {[
              { title: "Quick Links", links: ["Features", "Pricing", "FAQ"] },
              { title: "Company", links: ["About", "Terms of Service", "Privacy Policy"] },
              { title: "Contact", links: [tenantData.contact?.email, tenantData.contact?.phone].filter(Boolean) },
            ].map((col, i) => (
              col.links.length > 0 ? (
                <div key={i}>
                  <h4 className="text-xs font-black uppercase tracking-widest mb-2.5 sm:mb-3" style={{ color: "rgba(255,255,255,0.30)" }}>
                    {col.title}
                  </h4>
                  <ul className="space-y-2 sm:space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l as string}>
                        <a href="#" className="text-xs sm:text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.50)" }}>
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            ))}
          </div>
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
              © 2025 MegaDM. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5" style={{ color: "#FF2D78" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>
                Powered by Meta Official API
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
