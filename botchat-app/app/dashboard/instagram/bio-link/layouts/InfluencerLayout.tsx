import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Youtube, Video, Image as ImageIcon, ChevronRight,
    Star, Mail, Phone, MessageCircle, ExternalLink,
    Play, Heart, Globe, GraduationCap, ArrowRight, Share2, Check
} from "lucide-react";

const BrandIcon = ({ name, size = 22 }: { name: string; size?: number }) => {
    if (!name) return <Globe size={size} />;
    switch (name.toLowerCase()) {
        case 'instagram':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-pink-500">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.169a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
            );
        case 'youtube':
            return <Youtube size={size} className="text-red-500" />;
        case 'tiktok':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
            );
        case 'twitter':
        case 'x':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        case 'spotify':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.2-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
            );
        case 'graduation-cap':
            return <GraduationCap size={size} className="text-indigo-500" />;
        default:
            return <Globe size={size} />;
    }
};

export function InfluencerLayout({ profile, tabs }: any) {
    const allBlocks = (tabs || []).flatMap((tab: any) =>
        (tab.sections || []).flatMap((sec: any) => sec.blocks || [])
    ).filter((b: any) => b.is_enabled != 0 && b.is_active != 0 && b.is_Enabled != 0);

    const settings = profile?.settings || {};
    const bgType = settings.backgroundType || settings.background_type;
    const bgValue = settings.background;

    const backgroundStyle = bgType === 'gradient'
        ? { background: bgValue }
        : { backgroundColor: bgValue && bgValue !== 'zero' ? bgValue : '#0a0a0a' };

    const accentColor = settings.accentColor || "#c026d3";
    const [copied, setCopied] = React.useState(false);

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${profile?.title || 'Bio'}`,
                    url
                });
                return;
            } catch (err) {
                console.log("Share failed:", err);
            }
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="w-full min-h-full text-white font-sans overflow-x-hidden pb-24 selection:bg-blue-500/30 flex flex-col relative"
            style={{ ...backgroundStyle }}
        >
            {/* Professional Clean Background */}
            <div className="absolute inset-0 pointer-events-none z-0" />

            <div className="relative z-10 w-full mx-auto">
                {/* Floating Share Button */}
                <div className="absolute top-6 right-6 z-50">
                    <button
                        onClick={handleShare}
                        className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-90 shadow-2xl"
                    >
                        {copied ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                    </button>
                </div>

                <div className="flex flex-col gap-10">
                    {allBlocks.map((block: any, idx: number) => (
                        <motion.div
                            key={block.id || idx}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.035 }}
                        >
                            {renderSection(block, accentColor)}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            {(settings.display_branding !== false) && (
                <div className="mt-28 pb-12 text-center">
                    <a
                        href={settings.branding?.url || "/"}
                        className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[3px] uppercase opacity-40 hover:opacity-70 transition-opacity"
                    >
                        <Globe size={12} />
                        {settings.branding?.text || "POWERED BY BIOSTUDIO"}
                    </a>
                </div>
            )}
        </div>
    );
}

const renderSection = (section: any, accentColor: string) => {
    const { type, settings, items } = section;
    const blockItems = items || settings?.items || [];
    const s = settings || {};

    switch (type) {
        case 'header_profile_section':
        case 'avatar':
            return (
                <div className="relative">
                    {/* Cover Image - Edge to Edge */}
                    <div className="h-64 rounded-b-[2.5rem] overflow-hidden relative shadow-2xl">
                        {s.cover_image ? (
                            <img src={s.cover_image} className="w-full h-full object-cover" alt="Cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-500 to-blue-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black" />
                    </div>

                    <div className="flex justify-center -mt-16 relative z-10">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-all duration-700" />

                            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-black shadow-2xl">
                                {s.avatar ? (
                                    <img src={s.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Avatar" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                        <Heart size={50} className="text-zinc-700" fill="currentColor" />
                                    </div>
                                )}
                            </div>

                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-emerald-400 to-cyan-400 w-9 h-9 rounded-xl border-[3px] border-black flex items-center justify-center">
                                <div className="bg-black rounded-lg w-5 h-5 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-6 px-6">
                        <div className="flex items-center justify-center gap-2 mb-0.5">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {s.title || s.name || "Your Name"}
                            </h1>
                            <div className="w-4.5 h-4.5 rounded-full bg-blue-500 flex items-center justify-center">
                                <Check size={10} className="text-white stroke-[4]" />
                            </div>
                        </div>
                        
                        <p className="text-zinc-500 text-sm font-medium mb-4">
                            {s.category || "Digital Creator"}
                        </p>

                        <p className="text-zinc-300 text-[15px] max-w-[320px] mx-auto leading-relaxed mb-8">
                            {s.bio || s.description || "Content Creator • Entrepreneur"}
                        </p>

                        {/* Instagram-style Stats Bar */}
                        <div className="flex justify-center items-center gap-10 py-5 border-y border-white/5">
                            <div className="text-center">
                                <p className="text-lg font-bold text-white">248</p>
                                <p className="text-xs text-zinc-500">Posts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-white">12.4K</p>
                                <p className="text-xs text-zinc-500">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-white">842</p>
                                <p className="text-xs text-zinc-500">Following</p>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'social_proof_section':
        case 'socials':
            return (
                <div className="px-4">
                    <div className="grid grid-cols-4 gap-3">
                        {blockItems.map((item: any, i: number) => (
                            <motion.a
                                key={i}
                                href={item.url}
                                target="_blank"
                                whileHover={{ y: -3 }}
                                className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2.5 group-hover:bg-white/10 transition-colors">
                                    <BrandIcon name={item.platform || item.name} size={20} />
                                </div>
                                <span className="font-bold text-[13px] tracking-tight">{item.followers || "12K"}</span>
                                <span className="text-[7px] text-zinc-500 uppercase font-bold tracking-widest mt-1 opacity-60">{item.platform}</span>
                            </motion.a>
                        ))}
                    </div>
                </div>
            );

        case 'featured_links_section':
        case 'link':
            const links = type === 'link' ? [section] : blockItems;
            return (
                <div className="px-4 space-y-3.5">
                    {type !== 'link' && <p className="uppercase text-[10px] tracking-[3px] text-zinc-500 pl-2 font-bold mb-1 opacity-60">Featured Content</p>}
                    {links.map((item: any, i: number) => {
                        const l = item.settings || item;
                        return (
                            <motion.a
                                key={i}
                                href={l.url || l.location_url}
                                target="_blank"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative flex items-center gap-4 bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 hover:border-blue-500/20 rounded-3xl p-4 transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-blue-400/30 transition-colors shrink-0">
                                    {l.icon ? <i className={`${l.icon} text-xl`} /> : <ArrowRight size={20} className="text-blue-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[15px] group-hover:text-blue-400 transition-colors truncate tracking-tight">{l.name || l.label}</h3>
                                    {l.description && <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{l.description}</p>}
                                </div>
                                <ChevronRight size={18} className="text-zinc-700 group-hover:text-white transition-colors" />
                            </motion.a>
                        );
                    })}
                </div>
            );        case 'content_grid_section':
        case 'image':
        case 'video':
            const mediaItems = type === 'content_grid_section' ? blockItems : [section];
            return (
                <div className="px-4">
                    {type === 'content_grid_section' && (
                        <div className="flex justify-between items-center mb-5 px-1">
                            <h2 className="uppercase text-[10px] tracking-[4px] text-zinc-500 font-bold">Grid</h2>
                            <span className="text-blue-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:opacity-70">View All <ArrowRight size={12} /></span>
                        </div>
                    )}
                    <div className="grid grid-cols-3 gap-1.5">
                        {mediaItems.map((item: any, i: number) => {
                            const m = item.settings || item;
                            const isLarge = type === 'content_grid_section' && i === -1; // No large ones in 3rd grid usually
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ opacity: 0.8 }}
                                    className={cn(
                                        "relative aspect-square overflow-hidden bg-zinc-900",
                                        isLarge ? "col-span-2 row-span-2" : ""
                                    )}
                                >
                                    {m.image || m.thumbnail ? (
                                        <img src={m.image || m.thumbnail} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            {type === 'video' ? <Play size={24} className="text-white/20" /> : <ImageIcon size={24} className="text-white/20" />}
                                        </div>
                                    )}
                                    
                                    {(type === 'video' || m.type === 'video' || m.location_url?.includes('youtube')) && (
                                        <div className="absolute top-2 right-2">
                                            <Play size={14} fill="white" className="text-white drop-shadow-lg" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            );

        case 'offers_section':
        case 'services':
        case 'paypal':
            const offerItems = (type === 'services' || type === 'paypal') ? [section] : blockItems;
            return (
                <div className="px-4">
                    <div className="flex items-center gap-3 px-1 mb-5">
                        <p className="uppercase text-[10px] tracking-[4px] text-zinc-500 font-bold">Exclusive Offers</p>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
                        {offerItems.map((item: any, i: number) => {
                            const o = item.settings || item;
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="min-w-[300px] snap-start bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-7 relative overflow-hidden shadow-2xl"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-3.5 py-1 text-[9px] font-bold tracking-[2px] bg-blue-500 text-white rounded-full">PREMIUM</span>
                                        <p className="text-xl font-bold text-white">{o.price ? `$${o.price}` : 'FREE'}</p>
                                    </div>
                                    <h3 className="text-lg font-bold leading-tight text-white mb-2">{o.name || o.title}</h3>
                                    <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed mb-8">{o.description || "Limited time offer for subscribers."}</p>
                                    <button className="w-full py-4 bg-white text-black rounded-2xl font-bold text-[11px] tracking-[2px] hover:bg-blue-500 hover:text-white transition-all uppercase active:scale-95 shadow-xl">
                                        {o.cta_text || "Get Access"}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
);

        case 'testimonials_section':
        case 'testimonials':
            return (
                <div className="px-4">
                    <div className="flex items-center gap-3 px-1 mb-6">
                        <p className="uppercase text-[10px] tracking-[4px] text-zinc-500 font-bold">Feedback</p>
                        <div className="h-[1px] flex-1 bg-white/5" />
                    </div>
                    <div className="space-y-4">
                        {blockItems.map((item: any, i: number) => (
                            <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-[2rem] p-6 shadow-xl">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, k) => (
                                        <Star key={k} size={11} fill={k < (item.rating || 5) ? "#3b82f6" : "none"} className={k < (item.rating || 5) ? "text-blue-500" : "text-zinc-800"} />
                                    ))}
                                </div>
                                <p className="text-zinc-300 text-[14px] leading-relaxed mb-6 opacity-90 italic">"{item.quote || item.description}"</p>
                                <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/10 bg-zinc-800">
                                        {item.avatar || item.image ? (
                                            <img src={item.avatar || item.image} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-600">
                                                {(item.name || "U")[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[14px] leading-none text-white">{item.name || item.author}</p>
                                        <p className="text-[10px] text-zinc-500 mt-1.5 uppercase font-bold tracking-widest">{item.role || "Verified Client"}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'faq_section':
        case 'faq':
            return (
                <div className="px-4">
                    <h2 className="uppercase text-xs tracking-[2px] text-zinc-500 font-bold pl-2 mb-4">FAQ</h2>
                    <div className="space-y-3">
                        {blockItems.map((item: any, i: number) => (
                            <details key={i} className="group bg-zinc-900/40 border border-white/5 rounded-[1.5rem] px-5 py-4 open:bg-zinc-900/70 transition-all shadow-lg">
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <span className="font-bold text-[15px] pr-4 leading-snug">{item.question}</span>
                                    <ChevronRight size={18} className="group-open:rotate-90 transition-transform text-zinc-600" />
                                </summary>
                                <p className="mt-3 text-zinc-400 text-sm leading-relaxed opacity-80">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            );

        case 'contact_section':
        case 'email_collector':
        case 'phone_collector':
        case 'contact_collector':
        case 'contact_form':
            return (
                <div className="px-1">
                    <div className="bg-gradient-to-br from-emerald-600/10 to-blue-500/10 border border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
                        <h2 className="text-2xl font-black tracking-tight">{s.title || "Let's Work Together"}</h2>
                        <p className="text-zinc-400 text-sm mt-2 mb-6 opacity-80">{s.description || "Open for collaborations"}</p>

                        <div className="flex justify-center gap-4">
                            {(s.email || s.items?.[0]?.email) && (
                                <a href={`mailto:${s.email || s.items?.[0]?.email}`} className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center hover:scale-110 transition-transform border border-white/10">
                                    <Mail size={22} className="text-white" />
                                </a>
                            )}
                            {(s.phone || s.items?.[0]?.phone) && (
                                <a href={`tel:${s.phone || s.items?.[0]?.phone}`} className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center hover:scale-110 transition-transform border border-white/10">
                                    <Phone size={22} className="text-white" />
                                </a>
                            )}
                            {s.whatsapp && (
                                <a href={`https://wa.me/${s.whatsapp}`} className="w-12 h-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center hover:scale-110 transition-transform border border-[#25D366]/20">
                                    <MessageCircle size={22} className="text-[#25D366]" />
                                </a>
                            )}
                        </div>

                        <button className="mt-8 w-full py-3.5 bg-white text-black rounded-xl font-black text-[11px] tracking-[2px] hover:bg-emerald-400 hover:text-white transition-all uppercase shadow-xl">
                            {s.button_text || "Send Message"}
                        </button>
                    </div>
                </div>
            );

        case 'spotify':
        case 'youtube':
        case 'tiktok_video':
            return (
                <div className="px-4">
                    <div className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/70">
                        <div className="aspect-video bg-black flex items-center justify-center">
                            {type === 'spotify' ? <BrandIcon name="spotify" size={80} /> : <Play size={70} className="text-white/30" />}
                        </div>
                        <div className="p-5 flex items-center gap-4">
                            <BrandIcon name={type === 'tiktok_video' ? 'tiktok' : type} size={28} />
                            <div>
                                <p className="font-bold capitalize">{type.replace('_', ' ')}</p>
                                <p className="text-xs text-zinc-500">Tap to open</p>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'heading':
            return (
                <div className="text-center px-4">
                    <h2 className="font-black text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                        {s.text}
                    </h2>
                </div>
            );

        case 'paragraph':
            return (
                <div className="px-6 text-center">
                    <p className="text-zinc-400 leading-relaxed">{s.description || s.text}</p>
                </div>
            );

        default:
            return null;
    }
};