import React from "react";
import { cn } from "@/lib/utils";
import { Globe, Instagram, Mail, MapPin, MoreHorizontal, ArrowUpRight } from "lucide-react";

export const PortfolioLayout = ({
    profile,
    tabs,
    selectedTabId,
    setSelectedTabId,
    instagramUsername,
    otherBlocks,
    topAvatar,
    getUiTypeFromBlock,
    uiTypeOverrides,
    isMediaType,
    getYouTubeId,
    renderBlockUI
}: any) => {
    const [activePortfolioTab, setActivePortfolioTab] = React.useState("portfolio");
    const [portfolioSubView, setPortfolioSubView] = React.useState("main");

    // Filter out inactive blocks
    const activeBlocks = otherBlocks.filter((b: any) => b.is_enabled != 0 && b.is_active != 0 && b.is_Enabled != 0);

    // Extract specific section blocks
    const heroBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "hero_section");
    const statsBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "stats_section");
    const brandsBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "brands_section");
    const portfolioBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "portfolio_section");
    const servicesBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "services_section");
    const testimonialsBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "testimonials_section");
    const faqBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "faq_section");
    const ctaBlock = activeBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "cta_section");

    // Filter out these special sections from the general feed if needed, 
    // or keep them if they should appear in both places. 
    // For this template, we'll use them in their specific slots.
    const specialTypes = ["hero_section", "stats_section", "brands_section", "portfolio_section", "services_section", "testimonials_section", "faq_section", "cta_section"];
    const feedBlocks = activeBlocks.filter((b: any) => !specialTypes.includes(getUiTypeFromBlock(b, uiTypeOverrides)));

    return (
        <div className="flex flex-col bg-[#f4f6f8] min-h-full w-full overflow-x-hidden">
            {/* Wall of Portfolios Sticky Tabs */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 flex justify-center px-4 pt-3 gap-8 shrink-0 w-full">
                <button
                    type="button"
                    onClick={() => setActivePortfolioTab("profile")}
                    className={cn("pb-3 text-[15px] font-bold transition-all relative", activePortfolioTab === "profile" ? "text-black" : "text-gray-400 hover:text-gray-600")}
                >
                    Profile
                    {activePortfolioTab === "profile" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
                </button>
                <button
                    type="button"
                    onClick={() => setActivePortfolioTab("portfolio")}
                    className={cn("pb-3 text-[15px] font-bold transition-all relative", activePortfolioTab === "portfolio" ? "text-black" : "text-gray-400 hover:text-gray-600")}
                >
                    Portfolio
                    {activePortfolioTab === "portfolio" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
                </button>
            </div>

            {activePortfolioTab === "profile" ? (
                /* Profile Tab - White Card Overlay */
                <div className="p-4 py-6 w-full h-full flex-1">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                        {heroBlock && (
                            <>
                                <img
                                    src={heroBlock?.settings?.image || topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"}
                                    className="w-[120px] h-[120px] rounded-full object-cover mb-5 shadow-sm"
                                />
                                <h2 className="text-2xl font-black text-gray-900 mb-1 text-center">{profile?.title || instagramUsername || "Anshul"}</h2>
                                <p className="text-[12px] font-bold text-gray-900 uppercase tracking-widest mb-6 text-center">
                                    {heroBlock?.settings?.title || "Creative Director"}
                                </p>
                            </>
                        )}

                        <div className="w-full flex gap-3 mb-6">
                            <button type="button" className="flex-1 bg-gray-900 text-white rounded-full py-3.5 font-bold text-sm hover:bg-black transition shadow-md">Message</button>
                            <button type="button" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition shrink-0"><MoreHorizontal size={18} /></button>
                        </div>

                        <div className="text-left w-full pt-6 border-t border-gray-100">
                            {heroBlock && (
                                <>
                                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">About</p>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                        {profile?.bio || heroBlock?.settings?.description || "Digital creator focused on brand identity and visual storytelling."}
                                    </p>
                                </>
                            )}

                            {brandsBlock && (
                                <>
                                    <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Previous Clients</p>
                                    <div className="flex flex-wrap gap-3">
                                        {(brandsBlock.settings?.logos || []).map((logo: any, i: number) => (
                                            <div key={i} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                                                {logo.image ? <img src={logo.image} className="w-full h-full object-contain p-2" /> : <span className="text-[10px] font-black text-gray-300">LOGO</span>}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* Portfolio Tab - Full Continuous Template */
                <div className="flex-1 w-full flex flex-col bg-white">
                    {portfolioSubView === "main" ? (
                        <>
                            {/* Hero Banner Section */}
                            {heroBlock && (
                                <div className="relative w-full aspect-[4/5] bg-black flex-shrink-0">
                                    <img
                                        src={heroBlock?.settings?.image || topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"}
                                        alt="Cover"
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

                                    {/* User Info overlay at bottom */}
                                    <div className="absolute bottom-8 left-0 right-0 px-6 z-10 min-w-0">
                                        <h1 className="text-2xl font-black text-white tracking-tight leading-tight mb-5 break-words max-w-full">
                                            {heroBlock?.settings?.title || profile?.title || instagramUsername || "Anshul"}
                                        </h1>

                                        <div className="flex items-center gap-3">
                                            <a 
                                                href={heroBlock?.settings?.cta_link || "#contact"} 
                                                className="flex-1 bg-white text-black rounded-full py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-100 transition font-bold text-[12px] shadow-lg no-underline"
                                            >
                                                <Mail size={14} /> {heroBlock?.settings?.cta_text || "Contact Me"}
                                            </a>
                                            <button type="button" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition flex-shrink-0">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Intro & Logos Section */}
                            {heroBlock && (
                                <div className="p-6 pt-10 text-center border-b border-gray-100 w-full">
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">About</p>
                                    <h2 className="text-lg font-bold text-gray-900 leading-tight mb-8">
                                        {heroBlock?.settings?.description || profile?.bio || "Stand Out Design & Visual Identities for Global Creators, Startups & Clean Tech Mavericks."}
                                    </h2>
                                </div>
                            )}
                                
                                {brandsBlock && (
                                    <div className="p-6 pt-0 text-center border-b border-gray-100 w-full">
                                        <div className="flex flex-wrap items-center justify-center gap-6 opacity-60">
                                            {(brandsBlock.settings?.logos || []).map((logo: any, i: number) => (
                                                <div key={i} className="h-8 flex items-center justify-center">
                                                    {logo.image ? <img src={logo.image} className="h-full object-contain grayscale" /> : <span className="text-[10px] font-bold">BRAND</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Featured Work Section */}
                            {(portfolioBlock || feedBlocks.length > 0) && (
                                <div className="p-6 pb-12 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Featured Work</h3>
                                    </div>

                                    {/* Dynamic Builder Tabs */}
                                    {tabs && tabs.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                                            {tabs.map((tab: any) => (
                                                <button
                                                    type="button"
                                                    key={tab.id}
                                                    onClick={() => setSelectedTabId(tab.id)}
                                                    className={cn(
                                                        "px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all",
                                                        selectedTabId === tab.id
                                                            ? "bg-black text-white"
                                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {tab.name || "Tab"}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Portfolio Items mapping */}
                                    <div className="flex flex-col gap-6">
                                        {/* If we have a dedicated portfolio block, show its items first */}
                                        {(portfolioBlock?.settings?.items || []).map((item: any, i: number) => (
                                            <div key={`portfolio-${i}`} className="group overflow-hidden">
                                                <div className="aspect-[4/3] bg-gray-100 rounded-3xl relative overflow-hidden mb-3 shadow-sm">
                                                    <img src={item.image || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"} className="w-full h-full object-cover" />
                                                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Case Study</span>
                                                    </div>
                                                </div>
                                                <div className="px-1 flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 text-lg mb-0.5 truncate">{item.title}</h4>
                                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest truncate">{item.description}</p>
                                                    </div>
                                                    <a href={item.link || "#"} className="text-gray-400 hover:text-black transition-colors mt-1 shrink-0"><ArrowUpRight size={18} /></a>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Standard Feed Blocks */}
                                        {feedBlocks.map((block: any, idx: number) => {
                                            const type = getUiTypeFromBlock(block, uiTypeOverrides);
                                            const settings = block.settings || {};
                                            const displayLabel = settings.title || settings.name || settings.text || type;

                                            if (isMediaType(type) || ['youtube', 'spotify'].includes(type) || type === 'image') {
                                                return (
                                                    <div key={block.id} className="group overflow-hidden">
                                                        <div className="aspect-[4/3] bg-gray-100 rounded-3xl relative overflow-hidden mb-3 shadow-sm">
                                                            {type === 'youtube' && (block.location_url || settings.url) ? (
                                                                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeId(block.location_url || settings.url)}`} frameBorder="0" />
                                                            ) : (
                                                                <img src={settings.image || settings.url || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"} className="w-full h-full object-cover" />
                                                            )}
                                                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Featured</span>
                                                            </div>
                                                        </div>
                                                        <div className="px-1 flex justify-between items-start">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-gray-900 text-lg mb-0.5 truncate">{displayLabel}</h4>
                                                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest truncate">{type.replace('_', ' ')}</p>
                                                            </div>
                                                            <ArrowUpRight size={18} className="text-gray-400 mt-1 shrink-0" />
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            if (type === "link") {
                                                return (
                                                    <a key={block.id} href={block.location_url} className="group bg-gray-50 hover:bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center p-4 gap-4 transition-all no-underline">
                                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                                                            {settings.icon ? <i className={`${settings.icon} text-xl text-gray-600`}></i> : <Globe size={20} className="text-gray-600" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-gray-900 text-[15px] truncate">{displayLabel}</h4>
                                                            <p className="text-[12px] text-gray-500 truncate mt-0.5">{block.location_url}</p>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                                            <ArrowUpRight size={14} className="text-gray-600" />
                                                        </div>
                                                    </a>
                                                );
                                            }
                                            return <div key={block.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">{renderBlockUI(block, false, idx)}</div>;
                                        })}
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={() => setPortfolioSubView("projects")}
                                        className="w-full mt-8 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]"
                                    >
                                        View All Work
                                    </button>
                                </div>
                            )}

                            {/* Services Section */}
                            {servicesBlock && (
                                <div className="p-6 py-10 border-b border-gray-100 bg-gray-50/50 w-full">
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Services</p>
                                    <h3 className="text-xl font-black text-gray-900 text-center mb-6 leading-tight">Services that transform brands</h3>

                                    <div className="flex flex-col">
                                        {(servicesBlock.settings?.items || []).map((service: any, i: number) => (
                                            <a key={i} href={service.link || "#"} className="py-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer no-underline">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-bold text-gray-400">0{i + 1}</span>
                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{service.title}</h4>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                                    <ArrowUpRight size={14} />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stats Section / About */}
                            {statsBlock && (
                                <div className="p-6 py-10 border-b border-gray-100 w-full">
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Performance</p>
                                    <h3 className="text-xl font-black text-gray-900 mb-6 leading-tight">Delivering results that matter.</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {(statsBlock.settings?.items || []).map((stat: any, i: number) => (
                                            <div key={i}>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button type="button" className="w-full bg-black text-white rounded-full py-4 font-bold text-sm hover:bg-gray-800 transition">Book a Call</button>
                                </div>
                            )}

                            {/* Testimonials Section */}
                            {testimonialsBlock && (
                                <div className="p-6 py-10 border-b border-gray-100 w-full">
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Testimonials</p>
                                    <h3 className="text-xl font-black text-gray-900 text-center mb-6 leading-tight">Client Success Stories</h3>

                                    <div className="flex flex-col gap-6">
                                        {(testimonialsBlock.settings?.items || []).map((t: any, i: number) => (
                                            <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                                                <div className="text-orange-500 text-4xl font-serif absolute top-4 left-4 opacity-20">"</div>
                                                <p className="text-sm text-gray-700 leading-relaxed relative z-10 mb-6 font-medium italic">
                                                    {t.description}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                        {t.image && <img src={t.image} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm">{t.title}</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t.author || "Client"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FAQ Section */}
                            {faqBlock && (
                                <div className="p-6 py-10 border-b border-gray-100 w-full">
                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">FAQ</p>
                                    <h3 className="text-xl font-black text-gray-900 mb-6 leading-tight">Answers to your questions</h3>

                                    <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                                        {(faqBlock.settings?.items || []).map((faq: any, i: number) => (
                                            <div key={i} className="py-5 group cursor-pointer">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{faq.question}</h4>
                                                    <span className="text-xl text-gray-400">+</span>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">{faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer / CTA Section */}
                            {ctaBlock && (
                                <div className="p-8 py-12 bg-[#0a0a0a] text-center flex flex-col items-center w-full">
                                    <h3 className="text-xl font-black text-white mb-6 leading-tight max-w-[240px]">
                                        {ctaBlock?.settings?.title || "Ready to stand out from everyone?"}
                                    </h3>
                                    <a 
                                        href={ctaBlock?.settings?.button_link || "#contact"} 
                                        className="bg-orange-600 text-white rounded-full py-3 px-8 font-bold text-sm mb-12 hover:bg-orange-700 transition no-underline"
                                    >
                                        {ctaBlock?.settings?.button_text || "Let's Talk"}
                                    </a>

                                    <div className="flex gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Globe size={16} /></div>
                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Instagram size={16} /></div>
                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Mail size={16} /></div>
                                    </div>

                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">© 2026 {profile?.title || instagramUsername || "Anshul"}. All rights reserved.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Dedicated Projects View (Page 2) */
                        <div className="p-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                type="button"
                                onClick={() => setPortfolioSubView("main")}
                                className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest mb-8 hover:text-gray-900 transition-colors"
                            >
                                <ArrowUpRight size={16} className="rotate-[225deg]" /> Back to Home
                            </button>

                            <h2 className="text-4xl font-black text-gray-900 mb-2 leading-tight">All Projects</h2>
                            <p className="text-gray-500 font-medium mb-12">Explore my complete body of work across brand identity, UI/UX, and web development.</p>

                            <div className="grid grid-cols-1 gap-8">
                                {/* First show items from portfolio_section if exists */}
                                {(portfolioBlock?.settings?.items || []).map((item: any, i: number) => (
                                    <div key={`all-portfolio-${i}`} className="group">
                                        <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
                                            <img src={item.image || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <h4 className="font-bold text-xl text-gray-900 mb-1">{item.title}</h4>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{item.description || "Project"}</p>
                                    </div>
                                ))}

                                {/* Then show feed blocks */}
                                {feedBlocks.map((block: any, idx: number) => {
                                    const type = getUiTypeFromBlock(block, uiTypeOverrides);
                                    const settings = block.settings || {};
                                    const displayLabel = settings.title || settings.name || settings.text || type;

                                    if (isMediaType(type) || ['youtube', 'spotify'].includes(type) || type === 'image') {
                                        return (
                                            <div key={block.id} className="group">
                                                <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
                                                    <img src={settings.image || settings.url || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                </div>
                                                <h4 className="font-bold text-xl text-gray-900 mb-1">{displayLabel}</h4>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{type.replace('_', ' ')}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
