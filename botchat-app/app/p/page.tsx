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
import { Globe, MoreHorizontal, Instagram, MapPin, ArrowUpRight, Camera, Sparkles, Youtube, Video, Clock } from "lucide-react";
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
                <div className="max-w-lg mx-auto px-4 py-8 space-y-10">
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
