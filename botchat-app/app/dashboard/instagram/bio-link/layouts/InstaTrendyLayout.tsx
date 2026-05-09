import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Youtube, Video, Image as ImageIcon, ChevronRight,
    Star, Mail, Phone, MessageCircle, ExternalLink,
    Play, Heart, Globe, GraduationCap, ArrowRight, Share2, Check,
    Sparkles, ArrowUpRight, ShieldCheck, Zap, Layers, Grid, ShoppingBag,
    User, DollarSign, Plus
} from "lucide-react";
import { getUiTypeFromBlock } from "../builder-utils";

export function InstaTrendyLayout({ profile, tabs }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => b.is_enabled != 0 && b.is_active != 0 && b.is_Enabled != 0);

    const settings = profile?.settings || {};
    const accentColor = profile?.accent_color || "#ff0080"; 

    return (
        <div className="w-full min-h-full bg-[#08080a] text-white font-sans overflow-x-hidden pb-24 selection:bg-[#ff0080]/30 flex flex-col relative">
            {/* Trendy Background - Interactive Mesh */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-gradient-to-br from-[#ff0080]/20 to-transparent blur-[120px] rounded-full" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.5, 1],
                        rotate: [0, -90, 0],
                        y: [0, 100, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7928ca]/20 blur-[100px] rounded-full" 
                />
            </div>

            <div className="relative z-10 w-full mx-auto px-5 sm:px-8">
                {/* Hero Section */}
                {(() => {
                    const heroBlock = allBlocks.find(b => ['header', 'avatar', 'profile', 'hero'].includes(getUiTypeFromBlock(b)));
                    const contentBlocks = allBlocks.filter(b => b.id !== heroBlock?.id);
                    
                    return (
                        <>
                            <div className="pt-24 pb-16 flex flex-col items-center text-center">
                                <motion.div 
                                    initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    className="relative mb-8"
                                >
                                    <div className="absolute inset-[-8px] bg-gradient-to-tr from-[#ff0080] via-[#7928ca] to-[#ff0080] rounded-[2.5rem] blur-md opacity-50 animate-pulse" />
                                    <div className="relative w-28 h-28 rounded-[2.2rem] border-2 border-white/20 overflow-hidden shadow-[0_20px_50px_rgba(255,0,128,0.3)]">
                                        <img 
                                            src={profile?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"} 
                                            className="w-full h-full object-cover" 
                                            alt="Profile" 
                                        />
                                    </div>
                                    <motion.div 
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -bottom-2 -right-2 px-3 py-1 bg-white text-black text-[10px] font-black rounded-full shadow-xl uppercase tracking-tighter"
                                    >
                                        Live ✨
                                    </motion.div>
                                </motion.div>

                                <motion.h1 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-[clamp(32px,8vw,48px)] font-black tracking-tighter mb-3 leading-none italic"
                                >
                                    {profile?.title || "Vibe Curator"}
                                </motion.h1>

                                <motion.p 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-[15px] text-white/40 max-w-[300px] font-medium leading-relaxed mb-10"
                                >
                                    {profile?.bio || "Creating content that pops. Tech, Lifestyle & Aesthetics."}
                                </motion.p>

                                <div className="flex items-center gap-6">
                                    {['instagram', 'tiktok', 'youtube'].map((p, i) => (
                                        <motion.div 
                                            key={p} 
                                            whileHover={{ y: -5, scale: 1.1 }}
                                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:bg-[#ff0080] hover:border-[#ff0080] transition-all cursor-pointer shadow-lg"
                                        >
                                            <BrandIcon name={p} size={20} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Blocks */}
                            <div className="flex flex-col gap-6">
                                {contentBlocks.map((block: any, idx: number) => (
                                    <motion.div
                                        key={block.id || idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        {renderTrendySection(block, accentColor, profile)}
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
    );
}

const renderTrendySection = (block: any, accentColor: string, profile: any) => {
    const type = getUiTypeFromBlock(block);
    const { settings, items } = block;
    const blockItems = items || settings?.items || [];
    const s = settings || {};

    switch (type) {
        case 'link':
            const isFeatured = s.is_featured || s.is_Featured || false;
            return (
                <motion.div 
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="group relative"
                >
                    {isFeatured ? (
                        <motion.div 
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -inset-1 bg-gradient-to-r from-[#ff0080] to-[#7928ca] rounded-[2.5rem] blur-2xl opacity-50"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ff0080] to-[#7928ca] rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
                    )}
                    <a 
                        href={s.url || "#"}
                        className={cn(
                            "relative block p-6 sm:p-7 rounded-[2rem] transition-all duration-500 overflow-hidden",
                            isFeatured 
                                ? "bg-black border-2 border-[#ff0080]" 
                                : "bg-white/[0.03] border border-white/10 backdrop-blur-2xl hover:border-[#ff0080]/50"
                        )}
                    >
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className={cn(
                                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center overflow-hidden border transition-all",
                                isFeatured ? "bg-[#ff0080] border-[#ff0080]" : "bg-white/5 border-white/10"
                            )}>
                                {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <Sparkles className={isFeatured ? "text-white" : "text-[#ff0080]"} size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                    "text-[16px] sm:text-[17px] font-black tracking-tight",
                                    isFeatured ? "text-white uppercase italic" : "text-white"
                                )}>
                                    {s.title || s.name || "New Project"}
                                </h3>
                                {(s.description || s.text) && (
                                    <p className="text-[11px] sm:text-[12px] text-white/40 mt-0.5 font-medium truncate">{s.description || s.text}</p>
                                )}
                            </div>
                            <div className={cn(
                                "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all",
                                isFeatured ? "bg-white text-black" : "bg-white/5 text-white/20 group-hover:bg-[#ff0080] group-hover:text-white"
                            )}>
                                <ArrowUpRight size={18} className="sm:size-20" />
                            </div>
                        </div>
                    </a>
                </motion.div>
            );

        case 'link_grid_section':
        case 'links_grid':
            return (
                <div className="grid grid-cols-3 gap-3">
                    {(blockItems.length > 0 ? blockItems : [
                        { n: 'Shop', i: ShoppingBag },
                        { n: 'Music', i: Sparkles },
                        { n: 'Chat', i: Mail }
                    ]).map((item, i) => (
                        <a key={i} href={item.url || "#"} className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group text-center">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#ff0080] group-hover:scale-110 transition-transform">
                                {item.i ? <item.i size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <span className="text-[10px] font-black uppercase text-white/60 group-hover:text-white truncate w-full">{item.n || item.name || item.title}</span>
                        </a>
                    ))}
                </div>
            );

        case 'link_carousel_section':
        case 'links_carousel':
            return (
                <div className="relative -mx-8">
                    <div className="flex gap-4 overflow-x-auto px-8 pb-4 no-scrollbar snap-x">
                        {(blockItems.length > 0 ? blockItems : [
                            { n: 'Exclusive Drop', d: 'Available Now' },
                            { n: 'Tour Dates', d: 'Book Tickets' },
                            { n: 'Merch Store', d: 'New Arrival' }
                        ]).map((item, i) => (
                            <a key={i} href={item.url || "#"} className="min-w-[200px] snap-center p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-[#ff0080]/50 transition-all group">
                                <div className="w-8 h-8 rounded-full bg-[#ff0080] flex items-center justify-center text-white mb-4 group-hover:rotate-45 transition-transform">
                                    <ArrowUpRight size={14} />
                                </div>
                                <h4 className="text-[14px] font-black text-white mb-1">{item.n || item.name || item.title}</h4>
                                <p className="text-[10px] text-white/40 font-bold uppercase">{item.d || item.description || item.subtitle || "Check it out"}</p>
                            </a>
                        ))}
                    </div>
                </div>
            );

        case 'stats':
        case 'stats_section':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {blockItems.slice(0, 4).map((item: any, i: number) => (
                        <motion.div 
                            key={i} 
                            whileHover={{ y: -5 }}
                            className={cn(
                                "p-6 rounded-[2.5rem] border flex flex-col items-center text-center",
                                i % 2 === 0 ? "bg-[#ff0080] border-[#ff0080] shadow-[0_15px_30px_rgba(255,0,128,0.2)]" : "bg-white/5 border-white/10"
                            )}
                        >
                            <p className="text-[28px] font-black leading-none mb-1">{item.value}</p>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">{item.label}</p>
                        </motion.div>
                    ))}
                </div>
            );

        case 'image':
            return (
                <div className={cn(
                    "grid gap-4",
                    blockItems.length > 1 ? "grid-cols-2" : "grid-cols-1"
                )}>
                    {(blockItems.length > 0 ? blockItems : [s]).map((item: any, i: number) => (
                        <motion.div 
                            key={i} 
                            whileHover={{ rotate: i % 2 === 0 ? 1 : -1 }}
                            className="rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 relative group shadow-2xl"
                        >
                            <img src={item.image || item.url || s.image || s.url} className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                {item.title && <p className="text-[12px] font-black uppercase tracking-widest">{item.title}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            );

        case 'video':
        case 'youtube':
        case 'ig_reels':
        case 'tiktok_video':
            const isVertical = type === 'ig_reels' || type === 'tiktok_video';
            return (
                <div className={cn(
                    "rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 relative group shadow-2xl mx-auto",
                    isVertical ? "aspect-[9/16] max-w-[280px]" : "aspect-video"
                )}>
                    <img src={s.thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800"} className="w-full h-full object-cover grayscale-[30%]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-20 h-20 rounded-full bg-[#ff0080]/30 backdrop-blur-xl border border-[#ff0080]/50 flex items-center justify-center shadow-2xl"
                        >
                            <Play size={28} fill="currentColor" />
                        </motion.div>
                    </div>
                </div>
            );

        case 'socials':
            return (
                <div className="flex items-center justify-center gap-8 py-6">
                    {blockItems.map((item: any, i: number) => (
                        <a key={i} href={item.url} target="_blank" className="text-white/20 hover:text-[#ff0080] transition-colors">
                            <BrandIcon name={item.platform || item.name} size={28} />
                        </a>
                    ))}
                </div>
            );

        case 'newsletter':
        case 'email_collector':
            return (
                <div className="relative p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl overflow-hidden group shadow-2xl">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff0080]/20 blur-[60px] rounded-full animate-pulse" />
                    <h3 className="text-[24px] font-black mb-2 italic tracking-tighter">Stay Connected</h3>
                    <p className="text-[13px] text-white/40 mb-8 font-medium leading-relaxed">{s.description || "Get the latest drops and trends first."}</p>
                    <div className="flex flex-col gap-3">
                        <input 
                            type="email" 
                            placeholder="your@email.com" 
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[14px] focus:outline-none focus:border-[#ff0080] transition-all placeholder:text-white/20"
                        />
                        <button className="h-14 w-full rounded-2xl bg-[#ff0080] text-white text-[14px] font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] active:scale-95 transition-all">
                            Join Now
                        </button>
                    </div>
                </div>
            );

        case 'spotify':
            return (
                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                    <iframe 
                        src={s.url?.replace('track/', 'embed/track/') || "https://open.spotify.com/embed/track/4PTG3C64LUUP9XzKyAFPr3"} 
                        width="100%" height="152" frameBorder="0" allow="encrypted-media"
                        className="opacity-80 hover:opacity-100 transition-opacity"
                    />
                </div>
            );

        case 'paypal':
            return (
                <a href={s.url || "#"} className="w-full flex items-center justify-center gap-5 p-8 rounded-[2.5rem] bg-[#ff0080]/10 border border-[#ff0080]/30 hover:bg-[#ff0080] transition-all group shadow-2xl">
                    <i className="fab fa-paypal text-[24px] text-[#ff0080] group-hover:text-white" />
                    <span className="font-black text-[16px] text-white uppercase tracking-widest leading-none">{s.title || "Vibe Support"}</span>
                </a>
            );

        case 'vcard':
            return (
                <div className="relative p-10 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#7928ca]/20 blur-[60px] rounded-full" />
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-[#ff0080] to-[#7928ca] flex items-center justify-center shadow-2xl mb-6">
                            <User size={32} className="text-white" />
                        </div>
                        <h3 className="text-[20px] font-black text-white italic tracking-tighter mb-2">{s.name || "Networking"}</h3>
                        <p className="text-[11px] text-white/40 uppercase tracking-[0.3em] font-black mb-8">Save Contact</p>
                        <button className="h-12 px-10 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                            Add to Contacts
                        </button>
                    </div>
                </div>
            );

        case 'portfolio_section':
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[20px] font-black uppercase tracking-tighter italic text-[#ff0080]">Selected Works</h2>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">See all</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400",
                            "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400",
                            "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400",
                            "https://images.unsplash.com/photo-1558655146-d09347e92766?w=400"
                        ].map((url, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                                className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-white/5 shadow-2xl"
                            >
                                <img src={url} className="w-full h-full object-cover" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            );

        case 'brands_section':
            return (
                <div className="py-10 border-y border-white/5 flex flex-col items-center">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">Collaborations</p>
                    <div className="flex flex-wrap items-center justify-center gap-10 opacity-30 grayscale invert px-6">
                        {['VOGUE', 'VICE', 'DAZED', 'i-D', 'HYPEBEAST'].map(brand => (
                            <span key={brand} className="text-[14px] font-black tracking-[0.1em]">{brand}</span>
                        ))}
                    </div>
                </div>
            );

        case 'heading':
            return (
                <div className="px-2 pt-12 pb-6">
                    <h2 className="text-[clamp(28px,6vw,42px)] font-black tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent uppercase italic leading-none">{s.title || "The Vibe"}</h2>
                    <div className="w-16 h-1.5 bg-[#ff0080] mt-4 rounded-full" />
                </div>
            );

        case 'paragraph':
            return (
                <div className="px-2">
                    <p className="text-[15px] text-white/40 leading-relaxed font-medium">{s.text || s.description || "Digital curator based in Tokyo. Exploring the intersection of fashion, technology, and aesthetic living."}</p>
                </div>
            );

        case 'divider':
            return (
                <div className="py-12 flex justify-center">
                    <div className="w-32 h-[3px] bg-gradient-to-r from-transparent via-[#ff0080] to-transparent rounded-full shadow-[0_0_15px_rgba(255,0,128,0.5)]" />
                </div>
            );

        case 'countdown':
        case 'countdown_section':
        case 'urgency_offer_section':
            return (
                <div className="relative p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white/[0.03] border border-[#ff0080]/30 backdrop-blur-3xl overflow-hidden shadow-[0_0_50px_rgba(255,0,128,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#ff0080] shadow-[0_0_15px_#ff0080]" />
                    <h3 className="text-[10px] sm:text-[12px] font-black text-white/40 uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-6 sm:mb-8 text-center italic">{s.title || "Drop Incoming"}</h3>
                    <div className="flex justify-center gap-3 sm:gap-5">
                        {[
                            { v: '05', l: 'DAYS' }, { v: '12', l: 'HRS' }, { v: '33', l: 'MIN' }
                        ].map((t, i) => (
                            <div key={i} className="flex flex-col items-center min-w-[60px] sm:min-w-[70px]">
                                <span className="text-[36px] sm:text-[48px] font-black tracking-tighter text-white italic leading-none mb-2">{t.v}</span>
                                <span className="text-[7px] sm:text-[8px] font-black text-[#ff0080] uppercase tracking-widest">{t.l}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'services':
        case 'services_section':
            return (
                <div className="space-y-4 sm:space-y-6">
                    <h2 className="text-[18px] sm:text-[20px] font-black tracking-tight bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent uppercase italic">The Menu</h2>
                    <div className="grid gap-2 sm:gap-3">
                        {(blockItems.length > 0 ? blockItems : [
                            { t: 'Content Strategy', d: 'Growth & Aesthetics', p: '$$' },
                            { t: 'Visual Design', d: 'UI/UX for Creators', p: '$$$' }
                        ]).map((item, i) => (
                            <div key={i} className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#ff0080] transition-all flex items-center justify-between group shadow-xl">
                                <div className="min-w-0 pr-4">
                                    <h4 className="text-[14px] sm:text-[16px] font-black text-white italic truncate">{item.t}</h4>
                                    <p className="text-[10px] sm:text-[11px] text-white/30 font-medium truncate">{item.d}</p>
                                </div>
                                <Zap size={18} className="text-white/10 group-hover:text-[#ff0080] transition-colors shrink-0" />
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'trust_badges':
        case 'trust_badges_section':
            return (
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 py-6 sm:py-8 px-4 sm:px-6 bg-white/[0.02] rounded-[1.5rem] sm:rounded-[2rem] border border-white/5 grayscale opacity-30 hover:opacity-100 transition-all">
                    {[Zap, ShieldCheck, Heart].map((Icon, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Icon size={12} className="text-[#ff0080]" />
                            <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-white uppercase">Vibe Verified</span>
                        </div>
                    ))}
                </div>
            );

        case 'testimonials':
        case 'testimonials_section':
        case 'testimonial_highlight_section':
            return (
                <div className="space-y-6 sm:space-y-8">
                    <h2 className="text-[18px] sm:text-[20px] font-black tracking-tight bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent uppercase italic">Shoutouts</h2>
                    <div className="grid gap-4">
                        {(blockItems.length > 0 ? blockItems : [
                            { n: 'Jade W.', d: 'Stylist', t: '"The only bio-link that actually matches my aesthetic. Absolute vibe."' },
                            { n: 'Leo K.', d: 'Musician', t: '"Sleek, fast, and looks incredible on mobile. Highly recommend."' }
                        ]).map((item, i) => (
                            <div key={i} className="p-6 sm:p-8 rounded-[2rem] bg-white/[0.02] border border-white/10 hover:border-[#ff0080]/50 transition-all relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#ff0080]/30" />
                                <p className="text-[14px] sm:text-[16px] text-white/70 italic leading-relaxed mb-6 font-medium">"{item.t || item.text || item.description}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#ff0080]">
                                        <Heart size={14} className="fill-current" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{item.n || item.name || item.title}</h4>
                                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{item.d || item.subtitle || "Community Member"}</p>
                                    </div>
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
                <div className="space-y-8">
                    <div className="text-center">
                        <span className="text-[10px] font-black text-[#ff0080] uppercase tracking-[0.4em] mb-4 block">Quick Intel</span>
                        <h2 className="text-[24px] font-black tracking-tighter text-white uppercase italic">FAQ</h2>
                    </div>
                    <div className="space-y-2">
                        {(blockItems.length > 0 ? blockItems : [
                            { q: 'Is this limited?', a: 'Only 50 memberships available per drop. Stay tuned for the next release.' },
                            { q: 'What is the utility?', a: 'Full access to the digital ecosystem and exclusive community events.' }
                        ]).map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[13px] sm:text-[14px] font-black text-white italic">{item.q || item.title || item.question}</h4>
                                    <Plus size={16} className="text-[#ff0080] group-hover:rotate-90 transition-transform" />
                                </div>
                                <p className="text-[11px] sm:text-[12px] text-white/30 font-medium leading-relaxed">{item.a || item.text || item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
};

const BrandIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
    switch (name.toLowerCase()) {
        case 'instagram': return <i className="fab fa-instagram" style={{ fontSize: size }} />;
        case 'twitter':
        case 'x': return <i className="fab fa-x-twitter" style={{ fontSize: size }} />;
        case 'linkedin': return <i className="fab fa-linkedin" style={{ fontSize: size }} />;
        case 'tiktok': return <i className="fab fa-tiktok" style={{ fontSize: size }} />;
        case 'youtube': return <i className="fab fa-youtube" style={{ fontSize: size }} />;
        case 'facebook': return <i className="fab fa-facebook" style={{ fontSize: size }} />;
        default: return <Globe size={size} />;
    }
};
