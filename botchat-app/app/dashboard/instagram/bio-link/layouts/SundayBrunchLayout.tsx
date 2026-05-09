import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Heart, ShoppingBag, ArrowRight, Mail, Globe, Sparkles, Star, ChevronRight, User, Instagram, ShieldCheck, Plus
} from "lucide-react";
import { getUiTypeFromBlock } from "../builder-utils";

export function SundayBrunchLayout({ profile, tabs }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => b.is_active != 0 && b.is_Enabled != 0);

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
            <div className="mt-32 pb-12 opacity-30 text-center">
                <p className="text-[11px] tracking-[0.3em] uppercase font-black text-[#8c7e74]">EST. 2026 / BIOSTUDIO</p>
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
            return (
                <a 
                    href={s.url || s.location_url || "#"}
                    className={cn(
                        "group relative block p-6 sm:p-7 transition-all duration-500",
                        isFeatured 
                            ? "bg-white border-2 border-[#e8dccb] rounded-[2.5rem] shadow-[10px_10px_0px_#f3eee8] scale-[1.02]" 
                            : "bg-white border border-white hover:border-[#e8dccb] rounded-[2.2rem] shadow-[0_10px_30px_rgba(74,64,58,0.05)]"
                    )}
                >
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className={cn(
                            "w-12 h-12 sm:w-14 sm:h-14 rounded-[1.8rem] flex items-center justify-center overflow-hidden transition-all",
                            isFeatured ? "bg-[#fdfaf5] shadow-inner" : "bg-[#fdfaf5] shadow-inner group-hover:scale-105"
                        )}>
                            {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <Sparkles size={20} className="text-orange-200" />}
                        </div>
                        <div className="flex-1">
                            <h3 className={cn(
                                "text-[16px] font-bold tracking-tight",
                                isFeatured ? "text-[#2d241e] italic underline decoration-[#e8dccb] decoration-2 underline-offset-4" : "text-[#2d241e]"
                            )}>
                                {s.title || s.name || "Curated Find"}
                            </h3>
                            {(s.description || s.text) && (
                                <p className="text-[11px] sm:text-xs text-[#8c7e74] mt-1 font-medium italic">{s.description || s.text}</p>
                            )}
                        </div>
                        <div className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all",
                            isFeatured ? "bg-[#2d241e] text-white" : "bg-[#fdfaf5] text-[#8c7e74] group-hover:bg-[#4a403a] group-hover:text-white"
                        )}>
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </a>
            );

        case 'link_grid_section':
        case 'links_grid':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {(blockItems.length > 0 ? blockItems : [
                        { n: 'Studio Visit', i: Globe },
                        { n: 'Journal', i: Heart }
                    ]).map((item, i) => (
                        <a key={i} href={item.url || "#"} className="flex flex-col items-center gap-4 p-6 rounded-[2.5rem] bg-white/40 border border-[#f3eee8] hover:bg-white transition-all group">
                            <div className="w-12 h-12 rounded-full bg-[#fdfaf5] flex items-center justify-center text-[#8c7e74] group-hover:text-[#2d241e] transition-colors border border-dashed border-[#e8dccb]">
                                {item.i ? <item.i size={20} /> : <Sparkles size={20} />}
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-[#8c7e74] group-hover:text-[#2d241e]">{item.n || item.name || item.title}</span>
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
        case 'countdown_section':
        case 'urgency_offer_section':
            return (
                <div className="p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] bg-white border-4 border-[#f8f1e9] shadow-xl shadow-orange-100/20 flex flex-col items-center text-center">
                    <h3 className="text-[9px] sm:text-[10px] font-black text-[#8c7e74] uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-6 sm:mb-8 italic">{s.title || "Next Collection"}</h3>
                    <div className="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {[
                            { v: '03', l: 'DAYS' }, { v: '09', l: 'HRS' }, { v: '42', l: 'MIN' }
                        ].map((t, i) => (
                            <div key={i} className="flex flex-col items-center min-w-[50px] sm:min-w-[60px]">
                                <span className="text-2xl sm:text-3xl font-serif font-black text-[#2d241e] italic mb-1">{t.v}</span>
                                <span className="text-[7px] sm:text-[8px] font-black text-[#8c7e74] uppercase tracking-widest">{t.l}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-[#8c7e74] font-medium italic">{s.description || "Limited release drops soon."}</p>
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

        case 'heading':
            return (
                <div className="px-2 pt-12 pb-6 text-center">
                    <h2 className="text-[28px] font-serif font-black italic text-[#2d241e] leading-none">{s.title || "Selected Works"}</h2>
                    <div className="w-12 h-1 bg-[#e8dccb] mx-auto mt-6 rounded-full" />
                </div>
            );

        case 'paragraph':
            return (
                <div className="px-6 text-center">
                    <p className="text-[14px] text-[#8c7e74] leading-relaxed font-medium italic">{s.text || s.description || "Curating beauty in the small details, one day at a time."}</p>
                </div>
            );

        case 'divider':
            return (
                <div className="py-12 flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#e8dccb]" />
                    <div className="w-2 h-2 rounded-full bg-[#e8dccb] opacity-60" />
                    <div className="w-2 h-2 rounded-full bg-[#e8dccb] opacity-30" />
                </div>
            );

        default:
            return null;
    }
};
