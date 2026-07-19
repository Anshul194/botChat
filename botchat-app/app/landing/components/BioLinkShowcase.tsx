"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  Layout,
  Palette,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  ExternalLink,
  Smartphone,
  MousePointer2
} from "lucide-react";

const features = [
  {
    title: "One Link, Endless Possibilities",
    description: "Aggregate all your social profiles, courses, and shops in one beautiful place.",
    icon: LinkIcon,
    color: "#FF2D78"
  },
  {
    title: "Stunning Layouts",
    description: "Choose from dozens of premium templates designed to convert visitors.",
    icon: Layout,
    color: "#00E5FF"
  },
  {
    title: "Deep Analytics",
    description: "Track every click and understand what drives your audience engagement.",
    icon: BarChart3,
    color: "#833AB4"
  },
  {
    title: "Custom Branding",
    description: "Match your unique style with custom fonts, colors, and interactive buttons.",
    icon: Palette,
    color: "#FF2D78"
  }
];

export default function BioLinkShowcase() {
  return (
    <section className="relative py-24 lg:py-32 bg-white overflow-hidden" id="bio-link">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-pink-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-cyan-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* LEFT: Content */}
          <div className="relative z-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-[#FF2D78] text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              New Feature
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-black leading-[1.1] mb-8"
            >
              Your Link-in-Bio, <br />
              <span className="text-[#FF2D78]">Elevated.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 text-lg md:text-xl leading-relaxed mb-12 max-w-xl"
            >
              Stop sending people to dead-end links. Create a premium, interactive landing page that showcases everything you do in seconds.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="group"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: `${feature.color}10`, color: feature.color }}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              <a
                href="/dashboard/instagram/bio-link"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-black text-white font-bold hover:bg-[#FF2D78] transition-all duration-300 group"
              >
                Create Your Bio-Link
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>

          {/* RIGHT: Mockup */}
          <div className="relative order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 mx-auto max-w-[320px] lg:max-w-[400px]"
            >
              {/* Phone Frame Mockup */}
              <div className="relative aspect-[9/19] rounded-[3rem] p-3 bg-black border-[8px] border-gray-900 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />
                <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden bg-white">
                  <Image
                    src="/bio-link-mockup.png"
                    alt="Bio Link Mockup"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 320px, 400px"
                  />
                </div>
              </div>

              {/* Floating Element: Analytics */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -right-12 top-1/4 z-20 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white flex flex-col gap-1 w-44"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Clicks</span>
                </div>
                <div className="text-2xl font-bold text-black tracking-tighter">1,284</div>
                <div className="text-[10px] text-green-600 font-bold">+12% from yesterday</div>
              </motion.div>

              {/* Floating Element: User Card */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -left-12 bottom-1/4 z-20 bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white flex items-center gap-4 w-52"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF2D78] to-[#833AB4] flex items-center justify-center text-white font-bold">
                  AR
                </div>
                <div>
                  <div className="text-xs font-bold text-black">Alex Rivera</div>
                  <div className="text-[10px] text-gray-500">Just created a page</div>
                </div>
                <MousePointer2 className="w-4 h-4 text-[#FF2D78] absolute -right-2 -bottom-2 animate-bounce" />
              </motion.div>

              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-pink-500/20 via-cyan-500/10 to-purple-500/20 blur-3xl -z-10" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
