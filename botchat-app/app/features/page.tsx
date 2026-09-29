"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Zap, BarChart3, Link2, Users,
    Radio, Bot, FileText, Image as ImageIcon, ArrowRight,
    CheckCircle2, Shield, MessageCircle, Layers, Mail,
    Cpu, MousePointer2, Sparkles, ChevronRight, Play, Check
} from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";

// Real features matching MegaDM product and y.webp
const CORE_FEATURES = [
    {
        icon: MessageSquare,
        title: "Smart Unified Inbox",
        tag: "Core Platform",
        color: "#FF2D78",
        description: "Manage every Instagram and Facebook conversation from one unified, blazing-fast inbox. Features AI Reply suggestions, lead tagging, and one-click team assignment.",
        bullets: [
            "All · Unread · Starred · Archived filtered tabs",
            "Unified Facebook & Instagram inbox stream",
            "One-click AI smart response suggestions",
            "Live team member conversation assignment"
        ],
    },
    {
        icon: Bot,
        title: "Visual Flow Builder",
        tag: "No-Code Automation",
        color: "#7C3AED",
        description: "Design conversational journeys with an intuitive drag-and-drop canvas. Chain triggers, messages, condition branches, and delay timers with zero coding.",
        bullets: [
            "Drag-and-drop visual node workflow builder",
            "Trigger on DMs, Post Comments, and Story Mentions",
            "Smart conditional logic (If / Else branching)",
            "Configurable delay nodes and user input collection"
        ],
    },
    {
        icon: Cpu,
        title: "24/7 AI Agent",
        tag: "Artificial Intelligence",
        color: "#0EA5E9",
        description: "Deploy an intelligent assistant trained on your business knowledge. It answers product questions, shares pricing, guides shoppers, and closes leads around the clock.",
        bullets: [
            "Trained directly on your business catalog & FAQs",
            "Instant answers for Product Details, Pricing & Support",
            "Automatic graceful handoff to human agents",
            "Speaks naturally in your brand's unique tone of voice"
        ],
    },
    {
        icon: FileText,
        title: "Ready-Made Templates",
        tag: "Instant Setup",
        color: "#10B981",
        description: "Launch proven growth funnels in seconds. Choose from curated templates for welcome greetings, lead magnets, order tracking, and sales inquiries.",
        bullets: [
            "Welcome greeting & FAQ instant responders",
            "Product inquiry, pricing details & discount reveals",
            "Order updates, customer support & ticket flows",
            "View catalog automation with instant CTA links"
        ],
    },
    {
        icon: ImageIcon,
        title: "Rich Message Types",
        tag: "Interactive Messaging",
        color: "#F59E0B",
        description: "Engage your followers with high-converting rich media inside DMs: product carousels, downloadable PDFs, clickable CTA buttons, videos, and audio clips.",
        bullets: [
            "High-resolution photos, videos, and voice notes",
            "Downloadable PDF guides, price lists, and invoices",
            "Interactive quick-reply buttons and website CTAs",
            "Multi-card swipeable product carousels"
        ],
    },
    {
        icon: Users,
        title: "Audience Management & CRM",
        tag: "Lead Intelligence",
        color: "#EC4899",
        description: "Turn every conversation into an organized contact record. Capture names, emails, phone numbers, custom tags, and notes to build an owned customer database.",
        bullets: [
            "Auto-capture First Name, Email, and Phone number",
            "Segment audiences by purchase intent and behavior tags",
            "Filterable contact directory with custom metadata",
            "One-click CSV export and seamless webhook sync"
        ],
    },
    {
        icon: Radio,
        title: "Broadcast Messaging",
        tag: "Targeted Outreach",
        color: "#E1306C",
        description: "Send announcements, product drops, and exclusive discounts to your active followers within Meta's official 24-hour messaging window.",
        bullets: [
            "Send to laser-focused audience segments",
            "Include rich media, coupon codes, and action buttons",
            "Real-time delivery, open, and response rate tracking",
            "100% compliant with Meta messaging policies"
        ],
    },
    {
        icon: BarChart3,
        title: "Analytics & Growth Reports",
        tag: "Actionable Insights",
        color: "#6366F1",
        description: "Monitor Total Flows, Total Messages Sent, and Engagement Rates in real-time. Understand follower behavior and continuously optimize your sales funnel.",
        bullets: [
            "Live overview: Total Flows, Messages, and Conversion Rate",
            "Daily & weekly message volume trend graphs",
            "Automation node completion & drop-off analytics",
            "Downloadable executive performance summaries"
        ],
    },
    {
        icon: Layers,
        title: "Customizable Bio Links",
        tag: "Conversion Hub",
        color: "#FF2D78",
        description: "Build high-converting link-in-bio pages matching your brand aesthetics. Showcase your top videos, podcasts, digital store, and lead forms in one link.",
        bullets: [
            "Multiple sleek, responsive theme layouts",
            "Custom brand colors, typography, and avatar styles",
            "Integrated social icons and featured media players",
            "Direct in-bio lead capture connected to your inbox"
        ],
    },
    {
        icon: Link2,
        title: "Multi-Page Management",
        tag: "Scale & Agency",
        color: "#1877F2",
        description: "Connect unlimited Instagram accounts and Facebook Pages to a single dashboard. Switch between brands or manage client accounts without logging out.",
        bullets: [
            "Connect unlimited Facebook Pages & Instagram handles",
            "Dedicated automation rules and inboxes per account",
            "Unified team collaboration with role permissions",
            "Ideal for agencies, multi-brand creators, and e-commerce"
        ],
    },
    {
        icon: Mail,
        title: "Lead Generation & Email Capture",
        tag: "List Growth",
        color: "#059669",
        description: "Automatically collect validated emails and phone numbers straight from Instagram & Facebook chats without taking users away to clunky external forms.",
        bullets: [
            "In-chat email validation and phone format checks",
            "Automatic CRM contact creation and tag assignment",
            "Instant notification to team when high-value leads arrive",
            "Direct integration with email marketing providers"
        ],
    },
    {
        icon: Shield,
        title: "Official Meta API & Security",
        tag: "Enterprise Safety",
        color: "#7C3AED",
        description: "MegaDM is built strictly on Meta's Official Messenger & Instagram Graph APIs. No browser extensions, no unofficial scrapers, and zero account ban risk.",
        bullets: [
            "100% compliant with official Meta Platform Terms",
            "99.9% uptime SLA with enterprise-grade stability",
            "End-to-end encrypted token storage and data protection",
            "Strict GDPR, CCPA, and Meta data privacy adherence"
        ],
    },
];

export default function FeaturesPage() {
    const [activeFeature, setActiveFeature] = useState(0);
    const feature = CORE_FEATURES[activeFeature];

    return (
        <>
            <PageMeta
                title="Features — MegaDM | Instagram & Facebook Automation Platform"
                description="Explore every MegaDM feature: AI-powered DM automation, Visual Flow Builder, Smart Inbox, Broadcasting, Bio Links, Analytics and more. Built on Meta's Official API."
            />
            <main className="min-h-screen" style={{ background: '#06000d', color: '#ffffff' }}>
                <Navbar />

                {/* HERO SECTION */}
                <section className="relative pt-44 sm:pt-52 pb-16 overflow-hidden">
                    {/* Background glow effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-5%] w-[650px] h-[650px] rounded-full blur-[140px]" style={{ background: 'rgba(255,45,120,0.18)' }} />
                        <div className="absolute top-[15%] right-[-5%] w-[550px] h-[550px] rounded-full blur-[130px]" style={{ background: 'rgba(124,58,237,0.14)' }} />
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.08 }} />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
                        <motion.div initial={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
                            {/* Top Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,45,120,0.14)', border: '1px solid rgba(255,45,120,0.35)' }}>
                                <Sparkles className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                                <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>
                                    All-in-One Platform Features
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 style={{ fontSize: 'clamp(38px, 6.5vw, 80px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: '22px' }}>
                                One Platform.<br />
                                <span style={{ background: 'linear-gradient(to right, #FF2D78, #FF80AB, #E1306C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    Infinite Growth.
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.92)', maxWidth: '680px', lineHeight: 1.65, fontWeight: 500, marginBottom: '32px' }}>
                                Automate conversations, manage multiple pages, broadcast messages, create stunning bio link pages, and grow your audience — all in one powerful workspace.
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                                <Link
                                    href="/auth/sign-up"
                                    className="group inline-flex items-center justify-center gap-2.5 px-8 rounded-full font-bold text-base text-white transition-all hover:scale-105 whitespace-nowrap"
                                    style={{
                                        background: 'linear-gradient(135deg, #FF2D78, #E1306C)',
                                        boxShadow: '0 12px 35px rgba(255,45,120,0.4)',
                                        height: '52px',
                                        lineHeight: 1,
                                    }}
                                >
                                    <span>Start Free Trial</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center justify-center gap-2.5 px-8 rounded-full font-bold text-base transition-all hover:scale-105 whitespace-nowrap"
                                    style={{
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1.5px solid rgba(255,255,255,0.22)',
                                        color: '#ffffff',
                                        height: '52px',
                                        lineHeight: 1,
                                    }}
                                >
                                    <Play className="w-4 h-4" style={{ color: '#FF2D78' }} />
                                    <span>View Pricing</span>
                                </Link>
                            </div>

                            {/* Trust badge: Official API Only */}
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold mb-12" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', color: '#ffffff' }}>
                                <Shield className="w-4 h-4 shrink-0" style={{ color: '#10B981' }} />
                                <span>Built on Meta&apos;s Official API</span>
                            </div>
                        </motion.div>

                        {/* PRODUCT IMAGE: y.webp — Desktop big & crisp, Mobile scaled nicely */}
                        <motion.div
                            initial={{ opacity: 1, y: 0 }}
                            className="relative mx-auto w-full max-w-6xl mt-4"
                        >
                            {/* Ambient Glow */}
                            <div
                                className="absolute -inset-2 rounded-3xl blur-[60px] pointer-events-none opacity-40"
                                style={{ background: 'radial-gradient(ellipse at center, rgba(255,45,120,0.35), rgba(124,58,237,0.15), transparent 70%)' }}
                            />

                            {/* Clean Image Frame: Fully visible without any bottom blackout gradient */}
                            <div
                                className="relative rounded-2xl md:rounded-3xl overflow-hidden"
                                style={{
                                    border: '1.5px solid rgba(255,255,255,0.18)',
                                    boxShadow: '0 30px 90px rgba(0,0,0,0.8), 0 0 40px rgba(255,45,120,0.15)',
                                    background: '#0e0319'
                                }}
                            >
                                <Image
                                    src="/y.webp"
                                    alt="MegaDM All-in-One Platform for Instagram and Facebook Growth"
                                    width={1400}
                                    height={933}
                                    className="w-full h-auto block"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 95vw, 1200px"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* INTERACTIVE FEATURE SHOWCASE */}
                <section className="py-20 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)' }}>
                                <Zap className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                                <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>Interactive Breakdown</span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '14px' }}>
                                Explore Every Power Feature
                            </h2>
                            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.90)', maxWidth: '620px', margin: '0 auto', fontWeight: 500 }}>
                                Click on any feature below to see how it drives real conversations and revenue on Instagram & Facebook.
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Feature Navigation List */}
                            <div className="w-full lg:w-[42%] space-y-2.5">
                                {CORE_FEATURES.map((f, i) => {
                                    const Icon = f.icon;
                                    const isActive = i === activeFeature;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setActiveFeature(i)}
                                            className="w-full text-left flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 cursor-pointer"
                                            style={isActive
                                                ? { background: 'rgba(255,45,120,0.15)', border: '1.5px solid #FF2D78', boxShadow: '0 8px 24px rgba(255,45,120,0.2)' }
                                                : { background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)' }
                                            }
                                        >
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform"
                                                style={{ background: isActive ? f.color : 'rgba(255,255,255,0.1)' }}
                                            >
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate" style={{ color: '#ffffff' }}>
                                                    {f.title}
                                                </div>
                                                <div className="text-xs font-semibold mt-0.5" style={{ color: isActive ? '#FF80AB' : 'rgba(255,255,255,0.75)' }}>
                                                    {f.tag}
                                                </div>
                                            </div>
                                            <ChevronRight
                                                className="w-4 h-4 shrink-0 transition-transform"
                                                style={{ color: isActive ? '#FF2D78' : 'rgba(255,255,255,0.4)', transform: isActive ? 'translateX(3px)' : 'none' }}
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Feature Detail Card */}
                            <div className="w-full lg:w-[58%] lg:sticky lg:top-28">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeFeature}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.2 }}
                                        className="rounded-3xl p-6 sm:p-9"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(255,45,120,0.12), rgba(255,255,255,0.06))',
                                            border: `1.5px solid ${feature.color}50`,
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: feature.color }}>
                                                <feature.icon className="w-7 h-7 text-white" />
                                            </div>
                                            <div>
                                                <span
                                                    className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
                                                    style={{ background: 'rgba(255,255,255,0.12)', color: '#ffffff', border: `1px solid ${feature.color}60` }}
                                                >
                                                    {feature.tag}
                                                </span>
                                                <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
                                                    {feature.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.92)', lineHeight: 1.7, fontWeight: 500, marginBottom: '28px' }}>
                                            {feature.description}
                                        </p>

                                        <div className="space-y-3.5 mb-8">
                                            {feature.bullets.map((b, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: feature.color }} />
                                                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>{b}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                                            <Link
                                                href="/auth/sign-up"
                                                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white transition-all hover:scale-105"
                                                style={{ background: feature.color, boxShadow: `0 8px 24px ${feature.color}50` }}
                                            >
                                                Try {feature.title} <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PLATFORM ARCHITECTURE SECTION */}
                <section className="py-24 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                            {/* Left Text */}
                            <div className="lg:w-1/2">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.25)' }}>
                                    <MessageCircle className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                                    <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>Official Meta Partner Architecture</span>
                                </div>
                                <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.12, marginBottom: '20px' }}>
                                    Instagram & Facebook.<br />
                                    <span style={{ background: 'linear-gradient(to right, #FF2D78, #FF80AB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                        Automated the Right Way.
                                    </span>
                                </h2>
                                <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.92)', fontWeight: 500, lineHeight: 1.7, marginBottom: '32px' }}>
                                    MegaDM connects directly to Meta&apos;s Official Graph & Messenger APIs. We never ask for your account password, we don&apos;t use browser automation, and your channels remain 100% safe from shadowbans or restrictions.
                                </p>

                                <div className="space-y-3.5">
                                    {[
                                        { icon: MessageSquare, title: "Instagram DMs, Comments & Story Mentions", desc: "Instantly reply to incoming DMs, post comments, and user story tags." },
                                        { icon: Radio, title: "Facebook Messenger & Page Automations", desc: "Manage Page conversations, auto-reply to comments, and drive sales." },
                                        { icon: Shield, title: "100% Meta TOS Compliant", desc: "Zero scraping or unauthorized bots. Enterprise SLA with 99.9% uptime." },
                                        { icon: MousePointer2, title: "Comment-to-DM Growth Engine", desc: "Automatically send links and coupons whenever someone comments on your posts or reels." },
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 p-4 rounded-2xl"
                                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                                        >
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,45,120,0.18)' }}>
                                                <item.icon className="w-5 h-5" style={{ color: '#FF2D78' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>{item.title}</div>
                                                <div style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.82)' }}>{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Visual: Clean framed highlight */}
                            <div className="lg:w-1/2 w-full">
                                <div
                                    className="relative rounded-2xl overflow-hidden"
                                    style={{
                                        border: '1.5px solid rgba(255,255,255,0.15)',
                                        boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
                                        background: '#0d0216'
                                    }}
                                >
                                    <Image
                                        src="/y.webp"
                                        alt="MegaDM Feature Suite Overview"
                                        width={900}
                                        height={600}
                                        className="w-full h-auto block"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 12-FEATURE COMPLETE GRID */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '14px' }}>
                                All 12 MegaDM Core Features
                            </h2>
                            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.90)', maxWidth: '540px', margin: '0 auto', fontWeight: 500 }}>
                                Built to scale creators, agencies, e-commerce stores, and service businesses.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {CORE_FEATURES.map((f, i) => {
                                const Icon = f.icon;
                                return (
                                    <div
                                        key={i}
                                        className="p-6 rounded-3xl transition-all duration-300"
                                        style={{
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.12)'
                                        }}
                                        onMouseEnter={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.background = 'rgba(255,45,120,0.12)';
                                            el.style.borderColor = 'rgba(255,45,120,0.4)';
                                            el.style.transform = 'translateY(-3px)';
                                        }}
                                        onMouseLeave={e => {
                                            const el = e.currentTarget as HTMLDivElement;
                                            el.style.background = 'rgba(255,255,255,0.06)';
                                            el.style.borderColor = 'rgba(255,255,255,0.12)';
                                            el.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${f.color}25` }}>
                                            <Icon className="w-6 h-6" style={{ color: f.color }} />
                                        </div>
                                        <div className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: '#FF80AB' }}>
                                            {f.tag}
                                        </div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
                                            {f.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                                            {f.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* BOTTOM CTA SECTION */}
                <section className="py-28 relative overflow-hidden" style={{ background: '#03000a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[140px]" style={{ background: 'rgba(255,45,120,0.2)' }} />
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: 'rgba(255,45,120,0.14)', border: '1px solid rgba(255,45,120,0.35)' }}>
                            <Sparkles className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                            <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>Start Growing Today</span>
                        </div>

                        <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '22px' }}>
                            Ready to Automate<br />Your Instagram & Facebook?
                        </h2>

                        <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.92)', fontWeight: 500, marginBottom: '40px' }}>
                            Join thousands of creators, brands, and agencies already scaling with MegaDM.<br />
                            Set up your first automation in under 3 minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/auth/sign-up"
                                className="group inline-flex items-center justify-center gap-2.5 px-9 rounded-full font-bold text-base text-white transition-all hover:scale-105 whitespace-nowrap"
                                style={{
                                    background: 'linear-gradient(135deg, #FF2D78, #E1306C)',
                                    boxShadow: '0 20px 50px rgba(255,45,120,0.45)',
                                    height: '54px',
                                    lineHeight: 1,
                                }}
                            >
                                <span>Start Free Trial</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center gap-2.5 px-9 rounded-full font-bold text-base transition-all hover:scale-105 whitespace-nowrap"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1.5px solid rgba(255,255,255,0.25)',
                                    color: '#ffffff',
                                    height: '54px',
                                    lineHeight: 1,
                                }}
                            >
                                View Pricing
                            </Link>
                        </div>

                        {/* Clear Trust Notice */}
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginTop: '28px', fontWeight: 600 }}>
                            Built on Meta&apos;s Official API
                        </p>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
}
