import React from "react";
import { cn } from "@/lib/utils";
import { Plus, Link as LinkIcon, Instagram, Youtube, Twitter, Mail, ExternalLink, ChevronRight, Share2 } from "lucide-react";

export const UniversalLayout = ({ 
    profile, 
    otherBlocks,
    topAvatar,
    renderBlockUI,
    getUiTypeFromBlock,
    uiTypeOverrides
}: any) => {
    // Separate links from other content
    const linkBlocks = otherBlocks.filter((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'link' || getUiTypeFromBlock(b, uiTypeOverrides) === 'socials');
    const contentBlocks = otherBlocks.filter((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) !== 'link' && getUiTypeFromBlock(b, uiTypeOverrides) !== 'socials');

    return (
        <div className="flex flex-col bg-[#0f172a] min-h-full w-full font-sans text-white overflow-x-hidden">
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/30 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-emerald-600/10 blur-[100px] rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Minimalist Navigation */}
                <div className="w-full p-6 flex justify-between items-center">
                    <div className="w-8 h-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Plus size={14} className="text-white/60" />
                    </div>
                    <button type="button" className="w-8 h-8 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                        <Share2 size={14} className="text-white/60" />
                    </button>
                </div>

                {/* Hero Section */}
                <div className="px-6 pb-10 flex flex-col items-center text-center mt-4">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2.5rem] overflow-hidden border-2 border-white/20 p-1 bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl relative z-10">
                            <img 
                                src={topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80"} 
                                className="w-full h-full object-cover rounded-[2rem]" 
                                alt={profile?.title}
                            />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                        {profile?.title || "Creator Name"}
                    </h1>
                    <p className="text-[13px] text-white/60 font-medium leading-relaxed max-w-[280px] mb-8">
                        {profile?.bio || "Crafting digital experiences and sharing insights across any niche."}
                    </p>

                    {/* Social Quick-Access */}
                    <div className="flex gap-4">
                        {[Instagram, Youtube, Twitter, Mail].map((Icon, idx) => (
                             <div key={idx} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer">
                                <Icon size={18} className="text-white/80" />
                             </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full px-6 space-y-12 pb-32 mt-4">
                    
                    {/* 1. Dynamic Links Section (Trendy Glass List) */}
                    {linkBlocks.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Connect & Explore</h2>
                                <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                            </div>
                            <div className="space-y-3">
                                {linkBlocks.map((block: any, idx: number) => (
                                    <div key={block.id} className="group relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-300"></div>
                                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/[0.08] transition-all cursor-pointer">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center text-blue-400">
                                                <LinkIcon size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white/90 truncate">{block.settings?.title || "Visit Link"}</p>
                                                <p className="text-[10px] text-white/40 truncate font-medium">Click to open external resource</p>
                                            </div>
                                            <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. Media / Portfolio Grid */}
                    {contentBlocks.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Visual Feed</h2>
                                <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {contentBlocks.filter((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'image' || getUiTypeFromBlock(b, uiTypeOverrides) === 'square_media').slice(0, 4).map((block: any) => (
                                    <div key={block.id} className="aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/5 group relative">
                                        <img src={block.settings?.image || block.settings?.url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-[10px] font-bold truncate">View Details</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Featured YouTube Section */}
                    {otherBlocks.some((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'youtube') && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Latest Video</h2>
                                <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                            </div>
                            {otherBlocks.filter((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'youtube').map((block: any) => (
                                <div key={block.id} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-600 rounded-3xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
                                    <div className="relative aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                        {renderBlockUI(block, false, 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 4. Trendy Stats Bar */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Community", value: "240K" },
                            { label: "Vibe", value: "High" },
                            { label: "Growth", value: "↑30%" }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
                                <p className="text-lg font-black text-white">{stat.value}</p>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* 5. Spotify / Music Module */}
                    {otherBlocks.some((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'spotify') && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Vibe Check</h2>
                                <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                            </div>
                            {otherBlocks.filter((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'spotify').map((block: any) => (
                                <div key={block.id} className="rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
                                    {renderBlockUI(block, false, 0)}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 6. Trendy Skills Cloud */}
                    <div>
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Tech & Skills</h2>
                            <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['Strategy', 'Creative', 'Dev', 'AI', 'Growth', 'Vision'].map((tag) => (
                                <span key={tag} className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-default">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 7. Support / Payments Section */}
                    {otherBlocks.some((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'paypal') && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Support Me</h2>
                                <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                            </div>
                            {otherBlocks.filter((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'paypal').map((block: any) => (
                                <div key={block.id} className="relative group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-[2.5rem] opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
                                    <div className="relative">
                                        {renderBlockUI(block, false, 0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 8. Testimonials Section (Glass Box) */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-blue-500/10 blur-3xl rounded-full"></div>
                        <div className="absolute bottom-[-20px] right-[-20px] w-24 h-24 bg-purple-500/10 blur-3xl rounded-full"></div>
                        <p className="text-[13px] text-white/70 italic leading-relaxed mb-8 relative z-10">
                            "Innovation distinguishes between a leader and a follower. This creator truly leads with their vision and execution."
                        </p>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                                <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-[10px] font-black">VJ</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-tight text-white">Victor James</p>
                                <p className="text-[9px] text-white/30 uppercase tracking-widest">Founder, Nexus Labs</p>
                            </div>
                        </div>
                    </div>

                    {/* 9. FAQ / Process Section */}
                    <div>
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Workflow FAQ</h2>
                            <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                        </div>
                        <div className="space-y-3">
                            {[
                                "What is the typical project timeline?",
                                "How do we handle revisions?",
                                "What tools are in the arsenal?"
                            ].map((q, idx) => (
                                <div key={idx} className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.06] transition-all cursor-pointer">
                                    <p className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors">{q}</p>
                                    <Plus size={12} className="text-white/20 group-hover:rotate-90 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 10. Newsletter Section (Trendy Gradient) */}
                    <div className="relative rounded-[2.5rem] overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative p-10 border border-white/10 backdrop-blur-3xl text-center">
                            <h3 className="text-xl font-black mb-3">Stay in Sync</h3>
                            <p className="text-[12px] text-white/50 mb-8 max-w-[200px] mx-auto">Get the latest insights and trendy updates directly.</p>
                            <div className="flex flex-col gap-3">
                                <input type="email" placeholder="Your Email" className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[12px] outline-none focus:bg-white/10 transition-all text-center" />
                                <button className="w-full h-14 bg-[var(--card)] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Subscribe Now</button>
                            </div>
                        </div>
                    </div>

                    {/* 11. Business Hours (Trendy Glass Card) */}
                    {otherBlocks.some((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'business_hours') && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Availability</h2>
                                <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                            </div>
                            {otherBlocks.filter((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === 'business_hours').map((block: any) => (
                                <div key={block.id} className="rounded-3xl border border-white/10 bg-white/[0.02] p-2">
                                    {renderBlockUI(block, false, 0)}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 12. Trendy Pricing / Packages Section */}
                    <div>
                         <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Work With Me</h2>
                            <div className="h-[1px] flex-1 mx-4 bg-white/5"></div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: "Basic Kit", price: "$49", features: ["3 High-Res Assets", "Basic License", "24h Delivery"] },
                                { name: "Pro Vision", price: "$199", features: ["Full Brand Kit", "Commerical License", "Priority Support"] }
                            ].map((pkg, idx) => (
                                <div key={idx} className="p-6 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 group hover:border-blue-500/50 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-sm font-black text-white">{pkg.name}</h4>
                                            <p className="text-[20px] font-black text-blue-400 mt-1">{pkg.price}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            <Plus size={16} />
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {pkg.features.map((f, fi) => (
                                            <li key={fi} className="text-[10px] text-white/40 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-blue-500"></div> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 13. Brand Logos / Trust Section */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 text-center mb-8">Trusted by Global Brands</p>
                        <div className="grid grid-cols-4 gap-8 opacity-20 grayscale brightness-200 px-4">
                            <div className="aspect-square bg-[var(--card)] rounded-xl"></div>
                            <div className="aspect-square bg-[var(--card)] rounded-xl"></div>
                            <div className="aspect-square bg-[var(--card)] rounded-xl"></div>
                            <div className="aspect-square bg-[var(--card)] rounded-xl"></div>
                        </div>
                    </div>

                    {/* 14. Trendy Contact Form Section */}
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                        <h3 className="text-sm font-black text-white mb-6 text-center uppercase tracking-widest">Send a Message</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Full Name" className="w-full h-12 bg-black/20 border border-white/5 rounded-xl px-4 text-[11px] outline-none" />
                            <textarea placeholder="Your Message" rows={4} className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-[11px] outline-none resize-none"></textarea>
                            <button className="w-full h-12 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Send Vibe</button>
                        </div>
                    </div>

                    {/* 15. Catch-all for remaining blocks */}
                    <div className="space-y-6 pt-10 border-t border-white/5">
                        {otherBlocks.filter((b: any) => !['link', 'socials', 'image', 'square_media', 'youtube', 'spotify', 'paypal', 'business_hours'].includes(getUiTypeFromBlock(b, uiTypeOverrides))).map((block: any, idx: number) => (
                            <div key={block.id}>
                                {renderBlockUI(block, false, idx)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating Contact CTA */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[min(300px,calc(100%-3rem))]">
                    <button type="button" className="w-full h-14 bg-[var(--card)] text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                        Get In Touch <ExternalLink size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
