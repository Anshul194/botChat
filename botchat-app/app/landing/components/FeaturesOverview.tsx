"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Inbox, Link2, Send, Bot,
    ChevronLeft, ChevronRight, Sparkles, CheckCircle2,
    ArrowRight, ShieldCheck, Flame
} from "lucide-react";

interface FeatureCardData {
    id: string;
    title: string;
    pill: string;
    tagline: string;
    description: string;
    icon: any;
    image: string;
    color: string;
    stat: { label: string; value: string };
    highlights: string[];
    url: string;
}

const CARDS: FeatureCardData[] = [
    {
        id: "comment-automation",
        title: "Comment Automation",
        pill: "Comment-to-DM Engine",
        tagline: "Turn Post & Reel Comments into Instant Sales",
        description: "Instantly reply to comments on Instagram & Facebook posts and trigger personalized private DMs with resource links, discount codes, or booking URLs.",
        icon: MessageSquare,
        image: "/images/megadm_comment_manager_showcase.webp",
        color: "#FF2D78",
        stat: { label: "Engagement", value: "+340%" },
        highlights: [
            "Keyword triggers (PRICE, LINK, INFO)",
            "Instant multi-page comment auto-replies",
            "Auto-like comments & spam protection"
        ],
        url: "/dashboard/facebook/comment-templates"
    },
    {
        id: "smart-inbox",
        title: "Smart AI Inbox",
        pill: "Unified AI Inbox",
        tagline: "AI-Powered Lead Routing & Intent Scoring",
        description: "Manage all customer conversations across Instagram & Facebook in one place. AI automatically classifies intent, scores sentiment, and captures verified contact details.",
        icon: Inbox,
        image: "/images/megadm_smart_inbox_showcase.webp",
        color: "#C13584",
        stat: { label: "Response Time", value: "< 5s" },
        highlights: [
            "Unified Instagram & Facebook chat stream",
            "Automated email & phone lead capture",
            "Live sentiment classification & routing"
        ],
        url: "/dashboard/inbox"
    },
    {
        id: "bio-link",
        title: "Bio Link Builder",
        pill: "Bio-Link Studio",
        tagline: "High-Converting Mini-Sites for Profiles",
        description: "Design mobile-first bio link storefronts. Feature creator products, embed YouTube & Reels videos, collect subscribers, and track live conversion analytics.",
        icon: Link2,
        image: "/images/megadm_biolink_showcase.webp",
        color: "#E1306C",
        stat: { label: "Conversion", value: "24.8%" },
        highlights: [
            "Influencer, Store & UGC layouts",
            "Integrated product catalog & videos",
            "Real-time click & visitor analytics"
        ],
        url: "/dashboard/instagram/bio-link"
    },
    {
        id: "broadcasting",
        title: "Broadcasting Campaigns",
        pill: "Official Broadcasts",
        tagline: "Meta-Compliant Direct Message Reach",
        description: "Send broadcast updates, promotions, and flash product drop alerts directly to your subscribers within Meta's official 24-hour messaging guidelines.",
        icon: Send,
        image: "/images/megadm_broadcasting_showcase.webp",
        color: "#006AFF",
        stat: { label: "Open Rate", value: "92.4%" },
        highlights: [
            "Multi-channel Facebook & Instagram DMs",
            "Audience segmentation & tag filtering",
            "Rich interactive media cards & buttons"
        ],
        url: "/dashboard/facebook/broadcast"
    },
    {
        id: "flow-builder",
        title: "Smart Bot Flow Builder",
        pill: "Visual Bot Flows",
        tagline: "Visual Drag & Drop Workflows",
        description: "Build interactive conversation funnels without writing code. Guide leads through product recommendations, FAQs, qualification questions, and instant bookings.",
        icon: Bot,
        image: "/images/megadm_flow_builder_showcase.webp",
        color: "#833AB4",
        stat: { label: "Funnel Pass", value: "88%" },
        highlights: [
            "Interactive buttons, cards & quick replies",
            "Real-time mobile preview simulator",
            "Custom tag variables & lead validation"
        ],
        url: "/dashboard/instagram/bot-reply"
    }
];

export default function FeaturesOverview() {
    const [desktopIndex, setDesktopIndex] = useState(0);
    const [mobileIndex, setMobileIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const maxDesktopIndex = CARDS.length - 3; // 3 visible cards on desktop

    const nextDesktop = () => {
        setDesktopIndex((prev) => (prev >= maxDesktopIndex ? 0 : prev + 1));
    };

    const prevDesktop = () => {
        setDesktopIndex((prev) => (prev <= 0 ? maxDesktopIndex : prev - 1));
    };

    const nextMobile = () => {
        setMobileIndex((prev) => (prev + 1) % CARDS.length);
    };

    const prevMobile = () => {
        setMobileIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
    };

    // Auto-slide effect for desktop (pauses on hover)
    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(() => {
            setDesktopIndex((prev) => (prev >= maxDesktopIndex ? 0 : prev + 1));
        }, 4000);
        return () => clearInterval(timer);
    }, [isHovered, maxDesktopIndex]);

    // Auto-slide effect for mobile
    useEffect(() => {
        const timer = setInterval(() => {
            setMobileIndex((prev) => (prev + 1) % CARDS.length);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    return (
        <section
            id="features-overview"
            className="py-20 md:py-28 overflow-hidden relative bg-[#06000d]"
        >
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full"
                    style={{ background: "radial-gradient(ellipse, rgba(255,45,120,0.18) 0%, transparent 70%)", filter: "blur(110px)" }}
                />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/40 bg-pink-500/15 backdrop-blur-md mb-4 shadow-[0_0_20px_rgba(255,45,120,0.2)]"
                        >
                            <Sparkles className="w-4 h-4 text-[#FF2D78]" />
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-pink-200">
                                Real Working SaaS Modules
                            </span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-[1000] text-white tracking-tight leading-[1.1] mb-4"
                        >
                            One Platform,{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C]">
                                Total Control
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-base sm:text-lg font-semibold text-white/90 leading-relaxed"
                            style={{ color: "#F8FAFC" }}
                        >
                            Explore all 5 live MegaDM modules in full portrait view. Auto-slides smoothly, with interactive hover details on desktop and swipe on mobile.
                        </motion.p>
                    </div>

                    {/* Desktop Slider Arrows */}
                    <div className="hidden md:flex items-center gap-3 shrink-0">
                        <button
                            onClick={prevDesktop}
                            aria-label="Previous Slide"
                            className="p-3.5 rounded-full bg-white/10 hover:bg-[#FF2D78] text-white border border-white/20 transition-all duration-300 shadow-xl active:scale-95"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextDesktop}
                            aria-label="Next Slide"
                            className="p-3.5 rounded-full bg-white/10 hover:bg-[#FF2D78] text-white border border-white/20 transition-all duration-300 shadow-xl active:scale-95"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* ── DESKTOP VIEW: Auto-sliding 3-Card Multi-Card Slider ── */}
                <div
                    className="hidden md:block overflow-hidden"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <motion.div
                        className="flex gap-6 lg:gap-8"
                        animate={{ x: `-${desktopIndex * (100 / 3 + 2.5)}%` }}
                        transition={{ type: "spring", stiffness: 220, damping: 28 }}
                    >
                        {CARDS.map((card) => {
                            const IconComponent = card.icon;

                            return (
                                <div
                                    key={card.id}
                                    className="w-[calc(33.333%-16px)] shrink-0 group relative aspect-[3/4] rounded-[32px] overflow-hidden border border-white/20 bg-[#090312] shadow-2xl transition-all duration-500 hover:border-pink-500/80 hover:shadow-[0_20px_60px_rgba(255,45,120,0.35)] hover:-translate-y-1.5"
                                >
                                    {/* Full Portrait Image Base */}
                                    <div className="relative w-full h-full overflow-hidden bg-[#06000d]">
                                        <Image
                                            src={card.image}
                                            alt={`${card.title} Full Portrait Showcase`}
                                            fill
                                            className="object-contain sm:object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 1200px) 50vw, 33vw"
                                        />
                                        {/* Bottom shade to guarantee text contrast */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
                                    </div>

                                    {/* Floating Top Header Badges */}
                                    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                                        {/* <div
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border backdrop-blur-md shadow-lg"
                                            style={{
                                                backgroundColor: `${card.color}45`,
                                                borderColor: `${card.color}80`,
                                                color: "#FFFFFF",
                                            }}
                                        >
                                            <IconComponent className="w-3.5 h-3.5" />
                                            <span>{card.pill}</span>
                                        </div> */}
                                        {/* <div className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/30 text-white text-xs font-black shadow-lg">
                                            {card.stat.value}
                                        </div> */}
                                    </div>

                                    {/* Resting Bottom Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 z-20 p-5 bg-gradient-to-t from-black via-black/90 to-transparent transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                                        <h3 className="text-xl font-[1000] text-white tracking-tight leading-tight drop-shadow-md">
                                            {card.title}
                                        </h3>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <p className="text-xs text-pink-300 font-bold truncate pr-2 drop-shadow-sm">
                                                {card.tagline}
                                            </p>
                                            <span className="text-[11px] font-black text-white shrink-0 flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30">
                                                <span>Hover</span>
                                                <ArrowRight className="w-3 h-3 text-[#FF2D78]" />
                                            </span>
                                        </div>
                                    </div>

                                    {/* ── ON-HOVER REVEAL OVERLAY ── */}
                                    <div className="absolute inset-0 z-30 flex flex-col justify-end p-6 bg-gradient-to-t from-[#090214] via-[#090214]/95 to-black/60 backdrop-blur-md opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out">
                                        {/* Top Header Inside Overlay */}


                                        <h4 className="text-2xl font-[1000] text-white tracking-tight mb-1">
                                            {card.title}
                                        </h4>
                                        <p className="text-xs font-bold uppercase tracking-wider text-pink-300 mb-2.5">
                                            {card.tagline}
                                        </p>
                                        <p className="text-xs sm:text-sm text-white leading-relaxed mb-3.5 line-clamp-3 font-medium">
                                            {card.description}
                                        </p>

                                        {/* Highlights */}
                                        <div className="space-y-1.5 mb-4">
                                            {card.highlights.map((h) => (
                                                <div key={h} className="flex items-center gap-2 text-xs text-white font-semibold">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2D78] shrink-0" />
                                                    <span className="truncate">{h}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Link */}
                                        <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[11px] text-white/80 font-bold">
                                                <ShieldCheck className="w-3.5 h-3.5 text-[#FF2D78]" />
                                                <span>Official Meta API</span>
                                            </div>
                                            <Link
                                                href="/auth/sign-up"
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF2D78] to-[#E1306C] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,45,120,0.6)] hover:brightness-110 transition-all"
                                            >
                                                <span>Try Free</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* Desktop Pagination Dots */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {[0, 1, 2].map((idx) => (
                            <button
                                key={idx}
                                onClick={() => setDesktopIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-300 ${idx === desktopIndex
                                    ? "w-8 bg-[#FF2D78] shadow-[0_0_12px_rgba(255,45,120,0.8)]"
                                    : "w-2.5 bg-white/20 hover:bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* ── MOBILE VIEW: Auto-sliding Pure Touch Slider ── */}
                <div className="block md:hidden">
                    <div className="relative">
                        {/* Current Mobile Slide Card */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={CARDS[mobileIndex].id}
                                initial={{ opacity: 0, x: 25 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -25 }}
                                transition={{ duration: 0.35 }}
                                className="rounded-[28px] border border-white/25 bg-white/[0.05] backdrop-blur-xl overflow-hidden shadow-2xl p-4 sm:p-5"
                            >
                                {/* Top Badges */}
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border"
                                        style={{
                                            backgroundColor: `${CARDS[mobileIndex].color}30`,
                                            borderColor: `${CARDS[mobileIndex].color}70`,
                                            color: "#FFFFFF",
                                        }}
                                    >
                                        {React.createElement(CARDS[mobileIndex].icon, { className: "w-3.5 h-3.5" })}
                                        <span>{CARDS[mobileIndex].pill}</span>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-black/60 border border-white/30 text-white text-xs font-black">
                                        {CARDS[mobileIndex].stat.value}
                                    </div>
                                </div>

                                {/* Full Portrait Image */}
                                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-white/20 bg-[#090312] mb-4">
                                    <Image
                                        src={CARDS[mobileIndex].image}
                                        alt={`${CARDS[mobileIndex].title} Mobile View`}
                                        fill
                                        className="object-contain"
                                        sizes="100vw"
                                        priority
                                    />
                                </div>

                                {/* Content Directly Visible Below Image */}
                                <div className="space-y-3">
                                    <div>
                                        <h3 className="text-2xl font-[1000] text-white tracking-tight">
                                            {CARDS[mobileIndex].title}
                                        </h3>
                                        <p className="text-xs font-bold uppercase tracking-wider text-pink-300 mt-1">
                                            {CARDS[mobileIndex].tagline}
                                        </p>
                                    </div>

                                    <p className="text-sm text-white leading-relaxed font-normal" style={{ color: "#F8FAFC" }}>
                                        {CARDS[mobileIndex].description}
                                    </p>

                                    {/* Feature Highlights */}
                                    <div className="space-y-2 pt-1">
                                        {CARDS[mobileIndex].highlights.map((h) => (
                                            <div key={h} className="flex items-start gap-2 text-xs text-white font-semibold">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#FF2D78] shrink-0 mt-0.5" />
                                                <span>{h}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        href="/auth/sign-up"
                                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF2D78] to-[#E1306C] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg mt-3 hover:brightness-110 transition-all"
                                    >
                                        <span>Try {CARDS[mobileIndex].title}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Mobile Navigation Controls & Dots */}
                        <div className="flex items-center justify-between mt-5 px-2">
                            <button
                                onClick={prevMobile}
                                aria-label="Previous Slide"
                                className="p-3 rounded-full bg-white/10 hover:bg-[#FF2D78] text-white border border-white/20 transition-colors shadow-lg active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Mobile Dots */}
                            <div className="flex items-center gap-1.5">
                                {CARDS.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMobileIndex(idx)}
                                        aria-label={`Go to slide ${idx + 1}`}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === mobileIndex
                                            ? "w-6 bg-[#FF2D78] shadow-[0_0_10px_rgba(255,45,120,0.8)]"
                                            : "w-2 bg-white/20"
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={nextMobile}
                                aria-label="Next Slide"
                                className="p-3 rounded-full bg-white/10 hover:bg-[#FF2D78] text-white border border-white/20 transition-colors shadow-lg active:scale-95"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
