"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Send, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function BroadcastingShowcase() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[#06000d]">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#FF2D78]/10 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* LEFT: Text Content */}
          <div className="lg:w-1/2 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-[#FF2D78] text-xs font-black tracking-widest uppercase mb-8 shadow-sm"
            >
              <Send size={14} fill="currentColor" />
              Direct Outreach
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6"
            >
              Instagram & Facebook <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C]">
                Broadcasting.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
            >
              Send targeted broadcasts to eligible Instagram and Facebook contacts directly from MegaDM. Re-engage recent conversations, share updates, offers and follow-ups from one workspace.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4 mb-10"
            >
              {[
                { title: "Smart Audience Segmentation", desc: "Filter contacts by tags, variables, or recent engagement." },
                { title: "Rich Media Messages", desc: "Send carousels, buttons, images, and quick replies." },
                { title: "Live Analytics", desc: "Track delivery, open rates, and direct click-throughs in real-time." }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1 border border-white/10">
                    <CheckCircle2 size={16} className="text-[#FF2D78]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                    <p className="text-sm text-white/50">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Critical Compliance Warning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 max-w-xl"
            >
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-500/90 font-bold mb-1">Meta Policy Note</p>
                <p className="text-xs text-amber-500/70 leading-relaxed">
                  Broadcasting availability is subject to Meta's 24-hour messaging window and platform rules. You can only broadcast to contacts who have interacted with your page within the last 24 hours.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: UI Mockup */}
          <div className="lg:w-1/2 order-1 lg:order-2 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: -10, rotateX: 5 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative perspective-1000 w-full"
            >
              {/* Dashboard Glass Mockup */}
              <div className="relative rounded-[2rem] border border-white/10 bg-[#090312]/80 backdrop-blur-xl shadow-2xl overflow-hidden shadow-[#FF2D78]/20">
                {/* MacOS style window controls */}
                <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                
                {/* Mockup Image */}
                <div className="relative aspect-[16/10] w-full bg-[#06000d]">
                  <Image
                    src="/images/megadm_broadcasting_showcase.png"
                    alt="MegaDM Broadcasting Interface"
                    fill
                    className="object-cover object-top opacity-90"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  {/* Subtle overlay gradient to match the dark theme */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#06000d]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Floating Widget: Time Remaining */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 sm:-bottom-10 -left-6 sm:-left-10 z-20 bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl flex items-center gap-4 w-[280px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-amber-500/30">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-wider mb-1">Eligible Audience</div>
                  <div className="text-xl font-bold text-white flex items-center gap-2">
                    12,408 <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">In 24h Window</span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Widget: Send Status */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="absolute -top-6 sm:-top-10 -right-4 sm:-right-8 z-20 bg-gradient-to-br from-[#FF2D78] to-[#E1306C] p-4 rounded-3xl border border-white/20 shadow-2xl flex flex-col gap-2 w-48"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Send size={14} className="ml-0.5" />
                  </div>
                  <div className="text-[10px] font-black text-white/80 bg-white/10 px-2 py-1 rounded-full uppercase">Sending</div>
                </div>
                <div className="text-2xl font-black text-white">84%</div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
                  <div className="w-[84%] h-full bg-white rounded-full" />
                </div>
                <div className="text-[10px] text-white/70 font-medium mt-1">Delivering to 12.4k contacts</div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
