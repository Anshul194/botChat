"use client";

import { motion } from "framer-motion";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";
import { 
  Shield, 
  Layers, 
  Globe, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut"
    }
  })
};

export default function WhiteLabelPage() {
  return (
    <>
      <PageMeta
        title="White Label & Reseller Program"
        description="Run MegaDM under your own brand. Launch your own Instagram & Facebook automation platform for your agency or clients."
      />
      <div className="min-h-screen bg-[#06000d] text-white selection:bg-[#FF2D78]/30 selection:text-white">
        <Navbar />

        {/* ── HERO SECTION ── */}
        <section className="relative pt-[200px] lg:pt-[240px] pb-32 overflow-hidden flex flex-col items-center">
          {/* Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-pink-500/10 blur-[120px] rounded-[100%] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-pink-300 text-xs font-black tracking-widest uppercase mb-8 shadow-xl backdrop-blur-md"
            >
              <Sparkles size={14} className="text-[#FF2D78]" />
              For Agencies & Resellers
            </motion.div>
            
            <motion.h1
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeIn}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-[1000] tracking-tight leading-[1.05] mb-8"
            >
              Sell social automation <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C]">
                under your own brand.
              </span>
            </motion.h1>
            
            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={fadeIn}
              className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto mb-12 font-medium leading-relaxed"
            >
              Launch your own Instagram & Facebook automation platform without building the technology from scratch.
            </motion.p>
            
            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
              variants={fadeIn}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Link
                href="/auth/sign-up?plan=whitelabel"
                className="group w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#FF2D78] to-[#E1306C] text-white font-black text-sm uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,45,120,0.3)]"
              >
                Start Your White Label
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact-sales"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center"
              >
                Talk to Sales
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── WHAT THE AGENCY GETS ── */}
        <section className="py-32 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeIn}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">What the agency gets</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">Everything you need to run a highly profitable standalone SaaS business.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Layers, title: "Total Branding", desc: "Your logo, custom colors, and unique branding across the entire client-facing dashboard." },
                { icon: Users, title: "Client Management", desc: "Add, manage, and assign custom limits to your individual clients from one master view." },
                { icon: Shield, title: "Reseller Capability", desc: "Sell access to the platform and keep 100% of the profits. You control your own pricing." },
                { icon: Globe, title: "Custom Domain", desc: "Host the entire platform on your own subdomain (e.g., app.youragency.com)." },
                { icon: DollarSign, title: "Bio Links Included", desc: "Clients get access to the Bio Link Builder, fully white-labeled under your brand." },
                { icon: CheckCircle2, title: "Account Limits", desc: "Flexible limits to support multiple Meta accounts per workspace without extra overhead." },
              ].map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx + 1}
                  variants={fadeIn}
                  className="group p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-pink-500/40 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF2D78]/20 to-[#E1306C]/10 border border-[#FF2D78]/30 flex items-center justify-center text-[#FF2D78] mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white/90">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-32 relative bg-gradient-to-b from-[#06000d] to-[#0a0114]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeIn}
              className="text-center mb-24"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase mb-6">
                <Zap size={14} />
                Simple Workflow
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black">How it works</h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative">
              {/* Connector Line */}
              <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-white/5 rounded-full" />
              
              {[
                { step: "01", title: "Subscribe", desc: "Sign up for the White Label base plan." },
                { step: "02", title: "Brand", desc: "Upload your logo & set your custom domain." },
                { step: "03", title: "Manage", desc: "Create workspaces for your individual clients." },
                { step: "04", title: "Sell", desc: "Sell the service under your brand at any price." },
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx + 1}
                  variants={fadeIn}
                  className="relative text-center md:text-left flex flex-col items-center md:items-start group"
                >
                  <div className="w-28 h-28 rounded-full bg-[#06000d] border border-white/10 flex items-center justify-center text-5xl font-black text-white/20 mb-8 relative z-10 group-hover:border-[#FF2D78]/50 group-hover:text-[#FF2D78] transition-colors shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 text-sm md:pr-4">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="py-32 relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          {/* Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] bg-gradient-to-br from-pink-500/10 to-purple-500/10 blur-[150px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6">Transparent Pricing</h2>
              <p className="text-white/60 text-lg">No hidden fees. Avoid ambiguous add-ons. Scale as you grow.</p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeIn}
              className="rounded-[3rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 md:p-16 relative overflow-hidden shadow-2xl max-w-4xl mx-auto"
            >
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF2D78]/10 blur-[100px] -z-10 rounded-full" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#833AB4]/10 blur-[100px] -z-10 rounded-full" />
              
              <div className="flex flex-col lg:flex-row gap-12 lg:items-center">
                
                {/* Left side: Price */}
                <div className="lg:w-1/2">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-widest mb-6">
                    White Label Base Plan
                  </div>
                  <div className="text-7xl font-black text-white mb-2 tracking-tight">
                    $299<span className="text-2xl text-white/40 font-bold">/mo</span>
                  </div>
                  <p className="text-white/50 mb-8 font-medium">Includes everything you need to launch.</p>
                  
                  <Link
                    href="/auth/sign-up?plan=whitelabel"
                    className="block w-full text-center py-5 rounded-2xl bg-gradient-to-r from-[#FF2D78] to-[#E1306C] text-white font-black text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-[0_10px_30px_rgba(255,45,120,0.3)]"
                  >
                    Start White Label Now
                  </Link>
                </div>

                {/* Right Side: Features */}
                <div className="lg:w-1/2 lg:pl-12 lg:border-l border-white/10">
                  <ul className="space-y-5 mb-10">
                    {[
                      "10 Connected Meta Accounts",
                      "Unlimited Users/Clients",
                      "Custom Domain & Complete Branding",
                      "No MegaDM branding anywhere",
                      "Full feature access (Automation & Bio Links)"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-[#FF2D78]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={14} className="text-[#FF2D78]" />
                        </div>
                        <span className="text-white/80 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-blue-400" />
                      <span className="font-bold text-white">Expansion Blocks</span>
                    </div>
                    <p className="text-white/60">Need more capacity? Just add <strong className="text-white">+$25/mo</strong> per additional 5 Meta Accounts.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-32 relative bg-[#0a0114]">
          <div className="max-w-4xl mx-auto px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">White Label FAQ</h2>
              <p className="text-white/60 text-lg">Got questions? We've got answers.</p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { q: "Is the MegaDM logo completely removed?", a: "Yes, once you set up your White Label, all MegaDM branding is removed from the dashboard, emails, and generated links." },
                { q: "Can I host it on my own domain?", a: "Yes, you can easily map the dashboard to a subdomain like app.youragency.com via simple DNS settings." },
                { q: "Who handles customer support?", a: "You handle tier-1 support for your clients directly. We handle tier-2 technical support directly with your team." },
                { q: "How do I bill my clients?", a: "You can charge your clients whatever you want using your own payment gateway (Stripe, PayPal, etc.). We only bill you for the base plan." }
              ].map((faq, idx) => (
                <motion.div 
                  key={idx} 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx + 1}
                  variants={fadeIn}
                  className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <h4 className="font-bold text-xl mb-4 text-white">{faq.q}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
