"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface WelcomeSplashProps {
    name?: string;
    onFinish: () => void;
}

export default function WelcomeSplash({ name, onFinish }: WelcomeSplashProps) {
    const [progress, setProgress] = useState(0);
    const firstName = name?.split(" ")[0] || "there";
    const initial = firstName?.[0]?.toUpperCase() || "A";

    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    const particles = useMemo(
        () => {
            const rand = (seed: number) => {
                const x = Math.sin(seed * 997) * 10000;
                return x - Math.floor(x);
            };
            return Array.from({ length: 18 }, (_, i) => ({
                id: i,
                left: rand(i + 1) * 100,
                size: 4 + rand(i + 2) * 7,
                delay: rand(i + 3) * 1.6,
                duration: 1.8 + rand(i + 4) * 1.8,
                color: ["#FF2D78", "#ff80ab", "#833AB4", "#10b981", "#f59e0b"][i % 5],
            }));
        },
        []
    );

    useEffect(() => {
        const start = Date.now();
        const duration = 2600;
        const t = setInterval(() => {
            const p = Math.min(100, ((Date.now() - start) / duration) * 100);
            setProgress(p);
            if (p >= 100) {
                clearInterval(t);
                onFinish();
            }
        }, 30);
        return () => clearInterval(t);
    }, [onFinish]);

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
            style={{
                background: "color-mix(in srgb, var(--background) 92%, transparent)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
        >
            {/* Ambient orbs */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 26%, transparent) 0%, transparent 70%)", animation: "topbar-glow 5s ease-in-out infinite" }} />
            <div className="absolute -bottom-28 -left-16 w-[380px] h-[380px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 70%)" }} />

            {/* Rising sparkle particles */}
            {particles.map(p => (
                <motion.span
                    key={p.id}
                    className="absolute bottom-[-12px] rounded-full"
                    style={{ left: `${p.left}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 8px ${p.color}` }}
                    initial={{ y: 0, opacity: 0, scale: 0 }}
                    animate={{ y: -440, opacity: [0, 1, 1, 0], scale: 1 }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeOut" }}
                />
            ))}

            {/* Card */}
            <motion.div
                className="relative w-[340px] sm:w-[400px] rounded-[28px] p-8 text-center overflow-hidden"
                style={{
                    background: "var(--card)",
                    border: "1px solid color-mix(in srgb, var(--primary) 24%, transparent)",
                    boxShadow: "0 30px 80px color-mix(in srgb, var(--primary) 12%, transparent), 0 20px 60px rgba(0,0,0,0.35)",
                }}
                initial={{ scale: 0.82, opacity: 0, y: 26 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
            >
                {/* Avatar with pulsing ring */}
                <div className="relative w-20 h-20 mx-auto mb-5">
                    <motion.span
                        className="absolute inset-0 rounded-full"
                        style={{ background: "color-mix(in srgb, var(--primary) 30%, transparent)" }}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    />
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white"
                        style={{
                            background: "var(--brand-gradient)",
                            boxShadow: "0 0 0 3px var(--card), 0 0 0 5px color-mix(in srgb, var(--primary) 40%, transparent), 0 12px 30px color-mix(in srgb, var(--primary) 45%, transparent)",
                        }}>
                        {initial}
                    </div>
                </div>

                <p className="text-[11px] font-bold tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>
                    {greeting.toUpperCase()}
                </p>
                <h2 className="text-[22px] sm:text-[24px] font-black leading-tight mb-2"
                    style={{
                        background: "linear-gradient(90deg, var(--foreground) 30%, var(--nav-active-color) 90%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                    Welcome back, {firstName}! 👋
                </h2>
                <p className="text-[12px] sm:text-[13px] font-medium leading-relaxed mb-6" style={{ color: "var(--muted-foreground)" }}>
                    Your workspace is ready and looking sharp. Time to make some magic happen. ✨
                </p>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden mb-3"
                    style={{ background: "var(--topbar-item-bg)" }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: "var(--brand-gradient)" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear", duration: 0.1 }}
                    />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--primary)" }} />
                    Entering your workspace…
                </div>
            </motion.div>
        </motion.div>
    );
}
