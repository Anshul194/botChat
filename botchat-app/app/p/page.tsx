"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Mail, Phone, ArrowRight, Link as LinkIcon, Grid, ShoppingBag,
    SmartphoneNfc, Layers, Image as ImageIcon, Hexagon, Share2, Check,
} from "lucide-react";
import { resolveApiBaseUrl, resolveXHost } from "@/lib/config";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
interface PublicProfile {
    id: number;
    title: string;
    bio: string;
    avatar: string;
    email_link: string;
    contact_link: string;
    theme: string;
    tabs: PublicTab[];
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
        // Uses the exact API endpoint the bio-link builder relies on
        const url = `${baseUrl}/bio-builder?page=${id}`;
        console.log("Fetching public profile from:", url);

        const res = await fetch(url, {
            headers: { 
                "x-host": resolveXHost(), 
                "Accept": "application/json" 
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("API Error:", res.status, res.statusText);
            const text = await res.text();
            console.error("Error body:", text);
            return null;
        }
        
        const json = await res.json();
        console.log("API Response:", json);
        return json?.data || json || null;
    } catch (err) {
        console.error("Network / Fetch exception:", err);
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
                        className="flex-shrink-0 w-[220px] snap-center bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 flex flex-col group transition-all hover:-translate-y-0.5">
                        <div className="w-full h-[120px] bg-slate-100 relative overflow-hidden">
                            {item.image_url
                                ? <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon size={24} className="text-slate-300" /></div>
                            }
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-bold text-[14px] text-slate-900 leading-tight mb-1 truncate">{item.title || "Link"}</h4>
                            {item.description && <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">{item.description}</p>}
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
            className="w-full block bg-slate-900 rounded-[24px] overflow-hidden shadow-xl border border-slate-100 group transition-all hover:-translate-y-0.5 relative h-[200px]">
            {item.image_url
                ? <img src={item.image_url} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
                : <div className="absolute inset-0 flex items-center justify-center bg-slate-800"><ImageIcon size={40} className="text-slate-600" /></div>
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
                    className="bg-white rounded-[18px] overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="w-full h-[100px] bg-slate-50 relative overflow-hidden">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            : <div className="absolute inset-0 flex items-center justify-center"><Grid size={20} className="text-slate-300" /></div>
                        }
                    </div>
                    <div className="p-3 text-center">
                        <h4 className="font-bold text-[12px] text-slate-900 truncate group-hover:text-[#db2777] transition-colors">{item.title || "Link"}</h4>
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
                    className="flex-shrink-0 w-[160px] bg-white rounded-[20px] overflow-hidden shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all hover:-translate-y-0.5">
                    <div className="w-full h-[140px] bg-slate-50 relative p-3 overflow-hidden">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            : <div className="absolute inset-0 flex items-center justify-center"><ShoppingBag size={28} className="text-slate-300" /></div>
                        }
                    </div>
                    <div className="p-3 flex flex-col flex-1 text-center">
                        <h4 className="font-bold text-[13px] text-slate-900 line-clamp-1 mb-1">{item.title || "Product"}</h4>
                        {item.description && <p className="text-[11px] font-bold text-slate-400 mb-2">{item.description}</p>}
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
                    className="w-full bg-white rounded-[18px] p-3 shadow-sm border border-slate-100 flex items-center gap-3 group hover:shadow-md transition-all">
                    <div className="w-[56px] h-[56px] rounded-[14px] bg-slate-100 overflow-hidden flex-shrink-0">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><SmartphoneNfc size={22} className="text-slate-300" /></div>
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[14px] text-slate-900 truncate group-hover:text-[#db2777] transition-colors">{item.title || "App"}</h4>
                        {item.description && <p className="text-[12px] text-slate-400 truncate">{item.description}</p>}
                    </div>
                    <span className="flex-shrink-0 bg-slate-100 group-hover:bg-[#db2777] group-hover:text-white text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-full transition-colors">
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
                <div key={i} className={`flex-shrink-0 ${h} rounded-[16px] bg-slate-100 overflow-hidden border border-slate-100`}>
                    {item.image_url
                        ? <img src={item.image_url} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-slate-300" /></div>
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
                    <div className="w-14 h-14 rounded-[14px] bg-white border border-slate-100 shadow-sm overflow-hidden flex items-center justify-center p-1.5">
                        {item.image_url
                            ? <img src={item.image_url} className="w-full h-full object-contain" />
                            : <Hexagon size={22} className="text-slate-300" />
                        }
                    </div>
                    {item.title && <span className="text-[11px] font-semibold text-slate-500">{item.title}</span>}
                </div>
            ))}
        </div>
    );
}

function BlockRenderer({ block }: { block: PublicBlock }) {
    const items = block.items || [];
    switch (block.type) {
        case "links_carousel": return <CarouselBlockView items={items} />;
        case "hero_single_link": return <HeroBlockView item={items[0]} />;
        case "links_grid": return <GridBlockView items={items} />;
        case "add_products": return <ProductsBlockView items={items} />;
        case "add_apps": return <AppsBlockView items={items} />;
        case "vertical_media":
        case "square_media":
        case "horizontal_media": return <MediaBlockView items={items} type={block.type} />;
        case "add_logos": return <LogosBlockView items={items} />;
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
        if (!id) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        fetchPublicProfile(id).then(data => {
            if (!data) { setNotFound(true); }
            else {
                setProfile(data);
                if (data.tabs?.length) setActiveTab(data.tabs[0].id);
            }
            setLoading(false);
        });
    }, [username]);

    // ── Loading ───────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-[#fce7f3] via-white to-[#fdf2f8] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-[#db2777]/20 border-t-[#db2777] animate-spin" />
                <p className="text-[#db2777] font-semibold text-sm animate-pulse">Loading portfolio…</p>
            </div>
        </div>
    );

    // ── Not Found ────────────────────────────────────────
    if (notFound || !profile || !username) return (
        <div className="min-h-screen bg-gradient-to-br from-[#fce7f3] via-white to-[#fdf2f8] flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto">
                    <LinkIcon size={32} className="text-[#db2777]" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Portfolio Not Found</h2>
                <p className="text-slate-500 font-medium">This profile doesn't exist or hasn't been set up yet.</p>
            </div>
        </div>
    );

    const currentTab = profile.tabs.find(t => t.id === activeTab) || profile.tabs[0];

    return (
        <>
            <title>{profile.title || username} · Bio Link</title>
            <div className="min-h-screen bg-gradient-to-b from-[#fce7f3] via-[#fff0f8] to-white">
                {/* ── Hero Header ──────────────────────────────────── */}
                <div className="relative pt-16 pb-10 px-6 flex flex-col items-center text-center"
                    style={{ background: "linear-gradient(160deg, #db2777 0%, #f472b6 60%, #fce7f3 100%)" }}>

                    <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-[#be185d]/20 translate-x-1/3 translate-y-1/3 blur-2xl pointer-events-none" />

                    <div className="absolute top-4 right-4 z-10">
                        <ShareButton username={username} />
                    </div>

                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-pink-200 mb-4 flex-shrink-0">
                        {profile.avatar
                            ? <img src={profile.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            : <div className="w-full h-full flex items-center justify-center text-white font-black text-3xl">
                                {(profile.title || username).charAt(0).toUpperCase()}
                            </div>
                        }
                    </div>

                    <h1 className="text-[26px] font-black text-white leading-tight drop-shadow-sm">{profile.title || username}</h1>
                    <p className="text-white/70 text-[13px] font-semibold mt-1 mb-3">@{username}</p>

                    {profile.bio && (
                        <p className="text-white/90 text-[14px] font-medium max-w-[300px] leading-relaxed mb-4">{profile.bio}</p>
                    )}

                    {(profile.email_link || profile.contact_link) && (
                        <div className="flex gap-3 mt-2">
                            {profile.email_link && (
                                <a href={`mailto:${profile.email_link}`}
                                    className="h-11 px-6 rounded-full bg-white text-[#db2777] font-bold text-[13px] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95">
                                    <Mail size={15} /> Email
                                </a>
                            )}
                            {profile.contact_link && (
                                <a href={`tel:${profile.contact_link}`}
                                    className="h-11 px-6 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold text-[13px] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95">
                                    <Phone size={15} /> Contact
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Tab Bar ──────────────────────────────────────── */}
                {profile.tabs.length > 1 && (
                    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-pink-100 px-4 py-3">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar justify-start max-w-lg mx-auto">
                            {profile.tabs.map(tab => (
                                <button key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-shrink-0 px-5 py-2 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? "bg-[#db2777] text-white shadow-md shadow-[#db2777]/20"
                                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    }`}>
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
                                    <h3 className="text-[11px] uppercase font-black text-slate-400 tracking-widest px-1">
                                        {section.title}
                                    </h3>
                                )}
                                {section.blocks?.map(block => (
                                    <BlockRenderer key={block.id} block={block} />
                                ))}
                                {!hasContent && (
                                    <div className="py-8 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                                        Empty section
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {(!currentTab?.sections || currentTab.sections.length === 0) && (
                        <div className="py-20 text-center">
                            <p className="text-slate-400 font-medium text-sm">No content here yet.</p>
                        </div>
                    )}
                </div>

                {/* ── Footer ───────────────────────────────────────── */}
                <div className="py-10 text-center">
                    <a href="/" className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-400 hover:text-[#db2777] transition-colors">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-[#db2777] to-[#f472b6] flex items-center justify-center">
                            <LinkIcon size={10} className="text-white" />
                        </div>
                        Made with BotChat Bio
                    </a>
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
