import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Youtube, Video, Image as ImageIcon, ChevronRight,
    Star, Mail, Phone, MessageCircle, ExternalLink,
    Play, Heart, Globe, GraduationCap, ArrowRight, Share2, Check,
    Sparkles, ArrowUpRight, ShieldCheck, Zap, Layers, Grid, ShoppingBag,
    User, DollarSign, Plus
} from "lucide-react";
import { getUiTypeFromBlock } from "../builder-utils";

export function InstaProLayout({ profile, tabs }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => b.is_active != 0 && b.is_Enabled != 0);

    const settings = profile?.settings || {};
    const accentColor = "#8b5cf6"; 

    return (
        <div className="w-full min-h-full bg-[#050505] text-white font-sans overflow-x-hidden pb-24 selection:bg-[#8b5cf6]/30 flex flex-col relative">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-[40%] bg-gradient-to-b from-[#8b5cf6]/10 to-transparent blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-0 w-64 h-64 bg-[#8b5cf6]/5 blur-[80px] pointer-events-none" />

            <div className="relative z-10 w-full mx-auto">
                <div className="flex flex-col gap-12 sm:gap-16">
                    {(() => {
                        const heroBlock = allBlocks.find(b => {
                            const t = getUiTypeFromBlock(b);
                            return t === 'header_profile_section' || t === 'avatar' || t === 'header' || t === 'profile' || t === 'hero';
                        });
                        const contentBlocks = allBlocks.filter(b => b.id !== heroBlock?.id);

                        return (
                            <>
                                {renderInstaProSection(heroBlock || { type: 'header' }, accentColor, profile)}
                                
                                <div className="flex flex-col gap-12 sm:gap-20">
                                    {contentBlocks.map((block: any, idx: number) => (
                                        <motion.div
                                            key={block.id || idx}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        >
                                            {renderInstaProSection(block, accentColor, profile)}
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            {/* Premium Branding Footer */}
            {(settings.display_branding !== false) && (
                <div className="mt-32 pb-12 text-center">
                    <div className="inline-flex items-center gap-3 text-[10px] font-black tracking-[0.5em] text-white/10 uppercase italic">
                        <ShieldCheck size={12} className="text-[#8b5cf6]/40" />
                        Signature Elite
                    </div>
                    <div className="mt-6">
                        <a href="/" className="text-[9px] font-black tracking-[0.6em] uppercase text-[#8b5cf6] hover:opacity-50 transition-opacity">
                            BIOSTUDIO LUXURY
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

const renderInstaProSection = (block: any, accentColor: string, profile: any) => {
    const type = getUiTypeFromBlock(block);
    const { settings, items } = block;
    const blockItems = items || settings?.items || [];
    const s = settings || {};

    switch (type) {
        case 'header_profile_section':
        case 'avatar':
        case 'header':
        case 'profile':
        case 'hero':
            const heroImages = [s.image || profile?.image, s.image_secondary || s.secondary_image].filter(Boolean);
            return (
                <div className="relative overflow-hidden">
                    <div className="relative w-full aspect-[4/5] min-h-[580px] sm:min-h-[720px] overflow-hidden bg-[#050505] flex">
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
                            <div className="absolute top-0 right-0 w-[90%] h-full z-10">
                                <img src={heroImages[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800"} className="w-full h-full object-cover grayscale-[40%]" alt="Creator" />
                                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#050505]/80 to-[#050505]" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-15" />

                        <div className="relative z-20 w-full h-full flex flex-col justify-end p-8 sm:p-12 pb-20">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl mb-8">
                                    <Sparkles size={12} className="text-[#8b5cf6]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8b5cf6]">Elite Collective</span>
                                </div>
                                <h1 className="text-[clamp(40px,10vw,72px)] font-black tracking-tighter text-white mb-8 leading-[0.85] uppercase italic break-words">
                                    {s.title || profile?.title || "Signature Excellence"}
                                </h1>
                                <p className="text-[14px] text-white/40 max-w-[280px] font-medium leading-relaxed mb-12 uppercase tracking-widest italic">
                                    {s.bio || s.description || profile?.bio || "Crafting digital legacies."}
                                </p>
                                <div className="flex items-center gap-10">
                                    {['instagram', 'linkedin', 'youtube'].map(p => (
                                        <a key={p} href="#" className="text-white/20 hover:text-white transition-all transform hover:scale-125">
                                            <BrandIcon name={p} size={20} />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            );

        case 'link':
            const isFeatured = s.is_featured || s.is_Featured || false;
            return (
                <div className="px-6 sm:px-8">
                    <a 
                        href={s.location_url || s.url || "#"} 
                        className={cn(
                            "group w-full flex items-center justify-between p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] transition-all duration-700 shadow-2xl relative overflow-hidden",
                            isFeatured 
                                ? "bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] border-none scale-[1.02]" 
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
                         <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                            <div className={cn(
                                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all",
                                isFeatured ? "bg-white text-[#8b5cf6]" : "bg-white/5 text-white/20 group-hover:bg-[#8b5cf6] group-hover:text-white"
                            )}>
                                <ArrowUpRight size={20} className="sm:size-24" />
                            </div>
                            <div className="flex flex-col">
                                <span className={cn(
                                    "font-black text-[16px] sm:text-[18px] uppercase tracking-tighter group-hover:tracking-widest transition-all italic",
                                    isFeatured ? "text-white" : "text-white group-hover:italic"
                                )}>
                                    {s.name || s.title || "Experience"}
                                </span>
                                {(s.description || s.text) && (
                                    <span className={cn(
                                        "text-[9px] sm:text-[10px] uppercase tracking-widest mt-1",
                                        isFeatured ? "text-white/70" : "text-white/30 group-hover:text-white/60"
                                    )}>
                                        {s.description || s.text}
                                    </span>
                                )}
                            </div>
                         </div>
                         <ArrowRight size={20} className={cn(
                             "relative z-10 transition-all",
                             isFeatured ? "text-white" : "text-white/10 group-hover:text-white group-hover:translate-x-2"
                         )} />
                    </a>
                </div>
            );

        case 'link_grid_section':
        case 'links_grid':
            return (
                <div className="px-6 sm:px-8 grid grid-cols-2 gap-4">
                    {(blockItems.length > 0 ? blockItems : [
                        { n: 'Resources', i: Globe },
                        { n: 'Contact', i: Mail }
                    ]).map((item, i) => (
                        <a key={i} href={item.url || "#"} className="flex flex-col items-center justify-center p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-[#8b5cf6]/50 transition-all group aspect-square">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 group-hover:bg-[#8b5cf6] group-hover:text-white transition-all mb-4">
                                {item.i ? <item.i size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <span className="text-[12px] font-black uppercase tracking-widest text-white/80 group-hover:text-white text-center">{item.n || item.name || item.title}</span>
                        </a>
                    ))}
                </div>
            );

        case 'stats':
        case 'stats_section':
            return (
                <div className="px-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl">
                        {(blockItems.length > 0 ? blockItems : [
                            { value: '12', label: 'Years' },
                            { value: '$4M', label: 'Impact' },
                            { value: '800K', label: 'Network' },
                            { value: '250', label: 'Global' }
                        ]).slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="flex flex-col items-center text-center">
                                <div className="text-[#8b5cf6] mb-6 opacity-40">
                                    {i === 0 ? <Zap size={20} /> : i === 1 ? <DollarSign size={20} /> : i === 2 ? <Share2 size={20} /> : <ShoppingBag size={20} />}
                                </div>
                                <p className="text-[32px] font-black tracking-tighter text-white italic leading-none mb-3">{item.value}</p>
                                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] leading-tight">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className="px-8">
                    <div className={cn("grid gap-6", blockItems.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                        {(blockItems.length > 0 ? blockItems : [s]).map((item: any, i: number) => (
                            <div key={i} className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-white/5 group bg-[#050505] shadow-2xl">
                                <img src={item.image || item.url || s.image || s.url} className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-[1.5s] group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-700">
                                    <p className="text-white text-[14px] font-black uppercase italic tracking-widest">{item.title || "Visual Study"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'newsletter':
        case 'email_collector':
            return (
                <div className="px-8">
                    <div className="p-12 rounded-[4rem] bg-[#8b5cf6] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-[32px] font-black tracking-tighter text-white mb-4 uppercase italic leading-none">Join the Circle</h3>
                        <p className="text-[13px] text-white/70 mb-10 max-w-xs font-medium italic">Exclusive updates for the distinguished few.</p>
                        <div className="relative max-w-md">
                            <input type="email" placeholder="YOUR EMAIL" className="w-full h-16 bg-black/20 border border-white/10 rounded-2xl px-8 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:bg-black/40 transition-all uppercase tracking-widest font-black" />
                            <button className="absolute right-2 top-2 h-12 px-8 rounded-xl bg-white text-[#8b5cf6] text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Join</button>
                        </div>
                    </div>
                </div>
            );

        case 'contact_section':
            return (
                <div className="px-8">
                    <div className="p-10 rounded-[3.5rem] bg-white/[0.01] border border-white/5 backdrop-blur-3xl shadow-2xl">
                        <h3 className="text-[11px] font-black text-white/10 mb-10 uppercase tracking-[0.5em] italic">Private Communication</h3>
                        <div className="grid gap-6">
                            {[{ i: Mail, v: s.email || "concierge@studio.pro" }, { i: Phone, v: s.phone || "+1.LUX.0000" }].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#8b5cf6]/40 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]"><item.i size={20} /></div>
                                    <span className="text-[14px] font-black text-white italic tracking-tight">{item.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

        case 'spotify':
            return (
                <div className="px-8">
                    <div className="rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-black">
                        <iframe src={s.url?.replace('track/', 'embed/track/') || "https://open.spotify.com/embed/track/4PTG3C64LUUP9XzKyAFPr3"} width="100%" height="152" frameBorder="0" allow="encrypted-media" className="opacity-70 grayscale-[50%] hover:grayscale-0 transition-all duration-1000" />
                    </div>
                </div>
            );

        case 'divider':
            return (
                <div className="px-20 py-12 flex justify-center">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8b5cf6]/40 to-transparent shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
                </div>
            );

        case 'heading':
            return (
                <div className="px-8 pt-16 pb-8">
                    <h2 className="text-[32px] sm:text-[42px] font-black tracking-tighter text-white uppercase italic leading-none">{s.title || "Curated Series"}</h2>
                    <div className="w-20 h-2 bg-[#8b5cf6] mt-6 rounded-full" />
                </div>
            );

        case 'paragraph':
            return (
                <div className="px-8">
                    <p className="text-[16px] text-white/30 leading-relaxed font-medium italic tracking-wide">{s.text || s.description || "Defining the intersection of art and commerce."}</p>
                </div>
            );

        case 'countdown':
        case 'countdown_section':
        case 'urgency_offer_section':
            return (
                <div className="px-4 sm:px-8">
                    <div className="p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] bg-white/[0.02] border border-white/10 backdrop-blur-3xl text-center relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent opacity-50" />
                        <h3 className="text-[10px] sm:text-[12px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-6 sm:mb-10 italic">{s.title || "Elite Launch"}</h3>
                        <div className="flex justify-center gap-4 sm:gap-6">
                            {[
                                { v: '02', l: 'DAYS' }, { v: '14', l: 'HRS' }, { v: '45', l: 'MIN' }
                            ].map((t, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="text-[32px] sm:text-[42px] font-black tracking-tighter text-white italic leading-none mb-2">{t.v}</span>
                                    <span className="text-[8px] sm:text-[9px] font-black text-white/20 uppercase tracking-widest">{t.l}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 sm:mt-10 text-[10px] sm:text-[11px] text-white/40 font-medium italic tracking-wide">{s.description || "Limited access begins shortly."}</p>
                    </div>
                </div>
            );

        case 'services':
        case 'services_section':
            return (
                <div className="px-4 sm:px-8 space-y-6 sm:space-y-10">
                    <h2 className="text-[20px] sm:text-[24px] font-black tracking-tighter text-white uppercase italic leading-none pl-2 border-l-4 border-[#8b5cf6]">Premium Services</h2>
                    <div className="grid gap-3 sm:gap-4">
                        {(blockItems.length > 0 ? blockItems : [
                            { t: 'Branding', d: 'Visual Identity & Strategy', p: '$2k+' },
                            { t: 'Development', d: 'Full-stack Performance', p: '$5k+' }
                        ]).map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-[#8b5cf6]/30 transition-all group">
                                <div className="min-w-0 pr-4">
                                    <h4 className="text-[14px] sm:text-[16px] font-black text-white uppercase italic mb-1 truncate">{item.t}</h4>
                                    <p className="text-[10px] sm:text-[11px] text-white/30 font-medium truncate">{item.d}</p>
                                </div>
                                <span className="text-[12px] sm:text-[14px] font-black text-[#8b5cf6] shrink-0">{item.p}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'trust_badges':
        case 'trust_badges_section':
            return (
                <div className="px-4 sm:px-8">
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white/[0.01] border border-white/5 opacity-40 grayscale hover:opacity-100 transition-opacity">
                        {[
                            { i: ShieldCheck, l: 'SECURE' },
                            { i: Check, l: 'VERIFIED' },
                            { i: Star, l: 'ELITE' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 sm:gap-3">
                                <item.i size={14} className="text-[#8b5cf6]" />
                                <span className="text-[9px] font-black tracking-widest text-white">{item.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'testimonials':
        case 'testimonials_section':
        case 'testimonial_highlight_section':
            return (
                <div className="px-4 sm:px-8 space-y-6 sm:space-y-10">
                    <div className="space-y-3 pl-2 border-l-4 border-[#8b5cf6]">
                        <h2 className="text-[20px] sm:text-[24px] font-black tracking-tighter text-white uppercase italic leading-none">The Verdict</h2>
                        <p className="text-[10px] sm:text-[11px] text-white/30 font-medium uppercase tracking-[0.2em]">Praise from the inner circle</p>
                    </div>
                    <div className="grid gap-4 sm:gap-6">
                        {(blockItems.length > 0 ? blockItems : [
                            { n: 'Alexander R.', d: 'Global Director', t: '"Unparalleled aesthetic vision. A master of the digital craft."' },
                            { n: 'Sophia L.', d: 'Creative Lead', t: '"Redefining the boundaries of modern luxury in every pixel."' }
                        ]).map((item, i) => (
                            <div key={i} className="p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white/[0.02] border border-white/5 shadow-2xl relative group">
                                <div className="absolute top-8 left-8 text-[#8b5cf6] opacity-10">
                                    <Sparkles size={48} />
                                </div>
                                <p className="text-[15px] sm:text-[18px] font-medium text-white/80 italic leading-relaxed mb-8 relative z-10">{item.t || item.text || item.description}</p>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#8b5cf6]">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-black text-white uppercase italic">{item.n || item.name || item.title}</h4>
                                        <p className="text-[9px] text-white/30 font-medium uppercase tracking-widest">{item.d || item.subtitle || "Collaborator"}</p>
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
                <div className="px-6 sm:px-8 space-y-6">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] text-center block italic">Global Partners</span>
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 py-8 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                        {(item.logos || [
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732229.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732190.png' }
                        ]).map((logo: any, i: number) => (
                            <img key={i} src={logo.image} className="h-6 sm:h-8 w-auto object-contain transition-transform hover:scale-110" />
                        ))}
                    </div>
                </div>
            );

        case 'faq':
        case 'faq_section':
        case 'faq_cards_section':
            return (
                <div className="px-4 sm:px-8 space-y-8">
                    <h2 className="text-center text-[10px] sm:text-[11px] font-black text-white/20 uppercase tracking-[0.5em] italic">Intelligence / FAQ</h2>
                    <div className="space-y-3">
                        {(blockItems.length > 0 ? blockItems : [
                            { q: 'What is the vision?', a: 'To curate experiences that transcend the ordinary through meticulous design.' },
                            { q: 'How to collaborate?', a: 'Access is limited to select brands that align with our core aesthetic values.' }
                        ]).map((item, i) => (
                            <div key={i} className="p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-[#8b5cf6]/20 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-[13px] sm:text-[14px] font-black text-white uppercase italic tracking-tight">{item.q || item.title || item.question}</h4>
                                    <Plus size={16} className="text-[#8b5cf6] opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-[11px] sm:text-[12px] text-white/40 font-medium leading-relaxed italic">{item.a || item.text || item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
};

const BrandIcon = ({ name, size = 22 }: { name: string; size?: number }) => {
    const n = name?.toLowerCase() || "";
    if (n.includes('instagram')) return <i className="fab fa-instagram" style={{ fontSize: size }} />;
    if (n.includes('linkedin')) return <i className="fab fa-linkedin" style={{ fontSize: size }} />;
    if (n.includes('twitter') || n === 'x') return <i className="fab fa-x-twitter" style={{ fontSize: size }} />;
    if (n.includes('youtube')) return <Youtube size={size} />;
    if (n.includes('tiktok')) return <i className="fab fa-tiktok" style={{ fontSize: size }} />;
    if (n.includes('spotify')) return <i className="fab fa-spotify" style={{ fontSize: size }} />;
    return <Globe size={size} />;
};
