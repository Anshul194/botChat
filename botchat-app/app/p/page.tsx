"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail, Phone, ArrowRight, Link as LinkIcon, Grid, ShoppingBag,
    SmartphoneNfc, Layers, Image as ImageIcon, Hexagon, Share2, Check,
    Play, DollarSign, Music, ChevronDown, Star, ShieldCheck, Zap,
} from "lucide-react";
import { resolveApiBaseUrl, resolveXHost } from "@/lib/config";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles, isColorLight, isBgLight } from "@/app/dashboard/instagram/bio-link/TemplateSystem";
import { getUiTypeFromBlock, isMediaType, BLOCK_ICONS, BrandIcon } from "@/app/dashboard/instagram/bio-link/builder-utils";
import { PortfolioLayout } from "@/app/dashboard/instagram/bio-link/layouts/PortfolioLayout";
import { UGCLayout } from "@/app/dashboard/instagram/bio-link/layouts/UGCLayout";
import { OliviaLayout } from "@/app/dashboard/instagram/bio-link/layouts/OliviaLayout";
import { UniversalLayout } from "@/app/dashboard/instagram/bio-link/layouts/UniversalLayout";
import { CreatorStoreLayout } from "@/app/dashboard/instagram/bio-link/layouts/CreatorStoreLayout";
import { InfluencerLayout } from "@/app/dashboard/instagram/bio-link/layouts/InfluencerLayout";
import { InstaProLayout } from "@/app/dashboard/instagram/bio-link/layouts/InstaProLayout";
import { InstaTrendyLayout } from "@/app/dashboard/instagram/bio-link/layouts/InstaTrendyLayout";
import { InstaMinimalLayout } from "@/app/dashboard/instagram/bio-link/layouts/InstaMinimalLayout";
import { SundayBrunchLayout } from "@/app/dashboard/instagram/bio-link/layouts/SundayBrunchLayout";
import { Globe, MessageCircle, User, MoreHorizontal, Instagram, MapPin, ArrowUpRight, Camera, Sparkles, Youtube, Video, Clock, Timer } from "lucide-react";
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
            credentials: "include",
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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65">{item.label}</span>
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
    const bgVal = theme.bgStyle?.background || "#F3F4F6";
    const themeBgIsLight = bgVal.includes('gradient') ? isColorLight(theme.bgStyle?.backgroundColor || "#ffffff") : (bgVal.includes('#') || bgVal.includes('rgb') ? isColorLight(bgVal) : true);
    const secBg = themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
    const secBorder = themeBgIsLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
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
            return (
                <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-6 mb-6 overflow-hidden shadow-2xl bg-black group min-h-[380px] flex items-center justify-center">
                    {settings.image || settings.background_image ? (
                        <img src={settings.image || settings.background_image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="relative z-10 p-8 w-full text-center flex flex-col items-center">
                        {settings.brand_name && (
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-4 drop-shadow-md">{settings.brand_name}</p>
                        )}
                        <h2 className="text-[36px] font-black leading-[0.95] tracking-tighter text-white mb-2 drop-shadow-2xl">
                            {settings.title || settings.headline || "Elevate Your Vision"}
                        </h2>
                        {settings.subtitle && (
                            <h3 className="text-[18px] font-bold text-white/90 mb-3 drop-shadow-md leading-snug">{settings.subtitle}</h3>
                        )}
                        {settings.description && (
                            <p className="text-[13px] text-white/70 font-medium mb-6 drop-shadow-md max-w-[90%] leading-relaxed">{settings.description}</p>
                        )}
                        {settings.cta_text && (
                            <button className="px-10 py-4 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all mt-2 max-w-[80%] mx-auto truncate">
                                {settings.cta_text}
                            </button>
                        )}
                    </div>
                </div>
            );

        case "hero_aesthetic_section":
            return (
                <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-6 mb-6 overflow-hidden min-h-[420px] flex flex-col items-center justify-end">
                    {/* Background */}
                    {settings.background_image ? (
                        <img src={settings.background_image} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
                    {/* Glowing orbs */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
                    <div className="absolute bottom-24 right-4 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />

                    <div className="relative z-10 w-full flex flex-col items-center text-center px-6 pb-8 pt-14 gap-4">
                        {/* Profile image */}
                        {settings.profile_image && (
                            <div className="relative mb-1">
                                <div className="absolute -inset-1 rounded-full blur-md opacity-60" style={{ background: 'linear-gradient(45deg, #a855f7, #ec4899)' }} />
                                <img src={settings.profile_image} className="relative w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-2xl" />
                            </div>
                        )}
                        {/* Brand pill */}
                        {settings.brand_name && (
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-purple-500/40 text-purple-300" style={{ backgroundColor: 'rgba(168,85,247,0.15)' }}>
                                {settings.brand_name}
                            </span>
                        )}
                        {/* Headline */}
                        <h2 className="text-[28px] font-black tracking-tight leading-[1.1] text-white drop-shadow-2xl">
                            {settings.headline || "Your Headline"}
                        </h2>
                        {/* Subheadline */}
                        {settings.subheadline && (
                            <h3 className="text-[14px] font-bold text-white/80 leading-snug -mt-2">{settings.subheadline}</h3>
                        )}
                        {/* Description */}
                        {settings.description && (
                            <p className="text-[11px] text-white/60 leading-relaxed font-medium max-w-[90%]">{settings.description}</p>
                        )}
                        {/* CTA Buttons */}
                        {(settings.buttons || []).length > 0 && (
                            <div className="flex flex-col gap-2 w-full mt-1">
                                {(settings.buttons || []).slice(0, 2).map((btn: any, bi: number) => (
                                    <a key={bi} href={btn.link || '#'} className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center no-underline shadow-lg ${bi === 0
                                        ? 'text-black'
                                        : 'border border-white/20 text-white'
                                        }`} style={bi === 0 ? { background: 'linear-gradient(135deg, #a855f7, #ec4899)' } : { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                                        {btn.text || (bi === 0 ? 'Get Started' : 'Learn More')}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );

        case "stats_section":
        case "stats_minimal_section":
            const statsItems = settings.items || [];
            return (
                <div className={`w-full py-8 border-y my-4 ${secBorder}`}>
                    <div className="flex flex-wrap justify-center gap-y-8">
                        {statsItems.map((s: any, i: number) => {
                            const wClass = statsItems.length === 1 ? 'w-full' : (statsItems.length === 2 || statsItems.length === 4) ? 'w-1/2' : 'w-1/3';
                            const isLastInRow = (statsItems.length === 1) ||
                                ((statsItems.length === 2 || statsItems.length === 4) && (i + 1) % 2 === 0) ||
                                ((statsItems.length === 3 || statsItems.length > 4) && (i + 1) % 3 === 0) ||
                                (i === statsItems.length - 1);
                            return (
                                <div key={i} className={`flex flex-col items-center text-center px-2 ${wClass} border-r`} style={{ borderColor: isLastInRow ? 'transparent' : (themeBgIsLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)') }}>
                                    <span className="text-[28px] font-black tracking-tighter" style={{ color: effectiveTextColor }}>{s.value || "—"}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: effectiveTextColor, opacity: 0.4 }}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );

        case "header_profile_section":
            return (
                <div className={`relative w-[calc(100%+3rem)] -mx-6 -mt-10 mb-8 overflow-hidden rounded-b-[48px] backdrop-blur-xl border-b pb-8 shadow-2xl ${secBg}`}>
                    {settings.cover_image ? (
                        <img src={settings.cover_image} className="w-full h-[180px] object-cover" />
                    ) : (
                        <div className="w-full h-[180px] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20" />
                    )}
                    <div className="flex flex-col items-center text-center -mt-16 relative z-10 px-6">
                        <div className="p-1.5 rounded-full bg-black/20 backdrop-blur-3xl mb-4 shadow-2xl border border-white/20">
                            {settings.avatar ? (
                                <img src={settings.avatar} className="w-28 h-28 rounded-full object-cover border-4 border-white" />
                            ) : (
                                <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}><User size={40} style={{ color: effectiveTextColor, opacity: 0.4 }} /></div>
                            )}
                        </div>
                        <h2 className="text-[28px] font-black tracking-tight mb-2" style={{ color: effectiveTextColor }}>{settings.name || "Profile Name"}</h2>
                        {settings.bio && <p className="text-[13px] font-medium leading-relaxed line-clamp-2" style={{ color: effectiveTextColor, opacity: 0.7 }}>{settings.bio}</p>}
                    </div>
                </div>
            );

        case "portfolio_section":
        case "portfolio_minimal_section":
            const ptItems = settings.items || [];
            return (
                <div className="w-full space-y-5 my-8">
                    <h3 className="text-[20px] font-black tracking-tight px-1" style={{ color: effectiveTextColor }}>{settings.title || "Works"}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {ptItems.map((item: any, i: number) => {
                            const isWide = (i % 3 === 0);
                            return (
                                <div key={i} className={`relative rounded-[24px] overflow-hidden group shadow-md ${secBg} ${isWide ? "col-span-2 aspect-[16/9]" : "aspect-[4/5]"}`}>
                                    {item.image && <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[15px] font-black text-white leading-tight mb-1 translate-y-2 group-hover:translate-y-0 transition-transform">{item.title}</p>
                                        {item.description && <p className="text-[10px] text-white/70 line-clamp-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">{item.description}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );

        case "services_section":
            return (
                <div className="w-full space-y-4 my-8">
                    {settings.title && <h3 className="text-[20px] font-black tracking-tight px-1 mb-2" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="grid grid-cols-1 gap-3">
                        {(settings.items || []).map((s: any, i: number) => {
                            const servTitle = s.title || s.t || s.name;
                            const servDesc = s.description || s.d || s.desc;
                            const servPrice = s.price || s.p || s.amount;

                            // Handle edge case where it's entirely empty
                            if (!servTitle && !servDesc && !servPrice) return null;

                            return (
                                <div key={i} className={`group relative p-5 rounded-[28px] shadow-sm backdrop-blur-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${secBg}`}>
                                    <div className="relative z-10 flex gap-4">
                                        <div className={`w-14 h-14 rounded-[20px] shrink-0 shadow-inner flex items-center justify-center overflow-hidden border ${secBorder}`} style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }}>
                                            {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <Sparkles size={20} style={{ color: effectiveTextColor, opacity: 0.4 }} />}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className="text-[15px] font-black tracking-tight truncate shrink" style={{ color: effectiveTextColor }}>{servTitle}</h4>
                                                {servPrice && <span className="px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider whitespace-nowrap shrink-0" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', color: effectiveTextColor }}>{servPrice}</span>}
                                            </div>
                                            {servDesc && <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: effectiveTextColor, opacity: 0.6 }}>{servDesc}</p>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );

        case "testimonials_section":
            const tItems = settings.items && settings.items.length > 0 ? settings.items : [settings];
            return (
                <div className="w-full space-y-4 my-8">
                    {settings.title && <h3 className="text-[20px] font-black tracking-tight px-1 mb-2" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory no-scrollbar pb-4 pt-2 -mx-6 px-6 w-[calc(100%+3rem)] items-stretch">
                        {tItems.map((t: any, i: number) => {
                            const quote = t.quote || "Amazing service!";
                            const author = t.name || t.author_name || "Client";
                            const role = t.role || t.author_role || "";
                            const avatar = t.avatar || t.author_image;
                            const rating = t.rating !== undefined ? Number(t.rating) : 5;

                            return (
                                <div key={i} className={`shrink-0 w-[280px] p-6 rounded-[32px] snap-center flex flex-col shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${secBg}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }).map((_, rIdx) => (
                                                <svg key={rIdx} className={`w-3.5 h-3.5 ${rIdx < rating ? 'text-amber-400' : 'text-amber-400/20'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                        </div>
                                        <div style={{ color: effectiveTextColor, opacity: 0.1 }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                                        </div>
                                    </div>

                                    <p className="text-[14px] font-medium leading-relaxed italic mb-6 flex-1" style={{ color: effectiveTextColor }}>"{quote}"</p>

                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                                        {avatar ? (
                                            <img src={avatar} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', borderColor: themeBgIsLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                                                <User size={16} style={{ color: effectiveTextColor, opacity: 0.5 }} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="text-[13px] font-black tracking-tight truncate leading-tight" style={{ color: effectiveTextColor }}>{author}</p>
                                            {role && <p className="text-[10px] uppercase tracking-widest font-bold truncate mt-0.5" style={{ color: effectiveTextColor, opacity: 0.5 }}>{role}</p>}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );

        case "testimonial_highlight_section": {
            const t = settings;
            const quote = typeof t.quote === 'string' ? t.quote : (t.text || "This is truly a game-changer! I couldn't be happier with the results.");
            const author = typeof t.author_name === 'string' ? t.author_name : (t.name || "Happy Client");
            const role = typeof t.author_role === 'string' ? t.author_role : (t.role || "");
            const avatar = t.author_image || t.avatar;
            const rating = t.rating !== undefined ? Number(t.rating) : 5;

            return (
                <div className="w-full my-8 relative rounded-[36px] overflow-hidden p-8 flex flex-col items-center text-center shadow-2xl">
                    {/* Abstract background */}
                    <div className="absolute inset-0" style={{ background: themeBgIsLight ? 'linear-gradient(135deg, #111827 0%, #374151 100%)' : 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)' }} />
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.8), transparent 50%)' }} />

                    <div className="relative z-10 flex flex-col items-center w-full">
                        <div className="flex gap-1.5 mb-6">
                            {Array.from({ length: 5 }).map((_, rIdx) => (
                                <svg key={rIdx} className={`w-4 h-4 ${rIdx < rating ? (themeBgIsLight ? 'text-yellow-400' : 'text-yellow-500') : 'text-yellow-400/20'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                        </div>

                        {/* Large quote icon watermark */}
                        <div className="absolute top-0 right-0 opacity-10 pointer-events-none" style={{ color: themeBgIsLight ? '#ffffff' : '#000000' }}>
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                        </div>

                        <p className="text-[17px] font-bold leading-relaxed mb-8 italic relative z-10" style={{ color: themeBgIsLight ? '#ffffff' : '#000000' }}>"{quote}"</p>

                        <div className="flex flex-col items-center gap-3 w-full border-t pt-6" style={{ borderColor: themeBgIsLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            {avatar && (
                                <div className="relative">
                                    <div className="absolute -inset-1 rounded-full opacity-50 blur-sm" style={{ background: 'linear-gradient(45deg, #a855f7, #ec4899)' }} />
                                    <img src={avatar} className="relative w-14 h-14 rounded-full object-cover border-2 shadow-lg" style={{ borderColor: themeBgIsLight ? '#111827' : '#ffffff' }} />
                                </div>
                            )}
                            {!avatar && (
                                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: themeBgIsLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                                    <User size={24} style={{ color: themeBgIsLight ? '#ffffff' : '#000000', opacity: 0.5 }} />
                                </div>
                            )}
                            <div className="flex flex-col items-center">
                                <p className="text-[14px] font-black tracking-tight" style={{ color: themeBgIsLight ? '#ffffff' : '#000000' }}>{author}</p>
                                {role && <p className="text-[10px] uppercase tracking-widest font-bold mt-1" style={{ color: themeBgIsLight ? '#ffffff' : '#000000', opacity: 0.6 }}>{role}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        case "faq_section":
        case "faq_cards_section":
            return (
                <div className="w-full my-6">
                    {settings.title && <h3 className="text-[16px] font-black tracking-tight px-2 mb-4" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="space-y-3">
                        {(settings.items || []).map((f: any, i: number) => (
                            <div key={i} className={`group p-4 rounded-[20px] transition-all duration-300 ${secBg}`}>
                                <div className="flex justify-between items-center gap-4">
                                    <p className="text-[14px] font-bold leading-snug" style={{ color: effectiveTextColor }}>{f.question}</p>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:rotate-180" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderColor: secBorder }}>
                                        <ChevronDown size={14} style={{ color: effectiveTextColor, opacity: 0.6 }} />
                                    </div>
                                </div>
                                {f.answer && (
                                    <div className="mt-3 pt-3 border-t relative overflow-hidden" style={{ borderColor: secBorder }}>
                                        <p className="text-[13px] leading-relaxed" style={{ color: effectiveTextColor, opacity: 0.75 }}>{f.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "cta_section":
            return (
                <div className={`w-full p-8 rounded-[36px] text-center flex flex-col items-center my-6 shadow-xl border backdrop-blur-xl ${secBg}`}>
                    <h3 className="text-[24px] font-black leading-tight tracking-tight mb-5" style={{ color: effectiveTextColor }}>{settings.title || "Get Started"}</h3>
                    <a href={settings.button_link || settings.link || '#'} className="px-8 py-4 rounded-full cursor-pointer text-[11px] font-black uppercase tracking-widest shadow-md transition-transform hover:scale-105 active:scale-95 no-underline block" style={{ backgroundColor: effectiveTextColor, color: themeBgIsLight ? '#ffffff' : '#000000' }}>
                        {settings.button_text || "Click Here"}
                    </a>
                </div>
            );

        case "cta_fullscreen_section":
            return (
                <div className="relative w-[calc(100%+3rem)] -mx-6 my-6 min-h-[300px] flex items-center justify-center p-6 overflow-hidden shadow-2xl">
                    {/* Big bold gradient driven by theme */}
                    <div className="absolute inset-0" style={{ background: themeBgIsLight ? 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)' : 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)' }} />
                    {/* Abstract blurry shapes */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 blur-2xl rounded-full -translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10 w-full text-center flex flex-col items-center gap-6 p-8 rounded-[36px] bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl">
                        <div className="space-y-2">
                            <h3 className="text-[28px] font-black leading-[1.1] tracking-tighter text-white drop-shadow-lg">
                                {settings.title || "Ready to dive in?"}
                            </h3>
                            {settings.subtitle && (
                                <p className="text-[13px] font-medium text-white/90 leading-snug drop-shadow-sm max-w-[95%] mx-auto">{settings.subtitle}</p>
                            )}
                        </div>
                        <a href={settings.button_link || settings.link || '#'} className="w-full py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-transform no-underline block" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                            {settings.button_text || "Click Here"}
                        </a>
                    </div>
                </div>
            );

        case "pricing_cards_section":
            return (
                <div className="w-full space-y-4 my-8">
                    {settings.title && <h3 className="text-[20px] font-black tracking-tight px-2 mb-4 text-center" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar px-2 -mx-2 items-stretch">
                        {(settings.plans || []).map((plan: any, i: number) => {
                            const isPopular = i === 1 || plan.is_featured;
                            const cardBg = isPopular
                                ? (themeBgIsLight ? 'linear-gradient(135deg, #111827, #374151)' : 'linear-gradient(135deg, #f3f4f6, #ffffff)')
                                : (themeBgIsLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.05)');
                            const cardText = isPopular
                                ? (themeBgIsLight ? '#ffffff' : '#000000')
                                : effectiveTextColor;

                            // Handle features array or comma-separated string
                            const rawFeatures = typeof plan.features === 'string'
                                ? plan.features.split(/[,\n]/)
                                : (Array.isArray(plan.features) ? plan.features : []);
                            const features = rawFeatures.map((f: any) => typeof f === 'string' ? f.trim() : typeof f === 'object' && f.name ? f.name : String(f)).filter(Boolean);

                            return (
                                <div key={i} className="w-[260px] shrink-0 snap-center p-7 rounded-[32px] border flex flex-col shadow-xl transition-all hover:scale-[1.02] backdrop-blur-xl relative overflow-hidden group" style={{ background: cardBg, borderColor: isPopular ? 'transparent' : secBorder }}>
                                    {isPopular && (
                                        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'linear-gradient(45deg, #a855f7, #ec4899)' }} />
                                    )}
                                    {isPopular && (
                                        <div className="self-start px-3 py-1 mb-4 rounded-full text-[8px] font-black uppercase tracking-widest relative z-10" style={{ background: themeBgIsLight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', color: cardText }}>Most Popular</div>
                                    )}
                                    <span className={`text-[12px] font-black uppercase tracking-[0.2em] mb-2 relative z-10 ${!isPopular ? 'text-pink-500' : ''}`} style={!isPopular ? {} : { color: cardText }}>{typeof plan.name === 'string' ? plan.name : 'PLAN'}</span>
                                    <div className="flex flex-col gap-1 mb-6 relative z-10">
                                        <span className="text-[40px] font-black tracking-tighter leading-none" style={{ color: cardText }}>{typeof plan.price === 'string' || typeof plan.price === 'number' ? plan.price : 'Free'}</span>
                                        {(plan.billing_cycle || plan.interval) && <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest" style={{ color: cardText }}>/{plan.billing_cycle || plan.interval}</span>}
                                    </div>

                                    {features.length > 0 && (
                                        <div className="space-y-3 mb-8 flex-1 relative z-10">
                                            {features.slice(0, 5).map((f: string, fi: number) => (
                                                <div key={fi} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border" style={{ background: isPopular ? (themeBgIsLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'rgba(168,85,247,0.05)', borderColor: isPopular ? 'transparent' : 'rgba(168,85,247,0.2)' }}>
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ color: isPopular ? (themeBgIsLight ? '#4ade80' : '#16a34a') : '#a855f7' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </div>
                                                    <span className="text-[13px] font-medium leading-snug" style={{ color: cardText, opacity: 0.85 }}>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <a href={plan.button_link || plan.link || '#'} className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl mt-auto flex items-center justify-center no-underline relative z-10 transition-transform group-hover:scale-[1.03]" style={{
                                        background: isPopular ? (themeBgIsLight ? '#ffffff' : '#000000') : (themeBgIsLight ? '#000000' : '#ffffff'),
                                        color: isPopular ? (themeBgIsLight ? '#000000' : '#ffffff') : (themeBgIsLight ? '#ffffff' : '#000000')
                                    }}>
                                        {plan.button_text || "Select"}
                                    </a>
                                </div>
                            )
                        })}
                    </div>
                    {(settings.plans || []).length === 0 && (
                        <div className="w-full h-40 rounded-[32px] border border-dashed flex items-center justify-center" style={{ borderColor: secBorder }}><span className="text-[10px] font-bold uppercase tracking-widest opacity-30" style={{ color: effectiveTextColor }}>No plans yet</span></div>
                    )}
                </div>
            );

        case "contact_section":
            return (
                <div className="w-full grid grid-cols-1 gap-2 my-4">
                    {settings.email && (
                        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white/5 border border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0 border border-pink-500/20"><Mail size={18} className="text-pink-500" /></div>
                            <div className="flex-1 min-w-0"><p className="text-[13px] font-black text-white truncate">{settings.email}</p></div>
                        </div>
                    )}
                    {settings.phone && (
                        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white/5 border border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20"><Phone size={18} className="text-indigo-400" /></div>
                            <div className="flex-1 min-w-0"><p className="text-[13px] font-black text-white truncate">{settings.phone}</p></div>
                        </div>
                    )}
                </div>
            );

        case "vcard":
            return (
                <div className="w-full p-5 rounded-[24px] border border-white/10 shadow-2xl flex items-center gap-4 bg-white/5">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10"><User size={20} className="opacity-40" /></div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-black text-[14px] truncate text-white">{settings.first_name} {settings.last_name}</h3>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{settings.organization || "Contact"}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10"><ArrowUpRight size={16} className="text-white/40" /></div>
                </div>
            );

        case "divider":
            return <div className="w-full py-4 flex items-center justify-center"><div className="w-full h-px bg-white/10" /></div>;

        case "business_hours":
            return (
                <div className="p-6 my-2 border border-white/5 bg-white/[0.02] rounded-[24px]">
                    <div className="flex items-center gap-2 mb-4 justify-center opacity-40">
                        <Clock size={16} /><span className="font-black uppercase tracking-widest text-[9px]">Business Hours</span>
                    </div>
                    <div className="space-y-3">
                        {['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'].map((k, i) => settings[k] && (
                            <div key={k} className="flex justify-between items-center text-[12px]">
                                <span className="font-bold opacity-30 uppercase text-[9px] tracking-widest">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                                <span className="font-bold text-white/80">{settings[k]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case "rss":
            return (
                <div className="w-full space-y-2 mt-4">
                    {(settings.items || []).slice(0, 2).map((item: any, idx: number) => (
                        <div key={idx} className="block p-3 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-[12px] font-bold truncate text-white">{item.title}</p>
                            <p className="text-[9px] opacity-40 mt-1">{new Date(item.pubDate).toLocaleDateString()}</p>
                        </div>
                    ))}
                </div>
            );

        case "social_proof_section":
            return (
                <div className="w-full my-6 flex flex-wrap justify-center gap-3">
                    {(settings.items || []).map((item: any, i: number) => {
                        const platform = item.platform || "Platform";
                        const followers = item.followers || "10K+";
                        const url = item.url || "#";

                        return (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 px-5 py-3.5 rounded-full border shadow-sm backdrop-blur-xl transition-all hover:scale-105 active:scale-95 ${secBg}`}>
                                <div className="shrink-0 w-6 h-6 flex items-center justify-center filter drop-shadow-sm">
                                    <BrandIcon name={platform} size={22} colored={true} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-black tracking-tight leading-none" style={{ color: effectiveTextColor }}>{followers}</span>
                                    <span className="text-[9px] uppercase tracking-widest font-black leading-none mt-1" style={{ color: effectiveTextColor, opacity: 0.5 }}>{platform}</span>
                                </div>
                            </a>
                        );
                    })}
                </div>
            );

        case "featured_links_section":
            return (
                <div className="w-full my-8 flex flex-col gap-3">
                    {settings.title && <h3 className="text-[16px] font-black tracking-tight px-2 mb-2" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    {(settings.items || []).map((item: any, i: number) => {
                        const iconClass = item.icon || item.icon_class;
                        return (
                            <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer" className={`group relative flex items-center p-4 rounded-[28px] border shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden ${secBg}`}>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300" style={{ backgroundColor: effectiveTextColor }} />

                                <div className="w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 border mr-4 transition-transform duration-300 group-hover:rotate-6 shadow-inner" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderColor: secBorder }}>
                                    {iconClass ? <BrandIcon name={iconClass.replace('fa-fa-', '').replace('fa-', '')} size={24} colored /> : <LinkIcon size={20} style={{ color: effectiveTextColor, opacity: 0.8 }} />}
                                </div>

                                <div className="flex-1 min-w-0 pr-4 py-1 flex flex-col justify-center">
                                    <p className="text-[16px] font-bold tracking-tight truncate mb-1.5" style={{ color: effectiveTextColor }}>{item.label || "Featured Link"}</p>
                                    {item.description && <p className="text-[11.5px] leading-snug line-clamp-2" style={{ color: effectiveTextColor, opacity: 0.6 }}>{item.description}</p>}
                                </div>

                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1 border" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)', borderColor: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                                    <ArrowUpRight size={18} style={{ color: effectiveTextColor, opacity: 0.9 }} />
                                </div>
                            </a>
                        );
                    })}
                </div>
            );

        case "urgency_offer_section":
            return (
                <div className="w-[calc(100%+3rem)] -mx-6 mt-4 mb-8 relative overflow-hidden">
                    {/* Gradient bg adapts: dark bg → vivid gradient; light bg → softer warm */}
                    <div className="absolute inset-0" style={{
                        background: themeBgIsLight
                            ? 'linear-gradient(135deg, #ff6b35 0%, #f7323f 100%)'
                            : 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'
                    }} />
                    {/* Noise texture overlay */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
                    {/* Soft glow circles */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-2xl bg-white" />
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full opacity-15 blur-xl bg-yellow-300" />

                    <div className="relative z-10 px-8 py-7 text-center space-y-4">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                            <Clock size={10} className="animate-pulse text-white" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Limited Time Offer</span>
                        </div>
                        {/* Title */}
                        <h3 className="text-[22px] font-black tracking-tight leading-tight text-white drop-shadow-lg">
                            {settings.title || "Special Offer"}
                        </h3>
                        {/* Description */}
                        {settings.description && (
                            <p className="text-[12px] text-white/85 leading-relaxed max-w-[90%] mx-auto font-medium">{settings.description}</p>
                        )}
                        {/* End Date chip */}
                        {(settings.countdown || settings.end_date) && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/30 bg-black/20 backdrop-blur-md mx-auto">
                                <Clock size={11} className="text-white/80" />
                                <span className="text-[10px] font-black text-white/90 tracking-widest">
                                    Ends: {settings.countdown || settings.end_date}
                                </span>
                            </div>
                        )}
                        {/* CTA Button */}
                        {settings.button_text && (
                            <a href={settings.button_link || '#'} className="inline-block px-8 py-3.5 rounded-2xl bg-white font-black text-[11px] uppercase tracking-widest shadow-2xl no-underline transition-transform" style={{ color: '#f7323f' }}>
                                {settings.button_text}
                            </a>
                        )}
                    </div>
                </div>
            );

        case "impact_section":
            return (
                <div className="w-full mt-4 mb-6 relative rounded-[32px] overflow-hidden p-1">
                    {/* Glassy, neon-bordered container */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 backdrop-blur-2xl" />
                    <div className="absolute inset-0 rounded-[32px] border border-white/10" style={{ background: themeBgIsLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)' }} />
                    <div className="relative z-10 p-7 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
                                <Sparkles size={12} className="text-indigo-400" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: effectiveTextColor }}>The Outcome</span>
                            </div>
                            <h3 className="text-[24px] font-black tracking-tight leading-tight" style={{ color: effectiveTextColor }}>
                                {typeof settings.title === 'string' ? settings.title : "Our Impact"}
                            </h3>
                            {settings.description && typeof settings.description === 'string' && (
                                <p className="text-[13px] leading-relaxed font-medium" style={{ color: effectiveTextColor, opacity: 0.6 }}>{settings.description}</p>
                            )}
                        </div>
                        <div className="space-y-4 pt-1">
                            {(settings.points || []).slice(0, 4).map((pt: any, i: number) => {
                                const ptTitle = typeof pt === 'string' ? pt : (pt.title || pt.label || '');
                                const ptDesc = typeof pt === 'object' && pt !== null ? pt.description : '';
                                return (
                                    <div key={i} className="group flex items-start gap-4 p-4 rounded-[20px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))' }}>
                                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                                            {ptTitle && <p className="text-[14px] font-bold leading-snug" style={{ color: effectiveTextColor }}>{ptTitle}</p>}
                                            {ptDesc && <p className="text-[11px] leading-relaxed mt-1 line-clamp-2" style={{ color: effectiveTextColor, opacity: 0.5 }}>{ptDesc}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );

        case "hero_premium_section":
            return (
                <div className="w-[calc(100%+3rem)] -mx-6 -mt-8 mb-8 relative pt-24 pb-12 px-6 overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.background_image || ''})` }}>
                        <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: themeBgIsLight ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.75)' }} />
                    </div>
                    <div className="relative z-10 w-full flex flex-col items-center">
                        {settings.badge && (
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border mb-4 shadow-md" style={{ backgroundColor: themeBgIsLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)', borderColor: secBorder, color: effectiveTextColor }}>{settings.badge}</span>
                        )}
                        {settings.profile_image && <img src={settings.profile_image} className="w-24 h-24 rounded-full border-[3px] shadow-2xl mb-5 object-cover" style={{ borderColor: themeBgIsLight ? '#ffffff' : '#000000' }} />}
                        <h2 className="text-[28px] font-black tracking-tighter leading-[1.1] mb-3" style={{ color: effectiveTextColor }}>{settings.headline}</h2>
                        {settings.subheadline && <p className="text-[14px] leading-relaxed max-w-[90%] opacity-80" style={{ color: effectiveTextColor }}>{settings.subheadline}</p>}
                    </div>
                </div>
            );

        case "floating_stats_section":
            return (
                <div className="w-full my-6 flex flex-wrap justify-center gap-3">
                    {(settings.items || []).map((s: any, i: number) => (
                        <div key={i} className={`flex flex-col items-center p-4 min-w-[100px] flex-1 rounded-[24px] border shadow-lg backdrop-blur-xl transition-transform hover:scale-105 ${secBg}`}>
                            <span className="text-[24px] font-black tracking-tighter" style={{ color: effectiveTextColor }}>{s.value || s.stat}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1 text-center" style={{ color: effectiveTextColor }}>{s.label || s.title}</span>
                        </div>
                    ))}
                </div>
            );

        case "bento_portfolio_grid_section":
            return (
                <div className="w-full my-6">
                    {settings.title && <h3 className="text-[18px] font-black tracking-tight px-2 mb-4" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="grid grid-cols-2 gap-3">
                        {(settings.items || []).map((pt: any, i: number) => (
                            <a key={i} href={pt.link || "#"} className={`relative overflow-hidden rounded-[24px] border shadow-sm group ${i % 3 === 0 ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-square'}`} style={{ borderColor: secBorder }}>
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${pt.image || ''})`, backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end pointer-events-none">
                                    <h4 className="text-[14px] font-bold text-white mb-1 leading-tight tracking-tight drop-shadow-md">{pt.title || "Portfolio Item"}</h4>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            );

        case "services_timeline_section":
        case "faq_accordion_section":
        case "transformation_story_section":
        case "premium_testimonials_section":
        case "digital_products_section":
        case "video_showcase_section":
        case "featured_brands_section":
        case "floating_cta_banner_section":
        case "footer_social_section":
            return (
                <div className={`w-full my-6 p-6 rounded-[32px] shadow-lg backdrop-blur-xl border flex flex-col items-center text-center ${secBg}`}>
                    <Sparkles size={24} style={{ color: effectiveTextColor, opacity: 0.5 }} className="mb-4" />
                    <h3 className="text-[16px] font-black tracking-tight uppercase" style={{ color: effectiveTextColor }}>{settings.title || type.replace(/_/g, " ")}</h3>
                    <p className="text-[11px] opacity-50 mt-1 uppercase tracking-widest font-bold" style={{ color: effectiveTextColor }}>Configured in Editor</p>
                </div>
            );

        case "content_grid_section":
            return (
                <div className="w-full my-6">
                    {settings.title && <h3 className="text-[16px] font-black tracking-tight px-2 mb-4" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="grid grid-cols-2 gap-3">
                        {(settings.items || []).map((item: any, i: number) => (
                            <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer" className={`group relative rounded-[20px] overflow-hidden aspect-square border shadow-sm transition-all duration-300 hover:scale-[1.02] ${secBg}`}>
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <ImageIcon size={32} style={{ color: effectiveTextColor }} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                <div className="absolute inset-x-0 bottom-0 p-3 pointer-events-none">
                                    <p className="text-[12px] font-bold text-white leading-tight line-clamp-2 drop-shadow-md">{item.caption || "Content Grid Item"}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            );

        case "offers_section":
            return (
                <div className="w-full my-6 flex flex-col gap-3">
                    {settings.title && <h3 className="text-[16px] font-black tracking-tight px-2 mb-4" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    {(settings.items || []).map((item: any, i: number) => (
                        <div key={i} className={`relative p-5 rounded-[24px] border shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden flex flex-col gap-3 ${secBg}`}>
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0 border" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)', borderColor: secBorder }}>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500 shadow-lg shadow-green-500/20"><Sparkles size={12} className="text-white" /></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[16px] font-black tracking-tight truncate" style={{ color: effectiveTextColor }}>{item.name || item.title || "Special Offer"}</p>
                                    {(item.description || item.subtitle) && <p className="text-[12px] mt-0.5 leading-snug line-clamp-2" style={{ color: effectiveTextColor, opacity: 0.6 }}>{item.description || item.subtitle}</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1 -mx-2">
                                <div className="w-3 h-6 rounded-r-full border-r border-t border-b -translate-x-3" style={{ borderColor: secBorder, backgroundColor: theme.background }} />
                                <div className="flex-1 border-t-[1.5px] border-dashed" style={{ borderColor: themeBgIsLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }} />
                                <div className="w-3 h-6 rounded-l-full border-l border-t border-b translate-x-3" style={{ borderColor: secBorder, backgroundColor: theme.background }} />
                            </div>
                            <div className="flex items-center justify-between gap-3 mt-1">
                                {item.code ? (
                                    <div className="px-3 py-1.5 rounded-lg border font-mono font-bold text-[12px] tracking-widest uppercase" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderColor: secBorder, color: effectiveTextColor }}>{item.code}</div>
                                ) : <div />}
                                <a href={item.cta_link || item.url || item.link || "#"} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: effectiveTextColor, color: themeBgIsLight ? '#ffffff' : '#000000' }}>
                                    {item.cta_text || item.button_text || "Claim Offer"}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            );

        case "hero_product_section":
            return (
                <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-6 mb-6 overflow-hidden shadow-2xl bg-black min-h-[400px] flex items-end">
                    {/* Background image or gradient */}
                    {settings.product_image ? (
                        <img src={settings.product_image} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }} />
                    )}
                    {/* Gradient overlays for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />
                    {/* Glow accent */}
                    <div className="absolute top-1/3 right-0 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

                    <div className="relative z-10 p-6 pt-16 w-full flex flex-col gap-4">
                        {/* Price badge — top left */}
                        {settings.price && (
                            <div className="self-start">
                                <span className="px-3 py-1.5 rounded-full text-[11px] font-black text-white border border-white/20 shadow-lg" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}>
                                    {settings.price}
                                </span>
                            </div>
                        )}
                        {/* Title */}
                        <div className="space-y-1.5">
                            <h1 className="text-[22px] font-black text-white leading-tight tracking-tight drop-shadow-lg">
                                {settings.title || "Product Hero"}
                            </h1>
                            {settings.subtitle && (
                                <p className="text-[12px] text-white/70 font-semibold leading-snug">{settings.subtitle}</p>
                            )}
                        </div>
                        {/* Divider */}
                        <div className="h-px w-full bg-white/10" />
                        {/* CTA button full-width */}
                        <a
                            href={settings.cta_link || '#'}
                            className="w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center shadow-2xl no-underline"
                            style={{ background: 'linear-gradient(135deg, #ffffff, #f0f0f0)', color: '#000' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {settings.cta_text || "Get Now"}
                        </a>
                    </div>
                </div>
            );

        case "featured_product_section":
        case "product_section":
            return (
                <div className={`p-4 rounded-[28px] overflow-hidden border shadow-lg backdrop-blur-xl ${secBg}`}>
                    {(settings.image) && (
                        <div className="relative w-full aspect-video rounded-[20px] overflow-hidden mb-4">
                            <img src={settings.image} className="w-full h-full object-cover" alt="Product" />
                            <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Best Seller
                            </div>
                        </div>
                    )}
                    {!settings.image && (
                        <div className="w-full aspect-video rounded-[20px] mb-4 flex items-center justify-center border border-dashed" style={{ borderColor: secBorder, backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)' }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: effectiveTextColor, opacity: 0.3 }}>No Image</span>
                        </div>
                    )}
                    <div className="space-y-3">
                        <h2 className="text-[16px] font-black tracking-tight leading-tight" style={{ color: effectiveTextColor }}>
                            {typeof settings.name === 'string' ? settings.name : (typeof settings.title === 'string' ? settings.title : "Featured Product")}
                        </h2>
                        {settings.price && (typeof settings.price === 'string' || typeof settings.price === 'number') && (
                            <div className="text-[14px] font-black" style={{ color: effectiveTextColor }}>{settings.price}</div>
                        )}
                        {settings.description && typeof settings.description === 'string' && (
                            <p className="text-[11px] leading-relaxed font-medium line-clamp-2" style={{ color: effectiveTextColor, opacity: 0.6 }}>{settings.description}</p>
                        )}
                        <a
                            href={settings.link || settings.url || "#"}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest no-underline shadow-lg"
                            style={{ backgroundColor: effectiveTextColor, color: themeBgIsLight ? '#ffffff' : '#000000' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            Get Access
                        </a>
                    </div>
                </div>
            );

        case "product_list_section": {
            const prodItems = settings.items || [];
            return (
                <div className="w-full space-y-3 my-4">
                    {settings.title && (
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] px-1" style={{ color: effectiveTextColor, opacity: 0.5 }}>
                            {settings.title}
                        </h3>
                    )}
                    {prodItems.map((p: any, i: number) => (
                        <a key={i} href={p.link || '#'} className={`group flex gap-3 p-3 rounded-[22px] border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] no-underline ${secBg}`} onClick={(e) => e.stopPropagation()}>
                            {/* Product image */}
                            <div className="w-16 h-16 rounded-[16px] overflow-hidden shrink-0 border shadow-sm" style={{ borderColor: secBorder }}>
                                {p.image ? (
                                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ background: themeBgIsLight ? 'linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.08))' : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1))' }}>
                                        <Sparkles size={16} style={{ color: effectiveTextColor, opacity: 0.3 }} />
                                    </div>
                                )}
                            </div>
                            {/* Text content */}
                            <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center gap-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-black text-[13px] leading-tight" style={{ color: effectiveTextColor }}>{typeof p.name === 'string' ? p.name : 'Product'}</h4>
                                    {p.price && (typeof p.price === 'string' || typeof p.price === 'number') && (
                                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider" style={{ background: themeBgIsLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)', color: effectiveTextColor }}>
                                            {p.price}
                                        </span>
                                    )}
                                </div>
                                {p.description && typeof p.description === 'string' && (
                                    <p className="text-[10px] leading-snug line-clamp-2 font-medium" style={{ color: effectiveTextColor, opacity: 0.55 }}>{p.description}</p>
                                )}
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: effectiveTextColor, opacity: 0.35 }}>View →</span>
                                </div>
                            </div>
                        </a>
                    ))}
                    {prodItems.length === 0 && (
                        <div className="text-center py-6 rounded-[22px] border border-dashed" style={{ borderColor: secBorder }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: effectiveTextColor, opacity: 0.3 }}>No products yet</span>
                        </div>
                    )}
                </div>
            );
        }

        case "trust_badges_section": {
            const badgeItems = settings.items || [];
            const badgeCount = badgeItems.length;
            // Accent palette picked from theme: light bg → indigo/blue; dark bg → emerald/teal
            const accentColors = themeBgIsLight
                ? ['#6366f1', '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
                : ['#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fb923c', '#facc15'];
            return (
                <div className="w-full my-4 space-y-3">
                    {/* Section header */}
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-px flex-1" style={{ background: themeBgIsLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }} />
                        <span className="text-[8px] font-black uppercase tracking-[0.25em]" style={{ color: effectiveTextColor, opacity: 0.4 }}>Trusted by thousands</span>
                        <div className="h-px flex-1" style={{ background: themeBgIsLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }} />
                    </div>
                    {/* Responsive grid: 3-col for ≤3, 2-col for 4+, wraps naturally */}
                    <div className={`grid gap-2 ${badgeCount <= 3 ? 'grid-cols-3' : badgeCount === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {badgeItems.map((badge: any, i: number) => {
                            const accent = accentColors[i % accentColors.length];
                            return (
                                <div key={i} className="flex flex-col items-center text-center p-3 rounded-[20px] border transition-all duration-300 hover:scale-[1.03]" style={{
                                    background: themeBgIsLight
                                        ? `linear-gradient(135deg, ${accent}10, ${accent}05)`
                                        : `linear-gradient(135deg, ${accent}18, ${accent}08)`,
                                    borderColor: `${accent}30`
                                }}>
                                    <div className="w-9 h-9 rounded-[14px] flex items-center justify-center mb-2 shadow-sm" style={{ background: `${accent}22`, border: `1px solid ${accent}40` }}>
                                        <Sparkles size={14} style={{ color: accent }} />
                                    </div>
                                    <span className="text-[7.5px] font-black uppercase tracking-wider leading-tight" style={{ color: effectiveTextColor, opacity: 0.75 }}>
                                        {badge.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {badgeCount === 0 && (
                        <div className="text-center py-4 rounded-[20px] border border-dashed" style={{ borderColor: secBorder }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: effectiveTextColor, opacity: 0.3 }}>Add trust badges</span>
                        </div>
                    )}
                </div>
            );
        }

        case "link_grid_section":
            return (
                <div className="w-full my-6 space-y-4">
                    {settings.title && <h3 className="text-[16px] font-black tracking-tight px-2" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="grid grid-cols-2 gap-3">
                        {(settings.items || []).map((item: any, i: number) => {
                            const label = item.label || item.title || "Link";
                            const url = item.url || item.link || "#";
                            return (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative group overflow-hidden rounded-[24px] p-5 flex flex-col justify-between aspect-square transition-all duration-300 hover:scale-105 active:scale-95 border no-underline shadow-lg" style={{ background: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderColor: secBorder }}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }} />
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center border shadow-sm relative z-10" style={{ backgroundColor: themeBgIsLight ? '#ffffff' : '#000000', borderColor: secBorder }}>
                                        <ArrowUpRight size={18} style={{ color: effectiveTextColor }} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                    <p className="font-black text-[15px] leading-tight tracking-tight relative z-10 mt-4 line-clamp-2" style={{ color: effectiveTextColor }}>{label}</p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            );

        case "link_carousel_section":
            return (
                <div className="w-[calc(100%+3rem)] -mx-6 my-6 relative pl-6">
                    {settings.title && <h3 className="text-[16px] font-black tracking-tight px-2 mb-4" style={{ color: effectiveTextColor }}>{settings.title}</h3>}
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
                        {(settings.items || []).map((item: any, i: number) => {
                            const label = item.label || item.title || "Link";
                            // Handle cases where label is exceptionally long
                            const displayLabel = label.length > 30 ? label.substring(0, 30) + '...' : label;
                            const url = item.url || item.link || "#";
                            return (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 w-[160px] snap-center rounded-[20px] p-4 flex flex-col justify-end min-h-[140px] relative overflow-hidden group shadow-md hover:-translate-y-1 transition-all no-underline" style={{ background: themeBgIsLight ? 'linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.05) 100%)' : 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.05) 100%)', border: `1px solid ${secBorder}` }}>
                                    <div className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10">
                                        <ArrowUpRight size={14} style={{ color: effectiveTextColor }} />
                                    </div>
                                    <p className="font-bold text-[13px] leading-tight" style={{ color: effectiveTextColor }}>{displayLabel}</p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            );

        case "newsletter":
            return (
                <div className="w-full my-6 p-6 rounded-[32px] overflow-hidden relative group" style={{ background: themeBgIsLight ? 'linear-gradient(145deg, #1f2937, #111827)' : 'linear-gradient(145deg, #f3f4f6, #ffffff)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-inner" style={{ background: themeBgIsLight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: themeBgIsLight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <Mail size={20} style={{ color: themeBgIsLight ? '#ffffff' : '#000000' }} />
                        </div>
                        <h3 className="text-[20px] font-black tracking-tight mb-2" style={{ color: themeBgIsLight ? '#ffffff' : '#000000' }}>{settings.heading || settings.title || "Stay Updated"}</h3>
                        {settings.description && (
                            <p className="text-[12px] font-medium leading-relaxed mb-6" style={{ color: themeBgIsLight ? '#ffffff' : '#000000', opacity: 0.7 }}>{settings.description}</p>
                        )}

                        <div className="w-full flex flex-col gap-2 relative">
                            <div className="w-full h-[48px] rounded-2xl flex items-center px-4 border" style={{ background: themeBgIsLight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderColor: themeBgIsLight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>
                                <span className="text-[12px] font-medium opacity-50" style={{ color: themeBgIsLight ? '#ffffff' : '#000000' }}>{settings.input_placeholder || "Enter your email..."}</span>
                            </div>
                            <button className="w-full h-[48px] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2" style={{ background: themeBgIsLight ? '#ffffff' : '#000000', color: themeBgIsLight ? '#000000' : '#ffffff' }}>
                                {settings.button_text || "Subscribe"}
                            </button>
                        </div>
                    </div>
                </div>
            );

        case "music_section":
            return (
                <a href={settings.url || settings.spotify_url || settings.soundcloud_url || "#"} target="_blank" rel="noopener noreferrer" className="w-full my-4 p-4 rounded-[28px] flex items-center gap-4 relative overflow-hidden group shadow-lg transition-transform hover:scale-[1.02] border no-underline" style={{ background: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderColor: secBorder }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', transform: 'skewX(-20deg) translateX(-150%)' }} />

                    <div className="w-14 h-14 rounded-[18px] shrink-0 flex items-center justify-center relative overflow-hidden shadow-inner border" style={{ background: themeBgIsLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', borderColor: secBorder }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                        <Music size={20} style={{ color: effectiveTextColor }} className="relative z-10" />
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                        <p className="text-[14px] font-black tracking-tight truncate leading-tight" style={{ color: effectiveTextColor }}>{settings.title || settings.music_title || "Listen Now"}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <div className="flex items-center gap-0.5 h-3">
                                <div className="w-0.5 h-full bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-0.5 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-0.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                <div className="w-0.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-bold opacity-50" style={{ color: effectiveTextColor }}>Playing</span>
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors group-hover:bg-black/5 dark:group-hover:bg-white/10" style={{ backgroundColor: themeBgIsLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderColor: secBorder }}>
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-b-[5px] border-b-transparent translate-x-[2px]" style={{ borderLeftColor: effectiveTextColor }} />
                    </div>
                </a>
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

    const isBlockVisible = (b: any) => b.is_enabled != 0 && !b.is_hidden && b.is_active != 0 && b.is_Enabled != 0;
    const allBlocks = rawTabs.flatMap((t: any) => t.sections || []).flatMap((s: any) => s.blocks || []).filter(isBlockVisible);
    const otherBlocks = currentTab?.sections?.flatMap((s: any) => s.blocks || [])?.filter(isBlockVisible) || [];

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

    if (layoutStyle === "insta_trendy") {
        return (
            <>
                <title>{profile.title || username} · Insta Trendy</title>
                <div className="min-h-screen flex justify-center w-full bg-[#050505]">
                    <div className="w-full max-w-[540px] min-h-screen relative overflow-hidden flex flex-col shadow-2xl">
                        <InstaTrendyLayout profile={profile} tabs={rawTabs} />
                    </div>
                </div>
            </>
        );
    }

    if (layoutStyle === "insta_minimal") {
        return (
            <>
                <title>{profile.title || username} · Studio Minimal</title>
                <div className="min-h-screen flex justify-center w-full bg-white">
                    <div className="w-full max-w-[540px] min-h-screen relative overflow-hidden flex flex-col shadow-2xl">
                        <InstaMinimalLayout profile={profile} tabs={rawTabs} />
                    </div>
                </div>
            </>
        );
    }

    if (layoutStyle === "sunday_brunch") {
        return (
            <>
                <title>{profile.title || username} · Sunday Brunch</title>
                <div className="min-h-screen flex justify-center w-full bg-[#fdfaf5]">
                    <div className="w-full max-w-[540px] min-h-screen relative overflow-hidden flex flex-col shadow-2xl">
                        <SundayBrunchLayout profile={profile} tabs={rawTabs} />
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
                                        className={`flex-shrink-0 px-5 py-2 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === tab.id
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
