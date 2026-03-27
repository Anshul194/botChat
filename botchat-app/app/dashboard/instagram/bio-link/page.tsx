"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Instagram, MessageSquare, Zap, Target, MoreHorizontal, Search,
    Plus, RefreshCw, Layers, Sparkles, ChevronRight, ChevronLeft, ChevronDown,
    Trash2, Pause, Play, X, SlidersHorizontal, ArrowRight,
    Edit3, Save, Copy, Check, Loader2, Megaphone, Activity,
    Eye, Settings, Tag, MessageCircle, Image as ImageIcon,
    FileText, PieChart, Info, AlertCircle, Box, Heart, Bell, User,
    ShieldCheck, Settings2, BarChart3, ClipboardList, Globe,
    Youtube, Music, Video, Smartphone, Share2, ExternalLink,
    Link as LinkIcon, Bold, Italic, Type, Palette, MoreVertical,
    GripVertical, Palette as ThemeIcon, Layout, Monitor, MousePointerClick,
    Star, Quote, Code, Grip, Grid, Disc, Wifi, Clock, MapPin, Volume2, PlayCircle, Send
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BioLinkItem {
    id: string;
    type: "text" | "link" | "image" | "video" | "youtube" | "reel" | "carousel" | "header" | "instagram_card" | "scroller" | "stats_grid" | "brand_scroller" | "service_card" | "project_card" | "testimonial" | "skills_cloud" | "faq_item" | "reels_grid" | "story_highlights" | "countdown" | "audio_player" | "map_section";
    title?: string;
    content?: string;
    url?: string;
    subtitle?: string;
    icon?: string;
    active: boolean;
    color?: string;
    bgColor?: string;
    thumbnail?: string;
    priority?: "primary" | "secondary" | "grid" | "stack";
    media?: string[];
    stats?: { label?: string; value?: string; icon?: string }[];
    price?: string;
    author?: string;
    rating?: number;
    skills?: string[];
}

interface BioLinkConfig {
    profileImage: string;
    name: string;
    bio: string;
    theme: "classic" | "dark" | "glass" | "gradient" | "minimal" | "premium";
    accentColor: string;
    backgroundColor: string;
    followerCount: string;
    socialHandles: {
        instagram?: string;
        facebook?: string;
        youtube?: string;
        whatsapp?: string;
        threads?: string;
    }
}

const LINK_TYPES = [
    { id: "text", label: "Text Block", icon: Type, desc: "Simple bio or announcement" },
    { id: "link", label: "Button Link", icon: MousePointerClick, desc: "Standard clickable button" },
    { id: "image", label: "Image Blast", icon: ImageIcon, desc: "Single high-res image" },
    { id: "video", label: "Video Loop", icon: Video, desc: "Autoplay video or link" },
    { id: "project_card", label: "Project Spotlight", icon: Layout, desc: "Feature your best work" },
    { id: "testimonial", label: "Wall of Love", icon: Star, desc: "What clients say about you" },
    { id: "skills_cloud", label: "Expertise Tags", icon: Code, desc: "Cloud of skills or tools" },
    { id: "faq_item", label: "FAQ Q&A", icon: Info, desc: "Answers to common queries" },
    { id: "instagram_card", label: "IG Profile Card", icon: Instagram, desc: "Large card with follower count" },
    { id: "scroller", label: "Product Scroller", icon: Smartphone, desc: "Horizontal image carousel" },
    { id: "stats_grid", label: "Creator Metrics", icon: Activity, desc: "Show engagement, reach, etc." },
    { id: "brand_scroller", label: "Brand Partners", icon: Box, desc: "Scrolling logos of brands" },
    { id: "service_card", label: "Rate Card", icon: Tag, desc: "Professional service offerings" },
    { id: "reels_grid", label: "Instagram Reels", icon: Video, desc: "Vertical video grid layout" },
    { id: "story_highlights", label: "Story Highlights", icon: Disc, desc: "Circular story bubbles" },
    { id: "countdown", label: "Countdown", icon: Clock, desc: "T-minus to your next drop" },
    { id: "audio_player", label: "Media Player", icon: Music, desc: "Spotify-style audio bar" },
    { id: "map_section", label: "Location", icon: MapPin, desc: "Show your base of operations" },
    { id: "header", label: "Section Header", icon: Bold, desc: "Organize your page" }
] as const;
const INITIAL_LINKS: BioLinkItem[] = [
    {
        id: "1", type: "text", title: "STRATEGIC CONTENT & EDITORIAL CURATOR", active: true, priority: "stack",
        content: "High-End Fashion • Luxury Lifestyle • Editorial Photography. Crafting visual narratives for the world’s most iconic fashion houses and boutique labels."
    },
    {
        id: "2", type: "stats_grid", title: "PORTFOLIO METRICS", active: true, priority: "stack",
        stats: [
            { label: "Reach", value: "5.4M", icon: "Target" },
            { label: "Engagement", value: "7.2%", icon: "Heart" },
            { label: "Client ROI", value: "3.5x", icon: "Activity" }
        ]
    },
    {
        id: "3", type: "link", title: "BOOK AN EDITORIAL", active: true, priority: "stack",
        url: "#", subtitle: "PRIMARY ACTION"
    },
    {
        id: "4", type: "image", title: "PARIS FASHION WEEK: COUTURE ‘26", active: true, priority: "stack",
        url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "5", type: "project_card", title: "Vogue Cover Story", subtitle: "Editorial Photography", active: true, priority: "grid",
        url: "https://images.unsplash.com/photo-1490481651871-ab68624d5517?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "99", type: "project_card", title: "Bazaar Editorial", subtitle: "Campaign Design", active: true, priority: "grid",
        url: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: "6", type: "brand_scroller", title: "BRAND PARTNERSHIPS", active: true, priority: "stack",
        media: [
            "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
            "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
            "https://upload.wikimedia.org/wikipedia/commons/b/b3/Gucci_logo.svg",
            "https://upload.wikimedia.org/wikipedia/commons/0/0e/Louis_Vuitton_logo.svg"
        ]
    },
    {
        id: "7", type: "service_card", title: "Full Editorial Package", subtitle: "Strategic brand placement with a professional editorial photoshoot & story highlights.", active: true, priority: "stack",
        price: "$4,500"
    },
    {
        id: "8", type: "testimonial", author: "Creative Director, Vogue", content: "Their vision for visual storytelling is unmatched. They don’t just take photos; they craft entire worlds that evoke emotion and luxury.", rating: 5, active: true, priority: "stack"
    }
];

const TEMPLATES: Record<string, {
    name: string,
    tag: string,
    description: string,
    previewImage: string,
    config: BioLinkConfig,
    links: BioLinkItem[]
}> = {
    editorial: {
        name: "Editorial Rose",
        tag: "Bestseller",
        description: "Elegant, high-fashion aesthetic for creators.",
        previewImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
        config: {
            profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            name: "VALENTINA ROSE",
            bio: "Editorial Photography, Luxury Lifestyle, Paris Fashion",
            theme: "minimal" as const,
            accentColor: "#db27ac",
            backgroundColor: "#fdf2f8",
            followerCount: "5.4M",
            socialHandles: { instagram: "valentinarose", youtube: "valentinarose", whatsapp: "1234567890", threads: "valentinarose" }
        },
        links: [
            { id: "s1", type: "story_highlights", active: true, priority: "stack", media: [
                "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891",
                "https://images.unsplash.com/photo-1506152983158-b4a74a01c721",
                "https://images.unsplash.com/photo-1469334031218-e382a71b716b",
                "https://images.unsplash.com/photo-1490261180351-4091f0985558"
            ], stats: [{ label: "Paris" }, { label: "Milan" }, { label: "Vibe" }, { label: "Couture" }] },
            { id: "t1", type: "text", title: "STRATEGIC CONTENT & EDITORIAL CURATOR", active: true, priority: "stack",
              content: "High-End Fashion • Luxury Lifestyle • Editorial Photography. Crafting visual narratives for the world’s most iconic fashion houses and boutique labels." 
            },
            { id: "r1", type: "reels_grid", title: "LATEST FROM VOGUE", active: true, priority: "stack", media: [
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b",
                "https://images.unsplash.com/photo-1490481651871-ab68624d5517",
                "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93",
                "https://images.unsplash.com/photo-1481824429379-07aa5e5b0739"
            ], stats: [{ value: "1.2M" }, { value: "850K" }, { value: "2.4M" }, { value: "540K" }] },
            ...INITIAL_LINKS.filter(l => !["1"].includes(l.id))
        ]
    },
    midnight: {
        name: "Midnight Tech",
        tag: "Modern",
        description: "Sleek, dark, and punchy for tech enthusiasts.",
        previewImage: "https://images.unsplash.com/photo-1514333924203-9a4fd97597cd?auto=format&fit=crop&q=80&w=800",
        config: {
            profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
            name: "ELIAS VANCE",
            bio: "Cinematic Visuals, Dark Aesthetic, Tech Reviewer",
            theme: "dark" as const,
            accentColor: "#facc15",
            backgroundColor: "#111827",
            followerCount: "820K",
            socialHandles: { instagram: "eliasvance", youtube: "eliasvance", whatsapp: "9876543210" }
        },
        links: [
            { id: "v1", type: "video", title: "MY SHOWREEL 2026", active: true, priority: "stack" },
            { id: "t1", type: "text", content: "Exploring the intersection of tech and culture in the heart of London.", active: true, priority: "stack" },
            { id: "s1", type: "stats_grid", title: "IMPACT METRICS", stats: [{ label: "Monthly Views", value: "24M", icon: "Eye" }, { label: "Engagement", value: "8.2%", icon: "Zap" }, { label: "Live Subs", value: "820K+", icon: "User" }], active: true, priority: "stack" }
        ]
    },
    canvas: {
        name: "Pure Canvas",
        tag: "Minimal",
        description: "Focus on work with zero distractions.",
        previewImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800",
        config: {
            profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200",
            name: "MARA LIN",
            bio: "Product Designer, Visual Artist, Minimalism.",
            theme: "minimal" as const,
            accentColor: "#171717",
            backgroundColor: "#ffffff",
            followerCount: "12K",
            socialHandles: { instagram: "maralin", threads: "maralin" }
        },
        links: [
            { id: "m1", type: "project_card", title: "Abstract UI Kit", subtitle: "2026 Release", url: "https://images.unsplash.com/photo-1541461984411-ae93c7841c10?auto=format&fit=crop&q=80&w=800", active: true, priority: "grid" },
            { id: "m2", type: "project_card", title: "Glass Icon Set", subtitle: "Coming Soon", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800", active: true, priority: "grid" }
        ]
    },
    mosaic: {
        name: "Mosaic Pulse",
        tag: "Creative",
        description: "Dynamic and loud for bold visual artists.",
        previewImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
        config: {
            profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
            name: "KAI STORM",
            bio: "Streetwear Culture, Urban Lifestyle, Film Photography",
            theme: "gradient" as const,
            accentColor: "#8b5cf6",
            backgroundColor: "#f5f3ff",
            followerCount: "4.1M",
            socialHandles: { instagram: "kaistorm", youtube: "kaistorm", whatsapp: "5550123" }
        },
        links: [
            { id: "k1", type: "image", title: "SPRING '26 LOOKBOOK", url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800", active: true, priority: "stack" },
            { id: "k2", type: "scroller", title: "EXCLUSIVE DROPS", media: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff", "https://images.unsplash.com/photo-1552346154-21d32810aba3"], active: true, priority: "stack" }
        ]
    },
    boutique: {
        name: "Boutique Influence",
        tag: "Service",
        description: "Sales-focused layout for mentors and coaches.",
        previewImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
        config: {
            profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200",
            name: "SERENA LUXE",
            bio: "Brand Strategy, Mental Health Coach, Speaker",
            theme: "premium" as const,
            accentColor: "#92400e",
            backgroundColor: "#fffdfa",
            followerCount: "68K",
            socialHandles: { instagram: "serenaluxe", whatsapp: "000111222" }
        },
        links: [
            { id: "b1", type: "service_card", title: "1:1 Coaching Program", subtitle: "Strategic scaling for female founders ready to hit 7 figures.", price: "$3,500", active: true, priority: "stack" },
            { id: "b2", type: "brand_scroller", title: "WORK FEATURED IN", media: ["https://upload.wikimedia.org/wikipedia/commons/e/e8/Forbes_logo.svg", "https://upload.wikimedia.org/wikipedia/commons/0/02/Vogue_logo.svg"], active: true, priority: "stack" }
        ]
    }
};

export default function InstagramBioLinkPage() {
    const [links, setLinks] = useState<BioLinkItem[]>(INITIAL_LINKS);

    const [config, setConfig] = useState<BioLinkConfig>({
        profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        name: "VALENTINA ROSE",
        bio: "Editorial Photography, Luxury Lifestyle, Paris Fashion",
        theme: "minimal",
        accentColor: "#db27ac",
        backgroundColor: "#fdf2f8",
        followerCount: "5.4M",
        socialHandles: {
            instagram: "valentinarose",
            youtube: "valentinarose",
            whatsapp: "1234567890",
            threads: "valentinarose"
        }
    });

    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"templates" | "links" | "design" | "settings">("templates");
    const [mobileTab, setMobileTab] = useState<"about" | "projects" | "proof">("about");
    const [previewMode, setPreviewMode] = useState<"mobile" | "web">("mobile");
    const [showTypeSelector, setShowTypeSelector] = useState(false);

    // ── Handlers ────────────────────────────────────────────────────────
    const handleAddLink = (type: BioLinkItem["type"]) => {
        const newItem: BioLinkItem = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            title: `New ${type.replace("_", " ").charAt(0).toUpperCase() + type.replace("_", " ").slice(1)}`,
            url: "",
            active: true,
            bgColor: type === "service_card" ? "#171717" : "#007bff",
            priority: "primary",
            stats: type === "stats_grid" ? [
                { label: "Reach", value: "0", icon: "Target" },
                { label: "Engagement", value: "0%", icon: "Heart" },
                { label: "Growth", value: "0", icon: "Activity" }
            ] : undefined,
            content: type === "text" ? "Write something amazing about yourself here..." :
                type === "testimonial" ? "Working with this creator was a game changer for our brand!" : undefined,
            media: (type === "scroller" || type === "brand_scroller") ? [] : undefined,
            price: type === "service_card" ? "$500" : undefined,
            subtitle: type === "service_card" ? "Brief description of the service" :
                type === "project_card" ? "Lead Developer / UX Designer" : undefined,
            author: type === "testimonial" ? "John Doe, CEO of Brand" : undefined,
            rating: type === "testimonial" ? 5 : undefined,
            skills: type === "skills_cloud" ? ["Photography", "Social Media", "Video", "Editing"] : undefined,
        };
        setLinks([newItem, ...links]);
        setShowTypeSelector(false);
        toast.success(`${type.replace("_", " ")} added to your arsenal!`);
    };

    const handleUpdateLink = (id: string, data: Partial<BioLinkItem>) => {
        setLinks(links.map(l => l.id === id ? { ...l, ...data } : l));
    };

    const handleRemoveLink = (id: string) => {
        setLinks(links.filter(l => l.id !== id));
        toast.info("Link removed.");
    };

    const handleApplyTemplate = (id: string) => {
        const template = TEMPLATES[id];
        if (!template) return;

        // Deep copy links to avoid reference issues
        const clonedLinks = JSON.parse(JSON.stringify(template.links));

        setConfig(template.config);
        setLinks(clonedLinks);
        setActiveTab("links");
        toast.success(`${template.name} template applied!`, {
            description: "Your blocks and styling have been updated."
        });
    };

    // ── Components ────────────────────────────────────────────────────────
    const FullWebPreview = () => (
        <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-500">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-pink-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="bg-white border border-slate-200 rounded-lg py-1 px-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Globe size={12} /> portfolio.me/{config.socialHandles.instagram || "creator"}
                </div>
                <div className="flex gap-3">
                    <Monitor size={16} className="text-slate-300" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                <div className="max-w-[1200px] mx-auto px-10 py-20">
                    <div className="flex flex-col lg:flex-row gap-20 items-start">
                        <div className="w-full lg:w-1/3 lg:sticky lg:top-0 space-y-10">
                            <div className="w-40 h-40 rounded-full border-4 border-pink-100 p-1.5 shadow-xl">
                                <img src={config.profileImage} className="w-full h-full rounded-full object-cover shadow-inner" alt="Avatar" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">{config.name}</h1>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed">{config.bio}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="px-10 py-5 bg-pink-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-pink-500/30 hover:bg-pink-700 active:scale-95 transition-all">
                                    Book Editorial
                                </button>
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-600 transition-all shadow-sm">
                                        <Instagram size={24} />
                                    </div>
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-600 transition-all shadow-sm">
                                        <Youtube size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-2/3 space-y-24">
                            {/* Priority Grid Area (Stories & Projects) */}
                            <div className="space-y-16">
                                {links.filter(l => l.active && l.type === "story_highlights").map(link => (
                                    <div key={link.id} className="flex gap-10 overflow-x-auto no-scrollbar py-4">
                                        {link.media?.map((m, i) => (
                                            <div key={i} className="flex flex-col items-center gap-4 shrink-0 group">
                                                <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 active:scale-95 transition-transform duration-300">
                                                    <div className="w-full h-full rounded-full border-4 border-white overflow-hidden shadow-xl">
                                                        <img src={m} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Highlight" />
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{link.stats?.[i]?.label || "Highlight"}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {links.filter(l => l.active && l.type === "project_card").map(link => (
                                        <div key={link.id} className="group relative">
                                            <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl transition-all group-hover:-translate-y-2">
                                                <img src={link.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Work" />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-10 opacity-0 group-hover:opacity-100 transition-all">
                                                    <p className="text-pink-400 text-[10px] font-black uppercase tracking-widest mb-1">{link.subtitle}</p>
                                                    <h4 className="text-white text-2xl font-black uppercase tracking-tighter">{link.title}</h4>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-16">
                                {links.filter(l => l.active && l.type === "reels_grid").map(link => (
                                    <div key={link.id} className="col-span-full space-y-8">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                                            <h3 className="text-sm font-black text-pink-500 uppercase tracking-[0.4em]">{link.title || "LATEST FROM INSTAGRAM"}</h3>
                                            <Video size={20} className="text-slate-200" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                            {link.media?.map((m, i) => (
                                                <div key={i} className="aspect-[9/16] rounded-[32px] overflow-hidden relative group shadow-2xl shadow-pink-900/5 cursor-pointer">
                                                    <img src={m} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Reel" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                                        <div className="flex items-center gap-2">
                                                            <Play size={16} className="text-white fill-white" />
                                                            <span className="text-xs font-black text-white italic">{link.stats?.[i]?.value || "420K"} Views</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Secondary Content Stacks */}
                            <div className="space-y-16">
                                {links.filter(l => l.active && !["project_card", "reels_grid", "story_highlights"].includes(l.type)).map(link => (
                                    <div key={link.id} className="bg-slate-50/50 rounded-[48px] p-16 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <h3 className="text-[11px] font-black text-pink-500 uppercase tracking-[0.4em] mb-6">{link.type.replace('_', ' ')}</h3>
                                        
                                        {link.type === "text" ? (
                                            <p className="text-3xl font-bold text-slate-900 leading-[1.6] tracking-tight italic">
                                                {link.content}
                                            </p>
                                        ) : link.type === "countdown" ? (
                                            <div className="flex flex-col items-center text-center space-y-10">
                                                <div className="flex gap-12">
                                                    {["12", "04", "59"].map((num, i) => (
                                                        <div key={i} className="flex flex-col items-center">
                                                            <span className="text-7xl font-black italic tracking-tighter text-slate-900">{num}</span>
                                                            <span className="text-[10px] font-black uppercase opacity-40 mt-2 tracking-[0.2em]">{["Hours", "Minutes", "Seconds"][i]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="px-12 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl">
                                                    Join Waitlist
                                                </button>
                                            </div>
                                        ) : link.type === "audio_player" ? (
                                            <div className="flex items-center gap-10">
                                                <div className="w-24 h-24 rounded-[32px] bg-white border border-slate-100 flex items-center justify-center text-pink-500 shadow-sm relative overflow-hidden group">
                                                    <Music size={32} />
                                                    <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{link.title || "The Vision Mix"}</h4>
                                                    <p className="text-xl text-slate-400 mt-2 font-medium">{link.subtitle || "Premium Audios Cap"}</p>
                                                    <div className="mt-8 flex items-center gap-6">
                                                        <button className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                                                            <Play size={20} fill="currentColor" />
                                                        </button>
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                                                            <div className="absolute inset-y-0 left-0 w-1/3 bg-pink-500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{link.title}</h4>
                                                <p className="text-xl text-slate-500 mt-6 leading-relaxed font-medium">{link.content || link.subtitle}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const MobilePreview = () => (
        <div className="relative w-full max-w-[340px] mx-auto aspect-[9/19.5] bg-neutral-900 border-[14px] border-neutral-900 rounded-[4.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-700 hover:shadow-pink-500/10">
            {/* Dynamic Island Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-9 bg-black rounded-b-[1.75rem] z-50 flex items-center justify-center gap-1.5 px-4">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-8 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Signal/Battery Icons (Status Bar) */}
            <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-8 z-40 text-[10px] font-bold text-slate-800 select-none">
                <span>9:41</span>
                <div className="flex gap-1.5 items-center">
                    <div className="w-3 h-2.5 border-[1.5px] border-slate-800 rounded-sm relative after:content-[''] after:absolute after:-right-1 after:top-1/2 after:-translate-y-1/2 after:w-0.5 after:h-1 after:bg-slate-800" />
                </div>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col overflow-y-auto no-scrollbar bg-slate-50 pt-8">
                {/* Visual Header */}
                <div className="pt-8 px-8 pb-8 bg-white border-b border-pink-50">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                            <div className="w-22 h-22 rounded-full border-[3px] border-pink-100 p-1.5 transition-transform duration-500 hover:rotate-3">
                                <img src={config.profileImage} className="w-full h-full rounded-full object-cover shadow-2xl shadow-pink-900/10" alt="Avatar" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-4 border-white flex items-center justify-center shadow-lg">
                                <Check size={10} className="text-white" strokeWidth={4} />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-2xl font-black text-slate-900 leading-none tracking-tighter uppercase truncate">{config.name}</h2>
                            <div className="flex flex-wrap items-center gap-1.5 mt-2 overflow-hidden">
                                <span className="text-[9px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-md uppercase tracking-widest">Partner</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{config.followerCount} Reach</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-5 rounded-[22px] bg-pink-600 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl shadow-pink-600/30 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3">
                        <Sparkles size={14} className="fill-white" /> Work Together
                    </button>

                    <div className="flex items-center justify-center gap-4 mt-8">
                        {Object.entries(config.socialHandles).map(([platform, handle]) => (
                            handle && (
                                <a key={platform} href="#" className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:scale-110 transition-all shadow-sm hover:shadow-pink-100 hover:border-pink-200">
                                    {platform === "instagram" && <Instagram size={18} />}
                                    {platform === "youtube" && <Youtube size={18} />}
                                    {platform === "threads" && <MessageCircle size={18} />}
                                    {platform === "whatsapp" && <Video size={18} />}
                                </a>
                            )
                        ))}
                    </div>
                </div>

                {/* Boutique Navigation */}
                <div className="px-6 py-8 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                    {[
                        { id: "about", label: "Overview" },
                        { id: "projects", label: "Showcase" },
                        { id: "proof", label: "Evidence" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setMobileTab(tab.id as any)}
                            className={cn(
                                "whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all",
                                mobileTab === tab.id
                                    ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-pink-100 hover:text-pink-500"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="px-6 pb-20 space-y-10">

                    {/* Minimalist Social Links */}
                    <div className="flex items-center gap-3 mt-6">
                        {Object.entries(config.socialHandles).map(([platform, handle]) => (
                            handle && (
                                <a key={platform} href="#" className="w-9 h-9 rounded-full border border-pink-50 flex items-center justify-center text-slate-400 hover:text-pink-600 transition-all shadow-sm bg-white hover:shadow-pink-100 hover:border-pink-200">
                                    {platform === "instagram" && <Instagram size={16} />}
                                    {platform === "threads" && <MessageCircle size={16} />}
                                    {platform === "youtube" && <Youtube size={16} />}
                                </a>
                            )
                        ))}
                    </div>
                </div>

                {/* Segmented Tab Switcher (The Boutique Style) */}
                {/* <div className="px-5 py-6 flex gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: "about", label: "Editorial" },
                        { id: "projects", label: "Portfolio" },
                        { id: "proof", label: "Authority" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setMobileTab(tab.id as any)}
                            className={cn(
                                "whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                                mobileTab === tab.id
                                    ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-500/20"
                                    : "bg-white border-slate-100 text-slate-400 hover:border-pink-100 hover:text-pink-500"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div> */}

                {/* Dynamic Blocks Section */}
                <div className="px-5 pb-10 space-y-8">
                    {mobileTab === "projects" && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {links.filter(l => l.active && (l.priority === "grid" || l.type === "project_card")).map((link, idx) => (
                                <div key={link.id} className="group relative">
                                    <div className="aspect-[4/5] bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <img src={link.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Work" />
                                        <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={10} />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-tight truncate">{link.title}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Rest of the stack shown in About or active based on tab */}
                    <div className="space-y-8 animate-in fade-in duration-700">
                        {links.filter(l => {
                            if (!l.active) return false;
                            if (mobileTab === "projects") return false; // Handled above
                            if (mobileTab === "proof") return ["brand_scroller", "testimonial", "instagram_card", "stats_grid", "map_section"].includes(l.type);
                            if (mobileTab === "about") return ["text", "image", "video", "skills_cloud", "faq_item", "service_card", "link", "story_highlights", "reels_grid", "countdown", "audio_player"].includes(l.type);
                            return true;
                        }).map((link, idx) => {
                            // Using the same render logic as before but with Vaibhav-inspired spacing...
                            // 0. Story Highlights (Circular Bubbles)
                            if (link.type === "story_highlights") {
                                return (
                                    <div key={link.id} className="flex gap-4 overflow-x-auto no-scrollbar py-4 px-1 -mx-2">
                                        {link.media?.map((m, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2 shrink-0 group">
                                                <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#FFD600] via-[#FF0017] to-[#8E00FF] active:scale-95 transition-transform duration-300">
                                                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-slate-50">
                                                        <img src={m} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Highlight" />
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{link.stats?.[i]?.label || "Live"}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }

                            // 0.1 Reels Grid (Vertical Aspect)
                            if (link.type === "reels_grid") {
                                return (
                                    <div key={link.id} className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <h3 className="text-[10px] font-black uppercase text-pink-500 tracking-[0.3em]">{link.title || "Trending"}</h3>
                                            <div className="flex gap-2">
                                                <RefreshCw size={12} className="text-slate-300 animate-spin-slow" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {link.media?.map((m, i) => (
                                                <div key={i} className="aspect-[9/16] rounded-2xl overflow-hidden relative group shadow-2xl shadow-pink-900/5 cursor-pointer">
                                                    <img src={m} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Reel" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex items-end justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <Play size={10} className="text-white fill-white" />
                                                            <span className="text-[10px] font-black text-white italic">{link.stats?.[i]?.value || "420K"}</span>
                                                        </div>
                                                        <Heart size={10} className="text-white/50" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // 0.2 Text Block
                            if (link.type === "text") {
                                return (
                                    <div key={link.id} className="mt-4 px-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        {link.title && <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">{link.title}</h3>}
                                        <p className="text-sm text-neutral-800 leading-relaxed font-semibold whitespace-pre-wrap">{link.content}</p>
                                    </div>
                                );
                            }

                            // 0.1 Image Block
                            if (link.type === "image") {
                                return (
                                    <div key={link.id} className="mt-4 group relative">
                                        <div className="overflow-hidden rounded-3xl border border-neutral-100 shadow-sm bg-neutral-100">
                                            <img src={link.url} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" alt="Gallery" />
                                        </div>
                                        {link.title && (
                                            <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-between">
                                                <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest truncate mr-2">{link.title}</p>
                                                <div className="w-6 h-6 rounded-lg bg-pink-600 flex items-center justify-center text-white shrink-0">
                                                    <ExternalLink size={10} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // 0.2 Video Block
                            if (link.type === "video") {
                                return (
                                    <div key={link.id} className="mt-4 overflow-hidden rounded-3xl shadow-sm border border-neutral-100 aspect-video bg-neutral-900 flex items-center justify-center group relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                                                <Play size={20} fill="white" />
                                            </div>
                                        </div>
                                        <p className="absolute bottom-4 left-4 text-[9px] font-bold text-white uppercase tracking-widest">{link.title}</p>
                                    </div>
                                );
                            }

                            // 0.3 Project Card
                            if (link.type === "project_card") {
                                return (
                                    <div key={link.id} className="space-y-4">
                                        <div className="relative overflow-hidden rounded-3xl bg-white border border-neutral-100 shadow-sm transition-all hover:shadow-md group/project">
                                            <div className="h-52 overflow-hidden relative">
                                                <img src={link.url} className="w-full h-full object-cover group-hover/project:scale-105 transition-transform duration-700" alt="Project" />
                                                <div className="absolute top-4 left-4">
                                                    <span className="px-3 py-1 rounded-lg bg-black text-white text-[8px] font-bold uppercase tracking-[0.2em] shadow-lg">New Release</span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-bold uppercase text-pink-600 tracking-widest">{link.subtitle}</p>
                                                        <h4 className="text-base font-bold text-neutral-900 mt-1 leading-tight">{link.title}</h4>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-400 group-hover/project:text-pink-600 group-hover/project:bg-pink-100 transition-all border border-pink-50">
                                                        <Code size={18} />
                                                    </div>
                                                </div>
                                                <button className="mt-5 w-full py-3 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                                    Explore Work <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // 0.4 Testimonial
                            if (link.type === "testimonial") {
                                return (
                                    <div key={link.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden">
                                        <div className="flex gap-1 mb-3">
                                            {[...Array(link.rating || 5)].map((_, i) => <Star key={i} size={10} fill="#6366f1" className="text-pink-500" />)}
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-700 leading-relaxed italic">"{link.content}"</p>
                                        <p className="text-[9px] font-bold uppercase text-slate-400 mt-4 tracking-widest">{link.author}</p>
                                    </div>
                                );
                            }

                            // 0.5 Skills Cloud
                            if (link.type === "skills_cloud") {
                                return (
                                    <div key={link.id} className="space-y-3">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{link.title}</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {link.skills?.map((s, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-widest">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // 0.6 FAQ Item
                            if (link.type === "faq_item") {
                                return (
                                    <div key={link.id} className="bg-white border border-neutral-100 rounded-2xl p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <h4 className="text-[11px] font-bold text-neutral-800">{link.title}</h4>
                                            <ChevronDown size={14} className="text-neutral-400" />
                                        </div>
                                        <p className="text-[10px] text-neutral-500 mt-2 font-medium leading-relaxed">{link.content}</p>
                                    </div>
                                );
                            }

                            // 1. Instagram Profile Card
                            if (link.type === "instagram_card") {
                                return (
                                    <div key={link.id} className="p-5 bg-white dark:bg-neutral-800 rounded-3xl border border-slate-100 dark:border-neutral-700 shadow-sm relative overflow-hidden group">
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 p-0.5">
                                                <div className="w-full h-full rounded-[10px] bg-white p-0.5">
                                                    <img src={config.profileImage} className="w-full h-full rounded-[8px] object-cover" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white leading-none">@{config.socialHandles.instagram}</h3>
                                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Instagram</p>
                                            </div>
                                            <div className="ml-auto text-slate-300">
                                                <Instagram size={18} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // 2. Product/Media Scroller
                            if (link.type === "scroller") {
                                return (
                                    <div key={link.id} className="space-y-3 relative overflow-hidden group/scroller">
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{link.title}</h4>
                                            <div className="flex gap-2">
                                                <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-300">
                                                    <ChevronLeft size={10} />
                                                </div>
                                                <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-slate-900">
                                                    <ChevronRight size={10} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-1">
                                            {link.media?.map((m, i) => (
                                                <div key={i} className="min-w-[150px] aspect-[10/12] bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-100 group-hover/scroller:shadow-md transition-shadow">
                                                    <img src={m} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            <div className="min-w-[40px] flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-dashed border-slate-200">
                                                    <Plus size={14} />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Subtle overlay gradient to hint at more items */}
                                        <div className="absolute top-8 right-0 bottom-1 w-12 bg-gradient-to-l from-slate-50/50 to-transparent pointer-events-none" />
                                    </div>
                                );
                            }

                            // 3. Stats Grid
                            if (link.type === "stats_grid") {
                                return (
                                    <div key={link.id} className="p-1 px-1">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">{link.title}</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {link.stats?.map((stat, idx) => (
                                                <div key={idx} className="bg-white border border-neutral-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
                                                    <div className="w-7 h-7 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 mb-2">
                                                        {stat.icon === "Target" && <Target size={12} />}
                                                        {stat.icon === "Heart" && <Heart size={12} />}
                                                        {stat.icon === "Activity" && <Activity size={12} />}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-neutral-900">{stat.value}</p>
                                                    <p className="text-[8px] font-semibold text-neutral-400 uppercase tracking-tight">{stat.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // 4. Brand Partner Section
                            if (link.type === "brand_scroller") {
                                return (
                                    <div key={link.id} className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{link.title}</h4>
                                            <span className="text-[9px] font-bold text-slate-300 uppercase">Trusted by</span>
                                        </div>
                                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-wrap items-center justify-center gap-6">
                                            {link.media?.map((m, i) => (
                                                <div key={i} className="h-6 flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                                    <img src={m} className="max-w-[70px] max-h-full object-contain" alt="brand" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // 5. Service Card
                            if (link.type === "service_card") {
                                return (
                                    <div key={link.id} className="group/service relative overflow-hidden rounded-3xl bg-white border border-neutral-100 p-5 shadow-sm">
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className="px-2.5 py-1 bg-pink-50 rounded-lg text-[9px] font-bold text-pink-600 uppercase tracking-widest">{link.price}</div>
                                        </div>
                                        <h4 className="text-[13px] font-bold text-slate-900 pr-16">{link.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{link.subtitle}</p>
                                        <button className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-pink-600 uppercase tracking-widest group-hover/service:gap-2 transition-all">
                                            Inquire <ArrowRight size={10} />
                                        </button>
                                    </div>
                                );
                            }

                            // 6. Generic Link
                            return (
                                <motion.button
                                    key={link.id}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="w-full p-3.5 rounded-2xl flex items-center justify-center relative shadow-sm group active:scale-[0.98] transition-all bg-white border border-neutral-100 hover:border-pink-100 hover:shadow-md"
                                >
                                    <span className="text-[13px] font-bold text-neutral-800">{link.title}</span>
                                    <div className="absolute right-4 text-neutral-300 group-hover:text-pink-600 transition-colors">
                                        <ChevronRight size={14} />
                                    </div>
                                </motion.button>
                        );
                    })}
                    </div>

                    {/* ─ Countdown Area ─ */}
                    {links.filter(l => l.active && l.type === "countdown" && (mobileTab === "about" || mobileTab === "projects")).map(link => (
                        <div key={link.id} className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden shadow-2xl mx-1">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(219,39,172,0.4),transparent)]" />
                            <div className="relative z-10 text-center space-y-6">
                                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-pink-500">{link.title || "ESTIMATED ARRIVAL"}</p>
                                <div className="flex justify-center gap-4">
                                    {["12", "04", "59"].map((num, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <span className="text-3xl font-black italic tracking-tighter">{num}</span>
                                            <span className="text-[7px] font-bold uppercase opacity-40 mt-1">{["Hrs", "Min", "Sec"][i]}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full py-3.5 rounded-2xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    Notify Me
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* ─ Audio Player ─ */}
                    {links.filter(l => l.active && l.type === "audio_player" && mobileTab === "about").map(link => (
                        <div key={link.id} className="p-4 rounded-[28px] bg-white border border-slate-100 flex items-center gap-4 shadow-sm group hover:shadow-md transition-all mx-1">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 relative overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Music size={16} className="text-pink-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-slate-900 truncate">{link.title || "The Vision - Mix"}</p>
                                <p className="text-[8px] font-black text-pink-500/60 uppercase tracking-widest truncate">{link.subtitle || "Premium Audios"}</p>
                            </div>
                            <button className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all">
                                <Play size={14} fill="currentColor" />
                            </button>
                        </div>
                    ))}

                    {/* ─ Map / Location ─ */}
                    {links.filter(l => l.active && l.type === "map_section" && mobileTab === "proof").map(link => (
                        <div key={link.id} className="rounded-[32px] overflow-hidden border border-slate-100 bg-white shadow-sm mx-1">
                            <div className="aspect-video bg-slate-50 flex items-center justify-center relative">
                                <MapPin size={24} className="text-pink-500 animate-bounce" />
                                <div className="absolute inset-0 bg-pink-500/5" />
                            </div>
                            <div className="p-6">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{link.title || "Studio Location"}</h4>
                                <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest">{link.subtitle || "Mayfair, London"}</p>
                                <button className="w-full mt-4 py-3 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center justify-center gap-2">
                                    <Globe size={12} /> Get Directions
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto py-8 flex flex-col items-center opacity-40">
                    <div className="flex items-center gap-1.5 mb-2">
                        <ShieldCheck size={10} className="text-pink-500" />
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400">Professional Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fffbfb] dark:bg-[#020617] font-sans">
            <div className="max-w-[1500px] mx-auto p-4 lg:p-10 space-y-10">

                {/* ── HEADER CONTEXT ── */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl dark:bg-neutral-900 border border-pink-100/50 dark:border-neutral-800 p-6 rounded-[32px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white flex items-center justify-center shadow-xl shadow-pink-500/20">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Portfolio Bio-Link</h1>
                            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Simple Professional Creator Hub</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                                <button className="px-5 py-2.5 rounded-xl bg-pink-50 dark:bg-slate-800 text-pink-600 hover:text-pink-700 font-semibold text-[12px] transition-all border border-pink-100 dark:border-slate-700 flex items-center gap-2 active:scale-95">
                                    <Share2 size={16} /> Share Link
                                </button>
                        <button className="px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-[12px] shadow-lg shadow-pink-600/10 hover:bg-pink-700 active:scale-95 transition-all flex items-center gap-2">
                            <Save size={16} strokeWidth={2.5} /> Save Portfolio
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* ── LEFT: EDITOR COLUMN (8 units) ── */}
                    <main className="lg:col-span-8 space-y-8">

                        {/* Tab Switcher (Professional) */}
                        <div className="flex p-1.5 bg-white/80 backdrop-blur-md dark:bg-neutral-900 border border-pink-100/50 dark:border-neutral-800 rounded-2xl w-fit shadow-sm">
                            {[
                                { id: "templates", label: "Presets", icon: Sparkles },
                                { id: "links", label: "Blocks", icon: Layers },
                                { id: "design", label: "Style", icon: Palette },
                                { id: "settings", label: "Analytics", icon: Activity }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-[12px] text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-300",
                                        activeTab === tab.id ? "bg-pink-600 text-white shadow-lg shadow-pink-500/10" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <tab.icon size={14} strokeWidth={2.5} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === "templates" && (
                                <motion.div
                                    key="templates"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="mb-8">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Premium Presets</h2>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Select a foundation for your digital brand</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(TEMPLATES).map(([id, template]) => (
                                            <button
                                                key={id}
                                                onClick={() => handleApplyTemplate(id as any)}
                                                className="group relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-1.5 rounded-[32px] overflow-hidden text-left hover:border-pink-300 transition-all shadow-sm hover:shadow-xl"
                                            >
                                                <div className="aspect-video rounded-[24px] overflow-hidden bg-slate-100 relative">
                                                    <img src={template.previewImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={template.name} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles size={14} className="text-pink-400 fill-pink-400" />
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{template.tag}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-5 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{template.name}</h3>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{template.description}</p>
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-neutral-800 flex items-center justify-center text-slate-300 group-hover:bg-pink-600 group-hover:text-white transition-all">
                                                        <ChevronRight size={18} />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === "links" && (
                                <motion.div
                                    key="links"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2.5">
                                            <div className="w-1 h-5 bg-pink-600 rounded-full" /> Portfolio Sequence
                                        </h2>
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowTypeSelector(!showTypeSelector)}
                                                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
                                            >
                                                <Plus size={16} strokeWidth={2.5} /> Add Block
                                            </button>

                                            <AnimatePresence>
                                                {showTypeSelector && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 10, scale: 1 }}
                                                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                                        className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-4 z-50 overflow-hidden"
                                                    >
                                                        <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar">
                                                            <div>
                                                                <h3 className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-3 px-2">Core Content</h3>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {LINK_TYPES.filter(t => ["text", "link", "header"].includes(t.id)).map((type) => (
                                                                        <button
                                                                            key={type.id}
                                                                            onClick={() => handleAddLink(type.id as any)}
                                                                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 text-left transition-all group"
                                                                        >
                                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 group-hover:bg-pink-600 group-hover:text-white transition-all">
                                                                                <type.icon size={16} />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[11px] font-bold uppercase text-slate-800 dark:text-white leading-none">{type.label}</p>
                                                                                <p className="text-[9px] text-slate-400 font-medium mt-1 leading-none">{type.desc}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Visual Media</h3>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {LINK_TYPES.filter(t => ["image", "video", "scroller", "project_card", "skills_cloud"].includes(t.id)).map((type) => (
                                                                        <button
                                                                            key={type.id}
                                                                            onClick={() => handleAddLink(type.id as any)}
                                                                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 text-left transition-all group"
                                                                        >
                                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                                                <type.icon size={16} />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[11px] font-bold uppercase text-slate-800 dark:text-white leading-none">{type.label}</p>
                                                                                <p className="text-[9px] text-slate-400 font-medium mt-1 leading-none">{type.desc}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 px-2">Professional proof</h3>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {LINK_TYPES.filter(t => ["testimonial", "faq_item", "instagram_card", "stats_grid", "brand_scroller", "service_card"].includes(t.id)).map((type) => (
                                                                        <button
                                                                            key={type.id}
                                                                            onClick={() => handleAddLink(type.id as any)}
                                                                            className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800 text-left transition-all group"
                                                                        >
                                                                            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                                                <type.icon size={16} />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[11px] font-bold uppercase text-slate-800 dark:text-white leading-none">{type.label}</p>
                                                                                <p className="text-[9px] text-slate-400 font-medium mt-1 leading-none">{type.desc}</p>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Link Cards (Reorderable) */}
                                    <Reorder.Group axis="y" values={links} onReorder={setLinks} className="space-y-4">
                                        <AnimatePresence initial={false}>
                                            {links.map((link, idx) => (
                                                <Reorder.Item
                                                    key={link.id}
                                                    value={link}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="relative"
                                                >
                                                    <div className={cn(
                                                        "group relative bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all z-10",
                                                        !link.active && "opacity-60 grayscale-[0.5]"
                                                    )}>
                                                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-neutral-800/50 border-b border-slate-100 dark:border-neutral-800">
                                                            <div className="flex items-center gap-4">
                                                                <div className="cursor-grab active:cursor-grabbing p-1.5 text-slate-300 hover:text-pink-400 hover:bg-pink-50 rounded-xl transition-all">
                                                                    <Grip size={18} />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-pink-600 shadow-sm">
                                                                        {(() => {
                                                                            const Icon = LINK_TYPES.find(t => t.id === link.type)?.icon;
                                                                            return Icon ? <Icon size={20} /> : <LinkIcon size={20} />;
                                                                        })()}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-[12px] font-black text-slate-800 dark:text-white uppercase tracking-widest">{link.title || "Untitled Block"}</h4>
                                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">{link.type.replace("_", " ")}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    onClick={() => handleUpdateLink(link.id, { active: !link.active })}
                                                                    className={cn(
                                                                        "w-11 h-6 rounded-full relative transition-all duration-300",
                                                                        link.active ? "bg-pink-500 shadow-lg shadow-pink-500/20" : "bg-slate-200 dark:bg-slate-700"
                                                                    )}
                                                                >
                                                                    <div className={cn(
                                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                                                        link.active ? "left-6" : "left-1"
                                                                    )} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveLink(link.id)}
                                                                    className="p-2.5 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/30 text-slate-300 hover:text-pink-600 transition-all"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="p-6 space-y-5">
                                                            {/* Common Settings Area */}
                                                            <div className="space-y-4">
                                                                <div className="relative group">
                                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-500 transition-colors">
                                                                        <Type size={14} />
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        value={link.title}
                                                                        onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                                                                        className="w-full bg-slate-50 dark:bg-neutral-950 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-slate-300"
                                                                        placeholder="Display Headline"
                                                                    />
                                                                </div>

                                                                {link.type === "text" && (
                                                                    <textarea
                                                                        value={link.content || ""}
                                                                        onChange={(e) => handleUpdateLink(link.id, { content: e.target.value })}
                                                                        className="w-full bg-slate-50 dark:bg-neutral-950 border-none rounded-2xl p-4 text-sm font-medium text-slate-500 focus:ring-2 focus:ring-pink-100 min-h-[120px] transition-all"
                                                                        placeholder="Write your message..."
                                                                    />
                                                                )}

                                                                {link.url !== undefined && ["link", "image", "video", "project_card"].includes(link.type) && (
                                                                    <div className="relative group">
                                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-500 transition-colors">
                                                                            <LinkIcon size={14} />
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            value={link.url}
                                                                            onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                                                                            className="w-full bg-slate-50 dark:bg-neutral-950 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-400 focus:ring-2 focus:ring-pink-100 transition-all"
                                                                            placeholder="URL / Asset Link"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Reorder.Item>
                                            ))}
                                        </AnimatePresence>
                                    </Reorder.Group>

                                    {links.length === 0 && (
                                        <div className="py-24 text-center border-4 border-dashed border-slate-100 dark:border-neutral-800 rounded-[48px] animate-pulse">
                                            <div className="w-20 h-20 rounded-full bg-pink-50 dark:bg-pink-950/20 flex items-center justify-center mx-auto mb-6">
                                                <Target className="w-10 h-10 text-pink-200" />
                                            </div>
                                            <h3 className="text-xl font-black text-pink-200 dark:text-pink-800 uppercase tracking-[0.2em]">Portfolio Empty</h3>
                                            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">Start manifesting your digital presence</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "design" && (
                                <motion.div
                                    key="design"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                >
                                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-8 rounded-[40px] shadow-sm space-y-8">
                                        <div>
                                            <h3 className="text-sm font-black text-pink-900 dark:text-pink-100 uppercase tracking-[0.2em] mb-6">Visual Identity</h3>
                                            <div className="flex items-center gap-6">
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-pink-50 dark:border-pink-900/20 shadow-xl">
                                                        <img src={config.profileImage} className="w-full h-full object-cover" alt="Avatar" />
                                                    </div>
                                                    <button className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-pink-600 text-white shadow-lg border-4 border-white dark:border-neutral-900 hover:scale-110 transition-transform">
                                                        <RefreshCw size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input
                                                            type="text" value={config.name}
                                                            onChange={e => setConfig({ ...config, name: e.target.value })}
                                                            className="w-full bg-pink-50/50 dark:bg-neutral-950 border border-pink-100/30 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-pink-500/20 transition-all"
                                                            placeholder="Profile Name"
                                                        />
                                                        <input
                                                            type="text" value={config.followerCount}
                                                            onChange={e => setConfig({ ...config, followerCount: e.target.value })}
                                                            className="w-full bg-pink-50/50 dark:bg-neutral-950 border border-pink-100/30 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-pink-500/20 transition-all"
                                                            placeholder="Follower Count (e.g. 2.2M)"
                                                        />
                                                    </div>
                                                    <textarea
                                                        value={config.bio}
                                                        onChange={e => setConfig({ ...config, bio: e.target.value })}
                                                        className="w-full bg-pink-50/50 dark:bg-neutral-950 border border-pink-100/30 rounded-2xl p-4 text-[12px] font-medium min-h-[80px] focus:ring-2 focus:ring-pink-500/20 transition-all"
                                                        placeholder="Tell your story..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-black text-pink-900 dark:text-pink-100 uppercase tracking-[0.2em] mb-6">Aesthetic Presets</h3>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                {["classic", "dark", "glass", "gradient", "minimal", "premium"].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setConfig({ ...config, theme: t as any })}
                                                        className={cn(
                                                            "p-4 rounded-3xl border text-[11px] font-black uppercase tracking-widest transition-all",
                                                            config.theme === t
                                                                ? "bg-pink-50 border-pink-200 text-pink-600 shadow-inner"
                                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {t} Theme
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-8 rounded-[40px] shadow-sm">
                                        <h3 className="text-sm font-black text-pink-900 dark:text-pink-100 uppercase tracking-[0.2em] mb-6">Social Ecosystem</h3>
                                        <div className="space-y-4">
                                            {/* Social items simplified */}
                                            {[
                                                { key: "instagram", icon: Instagram, label: "@username" },
                                                { key: "threads", icon: MessageCircle, label: "Threads Link" },
                                                { key: "youtube", icon: Youtube, label: "Channel Link" },
                                                { key: "whatsapp", icon: Video, label: "Phone Number" }
                                            ].map(field => (
                                                <div key={field.key} className="flex items-center gap-4 p-4 bg-pink-50/30 dark:bg-neutral-950 rounded-2xl border border-pink-100/20 dark:border-slate-800">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-pink-500 shadow-sm border border-pink-100/50">
                                                        <field.icon size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={(config.socialHandles as any)[field.key]}
                                                        onChange={e => setConfig({
                                                            ...config,
                                                            socialHandles: { ...config.socialHandles, [field.key]: e.target.value }
                                                        })}
                                                        className="flex-1 bg-transparent border-none text-sm font-bold p-0 focus:ring-0"
                                                        placeholder={field.label}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "settings" && (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                    className="space-y-8"
                                >
                                    <div className="bg-slate-900 text-white rounded-[40px] p-10 overflow-hidden relative shadow-2xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Activity className="text-pink-500" />
                                                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-50">Influence Snapshot</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Creator Index</p>
                                                    <p className="text-5xl font-black text-pink-500 tracking-tighter">98.4</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Weekly Reach</p>
                                                    <p className="text-4xl font-black flex items-center gap-2">
                                                        4.2M <span className="text-emerald-400 text-xs font-black uppercase tracking-tighter">↑ 12%</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Conversion Velocity</p>
                                                    <p className="text-4xl font-black text-white italic">High</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-8 rounded-[40px] shadow-sm">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Traffic Diversion</h3>
                                            <div className="space-y-6">
                                                {[
                                                    { label: "Portfolio Grid", value: 68, color: "bg-pink-500" },
                                                    { label: "Direct Links", value: 24, color: "bg-slate-900" },
                                                    { label: "Social Referrals", value: 8, color: "bg-slate-200" }
                                                ].map(stat => (
                                                    <div key={stat.label} className="space-y-2">
                                                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                                            <span>{stat.label}</span>
                                                            <span className="text-pink-500">{stat.value}%</span>
                                                        </div>
                                                        <div className="h-3 w-full bg-slate-50 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }} animate={{ width: `${stat.value}%` }}
                                                                className={cn("h-full rounded-full transition-all", stat.color)}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-pink-600 rounded-[40px] p-8 text-white relative flex items-center justify-between shadow-xl overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 pointer-events-none">
                                                <Grid size={200} className="rotate-12 translate-x-1/2 translate-y-1/2" />
                                            </div>
                                            <div className="relative z-10 space-y-2">
                                                <h4 className="text-xl font-black italic">Go Global.</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">SEO Boost & Custom Domain Enabled</p>
                                            </div>
                                            <button className="w-14 h-14 rounded-2xl bg-white text-pink-600 flex items-center justify-center shadow-lg active:scale-95 transition-all">
                                                <Globe size={24} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>

                    {/* ── RIGHT: PREVIEW COLUMN (4 units or 12 depending on mode) ── */}
                    <aside className={cn(
                        "transition-all duration-700",
                        previewMode === "web" ? "lg:col-span-12" : "lg:col-span-4"
                    )}>
                        <div className="sticky top-10 flex flex-col items-center gap-8">
                            <div className="bg-white dark:bg-neutral-900 p-1.5 rounded-2xl border border-slate-200 dark:border-neutral-800 flex shadow-sm">
                                {[
                                    { id: "mobile", icon: Smartphone, label: "Phone" },
                                    { id: "web", icon: Monitor, label: "Web Portal" }
                                ].map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setPreviewMode(mode.id as any)}
                                        className={cn(
                                            "flex items-center gap-2 px-6 py-2.5 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all",
                                            previewMode === mode.id
                                                ? "bg-slate-900 text-white shadow-xl"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <mode.icon size={14} /> {mode.label}
                                    </button>
                                ))}
                            </div>

                            {previewMode === "mobile" ? (
                                <MobilePreview />
                            ) : (
                                <div className="w-full h-[800px]">
                                    <FullWebPreview />
                                </div>
                            )}

                            <div className="flex flex-col items-center gap-4 text-center">
                                <p className="text-[10px] font-black text-pink-500 uppercase tracking-[0.3em]">Live Simulation</p>
                                <p className="text-xs text-slate-400 font-medium max-w-[200px]">Interactive preview updates instantly as you edit blocks.</p>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}
