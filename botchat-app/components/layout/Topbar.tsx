"use client";

import { Bell, Search, Menu, ChevronDown, Sparkles, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

interface TopbarProps {
    onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
    const { theme } = useTheme();
    const isLight = theme === "light";

    return (
        <header
            className="h-16 flex items-center gap-4 px-6 border-b flex-shrink-0 transition-all duration-300"
            style={{
                background: isLight
                    ? "rgba(255,255,255,0.94)"
                    : "rgba(8,13,26,0.97)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderColor: "var(--glass-border)",
            }}
        >
            {/* Mobile menu toggle */}
            <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg transition-colors"
                style={{ color: "var(--muted-foreground)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nav-hover-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "var(--muted-foreground)" }}
                    />
                    <input
                        type="text"
                        placeholder="Search conversations, contacts…"
                        className="w-full pl-10 pr-14 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                        style={{
                            background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
                            border: "1.5px solid var(--glass-border)",
                            color: "var(--foreground)",
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "var(--input-focus-border)";
                            e.currentTarget.style.boxShadow = "0 0 0 3px var(--input-focus-ring)";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = "var(--glass-border)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    />
                    <kbd
                        className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded font-mono"
                        style={{
                            background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)",
                            color: "var(--muted-foreground)",
                            border: "1px solid var(--glass-border)",
                        }}
                    >
                        ⌘K
                    </kbd>
                </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">

                {/* AI badge */}
                <div
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:opacity-80"
                    style={{
                        background: "rgba(236,72,153,0.10)",
                        border: "1px solid rgba(236,72,153,0.20)",
                        color: "var(--brand-pink-light)",
                    }}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Powered</span>
                </div>

                {/* Upgrade button */}
                <button
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                        background: "var(--brand-gradient)",
                        color: "white",
                        boxShadow: "var(--shadow-pink)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.90")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                    <Zap className="w-3.5 h-3.5" />
                    Upgrade
                </button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <div className="relative">
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 relative"
                        id="notifications-btn"
                        style={{ color: "var(--muted-foreground)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nav-hover-bg)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <Bell className="w-5 h-5" />
                        <span
                            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
                            style={{ background: "#ef4444", borderColor: "var(--background)" }}
                        />
                    </button>
                </div>

                {/* Profile */}
                <button
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200"
                    id="profile-btn"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nav-hover-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: "var(--brand-gradient)" }}
                    >
                        A
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold leading-none" style={{ color: "var(--foreground)" }}>Anshul</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>Pro Plan</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 hidden md:block" style={{ color: "var(--muted-foreground)" }} />
                </button>
            </div>
        </header>
    );
}
