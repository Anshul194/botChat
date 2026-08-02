"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Cookie, Database, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsentStatus");
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Prevent scrolling when the consent modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      // Prevent touch scroll on mobile
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isVisible]);

  const handleAccept = () => {
    localStorage.setItem("cookieConsentStatus", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsentStatus", "rejected");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden overscroll-contain">
          {/* Full Screen Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 bg-zinc-900/40 dark:bg-black/80 transition-all duration-500"
            style={{ touchAction: "none" }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Centered Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
            className="relative w-full max-w-[420px] p-8 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_20px_60px_-15px_rgba(255,45,120,0.15)] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-hidden"
          >
            {/* Glossy top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50" />
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FF2D78]/20 blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

            {/* Header */}
            <div className="flex flex-col items-center text-center gap-5 mb-8 relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#FF2D78] to-[#E1306C] text-white shadow-[0_8px_20px_-6px_rgba(255,45,120,0.5)] relative overflow-hidden">
                <Shield size={32} className="relative z-10" />
                <span className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] animate-[shine_2s_infinite]" />
              </div>
              <div>
                <h3 className="font-black text-2xl tracking-tight text-zinc-900 dark:text-white mb-2">
                  Privacy & Cookies
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium px-4 leading-relaxed">
                  We use essential tracking to keep BotChat secure and caching to ensure peak speeds.
                </p>
              </div>
            </div>

            {/* Checklist of Consents */}
            <div className="space-y-3 mb-8 relative z-10">
              <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05]">
                <div className="w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Essential Data
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Maintains user login session, tokens, and workspace security.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05]">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Browser Caching
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Speeds up dashboard response time and reduces static latency.
                  </p>
                </div>
              </div>
            </div>

            {/* Description Links */}
            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-6 leading-relaxed relative z-10 px-2">
              By selecting "Accept All", you agree to our storage policies. Read the{" "}
              <Link
                href="/home/cookie_policy"
                onClick={() => setIsVisible(false)}
                className="font-bold text-[#FF2D78] hover:text-[#E1306C] transition-colors"
              >
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/home/browser_caching"
                onClick={() => setIsVisible(false)}
                className="font-bold text-[#FF2D78] hover:text-[#E1306C] transition-colors"
              >
                Caching Details
              </Link>
              .
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={handleAccept}
                className="w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 text-white cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(255,45,120,0.4)] active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #E1306C)",
                }}
              >
                Accept All
              </button>
              <button
                onClick={handleReject}
                className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 text-center border cursor-pointer active:scale-95 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-zinc-200 dark:border-zinc-800"
              >
                Reject Non-Essential
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
