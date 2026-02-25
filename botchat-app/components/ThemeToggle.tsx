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
            className={`relative w-[54px] h-7 rounded-full flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
            style={{
                background: isDark
                    ? "linear-gradient(135deg, #0a1628, #14213d)"
                    : "linear-gradient(135deg, #dde6ff, #eff2ff)",
                border: "1.5px solid",
                borderColor: isDark
                    ? "rgba(29,110,245,0.35)"
                    : "rgba(30,95,212,0.25)",
                boxShadow: isDark
                    ? "0 0 12px rgba(29,110,245,0.25), inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "0 0 10px rgba(30,95,212,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                transition: "all 0.35s ease",
            }}
        >
            {/* Sun icon (left side) */}
            <Sun
                className="absolute left-1.5 w-3.5 h-3.5 transition-all duration-300"
                style={{
                    color: isDark ? "rgba(56,178,255,0.4)" : "#1e5fd4",
                    opacity: isDark ? 0.5 : 0.9,
                    transform: isDark ? "rotate(0deg)" : "rotate(20deg)",
                }}
            />

            {/* Moon icon (right side) */}
            <Moon
                className="absolute right-1.5 w-3.5 h-3.5 transition-all duration-300"
                style={{
                    color: isDark ? "#5b9bff" : "rgba(30,95,212,0.3)",
                    opacity: isDark ? 0.8 : 0.3,
                }}
            />

            {/* Sliding thumb */}
            <span
                className="absolute w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md"
                style={{
                    left: isDark ? "2px" : "calc(100% - 24px)",
                    background: isDark
                        ? "linear-gradient(135deg, #1d6ef5, #38b2ff)"
                        : "linear-gradient(135deg, #1e5fd4, #4580e8)",
                    boxShadow: isDark
                        ? "0 2px 10px rgba(29,110,245,0.70)"
                        : "0 2px 10px rgba(30,95,212,0.50)",
                    transition: "left 0.35s cubic-bezier(.4,0,.2,1), background 0.35s ease, box-shadow 0.35s ease",
                }}
            >
                {isDark ? (
                    <Moon className="w-3 h-3 text-white" />
                ) : (
                    <Sun className="w-3 h-3 text-white" />
                )}
            </span>
        </button>
    );
}
