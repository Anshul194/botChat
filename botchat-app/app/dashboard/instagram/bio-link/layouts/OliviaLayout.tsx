import React from "react";
import { cn } from "@/lib/utils";
import { Mail, ArrowRight, Play } from "lucide-react";

export const OliviaLayout = ({ 
    profile, 
    otherBlocks,
    topAvatar,
    renderBlockUI,
    isMediaType,
    getUiTypeFromBlock,
    uiTypeOverrides
}: any) => {
    const mediaBlocks = otherBlocks.filter((b: any) => isMediaType(getUiTypeFromBlock(b, uiTypeOverrides)));

    return (
        <div className="flex flex-col bg-[#d7dec6] min-h-full w-full font-serif text-[#4a5531]">
            {/* Wavy/Marble Background Overlay */}
            <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden z-0">
                <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-150 rotate-12">
                    <path fill="#e2e8d5" d="M0 1000V0c150 0 150 100 300 100s150-100 300-100 150 100 300 100v900H0z" />
                    <path fill="#bcc7a6" d="M0 1000V200c150 0 150 100 300 100s150-100 300-100 150 100 300 100v700H0z" />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col">
                {/* Hero Section */}
                <div className="p-6 pt-12 flex flex-row items-center gap-4">
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h1 className="text-2xl sm:text-3xl font-serif text-[#6b7654] leading-[1.1] tracking-tight mb-6">
                            {profile?.title || "Olivia Warren"}
                        </h1>
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-70">UGC CREATOR</span>
                            <span className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-70 underline underline-offset-4 w-fit">EMAIL ME</span>
                        </div>
                    </div>
                    
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[4px] border-[#e2e8d5] shadow-xl shrink-0">
                        <img 
                            src={topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"} 
                            className="w-full h-full object-cover" 
                            alt={profile?.title}
                        />
                    </div>
                </div>

                {/* About Section */}
                <div className="p-6 pt-16 flex gap-4 sm:gap-6 items-start">
                    <div className="w-[35%] max-w-[120px] aspect-[4/5] bg-white rounded-lg overflow-hidden shadow-lg rotate-[-3deg] shrink-0">
                         <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 pt-1 min-w-0">
                        <p className="text-[8px] font-bold tracking-[0.2em] uppercase opacity-60 mb-2">PAST CREATIONS</p>
                        <h2 className="text-lg font-serif mb-4 leading-tight">About {profile?.title?.split(' ')[0] || "Olivia"}.</h2>
                        <p className="text-[10px] leading-relaxed opacity-80 mb-3 line-clamp-6">
                            {profile?.bio || "Olivia is a Los Angeles, CA based Content Creator that specializes in authentic, relatable User Generated Content."}
                        </p>
                    </div>
                </div>

                {/* My Work Section */}
                <div className="p-6 pt-12">
                    <h2 className="text-3xl font-serif mb-8">My Work</h2>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {mediaBlocks.length > 0 ? mediaBlocks.slice(0, 3).map((block: any, idx: number) => (
                             <div key={block.id} className={cn("rounded-lg overflow-hidden shadow-md bg-white/20", idx === 1 ? "mt-4" : "mt-0")}>
                                <div className="aspect-[2/3] relative">
                                    <img src={block.settings?.image || block.settings?.url || "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=800"} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                            <Play size={10} className="text-white fill-white ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )) : (
                            <>
                                <div className="rounded-lg overflow-hidden shadow-md bg-white/20">
                                    <div className="aspect-[2/3] relative"><img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800" className="w-full h-full object-cover" /></div>
                                </div>
                                <div className="rounded-lg overflow-hidden shadow-md bg-white/20 mt-4">
                                    <div className="aspect-[2/3] relative"><img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800" className="w-full h-full object-cover" /></div>
                                </div>
                                <div className="rounded-lg overflow-hidden shadow-md bg-white/20">
                                    <div className="aspect-[2/3] relative"><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800" className="w-full h-full object-cover" /></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* UGC Info Section */}
                <div className="p-6 py-12 mt-10 bg-[#e2e8d5]/30 backdrop-blur-sm rounded-t-[2.5rem]">
                    <div className="text-center mb-12">
                        <h3 className="text-xl font-serif mb-4 italic">What is UGC?</h3>
                        <p className="text-[10px] leading-relaxed opacity-70 max-w-[240px] mx-auto">
                            User-generated content (UGC) is any content—text, videos, images, reviews, etc.—created by real people, rather than brands or influencers.
                        </p>
                    </div>

                    <div className="text-center mb-16">
                        <h3 className="text-xl font-serif mb-4 italic">Why UGC?</h3>
                        <div className="space-y-1.5 text-[8px] font-bold uppercase tracking-widest opacity-60">
                            <p>Real People Trust Real People</p>
                            <p>Consumers crave real testimonials</p>
                            <p>Proven to increase conversions</p>
                            <p>It is adaptable & flexible</p>
                        </div>
                    </div>

                    {/* Stats Infographic */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-8">
                        <div className="flex flex-col gap-2">
                             <p className="text-[11px] font-serif leading-tight">
                                <span className="text-red-500 font-bold">90%</span> of consumers find user-generated content useful & authentic
                             </p>
                        </div>
                        <div className="flex flex-col gap-2">
                             <p className="text-[11px] font-serif leading-tight text-right">
                                <span className="text-red-500 font-bold">70%</span> of customers trust in the real people reviews before they make a purchase
                             </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-end gap-1 h-12 mb-4">
                            <div className="w-2.5 h-6 bg-[#8a9675] rounded-t-sm"></div>
                            <div className="w-2.5 h-10 bg-[#8a9675] rounded-t-sm"></div>
                            <div className="w-2.5 h-8 bg-[#8a9675] rounded-t-sm"></div>
                            <div className="w-2.5 h-12 bg-[#8a9675] rounded-t-sm"></div>
                            <div className="w-2.5 h-4 bg-[#8a9675] rounded-t-sm"></div>
                            <div className="w-2.5 h-9 bg-[#8a9675] rounded-t-sm"></div>
                        </div>
                        <p className="text-[11px] font-serif text-center max-w-[180px]">
                            Brands that use UGC see a <span className="text-red-500 font-bold">28%</span> higher customer engagement
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 py-12 bg-[#bcc7a6]/20 flex flex-col items-center gap-6">
                    <button type="button" className="bg-[#4a5531] text-white rounded-full py-3 px-8 font-bold text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        Let's Connect
                    </button>
                </div>
            </div>
        </div>
    );
};
