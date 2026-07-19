"use client";

import { motion, useInView } from "framer-motion";
import { Star, CheckCircle2, TrendingUp, Sparkles, Quote } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

const testimonials = [
  {
    name: "Samantha Wright",
    role: "@sam_creates",
    quote: "LinkDM doubled my reach in weeks. I no longer spend 4h/day on DMs.",
    result: "+240% Reach",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150",
    detail: "Replaced 4 hours of daily manual work with a fully automated funnel. Now she focuses only on content creation."
  },
  {
    name: "Alex Miller",
    role: "@marketing_alex",
    quote: "Collected 2,000+ emails directly from Reels. ROI is through the roof.",
    result: "2k+ Emails",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150",
    detail: "Used the Comment-to-Inbox trigger to build a massive email list from a single viral Reel campaign."
  },
  {
    name: "Elena Rossi",
    role: "@fashion_elena",
    quote: "Followers think I'm replying personally. Instant delivery works!",
    result: "10x Loyalty",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150",
    detail: "Followers get resources in 0.8s. The speed builds trust and turns casual fans into loyal buyers instantly."
  },
  {
    name: "Marcus Chen",
    role: "@marcus_vlog",
    quote: "Automated every comment for my launch. $50k in sales via DMs alone.",
    result: "$50k Sales",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150",
    detail: "Sold out his first digital product in 48 hours. LinkDM handled all the 'Where do I buy?' comments automatically."
  },
  {
    name: "Jessica Lee",
    role: "@jess_tech",
    quote: "The easiest setup I've ever seen. My conversion rate tripled overnight.",
    result: "3x Conversions",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150",
    detail: "Scaled her digital course sales by automating the 'link in bio' requests directly into DMs."
  },
  {
    name: "David Smith",
    role: "@dave_fitness",
    quote: "I save 20 hours a week. It's like having a full-time assistant for DMs.",
    result: "20h Saved/wk",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150",
    detail: "Manages a community of 500k without getting overwhelmed by the thousands of comments."
  }
];

// Duplicate for infinite effect
const infiniteTestimonials = [...testimonials, ...testimonials];

export default function Testimonials() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sliderRef, { once: false, amount: 0.1 });

  return (
    <section ref={sliderRef} className="py-24 bg-[#1a1235] relative overflow-hidden">
      {/* Dark Pink Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e8175d] opacity-20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#e8175d] opacity-10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 mb-16">
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-black tracking-widest uppercase mb-2 shadow-sm"
          >
            <Sparkles size={14} fill="currentColor" />
            Social Proof
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[0.9]">
            The Global <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-[#ff2d78]">Success List.</span>
          </h2>
          <p className="text-gray-300 font-medium text-lg max-w-2xl mx-auto">
            Scaling creators don't work harder, they automate smarter. Join the league of performant creators.
          </p>
        </div>
      </div>

      {/* Infinite Horizontal Slider */}
      <div className="flex overflow-hidden group">
        <motion.div
          animate={isInView ? { x: [0, -2100] } : { x: 0 }}
          transition={{ duration: 45, repeat: isInView ? Infinity : 0, ease: "linear" }}
          className="flex gap-8 px-4 py-8 pointer-events-auto hover:[animation-play-state:paused]"
        >
          {infiniteTestimonials.map((t, i) => (
            <div key={`${t.name}-${i}`} className="h-[400px] w-[350px] flex-shrink-0 [perspective:1200px] group/card">
              <div className="relative h-full w-full rounded-[48px] transition-all duration-700 [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">

                {/* FRONT side */}
                <div className="absolute inset-0 h-full w-full rounded-[48px] bg-white/5 border border-white/10 p-8 backdrop-blur-xl flex flex-col items-center justify-between text-center [backface-visibility:hidden]">
                  <div className="relative mb-6">
                    <img src={t.avatar} alt={t.name} width={96} height={96} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-2xl relative z-10 object-cover" />
                    <div className="absolute -bottom-1 -right-1 bg-pink-500 text-white p-1 rounded-full shadow-lg border-2 border-[#1a1235] z-20">
                      <CheckCircle2 size={16} fill="currentColor" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex gap-1 justify-center text-pink-400">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-current" />)}
                    </div>
                    <p className="text-white font-bold text-xl leading-tight italic tracking-tight">
                      “{t.quote}”
                    </p>
                  </div>

                  <div className="w-full pt-8 border-t border-white/5 flex flex-col gap-3">
                    <div className="inline-flex items-center justify-center gap-2 text-pink-400 font-black text-xs uppercase tracking-widest">
                      <TrendingUp size={14} />
                      {t.result}
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {t.name} · {t.role}
                    </div>
                  </div>
                </div>

                {/* BACK side */}
                <div className="absolute inset-0 h-full w-full rounded-[48px] bg-[#e8175d] p-8 text-white flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl">
                  <Quote size={40} className="text-white/20 mb-6 rotate-180" />
                  <p className="text-white font-bold text-lg leading-relaxed mb-6">
                    {t.detail}
                  </p>
                  <div className="mt-4 px-6 py-2 rounded-xl bg-[#1a1235] text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                    Full Case Study
                  </div>
                </div>

              </div>
            </div>
          ))}
        </motion.div>
      </div >

      {/* Manual Controls Callout */}
      < div className="text-center mt-12" >
        <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em]">
          Auto-sliding experience · Hover to flip
        </p>
      </div >
    </section >
  );
}