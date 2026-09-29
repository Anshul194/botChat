"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Zap, Sparkles } from "lucide-react";

export default function MotiveSection() {
  return (
    <section
      id="why-megadm"
      className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-[#fff7fa] via-[#ffffff] to-[#fff5f8]"
    >
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-pink-200/40 blur-3xl rounded-full" />
        <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-rose-100/40 blur-3xl rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #e11d48 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Feature Explanation */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 rounded-full px-4 py-1.5 text-xs font-bold text-pink-600 uppercase tracking-widest mb-4 shadow-xs"
          >
            <Sparkles size={14} className="text-[#FF2D78]" />
            Why Choose MegaDM
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight"
          >
            All-in-One Platform for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#E1306C] to-[#1877F2]">
              Instagram & Facebook Growth
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-base sm:text-lg mt-4 leading-relaxed max-w-2xl mx-auto"
          >
            Automate conversations, manage multiple pages, broadcast messages, create stunning bio link pages and grow your audience — all in one powerful place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-7"
          >
            <a
              href="#get-started"
              className="px-7 py-3 rounded-full bg-gradient-to-r from-[#FF2D78] to-[#E1306C] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started <ArrowRight size={18} />
            </a>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-4 py-3 rounded-full shadow-xs">
              <Zap size={15} className="text-[#FF2D78]" /> Meta Official API Partner
            </div>
          </motion.div>
        </div>

        {/* Feature Infographic Image */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Decorative frame shadow & border */}
          <div className="relative rounded-3xl overflow-hidden border border-pink-100/80 bg-white shadow-2xl shadow-pink-500/10">
            <Image
              src="/y.webp"
              alt="MegaDM All-in-One Platform for Instagram and Facebook Growth Features"
              width={1600}
              height={2400}
              className="w-full h-auto object-contain block select-none"
              priority
            />
          </div>
        </motion.div>

        {/* Quick Highlights Row */}
        <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Visual Flow Builder", desc: "Drag & drop automation" },
            { title: "24/7 AI Agent", desc: "Never miss a customer" },
            { title: "Omnichannel Inbox", desc: "FB & Instagram unified" },
            { title: "Custom Bio Links", desc: "Convert clicks to sales" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white/80 backdrop-blur-sm border border-pink-100/70 rounded-2xl p-4 text-center shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-[#FF2D78] mx-auto mb-2" />
              <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{item.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}