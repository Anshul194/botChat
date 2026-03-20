"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Target, Heart, Rocket, Workflow, Sparkles, User, MessageCircle } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CREATORS = [
  {
    title: "AI Sniper Replies",
    name: "@alex_digital",
    role: "280K Followers",
    desc: "Instantly targets comments with context-aware AI responses that feel 100% human.",
    icon: <Target className="w-5 h-5" />,
    metric: "3x Faster Conversion",
    color: "#FF2D78"
  },
  {
    title: "Story Magnet",
    name: "@sarah.social",
    role: "120K Followers",
    desc: "Auto-engages with story mentions and reactions. Deepen bonds while you sleep.",
    icon: <Heart className="w-5 h-5" />,
    metric: "+45% Engagement",
    color: "#FF2D78"
  },
  {
    title: "Flow Logic Builder",
    name: "@marketing_guru",
    role: "500K Followers",
    desc: "No-code drag & drop builder for automated journeys that speak your brand voice.",
    icon: <Workflow className="w-5 h-5" />,
    metric: "Saves 20h/Week",
    color: "#FF2D78"
  }
];

export default function TrendyStacks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray(".stack-card");
    
    // Create the pinning effect
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: `+=${cards.length * 100}%`,
        pin: true,
        scrub: 1,
      }
    });

    // Animate cards stacking one by one
    cards.forEach((card: any, i) => {
      if (i === 0) return; // First card is already visible
      
      tl.fromTo(card,
        { y: "150%", rotate: 5, scale: 0.9 },
        { 
          y: i * 20, // Final stack position with slight offset
          rotate: 0, 
          scale: 1,
          ease: "power2.out",
        },
        i === 1 ? "0" : `>-0.2` // Start shortly after previous card
      );
    });

  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="bg-black text-white min-h-screen relative overflow-hidden flex items-center justify-center py-20"
    >
      <div className="max-w-6xl w-full px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Content - Sticky in Pin */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-20">
           <div className="relative w-28 h-28 mb-10">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-[#FF2D78]/20 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="p-4 bg-[#FF2D78]/10 rounded-full border border-[#FF2D78]/30">
                    <Sparkles className="w-8 h-8 text-[#FF2D78]" />
                 </div>
              </div>
           </div>
           
           <h2 className="text-5xl lg:text-7xl font-black font-display tracking-tighter leading-[0.9] mb-8">
              Strategy <span className="text-[#FF2D78]">Stacks</span>
           </h2>
           <p className="text-gray-400 text-lg font-body leading-relaxed max-w-sm">
             Three powerful modules that stack together to build your digital empire automatically.
           </p>

           <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                       {i === 4 ? "+11k" : <User className="w-4 h-4" />}
                    </div>
                 ))}
              </div>
              <span className="text-gray-500 text-sm font-bold">Trusted by creators</span>
           </div>
        </div>

        {/* Right - The Deck of Cards */}
        <div className="relative w-full h-[500px] flex items-center justify-center">
          {CREATORS.map((c, i) => (
            <div
              key={i}
              className="stack-card absolute top-0 w-full max-w-[440px] p-10 rounded-[48px] bg-[#0a0a0a] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex flex-col group transition-all duration-500 hover:border-[#FF2D78]/30"
              style={{ 
                zIndex: i + 10,
                // Initial state for static view (before scroll)
                transform: i === 0 ? "none" : "translateY(150%) rotate(5deg) scale(0.9)"
              }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                       <User className="w-7 h-7 text-gray-500" />
                    </div>
                    <div>
                       <div className="text-xl font-bold font-display text-white">{c.name}</div>
                       <div className="text-sm text-gray-500 font-bold tracking-wider">{c.role}</div>
                    </div>
                 </div>
                 <div className="w-12 h-12 rounded-xl bg-[#FF2D78]/10 flex items-center justify-center text-[#FF2D78] border border-[#FF2D78]/20 group-hover:scale-110 transition-transform">
                    {c.icon}
                 </div>
              </div>

              <h3 className="text-2xl font-bold font-display text-white mb-4">{c.title}</h3>
              <p className="text-gray-400 text-base leading-relaxed mb-10 flex-1">
                {c.desc}
              </p>

              <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Impact</span>
                    <span className="text-lg font-bold text-[#FF2D78] font-display">{c.metric}</span>
                 </div>
                 <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-[#FF2D78] hover:border-[#FF2D78] transition-all cursor-pointer">
                    Preview Flow
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF2D78] rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-[150px] animate-pulse" />
      </div>
    </section>
  );
}
