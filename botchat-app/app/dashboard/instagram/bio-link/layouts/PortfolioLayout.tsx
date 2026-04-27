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

    return (
        <div className="flex flex-col bg-[#f4f6f8] min-h-full w-full">
            {/* Wall of Portfolios Sticky Tabs */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 flex px-6 pt-4 gap-6 shrink-0">
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
                        <img
                            src={topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"}
                            className="w-[120px] h-[120px] rounded-full object-cover mb-5 shadow-sm"
                        />
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{profile?.title || "Your Name"}</h2>
                        <p className="text-[12px] font-bold text-gray-900 uppercase tracking-widest mb-6">Creative Director</p>

                        <div className="w-full flex gap-3 mb-6">
                            <button type="button" className="flex-1 bg-gray-900 text-white rounded-full py-3.5 font-bold text-sm hover:bg-black transition shadow-md">Message</button>
                            <button type="button" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition shrink-0"><MoreHorizontal size={18} /></button>
                        </div>

                        <div className="text-left w-full pt-6 border-t border-gray-100">
                            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">About</p>
                            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                {profile?.bio || "Digital creator focused on brand identity and visual storytelling."}
                            </p>

                            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">Previous Clients</p>
                            <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"><span className="text-[10px] font-black text-gray-300">CM</span></div>
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"><span className="text-[10px] font-black text-gray-300">HP</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Portfolio Tab - Full Continuous Template */
                <div className="flex-1 w-full flex flex-col bg-white">
                    {portfolioSubView === "main" ? (
                        <>
                            {/* Hero Banner Section */}
                            <div className="relative w-full aspect-[4/5] bg-black flex-shrink-0">
                                <img
                                    src={topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"}
                                    alt="Cover"
                                    className="w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>

                                {/* User Info overlay at bottom */}
                                <div className="absolute bottom-8 left-6 pr-6 w-full z-10 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className="px-2 py-0.5 bg-orange-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-sm shrink-0">Featured</span>
                                        <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold uppercase tracking-widest rounded-sm shrink-0">Open to work</span>
                                    </div>
                                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2 break-words max-w-[240px]">
                                        {profile?.title || "Your Name"}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-gray-300 mb-5">
                                        <span className="truncate max-w-[140px]">@{instagramUsername || "username"}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-500 hidden sm:block"></span>
                                        <span className="flex items-center gap-1 shrink-0"><MapPin size={10} /> Global</span>
                                    </div>

                                    <div className="flex items-center gap-3 pr-6">
                                        <button type="button" className="flex-1 bg-white text-black rounded-full py-3 px-4 flex items-center justify-center gap-2 hover:bg-gray-100 transition font-bold text-[12px] shadow-lg">
                                            <Mail size={14} /> Contact Me
                                        </button>
                                        <button type="button" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition flex-shrink-0">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Intro & Logos Section */}
                            <div className="p-6 pt-10 text-center border-b border-gray-100">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">About</p>
                                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-8">
                                    {profile?.bio || "Stand Out Design & Visual Identities for Global Creators, Startups & Clean Tech Mavericks."}
                                </h2>
                                <div className="flex items-center justify-center gap-6 opacity-60">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L1</span></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L2</span></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L3</span></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L4</span></div>
                                </div>
                            </div>

                            {/* Featured Case Studies Section */}
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

                                {/* Real Blocks mapped into Grid */}
                                <div className="flex flex-col gap-6">
                                    {otherBlocks.length > 0 ? otherBlocks.map((block: any, idx: number) => {
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
                                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Case Study</span>
                                                        </div>
                                                    </div>
                                                    <div className="px-1 flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg mb-0.5">{displayLabel}</h4>
                                                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Branding</p>
                                                        </div>
                                                        <ArrowUpRight size={18} className="text-gray-400 mt-1" />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (type === "link") {
                                            return (
                                                <a key={block.id} href={block.location_url} className="group bg-gray-50 hover:bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center p-4 gap-4 transition-all">
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
                                    }) : (
                                        /* Dummy Case Studies */
                                        <>
                                            <div className="group overflow-hidden">
                                                <div className="aspect-[4/3] bg-gray-100 rounded-3xl relative overflow-hidden mb-3 shadow-sm">
                                                    <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&q=80" className="w-full h-full object-cover" />
                                                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Case Study</span>
                                                    </div>
                                                </div>
                                                <div className="px-1 flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg mb-0.5">Fintech Rebrand</h4>
                                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Brand Identity</p>
                                                    </div>
                                                    <ArrowUpRight size={18} className="text-gray-400 mt-1" />
                                                </div>
                                            </div>
                                            <div className="group overflow-hidden mt-4">
                                                <div className="aspect-[4/3] bg-gray-100 rounded-3xl relative overflow-hidden mb-3 shadow-sm">
                                                    <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" className="w-full h-full object-cover" />
                                                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Case Study</span>
                                                    </div>
                                                </div>
                                                <div className="px-1 flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg mb-0.5">Wellness App</h4>
                                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">UI/UX Design</p>
                                                    </div>
                                                    <ArrowUpRight size={18} className="text-gray-400 mt-1" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPortfolioSubView("projects")}
                                    className="w-full mt-8 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]"
                                >
                                    View All Work
                                </button>
                            </div>

                            {/* Services Section */}
                            <div className="p-6 py-12 border-b border-gray-100 bg-gray-50/50">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Services</p>
                                <h3 className="text-2xl font-black text-gray-900 text-center mb-8 leading-tight">Services that transform brands</h3>

                                <div className="flex flex-col">
                                    <div className="py-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-400">01</span>
                                            <h4 className="text-lg font-bold text-gray-900">Brand Identity</h4>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                    <div className="py-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-400">02</span>
                                            <h4 className="text-lg font-bold text-gray-900">UI/UX Design</h4>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                    <div className="py-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-400">03</span>
                                            <h4 className="text-lg font-bold text-gray-900">Web Development</h4>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                            <ArrowUpRight size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Me Section */}
                            <div className="p-6 py-12 border-b border-gray-100">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">About Me</p>
                                <h3 className="text-2xl font-black text-gray-900 mb-6 leading-tight">Let's build something great your upcoming project.</h3>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Experience</p>
                                        <p className="text-lg font-bold text-gray-900">6+ Years</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-lg font-bold text-gray-900">Global</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Clients</p>
                                        <p className="text-lg font-bold text-gray-900">50+ Worldwide</p>
                                    </div>
                                </div>

                                <button type="button" className="w-full bg-black text-white rounded-full py-4 font-bold text-sm hover:bg-gray-800 transition">Book a Call</button>
                            </div>

                            {/* Process Section */}
                            <div className="p-6 py-12 border-b border-gray-100 bg-gray-50/50">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Process</p>
                                <h3 className="text-2xl font-black text-gray-900 text-center mb-10 leading-tight">Follow an authentic process</h3>

                                <div className="flex flex-col gap-6">
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mb-3 inline-block">Step 01</span>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Discovery</h4>
                                        <p className="text-sm text-gray-500">Understanding your brand, goals, and target audience.</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mb-3 inline-block">Step 02</span>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Design</h4>
                                        <p className="text-sm text-gray-500">Crafting the visual identity and user experience.</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mb-3 inline-block">Step 03</span>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">Delivery</h4>
                                        <p className="text-sm text-gray-500">Launching the project with full documentation.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Success Stories */}
                            <div className="p-6 py-12 border-b border-gray-100">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Testimonials</p>
                                <h3 className="text-2xl font-black text-gray-900 text-center mb-8 leading-tight">Client Success Stories</h3>

                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                                    <div className="text-orange-500 text-4xl font-serif absolute top-4 left-4 opacity-20">"</div>
                                    <p className="text-sm text-gray-700 leading-relaxed relative z-10 mb-6 font-medium">
                                        Working with Qasim was a game changer for our brand. The attention to detail and strategic approach completely elevated our market presence.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">Sarah Jenkins</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CEO, TechStart</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="p-6 py-12 border-b border-gray-100">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">FAQ</p>
                                <h3 className="text-2xl font-black text-gray-900 mb-8 leading-tight">Answers to your questions</h3>

                                <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                                    <div className="py-4 flex justify-between items-center cursor-pointer">
                                        <h4 className="text-sm font-bold text-gray-900">What is your typical timeline?</h4>
                                        <span className="text-xl text-gray-400">+</span>
                                    </div>
                                    <div className="py-4 flex justify-between items-center cursor-pointer">
                                        <h4 className="text-sm font-bold text-gray-900">Do you offer ongoing support?</h4>
                                        <span className="text-xl text-gray-400">+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 py-12 bg-[#0a0a0a] text-center flex flex-col items-center">
                                <h3 className="text-2xl font-black text-white mb-6 leading-tight max-w-[200px]">Ready to stand out from everyone?</h3>
                                <button type="button" className="bg-orange-600 text-white rounded-full py-3 px-8 font-bold text-sm mb-12 hover:bg-orange-700 transition">Let's Talk</button>

                                <div className="flex gap-4 mb-8">
                                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Globe size={16} /></div>
                                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Instagram size={16} /></div>
                                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Mail size={16} /></div>
                                </div>

                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">© 2026 {profile?.title || "Creator"}. All rights reserved.</p>
                            </div>
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
                                {/* Real blocks mapping (all of them) */}
                                {otherBlocks.map((block: any, idx: number) => {
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
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Case Study</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}

                                {/* Additional dummy projects to fill the page */}
                                <div className="group">
                                    <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
                                        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <h4 className="font-bold text-xl text-gray-900 mb-1">SaaS Dashboard</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Product Design</p>
                                </div>
                                <div className="group">
                                    <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
                                        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <h4 className="font-bold text-xl text-gray-900 mb-1">Crypto Exchange</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Web Development</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
