"use client";

import Link from "next/link";
import { Sparkles, Menu, X, User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

interface NavbarProps {
  forceLight?: boolean;
}

export default function Navbar({ forceLight = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const useLight = forceLight || isScrolled;

  const navLinks = [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-6 pt-6 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`pointer-events-auto flex items-center justify-between w-full max-w-5xl px-6 py-3 rounded-full transition-all duration-500 border ${useLight
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
            className={`font-extrabold text-lg tracking-tight transition-colors ${useLight ? "text-gray-900" : "text-white"
              }`}
          >
            botChat
          </span>
        </div>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-semibold transition-all hover:scale-105 active:scale-95 ${useLight ? "text-gray-600 hover:text-[#FF2D78]" : "text-white/60 hover:text-white"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                href="/auth/sign-in"
                className={`text-sm font-bold transition-colors ${useLight ? "text-gray-700 hover:text-[#FF2D78]" : "text-white/80 hover:text-white"
                  }`}
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="group relative px-6 py-2.5 rounded-full overflow-hidden transition-all active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF2D78] to-[#E1306C]" />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10 text-sm font-black text-white px-2">Let’s Start</span>
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center p-1 rounded-full border transition-all ${useLight
                  ? "bg-gray-50 border-gray-200 text-gray-900"
                  : "bg-white/10 border-white/10 text-white"
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF2D78] to-[#E1306C] flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                  {(user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 p-2 rounded-2xl bg-white border border-gray-100 shadow-2xl z-[60]"
                  >
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logoutUser());
                        router.push('/');
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-2 rounded-full transition-colors ${useLight ? "hover:bg-gray-100 text-gray-900" : "hover:bg-white/10 text-white"
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
            className={`absolute top-24 inset-x-6 z-40 p-6 rounded-3xl border shadow-2xl pointer-events-auto md:hidden ${useLight ? "bg-white border-gray-100" : "bg-[#110818] border-white/10"
              }`}
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-bold ${useLight ? "text-gray-900 hover:text-[#FF2D78]" : "text-white hover:text-[#FF2D78]"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-gray-100/10" />
              <div className="flex flex-col gap-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      href="/auth/sign-in"
                      className={`text-center py-3 rounded-2xl font-bold ${useLight ? "text-gray-900 bg-gray-50" : "text-white bg-white/5"
                        }`}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      className="text-center py-4 rounded-2xl font-black text-white bg-gradient-to-r from-[#FF2D78] to-[#E1306C]"
                    >
                      Start Free Trial
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2D78] to-[#E1306C] flex items-center justify-center text-white font-bold overflow-hidden">
                          {(user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{user?.name}</span>
                          <span className="text-xs text-gray-500">Go to Dashboard</span>
                        </div>
                      </div>
                      <LayoutDashboard className="w-5 h-5 text-gray-400" />
                    </Link>
                    <button
                      onClick={() => {
                        dispatch(logoutUser());
                        router.push('/');
                      }}
                      className="text-center py-3 rounded-2xl font-bold text-red-600 bg-red-50 border border-red-100"
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
