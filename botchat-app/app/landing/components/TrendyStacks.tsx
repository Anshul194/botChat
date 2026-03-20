"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { User, MessageCircle, Star, ShieldCheck, Heart, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CREATORS = [
  {
    name: "@alex_social",
    role: "Digital Marketer",
    stat: "2.4M+ Leads",
    icon: <Zap className="w-6 h-6 text-pink-500" />,
    desc: "Uses AI Sniper to reply to 1,000+ comments daily while staying authentic.",
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        <motion.circle 
          cx="100" cy="100" r="60" fill="none" stroke="#FF2D78" strokeWidth="1" 
          animate={{ strokeDashoffset: [0, 400] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    )
  },
  {
    name: "@sarah_creatives",
    role: "UGC Expert",
    stat: "85% Conversion",
    icon: <Heart className="w-6 h-6 text-pink-500" />,
    desc: "Automated her story reactions. Now her engagement is on cruise control.",
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
        <rect x="40" y="40" width="120" height="120" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <motion.path 
          d="M40 100 Q100 0 160 100 T280 100" 
          fill="none" stroke="#FF2D78" strokeWidth="2" 
          animate={{ d: ["M40 100 Q100 0 160 100 T280 100", "M40 100 Q100 200 160 100 T280 100", "M40 100 Q100 0 160 100 T280 100"] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </svg>
    )
  },
  {
    name: "@marketing_guru",
    role: "Agency Owner",
    stat: "20h+ Saved/Week",
    icon: <ShieldCheck className="w-6 h-6 text-pink-500" />,
    desc: "The Bio-Link funnel is a game changer. Capturing leads has never been this easy.",
    svg: (
      <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
        <polygon points="100,20 180,180 20,180" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <motion.circle 
          cx="100" cy="100" r="10" fill="#FF2D78" 
          animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>
    )
  }
];

export default function TrendyStacks() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cards = gsap.utils.toArray(".stack-card");
    
    // Total scroll duration based on number of cards
    const totalHeight = (cards.length - 1) * 100;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: `+=${totalHeight}%`,
      pin: true,
      scrub: 1,
    });

    cards.forEach((card: any, i) => {
      if (i === 0) return;
      
      gsap.fromTo(card,
        { y: "150vh", rotate: 2 },
        {
          y: i * 30, // Stack with slight offset
          rotate: 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start: `top+=${(i - 1) * 100}% top`,
            end: `top+=${i * 100}% top`,
            scrub: true,
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="bg-black text-white min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-24"
    >
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-20">
        {/* Left: Content */}
        <div>
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 text-pink-500 text-[10px] font-black uppercase tracking-widest mb-6"
           >
              Success Stories
           </motion.div>
           <h2 className="text-5xl md:text-6xl font-black font-display tracking-tight leading-none mb-8">
              The Creator <br /> <span className="text-pink-500">Playbook.</span>
           </h2>
           <p className="text-gray-400 text-lg font-body leading-relaxed max-w-sm mb-12">
              See how the world's best creators are using ReplyRush to scale their influence to millions.
           </p>
           
           <div className="flex gap-8">
              <div>
                 <div className="text-3xl font-black text-white font-display">25M+</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">DMs Sent</div>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                 <div className="text-3xl font-black text-white font-display">11K+</div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">Creators</div>
              </div>
           </div>
        </div>

        {/* Right: The Stacks */}
        <div className="relative h-[450px] w-full">
          {CREATORS.map((c, i) => (
            <div
              key={i}
              className="stack-card absolute top-0 left-0 w-full p-10 rounded-[48px] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden group"
              style={{ zIndex: i + 10 }}
            >
              <div className="absolute inset-0 z-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-700">
                 {c.svg}
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                         <User className="w-7 h-7 text-gray-400" />
                      </div>
                      <div>
                         <div className="text-xl font-bold font-display text-white">{c.name}</div>
                         <div className="text-sm text-pink-500 font-bold uppercase tracking-widest">{c.role}</div>
                      </div>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-pink-500/20 flex items-center justify-center bg-pink-500/5">
                      {c.icon}
                   </div>
                </div>

                <p className="text-gray-400 text-base leading-relaxed mb-10 font-body">
                   “{c.desc}”
                </p>

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Lifetime Stat</span>
                      <span className="text-xl font-bold text-white font-display">{c.stat}</span>
                   </div>
                   <button className="px-6 py-2.5 rounded-full bg-pink-500 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95">
                      View Flow
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
