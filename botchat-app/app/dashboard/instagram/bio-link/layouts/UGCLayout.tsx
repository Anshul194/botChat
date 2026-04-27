import React from "react";
import { cn } from "@/lib/utils";
import { Instagram, Mail, Globe, ArrowUpRight, Youtube, Share2, Play } from "lucide-react";

export const UGCLayout = ({
    profile,
    otherBlocks,
    topAvatar,
    instagramUsername,
    getUiTypeFromBlock,
    uiTypeOverrides,
    isMediaType,
    renderBlockUI
}: any) => {
    // Separate blocks into categories based on name/label if possible, otherwise use dummy
    const mediaBlocks = otherBlocks.filter((b: any) => isMediaType(getUiTypeFromBlock(b, uiTypeOverrides)));

    return (
        <div className="flex flex-col bg-white min-h-full w-full font-sans">
            {/* UGC Hero Section - Parisian Elegant Style */}
            <div className="p-6 pb-12 flex flex-col relative overflow-hidden bg-[#faf9f6]">
                <div className="flex justify-between items-start mb-6 z-10">
                    <div className="flex gap-4">
                        <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Home</span>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">About</span>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Work</span>
                    </div>
                </div>

                <div className="flex flex-col relative z-10 min-w-0">
                    <h1 className="text-3xl sm:text-5xl font-serif italic text-gray-800 leading-tight mb-4 max-w-[180px] break-words">
                        Ready to elevate your content?
                    </h1>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[200px] mb-8 break-words opacity-80">
                        I'm {profile?.title?.split(' ')[0] || "Kate"}, an expert content creator and strategist.
                        Helping brands tell their stories through authentic and aesthetic visuals.
                    </p>

                    <div className="flex flex-wrap gap-2 mb-10">
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white transition-all shadow-sm shrink-0"><Instagram size={14} /></div>
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white transition-all shadow-sm shrink-0"><Youtube size={14} /></div>
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white transition-all shadow-sm shrink-0"><Share2 size={14} /></div>
                        <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-white transition-all shadow-sm shrink-0"><Mail size={14} /></div>
                    </div>

                    {/* Floating Media Cards - Scaled down for mobile */}
                    <div className="absolute top-6 right-[-30px] w-40 aspect-[2/3] rotate-3 shadow-2xl rounded-2xl overflow-hidden border-[4px] border-white z-0">
                        <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80" className="w-full h-full object-cover" alt="Fashion" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Play size={16} className="text-white fill-white ml-1" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-36 right-[-20px] w-32 aspect-square -rotate-6 shadow-xl rounded-2xl overflow-hidden border-[4px] border-white z-0 opacity-80">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80" className="w-full h-full object-cover" alt="Paris" />
                    </div>
                </div>

                <div className="mt-16">
                    <ArrowUpRight size={20} className="text-gray-300 rotate-90" />
                </div>
            </div>

            {/* Logo Cloud Section */}
            <div className="p-8 py-16 bg-white flex flex-col items-center">
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-[1px] w-12 bg-gray-100"></div>
                    <h2 className="text-3xl font-serif italic text-gray-800">About {profile?.title?.split(' ')[0] || "Kate"}</h2>
                    <div className="h-[1px] w-12 bg-gray-100"></div>
                </div>

                <div className="grid grid-cols-4 gap-8 opacity-30 grayscale mb-12">
                    <div className="w-8 h-8 rounded-full bg-gray-900"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-900"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-900"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-900"></div>
                </div>

                <p className="text-sm text-gray-600 text-center leading-relaxed max-w-[280px]">
                    Specializing in beauty, fashion, and lifestyle content that converts.
                    I've worked with over 50+ brands to create engaging UGC that drives results.
                </p>
            </div>

            {/* Reviews Section - Bubble Style */}
            <div className="p-8 py-16 bg-[#faf9f6]">
                <h2 className="text-3xl font-serif italic text-gray-800 text-center mb-12">Reviews & Results</h2>
                <div className="flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-t-3xl rounded-br-3xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 italic leading-relaxed mb-4">
                            "Absolutely incredible to work with! Kate understood our vision perfectly and delivered high-quality content that outperformed all our other ads."
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">— Sarah, Brand Manager</p>
                    </div>
                    <div className="bg-white p-6 rounded-t-3xl rounded-bl-3xl shadow-sm border border-gray-100 self-end ml-10">
                        <p className="text-xs text-gray-500 italic leading-relaxed mb-4">
                            "The videos Kate created were so authentic. Our community loved them and we saw a 40% increase in engagement!"
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">— David, Founder</p>
                    </div>
                </div>
            </div>

            {/* Content Categories Section */}
            <div className="p-6 py-16 bg-white">
                <div className="mb-12">
                    <h2 className="text-3xl font-serif italic text-gray-800 mb-6">Beauty Content</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {mediaBlocks.slice(0, 2).map((block: any, idx: number) => (
                            <div key={block.id} className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group">
                                <img src={block.settings?.image || block.settings?.url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800"} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Play size={20} className="text-white fill-white opacity-80" />
                                </div>
                            </div>
                        ))}
                        {/* Fallback dummy if no media blocks */}
                        {mediaBlocks.length < 1 && (
                            <>
                                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group">
                                    <img src="https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=800&q=80" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play size={20} className="text-white fill-white opacity-80" /></div>
                                </div>
                                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group mt-4">
                                    <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play size={20} className="text-white fill-white opacity-80" /></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-3xl font-serif italic text-gray-800 mb-6">Fashion Content</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {mediaBlocks.slice(2, 4).map((block: any, idx: number) => (
                            <div key={block.id} className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group">
                                <img src={block.settings?.image || block.settings?.url || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Play size={20} className="text-white fill-white opacity-80" />
                                </div>
                            </div>
                        ))}
                        {/* Fallback dummy if no media blocks */}
                        {mediaBlocks.length < 3 && (
                            <>
                                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group">
                                    <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play size={20} className="text-white fill-white opacity-80" /></div>
                                </div>
                                <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative group mt-4">
                                    <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play size={20} className="text-white fill-white opacity-80" /></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Contact */}
            <div className="p-8 py-20 bg-[#faf9f6] text-center">
                <h2 className="text-3xl font-serif italic text-gray-800 mb-8 leading-tight">Let's create something beautiful together.</h2>
                <button type="button" className="bg-gray-900 text-white rounded-full py-4 px-10 font-bold text-sm hover:bg-black transition-all shadow-xl">
                    Get in Touch
                </button>
            </div>
        </div>
    );
};
