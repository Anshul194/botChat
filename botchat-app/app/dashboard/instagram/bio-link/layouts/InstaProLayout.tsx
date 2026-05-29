import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Youtube, Image as ImageIcon, ChevronRight,
    Star, Mail, Phone, ExternalLink,
    Play, Globe, ArrowRight,
    Sparkles, ArrowUpRight, ShieldCheck, Zap, Layers, Grid, ShoppingBag,
    User, DollarSign, Plus, Check, Share2
} from "lucide-react";
import { getUiTypeFromBlock, BrandIcon, getBrandColor } from "../builder-utils";

export function InstaProLayout({ profile, tabs, openEditor }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => {
        if (String(b.id).startsWith('__preview')) return true;
        const isEnabled = b.is_enabled !== false && b.is_enabled !== 0 && b.is_enabled !== '0';
        const isActive = b.is_active !== 0 && b.is_active !== '0';
        return isEnabled && isActive;
    });

    const settings = profile?.settings || {};
    const accentColor = "#8b5cf6";

    return (
        <div className="relative w-full min-h-full bg-[#030303] text-white font-sans selection:bg-[#8b5cf6]/30 px-0 py-6">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[35%] bg-gradient-to-b from-[#8b5cf6]/10 to-transparent blur-[80px] pointer-events-none" />

            <div className="relative z-10 w-full">
                <div className="flex flex-col gap-6">
                    {(() => {
                        const heroBlock = allBlocks.find((b: any) => {
                            const t = getUiTypeFromBlock(b);
                            return t === 'header_profile_section' || t === 'avatar' || t === 'header' || t === 'profile' || t === 'hero';
                        });
                        const contentBlocks = allBlocks.filter((b: any) => b.id !== heroBlock?.id);

                        return (
                            <>
                                {heroBlock && (
                                    <div onClick={() => openEditor?.(heroBlock)} className={openEditor ? "cursor-pointer" : ""}>
                                        {renderInstaProSection(heroBlock, accentColor, profile, openEditor)}
                                    </div>
                                )}

                                <div className="flex flex-col gap-5 px-3">
                                    {contentBlocks.map((block: any, idx: number) => (
                                        <motion.div
                                            key={block.id || idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.04 }}
                                            onClick={() => openEditor?.(block)}
                                            className={openEditor ? "cursor-pointer" : ""}
                                        >
                                            {renderInstaProSection(block, accentColor, profile, openEditor)}
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {settings.display_branding !== false && (
                <div className="mt-12 pb-8 text-center">
                    <div className="inline-flex items-center gap-2 text-[8px] font-black tracking-[0.4em] text-white/10 uppercase italic">
                        <ShieldCheck size={10} className="text-[#8b5cf6]/40" />
                        Signature Elite
                    </div>
                    <div className="mt-3">
                        <a href="/" className="text-[8px] font-black tracking-[0.4em] uppercase text-[#8b5cf6] hover:opacity-50 transition-opacity">
                            BIOSTUDIO LUXURY
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

const renderInstaProSection = (block: any, accentColor: string, profile: any, openEditor?: any) => {
    const type = getUiTypeFromBlock(block);
    const { settings, items } = block;
    // settings?.items takes priority over top-level items (which may be an empty array)
    const blockItems = settings?.items || settings?.logos || settings?.plans || settings?.steps || settings?.points || items || [];
    const s = settings || {};

    switch (type) {
        case 'header_profile_section':
        case 'avatar':
        case 'header':
        case 'profile':
        case 'hero': {
            const mainImg = s.avatar || s.image || profile?.image;
            const secondImg = s.cover_image || s.image_secondary || s.secondary_image;
            const heroImages = [mainImg, secondImg].filter(Boolean);

            return (
                <div className="relative overflow-hidden">
                    <div className="relative w-full h-[280px] overflow-hidden bg-[#050505] flex">
                        {heroImages.length > 1 ? (
                            <div className="absolute inset-0 flex z-10">
                                <div className="w-1/2 h-full relative overflow-hidden">
                                    <img src={heroImages[1]} className="w-full h-full object-cover grayscale-[60%] opacity-50" alt="Detail" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
                                </div>
                                <div className="w-1/2 h-full relative overflow-hidden border-l border-white/5">
                                    <img src={heroImages[0]} className="w-full h-full object-cover grayscale-[10%]" alt="Creator" />
                                    <div className="absolute inset-0 bg-gradient-to-l from-[#050505] via-transparent to-transparent" />
                                </div>
                            </div>
                        ) : (
                            <div className="absolute top-0 right-0 w-[85%] h-full z-10">
                                <img
                                    src={heroImages[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"}
                                    className="w-full h-full object-cover grayscale-[40%]"
                                    alt="Creator"
                                />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#050505]/80 to-[#050505]" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-[15]" />

                        <div className="relative z-20 w-full h-full flex flex-col justify-end p-5 pb-8">
                            <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl mb-4">
                                    <Sparkles size={10} className="text-[#8b5cf6]" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#8b5cf6]">Elite Collective</span>
                                </div>
                                <h1 className="text-[28px] font-black tracking-tighter text-white mb-3 leading-[0.9] uppercase italic break-words">
                                    {s.title || s.name || profile?.title || "Signature Excellence"}
                                </h1>
                                <p className="text-[10px] text-white/40 max-w-[200px] font-medium leading-relaxed mb-5 uppercase tracking-widest italic">
                                    {s.bio || s.description || profile?.bio || "Crafting digital legacies."}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            );
        }

        case 'link': {
            const isFeatured = s.is_featured || s.is_Featured || false;
            return (
                <a
                    href={s.location_url || s.url || "#"}
                    className={cn(
                        "group w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-500 shadow-xl relative overflow-hidden",
                        isFeatured
                            ? "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] border-none"
                            : "bg-white/[0.02] border border-white/5 hover:bg-white/5"
                    )}
                >
                    {isFeatured && (
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                    )}
                    <div className="flex items-center gap-3 relative z-10">
                        <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                            isFeatured ? "bg-white text-[#8b5cf6]" : "bg-white/5 text-white/20 group-hover:bg-[#8b5cf6] group-hover:text-white"
                        )}>
                            <ArrowUpRight size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-black text-[13px] uppercase tracking-tight italic",
                                isFeatured ? "text-white" : "text-white"
                            )}>
                                {s.name || s.title || "Experience"}
                            </span>
                            {(s.description || s.text) && (
                                <span className={cn(
                                    "text-[9px] uppercase tracking-wider mt-0.5",
                                    isFeatured ? "text-white/70" : "text-white/30"
                                )}>
                                    {s.description || s.text}
                                </span>
                            )}
                        </div>
                    </div>
                    <ArrowRight size={16} className={cn(
                        "relative z-10 transition-all",
                        isFeatured ? "text-white" : "text-white/20 group-hover:text-white"
                    )} />
                </a>
            );
        }

        case 'link_grid_section':
        case 'links_grid':
            return (
                <div className="grid grid-cols-2 gap-3">
                    {(blockItems.length > 0 ? blockItems : [
                        { name: 'Resources', url: '#' },
                        { name: 'Contact', url: '#' }
                    ]).map((item: any, i: number) => (
                        <a key={i} href={item.url || "#"} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#8b5cf6]/50 transition-all group aspect-square">
                            <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-[#8b5cf6] group-hover:text-white transition-all mb-3">
                                <ArrowUpRight size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-white/80 text-center leading-tight">{item.name || item.title || item.label || "Link"}</span>
                        </a>
                    ))}
                </div>
            );

        case 'stats':
        case 'stats_section':
        case 'stats_minimal_section':
        case 'floating_stats_section':
        case 'impact_section':
            return (
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    {(blockItems.length > 0 ? blockItems : [
                        { value: '12', label: 'Years' },
                        { value: '$4M', label: 'Impact' },
                        { value: '800K', label: 'Network' },
                        { value: '250', label: 'Global' }
                    ]).slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="flex flex-col items-center text-center py-2">
                            <p className="text-[22px] font-black tracking-tighter text-white italic leading-none mb-1">{item.value}</p>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{item.label}</p>
                        </div>
                    ))}
                </div>
            );

        case 'newsletter':
        case 'newsletter_section':
        case 'newsletter_collector':
        case 'email_collector':
            return (
                <div className="p-5 rounded-2xl bg-[#8b5cf6] relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <h3 className="text-[18px] font-black tracking-tighter text-white mb-2 uppercase italic leading-none">{s.title || s.heading || "Join the Circle"}</h3>
                    <p className="text-[10px] text-white/70 mb-4 font-medium italic">{s.description || s.text || "Exclusive updates for the distinguished few."}</p>
                    <div className="relative">
                        <input type="email" placeholder={s.placeholder || "YOUR EMAIL"} className="w-full h-11 bg-black/20 border border-white/10 rounded-xl px-4 text-[11px] text-white placeholder:text-white/30 focus:outline-none uppercase tracking-wider font-black" />
                        <button className="absolute right-1 top-1 h-9 px-4 rounded-lg bg-white text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest">{s.button_text || "Join"}</button>
                    </div>
                </div>
            );

        case 'contact_section':
            return (
                <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    <h3 className="text-[9px] font-black text-white/20 mb-4 uppercase tracking-[0.4em] italic">Private Communication</h3>
                    <div className="space-y-2">
                        {[
                            { i: Mail, v: s.email, label: 'Email' },
                            { i: Phone, v: s.phone, label: 'Phone' }
                        ].filter(item => item.v).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] shrink-0"><item.i size={14} /></div>
                                <span className="text-[11px] font-black text-white italic tracking-tight truncate">{item.v}</span>
                            </div>
                        ))}
                        {!s.email && !s.phone && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6] shrink-0"><Mail size={14} /></div>
                                <span className="text-[11px] font-black text-white/30 italic">concierge@studio.pro</span>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'countdown':
        case 'countdown_section':
        case 'urgency_offer_section':
            return (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-center relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-50" />
                    <h3 className="text-[9px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] mb-4 italic">{s.title || s.heading || "Elite Launch"}</h3>
                    <div className="flex justify-center gap-5">
                        {[{ v: '02', l: 'DAYS' }, { v: '14', l: 'HRS' }, { v: '45', l: 'MIN' }].map((t, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-[26px] font-black tracking-tighter text-white italic leading-none mb-1">{t.v}</span>
                                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">{t.l}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-[9px] text-white/40 font-medium italic">{s.description || "Limited access begins shortly."}</p>
                </div>
            );

        case 'services':
        case 'services_section':
            return (
                <div className="space-y-3">
                    <h2 className="text-[13px] font-black tracking-tighter text-white uppercase italic leading-none pl-2 border-l-4 border-[#8b5cf6]">{s.title || "Premium Services"}</h2>
                    <div className="space-y-2">
                        {(blockItems.length > 0 ? blockItems : [
                            { title: 'Branding', description: 'Visual Identity & Strategy', price: '$2k+' },
                            { title: 'Development', description: 'Full-stack Performance', price: '$5k+' }
                        ]).map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#8b5cf6]/30 transition-all">
                                <div className="min-w-0 pr-3">
                                    <h4 className="text-[12px] font-black text-white uppercase italic mb-0.5 truncate">{item.t || item.title || item.name || "Service"}</h4>
                                    <p className="text-[9px] text-white/30 truncate">{item.d || item.description || "Premium Offering"}</p>
                                </div>
                                <span className="text-[11px] font-black text-[#8b5cf6] shrink-0">{item.p || item.price || item.cost}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'trust_badges':
        case 'trust_badges_section':
        case 'social_proof_section':
            return (
                <div className="flex flex-wrap items-center justify-center gap-5 p-4 rounded-2xl bg-white/[0.01] border border-white/5">
                    {(blockItems.length > 0 ? blockItems : [
                        { label: 'SECURE' }, { label: 'VERIFIED' }, { label: 'ELITE' }
                    ]).filter((b: any) => b.label).map((badge: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <ShieldCheck size={12} className="text-[#8b5cf6]" />
                            <span className="text-[8px] font-black tracking-widest text-white">{badge.label}</span>
                        </div>
                    ))}
                </div>
            );

        case 'testimonials':
        case 'testimonials_section':
        case 'testimonial_highlight_section':
            return (
                <div className="space-y-4">
                    <div className="pl-2 border-l-4 border-[#8b5cf6]">
                        <h2 className="text-[14px] font-black tracking-tighter text-white uppercase italic">The Verdict</h2>
                        <p className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Praise from the inner circle</p>
                    </div>
                    <div className="space-y-3">
                        {(blockItems.length > 0 ? blockItems : [
                            { name: 'Alexander R.', role: 'Global Director', quote: '"Unparalleled aesthetic vision."' },
                            { name: 'Sophia L.', role: 'Creative Lead', quote: '"Redefining modern luxury."' }
                        ]).map((item: any, i: number) => (
                            <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 shadow-xl">
                                <p className="text-[12px] font-medium text-white/80 italic leading-relaxed mb-4">
                                    "{item.quote || item.text || item.description || "Outstanding work."}"
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                        {item.avatar || item.image ? <img src={item.avatar || item.image} className="w-full h-full object-cover" /> : <User size={14} className="text-[#8b5cf6]" />}
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-white uppercase italic">{item.name || "Elite Client"}</h4>
                                        <p className="text-[8px] text-white/30 uppercase tracking-wider">{item.role || item.subtitle || "Collaborator"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'brands':
        case 'brands_section':
            return (
                <div className="space-y-3">
                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] text-center block italic">Global Partners</span>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 py-4 opacity-40 hover:opacity-100 transition-all duration-700">
                        {(blockItems.length > 0 ? blockItems : [
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732229.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732190.png' }
                        ]).map((logo: any, i: number) => (
                            logo.image || logo.url ? (
                                <img key={i} src={logo.image || logo.url} className="h-5 w-auto object-contain" />
                            ) : (
                                <span key={i} className="text-[11px] font-black tracking-widest text-white uppercase">{logo.name || logo.title || "BRAND"}</span>
                            )
                        ))}
                    </div>
                </div>
            );

        case 'social_medias_section':
        case 'socials': {
            const socialList = blockItems.length > 0 ? blockItems : (s.socials || []);
            return (
                <div className="space-y-4">
                    {s.title && <h2 className="text-center text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic">{s.title}</h2>}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {socialList.map((item: any, i: number) => {
                            const iconKey = item.icon || item.type || item.name || 'globe';
                            const brandColor = getBrandColor(iconKey);
                            return (
                                <a key={i} href={item.url || item.link || '#'} target="_blank" rel="noopener noreferrer"
                                   className="w-11 h-11 rounded-[18px] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                                   style={{ background: brandColor + '15', border: `1.5px solid ${brandColor}30` }}>
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

        case 'faq':
        case 'faq_section':
        case 'faq_cards_section':
            return (
                <div className="space-y-3">
                    <h2 className="text-center text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic">FAQ</h2>
                    <div className="space-y-2">
                        {(blockItems.length > 0 ? blockItems : [
                            { question: 'What is the vision?', answer: 'To curate experiences that transcend the ordinary.' },
                            { question: 'How to collaborate?', answer: 'Access is limited to select brands that align with our values.' }
                        ]).map((item: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-[#8b5cf6]/20 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-[11px] font-black text-white uppercase italic tracking-tight pr-2">{item.question || item.q || item.title}</h4>
                                    <Plus size={12} className="text-[#8b5cf6] opacity-40 shrink-0" />
                                </div>
                                <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">{item.answer || item.a || item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'heading':
            return (
                <div className="pt-4 pb-2">
                    <h2 className="text-[20px] font-black tracking-tighter text-white uppercase italic leading-none">{s.title || s.name || "Section"}</h2>
                    <div className="w-10 h-1.5 bg-[#8b5cf6] mt-3 rounded-full" />
                </div>
            );

        case 'paragraph':
            return (
                <p className="text-[12px] text-white/30 leading-relaxed font-medium italic">{s.text || s.description || "Defining the intersection of art and commerce."}</p>
            );

        case 'divider':
            return (
                <div className="py-4 flex justify-center px-6">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent" />
                </div>
            );

        case 'image': {
            const imgList = blockItems.length > 0 ? blockItems : (s.image ? [{ url: s.image, title: s.image_alt || '' }] : []);
            return imgList.length > 0 ? (
                <div className={`grid gap-3 ${imgList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {imgList.map((item: any, i: number) => (
                        <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-[#050505]">
                            <img src={item.url || item.image || s.image || ''} className="w-full h-full object-cover grayscale-[40%]" alt={item.title || ''} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                                {item.title && <p className="text-[9px] font-black text-white uppercase italic tracking-widest">{item.title}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : null;
        }

        case 'spotify':
            return (
                <div className="rounded-2xl overflow-hidden border border-white/5 shadow-xl bg-black">
                    <iframe
                        src={(s.url || '').replace('track/', 'embed/track/').replace('open.spotify.com', 'open.spotify.com') || "https://open.spotify.com/embed/track/4PTG3C64LUUP9XzKyAFPr3"}
                        width="100%" height="100" frameBorder="0"
                        allow="encrypted-media"
                        className="opacity-80"
                    />
                </div>
            );

        default:
            return null;
    }
};
