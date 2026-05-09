import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    ArrowUpRight, Share2, Globe, Mail, Instagram, Twitter, Linkedin, Youtube, Play
} from "lucide-react";
import { getUiTypeFromBlock } from "../builder-utils";

export function InstaMinimalLayout({ profile, tabs }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => b.is_enabled != 0 && b.is_active != 0 && b.is_Enabled != 0);

    return (
        <div className="w-full min-h-full bg-white text-zinc-900 font-sans px-8 py-20 flex flex-col items-center selection:bg-zinc-100">
            {/* Studio Header */}
            <div className="w-full max-w-[440px] mb-24 flex flex-col items-center text-center">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="w-20 h-20 rounded-none grayscale hover:grayscale-0 transition-all duration-1000 mb-12 border border-zinc-100 p-1 bg-zinc-50"
                >
                    <img 
                        src={profile?.image || "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"} 
                        className="w-full h-full object-cover" 
                    />
                </motion.div>
                
                <h1 className="text-[20px] font-black tracking-[0.5em] uppercase mb-4 leading-none pl-[0.5em]">
                    {profile?.title || "Studio Minimal"}
                </h1>
                
                <div className="w-8 h-[2px] bg-zinc-900 mb-8" />

                <p className="text-[11px] text-zinc-400 font-bold tracking-[0.3em] uppercase max-w-[280px] leading-relaxed">
                    {profile?.bio || "Aesthetic Clarity / Digital Design / Tokyo"}
                </p>
            </div>

            {/* Blocks */}
            <div className="w-full max-w-[440px] space-y-20">
                {allBlocks.map((block: any, idx: number) => (
                    <motion.div
                        key={block.id || idx}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                    >
                        {renderMinimalSection(block, profile)}
                    </motion.div>
                ))}
            </div>

            {/* Simple Footer */}
            <div className="mt-40 pb-20 opacity-20 hover:opacity-100 transition-opacity">
                <p className="text-[10px] tracking-[0.6em] uppercase font-black">© 2026 Studio Minimal</p>
            </div>
        </div>
    );
}

const renderMinimalSection = (block: any, profile: any) => {
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
                        "group block py-8 border-b border-zinc-100 flex items-center justify-between transition-all duration-700",
                        isFeatured ? "bg-zinc-900 px-6 -mx-6 text-white border-none my-4" : "hover:border-zinc-900"
                    )}
                >
                    <div className="flex flex-col gap-1">
                        <span className={cn(
                            "text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-700",
                            isFeatured ? "" : "group-hover:pl-4"
                        )}>
                            {s.title || s.name || "EXPLORE"}
                        </span>
                        {(s.description || s.text) && (
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest transition-all duration-700",
                                isFeatured ? "text-zinc-400" : "text-zinc-300 group-hover:pl-4"
                            )}>
                                {s.description || s.text}
                            </span>
                        )}
                    </div>
                    <ArrowUpRight size={16} className={cn(
                        "transition-colors",
                        isFeatured ? "text-white" : "text-zinc-200 group-hover:text-zinc-900"
                    )} />
                </a>
            );

        case 'link_grid_section':
        case 'links_grid':
            return (
                <div className="grid grid-cols-2 gap-[1px] bg-zinc-100 border border-zinc-100">
                    {(blockItems.length > 0 ? blockItems : [
                        { n: 'STUDIO', i: Globe },
                        { n: 'PRESS', i: Mail }
                    ]).map((item, i) => (
                        <a key={i} href={item.url || "#"} className="flex flex-col gap-8 p-8 bg-white hover:bg-zinc-50 transition-colors group">
                            <ArrowUpRight size={14} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
                            <span className="text-[11px] font-black uppercase tracking-[0.3em]">{item.n || item.name || item.title}</span>
                        </a>
                    ))}
                </div>
            );

        case 'link_carousel_section':
        case 'links_carousel':
            return (
                <div className="relative -mx-8">
                    <div className="flex gap-[1px] overflow-x-auto px-8 pb-4 no-scrollbar bg-zinc-100">
                        {(blockItems.length > 0 ? blockItems : [
                            { n: 'LATEST WORK', d: '2024' },
                            { n: 'ARCHIVE', d: '2020-2023' }
                        ]).map((item, i) => (
                            <a key={i} href={item.url || "#"} className="min-w-[200px] p-10 bg-white hover:bg-zinc-50 transition-colors group flex flex-col gap-12">
                                <span className="text-[40px] font-light text-zinc-100 group-hover:text-zinc-900 transition-colors">0{i+1}</span>
                                <div>
                                    <h4 className="text-[12px] font-black uppercase tracking-widest mb-1">{item.n || item.name || item.title}</h4>
                                    <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-[0.2em]">{item.d || item.description || "VIEW"}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className={cn("grid gap-4", blockItems.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                    {(blockItems.length > 0 ? blockItems : [s]).map((item: any, i: number) => (
                        <div key={i} className="bg-zinc-50 p-2 group relative overflow-hidden">
                            <img src={item.image || item.url} className="w-full aspect-[3/4] object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s] group-hover:scale-105" />
                        </div>
                    ))}
                </div>
            );

        case 'stats':
        case 'stats_section':
            return (
                <div className="grid grid-cols-2 gap-y-12 gap-x-16 py-12 border-y border-zinc-100">
                    {(blockItems.length > 0 ? blockItems : [
                        { value: '14k', label: 'Reach' },
                        { value: '08', label: 'Awards' }
                    ]).slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-3">
                            <span className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.4em]">{item.label}</span>
                            <span className="text-[32px] font-light tracking-tighter leading-none">{item.value}</span>
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
                        {(blockItems.length > 0 ? blockItems : [
                            { t: 'Art Direction', d: 'Visual Language', p: '01' },
                            { t: 'Development', d: 'Technical Logic', p: '02' }
                        ]).map((item, i) => (
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
                <div className="space-y-12 sm:space-y-20 py-12 border-y border-zinc-100">
                    <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] text-zinc-200">Testimonials</h3>
                    <div className="space-y-16 sm:space-y-24">
                        {(blockItems.length > 0 ? blockItems : [
                            { n: 'M. Chen', d: 'Architect', t: 'The definitive bio-link for modern creators. Minimal and powerful.' },
                            { n: 'E. Rossi', d: 'Artist', t: 'Visual clarity that respects the work. Truly exceptional.' }
                        ]).map((item, i) => (
                            <div key={i} className="flex flex-col gap-6 max-w-sm">
                                <p className="text-[18px] sm:text-[22px] font-light tracking-tight leading-tight text-zinc-900">"{item.t || item.text || item.description}"</p>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.n || item.name || item.title}</span>
                                    <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">{item.d || item.subtitle || "Client"}</span>
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
                <div className="space-y-12 sm:space-y-20 py-12">
                    <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.5em] text-zinc-200">Information</h3>
                    <div className="divide-y divide-zinc-100">
                        {(blockItems.length > 0 ? blockItems : [
                            { q: 'Project Scope', a: 'We focus on high-impact digital experiences and visual storytelling.' },
                            { q: 'Inquiry Process', a: 'All collaborations begin with a formal brief. Average response time is 48hrs.' }
                        ]).map((item, i) => (
                            <div key={i} className="py-8 sm:py-10 flex flex-col gap-4 group cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[13px] sm:text-[14px] font-black uppercase tracking-widest">{item.q || item.title || item.question}</h4>
                                    <ArrowUpRight size={14} className="text-zinc-200 group-hover:text-zinc-900 transition-colors" />
                                </div>
                                <p className="text-[11px] sm:text-[12px] text-zinc-400 font-medium leading-relaxed max-w-sm">{item.a || item.text || item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'newsletter':
        case 'email_collector':
            return (
                <div className="py-20 border-y border-zinc-100 flex flex-col items-center text-center">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] mb-12">Correspondence</h3>
                    <div className="w-full space-y-8">
                        <input 
                            type="email" 
                            placeholder="EMAIL ADDRESS" 
                            className="w-full bg-transparent border-b border-zinc-200 py-4 text-[11px] font-bold tracking-widest text-center focus:outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-200"
                        />
                        <button className="text-[10px] font-black uppercase tracking-[0.6em] hover:text-zinc-400 transition-colors pt-4">
                            Submit Inquiry
                        </button>
                    </div>
                </div>
            );

        case 'brands':
        case 'brands_section':
            return (
                <div className="py-12 border-y border-zinc-100">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 opacity-10 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
                        {(item.logos || [
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732221.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732229.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732190.png' },
                            { image: 'https://cdn-icons-png.flaticon.com/512/732/732230.png' }
                        ]).map((logo: any, i: number) => (
                            <div key={i} className="flex items-center justify-center">
                                <img src={logo.image} className="h-4 sm:h-5 w-auto object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'faq_section':
            return (
                <div className="space-y-12">
                    <h4 className="text-[10px] font-black text-zinc-200 uppercase tracking-[0.5em] mb-16">Inquiries</h4>
                    {[
                        { q: "Philosophy", a: "Reduction as a form of evolution." },
                        { q: "Execution", a: "Precision in every pixel." }
                    ].map((item, i) => (
                        <div key={i} className="group border-l border-zinc-100 pl-8 py-2 hover:border-zinc-900 transition-colors">
                            <h4 className="text-[12px] font-black uppercase tracking-widest mb-4 flex items-center justify-between">
                                {item.q}
                            </h4>
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium tracking-wide">{item.a}</p>
                        </div>
                    ))}
                </div>
            );

        case 'video':
        case 'youtube':
            return (
                <div className="aspect-video bg-zinc-50 p-2 relative group overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800" className="w-full h-full object-cover grayscale opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border border-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                            <Play size={20} />
                        </div>
                    </div>
                </div>
            );

        case 'divider':
            return (
                <div className="py-20 w-full flex justify-center">
                    <div className="h-[2px] w-12 bg-zinc-100" />
                </div>
            );

        case 'heading':
            return (
                <div className="pt-24 pb-8 border-b border-zinc-900">
                    <h2 className="text-[28px] font-black tracking-[-0.05em] uppercase leading-none">{s.title || "Archive 01"}</h2>
                </div>
            );

        case 'paragraph':
            return (
                <div className="py-4">
                    <p className="text-[13px] text-zinc-500 leading-relaxed font-medium tracking-wide max-w-[320px]">{s.text || s.description || "The pursuit of the essential through visual discipline."}</p>
                </div>
            );

        default:
            return null;
    }
};
