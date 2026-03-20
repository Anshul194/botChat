"use client";

import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#solutions" },
    { name: "Pricing", href: "#pricing" },
    { name: "Company", href: "#company" },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-6 pt-6 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`pointer-events-auto flex items-center justify-between w-full max-w-5xl px-6 py-3 rounded-full transition-all duration-500 border ${isScrolled
            ? "bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
            : "bg-[#06000d]/40 backdrop-blur-lg border-white/10 shadow-2xl"
          }`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#FF2D78] to-[#E1306C] group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span
            className={`font-extrabold text-lg tracking-tight transition-colors ${isScrolled ? "text-gray-900" : "text-white"
              }`}
          >
            BotAI
          </span>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${isScrolled ? "text-gray-600 hover:text-[#FF2D78]" : "text-white/60 hover:text-white"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/dashboard"
            className={`text-sm font-bold transition-colors ${isScrolled ? "text-gray-700 hover:text-[#FF2D78]" : "text-white/80 hover:text-white"
              }`}
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="group relative px-6 py-2.5 rounded-full overflow-hidden transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF2D78] to-[#E1306C]" />
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <span className="relative z-10 text-sm font-black text-white">Start Free</span>
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-2 rounded-full transition-colors ${isScrolled ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"
            }`}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className={`absolute top-24 inset-x-6 z-40 p-6 rounded-3xl border shadow-2xl pointer-events-auto md:hidden ${isScrolled ? "bg-white border-gray-100" : "bg-[#110818] border-white/10"
              }`}
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold ${isScrolled ? "text-gray-900 hover:text-[#FF2D78]" : "text-white hover:text-[#FF2D78]"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-gray-100/10" />
              <div className="flex flex-col gap-4">
                <Link
                  href="/dashboard"
                  className={`text-center py-3 rounded-2xl font-bold ${isScrolled ? "text-gray-900 bg-gray-50" : "text-white bg-white/5"
                    }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard"
                  className="text-center py-4 rounded-2xl font-black text-white bg-gradient-to-r from-[#FF2D78] to-[#E1306C]"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
