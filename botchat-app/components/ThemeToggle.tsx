"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`relative w-[58px] h-[30px] rounded-full flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group ${className}`}
            style={{
                background: isDark
                    ? "linear-gradient(120deg, #1b1030 0%, #2a1240 55%, #3a1245 100%)"
                    : "linear-gradient(120deg, #fff 0%, #ffeef4 55%, #ffd9e6 100%)",
                border: "1.5px solid",
                borderColor: isDark
                    ? "rgba(255,45,120,0.45)"
                    : "rgba(232,23,93,0.30)",
                boxShadow: isDark
                    ? "0 0 16px rgba(255,45,120,0.28), inset 0 1px 0 rgba(255,255,255,0.08)"
                    : "0 0 14px rgba(232,23,93,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.06)";
                e.currentTarget.style.boxShadow = isDark
                    ? "0 0 22px rgba(255,45,120,0.45), inset 0 1px 0 rgba(255,255,255,0.08)"
                    : "0 0 20px rgba(232,23,93,0.30), inset 0 1px 0 rgba(255,255,255,0.9)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = isDark
                    ? "0 0 16px rgba(255,45,120,0.28), inset 0 1px 0 rgba(255,255,255,0.08)"
                    : "0 0 14px rgba(232,23,93,0.18), inset 0 1px 0 rgba(255,255,255,0.9)";
            }}
        >
            {/* Sun (left) */}
            <Sun
                className="absolute left-2 w-[15px] h-[15px] transition-all duration-300"
                style={{
                    color: isDark ? "#fff" : "#e8175d",
                    opacity: isDark ? 0.25 : 1,
                    transform: isDark ? "rotate(-90deg) scale(0.6)" : "rotate(0deg) scale(1)",
                    filter: isDark ? "none" : "drop-shadow(0 0 4px rgba(232,23,93,0.6))",
                }}
            />

            {/* Moon (right) */}
            <Moon
                className="absolute right-2 w-[15px] h-[15px] transition-all duration-300"
                style={{
                    color: isDark ? "#ffd7e8" : "#fff",
                    opacity: isDark ? 1 : 0.25,
                    transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.6)",
                    filter: isDark ? "drop-shadow(0 0 5px rgba(255,128,171,0.8))" : "none",
                }}
            />

            {/* Sliding thumb */}
            <span
                className="absolute w-[24px] h-[24px] rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                    left: isDark ? "calc(100% - 26px)" : "2px",
                    top: "2px",
                    background: isDark
                        ? "linear-gradient(135deg, #FF2D78 0%, #ff80ab 100%)"
                        : "linear-gradient(135deg, #ffffff 0%, #ffe3ed 100%)",
                    boxShadow: isDark
                        ? "0 0 14px rgba(255,45,120,0.85), inset 0 1px 0 rgba(255,255,255,0.4)"
                        : "0 2px 8px rgba(232,23,93,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
                    transition: "all 0.45s cubic-bezier(.34,1.56,.64,1)",
                }}
            >
                {isDark ? (
                    <Moon className="w-[13px] h-[13px] text-white" />
                ) : (
                    <Sun className="w-[13px] h-[13px] text-[#e8175d]" />
                )}
            </span>
        </button>
    );
}
