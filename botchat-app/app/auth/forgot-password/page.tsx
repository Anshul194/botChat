// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Mail, MessageSquare, Zap, Check, AlertCircle, ArrowLeft, Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import { forgotPassword } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
    const { theme } = useTheme();
    const dispatch = useAppDispatch();
    const isLight = theme === "light";

    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const validate = () => {
        const e: typeof errors = {};
        if (!email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) { setStatus("error"); setTimeout(() => setStatus("idle"), 2000); return; }
        setStatus("loading");
        setMessage("");
        try {
            const res = await dispatch(forgotPassword({ email: email.trim() })).unwrap();
            setMessage(res);
            setStatus("success");
        } catch (err: any) {
            setMessage(typeof err === "string" ? err : err?.message || "Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: isLight ? "#f8fafc" : "#06030f" }}>

            {/* ── Left decorative panel ── */}
            <div
                className="hidden lg:flex lg:w-[46%] flex-col relative overflow-hidden"
                style={{ background: "linear-gradient(160deg, #124ba8 0%, #1e5fd4 45%, #6366f1 100%)" }}
            >
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-25"
                    style={{ background: "radial-gradient(circle, #38b2ff 0%, transparent 70%)" }} />
                <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
                <div className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }} />

                <div className="relative z-10 flex flex-col h-full p-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">BotChat</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center mt-16">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold w-fit mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            Account Recovery
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
                            No worries,<br />
                            <span className="text-white/80">we&apos;ve got you</span>
                        </h1>
                        <p className="text-white/70 text-base leading-relaxed max-w-sm">
                            Enter your email and we&apos;ll send you a secure link to reset your password.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right panel — Form ── */}
            <div className="flex-1 flex flex-col relative">
                <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4 gap-2">
                    <div className="lg:hidden flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}>
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm" style={{
                            background: "linear-gradient(135deg, #1e5fd4, #6366f1)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                        }}>BotChat</span>
                    </div>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm whitespace-nowrap" style={{ color: isLight ? "#64748b" : "#a1a1aa" }}>
                            Remembered?{" "}
                            <Link href="/auth/sign-in" className="font-semibold" style={{ color: "var(--primary)" }}>
                                Back to login
                            </Link>
                        </span>
                        <ThemeToggle />
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-8">
                    <motion.div
                        className="w-full max-w-[400px]"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <Link href="/auth/sign-in"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold mb-6 hover:opacity-70 transition-opacity"
                            style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                        </Link>

                        <div className="mb-8">
                            <h2 className="text-2xl font-extrabold mb-1.5" style={{ color: isLight ? "#1e1b4b" : "#f8fafc" }}>
                                Forgot password?
                            </h2>
                            <p className="text-sm" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                                Enter your email address and we&apos;ll send you a reset link.
                            </p>
                        </div>

                        <motion.form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4"
                            animate={status === "error" ? { x: [-8, 8, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <div>
                                <label className="block text-sm font-semibold mb-1.5"
                                    style={{ color: isLight ? "#1e1b4b" : "#e2e8f0" }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                        style={{ color: errors.email ? "#ef4444" : isLight ? "#94a3b8" : "#64748b" }} />
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                                        }}
                                        className="w-full pl-10 pr-4 h-12 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                                            border: `1.5px solid ${errors.email ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
                                            color: isLight ? "#1e1b4b" : "#f1f5f9",
                                            boxShadow: errors.email ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
                                        }}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                                            <AlertCircle className="w-3 h-3" />{errors.email}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Message */}
                            <AnimatePresence>
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 text-xs font-medium rounded-xl px-4 py-3"
                                        style={{
                                            background: status === "success" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                                            color: status === "success" ? "#059669" : "#ef4444",
                                            border: `1px solid ${status === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                                        }}>
                                        {status === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                                        {message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={status === "loading"}
                                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all"
                                style={{
                                    background: "linear-gradient(135deg, #1e5fd4 0%, #6366f1 100%)",
                                    boxShadow: "0 4px 20px rgba(30,95,212,0.30)",
                                    cursor: status === "loading" ? "default" : "pointer",
                                    opacity: status === "success" ? 0.7 : 1,
                                }}
                            >
                                {status === "loading" ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Send Reset Link <Check className="w-4 h-4 opacity-0" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>

                        <p className="mt-7 text-center text-sm" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/sign-up" className="font-semibold" style={{ color: "var(--primary)" }}>
                                Sign up free
                            </Link>
                        </p>
                    </motion.div>
                </div>

                <div className="flex items-center justify-center gap-5 px-6 py-5 text-xs" style={{ color: isLight ? "#94a3b8" : "#475569" }}>
                    {["Privacy", "Terms", "Help"].map((t) => (
                        <Link key={t} href="#" className="hover:underline transition-colors">{t}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
