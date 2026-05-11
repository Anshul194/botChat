"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Instagram, Mail, Youtube, Share2, Sparkles,
    Check, ChevronDown, ArrowUpRight, Star
} from "lucide-react";

// ─── Color tokens ────────────────────────────────────────
const C = {
    bg:       "#fdf4ff",          // lavender-tinted white
    hero:     "linear-gradient(135deg,#fdf4ff 0%,#fce7f3 60%,#ede9fe 100%)",
    accent1:  "#e879f9",          // fuchsia
    accent2:  "#f43f5e",          // rose
    accent3:  "#8b5cf6",          // violet
    accent4:  "#f59e0b",          // amber
    dark:     "#1e0a2e",          // deep purple-black
    light:    "#fdf4ff",
    statBg:   "linear-gradient(135deg,#fdf4ff,#fce7f3)",
    impactBg: "linear-gradient(160deg,#f5f3ff 0%,#fce7f3 100%)",
    testiBg:  "linear-gradient(135deg,#7c3aed,#db2777)",
    pricingHL:"linear-gradient(135deg,#e879f9,#f43f5e)",
    footerBg: "linear-gradient(160deg,#1e0a2e 0%,#4c1d95 100%)",
};

export const UGCLayout = ({
    theme, profile, otherBlocks, topAvatar,
    instagramUsername, getUiTypeFromBlock, uiTypeOverrides,
    isMediaType, renderBlockUI,
}: any) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const find = (type: string) =>
        (otherBlocks || []).find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === type);

    const heroB  = find("hero_aesthetic_section");
    const hProductB = find("hero_product_section");
    const statsB = find("stats_minimal_section");
    const impactB= find("impact_section");
    const testiB = find("testimonial_highlight_section") || find("testimonials_section");
    const priceB = find("pricing_cards_section");
    const portB  = find("portfolio_minimal_section");
    const faqB   = find("faq_cards_section") || find("faq_section");
    const ctaB   = find("cta_fullscreen_section");
    const featProductB = find("featured_product_section") || find("product_section");
    const productListB = find("product_list_section");
    const badgesB = find("trust_badges_section");
    const urgencyB = find("urgency_offer_section");
    const contactB = find("contact_section");

    const mediaBlocks = (otherBlocks || []).filter((b: any) =>
        isMediaType?.(getUiTypeFromBlock?.(b, uiTypeOverrides)));
    const linkBlocks  = (otherBlocks || []).filter((b: any) =>
        !isMediaType?.(getUiTypeFromBlock?.(b, uiTypeOverrides)));
    const hasAesthetic = !!(heroB || statsB || impactB || priceB);

    const h   = heroB?.settings || {};
    const img = h.profile_image || profile?.avatar || "";

    const stats = statsB?.settings?.items || [
        { value:"124K", label:"Followers" },
        { value:"8.2%", label:"Engagement" },
        { value:"15M+", label:"Reach"      },
        { value:"250+", label:"Clients"    },
    ];

    const impacts = impactB?.settings?.points || [
        { title:"Strategy",  description:"Clear, intentional brand planning that aligns with your goals." },
        { title:"Execution", description:"Strong, cohesive visuals that stop the scroll."                 },
        { title:"Growth",    description:"Scalable results that compound over time."                      },
    ];

    const faqs = faqB?.settings?.items || [
        { question:"How long does a project take?",   answer:"4–8 weeks depending on scope." },
        { question:"Do you offer payment plans?",     answer:"Yes — 2 or 3-installment plans on all tiers." },
        { question:"What do I need to get started?",  answer:"A brand questionnaire and a quick discovery call." },
    ];

    const plans = priceB?.settings?.plans || [
        { name:"Starter", price:"$950",  highlight:false,
          features:["Brand audit","Visual identity","2 revisions","30-day support"],
          button:{ text:"Get Started", link:"#" } },
        { name:"Pro",     price:"$2,400", highlight:true,
          features:["Full brand system","Content calendar","Unlimited revisions","90-day support"],
          button:{ text:"Get Started", link:"#" } },
    ];

    const portfolio = portB?.settings?.items?.length
        ? portB.settings.items
        : mediaBlocks.length
            ? mediaBlocks.slice(0,4)
            : [
                { image:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400" },
                { image:"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400" },
                { image:"https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400" },
                { image:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400" },
            ];

    return (
        <div className="flex flex-col w-full min-h-full overflow-x-hidden" style={{ background: C.bg, color: C.dark, fontFamily: "'Inter', sans-serif" }}>

            {/* ══ NAV ══════════════════════════════════════ */}
            <header className="flex items-center justify-between px-3 py-2.5 bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b border-fuchsia-100">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shadow-md shrink-0"
                         style={{ background: C.pricingHL }}>
                        <Sparkles size={11} className="text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] truncate" style={{ color: C.dark }}>
                        {h.brand_name || profile?.title || "Creator Studio"}
                    </span>
                </div>
                <a href={h.buttons?.[0]?.link || "#"}
                   className="shrink-0 ml-2 px-3 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-wider shadow-md active:scale-95 transition-all whitespace-nowrap"
                   style={{ background: C.pricingHL }}>
                    {h.buttons?.[0]?.text || "Let's Work"}
                </a>
            </header>

            {/* ══ HERO AESTHETIC ══════════════════════════════════════ */}
            {heroB && (
                <section className="px-4 pt-5 pb-4" style={{ background: C.hero }}>
                    <div className="flex flex-col items-center text-center gap-3">
                        {/* Avatar ring */}
                        <div className="relative">
                            <div className="p-[2px] rounded-[22px] shadow-xl" style={{ background: C.pricingHL }}>
                                <div className="w-20 h-20 rounded-[20px] overflow-hidden bg-white">
                                    <img src={img || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <span className="absolute -bottom-1 -right-1 text-[9px] font-black text-white px-1.5 py-0.5 rounded-full" style={{ background: C.accent2 }}>✦ Live</span>
                        </div>

                        {/* Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" style={{ borderColor: C.accent1, color: C.accent1, background: "#fdf4ff" }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ background: C.accent1 }} />
                            Available for Projects
                        </span>

                        {/* Headline */}
                        <div className="space-y-0.5">
                            <h1 className="text-[26px] font-black italic leading-none tracking-tight" style={{ color: C.dark }}>
                                {h.headline || "Aesthetic"}{" "}
                                <span style={{ color: C.accent1 }}>Authority.</span>
                            </h1>
                            {h.subheadline && (
                                <p className="text-[12px] font-bold" style={{ color: C.accent3 }}>{h.subheadline}</p>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-[11px] leading-relaxed font-medium max-w-[260px]" style={{ color: `${C.dark}99` }}>
                            {h.description || "Creating high-conversion editorial content for brands that value visual excellence."}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex gap-2 flex-wrap justify-center">
                            {(h.buttons?.length ? h.buttons : [
                                { text:"Work With Me", link:"#", style:"primary" },
                                { text:"View Portfolio", link:"#", style:"secondary" },
                            ]).map((btn: any, i: number) => (
                                <a key={i} href={btn.link || "#"} className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all" style={btn.style === "primary" ? { background: C.pricingHL, color:"#fff" } : { background:"#fff", border:`1.5px solid ${C.accent3}`, color: C.accent3 }}>{btn.text}</a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ══ HERO PRODUCT ══════════════════════════════════════ */}
            {hProductB && (
                <section className="px-4 py-8" style={{ background: C.hero }}>
                    <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/60 shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-200/30 blur-3xl -mr-10 -mt-10" />
                        <div className="flex flex-col items-center text-center relative z-10">
                            <div className="w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl mb-6 transform group-hover:scale-[1.02] transition-transform duration-500">
                                <img src={hProductB.settings?.product_image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-2 mb-6">
                                <h2 className="text-[28px] font-black italic leading-tight" style={{ color: C.dark }}>{hProductB.settings?.title || "Season's Essential"}</h2>
                                <p className="text-[14px] font-bold text-fuchsia-500 uppercase tracking-widest">{hProductB.settings?.subtitle || "Limited Edition Release"}</p>
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[24px] font-black" style={{ color: C.dark }}>{hProductB.settings?.price || "$89"}</span>
                                <div className="h-8 w-[1px] bg-fuchsia-100" />
                                <div className="flex gap-1 text-amber-400">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                                </div>
                            </div>
                            <a href={hProductB.settings?.cta_link || "#"} className="w-full py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all" style={{ background: C.pricingHL }}>{hProductB.settings?.cta_text || "Secure Yours Now"}</a>
                        </div>
                    </div>
                </section>
            )}

            {/* ══ STATS ═════════════════════════════════════ */}
            <section className="mx-3 -mt-1 mb-3 rounded-2xl shadow-md overflow-hidden"
                     style={{ background: "white", border: `1.5px solid #f3e8ff` }}>
                <div className="grid grid-cols-2 divide-x divide-y divide-purple-50">
                    {stats.map((s: any, i: number) => (
                        <div key={i} className="flex flex-col items-center py-3 px-2">
                            <span className="text-[20px] font-black tracking-tighter leading-none"
                                  style={{ color: i % 2 === 0 ? C.accent1 : C.accent3 }}>
                                {s.value || s.val}
                            </span>
                            <span className="text-[8.5px] font-black uppercase tracking-[0.18em] mt-0.5"
                                  style={{ color: `${C.dark}66` }}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ IMPACT / PHILOSOPHY ═══════════════════════ */}
            <section className="px-4 py-5 mx-0" style={{ background: C.impactBg }}>
                <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-5 h-0.5 rounded-full" style={{ background: C.accent3 }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: C.accent3 }}>
                        Philosophy
                    </p>
                </div>
                <h2 className="text-[20px] font-black italic leading-tight mb-1" style={{ color: C.dark }}>
                    {impactB?.settings?.title || "Impact Over Impressions."}
                </h2>
                {impactB?.settings?.description && (
                    <p className="text-[11px] leading-relaxed mb-3" style={{ color: `${C.dark}80` }}>
                        {impactB.settings.description}
                    </p>
                )}
                <div className="space-y-3 mt-3">
                    {impacts.map((pt: any, i: number) => {
                        const colors = [C.accent1, C.accent2, C.accent3];
                        const c = colors[i % 3];
                        return (
                            <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-white/70 border border-white/80 shadow-sm">
                                <span className="text-[18px] font-black leading-none shrink-0"
                                      style={{ color: c }}>
                                    0{i + 1}
                                </span>
                                <div>
                                    <h3 className="text-[12px] font-black" style={{ color: C.dark }}>{pt.title}</h3>
                                    <p className="text-[10.5px] leading-snug mt-0.5" style={{ color: `${C.dark}70` }}>
                                        {pt.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ══ FEATURED PRODUCT ═════════════════════════ */}
            {featProductB && (
                <section className="px-4 py-6">
                    <div className="bg-white rounded-[2rem] p-5 shadow-lg border border-fuchsia-50 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-fuchsia-100 to-transparent rounded-bl-full" />
                        <div className="flex gap-5 items-center relative z-10">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md shrink-0">
                                <img src={featProductB.settings?.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-[16px] font-black italic tracking-tight" style={{ color: C.dark }}>{featProductB.settings?.name || featProductB.settings?.title || "Premium Selection"}</h3>
                                <p className="text-[11px] leading-snug opacity-60 line-clamp-2">{featProductB.settings?.description || "Curated specifically for your lifestyle."}</p>
                                <div className="flex items-center justify-between pt-1">
                                    <span className="text-[16px] font-black text-fuchsia-600">{featProductB.settings?.price || "$49"}</span>
                                    <a href={featProductB.settings?.link || featProductB.settings?.url || "#"} className="px-3 py-1.5 rounded-lg bg-fuchsia-50 text-fuchsia-600 text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-600 hover:text-white transition-all">Shop Now</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ══ PRODUCT LIST ═════════════════════════════ */}
            {productListB && (
                <section className="px-4 py-6 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[18px] font-black italic" style={{ color: C.dark }}>Store Favorites</h2>
                        <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400">View All</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {(productListB.settings?.items || []).map((item: any, i: number) => (
                            <div key={i} className="bg-white rounded-[1.5rem] p-3 shadow-sm border border-fuchsia-50 space-y-3">
                                <div className="aspect-square rounded-xl overflow-hidden bg-fuchsia-50">
                                    <img src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-[12px] font-black truncate" style={{ color: C.dark }}>{item.name}</h4>
                                    <p className="text-[11px] font-black text-fuchsia-500">{item.price}</p>
                                </div>
                                <a href={item.link || "#"} className="block w-full py-2 rounded-lg bg-fuchsia-600 text-white text-[9px] font-black uppercase tracking-widest text-center shadow-md active:scale-95 transition-all">Add to Bag</a>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ══ TRUST BADGES ═════════════════════════════ */}
            {badgesB && (
                <section className="px-4 py-4 overflow-x-auto">
                    <div className="flex gap-3 pb-2">
                        {(badgesB.settings?.items || []).map((badge: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-fuchsia-100 shadow-sm whitespace-nowrap shrink-0">
                                <Sparkles size={11} className="text-fuchsia-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-900/60">{badge.label}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ══ TESTIMONIAL ═══════════════════════════════ */}
            {(testiB) && (
                <section className="mx-3 my-3 rounded-2xl p-4 shadow-lg relative overflow-hidden text-white" style={{ background: C.testiBg }}>
                    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="flex gap-1 mb-2">
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} fill="currentColor" className="text-amber-300" />)}
                    </div>
                    {/* Handle multiple testimonials if it's the standard section */}
                    {(() => {
                        const items = testiB.settings?.items || [{ 
                            quote: testiB.settings?.quote, 
                            author_name: testiB.settings?.author_name, 
                            author_role: testiB.settings?.author_role, 
                            author_image: testiB.settings?.author_image 
                        }];
                        const item = items[0]; // Show first for now
                        return (
                            <>
                                <p className="text-[12px] font-medium italic leading-relaxed mb-3 relative z-10">
                                    "{item.quote || item.text || item.description || "Working together transformed our brand presence."}"
                                </p>
                                <div className="flex items-center gap-2.5 relative z-10">
                                    <div className="w-9 h-9 rounded-full border-2 border-white/40 overflow-hidden shrink-0">
                                        <img src={item.author_image || item.avatar || item.image || "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200"} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black tracking-wide">{item.author_name || item.name || "Sarah Chen"}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{item.author_role || item.role || item.subtitle || "Founder & CEO"}</p>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </section>
            )}

            {/* ══ PORTFOLIO GRID ════════════════════════════ */}
            <section className="px-3 py-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.28em]" style={{ color: C.accent2 }}>Portfolio</p>
                        <h2 className="text-[18px] font-black italic leading-tight" style={{ color: C.dark }}>
                            {portB?.settings?.title || "Style Showcase."}
                        </h2>
                    </div>
                    <div className="w-8 h-8 rounded-full border flex items-center justify-center shadow-sm"
                         style={{ borderColor: "#fce7f3", color: C.accent2 }}>
                        <ArrowUpRight size={14} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {portfolio.slice(0, 4).map((img: any, idx: number) => (
                        <div key={idx}
                             className={cn("aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-md", idx % 2 !== 0 ? "mt-4" : "")}>
                            <img
                                src={img.image || img.settings?.image_url || img.settings?.url
                                    || `https://images.unsplash.com/photo-148398554${idx}?w=400`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ PRICING ═══════════════════════════════════ */}
            <section className="px-3 py-4 bg-white border-t border-purple-50">
                <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-0.5" style={{ color: C.accent3 }}>Partnerships</p>
                <h2 className="text-[18px] font-black italic leading-tight mb-3" style={{ color: C.dark }}>
                    {priceB?.settings?.title || "Select Your Tier."}
                </h2>
                <div className="space-y-3">
                    {plans.map((pkg: any, i: number) => (
                        <div key={i}
                             className="rounded-2xl p-3.5 border"
                             style={pkg.highlight
                                 ? { background: C.pricingHL, borderColor:"transparent", color:"#fff" }
                                 : { background:"#fdf4ff", borderColor:"#f3e8ff", color: C.dark }
                             }>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{pkg.name}</p>
                                    <p className="text-[22px] font-black tracking-tighter leading-none">{pkg.price}</p>
                                </div>
                                <a href={pkg.button?.link || "#"}
                                   className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow active:scale-95 transition-all"
                                   style={pkg.highlight
                                       ? { background:"#fff", color: C.accent1 }
                                       : { background: C.pricingHL, color:"#fff" }}>
                                    {pkg.button?.text || "Get Started"}
                                </a>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {(pkg.features || []).map((f: string, fi: number) => (
                                    <span key={fi} className="flex items-center gap-1 text-[10px] font-semibold">
                                        <Check size={9} className={pkg.highlight ? "text-white" : ""} style={!pkg.highlight ? { color: C.accent1 } : {}} />
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══ LINK BOUTIQUE (only if no aesthetic blocks) ══ */}
            {linkBlocks.length > 0 && !hasAesthetic && (
                <section className="px-3 py-4 border-t border-purple-50">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-0.5" style={{ color: C.accent4 }}>Shop the Era</p>
                    <h2 className="text-[18px] font-black italic mb-3" style={{ color: C.dark }}>The Boutique.</h2>
                    <div className="space-y-3">
                        {linkBlocks.map((block: any) => (
                            <div key={block.id}>{renderBlockUI(block)}</div>
                        ))}
                    </div>
                </section>
            )}

            {/* ══ URGENCY OFFER ════════════════════════════ */}
            {urgencyB && (
                <section className="mx-3 my-4 p-6 rounded-[2rem] text-center space-y-4 relative overflow-hidden border border-fuchsia-100" style={{ background: "white" }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-fuchsia-600 rounded-b-full" />
                    <div className="space-y-1">
                        <h2 className="text-[20px] font-black italic tracking-tight" style={{ color: C.dark }}>{urgencyB.settings?.title || "Don't Miss Out"}</h2>
                        <p className="text-[11px] font-medium opacity-60 leading-relaxed">{urgencyB.settings?.description || "Limited quantities available at this price."}</p>
                    </div>
                    {urgencyB.settings?.countdown && (
                        <div className="flex justify-center gap-3">
                            <div className="px-3 py-2 rounded-xl bg-fuchsia-50 text-fuchsia-600 font-black text-[14px]">24h</div>
                            <div className="px-3 py-2 rounded-xl bg-fuchsia-50 text-fuchsia-600 font-black text-[14px]">59m</div>
                            <div className="px-3 py-2 rounded-xl bg-fuchsia-50 text-fuchsia-600 font-black text-[14px]">00s</div>
                        </div>
                    )}
                    <a href={urgencyB.settings?.button_link || "#"} className="block w-full py-3.5 rounded-xl bg-fuchsia-600 text-white font-black uppercase tracking-[0.15em] shadow-lg active:scale-95 transition-all">{urgencyB.settings?.button_text || "Claim Offer"}</a>
                </section>
            )}

            {/* ══ FAQ ═══════════════════════════════════════ */}
            {faqB && (
                <section className="px-3 py-4" style={{ background: "linear-gradient(180deg,#f5f3ff,#fdf4ff)" }}>
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] mb-0.5" style={{ color: C.accent3 }}>Concierge</p>
                    <h2 className="text-[18px] font-black italic leading-tight mb-3" style={{ color: C.dark }}>
                        {faqB.settings?.title || "Your Questions."}
                    </h2>
                    <div className="space-y-2">
                        {(faqB.settings?.items || faqs).map((faq: any, i: number) => (
                            <div key={i} className="rounded-xl overflow-hidden border" style={{ borderColor:"#ede9fe", background:"#fff" }}>
                                <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <span className="text-[11px] font-black leading-snug pr-2" style={{ color: C.dark }}>{faq.question || faq.q}</span>
                                    <ChevronDown size={13} className="shrink-0 transition-transform duration-300" style={{ color: C.accent3, transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-3 pb-3 pt-0 border-t" style={{ borderColor:"#ede9fe" }}>
                                        <p className="text-[10.5px] leading-relaxed pl-2.5 border-l-2" style={{ borderColor: C.accent3, color:`${C.dark}80` }}>{faq.answer || faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ══ CONTACT ═══════════════════════════════════ */}
            {contactB && (
                <section className="px-4 py-8 space-y-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-[18px] font-black italic" style={{ color: C.dark }}>Direct Connection</h2>
                        <p className="text-[11px] opacity-60">Reach out for custom inquiries.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <a href={`mailto:${contactB.settings?.email}`} className="flex flex-col items-center gap-2 p-4 rounded-[1.5rem] bg-white border border-fuchsia-50 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-fuchsia-50 flex items-center justify-center text-fuchsia-600"><Mail size={18} /></div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                        </a>
                        <a href={`tel:${contactB.settings?.phone}`} className="flex flex-col items-center gap-2 p-4 rounded-[1.5rem] bg-white border border-fuchsia-50 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-fuchsia-50 flex items-center justify-center text-fuchsia-600"><Sparkles size={18} /></div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Call</span>
                        </a>
                        <a href={`https://wa.me/${contactB.settings?.whatsapp}`} className="flex flex-col items-center gap-2 p-4 rounded-[1.5rem] bg-white border border-fuchsia-50 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-fuchsia-50 flex items-center justify-center text-fuchsia-600"><Share2 size={18} /></div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Chat</span>
                        </a>
                    </div>
                </section>
            )}

            {/* ══ CTA / FOOTER ══════════════════════════════ */}
            <footer className="px-4 py-8 text-center text-white relative overflow-hidden"
                    style={{ background: C.footerBg }}>
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
                     style={{ background:"radial-gradient(circle at 30% 50%,#e879f9,transparent 60%)" }} />
                <div className="relative z-10 space-y-4">
                    {/* Sparkle row */}
                    <div className="flex justify-center gap-2 text-fuchsia-300">
                        <Sparkles size={14} className="animate-pulse" />
                        <Sparkles size={10} className="animate-pulse delay-150" />
                        <Sparkles size={14} className="animate-pulse delay-300" />
                    </div>

                    <h2 className="text-[24px] font-black italic leading-tight">
                        {ctaB?.settings?.title || "Chic"}{" "}
                        <span className="text-transparent bg-clip-text"
                              style={{ backgroundImage:"linear-gradient(90deg,#f9a8d4,#c4b5fd,#fde68a)" }}>
                            {ctaB?.settings?.title ? "" : "Impact."}
                        </span>
                    </h2>

                    {ctaB?.settings?.subtitle && (
                        <p className="text-[11px] font-medium text-purple-200 max-w-[220px] mx-auto">
                            {ctaB.settings.subtitle}
                        </p>
                    )}

                    <a href={ctaB?.settings?.button?.link || "#"}
                       className="block w-full max-w-[220px] mx-auto py-3 rounded-full font-black text-[11px] uppercase tracking-[0.25em] shadow-xl active:scale-95 transition-all"
                       style={{ background:"linear-gradient(90deg,#f9a8d4,#c4b5fd)", color: C.dark }}>
                        {ctaB?.settings?.button?.text || "Start Your Era"}
                    </a>

                    <div className="pt-2 space-y-0.5">
                        <p className="text-[10px] font-bold tracking-widest text-purple-300">
                            @{instagramUsername || profile?.url || "creator"}
                        </p>
                        <p className="text-[8px] uppercase tracking-widest opacity-30">
                            © 2026 · All Rights Reserved
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
