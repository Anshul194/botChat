"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Zap, Crown, Shield } from "lucide-react";
import type { PublicPlan, FeatureDefinition } from "@/lib/publicApi";

// Key limit features displayed on cards
const LIMIT_KEYS = [
    "connect_account", "message_credit", "subscribers",
    "storage_mb", "bot_ai_token", "domains_limit",
];

const FEATURE_KEYS = [
    "smart_inbox", "bot_reply", "comment_automation",
    "social_posting_access", "broadcast", "bio_links",
    "api_developer", "analytics",
];

function getVal(v: any): string {
    if (v === null || v === undefined) return "0";
    if (typeof v === "object") return String(v.value ?? "0");
    return String(v);
}

function formatLimit(val: string, def: FeatureDefinition): string {
    if (val === "-1" || val === "unlimited") return "Unlimited";
    if (val === "0" || val === "") return "—";
    const unit = def.unit ? ` ${def.unit}` : "";
    return `${Number(val).toLocaleString()}${unit}`;
}

interface PlanCardProps {
    plan: PublicPlan;
    defs: Record<string, FeatureDefinition>;
    isAnnual: boolean;
    index: number;
    annualDiscount?: number;
}

const CARD_ICONS = [Zap, Sparkles, Crown, Shield];
const CARD_COLORS = ["#6366F1", "#FF2D78", "#F59E0B", "#0EA5E9"];

export default function PlanCard({ plan, defs, isAnnual, index, annualDiscount = 0.8 }: PlanCardProps) {
    const isPopular = plan.is_highlighted;
    const rawPrice = Number(plan.price);
    const displayPrice = isAnnual ? Math.round(rawPrice * annualDiscount) : rawPrice;
    const IconEl = CARD_ICONS[index % CARD_ICONS.length];
    const accentColor = CARD_COLORS[index % CARD_COLORS.length];

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            className={`relative flex flex-col rounded-[32px] overflow-hidden transition-all duration-300 ${
                isPopular
                    ? "bg-gray-950 text-white shadow-2xl ring-2 ring-[#FF2D78]/30"
                    : "bg-white border border-gray-100 hover:shadow-xl hover:border-gray-200"
            }`}
        >
            {/* Popular banner */}
            {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#FF2D78] to-[#E1306C] py-2 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Most Popular
                    </span>
                </div>
            )}

            <div className={`p-8 flex flex-col flex-1 ${isPopular ? "pt-14" : ""}`}>
                {/* Icon + name */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isPopular ? "bg-white/10" : "bg-gray-50"}`}
                        >
                            <IconEl className="w-6 h-6" style={{ color: isPopular ? "white" : accentColor }} />
                        </div>
                        <h3 className="text-2xl font-black">{plan.name}</h3>
                        {plan.description && (
                            <p className={`text-sm font-medium mt-1 ${isPopular ? "text-gray-400" : "text-gray-500"}`}>
                                {plan.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Price */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${plan.id}-${displayPrice}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="mb-1"
                    >
                        <div className="flex items-end gap-1.5">
                            <span className="text-5xl font-black tracking-tight">₹{displayPrice}</span>
                            <span className={`text-sm font-bold mb-2 ${isPopular ? "text-gray-500" : "text-gray-400"}`}>
                                / {plan.duration} {plan.duration_type}
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
                {isAnnual && rawPrice > 0 && (
                    <p className="text-xs text-green-400 font-bold mb-6">
                        Save ₹{Math.round(rawPrice * 0.2)} per {plan.duration_type}
                    </p>
                )}

                {/* Limit chips */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {LIMIT_KEYS.map(key => {
                        const val = getVal(plan.features?.[key]);
                        const def = defs[key];
                        if (!def || val === "0" || val === "") return null;
                        return (
                            <div
                                key={key}
                                className={`px-3 py-2 rounded-xl text-xs font-bold ${
                                    isPopular ? "bg-white/10 text-gray-300" : "bg-gray-50 text-gray-600 border border-gray-100"
                                }`}
                            >
                                <span className={`block text-base font-black ${isPopular ? "text-white" : "text-gray-900"}`}>
                                    {formatLimit(val, def)}
                                </span>
                                {def.unit || def.label.replace(/ *\(.*\)/g, "")}
                            </div>
                        );
                    })}
                </div>

                {/* Feature toggles */}
                <ul className="space-y-3 mb-8 flex-1">
                    {FEATURE_KEYS.map(key => {
                        const val = getVal(plan.features?.[key]);
                        const enabled = val !== "0" && val !== "";
                        const def = defs[key];
                        if (!def) return null;
                        return (
                            <li key={key} className={`flex items-center gap-3 text-sm ${!enabled && "opacity-40"}`}>
                                {enabled ? (
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPopular ? "bg-[#FF2D78]/20 text-[#FF2D78]" : "bg-green-50 text-green-600"}`}>
                                        <Check className="w-3 h-3" strokeWidth={3} />
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        <X className="w-3 h-3 text-gray-300" strokeWidth={3} />
                                    </div>
                                )}
                                <span className={`font-semibold ${isPopular ? "text-gray-300" : "text-gray-700"}`}>
                                    {def.label}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                {/* CTA */}
                <Link
                    href="/auth/sign-up"
                    className={`block w-full py-4 rounded-2xl text-center font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isPopular
                            ? "bg-white text-black hover:bg-gray-100 shadow-xl"
                            : "bg-black text-white hover:bg-gray-800 shadow-lg"
                    }`}
                >
                    Start Free Trial
                </Link>
            </div>
        </motion.div>
    );
}
