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
                    ? "linear-gradient(135deg, color-mix(in srgb, var(--background) 100%, black), var(--card))"
                    : "linear-gradient(135deg, var(--card), var(--background))",
                border: "1.5px solid",
                borderColor: isDark
                    ? "color-mix(in srgb, var(--primary) 35%, transparent)"
                    : "color-mix(in srgb, var(--primary) 25%, transparent)",
                boxShadow: isDark
                    ? "0 0 12px rgba(29,110,245,0.25), inset 0 1px 0 color-mix(in srgb, var(--foreground) 6%, transparent)"
                    : "0 0 10px rgba(30,95,212,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                transition: "all 0.35s ease",
            }}
        >
            {/* Sun icon (left side) */}
            <Sun
                className="absolute left-1.5 w-3.5 h-3.5 transition-all duration-300"
                style={{
                    color: isDark ? "color-mix(in srgb, var(--foreground) 20%, transparent)" : "#1e5fd4",
                    opacity: isDark ? 0.3 : 1,
                    transform: isDark ? "rotate(-20deg)" : "rotate(0deg)",
                }}
            />

            {/* Moon icon (right side) */}
            <Moon
                className="absolute right-1.5 w-3.5 h-3.5 transition-all duration-300"
                style={{
                    color: isDark ? "#fff" : "rgba(30,95,212,0.2)",
                    opacity: isDark ? 1 : 0.3,
                }}
            />

            {/* Sliding thumb */}
            <span
                className="absolute w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
                style={{
                    left: isDark ? "calc(100% - 24px)" : "2px",
                    background: isDark
                        ? "linear-gradient(135deg, var(--primary), var(--accent))"
                        : "linear-gradient(135deg, var(--card), var(--background))",
                    boxShadow: isDark
                        ? "0 2px 10px rgba(29,110,245,0.70)"
                        : "0 2px 10px rgba(0,0,0,0.15)",
                }}
            >
                {isDark ? (
                    <Moon className="w-3 h-3 text-white" />
                ) : (
                    <Sun className="w-3 h-3 text-[#1e5fd4]" />
                )}
            </span>
        </button>
    );
}
