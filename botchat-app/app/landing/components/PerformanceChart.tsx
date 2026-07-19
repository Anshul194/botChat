"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Users, TrendingUp, ArrowRight, Zap, Target, Sparkles } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const DATA = {
  before: [1, 1, 1, 2, 1, 3, 2, 1, 2, 1, 2, 1], // Stagnant Manual Replies
  after: [2, 1.5, 3.5, 5, 8, 7.5, 6.5, 8.5, 7.8, 4, 6, 4.5], // Exponential growth with LinkDM
};

const PersonIcon = ({ color = "currentColor", fill = "none" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function PerformanceChart() {
  const [active, setActive] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.4 });

  // Auto-toggle when someone scrolls to this section
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section className="py-32 bg-white relative overflow-hidden" ref={containerRef}>
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#fff5f8] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT: Motivating Text */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100/50 border border-pink-200 text-[#e8175d] text-xs font-black tracking-widest uppercase"
            >
              <Sparkles size={14} fill="currentColor" />
              The LinkDM Advantage
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-black text-[#1a1235] tracking-tight leading-[0.95]">
              Stop guessing. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8175d] to-[#ff2d78]">Start scaling.</span>
            </h2>

            <p className="text-[#6b5780] text-xl leading-relaxed font-medium max-w-lg">
              Manual management is a lead graveyard. While you're typing, your competitors are closing. 
              <span className="text-[#1a1235] font-bold"> LinkDM handles 100% of your interactions </span> 
              to turn every "how do I get this?" into a conversion.
            </p>

            <div className="flex flex-col gap-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 text-[#e8175d] border border-pink-100 shadow-sm">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-black text-[#1a1235] text-lg uppercase tracking-tight">Zero Leaks</h4>
                  <p className="text-[#7a4d73] text-sm">Every single comment is tracked and DM'd instantly. No one falls through the cracks.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0 text-[#e8175d] border border-pink-100 shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-black text-[#1a1235] text-lg uppercase tracking-tight">3x Conversion</h4>
                  <p className="text-[#7a4d73] text-sm">Speed to lead is king. By replying in 0.8s, conversion rates skyrocket by over 300%.</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Visual Comparison */}
          <div className="lg:col-span-7">
            <div className="relative p-1 bg-gray-100/30 rounded-[48px] backdrop-blur-sm shadow-2xl">
              <div className="bg-white rounded-[44px] p-8 md:p-12 relative overflow-hidden">
                
                {/* Visual Label */}
                <div className="flex justify-between items-center mb-12">
                   <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full transition-colors duration-700 ${active ? 'bg-pink-500 shadow-[0_0_10px_#e8175d]' : 'bg-gray-300'}`} />
                     <motion.span 
                       key={active ? "on" : "off"}
                       initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                       className="text-xs uppercase font-black tracking-widest text-[#1a1235]"
                     >
                       {active ? "Active: Solution Powered" : "Current: Manual Limits"}
                     </motion.span>
                   </div>
                   {active && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                       className="bg-[#1a1235] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter"
                     >
                       Verified ROI
                     </motion.div>
                   )}
                </div>

                <div className="grid grid-cols-6 md:grid-cols-12 gap-3 md:gap-4 relative z-10">
                  {MONTHS.map((month, i) => (
                    <div key={month} className="flex flex-col items-center gap-4 group">
                      <div className="relative h-[240px] md:h-[300px] w-full max-w-[48px] bg-gray-50/50 border border-gray-100 rounded-full overflow-hidden flex flex-col justify-end p-1 transition-all duration-700">
                        {/* THE FILL */}
                        <motion.div 
                          animate={{ 
                            height: active ? `${(DATA.after[i] / 9) * 100}%` : `${(DATA.before[i] / 9) * 100}%`,
                            background: active 
                              ? "linear-gradient(180deg, #1a1235 0%, #e8175d 100%)" 
                              : "linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)"
                          }}
                          transition={{ type: "spring", stiffness: 45, damping: 12, delay: i * 0.04 }}
                          className="w-full rounded-full relative z-0"
                        />
                        
                        {/* PERSON ICONS */}
                        <div className="absolute inset-0 flex flex-col justify-end p-1.5 gap-2">
                          {[...Array(9)].map((_, idx) => (
                            <div key={idx} className="h-full w-full flex items-center justify-center">
                              <motion.div 
                                animate={{ 
                                  opacity: active 
                                    ? (9 - idx <= DATA.after[i] ? 1 : 0.08) 
                                    : (9 - idx <= DATA.before[i] ? 1 : 0.03),
                                  scale: active && 9 - idx <= DATA.after[i] ? 1.05 : 0.8
                                }}
                                className="transition-all duration-700"
                              >
                                <PersonIcon 
                                  color={active && 9 - idx <= DATA.after[i] ? "#fff" : "#e8175d"}
                                  fill={active && 9 - idx <= DATA.after[i] ? "#fff" : "none"} 
                                />
                              </motion.div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-widest transition-colors duration-500 ${active ? 'text-[#e8175d]' : 'text-gray-400'}`}>
                        {month}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Floating 312% Badge */}
                <AnimatePresence>
                  {active && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5, rotate: -20, x: 50 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute bottom-12 right-12 bg-white rounded-3xl p-6 shadow-[0_24px_50px_rgba(232,23,93,0.3)] border border-pink-100 flex flex-col items-center text-center max-w-[160px] z-20"
                    >
                      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-4 text-[#e8175d]">
                        <TrendingUp size={24} />
                      </div>
                      <div className="text-4xl font-black text-[#1a1235] tracking-tight">+312%</div>
                      <div className="text-[10px] font-bold text-[#7a4d73] uppercase tracking-widest mt-1">
                        Leads Captured
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Vertical Split Reveal Line */}
                <motion.div 
                  initial={{ left: "0%" }}
                  animate={{ left: active ? "100%" : "0%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-0 bottom-0 w-px bg-pink-500 shadow-[0_0_15px_pink] z-30 pointer-events-none opacity-40"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
