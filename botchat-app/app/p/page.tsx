"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Phone, ArrowRight, Link as LinkIcon, Grid, ShoppingBag,
    SmartphoneNfc, Layers, Image as ImageIcon, Hexagon, Share2, Check,
} from "lucide-react";
import { resolveApiBaseUrl, resolveXHost } from "@/lib/config";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles } from "@/app/dashboard/instagram/bio-link/TemplateSystem";
import { getUiTypeFromBlock, isMediaType, BLOCK_ICONS, BrandIcon } from "@/app/dashboard/instagram/bio-link/builder-utils";
import { PortfolioLayout } from "@/app/dashboard/instagram/bio-link/layouts/PortfolioLayout";
import { UGCLayout } from "@/app/dashboard/instagram/bio-link/layouts/UGCLayout";
import { OliviaLayout } from "@/app/dashboard/instagram/bio-link/layouts/OliviaLayout";
import { UniversalLayout } from "@/app/dashboard/instagram/bio-link/layouts/UniversalLayout";
import { CreatorStoreLayout } from "@/app/dashboard/instagram/bio-link/layouts/CreatorStoreLayout";
import { InfluencerLayout } from "@/app/dashboard/instagram/bio-link/layouts/InfluencerLayout";
import { InstaProLayout } from "@/app/dashboard/instagram/bio-link/layouts/InstaProLayout";
import { Globe, MessageCircle, User, MoreHorizontal, Instagram, MapPin, ArrowUpRight, Camera, Sparkles, Youtube, Video, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface PublicProfile {
    link_id: string;
    title: string;
    description: string;
    avatar: string;
    email_link: string;
    contact_link: string;
    theme: string;
    theme_name?: string;
    niche?: string;
    template_name?: string;
    layout?: string;
    settings?: any;
    tabs: PublicTab[];
    url: string;
    blocks?: any[];
}
interface PublicTab {
    id: number;
    title: string;
    sections: PublicSection[];
}
interface PublicSection {
    id: number;
    title: string;
    blocks: PublicBlock[];
}
interface PublicBlock {
    id: number;
    type: string;
    items: any[];
}

// ─────────────────────────────────────────────────────────
// Fetch helper
// ─────────────────────────────────────────────────────────
async function fetchPublicProfile(id: string): Promise<PublicProfile | null> {
    if (!id) return null;
    try {
        const baseUrl = resolveApiBaseUrl();
        const url = `${baseUrl}/public/bio/pages/${id}`;
        console.log("Fetching public profile directly from:", url);

        const res = await fetch(url, {
            headers: { 
                "x-host": resolveXHost(), 
                "Accept": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("API fetch failed with status:", res.status);
            return null;
        }
        
        const json = await res.json();
        // The single page API usually returns the page object in a 'data' wrapper
        const profile = json?.data || json;
        
        if (!profile || (!profile.link_id && !profile.id)) {
            console.warn("Invalid profile data received from:", url);
            return null;
        }
        
        return profile;
    } catch (err) {
        console.error("fetchPublicProfile error:", err);
        return null;
    }
}

// ─────────────────────────────────────────────────────────
// Share Button
// ─────────────────────────────────────────────────────────
function ShareButton({ username }: { username: string }) {
    const [copied, setCopied] = useState(false);
    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (navigator.share) {
            try { await navigator.share({ title: `@${username}'s Bio`, url }); return; } catch { }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };
    return (
        <button onClick={handleShare}
            className="h-9 px-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[12px] font-bold flex items-center gap-2 hover:bg-white/30 transition-all active:scale-95">
            {copied ? <><Check size={13} /> Copied!</> : <><Share2 size={13} /> Share</>}
        </button>
    );
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────
// ... same as before
// ─────────────────────────────────────────────────────────
// Premium Sub-components
// ─────────────────────────────────────────────────────────

function CarouselBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="w-full relative py-2">
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 px-1">
                {items.map((item: any, i: number) => (
                    <motion.a 
                        key={i} 
                        href={item.url || item.location_url || item.link || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 w-[240px] snap-center bg-white/10 backdrop-blur-md rounded-[32px] overflow-hidden shadow-2xl border border-white/20 flex flex-col group transition-shadow duration-500 hover:shadow-pink-500/20"
                    >
                        <div className="w-full h-[140px] bg-white/5 relative overflow-hidden">
                            {item.image_url || item.image
                                ? <img src={item.image_url || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon size={28} className="text-white/20" /></div>
                            }
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h4 className="font-black text-[15px] text-white leading-tight mb-2 truncate">{item.title || item.name || "Link"}</h4>
                            {(item.description || item.subtitle) && <p className="text-[12px] text-white/50 line-clamp-2 mb-4 font-medium">{item.description || item.subtitle}</p>}
                            <div className="mt-auto">
                                <span className="text-pink-500 text-[12px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                                    {item.button_text || "Explore"} <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
}

function HeroBlockView({ item }: { item: any }) {
    if (!item) return null;
    return (
        <a href={item.url || item.cta_link || "#"} target="_blank" rel="noopener noreferrer"
            className="w-full block bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 group transition-all duration-700 hover:-translate-y-1 relative h-[240px]">
            {item.image_url || item.image || item.background_image
                ? <img src={item.image_url || item.image || item.background_image} className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-1000" />
                : <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                {item.badge && <span className="mb-3 inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-[0.2em] text-white self-start">{item.badge}</span>}
                <h4 className="font-black text-[24px] text-white leading-[1.1] mb-4 drop-shadow-xl">{item.title || item.headline || "Featured Link"}</h4>
                <div className="flex">
                    <span className="bg-white text-black rounded-full text-[12px] font-black uppercase tracking-widest px-6 py-3 flex items-center gap-2 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-xl">
                        {item.button_text || item.cta_text || "View Now"} <ArrowRight size={14} />
                    </span>
                </div>
            </div>
        </a>
    );
}

function GridBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="grid grid-cols-2 gap-4 w-full">
            {items.map((item: any, i: number) => (
                <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                    className="bg-white/5 backdrop-blur-lg rounded-[28px] overflow-hidden shadow-lg border border-white/10 flex flex-col group transition-all duration-500 hover:-translate-y-1 hover:bg-white/10">
                    <div className="w-full h-[120px] bg-white/5 relative overflow-hidden">
                        {item.image_url || item.image
                            ? <img src={item.image_url || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            : <div className="absolute inset-0 flex items-center justify-center"><Grid size={24} className="text-white/20" /></div>
                        }
                    </div>
                    <div className="p-4 text-center">
                        <h4 className="font-black text-[13px] text-white truncate group-hover:text-pink-400 transition-colors">{item.title || item.name || "Link"}</h4>
                    </div>
                </a>
            ))}
        </div>
    );
}

function ProductsBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 px-1">
            {items.map((item: any, i: number) => (
                <a key={i} href={item.url || item.link || "#"} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-[180px] bg-white/5 backdrop-blur-md rounded-[28px] overflow-hidden border border-white/10 flex flex-col group transition-all duration-500 hover:-translate-y-2">
                    <div className="w-full h-[180px] bg-white/5 relative p-4 overflow-hidden">
                        {item.image_url || item.image
                            ? <img src={item.image_url || item.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                            : <div className="absolute inset-0 flex items-center justify-center"><ShoppingBag size={32} className="text-white/20" /></div>
                        }
                    </div>
                    <div className="p-4 flex flex-col flex-1 text-center bg-white/5">
                        <h4 className="font-black text-[14px] text-white line-clamp-1 mb-1">{item.title || item.name || "Product"}</h4>
                        {item.price && <p className="text-[12px] font-black text-pink-400 mb-3">{item.price}</p>}
                        <div className="mt-auto">
                            <span className="w-full bg-white text-black text-[10px] font-black uppercase tracking-widest py-2 rounded-xl inline-block group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                {item.button_text || item.cta_text || "Buy Now"}
                            </span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
}

function AppsBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="space-y-3 w-full">
            {items.map((item: any, i: number) => (
                <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                    className="w-full bg-white/5 backdrop-blur-md rounded-[24px] p-4 border border-white/10 flex items-center gap-4 group transition-all duration-300 hover:bg-white/10">
                    <div className="w-[64px] h-[64px] rounded-[18px] bg-white/10 overflow-hidden flex-shrink-0 border border-white/10">
                        {item.image_url || item.image
                            ? <img src={item.image_url || item.image} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><SmartphoneNfc size={24} className="text-white/20" /></div>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-[15px] text-white truncate group-hover:text-pink-400 transition-colors">{item.title || item.name || "App"}</h4>
                        {(item.description || item.subtitle) && <p className="text-[12px] text-white/40 truncate font-medium">{item.description || item.subtitle}</p>}
                    </div>
                    <span className="flex-shrink-0 bg-pink-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
                        {item.button_text || "GET"}
                    </span>
                </a>
            ))}
        </div>
    );
}

function MediaBlockView({ items, type }: { items: any[], type: string }) {
    if (!items.length) return null;
    const isVertical = type === "vertical_media";
    const isSquare = type === "square_media";
    const h = isVertical ? "h-[220px] w-[140px]" : isSquare ? "h-[160px] w-[160px]" : "h-[120px] w-[220px]";
    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1">
            {items.map((item: any, i: number) => (
                <div key={i} className={`flex-shrink-0 ${h} rounded-[24px] bg-white/5 overflow-hidden border border-white/10 shadow-xl group cursor-pointer`}>
                    {item.image_url || item.image
                        ? <img src={item.image_url || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-white/20" /></div>
                    }
                </div>
            ))}
        </div>
    );
}

function LogosBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="flex flex-wrap gap-5 justify-center py-4">
            {items.map((item: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-[20px] bg-white/5 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden flex items-center justify-center p-3 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/10">
                        {item.image_url || item.image
                            ? <img src={item.image_url || item.image} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                            : <Hexagon size={24} className="text-white/20" />
                        }
                    </div>
                    {item.title && <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/60 transition-colors">{item.title}</span>}
                </div>
            ))}
        </div>
    );
}

function BentoPortfolioView({ title, items }: { title?: string, items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="w-full space-y-6">
            {title && <h3 className="text-[24px] font-black tracking-tight text-white px-1">{title}</h3>}
            <div className="grid grid-cols-6 grid-rows-2 gap-3 h-[400px]">
                {items.slice(0, 4).map((item, i) => (
                    <div key={i} className={cn(
                        "relative rounded-[32px] overflow-hidden group border border-white/10 shadow-2xl",
                        i === 0 ? "col-span-4 row-span-2" : i === 1 ? "col-span-2 row-span-1" : "col-span-2 row-span-1"
                    )}>
                        {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full bg-white/5" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                            <p className="text-white font-black text-[14px] leading-tight mb-1">{item.title}</p>
                            {item.subtitle && <p className="text-white/50 text-[11px] font-medium">{item.subtitle}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TransformationStoryView({ title, before_image, after_image, description }: any) {
    return (
        <div className="w-full bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 p-8 space-y-6">
            {title && <h3 className="text-xl font-black text-white text-center">{title}</h3>}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="aspect-[3/4] rounded-[24px] overflow-hidden border border-white/5 relative">
                        <img src={before_image} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-white tracking-widest">Before</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="aspect-[3/4] rounded-[24px] overflow-hidden border border-pink-500/30 relative shadow-[0_0_30px_rgba(219,39,119,0.2)]">
                        <img src={after_image} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 px-3 py-1 bg-pink-500 backdrop-blur-md rounded-full text-[9px] font-black uppercase text-white tracking-widest">After</span>
                    </div>
                </div>
            </div>
            {description && <p className="text-center text-white/60 text-[14px] leading-relaxed font-medium">{description}</p>}
        </div>
    );
}

function TimelineView({ title, steps }: { title?: string, steps: any[] }) {
    if (!steps.length) return null;
    return (
        <div className="w-full space-y-8 py-4">
            {title && <h3 className="text-2xl font-black text-white px-2 tracking-tight">{title}</h3>}
            <div className="space-y-0 relative ml-4 border-l-2 border-white/10 pl-10">
                {steps.map((step, i) => (
                    <div key={i} className="relative pb-10 last:pb-0">
                        <div className="absolute -left-[51px] top-0 w-5 h-5 rounded-full bg-pink-500 border-4 border-black z-10 shadow-[0_0_15px_rgba(219,39,119,0.5)]" />
                        <div className="bg-white/5 backdrop-blur-lg rounded-[24px] p-6 border border-white/10 hover:bg-white/10 transition-colors group">
                            <span className="text-pink-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Step 0{i + 1}</span>
                            <h4 className="text-white font-black text-[18px] mb-2 group-hover:text-pink-400 transition-colors">{step.title}</h4>
                            <p className="text-white/50 text-[13px] leading-relaxed font-medium">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatsFloatingView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="grid grid-cols-2 gap-4 w-full py-4">
            {items.map((item, i) => (
                <div key={i} className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
                    <span className="text-[32px] font-black text-white tracking-tighter mb-1 drop-shadow-2xl group-hover:scale-110 transition-transform">{item.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{item.label}</span>
                </div>
            ))}
        </div>
    );
}

function VideoShowcaseView({ title, video_url, thumbnail, description }: any) {
    return (
        <div className="w-full bg-black rounded-[40px] overflow-hidden border border-white/10 shadow-2xl group">
            <div className="aspect-video relative overflow-hidden">
                <img src={thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                </div>
            </div>
            <div className="p-8 space-y-3">
                {title && <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>}
                {description && <p className="text-white/50 text-[14px] leading-relaxed font-medium">{description}</p>}
                <a href={video_url} target="_blank" className="inline-flex items-center gap-2 text-pink-500 font-black text-[12px] uppercase tracking-widest pt-2 hover:gap-3 transition-all">
                    Watch Reel <ArrowRight size={14} />
                </a>
            </div>
        </div>
    );
}


function BlockRenderer({ block, theme }: { block: PublicBlock; theme: any }) {
    const type = getUiTypeFromBlock(block);
    const settings = block.settings || {};
    const items = settings.items || block.items || settings.links || settings.products || settings.logos || settings.plans || settings.steps || [];
    const alignment = settings.text_alignment || "center";
    const effectiveTextColor = theme.textColor || "#000000";
    const displayLabel = settings.title || settings.text || settings.name || settings.headline || settings.brand_name;

    switch (type) {
        case "links_carousel":
        case "featured_links_section": return <CarouselBlockView items={items} />;
        case "hero_single_link": return <HeroBlockView item={items[0]} />;
        case "hero_premium_section": return <HeroBlockView item={settings} />;
        case "links_grid": return <GridBlockView items={items} />;
        case "add_products":
        case "digital_products_section": return <ProductsBlockView items={items} />;
        case "add_apps": return <AppsBlockView items={items} />;
        case "vertical_media":
        case "square_media":
        case "horizontal_media": return <MediaBlockView items={items} type={type} />;
        case "add_logos":
        case "featured_brands_section":
        case "brands_section": return <LogosBlockView items={items} />;
        case "bento_portfolio_grid_section": return <BentoPortfolioView title={settings.title} items={items} />;
        case "transformation_story_section": return <TransformationStoryView {...settings} />;
        case "services_timeline_section": return <TimelineView title={settings.title} steps={items} />;
        case "floating_stats_section": return <StatsFloatingView items={items} />;
        case "video_showcase_section": return <VideoShowcaseView {...settings} />;
        case "hero_section":
        case "hero_aesthetic_section": return <HeroBlockView item={settings} />;
        
        case "link":
            return (
                <a href={block.location_url || settings.location_url || settings.url || "#"} target="_blank" rel="noopener noreferrer"
                   className="w-full flex items-center justify-center min-h-[72px] py-4 px-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 group relative overflow-hidden" 
                   style={{ background: theme.btnStyle?.background || "rgba(255,255,255,0.05)", backdropFilter: 'blur(10px)', color: theme.btnStyle?.color || theme.textColor, borderRadius: theme.btnStyle?.borderRadius || "24px" }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {settings.icon ? (
                         <i className={`${settings.icon} absolute left-8 text-xl opacity-100 group-hover:scale-110 transition-transform`}></i>
                    ) : (
                         <div className="absolute left-8 flex items-center justify-center opacity-60 group-hover:scale-110 transition-all">
                             <BrandIcon name={displayLabel || "globe"} size={22} />
                         </div>
                    )}
                    <span className="font-black text-[16px] tracking-tight truncate max-w-[70%]">{displayLabel || "Open Website"}</span>
                    <ArrowRight size={18} className="absolute right-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </a>
            );

        case "modal_text":
            return (
                <button className="w-full flex items-center justify-center min-h-[72px] py-4 px-8 shadow-xl transition-all duration-300 hover:scale-[1.02] border border-white/10 group relative overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.05)", backdropFilter: 'blur(10px)', color: theme.textColor, borderRadius: "24px" }}>
                    <span className="font-black text-[16px] tracking-tight">{displayLabel || "Read More"}</span>
                    <Layers size={18} className="absolute right-8 opacity-20 group-hover:opacity-100 transition-all" />
                </button>
            );

        case "heading":
            return (
                <div className="pt-10 pb-4" style={{ textAlign: alignment as any }}>
                    <h2 className="text-[32px] font-black tracking-tighter leading-none" style={{ color: effectiveTextColor }}>
                        {displayLabel || "Untitled Section"}
                    </h2>
                    <div className="w-12 h-1 bg-pink-500 mt-4 rounded-full inline-block" />
                </div>
            );

        case "paragraph":
            return (
                <div className="pb-4" style={{ textAlign: alignment as any }}>
                    <p className="text-[16px] leading-relaxed opacity-60 font-medium whitespace-pre-line" style={{ color: effectiveTextColor }}>
                        {settings.description || settings.text}
                    </p>
                </div>
            );

        case "avatar":
            return (
                <div className="flex flex-col items-center py-10 group">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-pink-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <div className="relative overflow-hidden border-[4px] shadow-2xl border-white/20 transition-transform duration-700 group-hover:scale-105" style={{ borderRadius: '9999px', width: settings.size || 140, height: settings.size || 140 }}>
                            <img src={settings.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    {displayLabel && (
                        <p className="mt-6 text-[22px] font-black tracking-tight" style={{ color: effectiveTextColor }}>{displayLabel}</p>
                    )}
                </div>
            );

        case "socials":
            const rawSocials = settings.socials || items || [];
            const socialsList = Array.isArray(rawSocials) 
                ? rawSocials 
                : (rawSocials && typeof rawSocials === 'object')
                    ? Object.entries(rawSocials).map(([key, value]) => ({ type: key, link: value as string }))
                    : [];

            return (
                <div className="flex flex-wrap items-center gap-5 py-8" style={{ justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>
                    {socialsList.map((social: any, i: number) => {
                        const sLink = social.link || social.url || social.location_url;
                        if (!sLink && !social.type) return null;
                        
                        const finalLink = sLink?.includes("@") ? `mailto:${sLink}` : sLink;
                        return (
                            <a key={i} href={finalLink || "#"} target="_blank" rel="noopener noreferrer"
                                className="w-14 h-14 flex items-center justify-center bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[20px] hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all group">
                                <span className="text-white group-hover:text-pink-400 transition-colors">
                                    <BrandIcon name={social.type || social.icon || social.name || "globe"} size={24} />
                                </span>
                            </a>
                        );
                    })}
                </div>
            );

        case "email_collector":
        case "phone_collector":
        case "contact_collector":
            return (
                <div className="w-full p-10 rounded-[40px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-6">
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-white tracking-tight">{settings.title || settings.name || "Get in Touch"}</h3>
                        {settings.description && <p className="text-[14px] text-white/50 font-medium leading-relaxed">{settings.description}</p>}
                    </div>
                    <div className="space-y-4">
                        <input readOnly placeholder={settings.email_placeholder || settings.phone_placeholder || "Your info..."} className="w-full h-14 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold outline-none focus:border-pink-500/50 transition-colors" />
                        <button className="w-full h-14 rounded-2xl bg-white text-black font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:bg-pink-500 hover:text-white transition-all active:scale-95">
                            {settings.button_text || "Submit Now"}
                        </button>
                    </div>
                </div>
            );

        case "hero_section":
        case "hero_aesthetic_section":
            return (
                <div className="relative w-[calc(100%+3rem)] -mx-6 mt-0 mb-10 overflow-hidden shadow-2xl bg-black group min-h-[460px] flex items-center justify-center">
                    {settings.image || settings.background_image ? (
                        <img src={settings.image || settings.background_image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[3s]" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="relative z-10 p-10 w-full text-center flex flex-col items-center">
                        {(settings.brand_name || settings.headline) && (
                            <p className="text-[12px] font-black uppercase tracking-[0.4em] text-pink-500 mb-6 drop-shadow-md animate-pulse">{settings.brand_name || settings.headline}</p>
                        )}
                        <h2 className="text-[48px] font-black leading-[0.95] tracking-tighter text-white mb-8 drop-shadow-2xl">
                            {settings.title || "Elevate Your Vision"}
                        </h2>
                        {(settings.subtitle || settings.subheadline || settings.description) && (
                            <p className="text-[17px] text-white/70 font-medium leading-relaxed max-w-[90%] mb-10 drop-shadow-md">
                                {settings.subtitle || settings.subheadline || settings.description}
                            </p>
                        )}
                        {settings.cta_text && (
                            <button className="px-12 py-5 rounded-full bg-white text-black text-[13px] font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-110 hover:bg-pink-500 hover:text-white transition-all active:scale-95">
                                {settings.cta_text}
                            </button>
                        )}
                    </div>
                </div>
            );

        case "stats_section":
        case "stats_minimal_section":
            return (
                <div className="w-full py-10 border-y border-white/10 my-6">
                    <div className="grid grid-cols-3 gap-6 divide-x divide-white/10">
                        {(settings.items || []).slice(0, 3).map((s: any, i: number) => (
                            <div key={i} className="flex flex-col items-center text-center px-4 group">
                                <span className="text-[36px] font-black tracking-tighter text-white group-hover:scale-110 transition-transform duration-500">{s.value || "—"}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-2">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "header_profile_section":
            return (
                <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-12 mb-10 overflow-hidden rounded-b-[64px] bg-white/5 backdrop-blur-xl border-b border-white/10 pb-12 shadow-2xl">
                    {settings.cover_image ? (
                        <img src={settings.cover_image} className="w-full h-[240px] object-cover" />
                    ) : (
                        <div className="w-full h-[240px] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20" />
                    )}
                    <div className="flex flex-col items-center text-center -mt-20 relative z-10 px-8">
                        <div className="p-2 rounded-full bg-black/20 backdrop-blur-3xl mb-6 shadow-2xl border border-white/20">
                            {settings.avatar ? (
                                <img src={settings.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-white" />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center"><User size={48} className="text-white/20" /></div>
                            )}
                        </div>
                        <h2 className="text-[32px] font-black tracking-tight text-white mb-3">{settings.name || "Profile Name"}</h2>
                        {settings.bio && <p className="text-[15px] font-medium text-white/60 leading-relaxed max-w-[85%]">{settings.bio}</p>}
                    </div>
                </div>
            );

        case "portfolio_section":
        case "portfolio_minimal_section":
            return (
                <div className="w-full space-y-6 my-8">
                    <h3 className="text-[26px] font-black tracking-tight text-white px-2">{settings.title || "Selected Works"}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {(settings.items || []).slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className={cn("relative rounded-[32px] overflow-hidden bg-white/5 group border border-white/10 shadow-2xl", i === 0 ? "col-span-2 aspect-[2/1.1]" : "aspect-square")}>
                                {item.image && <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                    <p className="text-[16px] font-black text-white tracking-tight">{item.title}</p>
                                    {item.subtitle && <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">{item.subtitle}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "services_section":
            return (
                <div className="w-full space-y-4 my-8">
                    {(settings.items || []).map((s: any, i: number) => (
                        <div key={i} className="flex items-center gap-6 p-6 rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-20 h-20 rounded-[24px] overflow-hidden shrink-0 border border-white/10 shadow-xl">
                                {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-white/5"><Sparkles size={28} className="text-white/20" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-[18px] font-black text-white tracking-tight mb-1 group-hover:text-pink-400 transition-colors">{s.title}</h4>
                                <p className="text-[13px] text-white/40 leading-relaxed font-medium line-clamp-2">{s.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            );

        case "testimonials_section":
        case "testimonial_highlight_section":
        case "premium_testimonials_section":
            return (
                <div className="w-full py-12 px-8 rounded-[48px] bg-white/5 backdrop-blur-2xl border border-white/10 text-center flex flex-col items-center my-8 shadow-2xl">
                    <div className="w-16 h-16 mb-8 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                        <span className="text-3xl font-serif text-pink-500">"</span>
                    </div>
                    <div className="space-y-8">
                        {(settings.items || [{ quote: settings.quote, author_name: settings.author_name, author_image: settings.author_image }]).slice(0, 1).map((t: any, i: number) => (
                            <div key={i} className="space-y-8">
                                <p className="text-[20px] font-bold text-white leading-relaxed italic">"{t.quote || t.description}"</p>
                                <div className="flex flex-col items-center gap-3">
                                    {t.author_image && <img src={t.author_image} className="w-16 h-16 rounded-full border-2 border-pink-500 shadow-xl object-cover" />}
                                    <div className="space-y-1">
                                        <p className="text-[14px] font-black uppercase tracking-[0.2em] text-white">{t.author_name || t.author}</p>
                                        {t.author_role && <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{t.author_role}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "faq_section":
        case "faq_cards_section":
        case "faq_accordion_section":
            return (
                <div className="w-full space-y-6 my-8">
                    <h3 className="text-2xl font-black text-white px-2">{settings.title || "Questions?"}</h3>
                    <div className="space-y-3">
                        {(settings.items || []).map((f: any, i: number) => (
                            <div key={i} className="bg-white/5 backdrop-blur-xl rounded-[28px] border border-white/10 p-6 hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-[16px] font-black text-white group-hover:text-pink-400 transition-colors">{f.question}</p>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0"><ArrowRight size={14} className="text-white/20 rotate-90" /></div>
                                </div>
                                {f.answer && <p className="text-[13px] text-white/40 mt-4 leading-relaxed font-medium">{f.answer}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "cta_section":
        case "cta_fullscreen_section":
        case "floating_cta_banner_section":
            return (
                <div className="w-full p-12 rounded-[48px] bg-gradient-to-br from-pink-600 to-indigo-700 text-center flex flex-col items-center my-10 shadow-[0_30px_60px_rgba(219,39,119,0.3)] border border-white/20">
                    <h3 className="text-[36px] font-black leading-tight tracking-tighter text-white mb-4">{settings.title || "Let's Create Magic"}</h3>
                    {settings.description && <p className="text-[16px] text-white/80 font-medium mb-10 max-w-[85%]">{settings.description}</p>}
                    <button className="px-10 py-5 rounded-full bg-white text-black text-[13px] font-black uppercase tracking-widest shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        {settings.button_text || settings.button?.label || "Get Started"}
                    </button>
                </div>
            );

        case "pricing_cards_section":
            return (
                <div className="w-full space-y-6 my-8">
                    {settings.title && <h3 className="text-2xl font-black text-white text-center tracking-tight">{settings.title}</h3>}
                    <div className="flex gap-5 overflow-x-auto pb-4 snap-x no-scrollbar px-1">
                        {(settings.plans || []).map((plan: any, i: number) => (
                            <div key={i} className="w-[280px] shrink-0 snap-center p-8 rounded-[40px] bg-white/5 backdrop-blur-2xl border border-white/10 flex flex-col shadow-2xl hover:bg-white/10 transition-colors group">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-2">{plan.name}</span>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-[42px] font-black text-white tracking-tighter group-hover:scale-110 transition-transform origin-left">{plan.price}</span>
                                    <span className="text-[12px] font-bold text-white/30 uppercase tracking-widest">/mo</span>
                                </div>
                                <div className="space-y-4 mb-8 flex-1">
                                    {(plan.features || []).map((f: any, fi: number) => (
                                        <div key={fi} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0"><Check size={10} className="text-pink-500" /></div>
                                            <span className="text-[12px] font-medium text-white/60">{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-4 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-pink-500 hover:text-white transition-all">Select Plan</button>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "contact_section":
            return (
                <div className="w-full grid grid-cols-1 gap-3 my-6">
                    {settings.email && (
                        <a href={`mailto:${settings.email}`} className="flex items-center gap-5 p-5 rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center shrink-0 border border-pink-500/20 group-hover:scale-110 transition-transform">
                                <Mail size={22} className="text-pink-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Email Me</p>
                                <p className="text-[15px] font-black text-white truncate">{settings.email}</p>
                            </div>
                            <ArrowRight size={18} className="text-white/20" />
                        </a>
                    )}
                    {settings.phone && (
                        <a href={`tel:${settings.phone}`} className="flex items-center gap-5 p-5 rounded-[24px] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Phone size={22} className="text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">Call Me</p>
                                <p className="text-[15px] font-black text-white truncate">{settings.phone}</p>
                            </div>
                            <ArrowRight size={18} className="text-white/20" />
                        </a>
                    )}
                </div>
            );

        case "paypal":
            return (
                <div className="w-full p-1 rounded-[32px] bg-gradient-to-br from-blue-400 to-indigo-600 shadow-2xl shadow-blue-500/20 group active:scale-95 transition-all">
                    <div className="bg-white rounded-[30px] p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
                            <DollarSign size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">{settings.title || "Secure Payment"}</h3>
                        <p className="text-[28px] font-black text-blue-600 mb-8">{settings.price} {settings.currency}</p>
                        <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-colors">
                            Pay with PayPal
                        </button>
                    </div>
                </div>
            );

        case "youtube":
        case "spotify":
        case "soundcloud":
            const embedUrl = settings.url || block.location_url;
            if (!embedUrl) return null;
            return (
                <div className="w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-black/20 backdrop-blur-xl group">
                    {type === 'youtube' ? (
                        <div className="aspect-video w-full">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeId(embedUrl)}`} frameBorder="0" allowFullScreen />
                        </div>
                    ) : (
                        <div className="p-4">
                            <iframe className="w-full rounded-2xl" src={type === 'spotify' ? `https://open.spotify.com/embed/${embedUrl.includes('track') ? 'track' : 'playlist'}/${embedUrl.split('/').pop()}` : `https://w.soundcloud.com/player/?url=${encodeURIComponent(embedUrl)}`} height={type === 'spotify' ? "152" : "166"} frameBorder="0" allowTransparency={true} allow="encrypted-media" />
                        </div>
                    )}
                </div>
            );

        default:
            return (
                <a href={block.location_url || "#"} className="w-full flex items-center justify-center min-h-[64px] py-4 px-8 shadow-md transition-all hover:scale-[1.01] active:scale-95 border border-white/5" 
                   style={{ background: "rgba(255,255,255,0.03)", backdropFilter: 'blur(10px)', color: theme.textColor, borderRadius: "24px" }}>
                    <span className="font-bold text-[15px] opacity-60 tracking-tight">{displayLabel || type.replace(/_/g, " ")}</span>
                </a>
            );
    }
}

// ─────────────────────────────────────────────────────────
// Client Logic Wrapper
// ─────────────────────────────────────────────────────────
function PublicBioContent() {
    const searchParams = useSearchParams();
    const username = searchParams.get("u") || "user";
    const id = searchParams.get("id");

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<number | null>(null);

    useEffect(() => {
        const targetId = username || id;
        if (!targetId) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        fetchPublicProfile(targetId).then(data => {
            if (!data) { 
                console.error("Profile not found after fetch for:", targetId);
                setNotFound(true); 
            }
            else {
                console.log("Profile data loaded successfully:", data.title);
                setProfile(data);
                if (data.tabs?.length) setActiveTab(data.tabs[0].id);
            }
            setLoading(false);
        });
    }, [id, username]);

    // ── Loading ───────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-[#fce7f3] dark:from-[#140b10] via-white dark:via-[#050505] to-[#fdf2f8] dark:to-[#000000] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#db2777]/20 border-t-[#db2777] animate-spin" />
                <p className="text-[#db2777] font-semibold text-sm animate-pulse">Loading portfolio…</p>
            </div>
        </div>
    );

    // ── Not Found ────────────────────────────────────────
    if (notFound || !profile || !username) return (
        <div className="min-h-screen bg-gradient-to-br from-[#fce7f3] dark:from-[#140b10] via-white dark:via-[#050505] to-[#fdf2f8] dark:to-[#000000] flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center mx-auto">
                    <LinkIcon size={32} className="text-[#db2777]" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Portfolio Not Found</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">This profile doesn't exist or hasn't been set up yet.</p>
            </div>
        </div>
    );

    const rawTabs = profile.tabs || [{ id: 1, title: 'Main', sections: [{ id: 1, blocks: profile.blocks || [] }] }];
    const currentTab = rawTabs.find((t: any) => t.id === activeTab) || rawTabs[0];
    const theme = getTheme(profile.theme_name || profile.theme || profile.settings?.theme);

    const allBlocks = rawTabs.flatMap((t: any) => t.sections || []).flatMap((s: any) => s.blocks || []).filter((b: any) => !b.is_hidden);
    const otherBlocks = currentTab?.sections?.flatMap((s: any) => s.blocks || [])?.filter((b: any) => !b.is_hidden) || [];
    
    // For PortfolioLayout specifically
    const topAvatar = otherBlocks.find(b => getUiTypeFromBlock(b) === "avatar");
    
    const rawLayout = (profile as any).template_name || (profile as any).layout || (profile as any).settings?.layoutStyle || "standard";
    const layoutStyle = rawLayout === 'custom' ? 'standard' : rawLayout;

    if (layoutStyle === "portfolio") {
        return (
            <>
                <title>{profile.title || username} · Portfolio</title>
                <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center w-full">
                    <div className="w-full max-w-[480px] min-h-screen shadow-2xl relative bg-[#f4f6f8] overflow-hidden flex flex-col">
                        <PortfolioLayout
                            profile={profile}
                            tabs={profile.tabs}
                            selectedTabId={activeTab}
                            setSelectedTabId={setActiveTab}
                            instagramUsername={username}
                            otherBlocks={otherBlocks}
                            topAvatar={topAvatar}
                            getUiTypeFromBlock={getUiTypeFromBlock}
                            uiTypeOverrides={{}}
                            isMediaType={isMediaType}
                            getYouTubeId={(url: string) => {
                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                const match = url?.match(regExp);
                                return (match && match[2].length === 11) ? match[2] : null;
                            }}
                            renderBlockUI={(block: any, isTiled: boolean, idx: number) => (
                                <BlockRenderer key={block.id} block={block} theme={theme} />
                            )}
                        />
                    </div>
                </div>
            </>
        );
    }

    if (layoutStyle === "ugc" || layoutStyle === "aesthetic_influencer" || layoutStyle === "influencer") {
        return (
            <>
                <title>{profile.title || username} · Bio</title>
                <div className="min-h-screen flex justify-center w-full" style={theme.bgStyle}>
                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />
                    <div className="w-full max-w-[480px] min-h-screen relative z-10 overflow-hidden flex flex-col">
                        {layoutStyle === "ugc" ? (
                            <UGCLayout
                                theme={theme}
                                profile={profile}
                                otherBlocks={otherBlocks}
                                topAvatar={topAvatar}
                                instagramUsername={username}
                                getUiTypeFromBlock={getUiTypeFromBlock}
                                uiTypeOverrides={{}}
                                isMediaType={isMediaType}
                                renderBlockUI={(block: any) => (
                                    <BlockRenderer key={block.id} block={block} theme={theme} />
                                )}
                            />
                        ) : (
                            <InfluencerLayout profile={profile} tabs={rawTabs} />
                        )}
                    </div>
                </div>
            </>
        );
    }

    if (layoutStyle === "insta_pro") {
        return (
            <>
                <title>{profile.title || username} · Luxury Pro</title>
                <div className="min-h-screen flex justify-center w-full bg-[#050505]">
                    <div className="w-full max-w-[540px] min-h-screen relative overflow-hidden flex flex-col shadow-2xl">
                        <InstaProLayout profile={profile} tabs={rawTabs} />
                    </div>
                </div>
            </>
        );
    }

    if (layoutStyle === "olivia") {
        return (
            <>
                <title>{profile.title || username} · Olivia</title>
                <div className="min-h-screen flex justify-center w-full" style={theme.bgStyle}>
                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />
                    <div className="w-full max-w-[480px] min-h-screen relative z-10 overflow-hidden flex flex-col">
                        <OliviaLayout
                            profile={profile}
                            otherBlocks={otherBlocks}
                            topAvatar={topAvatar}
                            isMediaType={isMediaType}
                            getUiTypeFromBlock={getUiTypeFromBlock}
                            uiTypeOverrides={{}}
                            renderBlockUI={(block: any) => (
                                <BlockRenderer key={block.id} block={block} theme={theme} />
                            )}
                        />
                    </div>
                </div>
            </>
        );
    }

    if (layoutStyle === "universal") {
        return (
            <>
                <title>{profile.title || username} · Universal</title>
                <div className="min-h-screen flex justify-center w-full" style={theme.bgStyle}>
                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />
                    <div className="w-full max-w-[480px] min-h-screen relative z-10 overflow-hidden flex flex-col">
                    <div className="w-full max-w-[540px] min-h-screen relative overflow-hidden flex flex-col">
                        <UniversalLayout
                            profile={profile}
                            otherBlocks={otherBlocks}
                            topAvatar={topAvatar}
                            getUiTypeFromBlock={getUiTypeFromBlock}
                            uiTypeOverrides={{}}
                            renderBlockUI={(block: any) => (
                                <BlockRenderer key={block.id} block={block} theme={theme} />
                            )}
                        />
                    </div>
                </div>
            </>
        );
    }

    if (layoutStyle === "creator_store") {
        return (
            <>
                <title>{profile.title || username} · Store</title>
                <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center w-full">
                    <div className="w-full max-w-[540px] min-h-screen shadow-2xl relative bg-white overflow-hidden flex flex-col">
                        <CreatorStoreLayout
                            profile={profile}
                            otherBlocks={otherBlocks}
                            getUiTypeFromBlock={getUiTypeFromBlock}
                            renderBlockUI={(block: any, isInside: boolean, idx: number) => (
                                <BlockRenderer key={block.id} block={block} theme={theme} />
                            )}
                        />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <title>{profile.title || username} · Bio Link</title>
            <div className="min-h-screen flex justify-center w-full bg-[#f8fafc] dark:bg-[#0f172a]">
                <div className={`w-full max-w-[480px] min-h-screen relative overflow-x-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.1)] border-x border-slate-200 dark:border-white/10`} 
                     style={theme.bgStyle}>
                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />
                    {/* ── Hero Header (Hide for Custom Layout as it uses blocks) ── */}
                    {rawLayout !== 'custom' && (
                        <div className="relative pt-16 pb-10 px-6 flex flex-col items-center text-center">
                            <div className="absolute top-4 right-4 z-10">
                                <ShareButton username={username} />
                            </div>

                            <div className="w-[100px] h-[100px] rounded-full p-[3px] mb-4 flex-shrink-0 shadow-xl"
                                style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}60, ${theme.textColor}30)` }}>
                                <div className="w-full h-full rounded-full overflow-hidden"
                                    style={{ backgroundColor: `${theme.textColor}08` }}>
                                    {profile.avatar
                                        ? <img src={profile.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        : <div className="w-full h-full flex items-center justify-center font-black text-3xl" style={{ color: theme.textColor }}>
                                            {(profile.title || username).charAt(0).toUpperCase()}
                                        </div>
                                    }
                                </div>
                            </div>

                            <h1 className="text-[26px] font-black leading-tight drop-shadow-sm" style={{ color: theme.textColor }}>{profile.title || username}</h1>
                            <p className="text-[13px] font-semibold mt-1 mb-3" style={{ color: `${theme.textColor}B0` }}>@{username}</p>

                            {profile.description && (
                                <p className="text-[14px] font-medium max-w-[300px] leading-relaxed mb-4" style={{ color: `${theme.textColor}E5` }}>{profile.description}</p>
                            )}

                            {(profile.email_link || profile.contact_link) && (
                                <div className="flex gap-3 mt-2">
                                    {profile.email_link && (
                                        <a href={`mailto:${profile.email_link}`}
                                            className="h-11 px-6 rounded-full font-bold text-[13px] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
                                            style={{ backgroundColor: '#ffffff', color: theme.accent }}>
                                            <Mail size={15} /> Email
                                        </a>
                                    )}
                                    {profile.contact_link && (
                                        <a href={`tel:${profile.contact_link}`}
                                            className="h-11 px-6 rounded-full backdrop-blur-md font-bold text-[13px] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
                                            style={{ backgroundColor: `${theme.textColor}20`, border: `1px solid ${theme.textColor}40`, color: theme.textColor }}>
                                            <Phone size={15} /> Contact
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                {/* ── Tab Bar ──────────────────────────────────────── */}
                {(profile.tabs || []).length > 1 && (
                    <div className="sticky top-0 z-20 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar justify-start max-w-lg mx-auto">
                            {profile.tabs.map(tab => (
                                <button key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 px-5 py-2 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "text-white shadow-md"
                                            : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-200"
                                    }`}
                                    style={activeTab === tab.id ? { backgroundColor: theme.accent, boxShadow: `0 4px 12px ${theme.accent}30` } : {}}>
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Content Container ── */}
                <div className={`w-full max-w-[480px] mx-auto px-6 space-y-12 flex flex-col ${rawLayout === 'custom' ? 'py-0' : 'py-12'}`}>
                    {currentTab?.sections?.map(section => {
                        const hasContent = section.blocks?.some(b => (b.items || []).length > 0 || (b.settings && Object.keys(b.settings).length > 0) || b.location_url);
                        return (
                            <div key={section.id} className="space-y-4">
                                {section.title && section.title !== "New Section" && (
                                    <h3 className="text-[11px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest px-1">
                                        {section.title}
                                    </h3>
                                )}
                                {section.blocks?.filter((b: any) => !b.is_hidden).map(block => (
                                    <BlockRenderer key={block.id} block={block} theme={theme} />
                                ))}
                            </div>
                        );
                    })}

                    {(!currentTab?.sections || currentTab.sections.length === 0) && (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">No content here yet.</p>
                        </div>
                    )}
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="py-10 text-center">
                    <a href="/" className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-400 dark:text-slate-500 hover:text-[#db2777] transition-colors">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#db2777] to-[#f472b6] flex items-center justify-center">
                            <LinkIcon size={10} className="text-white" />
                        </div>
                        Made with BotChat Bio
                    </a>
                </div>
            </div>
            </div>
        </>
    );
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-[#db2777]/20 border-t-[#db2777] animate-spin" />
            </div>
        }>
            <PublicBioContent />
        </Suspense>
    );
}
