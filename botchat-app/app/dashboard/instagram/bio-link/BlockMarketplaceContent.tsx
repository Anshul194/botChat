"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight, Image as ImageIcon, Layers, Link as LinkIcon, Megaphone, Search, Sparkles, Video, Loader2, Globe, Wand2, CreditCard, Music, Plus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

type BlockOption = {
    id: string;
    icon?: string;
    color?: string;
    defaults?: any;
    label?: string;
    desc?: string;
};

type CategoryInfo = {
    color: string;
    background_color: string;
    icon: string;
};

type CategoryData = {
    info: CategoryInfo;
    blocks: BlockOption[];
};

type BlockCategoryMap = Record<string, CategoryData>;

const getLucideIcon = (id: string, category: string) => {
    const val = id.toLowerCase();
    if (val.includes("link")) return LinkIcon;
    if (val.includes("heading")) return Layers;
    if (val.includes("paragraph")) return Megaphone;
    if (val.includes("avatar") || val.includes("header")) return Sparkles;
    if (val.includes("image")) return ImageIcon;
    if (val.includes("socials")) return Globe;
    if (val.includes("collector")) return Megaphone;
    if (val.includes("paypal")) return CreditCard;
    if (val.includes("soundcloud") || val.includes("spotify") || val.includes("music")) return Music;
    if (val.includes("youtube") || val.includes("tiktok") || val.includes("video") || val.includes("vimeo") || val.includes("twitch")) return Video;
    
    if (category === "standard") return Zap;
    if (category === "advanced") return Wand2;
    if (category === "payments") return CreditCard;
    if (category === "embeds") return Music;
    
    return Sparkles;
};

export default function BlockMarketplaceContent({
    onSelect,
}: {
    onSelect: (type: string) => void;
}) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [internalCategories, setInternalCategories] = useState<BlockCategoryMap>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const res = await api.get("/bio/block-types");
                const data = res.data?.data || {};
                setInternalCategories(data);
            } catch (err) {
                console.error("Failed to fetch block types", err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const categoriesList = useMemo(
        () => Object.entries(internalCategories || {}).filter(([, data]) => Array.isArray(data.blocks) && data.blocks.length > 0),
        [internalCategories]
    );

    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase();
        return categoriesList
            .filter(([category]) => activeCategory === "all" || category === activeCategory)
            .map(([category, data]) => {
                const filteredItems = data.blocks.filter((item) => {
                    const haystack = [item.id, category].filter(Boolean).join(" ").toLowerCase();
                    return !term || haystack.includes(term);
                });
                return [category, { ...data, blocks: filteredItems }] as const;
            })
            .filter(([, data]) => data.blocks.length > 0);
    }, [activeCategory, categoriesList, search]);

    const allCount = categoriesList.reduce((count, [, data]) => count + data.blocks.length, 0);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <Loader2 className="w-12 h-12 text-primary animate-spin relative" />
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Syncing Modules...</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="bg-white/50 dark:bg-slate-900/50 -mx-6 px-6 py-6 mb-8 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Type to find modules..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-primary/20 text-[13px] font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                            className={cn(
                                "h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeCategory === "all"
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white dark:bg-slate-950 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-primary/30"
                            )}
                        >
                            All ({allCount})
                        </button>
                        {categoriesList.map(([category, data]) => (
                            <button
                                type="button"
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={cn(
                                    "h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeCategory === category
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "bg-white dark:bg-slate-950 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-primary/30"
                                )}
                            >
                                {category} ({data.blocks.length})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-12 pb-12">
                {filteredCategories.map(([category, data]) => (
                    <div key={category} className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.info.color }} />
                                {category}
                            </h3>
                            <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {data.blocks.map((item) => {
                                const Icon = getLucideIcon(item.id, category);
                                const itemColor = item.color || data.info.color;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onSelect(item.id)}
                                        className="group relative flex flex-col items-start p-7 rounded-[38px] bg-white dark:bg-slate-900/60 border-2 border-slate-100/80 dark:border-slate-800/50 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-500 text-left overflow-hidden active:scale-[0.97]"
                                    >
                                        <div className="absolute -top-10 -right-10 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity duration-700"
                                            style={{ backgroundColor: itemColor }} />
                                            
                                        <div className="relative z-10 w-16 h-16 rounded-[22px] flex items-center justify-center mb-6 transition-all duration-700 group-hover:scale-110 group-hover:rotate-[8deg] ring-8 ring-transparent group-hover:ring-primary/5 shadow-inner overflow-hidden"
                                            style={{ backgroundColor: `${itemColor}15`, color: itemColor }}>
                                            <Icon size={24} className="transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <div className="relative z-10 space-y-2">
                                            <h4 className="text-[16px] font-black text-slate-900 dark:text-white capitalize tracking-tight flex items-center gap-2">
                                                {item.id.replace(/_/g, " ")}
                                                {item.id === 'link' && <Sparkles size={12} className="text-amber-400 animate-pulse" />}
                                            </h4>
                                            <p className="text-[11px] font-bold text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 uppercase tracking-widest leading-relaxed transition-colors">
                                                Add {item.id.replace(/_/g, " ")} module to your dashboard
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50 w-full flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                                Select Module <ArrowRight size={14} />
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-xl mb-6">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No Modules Found</h3>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Try adjusting your search filters for "{search}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}