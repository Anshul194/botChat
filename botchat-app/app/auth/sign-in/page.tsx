"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Mail, Lock, Zap, MessageSquare,
    ArrowRight, Github, Chrome,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";

export default function SignInPage() {
    const router = useRouter();
    const { theme } = useTheme();
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const e: typeof errors = {};
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 6) e.password = "Minimum 6 characters";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard");
        }, 1500);
    };

    const isLight = theme === "light";

    return (
        <div
            className="auth-bg min-h-screen flex"
            style={{ background: "var(--background)" }}
        >
            {/* ── Left Panel — Branding ──────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[46%] flex-col relative overflow-hidden"
                style={{
                    background: "linear-gradient(160deg, var(--brand-blue-dark) 0%, var(--primary) 55%, var(--accent) 100%)",
                }}
            >
                {/* Decorative orbs */}
                <div
                    className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-10 right-0 w-96 h-96 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
                />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full p-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">BotChat</span>
                    </div>

                    {/* Main copy */}
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
                            Connect Instagram &amp; Facebook, deploy AI chatbots, and manage all your DMs from one beautiful workspace.
                        </p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { value: "50K+", label: "Businesses" },
                                { value: "2M+", label: "Msgs / day" },
                                { value: "98%", label: "Uptime" },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-center"
                                >
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center text-white font-bold text-xs">
                                S
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Sarah Kim</p>
                                <p className="text-white/55 text-xs">Head of Growth · Acme Co.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Panel — Form ─────────────────────────────── */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold gradient-text">BotChat</span>
                    </div>
                    <div className="hidden lg:block" />

                    <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            No account?{" "}
                            <Link href="/auth/sign-up" className="font-semibold" style={{ color: "var(--primary)" }}>
                                Sign up
                            </Link>
                        </span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Form area */}
                <div className="flex-1 flex items-center justify-center px-6 py-8">
                    <div className="w-full max-w-[420px] slide-up">
                        {/* Heading */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--foreground)" }}>
                                Welcome back
                            </h2>
                            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                Sign in to your BotChat workspace
                            </p>
                        </div>

                        {/* Social sign-in */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { icon: <Chrome className="w-4 h-4" />, label: "Google" },
                                { icon: <Github className="w-4 h-4" />, label: "GitHub" },
                            ].map((p) => (
                                <button
                                    key={p.label}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200"
                                    style={{
                                        background: "var(--card)",
                                        borderColor: "var(--border)",
                                        color: "var(--foreground)",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "rgba(29,110,245,0.35)";
                                        e.currentTarget.style.background = "var(--nav-hover-bg)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "var(--border)";
                                        e.currentTarget.style.background = "var(--card)";
                                    }}
                                >
                                    {p.icon}
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 divider" />
                            <span className="text-xs font-medium px-1" style={{ color: "var(--muted-foreground)" }}>
                                or continue with email
                            </span>
                            <div className="flex-1 divider" />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                                        style={{ color: "var(--muted-foreground)" }}
                                    />
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
                                        className="input-field pl-10"
                                        style={{
                                            borderColor: errors.email ? "var(--destructive)" : undefined,
                                        }}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                        Password
                                    </label>
                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-xs font-medium"
                                        style={{ color: "var(--primary)" }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                                        style={{ color: "var(--muted-foreground)" }}
                                    />
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
                                        className="input-field pl-10 pr-11"
                                        style={{
                                            borderColor: errors.password ? "var(--destructive)" : undefined,
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                                        onClick={() => setShowPwd(!showPwd)}
                                        style={{ color: "var(--muted-foreground)" }}
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.password}</p>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="text-sm cursor-pointer" style={{ color: "var(--muted-foreground)" }}>
                                    Keep me signed in
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 text-base mt-2"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin-slow" />
                                        Signing in…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign in
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </button>
                        </form>

                        {/* Mobile sign-up link */}
                        <p className="mt-6 text-center text-sm lg:hidden" style={{ color: "var(--muted-foreground)" }}>
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/sign-up" className="font-semibold" style={{ color: "var(--primary)" }}>
                                Sign up free
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 px-6 py-4">
                    {["Privacy Policy", "Terms of Service", "Help"].map((t) => (
                        <Link key={t} href="#" className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                            {t}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
