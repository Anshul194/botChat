"use client";

import { motion } from "framer-motion";
import { Zap, MessageSquare, Target, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Connect",
    desc: "Link your Instagram and Facebook in 2 clicks. No complex setup or coding required.",
    color: "#e8175d",
    bg: "rgba(232, 23, 93, 0.05)"
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Trigger",
    desc: "Set 'Keyword' triggers. When someone comments, LinkDM is ready to strike.",
    color: "#e8175d",
    bg: "rgba(232, 23, 93, 0.05)"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Convert",
    desc: "We send the DM, the gift, or the link instantly. You focus on creating content.",
    color: "#e8175d",
    bg: "rgba(232, 23, 93, 0.05)"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Scale",
    desc: "Watch your conversion rates double as automation handles 100% of your leads.",
    color: "#e8175d",
    bg: "rgba(232, 23, 93, 0.05)"
  }
];

export default function StepsSection() {
  return (
    <section className="py-24 bg-[#fff5f8]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-pink-100 text-[#e8175d] text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm"
          >
            The Workflow
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1a1235] tracking-tight mb-4">
            Four simple steps to <span className="text-[#e8175d]">hyper-growth.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-[40px] p-8 border border-gray-100 shadow-[0_12px_45px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_45px_100px_-20px_rgba(232,23,93,0.12)] transition-all duration-300"
            >
              <div 
                className="w-16 h-16 rounded-3xl mb-8 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300"
                style={{ background: step.bg, color: step.color }}
              >
                {step.icon}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <span className="text-4xl font-black text-gray-50 tabular-nums select-none group-hover:text-pink-50 transition-colors">0{i+1}</span>
                   <h3 className="text-2xl font-black text-[#1a1235] tracking-tight">{step.title}</h3>
                </div>
                <p className="text-[#6b5780] leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-20 opacity-20 pointer-events-none group-hover:translate-x-2 group-hover:opacity-60 transition-all duration-500">
                  <ArrowRight className="w-8 h-8 text-[#e8175d]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
