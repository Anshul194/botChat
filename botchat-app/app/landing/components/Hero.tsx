"use client";
// NextJS HMR Force Save

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useAnimate, stagger } from "framer-motion";
import { Zap, ArrowRight, Play, Server, MessageSquare, ShieldCheck, ZapIcon, BarChart3, Database } from "lucide-react";

/* ─────────────────────────────────────────
   AURORA BACKGROUND
───────────────────────────────────────── */
const Aurora = React.memo(function Aurora() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 25 });
  const auroraRef = useRef<HTMLDivElement>(null);

  const glowLeft = useTransform(springX, (x) => `${x - 220}px`);
  const glowTop = useTransform(springY, (y) => `${y - 220}px`);

  useEffect(() => {
    const el = auroraRef.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Base dark */}
      <div ref={auroraRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" style={{ background: "#06000d" }}>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 grid-bg opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,45,120,.35) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }} />

        {/* Edge vignette */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, #06000d 90%)" }} />

        {/* ── Blobs ── */}
        <div className="blob1 absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full opacity-50 mix-blend-screen"
          style={{ background: "radial-gradient(circle, #ff2d78 0%, transparent 65%)", filter: "blur(100px)" }} />

        <div className="blob2 absolute -bottom-40 -right-40 w-[750px] h-[750px] rounded-full opacity-40 mix-blend-screen"
          style={{ background: "radial-gradient(circle, #e1306c 0%, transparent 60%)", filter: "blur(110px)" }} />

        <div className="blob3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 mix-blend-screen"
          style={{ background: "radial-gradient(circle, #ff80ab 0%, transparent 70%)", filter: "blur(80px)" }} />

        {/* Mouse follower glow */}
        <motion.div
          className="absolute w-[440px] h-[440px] rounded-full opacity-55 mix-blend-screen hidden lg:block"
          style={{
            left: glowLeft,
            top: glowTop,
            background: "radial-gradient(circle, rgba(255,100,160,.8) 0%, transparent 60%)",
            filter: "blur(70px)"
          }}
        />
      </div>
    </>
  );
});

/* ─────────────────────────────────────────
   FLOATING STAT CARDS
───────────────────────────────────────── */
function StatChip({ value, label, delay, className }: { value: string; label: string; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: .9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: .7, ease: [.16, .77, .31, .99] }}
      className={`stat-card rounded-2xl px-4 py-3 ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="text-xl font-bold text-white leading-none" style={{ fontFamily: "'Syne', sans-serif" }}>{value}</div>
      <div className="text-xs text-pink-300/80 mt-0.5 whitespace-nowrap">{label}</div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   FLOATING NOTIFICATION
───────────────────────────────────────── */
function NotifCard({ icon, text, sub, delay, className }: { icon: string; text: string; sub: string; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: .8, ease: [.16, .77, .31, .99] }}
      className={`notif-card rounded-2xl px-4 py-3 flex items-center gap-3 ${className}`}
    >
      <span className="text-2xl">{icon}</span>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="text-white text-sm font-medium leading-tight">{text}</div>
        <div className="text-pink-300/80 text-xs mt-0.5">{sub}</div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   VISUAL CAROUSEL COMPONENTS
───────────────────────────────────────── */

function BrowserStage() {
  const tabs = ["Instagram", "Twitter", "LinkedIn"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % tabs.length), 2000);
    return () => clearInterval(id);
  }, []);

  const comments = [
    { user: "sarah_creates", avatar: "SC", comment: "This is absolutely 🔥🔥🔥", platform: "IG", replied: true },
    { user: "dev_marcus", avatar: "DM", comment: "How long did this take??", platform: "TW", replied: true },
    { user: "priya.writes", avatar: "PW", comment: "Love this aesthetic!", platform: "LI", replied: false },
    { user: "alex_motion", avatar: "AM", comment: "Can we collab? DM me!", platform: "IG", replied: true },
  ];

  return (
    <div className="w-full h-full">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5"
        style={{ background: "rgba(255,255,255,.03)" }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-pink-500/70" />
          <div className="w-3 h-3 rounded-full bg-pink-300/40" />
          <div className="w-3 h-3 rounded-full bg-white/20" />
        </div>
        <div className="flex-1 mx-4 rounded-lg px-3 py-1.5 text-xs text-white/60 border border-white/8"
          style={{ background: "rgba(255,255,255,.04)", fontFamily: "'DM Sans', sans-serif" }}>
          app.replai.io/dashboard
        </div>
        <div className="live-badge flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-pink-500/30"
          style={{ background: "rgba(255,45,120,.1)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
          <span className="text-[10px] font-bold text-pink-400 tracking-wider" style={{ fontFamily: "'Syne', sans-serif" }}>LIVE</span>
        </div>
      </div>

      <div className="flex gap-1 px-5 pt-4 pb-2">
        {tabs.map((t, i) => (
          <div key={t}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              background: active === i ? "rgba(255,45,120,.2)" : "transparent",
              color: active === i ? "#ff80ab" : "rgba(255,255,255,.6)",
              border: active === i ? "1px solid rgba(255,45,120,.3)" : "1px solid transparent"
            }}>
            {t}
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 space-y-2">
        {comments.map((c, i) => (
          <div key={c.user} className="flex items-start gap-3 p-3 rounded-xl border border-white/5" style={{ background: "rgba(255,255,255,.02)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: `hsl(${330 + i * 25}, 80%, 55%)`, fontFamily: "'Syne', sans-serif" }}>
              {c.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white/80" style={{ fontFamily: "'Syne', sans-serif" }}>@{c.user}</div>
              <p className="text-xs text-white/70 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{c.comment}</p>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${c.replied ? "text-pink-400 border border-pink-500/25 bg-pink-500/10" : "text-white/60 border border-white/10 bg-white/5"}`}>
              {c.replied ? "Replied ✓" : "Replying…"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoStage() {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="w-full h-full relative">
      {videoError ? (
        /* ── graceful fallback when video fails ── */
        <div className="w-full h-full flex flex-col items-center justify-center gap-4"
          style={{ background: "linear-gradient(135deg,#0a0411 0%,#1a0828 100%)" }}>
          <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
            <Play className="w-7 h-7 text-pink-400 fill-pink-400" />
          </div>
          <p className="text-pink-300/80 text-xs font-semibold tracking-widest uppercase">Demo Video</p>
        </div>
      ) : (
        <video
          autoPlay
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          poster="/mobile_preview.png"
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-pink-500 text-white">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold text-pink-400 uppercase tracking-widest" style={{ fontFamily: "'Syne', sans-serif" }}>Solution Demo</div>
            <div className="text-white text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>Scaling engagement globally</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationStage() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-8 space-y-8">
      <div className="grid grid-cols-2 gap-4 w-full">
        {[
          { label: "Replies", val: "1.2M", icon: <MessageSquare className="w-5 h-5 text-pink-500" /> },
          { label: "Accounts", val: "60K", icon: <Database className="w-5 h-5 text-pink-500" /> },
          { label: "Growth", val: "+240%", icon: <BarChart3 className="w-5 h-5 text-pink-500" /> },
          { label: "Safety", val: "100%", icon: <Server className="w-5 h-5 text-pink-500" /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center"
          >
            <div className="mb-2">{stat.icon}</div>
            <div className="text-xl font-bold text-white font-display">{stat.val}</div>
            <div className="text-[10px] text-pink-200/80 uppercase tracking-widest font-bold">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
        <div className="text-xs font-body text-pink-100/90">AI active: Processing real-time interactions...</div>
      </div>
    </div>
  );
}

function VisualCarousel() {
  const [stage, setStage] = useState(0);
  const stages = [
    { component: <BrowserStage />, label: "Dashboard" },
    { component: <VideoStage />, label: "Video" },
    { component: <AutomationStage />, label: "Automation" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="device-glow relative w-full aspect-[4/3] lg:aspect-auto lg:h-[500px] rounded-[32px] overflow-hidden border border-pink-500/20"
      style={{ background: "#0a0411" }}>

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full h-full"
        >
          {stages[stage].component}
        </motion.div>
      </AnimatePresence>

      {/* Stage Dots */}
      <div className="absolute bottom-6 right-6 flex gap-2 z-30" role="tablist" aria-label="Stage navigation">
        {stages.map((_, i) => (
          <button
            key={i}
            onClick={() => setStage(i)}
            role="tab"
            aria-selected={stage === i}
            aria-label={`Show ${stages[i].label} stage`}
            className={`h-1.5 rounded-full transition-all duration-500 ${stage === i ? "w-8 bg-pink-500" : "w-2 bg-white/20 hover:bg-white/40"}`}
          />
        ))}
      </div>

      <div className="scan absolute left-0 right-0 h-[2px] pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,80,140,.5), transparent)" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
export default function Hero() {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(".hero-text-elem", { opacity: 1, y: 0 }, { duration: 1.1, delay: stagger(0.14), ease: [0.16, 0.77, 0.31, 0.99] });
    animate(".hero-right", { opacity: 1, x: 0 }, { duration: 1.4, ease: "easeOut", delay: 0.5 });
  }, [animate]);

  return (
    <section
      ref={scope}
      className="relative min-h-screen flex items-center pt-28 pb-20 px-6 overflow-hidden"
      style={{ background: "#06000d", color: "#f0e0f0" }}
    >
      <Aurora />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-20 items-center">

        {/* ── LEFT ── */}
        <div className="order-1 space-y-8">

          {/* Badge */}
          <div className="hero-text-elem inline-flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{
              background: "rgba(255,45,120,.08)",
              borderColor: "rgba(255,45,120,.28)",
              color: "#ff80ab",
              boxShadow: "0 0 40px rgba(255,45,120,.18)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: ".72rem",
              fontWeight: 700,
              letterSpacing: ".12em",
              textTransform: "uppercase"
            }}>
            <Zap className="w-3.5 h-3.5" /> AI-Augmented Platform
          </div>

          {/* Headline */}
          <h1 className="hero-text-elem font-display leading-[1.06] tracking-tight"
            style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)" }}>
            <span className="block text-white uppercase tracking-tighter">DM Automation for</span>
            <span className="shimmer-text block mt-1">Instagram & Facebook</span>
          </h1>

          {/* Body */}
          <p className="hero-text-elem text-base md:text-lg leading-relaxed max-w-md"
            style={{ color: "rgba(240,220,240,.75)", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
            The ultimate tool to <span className="text-white font-medium">convert comments &rarr; customers</span>.
            Automate your growth and never miss a lead again.
          </p>

          {/* CTAs */}
          <div className="hero-text-elem flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard"
              className="cta-primary group flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: ".02em" }}>
              Let’s Start
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <button
              className="group flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-200 hover:-translate-y-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "#fff"
              }}>
              <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
              Watch Demo
            </button>
          </div>

          {/* Social proof */}
          <div className="hero-text-elem flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {["AR", "PS", "JW", "KL"].map((a, i) => (
                <div key={a}
                  className="w-9 h-9 rounded-full border-[2px] flex items-center justify-center text-[11px] font-bold text-white hover:-translate-y-1 transition-transform cursor-pointer"
                  style={{
                    background: `hsl(${328 + i * 18}, 80%, 40%)`,
                    borderColor: "#06000d",
                    zIndex: 10 - i,
                    fontFamily: "'Syne', sans-serif"
                  }}>
                  {a}
                </div>
              ))}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className="text-white font-bold text-base" style={{ fontFamily: "'Syne', sans-serif" }}>11,000+</span>
              <span className="text-sm" style={{ color: "rgba(255,255,255,.7)" }}> creators trust us</span>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.55)" }}>25M+ DMs sent & counting.</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hero-right order-2 relative">

          {/* Floating stat cards */}
          <StatChip value="25M+" label="Total DMs Sent"
            className="absolute -top-5 -left-6 z-20 hidden md:block" delay={1.2} />
          <StatChip value="11K+" label="Active Creators"
            className="absolute -bottom-4 -left-4 z-20 hidden md:block" delay={1.4} />

          {/* Floating notifications */}
          <NotifCard icon="💬" text="New Comment" sub="Converted to Customer" delay={1.6}
            className={`absolute -right-4 top-12 z-20 hidden lg:flex w-56`} />
          <NotifCard icon="⚡" text="250% Growth" sub="Instagram Automation" delay={1.9}
            className={`absolute -right-4 bottom-16 z-20 hidden lg:flex w-56`} />

          {/* Visual Carousel Stage */}
          <VisualCarousel />

          {/* Glow under carousel */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 opacity-50 blur-3xl rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, #ff2d78 0%, transparent 70%)" }} />
        </div>
      </div>
    </section>
  );
}