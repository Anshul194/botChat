"use client";
// Force Next.js HMR Recompile

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";

const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function CreatorProof() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-rose-100/40 to-pink-50/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-purple-100/30 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p
            {...FADE_UP}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/60 px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            Who We Are
          </motion.p>

          <motion.h2
            {...FADE_UP}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95]"
          >
            Built by Creators.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
              Built for Creators.
            </span>
          </motion.h2>

          <motion.p
            {...FADE_UP}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            MegaDM was created by people who understand what it means to grow on Instagram and Facebook.
            Every feature is designed to turn your audience engagement into real business results.
          </motion.p>
        </div>

        {/* Trust pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Meta Official API */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-blue-50 via-white to-blue-50/50 p-8 shadow-lg shadow-blue-900/5 border border-blue-200/60 text-center overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
                {/* Meta "M" logo */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 20C4 17 5.5 14.5 8 13C10.5 11.5 13 12 15 14L16 15.5L17 14C19 12 21.5 11.5 24 13C26.5 14.5 28 17 28 20C28 24 25 27 21 27C19 27 17.5 26 16 24.5C14.5 26 13 27 11 27C7 27 4 24 4 20Z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Built on Meta&apos;s Official API</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fully compliant with Meta&apos;s platform policies. No grey-area workarounds — just safe, reliable automation.
              </p>
            </div>
          </div>

          {/* For Creators */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-rose-50 via-white to-pink-50/50 p-8 shadow-lg shadow-rose-900/5 border border-rose-200/60 text-center overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-200/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF2D78] to-[#E1306C] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-200">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Designed for Growth</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every workflow, trigger, and automation is engineered to convert your social engagement into real customers.
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="relative rounded-[28px] bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-8 shadow-lg shadow-emerald-900/5 border border-emerald-200/60 text-center overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-200/20 rounded-full blur-[60px] pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-200">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Safe &amp; Compliant</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your account&apos;s safety is our top priority. We follow every Meta guideline to keep your presence protected.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
