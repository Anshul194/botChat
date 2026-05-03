import React from "react";
import { cn } from "@/lib/utils";
import { Instagram, Mail, Globe, ArrowUpRight, Youtube, Share2, Play, Sparkles, SmartphoneNfc } from "lucide-react";

const isBgLight = (color: string) => {
    const hex = color.replace('#', '');
    if (hex.length < 6) return false;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
};

export const UGCLayout = ({
    theme,
    profile,
    otherBlocks,
    topAvatar,
    instagramUsername,
    getUiTypeFromBlock,
    uiTypeOverrides,
    isMediaType,
    renderBlockUI
}: any) => {
    const mediaBlocks = otherBlocks.filter((b: any) => isMediaType(getUiTypeFromBlock(b, uiTypeOverrides)));
    const linkBlocks = otherBlocks.filter((b: any) => !isMediaType(getUiTypeFromBlock(b, uiTypeOverrides)));

    const isDark = !isBgLight(theme?.bgStyle?.background || "#ffffff");
    const textColor = theme?.textColor || (isDark ? "#ffffff" : "#4d0a2d");
    const accent = theme?.accent || "#f43f5e";

    return (
        <div className="flex flex-col min-h-full w-full font-serif overflow-x-hidden selection:bg-pink-100 selection:text-pink-900" style={{ backgroundColor: theme?.bgStyle?.background || '#fff5f7', color: textColor }}>
            
            {/* ── Header ── */}
            <header className="px-6 py-6 sm:py-10 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-xl animate-pulse">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] opacity-60">Elite Media Kit</span>
                </div>
                <div className="flex items-center gap-4 sm:gap-8">
                    <button className="hidden sm:inline text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Portfolio</button>
                    <button className="px-6 py-2.5 sm:px-10 sm:py-4 rounded-full bg-pink-900 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
                        Let's Work
                    </button>
                </div>
            </header>

            {/* ── Hero ── */}
            <section className="px-6 py-12 sm:py-32 max-w-7xl mx-auto w-full relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 sm:space-y-12 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-pink-100 text-[10px] font-black uppercase tracking-widest text-pink-500">
                             <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                             Available for Q3 Projects
                        </div>
                        <h1 className="text-5xl sm:text-7xl lg:text-9xl font-serif italic text-pink-900 leading-[0.9] tracking-tighter">
                            Aesthetic <br /> 
                            <span className="text-pink-500">Authority.</span>
                        </h1>
                        <p className="text-sm sm:text-xl opacity-60 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Creating high-conversion, editorial content for brands that value visual excellence and strategic storytelling.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6">
                            {[Instagram, Youtube, Mail, Share2].map((Icon, i) => (
                                <div key={i} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white border border-pink-50 flex items-center justify-center text-pink-900 hover:bg-pink-500 hover:text-white hover:-translate-y-1 transition-all shadow-lg cursor-pointer">
                                    <Icon size={20} className="sm:w-6 sm:h-6" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative group mx-auto lg:ml-auto max-w-md w-full">
                        <div className="absolute -inset-4 bg-pink-500/10 rounded-[60px] blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                        <div className="aspect-[4/5] rounded-[50px] sm:rounded-[80px] overflow-hidden border-[12px] border-white shadow-2xl relative z-10 rotate-2 group-hover:rotate-0 transition-transform duration-700">
                             <img src={profile?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Metrics ── */}
            <section className="px-6 py-16 sm:py-32 bg-white/40 border-y border-pink-50">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-16">
                    {[
                        { val: "124k", label: "Global Reach" },
                        { val: "8.2%", label: "Engagement" },
                        { val: "15M+", label: "Impressions" },
                        { val: "250+", label: "Brand Collabs" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center group">
                            <p className="text-3xl sm:text-6xl font-black text-pink-900 group-hover:text-pink-500 transition-colors tracking-tighter">{stat.val}</p>
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mt-2 opacity-40">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Philosophy ── */}
            <section className="px-6 py-20 sm:py-48 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 sm:gap-32 items-center">
                <div className="space-y-12 sm:space-y-16">
                    <div className="space-y-6 text-center lg:text-left">
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500">Philosophy</p>
                        <h2 className="text-4xl sm:text-7xl lg:text-8xl font-serif italic text-pink-900 leading-[0.85] tracking-tighter">Impact <br /> Over <br /> Impressions.</h2>
                    </div>
                    <div className="space-y-10 sm:space-y-12">
                        {[
                            { title: "Curation", desc: "Expertly selected visuals that mirror your brand's unique soul and values." },
                            { title: "Execution", desc: "Professional lighting, high-end styling, and seamless post-production delivery." },
                            { title: "Delivery", desc: "Content designed to convert, build community, and drive high-intent actions." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 sm:gap-8 group">
                                <span className="text-3xl sm:text-5xl font-black text-pink-100 group-hover:text-pink-500 transition-colors duration-500">0{i+1}</span>
                                <div className="space-y-2 pt-1">
                                    <h3 className="text-xl sm:text-2xl font-black text-pink-900">{item.title}</h3>
                                    <p className="text-sm sm:text-lg opacity-50 leading-relaxed max-w-md">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 relative z-10">
                        <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600" className="w-full aspect-[3/4] object-cover rounded-[30px] sm:rounded-[50px] shadow-2xl border-4 border-white mt-12" />
                        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" className="w-full aspect-[3/4] object-cover rounded-[30px] sm:rounded-[50px] shadow-2xl border-4 border-white" />
                    </div>
                </div>
            </section>

            {/* ── Testimonial ── */}
            <section className="px-6 py-24 sm:py-56 bg-pink-500 text-white relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="max-w-5xl mx-auto space-y-12 sm:space-y-20 relative z-10 text-center">
                    <Sparkles size={48} className="mx-auto opacity-40 animate-pulse" />
                    <p className="text-3xl sm:text-6xl lg:text-7xl font-serif italic leading-tight tracking-tight">
                        "Sarah has an incredible eye for detail. She completely transformed our brand's presence within weeks."
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 sm:border-8 border-white/20 shadow-2xl overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg sm:text-2xl font-black uppercase tracking-widest">Emilia Rosso</p>
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] opacity-60">Director, LUXE Paris</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Investment ── */}
            <section className="px-6 py-20 sm:py-48 max-w-7xl mx-auto w-full">
                <div className="text-center mb-16 sm:mb-32 space-y-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500">Partnerships</p>
                    <h2 className="text-4xl sm:text-8xl font-serif italic text-pink-900 tracking-tighter leading-[0.9]">Select Your Tier.</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                    {[
                        { name: "Essential", price: "$950", features: ["3 Premium Reels", "5 Styled Stills", "Engagement Tips"] },
                        { name: "Signature", price: "$2,400", features: ["10 Custom Reels", "20 Stills", "Rights", "Full Strategy"], featured: true },
                        { name: "Visionary", price: "$5,000", features: ["Unlimited Content", "Brand Direction", "24/7 Support"] }
                    ].map((pkg, i) => (
                        <div key={i} className={cn(
                            "p-10 sm:p-14 rounded-[50px] border flex flex-col gap-10 transition-all duration-500 group hover:-translate-y-4",
                            pkg.featured ? "bg-pink-600 border-pink-700 text-white shadow-[0_40px_100px_rgba(244,63,94,0.3)] z-10" : "bg-white border-pink-50 text-pink-900 shadow-xl"
                        )}>
                            <div className="space-y-3">
                                <p className={cn("text-[10px] font-black uppercase tracking-[0.3em]", pkg.featured ? "text-pink-200" : "text-pink-400")}>{pkg.name}</p>
                                <p className="text-5xl sm:text-7xl font-black tracking-tighter">{pkg.price}</p>
                            </div>
                            <div className="space-y-6 flex-grow">
                                {pkg.features.map((f, fi) => (
                                    <div key={fi} className="flex items-center gap-4">
                                        <div className={cn("w-2 h-2 rounded-full", pkg.featured ? "bg-pink-300" : "bg-pink-500")} />
                                        <span className="text-base sm:text-lg font-bold opacity-90 leading-tight">{f}</span>
                                    </div>
                                ))}
                            </div>
                            <button className={cn(
                                "w-full py-5 sm:py-7 rounded-[28px] font-black text-xs sm:text-sm uppercase tracking-[0.3em] transition-all",
                                pkg.featured ? "bg-white text-pink-600 hover:bg-pink-50" : "bg-pink-900 text-white hover:bg-black"
                            )}>Claim Tier</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Gallery ── */}
            <section className="px-6 py-20 sm:py-48 bg-white/30">
                <div className="max-w-7xl mx-auto w-full space-y-20 sm:space-y-32">
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-10 text-center sm:text-left">
                        <div className="space-y-6 w-full sm:w-auto">
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500">Portfolio</p>
                            <h2 className="text-4xl sm:text-8xl lg:text-9xl font-serif italic text-pink-900 leading-[0.85] tracking-tighter">Style <br className="hidden sm:block" /> Showcase.</h2>
                        </div>
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-pink-100 flex items-center justify-center text-pink-900 hover:bg-pink-500 hover:text-white transition-all shadow-xl hover:scale-110 cursor-pointer mx-auto sm:mx-0">
                            <ArrowUpRight size={32} className="sm:w-10 sm:h-10" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                        {mediaBlocks.slice(0, 4).map((block: any, idx: number) => (
                            <div key={block.id} className={cn(
                                "aspect-[3/4] rounded-[30px] sm:rounded-[60px] overflow-hidden shadow-2xl border-4 border-white transition-all duration-1000 group hover:scale-[1.03]",
                                idx % 2 !== 0 && "mt-8 sm:mt-24"
                            )}>
                                <img src={block.settings?.image || block.settings?.url || `https://images.unsplash.com/photo-${1500000000000 + idx * 1000000}?w=800`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Boutique (Links) ── */}
            {linkBlocks.length > 0 && (
                <section className="px-6 py-24 sm:py-60 border-y border-pink-50 bg-white">
                    <div className="max-w-4xl mx-auto w-full space-y-16 sm:space-y-32">
                        <div className="text-center space-y-6">
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500">Shop the Era</p>
                            <h2 className="text-5xl sm:text-8xl lg:text-[10rem] font-serif italic text-pink-900 tracking-tighter leading-[0.8]">The <br className="sm:hidden" /> Boutique.</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                            {linkBlocks.map((block: any) => (
                                <div key={block.id} className="w-full transform hover:scale-[1.03] transition-all">
                                    {renderBlockUI(block)}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── FAQ ── */}
            <section className="px-6 py-20 sm:py-48 max-w-5xl mx-auto w-full">
                <div className="text-center mb-16 sm:mb-32 space-y-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500">Concierge</p>
                    <h2 className="text-4xl sm:text-7xl font-serif italic text-pink-900 tracking-tighter">Your Questions.</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                    {[
                        { q: "What is your delivery window?", a: "Standard delivery is 10 business days. Expedited delivery is available for urgent launches." },
                        { q: "Do you offer ad usage rights?", a: "Yes, our Signature and Visionary packages include full digital usage rights for 6-12 months." },
                        { q: "Can we shoot in person?", a: "I am currently accepting in-person bookings for NYC, London, and Paris." },
                        { q: "What equipment do you use?", a: "We shoot on iPhone 15 Pro Max and Sony A7IV for a mix of raw and cinematic content." }
                    ].map((faq, i) => (
                        <div key={i} className="p-10 rounded-[40px] bg-white border border-pink-50 shadow-sm hover:shadow-xl transition-all duration-500 group">
                            <h3 className="text-xl font-black text-pink-900 mb-4 group-hover:text-pink-500 transition-colors leading-tight">{faq.q}</h3>
                            <p className="text-base sm:text-lg opacity-50 leading-relaxed pl-6 border-l-2 border-pink-100">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Final Footer ── */}
            <footer className="px-6 py-32 sm:py-60 text-center relative overflow-hidden bg-pink-900 text-white">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[180px] pointer-events-none" />
                <div className="relative z-10 space-y-16 sm:space-y-24">
                    <h2 className="text-6xl sm:text-[10rem] lg:text-[15rem] font-serif italic tracking-tighter leading-[0.75]">
                        Chic <br /> 
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-200 bg-[length:200%_auto] animate-text-shimmer">Impact.</span>
                    </h2>
                    
                    <div className="flex flex-col items-center gap-10">
                        <button className="w-full max-w-md py-6 sm:py-8 rounded-[32px] sm:rounded-full bg-white text-pink-900 font-black text-xs sm:text-xl uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-all">
                            Start Your Era
                        </button>
                        <div className="space-y-2">
                             <p className="text-xs sm:text-base font-bold tracking-[0.3em] text-pink-200">studio@@{instagramUsername || "creator"}.com</p>
                             <p className="text-[10px] uppercase tracking-widest opacity-40">© 2026 Studio Era. All Rights Reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};


