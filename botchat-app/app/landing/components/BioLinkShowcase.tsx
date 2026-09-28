"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon, Layout, Palette, BarChart3, Zap, ArrowRight,
  ShoppingBag, Mic2, Dumbbell, Camera, Monitor, Smartphone, CheckCircle2,
} from "lucide-react";

const categories = [
  {
    id: "creator", label: "Creator", icon: Camera,
    accent: "#FF2D78", accentAlt: "#ff80ab",
    mobileBg: "linear-gradient(160deg,#18000e 0%,#2a0018 60%,#0a000a 100%)",
    desktopBg: "#0f000a",
    tagline: "Content Creator Hub",
    name: "@SaraCreates", avatar: "SC",
    bio: "Digital Creator - Reels & Photography - Helping you grow",
    links: [
      { label: "My Presets Pack", sub: "Lightroom Presets", color: "#FF2D78" },
      { label: "YouTube Channel", sub: "BTS & Tutorials", color: "#c2185b" },
      { label: "Newsletter", sub: "Weekly tips for creators", color: "#880e4f" },
      { label: "Merch Store", sub: "Limited drops", color: "#ad1457" },
    ],
    stats: ["12.4k clicks", "3.2k subs", "89% CTR"],
    desktopLinks: [
      { label: "Presets Pack" }, { label: "YouTube" }, { label: "Newsletter" },
    ],
  },
  {
    id: "shop", label: "Shop", icon: ShoppingBag,
    accent: "#00c6ff", accentAlt: "#72efdd",
    mobileBg: "linear-gradient(160deg,#00060f 0%,#001428 60%,#000610 100%)",
    desktopBg: "#00060f",
    tagline: "E-Commerce Storefront",
    name: "@LuxeFinds", avatar: "LF",
    bio: "Premium Products - Fast Shipping - Shop the drop",
    links: [
      { label: "Summer Collection", sub: "New arrivals", color: "#00c6ff" },
      { label: "Track Order", sub: "Order status & returns", color: "#0096c7" },
      { label: "Affiliate Program", sub: "Earn 20% commission", color: "#0077b6" },
      { label: "Reviews", sub: "500+ happy customers", color: "#0057a8" },
    ],
    stats: ["8.9k clicks", "2.1L sales", "74% CVR"],
    desktopLinks: [
      { label: "Shop Now" }, { label: "Track Order" }, { label: "Affiliate" },
    ],
  },
  {
    id: "podcast", label: "Podcast", icon: Mic2,
    accent: "#a855f7", accentAlt: "#d946ef",
    mobileBg: "linear-gradient(160deg,#07000e 0%,#12001f 60%,#040008 100%)",
    desktopBg: "#07000e",
    tagline: "Podcast & Audio Hub",
    name: "@MindfulMic", avatar: "MM",
    bio: "Top 10 Podcast - Business & Growth - New ep Monday",
    links: [
      { label: "Latest Episode", sub: "Ep. 87 - The Creator Economy", color: "#a855f7" },
      { label: "Apple Podcasts", sub: "Subscribe & Rate", color: "#7c3aed" },
      { label: "Spotify", sub: "Listen for free", color: "#6d28d9" },
      { label: "Show Notes", sub: "Resources & links", color: "#5b21b6" },
    ],
    stats: ["15k listeners", "#8 ranked", "97% rating"],
    desktopLinks: [
      { label: "Latest Ep." }, { label: "Spotify" }, { label: "Show Notes" },
    ],
  },
  {
    id: "fitness", label: "Fitness", icon: Dumbbell,
    accent: "#22c55e", accentAlt: "#86efac",
    mobileBg: "linear-gradient(160deg,#000e07 0%,#001510 60%,#000805 100%)",
    desktopBg: "#000e07",
    tagline: "Fitness & Wellness Hub",
    name: "@CoachAlex", avatar: "CA",
    bio: "NASM Certified - Online Coach - 500+ transformations",
    links: [
      { label: "Free Workout Plan", sub: "4-week beginner guide", color: "#22c55e" },
      { label: "Nutrition Guide", sub: "Meal prep made easy", color: "#16a34a" },
      { label: "1-on-1 Coaching", sub: "Apply for a spot", color: "#15803d" },
      { label: "Success Stories", sub: "Real transformations", color: "#166534" },
    ],
    stats: ["22k clicks", "430 clients", "4.9 rating"],
    desktopLinks: [
      { label: "Free Plan" }, { label: "Nutrition" }, { label: "Coaching" },
    ],
  },
];

type Category = typeof categories[0];

function MobileFrame({ cat }: { cat: Category }) {
  return (
    <div className="relative mx-auto" style={{ width: 200, flexShrink: 0 }}>
      <div
        className="relative overflow-hidden shadow-2xl"
        style={{
          width: 200, height: 400,
          border: "8px solid #1a1a2e", background: "#111",
          borderRadius: "2.8rem",
          boxShadow: `0 30px 80px -10px ${cat.accent}44, 0 0 0 1px #ffffff08`,
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 rounded-b-xl"
          style={{ width: 60, height: 18, background: "#1a1a2e" }} />
        <div className="relative w-full h-full overflow-hidden" style={{ background: cat.mobileBg }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
            style={{ background: cat.accent }} />
          <div className="relative z-10 flex flex-col items-center pt-8 px-3 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl border-2"
              style={{
                background: `linear-gradient(135deg,${cat.accent},${cat.accentAlt})`,
                borderColor: `${cat.accent}55`,
              }}>
              {cat.avatar}
            </div>
            <div className="text-center">
              <div className="text-white font-bold text-sm">{cat.name}</div>
              <div style={{ color: cat.accentAlt, fontSize: 9 }} className="mt-0.5 leading-snug px-2">
                {cat.bio.substring(0, 50)}...
              </div>
            </div>
            <div className="w-full flex flex-col gap-2 mt-1">
              {cat.links.map((link, i) => (
                <motion.div key={link.label}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className="rounded-xl px-3 py-2"
                  style={{ background: `${link.color}18`, border: `1px solid ${link.color}40` }}>
                  <div className="text-white font-semibold" style={{ fontSize: 9 }}>{link.label}</div>
                  <div style={{ color: cat.accentAlt, fontSize: 7 }}>{link.sub}</div>
                </motion.div>
              ))}
            </div>
            <div className="w-full flex justify-between mt-1">
              {cat.stats.map((s) => (
                <div key={s} className="text-center">
                  <div className="text-white font-bold" style={{ fontSize: 8 }}>{s.split(" ")[0]}</div>
                  <div style={{ color: cat.accentAlt, fontSize: 6 }}>{s.split(" ").slice(1).join(" ")}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-around items-center py-2"
            style={{
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
              borderTop: `1px solid ${cat.accent}25`,
            }}>
            {["Home", "Search", "Settings"].map((e) => (
              <div key={e} className="text-white" style={{ fontSize: 7 }}>{e}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-3/4 h-8 blur-2xl rounded-full pointer-events-none opacity-60"
        style={{ background: cat.accent }} />
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${cat.accent}18`, color: cat.accentAlt, border: `1px solid ${cat.accent}40` }}>
          <Smartphone className="w-3 h-3" />
          Mobile View
        </div>
      </div>
    </div>
  );
}

function DesktopFrame({ cat }: { cat: Category }) {
  const chartHeights = [40, 65, 50, 80, 55, 95, 70];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const clicks = [312, 194, 87];
  return (
    <div className="relative flex-1 min-w-0">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          border: "2px solid #ffffff12", background: "#0d0d0d",
          boxShadow: `0 30px 80px -15px ${cat.accent}33, 0 0 0 1px #ffffff06`,
        }}>
        <div className="flex items-center gap-2 px-4 py-3"
          style={{ background: "#1a1a1a", borderBottom: "1px solid #ffffff0a" }}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#28c940" }} />
          </div>
          <div className="flex-1 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2"
            style={{ background: "#0d0d0d", color: "#888", border: "1px solid #333" }}>
            <div className="w-3 h-3 rounded-full opacity-60" style={{ background: cat.accent }} />
            megadm.io/{cat.name.replace("@", "")}
          </div>
        </div>
        <div className="relative overflow-hidden" style={{ background: cat.desktopBg, minHeight: 280 }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: cat.accent }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
            style={{ background: cat.accentAlt }} />
          <div className="relative z-10 flex h-full" style={{ minHeight: 280 }}>
            <div className="flex flex-col items-center py-5 px-4 gap-4"
              style={{ width: "45%", borderRight: `1px solid ${cat.accent}18` }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-xl border-2"
                style={{
                  background: `linear-gradient(135deg,${cat.accent},${cat.accentAlt})`,
                  borderColor: `${cat.accent}55`,
                }}>
                {cat.avatar}
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-sm">{cat.name}</div>
                <div style={{ color: cat.accentAlt, fontSize: 10 }} className="mt-1 leading-snug">{cat.tagline}</div>
              </div>
              <div className="flex gap-3 w-full justify-center">
                {cat.stats.slice(0, 2).map((s) => (
                  <div key={s} className="text-center">
                    <div className="text-white font-bold text-xs">{s.split(" ")[0]}</div>
                    <div style={{ color: cat.accentAlt, fontSize: 8 }}>{s.split(" ").slice(1).join(" ")}</div>
                  </div>
                ))}
              </div>
              <div className="w-full flex flex-col gap-2">
                {cat.desktopLinks.map((l, i) => (
                  <motion.div key={l.label}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 * i }}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer group"
                    style={{ background: `${cat.accent}12`, border: `1px solid ${cat.accent}30` }}>
                    <span className="text-white text-xs font-medium">{l.label}</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: cat.accent }} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3">
              <div className="rounded-xl p-3" style={{ background: `${cat.accent}0e`, border: `1px solid ${cat.accent}22` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold text-xs">Analytics</span>
                  <span style={{ color: cat.accentAlt, fontSize: 9 }}>Last 7 days</span>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {chartHeights.map((h, i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: 0.05 * i + 0.2, duration: 0.5, ease: "easeOut" }}
                      className="flex-1 rounded-sm"
                      style={{
                        background: `linear-gradient(to top,${cat.accent},${cat.accentAlt})`,
                        minWidth: 6,
                      }} />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  {days.map((d, i) => (
                    <span key={`${d}-${i}`} style={{ color: cat.accentAlt, fontSize: 7 }}>{d}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-3 flex-1" style={{ background: `${cat.accent}08`, border: `1px solid ${cat.accent}18` }}>
                <div className="text-white font-bold text-xs mb-2">Recent Clicks</div>
                {cat.links.slice(0, 3).map((link, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span style={{ color: cat.accentAlt, fontSize: 9 }}>{link.label.substring(0, 22)}</span>
                    <span className="text-white font-bold" style={{ fontSize: 9 }}>{clicks[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${cat.accent}18`, color: cat.accentAlt, border: `1px solid ${cat.accent}40` }}>
          <Monitor className="w-3 h-3" />
          Desktop View
        </div>
      </div>
    </div>
  );
}

export default function BioLinkShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const cat = categories[activeIdx];
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden" id="bio-link"
      style={{ background: "linear-gradient(180deg,#06000d 0%,#0a000f 50%,#06000d 100%)" }}>
      <div className="pointer-events-none absolute top-1/3 right-0 rounded-full blur-3xl opacity-20"
        style={{ background: cat.accent, transition: "background 0.8s ease", width: 500, height: 500 }} />
      <div className="pointer-events-none absolute bottom-0 left-0 rounded-full blur-3xl opacity-15"
        style={{ background: cat.accentAlt, transition: "background 0.8s ease", width: 400, height: 400 }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border text-xs font-bold uppercase tracking-widest"
            style={{
              background: `${cat.accent}12`, borderColor: `${cat.accent}35`,
              color: cat.accentAlt, transition: "all 0.5s ease",
            }}>
            <Zap className="w-3.5 h-3.5" />
            Link-in-Bio Builder
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
            Your Link-in-Bio,{" "}
            <span style={{
              background: `linear-gradient(90deg,${cat.accent},${cat.accentAlt})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              transition: "all 0.5s ease",
            }}>
              Elevated.
            </span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }} className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            One beautiful page for all your links, products, and content. Pick a template for your niche and go live instantly.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((c, i) => {
            const Icon = c.icon;
            const isActive = i === activeIdx;
            return (
              <button key={c.id} onClick={() => setActiveIdx(i)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm"
                style={{
                  background: isActive ? `linear-gradient(135deg,${c.accent},${c.accentAlt})` : "rgba(255,255,255,0.04)",
                  color: isActive ? "#fff" : "#888",
                  border: `1.5px solid ${isActive ? "transparent" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isActive ? `0 0 24px ${c.accent}60` : "none",
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transition: "all 0.3s ease",
                }}>
                <Icon className="w-4 h-4" />
                {c.label}
              </button>
            );
          })}
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-10 lg:gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="flex flex-col gap-8">
            <AnimatePresence mode="wait">
              <motion.div key={cat.id + "-info"} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }}>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl mb-5 w-fit"
                  style={{ background: `${cat.accent}18`, border: `1px solid ${cat.accent}35` }}>
                  <cat.icon className="w-4 h-4" style={{ color: cat.accentAlt }} />
                  <span className="font-bold text-sm" style={{ color: cat.accentAlt }}>{cat.tagline}</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-4 leading-snug">
                  Perfect for<br />
                  <span style={{ color: cat.accent }}>{cat.label}s &amp; Influencers</span>
                </h3>
                <p className="text-gray-400 text-base leading-relaxed mb-6">
                  Beautifully designed bio pages tailored for your niche. Drive clicks, track analytics, and convert followers into customers from one link.
                </p>
                <div className="flex flex-col gap-3">
                  {["Drag-and-drop link builder", "Real-time analytics dashboard", "Custom domain & branding", "Mobile + Desktop optimized"].map((feat) => (
                    <div key={feat} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat.accent}20` }}>
                        <CheckCircle2 className="w-3 h-3" style={{ color: cat.accent }} />
                      </div>
                      <span className="text-gray-300 text-sm">{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/dashboard/instagram/bio-link"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-white"
                style={{
                  background: `linear-gradient(135deg,${cat.accent},${cat.accentAlt})`,
                  boxShadow: `0 10px 30px ${cat.accent}40`, transition: "all 0.4s ease",
                }}>
                Build Your Page Free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1.5px solid rgba(255,255,255,0.10)", color: "#bbb",
                }}>
                View Pricing
              </a>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={cat.id + "-stats"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-wrap gap-3">
                {cat.stats.map((s) => (
                  <div key={s} className="px-4 py-2 rounded-full text-sm font-bold"
                    style={{
                      background: `${cat.accent}15`, border: `1px solid ${cat.accent}30`,
                      color: cat.accentAlt,
                    }}>
                    {s}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={cat.id + "-canvases"}
                initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }} transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex items-start gap-5 justify-center lg:justify-start">
                <MobileFrame cat={cat} />
                <DesktopFrame cat={cat} />
              </motion.div>
            </AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              className="absolute -top-4 right-0 px-3 py-2 rounded-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md"
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: cat.accentAlt, boxShadow: `0 10px 40px ${cat.accent}30`, transition: "color 0.5s ease",
              }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: cat.accent }} />
              Live Preview
            </motion.div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.4 }} className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: LinkIcon, label: "All Links in One", desc: "Social, shop, blog, everything" },
            { icon: BarChart3, label: "Click Analytics", desc: "Track what converts best" },
            { icon: Palette, label: "Custom Themes", desc: "Match your brand perfectly" },
            { icon: Layout, label: "Mobile-First", desc: "Looks stunning everywhere" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="group relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${cat.accent}18`, transition: "background 0.5s ease" }}>
                <Icon className="w-5 h-5" style={{ color: cat.accent, transition: "color 0.5s ease" }} />
              </div>
              <div className="text-white font-bold text-sm mb-1">{label}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
