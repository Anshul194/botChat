"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Mail, Phone, ArrowRight, Link as LinkIcon, Grid, ShoppingBag,
    SmartphoneNfc, Layers, Image as ImageIcon, Hexagon, Share2, Check,
} from "lucide-react";
import { resolveApiBaseUrl, resolveXHost } from "@/lib/config";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles } from "@/app/dashboard/instagram/bio-link/TemplateSystem";
import { getUiTypeFromBlock, isMediaType, BLOCK_ICONS } from "@/app/dashboard/instagram/bio-link/builder-utils";
import { PortfolioLayout } from "@/app/dashboard/instagram/bio-link/layouts/PortfolioLayout";
import { UGCLayout } from "@/app/dashboard/instagram/bio-link/layouts/UGCLayout";
import { OliviaLayout } from "@/app/dashboard/instagram/bio-link/layouts/OliviaLayout";
import { UniversalLayout } from "@/app/dashboard/instagram/bio-link/layouts/UniversalLayout";
import { CreatorStoreLayout } from "@/app/dashboard/instagram/bio-link/layouts/CreatorStoreLayout";
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
    tabs: PublicTab[];
    url: string;
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
function CarouselBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="w-full relative">
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
                {items.map((item: any, i: number) => (
                    <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                        className="flex-shrink-0 w-[220px] snap-center bg-white dark:bg-[#12151E] rounded-3xl overflow-hidden shadow-md border border-slate-100 dark:border-white/5 flex flex-col group transition-all hover:-translate-y-0.5">
                        <div className="w-full h-[120px] bg-slate-100 dark:bg-white/10 relative overflow-hidden">
                            {item.image_url
                                ? <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon size={24} className="text-slate-300 dark:text-slate-600" /></div>
                            }
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-bold text-[14px] text-slate-900 dark:text-white leading-tight mb-1 truncate">{item.title || "Link"}</h4>
                            {item.description && <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{item.description}</p>}
                            <div className="mt-auto">
                                <span className="text-[#db2777] text-[12px] font-bold flex items-center gap-1.5">
                                    {item.button_text || "Visit"} <ArrowRight size={12} />
                                </span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}

function HeroBlockView({ item }: { item: any }) {
    if (!item) return null;
    return (
        <a href={item.url || "#"} target="_blank" rel="noopener noreferrer"
            className="w-full block bg-slate-900 rounded-[24px] overflow-hidden shadow-xl border border-slate-100 dark:border-white/5 group transition-all hover:-translate-y-0.5 relative h-[200px]">
            {item.image_url
                ? <img src={item.image_url} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
                : <div className="absolute inset-0 flex items-center justify-center bg-slate-800"><ImageIcon size={40} className="text-slate-600 dark:text-slate-400" /></div>
            }
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h4 className="font-bold text-[20px] text-white leading-tight mb-3 drop-shadow-md">{item.title || "Featured Link"}</h4>
                <span className="inline-flex">
                    <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-[13px] font-bold px-5 py-2 flex items-center gap-2 group-hover:bg-white group-hover:text-black transition-all">
                        {item.button_text || "View"} <ArrowRight size={13} />
                    </span>
                </span>
            </div>
        </a>
    );
}

function GridBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="grid grid-cols-2 gap-3 w-full">
            {items.map((item: any, i: number) => (
                <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                    className="bg-white dark:bg-[#12151E] rounded-[18px] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 flex flex-col group hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="w-full h-[100px] bg-slate-50 dark:bg-white/5 relative overflow-hidden">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            : <div className="absolute inset-0 flex items-center justify-center"><Grid size={20} className="text-slate-300 dark:text-slate-600" /></div>
                        }
                    </div>
                    <div className="p-3 text-center">
                        <h4 className="font-bold text-[12px] text-slate-900 dark:text-white truncate group-hover:text-[#db2777] transition-colors">{item.title || "Link"}</h4>
                    </div>
                </a>
            ))}
        </div>
    );
}

function ProductsBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {items.map((item: any, i: number) => (
                <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 w-[160px] bg-white dark:bg-[#12151E] rounded-[20px] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 flex flex-col group hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="w-full h-[140px] bg-slate-50 dark:bg-white/5 relative p-3 overflow-hidden">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            : <div className="absolute inset-0 flex items-center justify-center"><ShoppingBag size={28} className="text-slate-300 dark:text-slate-600" /></div>
                        }
                    </div>
                    <div className="p-3 flex flex-col flex-1 text-center">
                        <h4 className="font-bold text-[13px] text-slate-900 dark:text-white line-clamp-1 mb-1">{item.title || "Product"}</h4>
                        {item.description && <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2">{item.description}</p>}
                        <div className="mt-auto">
                            <span className="bg-[#db2777]/10 text-[#db2777] group-hover:bg-[#db2777] group-hover:text-white transition-colors text-[11px] font-bold px-3 py-1.5 rounded-full inline-block">
                                {item.button_text || "Buy Now"}
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
        <div className="space-y-2 w-full">
            {items.map((item: any, i: number) => (
                <a key={i} href={item.url || "#"} target="_blank" rel="noopener noreferrer"
                    className="w-full bg-white dark:bg-[#12151E] rounded-[18px] p-3 shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-3 group hover:shadow-md transition-all">
                    <div className="w-[56px] h-[56px] rounded-[14px] bg-slate-100 dark:bg-white/10 overflow-hidden flex-shrink-0">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><SmartphoneNfc size={22} className="text-slate-300 dark:text-slate-600" /></div>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[14px] text-slate-900 dark:text-white truncate group-hover:text-[#db2777] transition-colors">{item.title || "App"}</h4>
                        {item.description && <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate">{item.description}</p>}
                    </div>
                    <span className="flex-shrink-0 bg-slate-100 dark:bg-white/10 group-hover:bg-[#db2777] group-hover:text-white text-slate-600 dark:text-slate-400 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors">
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
    const h = isVertical ? "h-[200px] w-[110px]" : isSquare ? "h-[140px] w-[140px]" : "h-[110px] w-[200px]";
    return (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
            {items.map((item: any, i: number) => (
                <div key={i} className={`flex-shrink-0 ${h} rounded-[16px] bg-slate-100 dark:bg-white/10 overflow-hidden border border-slate-100 dark:border-white/5`}>
                    {item.image_url
                        ? <img src={item.image_url} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-slate-300 dark:text-slate-600" /></div>
                    }
                </div>
            ))}
        </div>
    );
}

function LogosBlockView({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <div className="flex flex-wrap gap-3 justify-center">
            {items.map((item: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-[14px] bg-white dark:bg-[#12151E] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden flex items-center justify-center p-1.5">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-contain" />
                            : <Hexagon size={22} className="text-slate-300 dark:text-slate-600" />
                        }
                    </div>
                    {item.title && <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.title}</span>}
                </div>
            ))}
        </div>
    );
}

function BlockRenderer({ block, theme }: { block: PublicBlock; theme: any }) {
    const type = getUiTypeFromBlock(block);
    const settings = block.settings || {};
    const items = block.items || [];
    
    // We'll reuse the logic from PhonePreview for better consistency
    const alignment = settings.text_alignment || "center";
    const effectiveTextColor = theme.textColor || "#000000";
    
    const displayLabel = settings.title || settings.text || settings.name;

    switch (type) {
        case "links_carousel": return <CarouselBlockView items={items} />;
        case "hero_single_link": return <HeroBlockView item={items[0]} />;
        case "links_grid": return <GridBlockView items={items} />;
        case "add_products": return <ProductsBlockView items={items} />;
        case "add_apps": return <AppsBlockView items={items} />;
        case "vertical_media":
        case "square_media":
        case "horizontal_media": return <MediaBlockView items={items} type={type} />;
        case "add_logos": return <LogosBlockView items={items} />;
        
        case "link":
            return (
                <a href={block.location_url || "#"} className="w-full flex items-center justify-center min-h-[64px] py-4 px-8 shadow-md transition-all hover:scale-[1.01] active:scale-95" 
                   style={{ background: theme.btnStyle?.background || "white", color: theme.btnStyle?.color || theme.textColor, borderRadius: theme.btnStyle?.borderRadius || "20px" }}>
                    {settings.icon && <i className={`${settings.icon} absolute left-8 text-xl opacity-80`}></i>}
                    <span className="font-bold text-[16px] truncate max-w-[80%]">{displayLabel || "Open Website"}</span>
                    <MoreHorizontal size={18} className="absolute right-8 opacity-20" />
                </a>
            );

        case "heading":
            return (
                <div className="pt-8 pb-3" style={{ textAlign: alignment as any }}>
                    <h2 className="text-[24px] font-black tracking-tighter leading-tight" style={{ color: effectiveTextColor }}>
                        {displayLabel || "Untitled Section"}
                    </h2>
                </div>
            );

        case "paragraph":
            return (
                <div className="pb-2" style={{ textAlign: alignment as any }}>
                    <p className="text-[15px] leading-relaxed opacity-70 font-medium whitespace-pre-line" style={{ color: effectiveTextColor }}>
                        {settings.description || settings.text}
                    </p>
                </div>
            );

        case "avatar":
            return (
                <div className="flex flex-col items-center py-6">
                    <div className="relative overflow-hidden border-[4px] shadow-2xl border-white/10" style={{ borderRadius: '9999px', width: settings.size || 140, height: settings.size || 140 }}>
                        <img src={settings.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"} className="w-full h-full object-cover" />
                    </div>
                    {displayLabel && (
                        <p className="mt-5 text-[17px] font-black tracking-tight" style={{ color: effectiveTextColor }}>{displayLabel}</p>
                    )}
                </div>
            );

        case "socials":
            return (
                <div className="flex flex-wrap items-center gap-4 py-6" style={{ justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>
                    {settings.socials && Object.entries(settings.socials).map(([key, value]: any) => value && (
                        <a key={key} href={value.includes("@") ? `mailto:${value}` : value.startsWith("+") || (value.length > 5 && /^\d+$/.test(value)) ? `tel:${value}` : value} target="_blank" rel="noopener noreferrer"
                            className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-full hover:scale-110 active:scale-95 transition-all">
                            <span className="text-white"><Globe size={22} /></span>
                        </a>
                    ))}
                </div>
            );

        {/* ── HERO SECTION (Edge-to-Edge Website Style) ── */}
                if (type === "hero_section" || type === "hero_aesthetic_section") return (
                    <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-6 mb-8 overflow-hidden rounded-b-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-black group min-h-[400px] flex items-end">
                        {settings.image ? (
                            <img src={settings.image} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        <div className="relative z-10 p-8 w-full text-left">
                            {(settings.brand_name || settings.headline) && (
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-3">{settings.brand_name || settings.headline}</p>
                            )}
                            <h2 className="text-[36px] font-black leading-[1.05] tracking-tight text-white mb-4">
                                {settings.title || "Elevate Your Vision"}
                            </h2>
                            {(settings.subtitle || settings.subheadline || settings.description) && (
                                <p className="text-[15px] text-white/80 leading-relaxed max-w-[90%] mb-6">
                                    {settings.subtitle || settings.subheadline || settings.description}
                                </p>
                            )}
                            {settings.cta_text && (
                                <button className="px-8 py-3.5 rounded-full bg-white text-black text-[13px] font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform">
                                    {settings.cta_text}
                                </button>
                            )}
                        </div>
                    </div>
                );

                

{/* ── STATS (Clean Minimal) ── */}
                if (type === "stats_section" || type === "stats_minimal_section") return (
                    <div className="w-full mt-4 mb-8 py-6 border-y border-white/10">
                        {(settings.items || []).length > 0 ? (
                            <div className="grid grid-cols-3 gap-4 divide-x divide-white/10">
                                {(settings.items || []).slice(0, 3).map((s: any, i: number) => (
                                    <div key={i} className="flex flex-col items-center text-center px-2">
                                        <span className="text-[28px] font-black tracking-tight" style={{ color: (theme.textColor || "#000000") }}>{s.value || "—"}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1" style={{ color: (theme.textColor || "#000000") }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-8 opacity-40">
                                {["200+", "50K", "4.9★"].map((v, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[28px] font-black tracking-tight">{v}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

                

{/* ── BRANDS (Clean Slider) ── */}
                if (type === "brands_section") return (
                    <div className="w-full mt-4 mb-8 py-4">
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 text-center mb-6" style={{ color: (theme.textColor || "#000000") }}>Trusted By</p>
                        {(settings.logos || []).length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                {(settings.logos || []).slice(0, 6).map((l: any, i: number) => (
                                    <img key={i} src={l.image} className="h-6 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-8 opacity-20">
                                {[40, 60, 45].map((w, i) => <div key={i} className="h-4 rounded-full bg-current" style={{ width: w, color: (theme.textColor || "#000000") }} />)}
                            </div>
                        )}
                    </div>
                );

                

{/* ── PORTFOLIO (Clean Grid) ── */}
                if (type === "portfolio_section" || type === "portfolio_minimal_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight px-1" style={{ color: (theme.textColor || "#000000") }}>{settings.title || "Selected Works"}</h3>
                        {(settings.items || []).length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {(settings.items || []).slice(0, 4).map((item: any, i: number) => (
                                    <div key={i} className={`relative rounded-2xl overflow-hidden bg-black/5 group ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                                        {item.image && <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                                            <p className="text-[14px] font-bold text-white tracking-tight">{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 opacity-20">
                                {[0, 1, 2].map(i => <div key={i} className={`rounded-2xl bg-current ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`} style={{ color: (theme.textColor || "#000000") }} />)}
                            </div>
                        )}
                    </div>
                );

                

{/* ── SERVICES (Minimal List) ── */}
                if (type === "services_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((s: any, i: number) => (
                            <div key={i} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0 group cursor-pointer">
                                {s.image ? (
                                    <img src={s.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0"><Sparkles size={20} className="opacity-50" /></div>
                                )}
                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="text-[16px] font-bold tracking-tight mb-1" style={{ color: (theme.textColor || "#000000") }}>{s.title}</p>
                                    <p className="text-[13px] opacity-60 leading-relaxed">{s.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="space-y-4 opacity-20">
                                {[0, 1].map(i => <div key={i} className="h-16 rounded-2xl bg-current" style={{ color: (theme.textColor || "#000000") }} />)}
                            </div>
                        )}
                    </div>
                );

                

{/* ── TESTIMONIALS (Clean Typography) ── */}
                if (type === "testimonials_section" || type === "testimonial_highlight_section") return (
                    <div className="w-full mt-6 mb-8 px-2 flex flex-col items-center text-center">
                        <div className="w-10 h-10 mb-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <span className="text-xl font-serif opacity-50" style={{ color: (theme.textColor || "#000000") }}>"</span>
                        </div>
                        {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 1).map((t: any, i: number) => (
                            <div key={i}>
                                <p className="text-[18px] font-medium leading-relaxed opacity-90 break-words mb-6" style={{ color: (theme.textColor || "#000000") }}>{t.description || t.quote}</p>
                                {t.author_image && <img src={t.author_image} className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" />}
                                <p className="text-[12px] font-bold tracking-widest uppercase" style={{ color: (theme.textColor || "#000000") }}>{t.author || t.author_name}</p>
                            </div>
                        )) : (
                            <div>
                                <p className="text-[18px] font-medium leading-relaxed opacity-40">The most incredible experience.</p>
                                {settings.author_name && <p className="text-[12px] font-bold tracking-widest uppercase opacity-40 mt-4">— {settings.author_name}</p>}
                            </div>
                        )}
                    </div>
                );

                

{/* ── FAQ (Minimal Accordion) ── */}
                if (type === "faq_section" || type === "faq_cards_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight mb-2" style={{ color: (theme.textColor || "#000000") }}>{settings.title || "FAQ"}</h3>
                        <div className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                            {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((f: any, i: number) => (
                                <div key={i} className="py-4">
                                    <p className="text-[15px] font-bold tracking-tight mb-2" style={{ color: (theme.textColor || "#000000") }}>{f.question}</p>
                                    {f.answer && <p className="text-[13px] opacity-60 leading-relaxed">{f.answer}</p>}
                                </div>
                            )) : (
                                <div className="space-y-3 opacity-20 py-4">{[0,1].map(i => <div key={i} className="h-6 w-3/4 rounded bg-current" style={{ color: (theme.textColor || "#000000") }} />)}</div>
                            )}
                        </div>
                    </div>
                );

                

{/* ── CTA SECTION (Solid Block) ── */}
                if (type === "cta_section" || type === "cta_fullscreen_section") return (
                    <div className="w-full mt-6 mb-8 p-8 rounded-3xl bg-black dark:bg-white text-center flex flex-col items-center">
                        <h3 className="text-[26px] font-black leading-tight tracking-tight text-white dark:text-black mb-3">{settings.title || "Ready to get started?"}</h3>
                        {settings.subtitle && <p className="text-[14px] text-white/70 dark:text-black/70 mb-8 max-w-[80%]">{settings.subtitle}</p>}
                        {settings.button_text && (
                            <button className="px-8 py-3.5 rounded-full bg-white dark:bg-black text-black dark:text-white text-[13px] font-bold hover:scale-105 transition-transform w-full max-w-[200px]">
                                {settings.button_text}
                            </button>
                        )}
                    </div>
                );

                

{/* ── SOCIAL MEDIA SECTION (Clean Row) ── */}
                if (type === "social_medias_section") return (
                    <div className="w-full mt-4 mb-8 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-5">
                            {(settings.items || []).slice(0, 6).map((s: any, i: number) => (
                                <a key={i} href={s.link} className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                    <i className={`${s.icon} text-xl`} style={{ color: (theme.textColor || "#000000") }} />
                                </a>
                            ))}
                        </div>
                    </div>
                );

                

{/* ── HEADER PROFILE SECTION (Edge-to-Edge) ── */}
                if (type === "header_profile_section") return (
                    <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-6 mb-8 overflow-hidden rounded-b-[40px] bg-black/5 dark:bg-white/5 pb-8">
                        {settings.cover_image ? (
                            <img src={settings.cover_image} className="w-full h-[160px] object-cover" />
                        ) : (
                            <div className="w-full h-[160px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                        )}
                        <div className="flex flex-col items-center text-center -mt-12 relative z-10 px-6">
                            {settings.avatar ? (
                                <img src={settings.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#0a0a0a] shadow-lg mb-4" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center mb-4"><User size={32} className="opacity-50" /></div>
                            )}
                            <p className="text-[24px] font-black tracking-tight mb-2" style={{ color: (theme.textColor || "#000000") }}>{settings.name || "Profile Name"}</p>
                            {settings.bio && <p className="text-[14px] opacity-70 leading-relaxed max-w-[90%]">{settings.bio}</p>}
                        </div>
                    </div>
                );

                

{/* ── HERO PRODUCT SECTION (Clean Showcase) ── */}
                if (type === "hero_product_section") return (
                    <div className="w-full mt-4 mb-8 group cursor-pointer">
                        <div className="relative aspect-square w-full rounded-3xl overflow-hidden mb-5 bg-black/5">
                            {settings.product_image && <img src={settings.product_image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-sm">Featured</div>
                        </div>
                        <div className="px-2">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-[20px] font-black tracking-tight leading-tight" style={{ color: (theme.textColor || "#000000") }}>{settings.title || "Premium Product"}</h3>
                                {settings.price && <span className="text-[20px] font-black shrink-0" style={{ color: (theme.textColor || "#000000") }}>{settings.price}</span>}
                            </div>
                            {settings.subtitle && <p className="text-[14px] opacity-60 mb-5">{settings.subtitle}</p>}
                            {settings.cta_text && (
                                <button className="w-full py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold">
                                    {settings.cta_text}
                                </button>
                            )}
                        </div>
                    </div>
                );

                

{/* ── FEATURED PRODUCT (List Item) ── */}
                if (type === "featured_product_section") return (
                    <div className="w-full mt-4 mb-8 flex gap-5 items-center group cursor-pointer">
                        {settings.image ? (
                            <img src={settings.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-black/5" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-black/5 dark:bg-white/5" />
                        )}
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-[16px] font-bold tracking-tight mb-1 truncate" style={{ color: (theme.textColor || "#000000") }}>{settings.name || "Product"}</p>
                            <p className="text-[13px] opacity-50 truncate mb-2">{settings.description}</p>
                            {settings.price && <p className="text-[16px] font-black" style={{ color: (theme.textColor || "#000000") }}>{settings.price}</p>}
                        </div>
                    </div>
                );

                

{/* ── PRODUCT LIST (Clean List) ── */}
                if (type === "product_list_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight mb-4 px-1" style={{ color: (theme.textColor || "#000000") }}>Shop</h3>
                        <div className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                            {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((p: any, i: number) => (
                                <div key={i} className="flex gap-4 py-4 items-center group cursor-pointer">
                                    {p.image ? (
                                        <img src={p.image} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-black/5" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-black/5 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-bold tracking-tight truncate" style={{ color: (theme.textColor || "#000000") }}>{p.name}</p>
                                    </div>
                                    {p.price && <p className="text-[15px] font-black pl-2" style={{ color: (theme.textColor || "#000000") }}>{p.price}</p>}
                                </div>
                            )) : (
                                <div className="h-20 opacity-20 py-4 flex items-center">Empty List</div>
                            )}
                        </div>
                    </div>
                );

                

{/* ── TRUST BADGES (Minimal Text) ── */}
                if (type === "trust_badges_section") return (
                    <div className="w-full mt-4 mb-8 py-4 border-y border-black/5 dark:border-white/5">
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                            {(settings.items || []).map((b: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <i className={`${b.icon} text-[14px]`} style={{ color: (theme.textColor || "#000000") }} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-70" style={{ color: (theme.textColor || "#000000") }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

                

{/* ── URGENCY OFFER (Clean Banner) ── */}
                if (type === "urgency_offer_section") return (
                    <div className="w-[calc(100%+3rem)] -mx-6 mt-4 mb-8 p-8 bg-red-500 text-white text-center">
                        <div className="inline-flex items-center gap-2 mb-4 opacity-80">
                            <Clock size={14} className="animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Limited Time Offer</p>
                        </div>
                        <h3 className="text-[24px] font-black tracking-tight leading-tight mb-3">{settings.title || "Special Offer"}</h3>
                        {settings.description && <p className="text-[14px] opacity-90 leading-relaxed max-w-[90%] mx-auto mb-6">{settings.description}</p>}
                        {settings.button_text && (
                            <button className="px-8 py-3.5 rounded-full bg-white text-red-500 text-[12px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                                {settings.button_text}
                            </button>
                        )}
                    </div>
                );

                

{/* ── CONTACT SECTION (Clean Links) ── */}
                if (type === "contact_section") return (
                    <div className="w-full mt-4 mb-8 space-y-2">
                        {settings.email && (
                            <a href={`mailto:${settings.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <Mail size={18} style={{ color: (theme.textColor || "#000000") }} />
                                <span className="text-[15px] font-bold truncate" style={{ color: (theme.textColor || "#000000") }}>{settings.email}</span>
                            </a>
                        )}
                        {settings.phone && (
                            <a href={`tel:${settings.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <Phone size={18} style={{ color: (theme.textColor || "#000000") }} />
                                <span className="text-[15px] font-bold truncate" style={{ color: (theme.textColor || "#000000") }}>{settings.phone}</span>
                            </a>
                        )}
                        {settings.whatsapp && (
                            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors">
                                <MessageCircle size={18} className="text-[#25D366]" />
                                <span className="text-[15px] font-bold truncate text-[#25D366]">{settings.whatsapp}</span>
                            </a>
                        )}
                    </div>
                );

                

{/* ── IMPACT SECTION (Checklist) ── */}
                if (type === "impact_section") return (
                    <div className="w-full mt-3 mb-4 p-7 rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-5">
                        <h3 className="text-[20px] font-black tracking-tight text-white leading-tight">{settings.title || "Our Impact"}</h3>
                        {settings.description && <p className="text-[13px] text-white/50 leading-relaxed">{settings.description}</p>}
                        <div className="space-y-3 pt-2">
                            {(settings.points || []).slice(0, 3).map((pt: any, i: number) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/20">
                                        <div className="w-2 h-2 rounded-full bg-white/80" />
                                    </div>
                                    <p className="text-[14px] font-medium text-white/80 leading-relaxed">{pt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

                

{/* ── PRICING CARDS (Premium Tiers) ── */}
                if (type === "pricing_cards_section") return (
                    <div className="w-full mt-3 mb-4 space-y-4">
                        {settings.title && <p className="text-[18px] font-black text-center text-white tracking-tight">{settings.title}</p>}
                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
                            {(settings.plans || []).slice(0, 2).map((plan: any, i: number) => (
                                <div key={i} className="w-[85%] shrink-0 snap-center p-6 rounded-[32px] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 backdrop-blur-xl flex flex-col justify-between min-h-[160px]">
                                    <div>
                                        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">{plan.name}</p>
                                        <p className="text-[28px] font-black text-white tracking-tighter">{plan.price}</p>
                                    </div>
                                    {plan.description && <p className="text-[12px] text-white/60 leading-relaxed mt-4">{plan.description}</p>}
                                </div>
                            ))}
                            {(settings.plans || []).length === 0 && (
                                <div className="w-full h-40 rounded-[32px] bg-white/5 border border-white/10 opacity-20" />
                            )}
                        </div>
                    </div>
                );

                

    {/* ── HERO SECTION (Edge-to-Edge Website Style) ── */}
                if (type === "hero_section" || type === "hero_aesthetic_section") return (
                    <div className="relative w-[calc(100%+3rem)] -mx-6 mt-0 mb-8 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-black group min-h-[400px] flex items-end">
                        {settings.image ? (
                            <img src={settings.image} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        <div className="relative z-10 p-8 w-full text-left">
                            {(settings.brand_name || settings.headline) && (
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-3">{settings.brand_name || settings.headline}</p>
                            )}
                            <h2 className="text-[36px] font-black leading-[1.05] tracking-tight text-white mb-4">
                                {settings.title || "Elevate Your Vision"}
                            </h2>
                            {(settings.subtitle || settings.subheadline || settings.description) && (
                                <p className="text-[15px] text-white/80 leading-relaxed max-w-[90%] mb-6">
                                    {settings.subtitle || settings.subheadline || settings.description}
                                </p>
                            )}
                            {settings.cta_text && (
                                <button className="px-8 py-3.5 rounded-full bg-white text-black text-[13px] font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform">
                                    {settings.cta_text}
                                </button>
                            )}
                        </div>
                    </div>
                );

                

{/* ── STATS (Clean Minimal) ── */}
                if (type === "stats_section" || type === "stats_minimal_section") return (
                    <div className="w-full mt-4 mb-8 py-6 border-y border-white/10">
                        {(settings.items || []).length > 0 ? (
                            <div className="grid grid-cols-3 gap-4 divide-x divide-white/10">
                                {(settings.items || []).slice(0, 3).map((s: any, i: number) => (
                                    <div key={i} className="flex flex-col items-center text-center px-2">
                                        <span className="text-[28px] font-black tracking-tight" style={{ color: (theme.textColor || "#000000") }}>{s.value || "—"}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1" style={{ color: (theme.textColor || "#000000") }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-8 opacity-40">
                                {["200+", "50K", "4.9★"].map((v, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[28px] font-black tracking-tight">{v}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

                

{/* ── BRANDS (Clean Slider) ── */}
                if (type === "brands_section") return (
                    <div className="w-full mt-4 mb-8 py-4">
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 text-center mb-6" style={{ color: (theme.textColor || "#000000") }}>Trusted By</p>
                        {(settings.logos || []).length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                {(settings.logos || []).slice(0, 6).map((l: any, i: number) => (
                                    <img key={i} src={l.image} className="h-6 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-8 opacity-20">
                                {[40, 60, 45].map((w, i) => <div key={i} className="h-4 rounded-full bg-current" style={{ width: w, color: (theme.textColor || "#000000") }} />)}
                            </div>
                        )}
                    </div>
                );

                

{/* ── PORTFOLIO (Clean Grid) ── */}
                if (type === "portfolio_section" || type === "portfolio_minimal_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight px-1" style={{ color: (theme.textColor || "#000000") }}>{settings.title || "Selected Works"}</h3>
                        {(settings.items || []).length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {(settings.items || []).slice(0, 4).map((item: any, i: number) => (
                                    <div key={i} className={`relative rounded-2xl overflow-hidden bg-black/5 group ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                                        {item.image && <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                                            <p className="text-[14px] font-bold text-white tracking-tight">{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 opacity-20">
                                {[0, 1, 2].map(i => <div key={i} className={`rounded-2xl bg-current ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`} style={{ color: (theme.textColor || "#000000") }} />)}
                            </div>
                        )}
                    </div>
                );

                

{/* ── SERVICES (Minimal List) ── */}
                if (type === "services_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((s: any, i: number) => (
                            <div key={i} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0 group cursor-pointer">
                                {s.image ? (
                                    <img src={s.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0"><Sparkles size={20} className="opacity-50" /></div>
                                )}
                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="text-[16px] font-bold tracking-tight mb-1" style={{ color: (theme.textColor || "#000000") }}>{s.title}</p>
                                    <p className="text-[13px] opacity-60 leading-relaxed">{s.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="space-y-4 opacity-20">
                                {[0, 1].map(i => <div key={i} className="h-16 rounded-2xl bg-current" style={{ color: (theme.textColor || "#000000") }} />)}
                            </div>
                        )}
                    </div>
                );

                

{/* ── TESTIMONIALS (Clean Typography) ── */}
                if (type === "testimonials_section" || type === "testimonial_highlight_section") return (
                    <div className="w-full mt-6 mb-8 px-2 flex flex-col items-center text-center">
                        <div className="w-10 h-10 mb-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <span className="text-xl font-serif opacity-50" style={{ color: (theme.textColor || "#000000") }}>"</span>
                        </div>
                        {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 1).map((t: any, i: number) => (
                            <div key={i}>
                                <p className="text-[18px] font-medium leading-relaxed opacity-90 break-words mb-6" style={{ color: (theme.textColor || "#000000") }}>{t.description || t.quote}</p>
                                {t.author_image && <img src={t.author_image} className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" />}
                                <p className="text-[12px] font-bold tracking-widest uppercase" style={{ color: (theme.textColor || "#000000") }}>{t.author || t.author_name}</p>
                            </div>
                        )) : (
                            <div>
                                <p className="text-[18px] font-medium leading-relaxed opacity-40">The most incredible experience.</p>
                                {settings.author_name && <p className="text-[12px] font-bold tracking-widest uppercase opacity-40 mt-4">— {settings.author_name}</p>}
                            </div>
                        )}
                    </div>
                );

                

{/* ── FAQ (Minimal Accordion) ── */}
                if (type === "faq_section" || type === "faq_cards_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight mb-2" style={{ color: (theme.textColor || "#000000") }}>{settings.title || "FAQ"}</h3>
                        <div className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                            {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((f: any, i: number) => (
                                <div key={i} className="py-4">
                                    <p className="text-[15px] font-bold tracking-tight mb-2" style={{ color: (theme.textColor || "#000000") }}>{f.question}</p>
                                    {f.answer && <p className="text-[13px] opacity-60 leading-relaxed">{f.answer}</p>}
                                </div>
                            )) : (
                                <div className="space-y-3 opacity-20 py-4">{[0,1].map(i => <div key={i} className="h-6 w-3/4 rounded bg-current" style={{ color: (theme.textColor || "#000000") }} />)}</div>
                            )}
                        </div>
                    </div>
                );

                

{/* ── CTA SECTION (Solid Block) ── */}
                if (type === "cta_section" || type === "cta_fullscreen_section") return (
                    <div className="w-full mt-6 mb-8 p-8 rounded-3xl bg-black dark:bg-white text-center flex flex-col items-center">
                        <h3 className="text-[26px] font-black leading-tight tracking-tight text-white dark:text-black mb-3">{settings.title || "Ready to get started?"}</h3>
                        {settings.subtitle && <p className="text-[14px] text-white/70 dark:text-black/70 mb-8 max-w-[80%]">{settings.subtitle}</p>}
                        {settings.button_text && (
                            <button className="px-8 py-3.5 rounded-full bg-white dark:bg-black text-black dark:text-white text-[13px] font-bold hover:scale-105 transition-transform w-full max-w-[200px]">
                                {settings.button_text}
                            </button>
                        )}
                    </div>
                );

                

{/* ── SOCIAL MEDIA SECTION (Clean Row) ── */}
                if (type === "social_medias_section") return (
                    <div className="w-full mt-4 mb-8 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-5">
                            {(settings.items || []).slice(0, 6).map((s: any, i: number) => (
                                <a key={i} href={s.link} className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                    <i className={`${s.icon} text-xl`} style={{ color: (theme.textColor || "#000000") }} />
                                </a>
                            ))}
                        </div>
                    </div>
                );

                

{/* ── HEADER PROFILE SECTION (Edge-to-Edge) ── */}
                if (type === "header_profile_section") return (
                    <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-6 mb-8 overflow-hidden rounded-b-[40px] bg-black/5 dark:bg-white/5 pb-8">
                        {settings.cover_image ? (
                            <img src={settings.cover_image} className="w-full h-[160px] object-cover" />
                        ) : (
                            <div className="w-full h-[160px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                        )}
                        <div className="flex flex-col items-center text-center -mt-12 relative z-10 px-6">
                            {settings.avatar ? (
                                <img src={settings.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#0a0a0a] shadow-lg mb-4" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center mb-4"><User size={32} className="opacity-50" /></div>
                            )}
                            <p className="text-[24px] font-black tracking-tight mb-2" style={{ color: (theme.textColor || "#000000") }}>{settings.name || "Profile Name"}</p>
                            {settings.bio && <p className="text-[14px] opacity-70 leading-relaxed max-w-[90%]">{settings.bio}</p>}
                        </div>
                    </div>
                );

                

{/* ── HERO PRODUCT SECTION (Clean Showcase) ── */}
                if (type === "hero_product_section") return (
                    <div className="w-full mt-4 mb-8 group cursor-pointer">
                        <div className="relative aspect-square w-full rounded-3xl overflow-hidden mb-5 bg-black/5">
                            {settings.product_image && <img src={settings.product_image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-sm">Featured</div>
                        </div>
                        <div className="px-2">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-[20px] font-black tracking-tight leading-tight" style={{ color: (theme.textColor || "#000000") }}>{settings.title || "Premium Product"}</h3>
                                {settings.price && <span className="text-[20px] font-black shrink-0" style={{ color: (theme.textColor || "#000000") }}>{settings.price}</span>}
                            </div>
                            {settings.subtitle && <p className="text-[14px] opacity-60 mb-5">{settings.subtitle}</p>}
                            {settings.cta_text && (
                                <button className="w-full py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold">
                                    {settings.cta_text}
                                </button>
                            )}
                        </div>
                    </div>
                );

                

{/* ── FEATURED PRODUCT (List Item) ── */}
                if (type === "featured_product_section") return (
                    <div className="w-full mt-4 mb-8 flex gap-5 items-center group cursor-pointer">
                        {settings.image ? (
                            <img src={settings.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-black/5" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-black/5 dark:bg-white/5" />
                        )}
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-[16px] font-bold tracking-tight mb-1 truncate" style={{ color: (theme.textColor || "#000000") }}>{settings.name || "Product"}</p>
                            <p className="text-[13px] opacity-50 truncate mb-2">{settings.description}</p>
                            {settings.price && <p className="text-[16px] font-black" style={{ color: (theme.textColor || "#000000") }}>{settings.price}</p>}
                        </div>
                    </div>
                );

                

{/* ── PRODUCT LIST (Clean List) ── */}
                if (type === "product_list_section") return (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight mb-4 px-1" style={{ color: (theme.textColor || "#000000") }}>Shop</h3>
                        <div className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                            {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((p: any, i: number) => (
                                <div key={i} className="flex gap-4 py-4 items-center group cursor-pointer">
                                    {p.image ? (
                                        <img src={p.image} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-black/5" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-black/5 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-bold tracking-tight truncate" style={{ color: (theme.textColor || "#000000") }}>{p.name}</p>
                                    </div>
                                    {p.price && <p className="text-[15px] font-black pl-2" style={{ color: (theme.textColor || "#000000") }}>{p.price}</p>}
                                </div>
                            )) : (
                                <div className="h-20 opacity-20 py-4 flex items-center">Empty List</div>
                            )}
                        </div>
                    </div>
                );

                

{/* ── TRUST BADGES (Minimal Text) ── */}
                if (type === "trust_badges_section") return (
                    <div className="w-full mt-4 mb-8 py-4 border-y border-black/5 dark:border-white/5">
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                            {(settings.items || []).map((b: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <i className={`${b.icon} text-[14px]`} style={{ color: (theme.textColor || "#000000") }} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-70" style={{ color: (theme.textColor || "#000000") }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

                

{/* ── URGENCY OFFER (Clean Banner) ── */}
                if (type === "urgency_offer_section") return (
                    <div className="w-[calc(100%+3rem)] -mx-6 mt-4 mb-8 p-8 bg-red-500 text-white text-center">
                        <div className="inline-flex items-center gap-2 mb-4 opacity-80">
                            <Clock size={14} className="animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Limited Time Offer</p>
                        </div>
                        <h3 className="text-[24px] font-black tracking-tight leading-tight mb-3">{settings.title || "Special Offer"}</h3>
                        {settings.description && <p className="text-[14px] opacity-90 leading-relaxed max-w-[90%] mx-auto mb-6">{settings.description}</p>}
                        {settings.button_text && (
                            <button className="px-8 py-3.5 rounded-full bg-white text-red-500 text-[12px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                                {settings.button_text}
                            </button>
                        )}
                    </div>
                );

                

{/* ── CONTACT SECTION (Clean Links) ── */}
                if (type === "contact_section") return (
                    <div className="w-full mt-4 mb-8 space-y-2">
                        {settings.email && (
                            <a href={`mailto:${settings.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <Mail size={18} style={{ color: (theme.textColor || "#000000") }} />
                                <span className="text-[15px] font-bold truncate" style={{ color: (theme.textColor || "#000000") }}>{settings.email}</span>
                            </a>
                        )}
                        {settings.phone && (
                            <a href={`tel:${settings.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <Phone size={18} style={{ color: (theme.textColor || "#000000") }} />
                                <span className="text-[15px] font-bold truncate" style={{ color: (theme.textColor || "#000000") }}>{settings.phone}</span>
                            </a>
                        )}
                        {settings.whatsapp && (
                            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors">
                                <MessageCircle size={18} className="text-[#25D366]" />
                                <span className="text-[15px] font-bold truncate text-[#25D366]">{settings.whatsapp}</span>
                            </a>
                        )}
                    </div>
                );

                

{/* ── IMPACT SECTION (Checklist) ── */}
                if (type === "impact_section") return (
                    <div className="w-full mt-3 mb-4 p-7 rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-5">
                        <h3 className="text-[20px] font-black tracking-tight text-white leading-tight">{settings.title || "Our Impact"}</h3>
                        {settings.description && <p className="text-[13px] text-white/50 leading-relaxed">{settings.description}</p>}
                        <div className="space-y-3 pt-2">
                            {(settings.points || []).slice(0, 3).map((pt: any, i: number) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/20">
                                        <div className="w-2 h-2 rounded-full bg-white/80" />
                                    </div>
                                    <p className="text-[14px] font-medium text-white/80 leading-relaxed">{pt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

                

{/* ── PRICING CARDS (Premium Tiers) ── */}
                if (type === "pricing_cards_section") return (
                    <div className="w-full mt-3 mb-4 space-y-4">
                        {settings.title && <p className="text-[18px] font-black text-center text-white tracking-tight">{settings.title}</p>}
                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
                            {(settings.plans || []).slice(0, 2).map((plan: any, i: number) => (
                                <div key={i} className="w-[85%] shrink-0 snap-center p-6 rounded-[32px] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 backdrop-blur-xl flex flex-col justify-between min-h-[160px]">
                                    <div>
                                        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">{plan.name}</p>
                                        <p className="text-[28px] font-black text-white tracking-tighter">{plan.price}</p>
                                    </div>
                                    {plan.description && <p className="text-[12px] text-white/60 leading-relaxed mt-4">{plan.description}</p>}
                                </div>
                            ))}
                            {(settings.plans || []).length === 0 && (
                                <div className="w-full h-40 rounded-[32px] bg-white/5 border border-white/10 opacity-20" />
                            )}
                        </div>
                    </div>
                );

                

    default: return null;
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
    const theme = getTheme(profile.theme);

    const allBlocks = rawTabs.flatMap((t: any) => t.sections || []).flatMap((s: any) => s.blocks || []).filter((b: any) => !b.is_hidden);
    const otherBlocks = currentTab?.sections?.flatMap((s: any) => s.blocks || [])?.filter((b: any) => !b.is_hidden) || [];
    
    // For PortfolioLayout specifically
    const topAvatar = otherBlocks.find(b => getUiTypeFromBlock(b) === "avatar");
    
    const layoutStyle = (profile as any).template_name || (profile as any).layout || (profile as any).settings?.layoutStyle || "standard";

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

    if (layoutStyle === "ugc" || layoutStyle === "aesthetic_influencer") {
        return (
            <>
                <title>{profile.title || username} · UGC</title>
                <div className="min-h-screen flex justify-center w-full" style={theme.bgStyle}>
                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />
                    <div className="w-full max-w-[480px] min-h-screen relative overflow-hidden flex flex-col">
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
                    <div className="w-full max-w-[480px] min-h-screen relative overflow-hidden flex flex-col">
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
                    <div className="w-full max-w-[480px] min-h-screen relative overflow-hidden flex flex-col">
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
                    <div className="w-full max-w-[480px] min-h-screen shadow-2xl relative bg-white overflow-hidden flex flex-col">
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
            <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center w-full">
                <div className="w-full max-w-[480px] min-h-screen shadow-2xl relative bg-white dark:bg-[#0a0a0a] overflow-x-hidden flex flex-col">
                    {/* ── Hero Header ──────────────────────────────────── */}
                <div className="relative pt-16 pb-10 px-6 flex flex-col items-center text-center"
                    style={theme.bgStyle}>

                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />

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

                {/* ── Content ───────────────────────────────────────── */}
                <div className="max-w-lg mx-auto px-6 py-8 space-y-10 w-full">
                    {currentTab?.sections?.map(section => {
                        const hasContent = section.blocks?.some(b => (b.items || []).length > 0);
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
                                {!hasContent && (
                                    <div className="py-8 text-center text-slate-300 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
                                        Empty section
                                    </div>
                                )}
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
