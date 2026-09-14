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
    const isPopular = Boolean(plan.is_highlighted && plan.is_highlighted !== "0" && (plan.is_highlighted as any) !== 0);
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
            style={{
                backgroundColor: isPopular ? "#090312" : "#ffffff",
                color: isPopular ? "#ffffff" : "#111827",
            }}
            className={`relative flex flex-col rounded-[32px] overflow-hidden transition-all duration-300 ${
                isPopular
                    ? "shadow-2xl border-2 border-[#FF2D78]/50 ring-1 ring-[#FF2D78]/30"
                    : "border border-gray-200/80 hover:shadow-xl hover:border-gray-300"
            }`}
        >
            {/* Popular banner */}
            {isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#FF2D78] via-[#FF4081] to-[#E1306C] py-2 text-center shadow-md z-10">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-1.5 drop-shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" /> Most Popular
                    </span>
                </div>
            )}

            <div className={`p-7 sm:p-8 flex flex-col flex-1 ${isPopular ? "pt-12 sm:pt-14" : ""}`}>
                {/* Icon + name */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <div
                            style={{
                                backgroundColor: isPopular ? "rgba(255, 255, 255, 0.10)" : "rgba(243, 244, 246, 1)",
                                borderColor: isPopular ? "rgba(255, 255, 255, 0.15)" : "rgba(229, 231, 235, 1)",
                            }}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border"
                        >
                            <IconEl className="w-6 h-6" style={{ color: isPopular ? "#FF80AB" : accentColor }} />
                        </div>
                        <h3
                            style={{ color: isPopular ? "#ffffff" : "#111827" }}
                            className="text-2xl sm:text-3xl font-black"
                        >
                            {plan.name}
                        </h3>
                        {plan.description && (
                            <p
                                style={{ color: isPopular ? "rgba(255, 255, 255, 0.85)" : "#4b5563" }}
                                className="text-sm font-medium mt-1"
                            >
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
                        <div className="flex items-baseline gap-1.5">
                            <span
                                style={{ color: isPopular ? "#ffffff" : "#111827" }}
                                className="text-4xl sm:text-5xl font-black tracking-tight"
                            >
                                ₹{displayPrice}
                            </span>
                            <span
                                style={{ color: isPopular ? "rgba(255, 255, 255, 0.80)" : "#6b7280" }}
                                className="text-sm font-bold"
                            >
                                / {plan.duration} {plan.duration_type}
                            </span>
                        </div>
                    </motion.div>
                </AnimatePresence>
                {isAnnual && rawPrice > 0 && (
                    <p className="text-xs text-green-400 font-bold mb-4">
                        Save ₹{Math.round(rawPrice * 0.2)} per {plan.duration_type}
                    </p>
                )}

                {/* Limit chips */}
                <div className="grid grid-cols-2 gap-2.5 my-5">
                    {LIMIT_KEYS.map(key => {
                        const val = getVal(plan.features?.[key]);
                        const def = defs[key];
                        if (!def || val === "0" || val === "") return null;
                        return (
                            <div
                                key={key}
                                style={{
                                    backgroundColor: isPopular ? "rgba(255, 255, 255, 0.08)" : "rgba(249, 250, 251, 0.95)",
                                    borderColor: isPopular ? "rgba(255, 255, 255, 0.15)" : "rgba(229, 231, 235, 0.8)",
                                }}
                                className="p-3 rounded-2xl border transition-colors"
                            >
                                <span
                                    style={{ color: isPopular ? "#ffffff" : "#111827" }}
                                    className="block text-base sm:text-lg font-black leading-tight"
                                >
                                    {formatLimit(val, def)}
                                </span>
                                <span
                                    style={{ color: isPopular ? "rgba(255, 255, 255, 0.90)" : "#6b7280" }}
                                    className="text-[11px] font-bold uppercase tracking-wider block mt-0.5 truncate"
                                >
                                    {def.unit || def.label.replace(/ *\(.*\)/g, "")}
                                </span>
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
                            <li key={key} className="flex items-center gap-3 text-sm">
                                {enabled ? (
                                    <div
                                        style={{ backgroundColor: isPopular ? "#FF2D78" : "rgba(209, 250, 229, 1)" }}
                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                                    >
                                        <Check
                                            className="w-3 h-3"
                                            style={{ color: isPopular ? "#ffffff" : "#047857" }}
                                            strokeWidth={3}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        style={{ backgroundColor: isPopular ? "rgba(255, 255, 255, 0.10)" : "rgba(243, 244, 246, 1)" }}
                                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                    >
                                        <X
                                            className="w-3 h-3"
                                            style={{ color: isPopular ? "rgba(255, 255, 255, 0.50)" : "#9ca3af" }}
                                            strokeWidth={3}
                                        />
                                    </div>
                                )}
                                <span
                                    style={{
                                        color: isPopular
                                            ? enabled ? "#ffffff" : "rgba(255, 255, 255, 0.45)"
                                            : enabled ? "#1f2937" : "#9ca3af",
                                        textDecoration: !enabled ? "line-through" : "none",
                                    }}
                                    className="font-semibold"
                                >
                                    {def.label}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                {/* CTA */}
                <Link
                    href="/auth/sign-up"
                    style={{
                        backgroundColor: isPopular ? "#ffffff" : "#000000",
                        color: isPopular ? "#000000" : "#ffffff",
                    }}
                    className="block w-full py-4 rounded-2xl text-center font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:opacity-95"
                >
                    Start Free Trial
                </Link>
            </div>
        </motion.div>
    );
}
