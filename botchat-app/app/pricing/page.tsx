"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, ChevronDown, HelpCircle, ArrowRight,
    Check, Shield, Zap, MessageSquare, Users
} from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";
import PlanCard from "./components/PlanCard";
import ComparisonTable from "./components/ComparisonTable";
import { getPublicPlans, getPublicDefinitions, type PublicPlan, type FeatureDefinition } from "@/lib/publicApi";

// ── FAQ ─────────────────────────────────────────────────────────
const FAQS = [
    {
        q: "Is BotChat compliant with Meta's terms of service?",
        a: "Yes. We exclusively use the official Meta Messenger & Instagram APIs. Unlike unofficial bots that scrape web data, our platform is fully recognized and approved by Meta, ensuring your account stays safe and compliant."
    },
    {
        q: "How does annual billing work?",
        a: "Annual plans are billed upfront for 12 months, giving you a 20% discount compared to the monthly rate. You can cancel anytime — unused months are refunded on a pro-rated basis."
    },
    {
        q: "Can I upgrade or downgrade my plan?",
        a: "Absolutely. You can switch between plans at any time from your billing dashboard. Pro-rated adjustments are automatically applied to your next invoice."
    },
    {
        q: "What counts as a 'Message Credit'?",
        a: "Any private message sent by the bot to a user — in response to a comment, story mention, or DM. Replies to post comments themselves do not count and are completely unlimited on all plans."
    },
    {
        q: "Do you offer custom enterprise plans?",
        a: "Yes. If you manage an agency with 10+ accounts or need more than 100K messages per month, our team can build a custom package. Contact us to discuss your requirements."
    },
    {
        q: "How does the AI Assistant work?",
        a: "The AI Assistant uses OpenAI, Gemini, or Claude to understand the context of user messages and generate intelligent, on-brand replies automatically — going far beyond simple keyword matching."
    },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="border-b border-gray-100 last:border-0"
        >
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full py-5 text-left gap-4 group"
            >
                <span className="text-base font-bold text-gray-900 group-hover:text-[#FF2D78] transition-colors">
                    {q}
                </span>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                    >
                        <p className="text-gray-500 font-medium leading-relaxed pb-5 pr-8">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function PlanSkeleton() {
    return (
        <div className="animate-pulse rounded-[32px] border border-gray-100 bg-white p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100" />
            <div className="h-6 w-1/2 bg-gray-100 rounded" />
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-12 w-2/3 bg-gray-100 rounded mt-2" />
            <div className="grid grid-cols-2 gap-2 mt-2">
                {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
            </div>
            <div className="space-y-3 mt-2">
                {[...Array(6)].map((_, i) => <div key={i} className="h-3.5 bg-gray-100 rounded" />)}
            </div>
            <div className="h-12 bg-gray-100 rounded-2xl mt-auto" />
        </div>
    );
}

export default function PricingPage() {
    const [plans, setPlans] = useState<PublicPlan[]>([]);
    const [defs, setDefs] = useState<Record<string, FeatureDefinition>>({});
    const [groups, setGroups] = useState<Record<string, { label: string; description: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isAnnual, setIsAnnual] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const comparisonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        Promise.all([getPublicPlans(), getPublicDefinitions()])
            .then(([plansData, defsData]) => {
                const arr = Array.isArray(plansData) ? plansData : [];
                setPlans(arr.filter((p: PublicPlan) => p.status));
                setDefs(defsData.features ?? {});
                setGroups(defsData.groups ?? {});
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    const handleShowComparison = () => {
        setShowComparison(true);
        setTimeout(() => {
            comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    return (
        <>
            <PageMeta
                title="Pricing — BotChat | Plans for Creators & Agencies"
                description="Choose the right BotChat plan for your business. All plans include a free trial. Simple, transparent pricing with monthly and annual billing options."
            />
            <main className="min-h-screen bg-white">
                <Navbar forceLight={true} />

                {/* ── Hero ─────────────────────────────────────────── */}
                <section className="relative pt-44 pb-24 overflow-hidden bg-[#06000d]">
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] rounded-full bg-[#FF2D78]/15 blur-[140px] animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full bg-violet-600/10 blur-[140px]" />
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: "radial-gradient(circle, #444 1px, transparent 1px)", backgroundSize: "40px 40px" }}
                        />
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                                <Sparkles className="w-4 h-4 text-[#FF2D78]" />
                                <span className="text-xs font-black tracking-[0.2em] uppercase text-pink-200/80">
                                    Simple, Transparent Pricing
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl md:text-8xl font-[1000] text-white mb-6 tracking-tighter leading-none">
                                Simple Plans.
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C]">
                                    Infinite Scale.
                                </span>
                            </h1>

                            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed px-2">
                                Start free. Scale when you're ready. Every plan includes a full-featured trial — no credit card required.
                            </p>

                            {/* Platform strip */}
                            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 opacity-25 hover:opacity-60 transition-opacity duration-500 mb-14">
                                {["INSTAGRAM", "FACEBOOK", "WHATSAPP", "TELEGRAM"].map(name => (
                                    <span key={name} className="text-white font-black tracking-[0.35em] text-sm">{name}</span>
                                ))}
                            </div>

                            {/* Billing toggle */}
                            <div className="flex items-center justify-center gap-4 sm:gap-6">
                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${!isAnnual ? "text-white" : "text-gray-600"}`}>
                                    Monthly
                                </span>
                                <button
                                    onClick={() => setIsAnnual(v => !v)}
                                    className="relative w-16 h-8 rounded-full bg-white/10 border border-white/10 p-1"
                                >
                                    <motion.div
                                        animate={{ x: isAnnual ? 32 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="w-6 h-6 rounded-full bg-[#FF2D78] shadow-[0_0_12px_rgba(255,45,120,0.5)]"
                                    />
                                </button>
                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${isAnnual ? "text-white" : "text-gray-600"}`}>
                                    Annual{" "}
                                    <span className="text-green-400 font-black text-xs ml-1">Save 20%</span>
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Plan Cards ──────────────────────────────────── */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        {isLoading ? (
                            <div className={`grid grid-cols-1 gap-6 ${plans.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2 max-w-3xl mx-auto"}`}>
                                {[...Array(3)].map((_, i) => <PlanSkeleton key={i} />)}
                            </div>
                        ) : plans.length === 0 ? (
                            <div className="text-center py-32">
                                <p className="text-gray-400 font-bold text-lg">No plans available yet. Check back soon.</p>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-1 gap-6 ${plans.length > 2 ? "lg:grid-cols-3" : "lg:grid-cols-2 max-w-3xl mx-auto"} ${plans.length === 1 ? "max-w-sm mx-auto" : ""}`}>
                                {plans.map((plan, i) => (
                                    <PlanCard
                                        key={plan.id}
                                        plan={plan}
                                        defs={defs}
                                        isAnnual={isAnnual}
                                        index={i}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Trust badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-wrap items-center justify-center gap-6 mt-14"
                        >
                            {[
                                { icon: Shield, label: "Meta Verified Partner" },
                                { icon: Zap, label: "99.9% Uptime SLA" },
                                { icon: Check, label: "No Hidden Fees" },
                                { icon: MessageSquare, label: "Priority Support" },
                                { icon: Users, label: "11,000+ Happy Customers" },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                    <Icon className="w-4 h-4 text-[#FF2D78]" />
                                    {label}
                                </div>
                            ))}
                        </motion.div>

                        {/* Show comparison button */}
                        {!showComparison && plans.length > 1 && (
                            <div className="text-center mt-14">
                                <motion.button
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    onClick={handleShowComparison}
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-gray-200 bg-white text-gray-700 font-black text-sm uppercase tracking-widest hover:border-[#FF2D78] hover:text-[#FF2D78] transition-all"
                                >
                                    Show Full Feature Comparison
                                    <ChevronDown className="w-4 h-4" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Feature Comparison Table ─────────────────────── */}
                <AnimatePresence>
                    {showComparison && plans.length > 0 && (
                        <motion.section
                            ref={comparisonRef}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="py-20 bg-gray-50/60 border-y border-gray-100"
                        >
                            <div className="max-w-7xl mx-auto px-6">
                                <div className="text-center mb-12">
                                    <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-4">
                                        Full Comparison
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
                                        Every Feature. Every Plan.
                                    </h2>
                                    <p className="text-gray-500 font-medium max-w-xl mx-auto">
                                        Generated automatically from our live Feature Registry — always accurate, never outdated.
                                    </p>
                                </div>

                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-24">
                                            <div className="w-8 h-8 border-4 border-[#FF2D78] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <ComparisonTable plans={plans} defs={defs} groups={groups} />
                                    )}
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* ── FAQ ─────────────────────────────────────────── */}
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-5">
                                FAQs
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">
                                Common Questions
                            </h2>
                            <p className="text-gray-500 font-medium max-w-lg mx-auto">
                                Everything you need to know before getting started.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 px-6">
                            {FAQS.map((faq, i) => (
                                <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
                            ))}
                        </div>

                        <div className="mt-10 p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-5 h-5 text-[#FF2D78]" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-gray-900">Still have questions?</h4>
                                    <p className="text-gray-500 font-medium text-sm mt-0.5">
                                        Our team is here to help you find the right plan.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <button className="px-6 py-3 rounded-full bg-white border border-gray-200 text-black font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                                    Support
                                </button>
                                <button className="px-6 py-3 rounded-full bg-black text-white font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">
                                    Contact Us
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ────────────────────────────────────── */}
                <section className="py-24 bg-[#06000d] relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#FF2D78]/15 blur-[120px]" />
                    </div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center justify-center -space-x-3 mb-10">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-12 rounded-full border-4 border-[#06000d] bg-gradient-to-br from-[#FF2D78] to-[#E1306C] shadow-lg"
                                        style={{ opacity: 0.7 + i * 0.06 }}
                                    />
                                ))}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                                Join 11,000+ creators scaling with BotChat.
                            </h2>
                            <p className="text-gray-500 font-medium max-w-xl mx-auto mb-10">
                                Start your free trial today. No credit card required. Cancel anytime.
                            </p>
                            <div className="inline-flex items-center gap-8 p-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-2 pl-5">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Live & Operating</span>
                                </div>
                                <Link
                                    href="/auth/sign-up"
                                    className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black text-sm uppercase tracking-widest rounded-full hover:bg-gray-100 transition-all shadow-xl"
                                >
                                    Start Free Trial <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
}
