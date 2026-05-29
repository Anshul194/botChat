import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    ArrowUpRight, Share2, Globe, Mail, Instagram, Twitter, Linkedin, Youtube, Play, Heart, ShoppingBag
} from "lucide-react";
import { getUiTypeFromBlock, BrandIcon, getBrandColor } from "../builder-utils";

export function InstaMinimalLayout({ profile, tabs, openEditor }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => {
        if (String(b.id).startsWith('__preview')) return true;
        const isEnabled = b.is_enabled !== false && b.is_enabled !== 0 && b.is_enabled !== '0' && b.is_Enabled !== 0 && b.is_Enabled !== '0';
        const isActive = b.is_active !== 0 && b.is_active !== '0';
        return isEnabled && isActive;
    });

    const heroBlock = allBlocks.find(b => {
        const type = getUiTypeFromBlock(b);
        return ['header', 'avatar', 'profile', 'hero', 'header_profile_section'].includes(type);
    });
    
    const contentBlocks = allBlocks.filter(b => b.id !== heroBlock?.id);

    return (
        <div className="w-full min-h-full bg-white text-zinc-900 font-sans px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center selection:bg-zinc-100 relative overflow-hidden">
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-zinc-50/50 to-transparent pointer-events-none" />

            {/* Studio Header */}
            {heroBlock && (
                <div 
                    onClick={() => openEditor?.(heroBlock)}
                    className="w-full max-w-[480px] mb-24 sm:mb-32 flex flex-col items-center text-center relative z-10 cursor-pointer"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "circOut" }}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-none grayscale hover:grayscale-0 transition-all duration-1000 mb-12 border border-zinc-100 p-1.5 bg-white shadow-sm ring-1 ring-zinc-900/5"
                    >
                        <img
                            src={heroBlock?.settings?.avatar || heroBlock?.settings?.image || profile?.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    <h1 className="text-[22px] sm:text-[26px] font-black tracking-[0.4em] sm:tracking-[0.6em] uppercase mb-6 leading-none pl-[0.4em] sm:pl-[0.6em]">
                        {heroBlock?.settings?.title || heroBlock?.settings?.name || profile?.title || "Studio Minimal"}
                    </h1>

                    <div className="w-12 h-[3px] bg-zinc-900 mb-10" />

                    <p className="text-[11px] sm:text-[12px] text-zinc-400 font-bold tracking-[0.2em] sm:tracking-[0.4em] uppercase max-w-[320px] leading-relaxed">
                        {heroBlock?.settings?.bio || heroBlock?.settings?.description || profile?.bio || "Aesthetic Clarity / Digital Design / Tokyo"}
                    </p>
                </div>
            )}

            <div className="w-full max-w-[480px] space-y-24 sm:space-y-32 relative z-10">
                {contentBlocks.map((block: any, idx: number) => {
                    const section = renderMinimalSection(block, profile);
                    if (!section) return null;

                    return (
                        <motion.div
                            key={block.id || idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            onClick={() => openEditor?.(block)}
                            className="cursor-pointer"
                        >
                            {section}
                        </motion.div>
                    );
                })}
            </div>

            {/* Simple Footer */}
            <div className="mt-40 pb-20 opacity-20 hover:opacity-100 transition-opacity">
                <p className="text-[10px] tracking-[0.6em] uppercase font-black">© 2026 Studio Minimal</p>
            </div>
        </div>
    );
}

const renderMinimalSection = (block: any, profile: any) => {
    const uiType = getUiTypeFromBlock(block);
    const { settings, items } = block;
    const s = settings || {};
    
    // Prefer non-empty items array (from settings or top-level)
    const blockItems = (Array.isArray(s.items) && s.items.length > 0) 
        ? s.items 
        : (Array.isArray(items) && items.length > 0 && !items[0]?.builder_type) 
            ? items 
            : (Array.isArray(s.logos) && s.logos.length > 0) ? s.logos
            : (Array.isArray(s.plans) && s.plans.length > 0) ? s.plans
            : (Array.isArray(s.steps) && s.steps.length > 0) ? s.steps
            : (Array.isArray(s.points) && s.points.length > 0) ? s.points
            : [];

    // HIDE EMPTY BLOCKS: If no data items and no descriptive settings, hide it
    // Exception for header types which are handled by the main layout but might still be passed here
    if (blockItems.length === 0 && !['header', 'avatar', 'profile', 'hero', 'header_profile_section'].includes(uiType)) {
        if (!s.title && !s.text && !s.description && !s.image && !s.url && !s.name) return null;
    }

    switch (uiType) {
        case 'link':
            const isFeatured = s.is_featured || s.is_Featured || false;
            return (
                <a
                    href={s.url || s.location_url || "#"}
                    className={cn(
                        "group block py-6 px-6 border border-zinc-100 flex items-center justify-between transition-all duration-500 rounded-2xl",
                        isFeatured ? "bg-zinc-900 text-white border-none shadow-xl scale-[1.02]" : "hover:bg-zinc-50 hover:border-zinc-300"
                    )}
                >
                    <div className="flex items-center gap-4">
                        {s.image && <img src={s.image} className="w-12 h-12 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />}
                        <div className="flex flex-col gap-1">
                            <span className={cn(
                                "text-[13px] font-black uppercase tracking-[0.2em]",
                                isFeatured ? "text-white" : "text-zinc-900"
                            )}>
                                {s.title || s.name || "EXPLORE"}
                            </span>
                            {(s.description || s.text) && (
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest transition-all duration-500",
                                    isFeatured ? "text-zinc-400" : "text-zinc-400"
                                )}>
                                    {s.description || s.text}
                                </span>
                            )}
                        </div>
                    </div>
                    <ArrowUpRight size={16} className={cn(
                        "transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1",
                        isFeatured ? "text-white" : "text-zinc-300 group-hover:text-zinc-900"
                    )} />
                </a>
            );

        case 'link_grid_section':
        case 'links_grid':
            return (
                <div className="grid grid-cols-2 gap-[1px] bg-zinc-100 border border-zinc-100">
                    {blockItems.map((item: any, i: number) => {
                        const img = item.image || item.thumbnail || item.icon_image;
                        const isImg = img && (img.startsWith('http') || img.startsWith('/'));

                        return (
                            <a key={i} href={item.url || "#"} className="flex flex-col gap-8 p-8 bg-white hover:bg-zinc-50 transition-colors group">
                                {isImg ? (
                                    <div className="w-full aspect-video overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                        <img src={img} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-full aspect-video flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100 group-hover:bg-zinc-900 transition-all duration-500">
                                        <span className="text-[14px] font-light text-zinc-200 group-hover:text-white mb-2">0{i + 1}</span>
                                        <ArrowUpRight size={14} className="text-zinc-200 group-hover:text-white transition-colors" />
                                    </div>
                                )}
                                <span className="text-[11px] font-black uppercase tracking-[0.3em]">{item.n || item.name || item.title}</span>
                            </a>
                        );
                    })}
                </div>
            );

        case 'link_carousel_section':
        case 'links_carousel':
            return (
                <div className="relative -mx-8">
                    <div className="flex gap-[1px] overflow-x-auto px-8 pb-4 no-scrollbar bg-zinc-100">
                        {blockItems.map((item: any, i: number) => {
                            const img = item.image || item.thumbnail || item.cover_image;
                            const isImg = img && (img.startsWith('http') || img.startsWith('/'));

                            return (
                                <a key={i} href={item.url || "#"} className="min-w-[200px] p-10 bg-white hover:bg-zinc-50 transition-colors group flex flex-col gap-12 overflow-hidden">
                                    {isImg ? (
                                        <div className="w-full h-32 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <span className="text-[40px] font-light text-zinc-100 group-hover:text-zinc-900 transition-colors">0{i + 1}</span>
                                    )}
                                    <div>
                                        <h4 className="text-[12px] font-black uppercase tracking-widest mb-1">{item.n || item.name || item.title}</h4>
                                        <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-[0.2em]">{item.d || item.description || "VIEW"}</p>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className={cn("grid gap-4", blockItems.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {(blockItems.length > 0 ? blockItems : [s]).map((item: any, i: number) => {
                        const img = item.image || item.url;
                        if (!img || (!img.startsWith('http') && !img.startsWith('/'))) return null;
                        
                        return (
                            <div key={i} className="bg-zinc-50 p-2 group relative overflow-hidden">
                                <img src={img} className="w-full aspect-[3/4] object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s] group-hover:scale-105" />
                            </div>
                        );
                    })}
                </div>
            );

        case 'stats':
        case 'stats_section':
        case 'stats_minimal_section':
        case 'floating_stats_section':
        case 'impact_section':
            return (
                <div className="grid grid-cols-2 gap-y-12 gap-x-12 sm:gap-x-16 py-16 px-10 bg-zinc-50 border border-zinc-100 rounded-[2px]">
                    {blockItems.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-4">
                            <span className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.4em]">{item.label || "Metric"}</span>
                            <span className="text-[36px] sm:text-[42px] font-light tracking-tighter leading-none text-zinc-900">{item.value || "00"}</span>
                        </div>
                    ))}
                </div>
            );

        case 'countdown':
        case 'countdown_section':
        case 'urgency_offer_section':
            return (
                <div className="py-16 sm:py-24 border-y border-zinc-900 flex flex-col items-center text-center">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] mb-8 sm:mb-12 text-zinc-300">Countdown</span>
                    <div className="flex gap-8 sm:gap-12">
                        {[
                            { v: '01', l: 'DD' }, { v: '22', l: 'HH' }, { v: '18', l: 'MM' }
                        ].map((t, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-3xl sm:text-5xl font-light tracking-tighter mb-2 sm:mb-4">{t.v}</span>
                                <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-zinc-200">{t.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'services':
        case 'services_section':
            return (
                <div className="space-y-10 sm:space-y-16">
                    <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] sm:tracking-[0.5em] text-zinc-200">Capabilities</h3>
                    <div className="space-y-0">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="group py-6 sm:py-10 border-b border-zinc-100 flex items-center justify-between hover:bg-zinc-50 transition-colors px-4 -mx-4">
                                <div className="flex flex-col gap-1 min-w-0 pr-4">
                                    <h4 className="text-[13px] sm:text-[14px] font-black uppercase tracking-widest truncate">{item.t}</h4>
                                    <p className="text-[9px] sm:text-[10px] text-zinc-400 font-bold uppercase tracking-widest truncate">{item.d}</p>
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-black text-zinc-200 group-hover:text-zinc-900 transition-colors shrink-0">{item.p}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'trust_badges':
        case 'trust_badges_section':
            return (
                <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 py-8 sm:py-12 opacity-10 grayscale">
                    {['VERIFIED', 'ENCRYPTED', 'AUTHENTIC'].map(l => (
                        <span key={l} className="text-[9px] sm:text-[10px] font-black tracking-[0.4em]">{l}</span>
                    ))}
                </div>
            );

        case 'testimonials':
        case 'testimonials_section':
        case 'testimonial_highlight_section':
            return (
                <div className="space-y-12 sm:space-y-20 py-20 px-10 bg-zinc-900 text-white rounded-[2px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Share2 size={80} strokeWidth={1} />
                    </div>
                    <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500 relative z-10">Testimonials</h3>
                    <div className="space-y-16 sm:space-y-24 relative z-10">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="flex flex-col gap-8 max-w-sm">
                                <p className="text-[20px] sm:text-[24px] font-light tracking-tight leading-tight text-white">"{item.t || item.text || item.description || "The definitive bio-link for modern creators."}"</p>
                                <div className="flex flex-col gap-2 border-l-2 border-zinc-700 pl-6">
                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.n || item.name || item.title || "M. Chen"}</span>
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.d || item.subtitle || "Client"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'faq':
        case 'faq_section':
        case 'faq_cards_section':
            return (
                <div className="space-y-12 sm:space-y-20 py-20 px-10 border border-zinc-100 bg-white shadow-sm rounded-[2px]">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-[2px] bg-zinc-900" />
                        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] text-zinc-300">Information</h3>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="py-10 sm:py-12 flex flex-col gap-6 group cursor-pointer hover:pl-2 transition-all duration-500">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[14px] sm:text-[16px] font-black uppercase tracking-tight text-zinc-900">{item.q || item.title || item.question || "Query 01"}</h4>
                                    <ArrowUpRight size={16} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
                                </div>
                                <p className="text-[12px] sm:text-[13px] text-zinc-400 font-medium leading-relaxed max-w-sm">{item.a || item.text || item.answer || "Detail providing further clarity on the studio protocol."}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'newsletter':
        case 'newsletter_section':
        case 'newsletter_collector':
        case 'email_collector':
            return (
                <div className="py-24 sm:py-32 px-10 bg-zinc-50 border border-zinc-100 flex flex-col items-center text-center rounded-[2px] group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-zinc-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] mb-12 text-zinc-300 relative z-10">{s.title || "Correspondence"}</span>
                    <h3 className="text-[22px] sm:text-[26px] font-light tracking-tighter mb-16 max-w-xs relative z-10 text-zinc-900 leading-tight">{s.description || "Join the inner circle for exclusive updates."}</h3>
                    <div className="w-full max-w-[320px] flex flex-col gap-4 relative z-10">
                        <div className="h-14 border border-zinc-200 bg-white px-6 flex items-center group-focus-within:border-zinc-900 transition-all">
                            <input type="email" placeholder={s.placeholder || "private@studio.com"} className="flex-1 bg-transparent text-[13px] outline-none text-zinc-900 placeholder:text-zinc-200" />
                        </div>
                        <button className="h-14 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-900/5">
                            {s.button_text || "Submit Inquiry"}
                        </button>
                    </div>
                </div>
            );

        case 'brands':
        case 'brands_section':
            return (
                <div className="py-12 border-y border-zinc-100">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 opacity-10 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
                        {(blockItems.length > 0 ? blockItems : [
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732229.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732190.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732230.png' }
                        ]).map((logo: any, i: number) => (
                            <div key={i} className="flex items-center justify-center">
                                <img src={logo.image || logo.url} className="h-4 sm:h-5 w-auto object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'portfolio':
        case 'portfolio_section':
        case 'portfolio_minimal_section':
            return (
                <div className="space-y-12">
                    <div className="border-b border-zinc-900 pb-8 flex items-end justify-between">
                        <h2 className="text-[20px] font-black uppercase tracking-tighter leading-none">{s.title || "Selected Work"}</h2>
                        <span className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em]">Index 0{blockItems.length}</span>
                    </div>
                    <div className="space-y-24">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-video bg-zinc-50 border border-zinc-100 p-1 mb-8 overflow-hidden">
                                    <img src={item.image || item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-105" />
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="max-w-[240px]">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-2 block">Case Study 0{i + 1}</span>
                                        <h3 className="text-[15px] font-black uppercase tracking-widest">{item.title || "Project Title"}</h3>
                                        {item.description && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">{item.description}</p>}
                                    </div>
                                    <ArrowUpRight size={18} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'services':
        case 'services_section':
        case 'services_timeline_section':
            return (
                <div className="space-y-12">
                    <div className="border-b border-zinc-900 pb-8">
                        <h2 className="text-[20px] font-black uppercase tracking-tighter leading-none">{s.title || "Capabilities"}</h2>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="py-10 group hover:pl-4 transition-all duration-500 flex items-start justify-between">
                                <div className="max-w-[280px]">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-3 block">Service 0{i + 1}</span>
                                    <h3 className="text-[14px] font-black uppercase tracking-widest mb-3">{item.title || item.t || "Expertise"}</h3>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{item.description || item.d || "Strategic creative direction for modern brands."}</p>
                                </div>
                                <div className="text-[11px] font-black text-zinc-300 group-hover:text-zinc-900 transition-colors">
                                    {item.price || item.p || "Inquire"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'video':
        case 'youtube':
        case 'tiktok_video':
            return (
                <div className="aspect-video bg-zinc-50 border border-zinc-100 p-1 relative group overflow-hidden">
                    <img src={s.thumbnail || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800"} className="w-full h-full object-cover grayscale opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border border-zinc-900/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                            <Play size={20} className="ml-1" />
                        </div>
                    </div>
                </div>
            );

        case 'spotify':
        case 'music_section':
            return (
                <div className="py-12 border-y border-zinc-100">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-zinc-50 border border-zinc-100 flex items-center justify-center grayscale">
                            <div className="w-8 h-8 rounded-full border-2 border-zinc-200 animate-spin-slow" />
                        </div>
                        <div className="flex-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-2 block">Now Playing</span>
                            <h4 className="text-[14px] font-black uppercase tracking-widest mb-1">{s.title || "Sound Narrative"}</h4>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{s.artist || "Studio Selection"}</p>
                        </div>
                        <ArrowUpRight size={16} className="text-zinc-200" />
                    </div>
                </div>
            );

        case 'donation_section':
        case 'support':
            return (
                <div className="py-24 border-y border-zinc-900 flex flex-col items-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-zinc-200">Patronage</span>
                    <h3 className="text-[20px] font-light tracking-tighter mb-12 max-w-xs">{s.description || "Support the ongoing research and production of the studio."}</h3>
                    <div className="flex gap-4">
                        {['01', '05', '10'].map(v => (
                            <button key={v} className="w-16 h-16 border border-zinc-100 flex items-center justify-center text-[11px] font-black hover:border-zinc-900 transition-colors">
                                ${v}
                            </button>
                        ))}
                    </div>
                </div>
            );

        case 'community_section':
        case 'discord':
            return (
                <div className="py-16 bg-zinc-50 border border-zinc-100 px-10 flex items-center justify-between group cursor-pointer">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300 mb-3 block">Dialogue</span>
                        <h4 className="text-[15px] font-black uppercase tracking-widest">{s.title || "Join Discord"}</h4>
                    </div>
                    <div className="w-12 h-12 border border-zinc-900/10 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                        <Share2 size={16} />
                    </div>
                </div>
            );

        case 'products':
        case 'product_section':
        case 'offers_section':
        case 'featured_product_section':
        case 'product_list_section':
            const hasAnyImage = blockItems.some((item: any) => {
                const img = item.i || item.image || item.url;
                return img && (img.startsWith('http') || img.startsWith('/'));
            });

            return (
                <div className="space-y-16">
                    <div className="flex items-end justify-between border-b border-zinc-900 pb-8">
                        <h2 className="text-[24px] font-black uppercase tracking-tighter leading-none">{s.title || "Commerce"}</h2>
                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em]">Inventory 0{blockItems.length}</span>
                    </div>
                    <div className={cn(
                        "grid gap-x-6 gap-y-16",
                        hasAnyImage ? "grid-cols-2" : "grid-cols-1"
                    )}>
                        {blockItems.map((item: any, i: number) => {
                            const img = item.i || item.image || item.url;
                            const hasImg = img && (img.startsWith('http') || img.startsWith('/'));

                            return (
                                <div key={i} className="group cursor-pointer">
                                    {hasImg ? (
                                        <div className="aspect-[4/5] bg-zinc-50 border border-zinc-100 p-1 mb-6 overflow-hidden">
                                            <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                        </div>
                                    ) : hasAnyImage ? (
                                        // If some items have images but this one doesn't, show a numbered placeholder to maintain grid
                                        <div className="aspect-[4/5] bg-zinc-50 border border-zinc-100 p-6 mb-6 flex flex-col justify-between group-hover:bg-zinc-900 transition-all duration-500">
                                            <span className="text-[10px] font-black text-zinc-300 group-hover:text-zinc-700 uppercase tracking-widest">Nº 0{i + 1}</span>
                                            <ShoppingBag size={20} className="text-zinc-200 group-hover:text-zinc-800" />
                                        </div>
                                    ) : null}
                                    
                                    <div className={cn(
                                        "flex flex-col gap-2",
                                        !hasAnyImage && "border-l-2 border-zinc-900 pl-6 py-2 hover:bg-zinc-50 transition-colors"
                                    )}>
                                        <div className="flex items-start justify-between">
                                            <h4 className="text-[13px] font-black uppercase tracking-widest leading-tight">{item.t || item.title || "Product"}</h4>
                                            <span className="text-[12px] font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">{item.p || item.price || "—"}</span>
                                        </div>
                                        {(item.d || item.description) && (
                                            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed max-w-[280px]">
                                                {item.d || item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );

        case 'divider':
            return (
                <div className="py-20 w-full flex justify-center">
                    <div className="h-[2px] w-12 bg-zinc-900/10" />
                </div>
            );

        case 'heading':
            return (
                <div className="pt-24 pb-8 border-b-2 border-zinc-900">
                    <h2 className="text-[32px] font-black tracking-[-0.05em] uppercase leading-none">{s.title || "Archive 01"}</h2>
                </div>
            );

        case 'paragraph':
            return (
                <div className="py-4">
                    <p className="text-[13px] text-zinc-500 leading-relaxed font-medium tracking-wide max-w-[320px]">{s.text || s.description || "The pursuit of the essential through visual discipline."}</p>
                </div>
            );

        case 'social_medias_section':
        case 'socials': {
            const socialList = blockItems.length > 0 ? blockItems : (s.socials || []);
            return (
                <div className="py-12 border-y border-zinc-100">
                    {s.title && <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 mb-8 text-center">{s.title}</p>}
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {socialList.map((item: any, i: number) => {
                            const iconKey = item.icon || item.type || item.name || 'globe';
                            const brandColor = getBrandColor(iconKey);
                            return (
                                <a key={i} href={item.url || item.link || '#'} target="_blank" rel="noopener noreferrer"
                                   className="w-11 h-11 flex items-center justify-center rounded-2xl transition-all hover:scale-110 active:scale-95"
                                   style={{ background: brandColor + '10', border: `1px solid ${brandColor}20` }}>
                                    <span style={{ color: brandColor }}>
                                        <BrandIcon name={iconKey} size={20} colored />
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            );
        }
default:
            return null;
    }
};
