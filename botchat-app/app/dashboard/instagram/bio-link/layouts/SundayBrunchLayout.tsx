import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Heart, ShoppingBag, ArrowRight, Mail, Globe, Sparkles, Star, ChevronRight, User, Instagram, ShieldCheck, Plus, ArrowUpRight
} from "lucide-react";
import { getUiTypeFromBlock } from "../builder-utils";

export function SundayBrunchLayout({ profile, tabs }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => b.is_enabled != 0 && b.is_active != 0 && b.is_Enabled != 0);

    return (
        <div className="w-full min-h-full bg-[#fdfaf5] text-[#4a403a] font-sans px-6 py-16 flex flex-col items-center selection:bg-[#e8dccb] relative">
            {/* Organic Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f8f1e9] rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-20 left-0 w-48 h-48 bg-[#fdf3e7] rounded-full blur-[80px] pointer-events-none -translate-x-1/2" />

            {/* Header */}
            <div className="w-full max-w-[420px] mb-16 flex flex-col items-center text-center relative z-10">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    className="w-28 h-28 rounded-[3rem] bg-white p-2 mb-8 shadow-[0_20px_50px_rgba(74,64,58,0.1)] border-4 border-[#f8f1e9]"
                >
                    <img 
                        src={profile?.image || "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=400"} 
                        className="w-full h-full rounded-[2.5rem] object-cover" 
                    />
                </motion.div>
                
                <h1 className="text-3xl font-serif font-black tracking-tight text-[#2d241e] mb-3 italic">
                    {profile?.title || "Handcrafted Life"}
                </h1>
                
                <p className="text-sm text-[#8c7e74] font-medium max-w-[280px] leading-relaxed italic">
                    {profile?.bio || "Living for slow mornings, good coffee, and organic design."}
                </p>

                <div className="flex gap-6 mt-10">
                    {['instagram', 'mail', 'globe'].map((p, i) => (
                        <motion.div key={i} whileHover={{ y: -3 }} className="text-[#8c7e74] hover:text-[#4a403a] transition-colors cursor-pointer">
                            {p === 'instagram' ? <Instagram size={18} /> : p === 'mail' ? <Mail size={18} /> : <Globe size={18} />}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Blocks */}
            <div className="w-full max-w-[420px] space-y-8 relative z-10">
                {allBlocks.map((block: any, idx: number) => (
                    <motion.div
                        key={block.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        {renderBrunchSection(block, profile)}
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
    const blockItems = items || settings?.items || [];
    const s = settings || {};

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
                            ? "p-6 sm:p-7 bg-white border-2 border-[#2d241e] rounded-[2rem] shadow-[8px_8px_0px_#2d241e] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_#2d241e] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[4px_4px_0px_#2d241e]" 
                            : "p-5 bg-white border border-[#2d241e] rounded-[1.5rem] shadow-[4px_4px_0px_#2d241e] hover:shadow-[6px_6px_0px_#2d241e] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#2d241e]"
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
                        return (
                            <motion.a 
                                key={i} 
                                href={l.url || l.location_url || "#"}
                                whileHover={{ scale: 1.01 }}
                                className="block w-full p-5 bg-[#2d241e] border-2 border-[#2d241e] rounded-[1.8rem] shadow-[6px_6px_0px_rgba(45,36,30,0.2)] hover:shadow-[8px_8px_0px_rgba(45,36,30,0.2)] transition-all group"
                            >
                                <div className="flex items-center justify-center text-center">
                                    <span className="text-[14px] font-black uppercase tracking-[0.2em] text-white">
                                        {l.title || l.name || l.label}
                                    </span>
                                </div>
                            </motion.a>
                        );
                    })}
                </div>
            );

        case 'link_carousel_section':
        case 'links_carousel':
            return (
                <div className="relative -mx-8">
                    <div className="flex gap-4 overflow-x-auto px-8 pb-4 no-scrollbar snap-x">
                        {(blockItems.length > 0 ? blockItems : [
                            { n: 'Autumn Collection', d: 'View Gallery' },
                            { n: 'Bespoke Orders', d: 'Inquire' }
                        ]).map((item, i) => (
                            <a key={i} href={item.url || "#"} className="min-w-[220px] snap-center p-8 rounded-[3rem] bg-white border border-[#f3eee8] shadow-sm hover:shadow-md transition-all group">
                                <div className="text-[#e8dccb] mb-4 group-hover:translate-x-1 transition-transform">
                                    <ArrowRight size={24} />
                                </div>
                                <h4 className="text-[15px] font-serif font-black italic text-[#2d241e] mb-1">{item.n || item.name || item.title}</h4>
                                <p className="text-[10px] text-[#8c7e74] font-black uppercase tracking-widest">{item.d || item.description || "Collection"}</p>
                            </a>
                        ))}
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className={cn("grid gap-4", blockItems.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {(blockItems.length > 0 ? blockItems : [s]).map((item: any, i: number) => (
                        <div key={i} className="rounded-[2.5rem] overflow-hidden shadow-xl shadow-orange-100/30 border-[6px] border-white relative group">
                            <img src={item.image || item.url} className="w-full aspect-[4/5] object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-[#4a403a]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Heart size={24} className="text-white fill-current" />
                            </div>
                        </div>
                    ))}
                </div>
            );

        case 'stats':
        case 'stats_section':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {(blockItems.length > 0 ? blockItems : [
                        { value: '5k', label: 'Followers' },
                        { value: '12', label: 'Projects' }
                    ]).slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className={cn(
                            "p-8 rounded-[3rem] flex flex-col items-center text-center",
                            i % 2 === 0 ? "bg-[#f8f1e9] shadow-sm" : "bg-white border border-[#f3eee8]"
                        )}>
                            <span className="text-2xl font-serif font-black text-[#2d241e] mb-1 italic">{item.value}</span>
                            <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-[0.2em]">{item.label}</span>
                        </div>
                    ))}
                </div>
            );

        case 'countdown':
        case 'social_medias_section':
        case 'socials':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {blockItems.map((item: any, i: number) => (
                        <motion.a
                            key={i}
                            href={item.url || "#"}
                            target="_blank"
                            whileHover={{ y: -2 }}
                            className="flex items-center justify-center gap-3 p-4 bg-white border border-[#2d241e] rounded-2xl shadow-[4px_4px_0px_#2d241e] hover:shadow-[6px_6px_0px_#2d241e] transition-all"
                        >
                            <span className="text-[12px] font-black uppercase tracking-widest text-[#2d241e]">{item.platform}</span>
                        </motion.a>
                    ))}
                </div>
            );

        case 'portfolio_section':
        case 'portfolio_minimal_section':
        case 'content_grid_section':
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-[#2d241e] italic">
                            {s.title || "Selected Works"}
                        </h3>
                        <span className="text-[10px] font-bold text-[#8c7e74] uppercase tracking-widest border-b border-[#e8dccb] pb-0.5">View All</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {(blockItems.length > 0 ? blockItems : [
                            { url: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?w=400' },
                            { url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400' },
                            { url: 'https://images.unsplash.com/photo-1515514756003-246e74640161?w=400' },
                            { url: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=400' }
                        ]).map((item: any, i: number) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ scale: 0.98 }}
                                className="rounded-[2rem] overflow-hidden border-2 border-[#2d241e] shadow-[4px_4px_0px_#2d241e] bg-white group relative aspect-[4/5]"
                            >
                                <img src={item.image || item.url || item.thumbnail} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700" />
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
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white rounded-full blur-3xl" />
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
                            <div key={i} className="p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-[#f3eee8] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
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
            return (
                <div className="space-y-6 sm:space-y-8">
                    <div className="text-center px-4">
                        <span className="text-[10px] font-black text-[#8c7e74] uppercase tracking-[0.4em] mb-3 block">Kind Words</span>
                        <h2 className="text-[22px] font-serif font-black italic text-[#2d241e]">Community Stories</h2>
                    </div>
                    <div className="grid gap-6">
                        {(blockItems.length > 0 ? blockItems : [
                            { n: 'Clara M.', d: 'Baker', t: '"The simplicity of this layout is exactly what my brand needed. So warm."' },
                            { n: 'Thomas B.', d: 'Artisan', t: '"Finally a bio-link that doesn\'t feel like a tech company. Pure soul."' }
                        ]).map((item, i) => (
                            <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-[#f3eee8] shadow-sm relative group italic">
                                <p className="text-[14px] sm:text-[15px] text-[#4a403a] leading-relaxed mb-6">"{item.t || item.text || item.description}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#fdfaf5] border border-[#f3eee8] flex items-center justify-center text-[#8c7e74]">
                                        <Heart size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-bold text-[#2d241e]">{item.n || item.name || item.title}</h4>
                                        <p className="text-[9px] text-[#8c7e74] font-medium uppercase tracking-widest">{item.d || item.subtitle || "Customer"}</p>
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
        case 'email_collector':
            return (
                <div className="p-10 rounded-[3.5rem] bg-[#f8f1e9] border-4 border-white shadow-2xl shadow-orange-100/40 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#2d241e] mb-8 shadow-sm">
                        <Mail size={24} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-serif font-black italic text-[#2d241e] mb-3">Sunday Letters</h3>
                    <p className="text-xs text-[#8c7e74] font-medium mb-10 leading-relaxed italic px-4">{s.description || "Thoughtful updates and quiet inspiration for your week ahead."}</p>
                    <div className="w-full space-y-4">
                        <input type="email" placeholder="YOUR EMAIL ADDRESS" className="w-full h-14 bg-white border border-transparent rounded-3xl px-6 text-[13px] focus:outline-none focus:border-[#e8dccb] transition-all text-center tracking-tight" />
                        <button className="w-full h-14 bg-[#4a403a] text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-[#2d241e] transition-all shadow-lg shadow-orange-900/10">Subscribe</button>
                    </div>
                </div>
            );

        case 'testimonials_section':
            return (
                <div className="p-10 rounded-[3rem] bg-white border border-[#f3eee8] shadow-sm relative text-center">
                    <Star className="text-[#e8dccb] mx-auto mb-6" size={24} fill="currentColor" />
                    <p className="text-[15px] text-[#4a403a] italic leading-relaxed mb-8 px-2 font-medium">
                        "{s.text || "Such a peaceful way to showcase my collection. The design feels like a soft breath of air."}"
                    </p>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#fdfaf5] mb-3 shadow-md">
                            <img src="https://i.pravatar.cc/100?u=sunday" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-bold text-[#2d241e]">{s.author || "Alice Rivers"}</p>
                        <p className="text-[10px] text-[#8c7e74] font-black uppercase tracking-widest mt-1">Artisan</p>
                    </div>
                </div>
            );

        case 'cta_section':
        case 'impact_section':
        case 'contact_section':
        case 'contact_form':
        case 'contact_collector':
            return (
                <div className="p-8 sm:p-10 rounded-[3rem] bg-white border-2 border-[#2d241e] shadow-[10px_10px_0px_#2d241e] flex flex-col items-center text-center">
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
            return (
                <div className="space-y-6">
                    <div className="text-center">
                        <span className="text-[9px] font-black text-[#8c7e74] uppercase tracking-[0.4em] italic mb-2 block">Exclusive Access</span>
                        <h2 className="text-[24px] font-serif font-black italic text-[#2d241e]">Curated Offers</h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar snap-x px-2">
                        {(blockItems.length > 0 ? blockItems : [
                            { t: 'Digital Guide', d: 'Slow Living Blueprint', p: '$49' },
                            { t: 'Artisan Pack', d: 'Texture & Light Presets', p: '$129' }
                        ]).map((item: any, i: number) => (
                            <div key={i} className="min-w-[280px] snap-center p-8 rounded-[2.5rem] bg-white border-2 border-[#2d241e] shadow-[6px_6px_0px_#2d241e] flex flex-col">
                                <span className="text-[10px] font-black text-[#e8dccb] uppercase tracking-widest mb-2 italic">Offer {i + 1}</span>
                                <h4 className="text-[18px] font-black text-[#2d241e] mb-1 italic leading-tight">{item.title || item.t}</h4>
                                <p className="text-[12px] text-[#8c7e74] font-medium italic mb-8">{item.description || item.d}</p>
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
                <div className="p-2 bg-white border border-[#f3eee8] rounded-[3rem] shadow-sm overflow-hidden group aspect-video relative">
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
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white border border-[#f3eee8] flex items-center justify-center text-[#e8dccb] group-hover:rotate-12 transition-transform">
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
                    <button className="px-8 py-3 bg-white text-[#2d241e] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Join Discord</button>
                </div>
            );

        case 'donation_section':
        case 'support':
            return (
                <div className="p-12 text-center bg-white border border-[#f3eee8] rounded-[4rem] shadow-sm">
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
