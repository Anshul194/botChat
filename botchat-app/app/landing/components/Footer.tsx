"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Instagram, Twitter, Linkedin, Facebook, ArrowRight, MessageCircle, ShieldCheck, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0b] text-white pt-24 pb-12 overflow-hidden antialiased">

      {/* 🌫️ AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 blur-[140px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* TOP SECTION: Main Navigation & Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24 mb-24 pr-4">

          {/* BRAND COLUMN */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#e8175d] to-[#ff2d78] shadow-[0_8px_25px_-5px_rgba(232,23,93,0.4)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tighter">botChat<span className="text-pink-500">.</span></span>
            </div>

            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
              The world's most advanced <span className="text-white hover:text-pink-400 cursor-default transition-colors duration-300">automation engine</span> for social growth and precision conversion.
            </p>

            <div className="flex items-center gap-4">
              {[
                { icon: <Instagram size={18} />, href: "#", name: "Instagram" },
                { icon: <Twitter size={18} />, href: "#", name: "Twitter" },
                { icon: <Facebook size={18} />, href: "#", name: "Facebook" },
                { icon: <Linkedin size={18} />, href: "#", name: "LinkedIn" }
              ].map((social) => (
                <Link
                  key={social.name} href={social.href}
                  aria-label={`Visit us on ${social.name}`}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white hover:text-[#0a0a0b] hover:scale-110 transition-all duration-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* LINK COLUMNS */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-8">

              <div className="space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-pink-500">Solutions</h4>
                <ul className="space-y-4">
                  {['Comment Strikers', 'DM Funnels', 'Data Mining', 'AI Automation'].map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-slate-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center gap-2 group">
                        <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300 text-pink-500">—</span>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">Links</h4>
                <ul className="space-y-4">
                  {[
                    { n: 'Features', h: '/features' },
                    { n: 'Pricing', h: '/pricing' },
                    { n: 'Blog Insights', h: '/blog' },
                    { n: 'Documentation', h: '#' }
                  ].map((link) => (
                    <li key={link.n}>
                      <Link href={link.h} className="text-slate-400 hover:text-white transition-all duration-300 text-sm font-medium flex items-center gap-2 group">
                        <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300 text-pink-500">—</span>
                        {link.n}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-2 md:col-span-1 space-y-8">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-500">Status</h4>
                <div className="p-6 rounded-[32px] bg-white/[0.03] border border-white/[0.05] space-y-4 relative overflow-hidden group hover:border-pink-500/30 transition-all duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-bold text-white tracking-widest uppercase">System Operational</span>
                  </div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    All official APIs running at peak speed.
                  </p>
                  <button className="flex items-center gap-2 text-pink-500 text-[10px] font-bold uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
                    View Status <ArrowRight size={12} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Legal & Local */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 pl-2">

            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <p className="text-center md:text-left">&copy; {currentYear} botChat Lab. PROUDLY BUILT FOR THE NEXT BILLION CREATORS.</p>
            <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-8 gap-y-3">
              <Link href="/home/privacy_policy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/home/terms_use" className="text-slate-400 hover:text-white transition-colors">Terms of Use</Link>
              <Link href="/home/accessibility" className="text-slate-400 hover:text-white transition-colors">Accessibility Statement</Link>
              <Link href="/home/accessibility#sign-language" className="text-slate-400 hover:text-white transition-colors">German Sign Language (DGS)</Link>
              <Link href="/home/accessibility#easy-read" className="text-slate-400 hover:text-white transition-colors">Easy-to-Read</Link>
              <Link href="/home/accessibility#report-barrier" className="text-slate-400 hover:text-white transition-colors">Report a Barrier</Link>
              <Link href="/sitemap.xml" className="text-slate-400 hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white transition-colors duration-300 group cursor-default">
            <ShieldCheck size={14} className="group-hover:text-pink-500 transition-colors" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Verified Meta Technology</span>
          </div>

        </div>

      </div>
    </footer>
  );
}
