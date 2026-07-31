"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info } from "lucide-react";
import { getPublicDefinitions, type FeatureDefinition } from "@/lib/publicApi";

// ── The 4 groups we want to showcase on the landing page ──
const SHOWCASE_GROUPS = [
    { key: "chat",     title: "Smart Inbox",     icon: "📨", accent: "#FF2D78" },
    { key: "bot",      title: "Bot Automation",  icon: "🤖", accent: "#8B5CF6" },
    { key: "links",    title: "Bio Links",        icon: "🔗", accent: "#0EA5E9" },
    { key: "campaign", title: "Campaigns",        icon: "📢", accent: "#F59E0B" },
];

function FeatureSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex-shrink-0" />
                    <div className="h-3.5 rounded bg-gray-100" style={{ width: `${50 + (i % 3) * 20}%` }} />
                </div>
            ))}
        </div>
    );
}

function Tooltip({ text }: { text: string }) {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-block ml-1">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                className="text-gray-300 hover:text-gray-500 transition-colors align-middle"
                aria-label="More info"
            >
                <Info className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl border border-gray-100 bg-white shadow-xl px-3.5 py-2.5 text-xs font-medium text-gray-600 leading-relaxed pointer-events-none"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}

export default function Features() {
    const [defs, setDefs] = useState<Record<string, FeatureDefinition>>({});
    const [groups, setGroups] = useState<Record<string, { label: string; description: string }>>({});
    const [loading, setLoading] = useState(true);
    const [activeGroup, setActiveGroup] = useState(SHOWCASE_GROUPS[0].key);

    useEffect(() => {
        getPublicDefinitions()
            .then(data => {
                setDefs(data.features ?? {});
                setGroups(data.groups ?? {});
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Group features by their group key
    const featuresByGroup = useMemo(() => {
        const map: Record<string, Array<[string, FeatureDefinition]>> = {};
        Object.entries(defs).forEach(([key, def]) => {
            if (!map[def.group]) map[def.group] = [];
            map[def.group].push([key, def]);
        });
        return map;
    }, [defs]);

    return (
        <section className="py-24 bg-gray-50/60 overflow-hidden" id="features">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-5"
                    >
                        Features
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight"
                    >
                        Everything you need.{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
                            Nothing you don't.
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg max-w-2xl mx-auto font-medium"
                    >
                        150+ features across 7 powerful modules — powered directly from our live feature registry.
                    </motion.p>
                </div>

                {/* Desktop: 4 column grid | Mobile: Tab selector */}
                <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                    {SHOWCASE_GROUPS.map((group, gi) => {
                        const entries = featuresByGroup[group.key] ?? [];
                        return (
                            <motion.div
                                key={group.key}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: gi * 0.08 }}
                                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2.5 mb-6">
                                    <span className="text-2xl">{group.icon}</span>
                                    <div>
                                        <h3 className="text-base font-black text-gray-900">{group.title}</h3>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">
                                            {entries.length} features
                                        </p>
                                    </div>
                                </div>
                                {loading ? (
                                    <FeatureSkeleton />
                                ) : (
                                    <ul className="space-y-3">
                                        {entries.slice(0, 8).map(([key, def]) => (
                                            <li key={key} className="flex items-start gap-2.5 text-sm">
                                                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: group.accent }} strokeWidth={2.5} />
                                                <span className="text-gray-700 font-semibold leading-tight">
                                                    {def.label}
                                                    {def.tooltip && <Tooltip text={def.tooltip} />}
                                                </span>
                                            </li>
                                        ))}
                                        {entries.length > 8 && (
                                            <li className="text-xs font-bold text-gray-400 pl-6">
                                                +{entries.length - 8} more features
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Mobile: Tabs + single column */}
                <div className="lg:hidden">
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
                        {SHOWCASE_GROUPS.map(group => (
                            <button
                                key={group.key}
                                onClick={() => setActiveGroup(group.key)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                                    activeGroup === group.key
                                        ? "bg-[#FF2D78] text-white shadow-md"
                                        : "bg-white text-gray-500 border border-gray-200"
                                }`}
                            >
                                {group.icon} {group.title}
                            </button>
                        ))}
                    </div>
                    <AnimatePresence mode="wait">
                        {SHOWCASE_GROUPS.filter(g => g.key === activeGroup).map(group => {
                            const entries = featuresByGroup[group.key] ?? [];
                            return (
                                <motion.div
                                    key={group.key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                                >
                                    {loading ? (
                                        <FeatureSkeleton />
                                    ) : (
                                        <ul className="grid grid-cols-2 gap-3">
                                            {entries.slice(0, 10).map(([key, def]) => (
                                                <li key={key} className="flex items-start gap-2 text-sm">
                                                    <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FF2D78]" strokeWidth={2.5} />
                                                    <span className="text-gray-700 font-semibold leading-tight">{def.label}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-14"
                >
                    <a
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-xl"
                    >
                        See Full Feature Comparison
                    </a>
                </motion.div>
            </div>
        </section>
    );
}