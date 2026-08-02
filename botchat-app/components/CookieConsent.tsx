"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Cookie, Database, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

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

  if (pathname === "/home/cookie_policy" || pathname === "/home/browser_caching") {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden overscroll-contain">
          {/* Full Screen Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 bg-zinc-900/40 dark:bg-black/80 transition-all duration-500"
            style={{ touchAction: "none" }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Bottom Sheet / Centered Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="relative w-full sm:max-w-[420px] p-5 sm:p-8 rounded-t-[28px] sm:rounded-b-[32px] sm:rounded-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] dark:shadow-[0_-10px_40px_rgba(255,45,120,0.1)] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-t sm:border border-white/20 dark:border-white/10 overflow-hidden max-h-[85vh] overflow-y-auto pb-8 sm:pb-8"
          >
            {/* Mobile drag indicator (visual only) */}
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Glossy top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50 hidden sm:block" />
            <div className="absolute top-0 right-0 w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] bg-[#FF2D78]/20 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

            {/* Header */}
            <div className="flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center gap-4 sm:gap-5 mb-5 sm:mb-8 relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#FF2D78] to-[#E1306C] text-white shadow-[0_8px_20px_-6px_rgba(255,45,120,0.5)] shrink-0 relative overflow-hidden">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 relative z-10" />
                <span className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] animate-[shine_2s_infinite]" />
              </div>
              <div>
                <h3 className="font-black text-xl sm:text-2xl tracking-tight text-zinc-900 dark:text-white mb-1 sm:mb-2">
                  Privacy & Cookies
                </h3>
                <p className="text-[11px] sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium sm:px-4 leading-relaxed">
                  We use essential tracking to keep BotChat secure and caching to ensure peak speeds.
                </p>
              </div>
            </div>

            {/* Checklist of Consents */}
            <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-8 relative z-10">
              <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] flex items-center justify-center shrink-0">
                  <Cookie className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Essential Data
                  </h4>
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Maintains user login session, tokens, and workspace security.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-100 dark:border-white/[0.05]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                  <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Browser Caching
                  </h4>
                  <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Speeds up dashboard response time and reduces static latency.
                  </p>
                </div>
              </div>
            </div>

            {/* Description Links */}
            <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 text-center mb-5 sm:mb-6 leading-relaxed relative z-10 px-1 sm:px-2">
              By selecting "Accept All", you agree to our storage policies. Read the{" "}
              <Link
                href="/home/cookie_policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#FF2D78] hover:text-[#E1306C] transition-colors"
              >
                Cookie Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/home/browser_caching"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#FF2D78] hover:text-[#E1306C] transition-colors"
              >
                Caching Details
              </Link>
              .
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row sm:flex-col gap-2 sm:gap-3 relative z-10">
              <button
                onClick={handleAccept}
                className="w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all duration-300 text-white cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(255,45,120,0.4)] active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #E1306C)",
                }}
              >
                Accept All
              </button>
              <button
                onClick={handleReject}
                className="w-full py-3.5 sm:py-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 text-center border cursor-pointer active:scale-95 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-zinc-200 dark:border-zinc-800"
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
