"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Minus, Info, ChevronDown, ChevronUp } from "lucide-react";
import type { PublicPlan, FeatureDefinition } from "@/lib/publicApi";

// Group display order and labels
const GROUP_ORDER = ["core", "chat", "bot", "campaign", "links", "developer"];
const GROUP_ICONS: Record<string, string> = {
    core: "⚡",
    chat: "📨",
    bot: "🤖",
    campaign: "📢",
    links: "🔗",
    developer: "⚙",
};

function getVal(v: any): string {
    if (v === null || v === undefined) return "0";
    if (typeof v === "object") return String(v.value ?? "0");
    return String(v);
}

function CellValue({
    featureKey,
    plan,
    def,
    isPopular,
}: {
    featureKey: string;
    plan: PublicPlan;
    def: FeatureDefinition;
    isPopular: boolean;
}) {
    const raw = getVal(plan.features?.[featureKey]);

    if (def.type === "toggle") {
        const enabled = raw === "1";
        return (
            <div className="flex justify-center">
                {enabled ? (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPopular ? "bg-[#FF2D78]/20" : "bg-green-50"}`}>
                        <Check className={`w-3 h-3 ${isPopular ? "text-[#FF2D78]" : "text-green-600"}`} strokeWidth={3} />
                    </div>
                ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                        <X className="w-3 h-3 text-gray-300" strokeWidth={3} />
                    </div>
                )}
            </div>
        );
    }

    // Limit type
    if (raw === "0" || raw === "") return <span className="text-gray-300 flex justify-center"><Minus className="w-4 h-4" /></span>;
    if (raw === "-1") {
        return <span className={`text-sm font-black ${isPopular ? "text-[#FF2D78]" : "text-green-600"}`}>Unlimited</span>;
    }
    const unit = def.unit ? ` ${def.unit}` : "";
    return (
        <span className="text-sm font-bold text-gray-800">
            {Number(raw).toLocaleString()}{unit}
        </span>
    );
}

function FeatureTooltip({ text }: { text: string }) {
    const [open, setOpen] = useState(false);
    return (
        <span className="relative inline-block ml-1.5">
            <button
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                className="text-gray-300 hover:text-gray-500 align-middle"
            >
                <Info className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute z-50 bottom-full left-0 mb-1.5 w-52 rounded-xl bg-gray-900 text-white shadow-xl px-3 py-2 text-xs font-medium leading-relaxed pointer-events-none"
                    >
                        {text}
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    );
}

interface ComparisonTableProps {
    plans: PublicPlan[];
    defs: Record<string, FeatureDefinition>;
    groups: Record<string, { label: string; description: string }>;
}

export default function ComparisonTable({ plans, defs, groups }: ComparisonTableProps) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
        Object.fromEntries(GROUP_ORDER.map(g => [g, true]))
    );

    const toggleGroup = (g: string) => setExpandedGroups(prev => ({ ...prev, [g]: !prev[g] }));

    // Build feature rows by group
    const featuresByGroup = useMemo(() => {
        const map: Record<string, Array<[string, FeatureDefinition]>> = {};
        Object.entries(defs).forEach(([key, def]) => {
            if (key === "live_chat") return; // legacy
            if (!map[def.group]) map[def.group] = [];
            map[def.group].push([key, def]);
        });
        return map;
    }, [defs]);

    if (plans.length === 0) return null;

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
                {/* ── Plan headers ── */}
                <thead>
                    <tr>
                        <th className="text-left py-4 px-6 w-1/3 text-sm font-black text-gray-400 uppercase tracking-widest">
                            Feature
                        </th>
                        {plans.map((plan, i) => (
                            <th
                                key={plan.id}
                                className={`py-4 px-4 text-center text-sm font-black uppercase tracking-widest ${
                                    plan.is_highlighted ? "text-[#FF2D78]" : "text-gray-700"
                                }`}
                            >
                                {plan.name}
                                {plan.is_highlighted && (
                                    <span className="block text-[9px] font-black text-[#FF2D78]/70 tracking-[0.15em] mt-0.5">Popular</span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {GROUP_ORDER.map(groupKey => {
                        const entries = featuresByGroup[groupKey] ?? [];
                        if (entries.length === 0) return null;
                        const groupMeta = groups[groupKey] ?? { label: groupKey, description: "" };
                        const isOpen = expandedGroups[groupKey] ?? true;

                        return (
                            <>
                                {/* Group header row */}
                                <tr key={`group-${groupKey}`} className="bg-gray-50">
                                    <td
                                        colSpan={plans.length + 1}
                                        className="py-3 px-6 cursor-pointer select-none"
                                        onClick={() => toggleGroup(groupKey)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-lg">{GROUP_ICONS[groupKey] ?? "📦"}</span>
                                                <div>
                                                    <span className="text-sm font-black text-gray-900">
                                                        {groupMeta.label?.replace(/[^\w\s]/g, "").trim() || groupKey}
                                                    </span>
                                                    {groupMeta.description && (
                                                        <span className="text-xs text-gray-400 font-medium ml-2">
                                                            — {groupMeta.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isOpen ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </td>
                                </tr>

                                {/* Feature rows */}
                                <AnimatePresence>
                                    {isOpen && entries.map(([key, def]) => (
                                        <motion.tr
                                            key={key}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                                        >
                                            <td className="py-3.5 px-6">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {def.label}
                                                    {def.tooltip && <FeatureTooltip text={def.tooltip} />}
                                                </span>
                                                {def.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 font-medium leading-snug max-w-xs">
                                                        {def.description}
                                                    </p>
                                                )}
                                            </td>
                                            {plans.map((plan) => (
                                                <td
                                                    key={plan.id}
                                                    className={`py-3.5 px-4 text-center ${plan.is_highlighted ? "bg-[#FF2D78]/[0.02]" : ""}`}
                                                >
                                                    <CellValue
                                                        featureKey={key}
                                                        plan={plan}
                                                        def={def}
                                                        isPopular={plan.is_highlighted}
                                                    />
                                                </td>
                                            ))}
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
