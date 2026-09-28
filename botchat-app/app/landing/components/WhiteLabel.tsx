"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Layers, Globe, Users, DollarSign } from "lucide-react";
import Link from "next/link";

export default function WhiteLabel() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0a0114 0%, #06000d 100%)" }} id="white-label">
      {/* Dark Pink Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-25 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" style={{ background: "#e8175d" }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-12 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" style={{ background: "#e8175d" }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-black tracking-widest uppercase shadow-sm"
          >
            <Sparkles size={14} fill="currentColor" />
            For Agencies & Resellers
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[0.9]"
          >
            Run MegaDM Under <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-[#ff2d78]">Your Own Brand.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-medium text-lg max-w-2xl mx-auto text-white/60 leading-relaxed"
          >
            Launch your own Instagram & Facebook automation platform without building the technology from scratch.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-5xl mx-auto mb-16">
          {[
            { icon: Shield, title: "Your Logo", desc: "Fully branded dashboard" },
            { icon: Layers, title: "Your Brand", desc: "Custom color schemes" },
            { icon: Globe, title: "Your Domain", desc: "Hosted on your URL" },
            { icon: Users, title: "Your Customers", desc: "Total client ownership" },
            { icon: DollarSign, title: "Your Pricing", desc: "Keep 100% of profits" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-4 text-pink-400">
                <item.icon size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-white/50 text-xs font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/white-label"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 to-[#ff2d78] text-white font-black text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(255,45,120,0.4)]"
          >
            Start Your White Label
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/contact-sales"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white font-black text-sm uppercase tracking-wider hover:bg-white/20 transition-all border border-white/10"
          >
            Talk to Sales
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
