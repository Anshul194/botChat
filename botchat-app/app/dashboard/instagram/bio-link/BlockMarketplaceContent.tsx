"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight, Image as ImageIcon, Layers, Link as LinkIcon, Megaphone, Search, Sparkles, Video, Loader2, Globe, Wand2, CreditCard, Music, Plus, Zap, LayoutTemplate, CircleDot, Hexagon, Grid, ShoppingBag, User, Info, ShieldCheck } from "lucide-react";
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
    if (val.includes("image") || val.includes("media") || val.includes("photo")) return ImageIcon;
    if (val.includes("socials")) return Globe;
    if (val.includes("collector") || val.includes("form")) return Megaphone;
    if (val.includes("paypal")) return CreditCard;
    if (val.includes("soundcloud") || val.includes("spotify") || val.includes("music")) return Music;
    if (val.includes("youtube") || val.includes("tiktok") || val.includes("video") || val.includes("vimeo") || val.includes("twitch") || val.includes("reels") || val.includes("shorts")) return Video;
    
    if (val.includes("hero")) return LayoutTemplate;
    if (val.includes("stats")) return CircleDot;
    if (val.includes("brands") || val.includes("logos")) return Hexagon;
    if (val.includes("portfolio")) return Grid;
    if (val.includes("services")) return ShoppingBag;
    if (val.includes("testimonials")) return User;
    if (val.includes("faq")) return Info;
    if (val.includes("cta") || val.includes("urgency")) return Zap;
    if (val.includes("countdown")) return Loader2;
    if (val.includes("trust")) return ShieldCheck;
    
    if (category === "standard") return LayoutTemplate;
    if (category === "advanced") return Wand2;
    if (category === "payments") return CreditCard;
    if (category === "embeds") return Music;
    
    return Sparkles;
};

const DEFAULT_BLOCKS: BlockCategoryMap = {
    standard: {
        info: { color: "#3b82f6", background_color: "#eff6ff", icon: "layout" },
        blocks: [
            { id: "hero", label: "Hero Section", desc: "Main introduction with image and CTA", color: "#3b82f6" },
            { id: "heading", label: "Heading", desc: "Section title or large text", color: "#6366f1" },
            { id: "paragraph", label: "Text Block", desc: "Detailed description or biography", color: "#64748b" },
            { id: "avatar", label: "Profile Header", desc: "Avatar with name and username", color: "#ec4899" },
            { id: "image", label: "Image Block", desc: "High-quality photo or banner", color: "#f59e0b" },
            { id: "socials", label: "Social Links", desc: "Connect your social profiles", color: "#06b6d4" },
            { id: "link_grid_section", label: "Link Grid", desc: "Small icon-based links", color: "#8b5cf6" },
            { id: "link_carousel_section", label: "Link Carousel", desc: "Horizontal scrolling links", color: "#ec4899" },
        ]
    },
    advanced: {
        info: { color: "#8b5cf6", background_color: "#f5f3ff", icon: "zap" },
        blocks: [
            { id: "services", label: "Services", desc: "List your core offerings", color: "#8b5cf6" },
            { id: "portfolio", label: "Portfolio Grid", desc: "Showcase your best work", color: "#10b981" },
            { id: "testimonials", label: "Testimonials", desc: "Client success stories", color: "#f43f5e" },
            { id: "faq", label: "FAQ", desc: "Frequently asked questions", color: "#64748b" },
            { id: "cta", label: "Call to Action", desc: "Highlight a priority link", color: "#f97316" },
            { id: "stats", label: "Statistics", desc: "Display your achievements", color: "#2563eb" },
            { id: "brands", label: "Brand Logos", desc: "Logos of partners or clients", color: "#475569" },
            { id: "countdown_section", label: "Countdown", desc: "Build urgency for your next drop", color: "#f97316" },
            { id: "trust_badges_section", label: "Trust Badges", desc: "Showcase your credibility", color: "#10b981" },
        ]
    },
    embeds: {
        info: { color: "#f43f5e", background_color: "#fff1f2", icon: "music" },
        blocks: [
            { id: "youtube", label: "YouTube Video", desc: "Embed a video or channel", color: "#ff0000" },
            { id: "tiktok", label: "TikTok", desc: "Showcase your latest clips", color: "#000000" },
            { id: "spotify", label: "Spotify", desc: "Embed a track or playlist", color: "#1db954" },
            { id: "soundcloud", label: "SoundCloud", desc: "Share your audio tracks", color: "#ff5500" },
        ]
    }
};

export default function BlockMarketplaceContent({
    onSelect,
}: {
    onSelect: (type: string, defaults?: any) => void;
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
                const data = res.data?.data || res.data || {};
                
                if (Object.keys(data).length > 0) {
                    setInternalCategories(data);
                } else {
                    setInternalCategories(DEFAULT_BLOCKS);
                }
            } catch (err) {
                console.error("Failed to fetch block types, using fallback", err);
                setInternalCategories(DEFAULT_BLOCKS);
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
            <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Loading Library...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#020617]">
            {/* Professional Header & Search */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#020617] sticky top-0 z-20">
                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search for links, embeds, or tools..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary/50 text-[14px] font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-950"
                    />
                </div>
                
                {/* Minimalist Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveCategory("all")}
                        className={cn(
                            "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap",
                            activeCategory === "all"
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                : "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        All Modules <span className="opacity-50 ml-1">({allCount})</span>
                    </button>
                    {categoriesList.map(([category, data]) => (
                        <button
                            type="button"
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap capitalize",
                                activeCategory === category
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                    : "bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                        >
                            {category} <span className="opacity-50 ml-1">({data.blocks.length})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dense Professional Grid */}
            <div className="p-4 space-y-6">
                {filteredCategories.map(([category, data]) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400 pl-1">
                            {category}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                            {data.blocks.map((item) => {
                                const Icon = getLucideIcon(item.id, category);
                                const itemColor = item.color || data.info.color || "#64748b";
                                
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onSelect(item.id, item.defaults)}
                                        className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#020617] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all text-left w-full relative overflow-hidden active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        
                                        <div className="relative z-10 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-[1.05]"
                                             style={{ color: itemColor }}>
                                            <Icon size={20} />
                                        </div>

                                        <div className="relative z-10 flex-1 min-w-0 pr-2">
                                            <h4 className="text-[14px] font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2 truncate">
                                                {item.id.replace(/_/g, " ")}
                                            </h4>
                                            <p className="text-[12px] font-medium text-slate-500 truncate mt-0.5">
                                                {item.desc || `Add a ${item.id.replace(/_/g, " ")} block`}
                                            </p>
                                        </div>

                                        <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                                            <Plus size={16} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">No Modules Found</h3>
                        <p className="text-[13px] font-medium text-slate-500">We couldn't find any blocks matching "{search}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}