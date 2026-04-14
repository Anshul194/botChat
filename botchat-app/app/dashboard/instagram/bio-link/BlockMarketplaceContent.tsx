"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Image as ImageIcon, Layers, Link as LinkIcon, Megaphone, Search, Sparkles, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type BlockOption = {
    type: string;
    label?: string;
    desc?: string;
};

type BlockCategoryMap = Record<string, BlockOption[]>;

const getBlockIcon = (type: string) => {
    const value = type.toLowerCase();
    if (/(image|photo|gallery|media|square|vertical|horizontal)/.test(value)) return ImageIcon;
    if (/(video|reel|youtube|short|tiktok)/.test(value)) return Video;
    if (/(carousel|grid|stack|link)/.test(value)) return Layers;
    if (/(form|lead|contact|email|newsletter|phone)/.test(value)) return Megaphone;
    if (/(button|url|cta|link)/.test(value)) return LinkIcon;
    return Sparkles;
};

const getCategoryAccent = (category: string) => {
    const value = category.toLowerCase();
    if (/(brand|identity|base)/.test(value)) return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary";
    if (/(media|visual|image|video)/.test(value)) return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300";
    if (/(advanced|growth|tracking|marketing)/.test(value)) return "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300";
    if (/(social|embed|content|blocks?)/.test(value)) return "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300";
    return "bg-slate-500/10 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300";
};

export default function BlockMarketplaceContent({
    blockCategories,
    onSelect,
}: {
    blockCategories: BlockCategoryMap;
    onSelect: (type: string) => void;
}) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const categories = useMemo(
        () => Object.entries(blockCategories || {}).filter(([, items]) => Array.isArray(items) && items.length > 0),
        [blockCategories]
    );

    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase();
        return categories
            .filter(([category]) => activeCategory === "all" || category === activeCategory)
            .map(([category, items]) => {
                const filteredItems = items.filter((item) => {
                    const haystack = [item.type, item.label, item.desc, category].filter(Boolean).join(" ").toLowerCase();
                    return !term || haystack.includes(term);
                });
                return [category, filteredItems] as const;
            })
            .filter(([, items]) => items.length > 0);
    }, [activeCategory, categories, search]);

    const allCount = categories.reduce((count, [, items]) => count + items.length, 0);

    return (
        <div className="space-y-5">
            <div className="sticky top-0 z-10 -mx-8 -mt-8 px-8 pt-8 pb-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                            className={cn(
                                "h-9 px-4 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] border transition-all",
                                activeCategory === "all"
                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            All <span className="ml-1 opacity-70">{allCount}</span>
                        </button>
                        {categories.map(([category, items]) => (
                            <button
                                type="button"
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={cn(
                                    "h-9 px-4 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] border transition-all",
                                    activeCategory === category
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:text-primary"
                                )}
                            >
                                {category} <span className="ml-1 opacity-70">{items.length}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search modules, buttons, media, forms..."
                            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-slate-400 transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>Pick a card to add it to the current content area.</span>
                        <span>{filteredCategories.reduce((sum, [, items]) => sum + items.length, 0)} matches</span>
                    </div>
                </div>
            </div>

            {filteredCategories.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCategories.map(([category, items]) =>
                        items.map((item) => {
                            const Icon = getBlockIcon(item.type || item.label || category);
                            const accentClass = getCategoryAccent(category);
                            return (
                                <button
                                    key={`${category}-${item.type}`}
                                    type="button"
                                    onClick={() => onSelect(item.type)}
                                    className="group text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0", accentClass)}>
                                                <Icon size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.label || item.type}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.12em] truncate mt-0.5">{category}</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-primary transition-colors shrink-0 mt-1" />
                                    </div>

                                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                                        {item.desc || "Add this module to the current content flow."}
                                    </p>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]", accentClass)}>
                                            {category}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-primary transition-colors">Click to add</span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 px-6 py-14 text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">No modules matched your search.</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try a broader keyword or switch to a different category.</p>
                </div>
            )}
        </div>
    );
}