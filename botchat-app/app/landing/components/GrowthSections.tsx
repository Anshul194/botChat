"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Rocket, ShieldCheck } from "lucide-react";

const NARRATIVE = [
  {
    tag: "The Foundation",
    icon: <Zap size={14} fill="currentColor" />,
    text: "The most advanced AI Engine for creators."
  },
  {
    tag: "Velocity",
    icon: <Rocket size={14} fill="currentColor" />,
    text: "Automate your inbox, skyrocket your sales."
  },
  {
    tag: "Authority",
    icon: <ShieldCheck size={14} fill="currentColor" />,
    text: "Built for makers who value their time."
  }
];

interface CharProps {
  char: string;
  index: number;
  displayLength: MotionValue<number>;
}

function Char({ char, index, displayLength }: CharProps) {
  const opacity = useTransform(displayLength, [index - 0.5, index], [0, 1]);
  return (
    <motion.span style={{ opacity, display: "inline-block" }}>
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

export default function GrowthSections() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // TEXT 1: 0.05 -> 0.3
  const displayLength1 = useTransform(scrollYProgress, [0.05, 0.25], [0, NARRATIVE[0].text.length]);
  const opacity1 = useTransform(scrollYProgress, [0.05, 0.1, 0.3, 0.35], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0.05, 0.3, 0.35], [20, 0, -20]);

  // TEXT 2: 0.38 -> 0.65
  const displayLength2 = useTransform(scrollYProgress, [0.4, 0.6], [0, NARRATIVE[1].text.length]);
  const opacity2 = useTransform(scrollYProgress, [0.38, 0.43, 0.65, 0.7], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.38, 0.65, 0.7], [20, 0, -20]);

  // TEXT 3: 0.73 -> 1.0
  const displayLength3 = useTransform(scrollYProgress, [0.75, 0.95], [0, NARRATIVE[2].text.length]);
  const opacity3 = useTransform(scrollYProgress, [0.73, 0.78], [0, 1]);
  const y3 = useTransform(scrollYProgress, [0.73, 0.78], [20, 0]);

  // BUTTON
  const btnOpacity = useTransform(scrollYProgress, [0.96, 1], [0, 1]);
  const btnScale = useTransform(scrollYProgress, [0.96, 1], [0.9, 1]);

  if (!mounted) return <div ref={containerRef} className="h-[500vh] bg-white" />;

  return (
    <div ref={containerRef} className="relative bg-white antialiased">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
        
        {/* Soft Ambient Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60vh] h-[60vh] bg-pink-50/50 blur-[120px] rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[50vh] h-[50vh] bg-indigo-50/50 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">
          
          {/* TEXT BLOCK 1 */}
          <motion.div 
            style={{ opacity: opacity1, y: y1 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-6 pointer-events-none"
          >
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#e8175d] text-[10px] font-black tracking-widest uppercase">
               {NARRATIVE[0].icon} {NARRATIVE[0].tag}
             </div>
             <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-[#1a1235] tracking-tight leading-[1.1] max-w-4xl">
               {NARRATIVE[0].text.split("").map((char, i) => (
                  <Char key={`${i}-t1-${char}`} char={char} index={i} displayLength={displayLength1} />
               ))}
               <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[2px] h-[30px] md:h-[45px] lg:h-[60px] bg-pink-500 ml-2 align-middle"
               />
             </h2>
          </motion.div>

          {/* TEXT BLOCK 2 */}
          <motion.div 
            style={{ opacity: opacity2, y: y2 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-6 pointer-events-none"
          >
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#e8175d] text-[10px] font-black tracking-widest uppercase">
               {NARRATIVE[1].icon} {NARRATIVE[1].tag}
             </div>
             <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-[#1a1235] tracking-tight leading-[1.1] max-w-4xl">
               {NARRATIVE[1].text.split("").map((char, i) => (
                  <Char key={`${i}-t2-${char}`} char={char} index={i} displayLength={displayLength2} />
               ))}
               <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-[2px] h-[30px] md:h-[45px] lg:h-[60px] bg-pink-500 ml-2 align-middle"
               />
             </h2>
          </motion.div>

          {/* TEXT BLOCK 3 */}
          <motion.div 
            style={{ opacity: opacity3, y: y3 }}
            className="absolute inset-0 flex flex-col items-center justify-center space-y-12"
          >
             <div className="flex flex-col items-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#e8175d] text-[10px] font-black tracking-widest uppercase">
                  {NARRATIVE[2].icon} {NARRATIVE[2].tag}
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-[#1a1235] tracking-tight leading-[1.1] max-w-4xl">
                  {NARRATIVE[2].text.split("").map((char, i) => (
                    <Char key={`${i}-t3-${char}`} char={char} index={i} displayLength={displayLength3} />
                  ))}
                  <motion.span 
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-[2px] h-[30px] md:h-[45px] lg:h-[60px] bg-pink-500 ml-2 align-middle"
                  />
                </h2>
             </div>

             <motion.div 
               style={{ opacity: btnOpacity, scale: btnScale }}
               className="pt-4"
             >
                <button className="group relative inline-flex items-center gap-4 bg-[#e8175d] text-white px-8 py-4 rounded-[20px] text-lg font-bold tracking-tight hover:bg-[#1a1235] transition-all duration-500 shadow-[0_15px_30px_-5px_rgba(232,23,93,0.3)]">
                   Get Started Personally
                   <div className="p-1 rounded-lg bg-white/20 group-hover:bg-[#e8175d] transition-colors">
                      <ArrowRight size={18} />
                   </div>
                </button>
             </motion.div>
          </motion.div>

        </div>
      </div>

      <div className="h-[500vh]" />
    </div>
  );
}
