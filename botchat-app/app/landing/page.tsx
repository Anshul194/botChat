"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Zap, ArrowRight, Play
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/* ─── Sub-components ─────────────────────────────────────── */
function GradientMesh() {
  const glowRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: e.clientX,
          y: e.clientY,
          xPercent: -50,
          yPercent: -50,
          duration: 0.8,
          ease: "power2.out"
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes panGrid {
          0% { background-position: 0px 0px; }
          100% { background-position: 80px 80px; }
        }
        @keyframes floatUp {
          0% { transform: translateY(110vh) translateX(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-10vh) translateX(50px); opacity: 0; }
        }
        .animated-grid {
          animation: panGrid 4s linear infinite;
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          animation: floatUp linear infinite;
        }
      `}} />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#040008] overflow-hidden">
        
        {/* Extremely visible Panning Grid Effect */}
        <div className="absolute inset-0 opacity-30 animated-grid" 
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(255,45,120,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.5) 1px, transparent 1px)", 
            backgroundSize: "80px 80px" 
          }} 
        />
             
        {/* Trendy Floating Dust Particles via Pure CSS */}
        {mounted && Array.from({ length: 40 }).map((_, i) => {
           const size = Math.random() * 4 + 3;
           return (
            <div
              key={i}
              className="particle mix-blend-screen"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: Math.random() > 0.5 ? "#FF2D78" : "#8A2BE2",
                boxShadow: `0 0 ${size * 3}px ${Math.random() > 0.5 ? "#FF2D78" : "#8A2BE2"}`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `-${Math.random() * 20}s`
              }}
            />
          )
        })}

        {/* Fade the grid & particles out towards edges so text remains readable */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, #040008 85%)" }} />

        {/* Dynamic Floating Orbs / Bubbles */}
        <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -80, 50, 0], scale: [1, 1.2, 0.8, 1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[550px] h-[550px] rounded-full opacity-40 mix-blend-screen"
          style={{ background: "radial-gradient(circle, #E1306C 0%, transparent 60%)", filter: "blur(80px)" }} />
          
        <motion.div animate={{ x: [0, -100, 60, 0], y: [0, 100, -60, 0], scale: [1, 0.8, 1.3, 1] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[10%] w-[650px] h-[650px] rounded-full opacity-35 mix-blend-screen"
          style={{ background: "radial-gradient(circle, #FF2D78 0%, transparent 60%)", filter: "blur(90px)" }} />

        {/* Interactive Mouse Glow */}
        {mounted && (
          <div 
            ref={glowRef}
            className="absolute top-0 left-0 w-[450px] h-[450px] rounded-full opacity-60 mix-blend-screen hidden lg:block"
            style={{ background: "radial-gradient(circle, #FF6FA1 0%, transparent 60%)", filter: "blur(80px)" }} 
          />
        )}

      </div>
    </>
  );
}

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="hero-video-wrapper relative w-full h-[380px] md:h-[480px] lg:h-[540px] opacity-0 transform translate-x-12">
      {/* Sleek, professional glass border frame */}
      <div className="relative rounded-3xl h-full border border-white/10"
        style={{ background: "rgba(20,20,25,0.6)", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        
        <div className="relative rounded-3xl overflow-hidden flex flex-col h-full bg-[#0d0d12]">
          {/* Subtle Chrome bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-red-400 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-yellow-400 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-green-400 transition-colors" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="w-2 h-2 rounded-full live-dot bg-[#FF2D78]" />
              <span className="text-xs font-medium text-white/50">replyrush.ai</span>
            </div>
            <span className="text-[10px] font-bold tracking-widest px-3 py-1 rounded-full text-white/70"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              ⚡ 2FAST
            </span>
          </div>

          {/* Actual Video */}
          <div className="relative flex-1 overflow-hidden group">
            <video
              ref={videoRef}
              src="/hero-video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
            {/* Subtle dark tint */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)" }} />
            
            {/* Professional LIVE Badge */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
                <div className="w-2 h-2 rounded-full pulse-ring bg-[#FF2D78]" />
                <span className="text-[10px] font-semibold tracking-wide text-white">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal text elements sequentially with a stagger
    gsap.fromTo(
      ".hero-text-elem",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power4.out", delay: 0.2 }
    );
    
    // Slide in the video from the right
    gsap.to(".hero-video-wrapper", {
      opacity: 1,
      x: 0,
      duration: 1.4,
      ease: "power3.out",
      delay: 0.6
    });

    // Infinite live dot pulse
    gsap.to(".live-dot", {
      scale: 1.5,
      opacity: 0.5,
      repeat: -1,
      yoyo: true,
      duration: 0.8,
      ease: "power1.inOut"
    });

    gsap.to(".pulse-ring", {
      boxShadow: "0 0 0 3px rgba(255,45,120,0.5)",
      repeat: -1,
      yoyo: true,
      duration: 0.6
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden w-full relative" style={{ color: "#f0e0f0" }}>
      <GradientMesh />

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(10,0,16,0.6)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,45,120,0.1)" }}>
        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight" style={{ background: "linear-gradient(135deg, #FF2D78, #FFB6C8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ReplyRush</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden sm:block text-sm font-semibold transition-colors hover:text-[#FF2D78]" style={{ color: "rgba(255,210,230,0.7)" }}>Sign In</Link>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)", boxShadow: "0 0 16px rgba(255,45,120,0.4)" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Stunning Interactive Text */}
          <div className="order-1 text-left relative z-10 pt-10 lg:pt-0 pl-1 lg:pl-4">
            <div className="hero-text-elem inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border"
              style={{ background: "rgba(255,45,120,0.08)", borderColor: "rgba(255,45,120,0.25)", color: "#FF6FA1", boxShadow: "0 0 30px rgba(255,45,120,0.15)" }}>
              <Zap className="w-4 h-4" /> AI-Powered Platform
            </div>

            <h1 className="hero-text-elem text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6 whitespace-nowrap lg:whitespace-normal">
              <span className="block text-white">Reply to Every</span>
              <span className="block text-white">Comment.</span>
              <span className="block mt-1 pb-1 text-[#FFB6C8]" style={{ background: "linear-gradient(135deg, #FF80AB 0%, #FFB6C8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Instantly. With AI.
              </span>
            </h1>

            <p className="hero-text-elem text-base sm:text-lg md:text-xl max-w-xl mb-10 leading-relaxed text-white/60">
              Deploy ultra-human replies across Instagram, Twitter, and LinkedIn in seconds. Stop losing engagement, start scaling your brand.
            </p>

            <div className="hero-text-elem flex flex-col sm:flex-row items-center gap-5 mb-8">
              <Link href="/dashboard"
                className="group flex items-center justify-center w-full sm:w-auto gap-2.5 px-8 py-4 rounded-2xl text-lg font-black text-white transition-all transform hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)", boxShadow: "0 10px 30px rgba(255,45,120,0.35)" }}>
                Start Free Trial <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="group flex items-center justify-center w-full sm:w-auto gap-2.5 px-8 py-4 rounded-2xl text-lg font-bold transition-all transform hover:-translate-y-1"
                style={{ background: "rgba(255,45,120,0.05)", border: "1px solid rgba(255,45,120,0.3)", color: "#FFB6C8" }}>
                <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" /> Watch Promo
              </button>
            </div>

            <div className="hero-text-elem flex items-center gap-4">
              <div className="flex -space-x-2">
                {["AR", "PS", "JW"].map((a, i) => (
                  <div key={a} className="w-10 h-10 rounded-full border-[3px] flex items-center justify-center text-xs font-bold text-white relative hover:scale-110 hover:-translate-y-1 transition-transform cursor-pointer"
                    style={{ background: `hsl(${330 + i * 15}, 85%, 60%)`, borderColor: "#0a0010", zIndex: 10 - i, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    {a}
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold" style={{ color: "rgba(255,180,200,0.55)" }}>
                <span className="text-[#FF2D78] text-base font-black">60,000+</span> creators growing fast.
                <br/><span className="text-xs opacity-70">No credit card required.</span>
              </p>
            </div>
          </div>

          {/* RIGHT: Video */}
          <div className="order-2 relative z-10 w-full lg:-mr-10">
            <HeroVideo />
          </div>

        </div>
      </section>

    </div>
  );
}
