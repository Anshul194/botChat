"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Star } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${className}`}
            style={{
                background: isDark
                    ? "linear-gradient(145deg, #1e1238 0%, #2b1250 60%, #3a1245 100%)"
                    : "linear-gradient(145deg, #fff7e6 0%, #ffe3ed 60%, #ffd9e6 100%)",
                border: "1.5px solid",
                borderColor: isDark ? "rgba(255,45,120,0.45)" : "rgba(232,23,93,0.30)",
                boxShadow: isDark
                    ? "0 0 18px rgba(255,45,120,0.30), inset 0 1px 0 rgba(255,255,255,0.08)"
                    : "0 0 16px rgba(232,23,93,0.20), inset 0 1px 0 rgba(255,255,255,0.9)",
                transition: "background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, transform 0.25s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1.08)"; }}
        >
            {/* Glow halo */}
            <span className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                    background: isDark
                        ? "radial-gradient(circle at 50% 0%, rgba(255,128,171,0.35), transparent 72%)"
                        : "radial-gradient(circle at 50% 100%, rgba(232,23,93,0.22), transparent 72%)",
                    transition: "background 0.4s ease",
                }} />

            {/* 3D flip card: Sun (day) / Moon (night) */}
            <span className="relative w-full h-full flex items-center justify-center"
                style={{ perspective: "600px" }}>
                <span className="relative w-full h-full"
                    style={{
                        transformStyle: "preserve-3d",
                        transform: isDark ? "rotateY(180deg)" : "rotateY(0deg)",
                        transition: "transform 0.65s cubic-bezier(.34,1.56,.64,1)",
                    }}>
                    {/* Sun face */}
                    <span className="absolute inset-0 flex items-center justify-center"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                        <Sun className="w-5 h-5 text-[#e8175d]"
                            style={{ filter: "drop-shadow(0 0 6px rgba(232,23,93,0.7))" }} />
                    </span>
                    {/* Moon face */}
                    <span className="absolute inset-0 flex items-center justify-center"
                        style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                        <Moon className="w-5 h-5 text-[#ffd7e8]"
                            style={{ filter: "drop-shadow(0 0 7px rgba(255,128,171,0.9))" }} />
                        <Star className="absolute top-1.5 right-2 w-2 h-2 text-white/90 fill-white/40"
                            style={{ animation: "topbar-spark 2.4s ease-in-out infinite" }} />
                        <Star className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 text-white/70 fill-white/30"
                            style={{ animation: "topbar-spark 3.4s ease-in-out infinite 0.7s" }} />
                    </span>
                </span>
            </span>
        </button>
    );
}
