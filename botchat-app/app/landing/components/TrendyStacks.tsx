"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Heart, Workflow, Sparkles, User } from "lucide-react";

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
    color: "#006AFF" // Messenger Blue
  },
  {
    title: "Flow Logic Builder",
    name: "@marketing_guru",
    role: "500K Followers",
    desc: "No-code drag & drop builder for automated journeys that speak your brand voice.",
    icon: <Workflow className="w-5 h-5" />,
    metric: "Saves 20h/Week",
    color: "#25D366" // WhatsApp Green
  }
];

export default function TrendyStacks() {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-cycle the cards every 3 seconds if the user isn't hovering
  useEffect(() => {
    if (isHovering) return;
    
    const timer = setInterval(() => {
      setHoveredIndex((prev) => (prev + 1) % CREATORS.length);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [isHovering]);

  return (
    <section className="bg-black text-white relative overflow-hidden py-32">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF2D78] rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="max-w-7xl w-full mx-auto px-8 flex flex-col relative z-20">
        
        {/* Header Content */}
        <div className="flex flex-col items-center text-center mb-16">
           <div className="relative w-24 h-24 mb-8">
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
           
           <h2 className="text-5xl lg:text-7xl font-black font-display tracking-tighter leading-[0.9] mb-6">
              Strategy <span className="text-[#FF2D78]">Stacks</span>
           </h2>
           <p className="text-gray-400 text-lg font-body leading-relaxed max-w-2xl">
             Three powerful modules that stack together to build your digital empire automatically. Hover to explore.
           </p>
        </div>

        {/* Hover Expansion Accordion */}
        <div 
          className="flex flex-col md:flex-row gap-4 w-full h-[650px] md:h-[500px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {CREATORS.map((c, i) => {
            const isActive = hoveredIndex === i;

            return (
              <motion.div
                key={c.title}
                onMouseEnter={() => setHoveredIndex(i)}
                animate={{
                  flex: isActive ? 3 : 1,
                  borderColor: isActive ? `${c.color}50` : "rgba(255,255,255,0.1)",
                  backgroundColor: isActive ? "#0f0f0f" : "#050505",
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative overflow-hidden rounded-[32px] md:rounded-[40px] border cursor-pointer min-h-[100px]"
                style={{
                  boxShadow: isActive ? `0 20px 60px -20px ${c.color}30` : "none"
                }}
              >
                {/* Always Visible Top-Left Icon */}
                <div className="absolute top-6 left-6 z-20">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform shadow-lg"
                    style={{ backgroundColor: `${c.color}15`, color: c.color, borderColor: `${c.color}30`, borderWidth: 1 }}
                  >
                    {c.icon}
                  </div>
                </div>

                {/* Collapsed Title (Vertical on Desktop, Horizontal on Mobile) */}
                <motion.div 
                  initial={false}
                  animate={{ opacity: isActive ? 0 : 1 }}
                  className="absolute inset-0 flex items-center justify-center md:items-end md:pb-16 pointer-events-none z-10"
                >
                  <h3 className="text-xl md:text-2xl font-bold font-display text-white/60 md:-rotate-90 whitespace-nowrap origin-center tracking-wide pl-16 md:pl-0">
                    {c.title}
                  </h3>
                </motion.div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      className="absolute inset-0 p-8 flex flex-col z-10"
                    >
                      {/* Top Right Creator Profile */}
                      <div className="flex items-center justify-end mb-8">
                         <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                               <div className="text-sm font-bold font-display text-white">{c.name}</div>
                               <div className="text-xs text-gray-500 font-bold tracking-wider">{c.role}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                               <User className="w-5 h-5 text-gray-500" />
                            </div>
                         </div>
                      </div>

                      {/* Bottom Content */}
                      <div className="mt-auto">
                        <h3 className="text-3xl font-bold font-display text-white mb-3">{c.title}</h3>
                        <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8 max-w-[320px]">
                          {c.desc}
                        </p>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Impact</span>
                              <span className="text-xl font-bold font-display" style={{ color: c.color }}>{c.metric}</span>
                           </div>
                           <div 
                              className="px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-xl"
                              style={{ backgroundColor: c.color, color: "#fff" }}
                           >
                              Preview Flow
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
