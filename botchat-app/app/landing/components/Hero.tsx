"use client";
// NextJS HMR Force Save

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useAnimate, stagger } from "framer-motion";
import { Zap, ArrowRight, Play, Server, MessageSquare, ShieldCheck, ZapIcon, BarChart3, Database } from "lucide-react";
import Simulator from "./Simulator";

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
        <div className="blob1 absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full opacity-50 mix-blend-screen will-change-transform"
          style={{ background: "radial-gradient(circle, #ff2d78 0%, transparent 70%)" }} />

        <div className="blob2 absolute -bottom-40 -right-40 w-[750px] h-[750px] rounded-full opacity-40 mix-blend-screen will-change-transform"
          style={{ background: "radial-gradient(circle, #e1306c 0%, transparent 70%)" }} />

        <div className="blob3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20 mix-blend-screen will-change-transform"
          style={{ background: "radial-gradient(circle, #ff80ab 0%, transparent 70%)" }} />

        {/* Mouse follower glow */}
        <motion.div
          className="absolute w-[440px] h-[440px] rounded-full opacity-55 mix-blend-screen hidden lg:block"
          style={{
            left: glowLeft,
            top: glowTop,
            background: "radial-gradient(circle, rgba(255,100,160,.8) 0%, transparent 70%)",
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
            <span className="block text-white uppercase tracking-tighter">Automate Your Instagram & Facebook</span>
            <span className="shimmer-text block mt-1">REAL Growth.</span>
          </h1>

          {/* Body */}
          <p className="hero-text-elem text-lg md:text-xl leading-relaxed max-w-md font-medium"
            style={{ color: "rgba(245,235,245,.92)", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            The ultimate tool to <span className="text-white font-semibold">convert comments &rarr; customers</span>.
            Automate your growth and never miss a lead again.
          </p>

          {/* CTAs */}
          <div className="hero-text-elem flex flex-col sm:flex-row gap-4">
            <Link href="/auth/sign-up"
              className="cta-primary group flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300"
              style={{ fontFamily: "'Syne', sans-serif", letterSpacing: ".02em" }}>
              Start Free Trial
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

          {/* Trust badge — no unverified metrics */}
          <div className="hero-text-elem flex items-center gap-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border" style={{ background: "rgba(255,45,120,.08)", borderColor: "rgba(255,45,120,.25)", color: "#ff80ab" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L13.09 8.26L19 7L15.45 11.86L21 14L15.45 16.14L19 21L13.09 15.74L12 22L10.91 15.74L5 21L8.55 16.14L3 14L8.55 11.86L5 7L10.91 8.26L12 2Z"/></svg>
              <span className="text-xs font-bold uppercase tracking-widest">Built on Meta&apos;s Official API</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="hero-right order-2 relative">



          {/* Interactive Simulator */}
          <Simulator />

          {/* Glow under carousel */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 opacity-50 blur-3xl rounded-full pointer-events-none"
            style={{ background: "radial-gradient(ellipse, #ff2d78 0%, transparent 70%)" }} />
        </div>
      </div>
    </section>
  );
}