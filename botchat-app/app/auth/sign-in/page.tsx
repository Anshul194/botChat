// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Mail, Lock, Zap, MessageSquare,
    ArrowRight, Chrome, Check, AlertCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

export default function SignInPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const dispatch = useAppDispatch();
    const isLight = theme === "light";

    const [showPwd, setShowPwd] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverError, setServerError] = useState("");

    const validate = () => {
        const e: typeof errors = {};
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 6) e.password = "At least 6 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) { setStatus("error"); setTimeout(() => setStatus("idle"), 2000); return; }
        setStatus("loading");
        setServerError("");
        try {
            await dispatch(loginUser({ email: form.email, password: form.password })).unwrap();
            setStatus("success");
            setTimeout(() => router.push("/dashboard"), 1000);
        } catch (err: any) {
            setStatus("error");
            setServerError(err || "Invalid credentials. Please try again.");
            setTimeout(() => setStatus("idle"), 2500);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: isLight ? "#fdf2f8" : "#06030f" }}>

            {/* ── Left decorative panel ── */}
            <div
                className="hidden lg:flex lg:w-[46%] flex-col relative overflow-hidden"
                style={{ background: "linear-gradient(160deg, #9d174d 0%, #ec4899 45%, #a855f7 100%)" }}
            >
                {/* Orbs */}
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-25"
                    style={{ background: "radial-gradient(circle, #f9a8d4 0%, transparent 70%)" }} />
                <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }} />

                <div className="relative z-10 flex flex-col h-full p-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">BotChat</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center mt-16">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold w-fit mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            AI-Powered Social Automation
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
                            Automate your<br />
                            <span className="text-white/80">social media</span><br />
                            conversations
                        </h1>
                        <p className="text-white/70 text-base leading-relaxed max-w-sm mb-10">
                            Connect Instagram & Facebook, deploy AI chatbots, and manage all your DMs from one beautiful workspace.
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { value: "50K+", label: "Businesses" },
                                { value: "2M+", label: "Msgs / day" },
                                { value: "98%", label: "Uptime" },
                            ].map((s) => (
                                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center">
                                    <p className="text-white font-bold text-xl">{s.value}</p>
                                    <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
                        <p className="text-white/85 text-sm leading-relaxed mb-3">
                            &quot;BotChat cut our response time by 80%. The AI flows are incredibly intuitive — our team was up and running in minutes.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">S</div>
                            <div>
                                <p className="text-white font-semibold text-sm">Sarah Kim</p>
                                <p className="text-white/55 text-xs">Head of Growth · Acme Co.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right panel — Form ── */}
            <div className="flex-1 flex flex-col relative">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}>
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm" style={{
                            background: "linear-gradient(135deg, #ec4899, #a855f7)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                        }}>BotChat</span>
                    </div>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ color: isLight ? "#64748b" : "#a1a1aa" }}>
                            No account?{" "}
                            <Link href="/auth/sign-up" className="font-semibold"
                                style={{ color: "#ec4899" }}>
                                Sign up
                            </Link>
                        </span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Form area */}
                <div className="flex-1 flex items-center justify-center px-6 py-8">
                    <motion.div
                        className="w-full max-w-[400px]"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        {/* Heading */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-extrabold mb-1.5" style={{ color: isLight ? "#1e1b4b" : "#f8fafc" }}>
                                Welcome back 👋
                            </h2>
                            <p className="text-sm" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                                Enter your credentials to access your workspace
                            </p>
                        </div>

                        {/* Social buttons */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { icon: <Chrome className="w-4 h-4" />, label: "Google" },
                                { icon: <span className="text-sm font-mono font-bold">GH</span>, label: "GitHub" },
                            ].map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                    style={{
                                        background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                                        border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
                                        color: isLight ? "#1e1b4b" : "#e2e8f0",
                                    }}
                                >
                                    {p.icon}
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 h-px" style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }} />
                            <span className="text-xs font-medium px-1" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>OR</span>
                            <div className="flex-1 h-px" style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }} />
                        </div>

                        {/* Form */}
                        <motion.form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4"
                            animate={status === "error" ? { x: [-8, 8, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5"
                                    style={{ color: isLight ? "#1e1b4b" : "#e2e8f0" }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                        style={{ color: errors.email ? "#ef4444" : isLight ? "#94a3b8" : "#64748b" }} />
                                    <input
                                        id="signin-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        value={form.email}
                                        onChange={(e) => {
                                            setForm((f) => ({ ...f, email: e.target.value }));
                                            if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                                        }}
                                        className="w-full pl-10 pr-4 h-12 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                                            border: `1.5px solid ${errors.email ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
                                            color: isLight ? "#1e1b4b" : "#f1f5f9",
                                            boxShadow: errors.email ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
                                        }}
                                        onFocus={(e) => { if (!errors.email) e.currentTarget.style.borderColor = "#ec4899"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(236,72,153,0.12)"; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
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

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-semibold"
                                        style={{ color: isLight ? "#1e1b4b" : "#e2e8f0" }}>
                                        Password
                                    </label>
                                    <Link href="/auth/forgot-password" className="text-xs font-semibold"
                                        style={{ color: "#ec4899" }}>
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                        style={{ color: errors.password ? "#ef4444" : isLight ? "#94a3b8" : "#64748b" }} />
                                    <input
                                        id="signin-password"
                                        type={showPwd ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => {
                                            setForm((f) => ({ ...f, password: e.target.value }));
                                            if (errors.password) setErrors((er) => ({ ...er, password: undefined }));
                                        }}
                                        className="w-full pl-10 pr-12 h-12 rounded-xl text-sm outline-none transition-all"
                                        style={{
                                            background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
                                            border: `1.5px solid ${errors.password ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
                                            color: isLight ? "#1e1b4b" : "#f1f5f9",
                                            boxShadow: errors.password ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
                                        }}
                                        onFocus={(e) => { if (!errors.password) e.currentTarget.style.borderColor = "#ec4899"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(236,72,153,0.12)"; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                    />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                                        style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {errors.password && (
                                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
                                            <AlertCircle className="w-3 h-3" />{errors.password}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Keep signed in */}
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="relative flex-shrink-0">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-4 h-4 rounded border-2 transition-all peer-checked:border-pink-500 peer-checked:bg-pink-500 flex items-center justify-center"
                                        style={{ borderColor: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)" }}>
                                        <Check className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100" />
                                    </div>
                                </div>
                                <span className="text-xs" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Keep me signed in</span>
                            </label>

                            {/* Server error */}
                            <AnimatePresence>
                                {status === "error" && serverError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 text-xs font-medium rounded-xl px-4 py-3"
                                        style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        {serverError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all"
                                animate={{
                                    background:
                                        status === "error" ? "#ef4444" :
                                            status === "success" ? "#10b981" :
                                                "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
                                    scale: status === "success" ? 1.02 : 1
                                }}
                                style={{
                                    boxShadow: status === "idle" || status === "loading"
                                        ? "0 4px 20px rgba(236,72,153,0.35)"
                                        : "none",
                                    cursor: status === "loading" || status === "success" ? "default" : "pointer"
                                }}
                            >
                                <AnimatePresence mode="popLayout">
                                    {status === "idle" && (
                                        <motion.span key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                            className="flex items-center gap-2">
                                            Sign In <ArrowRight className="w-4 h-4" />
                                        </motion.span>
                                    )}
                                    {status === "loading" && (
                                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    )}
                                    {status === "success" && (
                                        <motion.span key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-2">
                                            <Check className="w-5 h-5" strokeWidth={3} /> Signed in!
                                        </motion.span>
                                    )}
                                    {status === "error" && !serverError && (
                                        <motion.span key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            Check your details
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </motion.form>

                        {/* Mobile signup link */}
                        <p className="mt-7 text-center text-sm lg:hidden" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/sign-up" className="font-semibold" style={{ color: "#ec4899" }}>
                                Sign up free
                            </Link>
                        </p>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-5 px-6 py-5 text-xs" style={{ color: isLight ? "#94a3b8" : "#475569" }}>
                    {["Privacy", "Terms", "Help"].map((t) => (
                        <Link key={t} href="#" className="hover:underline transition-colors">{t}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
