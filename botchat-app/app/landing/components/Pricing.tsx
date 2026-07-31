"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { getPublicPlans, getPublicDefinitions, type PublicPlan, type FeatureDefinition } from "@/lib/publicApi";

// Key features shown on cards — sourced from registry labels
const HIGHLIGHT_KEYS = [
    "smart_inbox", "bot_reply", "social_posting_access",
    "bio_links", "broadcast", "api_developer",
    "comment_automation", "analytics",
];

function getVal(v: any): string {
    if (v === null || v === undefined) return "0";
    if (typeof v === "object" && v !== null) return String(v.value ?? "0");
    return String(v);
}

function PlanSkeletonCard() {
    return (
        <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-8">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 mb-6" />
            <div className="h-6 w-2/3 bg-gray-100 rounded mb-2" />
            <div className="h-4 w-full bg-gray-100 rounded mb-8" />
            <div className="h-10 w-1/2 bg-gray-100 rounded mb-8" />
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-3.5 bg-gray-100 rounded" />)}
            </div>
        </div>
    );
}

export default function Pricing() {
    const [plans, setPlans] = useState<PublicPlan[]>([]);
    const [defs, setDefs] = useState<Record<string, FeatureDefinition>>({});
    const [isAnnual, setIsAnnual] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getPublicPlans(), getPublicDefinitions()])
            .then(([plansData, defsData]) => {
                const arr = Array.isArray(plansData) ? plansData : [];
                setPlans(arr.filter((p: PublicPlan) => p.status));
                setDefs(defsData.features ?? {});
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const ANNUAL_DISCOUNT = 0.8; // 20% off
    const top3 = plans.slice(0, 3);

    return (
        <section className="py-24 bg-white" id="pricing">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-5"
                    >
                        Pricing
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight"
                    >
                        Simple plans.{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
                            Infinite scale.
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-lg max-w-xl mx-auto font-medium mb-8"
                    >
                        Start free. Scale when you need to.
                    </motion.p>

                    {/* Billing toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-bold transition-colors ${!isAnnual ? "text-black" : "text-gray-400"}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(v => !v)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual ? "bg-[#FF2D78]" : "bg-gray-200"}`}
                        >
                            <motion.div
                                animate={{ x: isAnnual ? 28 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                            />
                        </button>
                        <span className={`text-sm font-bold transition-colors ${isAnnual ? "text-black" : "text-gray-400"}`}>
                            Annual <span className="text-green-500 text-xs font-black ml-1">Save 20%</span>
                        </span>
                    </div>
                </div>

                {/* Plan cards */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[...Array(3)].map((_, i) => <PlanSkeletonCard key={i} />)}
                    </div>
                ) : top3.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 font-semibold">Plans coming soon.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {top3.map((plan, i) => {
                            const isPopular = plan.is_highlighted;
                            const rawPrice = Number(plan.price);
                            const displayPrice = isAnnual ? Math.round(rawPrice * ANNUAL_DISCOUNT) : rawPrice;

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                                        isPopular
                                            ? "bg-gray-950 text-white shadow-2xl ring-2 ring-[#FF2D78]/30 md:scale-[1.03] z-10"
                                            : "bg-white border border-gray-100 hover:shadow-xl"
                                    }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF2D78] to-[#E1306C] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                <Sparkles className="w-3 h-3" /> Most Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                                        {plan.description && (
                                            <p className={`text-[15px] font-medium ${isPopular ? "text-gray-300" : "text-gray-600"}`}>
                                                {plan.description}
                                            </p>
                                        )}
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={displayPrice}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="flex items-end gap-1.5 mt-5"
                                            >
                                                <span className="text-5xl font-black tracking-tight">₹{displayPrice}</span>
                                                <span className={`text-sm font-bold mb-2 ${isPopular ? "text-gray-400" : "text-gray-500"}`}>
                                                    / {plan.duration_type}
                                                </span>
                                            </motion.div>
                                        </AnimatePresence>
                                        {isAnnual && rawPrice > 0 && (
                                            <p className="text-xs text-green-400 font-bold mt-1">
                                                Save ₹{Math.round(rawPrice * 0.2)} / {plan.duration_type}
                                            </p>
                                        )}
                                    </div>

                                    {/* Feature bullets from registry */}
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {HIGHLIGHT_KEYS.map(key => {
                                            const val = getVal(plan.features?.[key]);
                                            const enabled = val !== "0" && val !== "";
                                            const def = defs[key];
                                            if (!def) return null;
                                            return (
                                                <li key={key} className={`flex items-center gap-3 text-sm ${!enabled && "opacity-40"}`}>
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        enabled
                                                            ? isPopular ? "bg-[#FF2D78]/20 text-[#FF2D78]" : "bg-green-50 text-green-600"
                                                            : "bg-gray-100 text-gray-300"
                                                    }`}>
                                                        <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                                    </div>
                                                    <span className={`font-semibold ${isPopular ? "text-gray-300" : "text-gray-700"}`}>
                                                        {def.label}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    <Link
                                        href="/auth/sign-up"
                                        className={`block w-full py-4 rounded-2xl text-center font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                            isPopular
                                                ? "bg-white text-black hover:bg-gray-100 shadow-lg"
                                                : "bg-black text-white hover:bg-gray-800"
                                        }`}
                                    >
                                        Start Free Trial
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Link to full pricing */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 text-sm font-black text-gray-500 hover:text-black transition-colors uppercase tracking-widest"
                    >
                        View full pricing & feature comparison <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
