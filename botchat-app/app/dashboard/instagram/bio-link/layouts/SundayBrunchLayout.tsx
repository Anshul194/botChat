import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Heart, ShoppingBag, ArrowRight, Mail, Globe, Sparkles, Star, ChevronRight, User, Instagram, ShieldCheck, Plus, ArrowUpRight, Play, Share2
} from "lucide-react";
import { getUiTypeFromBlock, BrandIcon, getBrandColor } from "../builder-utils";

export function SundayBrunchLayout({ profile, tabs, openEditor }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => {
        if (String(b.id).startsWith('__preview')) return true;
        const isEnabled = b.is_enabled !== false && b.is_enabled !== 0 && b.is_enabled !== '0' && b.is_Enabled !== 0 && b.is_Enabled !== '0';
        const isActive = b.is_active !== 0 && b.is_active !== '0';
        return isEnabled && isActive;
    });

    const heroBlock = allBlocks.find(b => ['header', 'avatar', 'profile', 'hero', 'header_profile_section'].includes(getUiTypeFromBlock(b)));
    const contentBlocks = allBlocks.filter(b => b.id !== heroBlock?.id);

    return (
        <div className="w-full min-h-full bg-[#fdfaf5] text-[#4a403a] font-sans px-4 py-12 flex flex-col items-center selection:bg-[#e8dccb] relative">
            {/* Organic Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f8f1e9] rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-20 left-0 w-48 h-48 bg-[#fdf3e7] rounded-full blur-[80px] pointer-events-none -translate-x-1/2" />

            {/* Header */}
            {heroBlock && (
                <div 
                    onClick={() => openEditor?.(heroBlock)}
                    className="w-full max-w-[420px] mb-16 flex flex-col items-center text-center relative z-10 cursor-pointer"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        className="w-28 h-28 rounded-[3rem] bg-[var(--card)] p-2 mb-8 shadow-[0_20px_50px_rgba(74,64,58,0.1)] border-4 border-[#f8f1e9]"
                    >
                        <img 
                            src={heroBlock?.settings?.avatar || heroBlock?.settings?.image || heroBlock?.settings?.image_url || profile?.image || profile?.avatar || "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=400"} 
                            className="w-full h-full rounded-[2.5rem] object-cover" 
                        />
                    </motion.div>
                    
                    {heroBlock?.settings?.name && (
                        <p className="text-[11px] text-[#8c7e74] font-black uppercase tracking-[0.2em] mb-2 mt-4">{heroBlock.settings.name}</p>
                    )}
                    <h1 className="text-3xl font-serif font-black tracking-tight text-[#2d241e] mb-3 italic leading-tight">
                        {heroBlock?.settings?.title || profile?.title || "Handcrafted Life"}
                    </h1>
                    
                    <p className="text-sm text-[#8c7e74] font-medium max-w-[280px] leading-relaxed italic">
                        {heroBlock?.settings?.bio || heroBlock?.settings?.description || profile?.bio || "Living for slow mornings, good coffee, and organic design."}
                    </p>

                    <div className="flex gap-6 mt-10">
                        {['instagram', 'mail', 'globe'].map((p, i) => (
                            <motion.div key={i} whileHover={{ y: -3 }} className="text-[#8c7e74] hover:text-[#4a403a] transition-colors cursor-pointer">
                                {p === 'instagram' ? <Instagram size={18} /> : p === 'mail' ? <Mail size={18} /> : <Globe size={18} />}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Blocks */}
            <div className="w-full max-w-[420px] space-y-8 relative z-10">
                    {contentBlocks.map((block: any, idx: number) => (
                        <motion.div 
                            key={block.id || idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => openEditor?.(block)}
                            className="w-full cursor-pointer"
                        >{renderBrunchSection(block, profile)}
                    </motion.div>
                ))}
            </div>

            {/* Soft Footer */}
            <div className="mt-32 pb-16 opacity-30 text-center relative">
                <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-96 h-96 bg-[#f8f1e9] rounded-full blur-[120px] pointer-events-none" />
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-[#2d241e] mb-4">Curated with Intention</p>
                <div className="text-[11px] tracking-[0.3em] uppercase font-black text-[#8c7e74]">© 2026 BIOSTUDIO LUXURY</div>
            </div>
        </div>
    );
}

const renderBrunchSection = (block: any, profile: any) => {
    const type = getUiTypeFromBlock(block);
    const { settings, items } = block;
    const s = settings || {};
    
    const blockItems = (Array.isArray(s.items) && s.items.length > 0) 
        ? s.items 
        : (Array.isArray(items) && items.length > 0 && !items[0]?.builder_type) 
            ? items 
            : (Array.isArray(s.logos) && s.logos.length > 0) ? s.logos
            : (Array.isArray(s.plans) && s.plans.length > 0) ? s.plans
            : (Array.isArray(s.steps) && s.steps.length > 0) ? s.steps
            : (Array.isArray(s.points) && s.points.length > 0) ? s.points
            : [];

    // HIDE EMPTY BLOCKS: If no data items, return null to hide the design entirely (as requested)
    if (blockItems.length === 0 && !['header', 'avatar', 'profile', 'hero', 'header_profile_section', 'hero_aesthetic_section'].includes(type)) {
        // Special case: some blocks might have non-item settings (like text)
        if (!s.title && !s.text && !s.description && !s.image && !s.url) return null;
    }

    switch (type) {
        case 'link':
            const isFeatured = s.is_featured || s.is_Featured || false;
            const isButton = s.layout_type === 'button' || s.variant === 'button' || true; // Default to button-like as requested

            return (
                <a 
                    href={s.url || s.location_url || "#"}
                    className={cn(
                        "group relative block transition-all duration-300",
                        isFeatured 
                            ? "p-6 sm:p-7 bg-[var(--card)] border-2 border-[#2d241e] rounded-[2rem] shadow-[8px_8px_0px_#2d241e] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#2d241e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_#2d241e]" 
                            : "p-5 bg-[var(--card)] border border-[#2d241e] rounded-[1.5rem] shadow-[4px_4px_0px_#2d241e] hover:shadow-[6px_6px_0px_#2d241e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#2d241e]"
                    )}
                >
                    <div className="flex items-center gap-4 sm:gap-5 justify-center">
                        <div className="flex flex-col items-center">
                            <h3 className="text-[15px] font-black uppercase tracking-[0.2em] text-[#2d241e] text-center">
                                {s.title || s.name || s.label || "Curated Find"}
                            </h3>
                            {(s.description || s.text) && (
                                <p className="text-[9px] text-[#8c7e74] mt-1 font-black uppercase tracking-widest text-center opacity-60">{s.description || s.text}</p>
                            )}
                        </div>
                    </div>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight size={16} className="text-[#2d241e]" />
                    </div>
                </a>
            );

        case 'featured_links_section':
        case 'links_grid':
        case 'link_grid_section':
            return (
                <div className="space-y-4">
                    {blockItems.map((item: any, i: number) => {
                        const l = item.settings || item;
                        const img = l.image || l.thumbnail || l.url;
                        const isImg = img && (img.startsWith('http') || img.startsWith('/'));

                        return (
                            <motion.a 
                                key={i} 
                                href={l.url || l.location_url || "#"}
                                whileHover={{ scale: 1.01 }}
                                className="block w-full p-5 bg-[#2d241e] border-2 border-[#2d241e] rounded-[1.8rem] shadow-[6px_6px_0px_rgba(45,36,30,0.2)] hover:shadow-[8px_8px_0px_rgba(45,36,30,0.2)] transition-all group overflow-hidden"
                            >
                                <div className="flex items-center gap-4">
                                    {isImg && (
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0">
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 text-center">
                                        <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white">
                                            {l.title || l.name || l.label}
                                        </span>
                                    </div>
                                </div>
                            </motion.a>
                        );
                    })}
                </div>
            );

        case 'hero_aesthetic_section':
            return (
                <div className="w-full space-y-8 mb-12">
                    <div className="w-full aspect-video rounded-[3rem] overflow-hidden bg-[var(--card)] shadow-[0_20px_50px_rgba(74,64,58,0.1)] border-4 border-[#f8f1e9] group">
                        <img 
                            src={s.image || s.url || s.image_url || blockItems?.[0]?.image || blockItems?.[0]?.url || "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=400"} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                    </div>
                    <div className="text-center px-4">
                        <h2 className="text-3xl font-serif font-black italic text-[#2d241e] mb-4 leading-tight">
                            {s.title || "Artesian Collection"}
                        </h2>
                        <p className="text-sm text-[#8c7e74] font-medium leading-relaxed italic max-w-[300px] mx-auto">
                            {s.description || s.subtitle || "A curation of timeless pieces designed for the modern sanctuary."}
                        </p>
                        {s.button_text && (
                            <motion.button whileHover={{ scale: 1.05 }} className="mt-8 px-8 py-3 bg-[#2d241e] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {s.button_text}
                            </motion.button>
                        )}
                    </div>
                </div>
            );

        case 'link_carousel_section':
        case 'links_carousel':
            if (blockItems.length === 0) return null;
            return (
                <div className="relative -mx-8">
                    <div className="flex gap-4 overflow-x-auto px-8 pb-4 no-scrollbar snap-x">
                        {blockItems.map((item: any, i: number) => {
                        const img = item.image || item.thumbnail || item.icon_image;
                        const isImg = img && (img.startsWith('http') || img.startsWith('/'));

                            return (
                                <a key={i} href={item.url || "#"} className="min-w-[220px] snap-center p-8 rounded-[3rem] bg-[var(--card)] border border-[#f3eee8] shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                    {isImg ? (
                                        <div className="w-full h-24 mb-4 rounded-2xl overflow-hidden border border-[#f3eee8]">
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="text-[#e8dccb] mb-4 group-hover:translate-x-1 transition-transform">
                                            <ArrowRight size={24} />
                                        </div>
                                    )}
                                    <h4 className="text-[15px] font-serif font-black italic text-[#2d241e] mb-1">{item.n || item.name || item.title}</h4>
                                    <p className="text-[10px] text-[#8c7e74] font-black uppercase tracking-widest">{item.d || item.description || item.subtitle || "Collection"}</p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className={cn("grid gap-4", blockItems.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {(blockItems.length > 0 ? blockItems : [s]).map((item: any, i: number) => (
                        <div key={i} className="rounded-[2.5rem] overflow-hidden shadow-xl shadow-orange-100/30 border-[6px] border-white relative group">
                            <img 
                                src={item.image || item.url || item.image_url || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"} 
                                className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-110" 
                                alt={item.title || "Image"}
                            />
                            <div className="absolute inset-0 bg-[#4a403a]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Heart size={24} className="text-white fill-current" />
                            </div>
                        </div>
                    ))}
                </div>
            );

        case 'stats':
        case 'stats_section':
        case 'stats_minimal_section':
        case 'floating_stats_section':
        case 'impact_section':
            if (blockItems.length === 0) return null;
            return (
                <div className="grid grid-cols-2 gap-4">
                    {blockItems.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className={cn(
                            "p-8 rounded-[3rem] flex flex-col items-center text-center",
                            i % 2 === 0 ? "bg-[#f8f1e9] shadow-sm" : "bg-[var(--card)] border border-[#f3eee8]"
                        )}>
                            <span className="text-2xl font-serif font-black text-[#2d241e] mb-1 italic">{item.value || item.n || item.title}</span>
                            <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-[0.2em]">{item.label || item.d || item.subtitle}</span>
                        </div>
                    ))}
                </div>
            );

        case 'social_medias_section':
        case 'socials': {
            const socialList = blockItems.length > 0 ? blockItems : (s.socials || []);
            return (
                <div className="py-4">
                    {s.title && <p className="text-center text-[10px] font-black text-[#8c7e74] uppercase tracking-[0.4em] italic mb-6">{s.title}</p>}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {socialList.map((item: any, i: number) => {
                            const iconKey = item.icon || item.type || item.name || 'globe';
                            const brandColor = getBrandColor(iconKey);
                            return (
                                <a key={i} href={item.url || item.link || '#'} target="_blank" rel="noopener noreferrer"
                                   className="w-12 h-12 rounded-[2rem] flex items-center justify-center border-2 border-[#2d241e] shadow-[3px_3px_0px_#2d241e] hover:shadow-[5px_5px_0px_#2d241e] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all bg-[var(--card)]"
                                   style={{ borderColor: brandColor, boxShadow: `3px 3px 0px ${brandColor}` }}>
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

        case 'portfolio_section':
        case 'portfolio_minimal_section':
        case 'content_grid_section':
            if (blockItems.length === 0) return null;
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#2d241e] italic">
                            {s.title || "Selected Works"}
                        </h3>
                        <span className="text-[10px] font-bold text-[#8c7e74] uppercase tracking-widest border-b border-[#e8dccb] pb-0.5">View All</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {blockItems.map((item: any, i: number) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ scale: 0.98 }}
                                className="rounded-[2rem] overflow-hidden border-2 border-[#2d241e] shadow-[4px_4px_0px_#2d241e] bg-[var(--card)] group relative aspect-[4/5]"
                            >
                                <img src={item.image || item.url || item.image_url || item.thumbnail} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            );

        case 'urgency_offer_section':
        case 'countdown_section':
            return (
                <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#2d241e] text-white flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[var(--card)] rounded-full blur-3xl" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-white/50 italic">{s.title || "Limited Time Offer"}</h3>
                    <div className="flex justify-center gap-6 mb-8">
                        {[
                            { v: '03', l: 'DAYS' }, { v: '09', l: 'HRS' }, { v: '42', l: 'MIN' }
                        ].map((t, i) => (
                            <div key={i} className="flex flex-col items-center min-w-[60px]">
                                <span className="text-3xl font-serif font-black italic mb-1 text-white">{t.v}</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{t.l}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[11px] text-white/70 font-medium italic mb-2 leading-relaxed">{s.description || "Grab your exclusive access before the timer hits zero."}</p>
                </div>
            );

        case 'services':
        case 'services_section':
            return (
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-px flex-1 bg-[#e8dccb]" />
                        <h3 className="text-[12px] sm:text-[14px] font-serif font-black italic text-[#2d241e]">The Menu</h3>
                        <div className="h-px flex-1 bg-[#e8dccb]" />
                    </div>
                    <div className="grid gap-3">
                        {(blockItems.length > 0 ? blockItems : [
                            { t: 'Consultation', d: 'One-on-one session', p: '$150' },
                            { t: 'Creative Audit', d: 'Visual strategy review', p: '$450' }
                        ]).map((item, i) => (
                            <div key={i} className="p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-[var(--card)] border border-[#f3eee8] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="min-w-0 pr-4">
                                    <h4 className="text-[14px] sm:text-[15px] font-bold text-[#2d241e] truncate">{item.t}</h4>
                                    <p className="text-[10px] sm:text-[11px] text-[#8c7e74] font-medium italic truncate">{item.d}</p>
                                </div>
                                <span className="text-[12px] sm:text-[13px] font-black text-[#4a403a] shrink-0">{item.p}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'trust_badges':
        case 'trust_badges_section':
            return (
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-6 sm:py-8 opacity-40 grayscale">
                    {[
                        { i: ShieldCheck, l: 'Secure' },
                        { i: Heart, l: 'Organic' },
                        { i: Star, l: 'Quality' }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <item.i size={14} className="text-[#8c7e74]" />
                            <span className="text-[9px] font-black tracking-widest text-[#2d241e] uppercase">{item.l}</span>
                        </div>
                    ))}
                </div>
            );

        case 'testimonials':
        case 'testimonials_section':
        case 'testimonial_highlight_section':
            if (blockItems.length === 0) return null;
            return (
                <div className="space-y-6 sm:space-y-8">
                    <div className="text-center px-4">
                        <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-[0.4em] mb-3 block">Kind Words</span>
                        <h2 className="text-[22px] font-serif font-black italic text-[#2d241e]">Community Stories</h2>
                    </div>
                    <div className="grid gap-6">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="p-10 rounded-[3rem] bg-[var(--card)] border border-[#f3eee8] shadow-sm relative text-center">
                                <Star className="text-[#e8dccb] mx-auto mb-6" size={24} fill="currentColor" />
                                <p className="text-[15px] text-[#4a403a] italic leading-relaxed mb-8 px-2 font-medium">
                                    "{item.t || item.text || item.description || item.quote}"
                                </p>
                                <div className="flex flex-col items-center">
                                    {(item.image || item.author_image || item.url || item.image_url) && (
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#fdfaf5] mb-3 shadow-md">
                                            <img src={item.image || item.author_image || item.url || item.image_url} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <p className="text-xs font-bold text-[#2d241e]">{item.n || item.name || item.author || item.title}</p>
                                    {(item.d || item.subtitle || item.role) && <p className="text-[10px] text-[#8c7e74] font-black uppercase tracking-widest mt-1">{item.d || item.subtitle || item.role}</p>}
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
                <div className="space-y-6">
                    <h3 className="text-center text-[10px] font-black text-[#8c7e74] uppercase tracking-[0.4em] italic mb-8">Inquiries</h3>
                    <div className="space-y-3">
                        {(blockItems.length > 0 ? blockItems : [
                            { q: 'Where do you ship?', a: 'We ship our handcrafted goods worldwide from our studio in the mountains.' },
                            { q: 'Custom orders?', a: 'Yes, we love working on bespoke pieces. Inquire via the contact form above.' }
                        ]).map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/50 border border-[#f3eee8] hover:bg-white transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[14px] font-bold text-[#2d241e] italic">{item.q || item.title || item.question}</h4>
                                    <Plus size={14} className="text-[#e8dccb] group-hover:text-[#8c7e74] transition-colors" />
                                </div>
                                <p className="text-[11px] sm:text-[12px] text-[#8c7e74] font-medium leading-relaxed italic">{item.a || item.text || item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'brands':
        case 'brands_section':
            return (
                <div className="py-8 flex flex-wrap items-center justify-center gap-8 opacity-20 grayscale">
                    {['VOGUE', 'VICE', 'DAZED'].map(b => (
                        <span key={b} className="text-[12px] font-black tracking-[0.2em]">{b}</span>
                    ))}
                </div>
            );

        case 'newsletter':
        case 'newsletter_section':
        case 'newsletter_collector':
        case 'email_collector':
            return (
                <div className="p-10 rounded-[3.5rem] bg-[#f8f1e9] border-4 border-white shadow-2xl shadow-orange-100/40 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--card)] flex items-center justify-center text-[#2d241e] mb-8 shadow-sm">
                        <Mail size={24} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif font-black italic text-[#2d241e] mb-3">Sunday Letters</h3>
                    <p className="text-xs text-[#8c7e74] font-medium mb-10 leading-relaxed italic px-4">{s.description || "Thoughtful updates and quiet inspiration for your week ahead."}</p>
                    <div className="w-full space-y-4">
                        <input type="email" placeholder="YOUR EMAIL ADDRESS" className="w-full h-14 bg-[var(--card)] border border-transparent rounded-3xl px-6 text-[13px] focus:outline-none focus:border-[#e8dccb] transition-all text-center tracking-tight" />
                        <button className="w-full h-14 bg-[#4a403a] text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-[#2d241e] transition-all shadow-lg shadow-orange-900/10">Subscribe</button>
                    </div>
                </div>
            );



        case 'cta_section':
        case 'impact_section':
        case 'contact_section':
        case 'contact_form':
        case 'contact_collector':
            return (
                <div className="p-8 sm:p-10 rounded-[3rem] bg-[var(--card)] border-2 border-[#2d241e] shadow-[10px_10px_0px_#2d241e] flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#fdfaf5] border border-[#2d241e] flex items-center justify-center text-[#2d241e] mb-8">
                        <Mail size={24} />
                    </div>
                    <h3 className="text-xl font-serif font-black italic text-[#2d241e] mb-4">
                        {s.title || "Direct Connection"}
                    </h3>
                    <p className="text-[13px] text-[#8c7e74] font-medium mb-10 leading-relaxed italic px-2">
                        {s.description || "Have a project in mind or just want to say hello? My inbox is always open for thoughtful inquiries."}
                    </p>
                    <button className="w-full h-14 bg-[#2d241e] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(45,36,30,0.2)] transition-all">
                        {s.button_text || "Send a Message"}
                    </button>
                </div>
            );

        case 'offers_section':
        case 'pricing_cards_section':
            if (blockItems.length === 0) return null;
            return (
                <div className="space-y-6">
                    <div className="text-center">
                        <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-[0.4em] italic mb-2 block">Exclusive Access</span>
                        <h2 className="text-[24px] font-serif font-black italic text-[#2d241e]">Curated Offers</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x px-2">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="min-w-[280px] snap-center p-8 rounded-[2.5rem] bg-[var(--card)] border-2 border-[#2d241e] shadow-[6px_6px_0px_#2d241e] flex flex-col">
                                <span className="text-[10px] font-black text-[#e8dccb] uppercase tracking-widest mb-2 italic">Offer {i + 1}</span>
                                <h4 className="text-[18px] font-black text-[#2d241e] mb-1 italic leading-tight">{item.title || item.t || item.name}</h4>
                                <p className="text-[12px] text-[#8c7e74] font-medium italic mb-8">{item.description || item.d || item.subtitle}</p>
                                <div className="mt-auto pt-6 border-t border-[#f3eee8] flex items-center justify-between">
                                    <span className="text-[18px] font-serif font-black italic text-[#2d241e]">{item.price || item.p}</span>
                                    <button className="w-10 h-10 rounded-full bg-[#2d241e] text-white flex items-center justify-center hover:scale-110 transition-transform">
                                        <Plus size={18} />
                                    </button>
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
                <div className="p-2 bg-[var(--card)] border border-[#f3eee8] rounded-[3rem] shadow-sm overflow-hidden group aspect-video relative">
                    <img src={s.thumbnail || "https://images.unsplash.com/photo-1516483642785-0cda1fb59ce2?w=800"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#2d241e] shadow-xl group-hover:bg-[#2d241e] group-hover:text-white transition-all">
                            <Play size={20} fill="currentColor" />
                        </div>
                    </div>
                </div>
            );

        case 'spotify':
        case 'music_section':
            return (
                <div className="p-8 rounded-[3.5rem] bg-[#fdfaf5] border border-[#f3eee8] flex items-center gap-6 group">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--card)] border border-[#f3eee8] flex items-center justify-center text-[#e8dccb] group-hover:rotate-12 transition-transform">
                        <BrandIcon name="spotify" size={32} />
                    </div>
                    <div className="flex-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8c7e74] mb-1 block italic">Sunday Playlist</span>
                        <h4 className="text-[16px] font-serif font-black italic text-[#2d241e]">{s.title || "Soft Mornings"}</h4>
                        <p className="text-[11px] text-[#8c7e74] font-medium italic">Curated for quiet hours</p>
                    </div>
                    <ArrowUpRight size={18} className="text-[#e8dccb]" />
                </div>
            );

        case 'community_section':
        case 'discord':
            return (
                <div className="p-10 rounded-[3rem] bg-[#2d241e] text-white flex flex-col items-center text-center group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Share2 size={24} />
                    </div>
                    <h3 className="text-xl font-serif font-black italic mb-2">The Gathering</h3>
                    <p className="text-[12px] text-white/50 font-medium italic mb-8 max-w-[200px]">{s.description || "Join our quiet corner for thoughtful discussion."}</p>
                    <button className="px-8 py-3 bg-[var(--card)] text-[#2d241e] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Join Discord</button>
                </div>
            );

        case 'donation_section':
        case 'support':
            return (
                <div className="p-12 text-center bg-[var(--card)] border border-[#f3eee8] rounded-[4rem] shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 text-orange-200 mb-8">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <h3 className="text-2xl font-serif font-black italic text-[#2d241e] mb-4">Gifts & Support</h3>
                    <p className="text-[13px] text-[#8c7e74] font-medium mb-10 max-w-[240px] mx-auto italic leading-relaxed">If my work has touched your heart, consider supporting its continuation.</p>
                    <div className="flex justify-center gap-4">
                        {[5, 15, 30].map(v => (
                            <button key={v} className="px-8 py-4 rounded-3xl bg-[#fdfaf5] border border-[#f3eee8] text-[#2d241e] font-black text-xs hover:bg-[#2d241e] hover:text-white transition-all active:scale-95">
                                ${v}
                            </button>
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
};
