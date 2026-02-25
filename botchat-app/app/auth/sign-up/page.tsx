"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Mail, Lock, User, Building2, Zap,
    MessageSquare, ArrowRight, Github, Chrome, Check,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignUpPage() {
    const router = useRouter();
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = account, 2 = profile
    const [form, setForm] = useState({
        firstName: "", lastName: "", company: "",
        email: "", password: "", confirm: "", agree: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const setField = (key: string, val: string | boolean) => {
        setForm((f) => ({ ...f, [key]: val }));
        if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
    };

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 8) e.password = "At least 8 characters";
        if (!form.confirm) e.confirm = "Please confirm your password";
        else if (form.confirm !== form.password) e.confirm = "Passwords don't match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!form.firstName.trim()) e.firstName = "First name is required";
        if (!form.lastName.trim()) e.lastName = "Last name is required";
        if (!form.agree) e.agree = "You must accept the terms";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) setStep(2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.push("/dashboard");
        }, 1800);
    };

    const pwdStrength = (() => {
        const p = form.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwdStrength];
    const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

    const features = [
        "Unlimited Instagram & Facebook connections",
        "AI-powered automated replies",
        "Advanced flow builder",
        "Real-time analytics dashboard",
    ];

    return (
        <div className="auth-bg min-h-screen flex" style={{ background: "var(--background)" }}>

            {/* ── Left Panel ────────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[44%] flex-col relative overflow-hidden"
                style={{
                    background: "linear-gradient(155deg, var(--brand-blue-dark) 0%, var(--primary) 50%, var(--accent) 100%)",
                }}
            >
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
                <div className="absolute bottom-20 -left-10 w-56 h-56 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                    }}
                />

                <div className="relative z-10 flex flex-col h-full p-12">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">BotChat</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center mt-12">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold w-fit mb-6">
                            <Zap className="w-3.5 h-3.5" />
                            Start free — no credit card needed
                        </div>

                        <h1 className="text-4xl xl:text-[46px] font-extrabold text-white leading-tight mb-5">
                            Join 50,000+<br />
                            <span className="text-white/80">businesses growing</span><br />
                            with BotChat
                        </h1>

                        <div className="space-y-3 mb-10">
                            {features.map((f) => (
                                <div key={f} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-white/80 text-sm">{f}</span>
                                </div>
                            ))}
                        </div>

                        {/* Trust badges */}
                        <div className="flex items-center gap-4">
                            {["SOC 2", "GDPR", "ISO 27001"].map((b) => (
                                <div
                                    key={b}
                                    className="bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-white/80 text-xs font-semibold"
                                >
                                    {b}
                                </div>
                            ))}
                            <span className="text-white/50 text-xs">Certified</span>
                        </div>
                    </div>

                    {/* Avatar stack */}
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {["B", "A", "M", "K", "S"].map((l, i) => (
                                <div
                                    key={l}
                                    className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-xs"
                                    style={{
                                        background: `hsl(${210 + i * 20}, 80%, ${50 + i * 5}%)`,
                                        zIndex: 5 - i,
                                    }}
                                >
                                    {l}
                                </div>
                            ))}
                        </div>
                        <p className="text-white/70 text-sm">
                            <span className="text-white font-semibold">2,400+</span> joined this month
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right Panel ── Form ────────────────────── */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                            <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold gradient-text">BotChat</span>
                    </div>
                    <div className="hidden lg:block" />
                    <div className="flex items-center gap-3">
                        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            Have an account?{" "}
                            <Link href="/auth/sign-in" className="font-semibold" style={{ color: "var(--primary)" }}>
                                Sign in
                            </Link>
                        </span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Form area */}
                <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
                    <div className="w-full max-w-[420px] slide-up">

                        {/* Step indicator */}
                        <div className="flex items-center gap-3 mb-6">
                            {[1, 2].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                        style={{
                                            background: step >= s ? "var(--brand-gradient)" : "var(--muted)",
                                            color: step >= s ? "#fff" : "var(--muted-foreground)",
                                            boxShadow: step === s ? "var(--glow-blue-sm)" : "none",
                                        }}
                                    >
                                        {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                                    </div>
                                    <span
                                        className="text-xs font-medium"
                                        style={{ color: step >= s ? "var(--foreground)" : "var(--muted-foreground)" }}
                                    >
                                        {s === 1 ? "Account" : "Profile"}
                                    </span>
                                    {s < 2 && (
                                        <div className="w-10 h-px mx-1" style={{ background: step > 1 ? "var(--primary)" : "var(--border)" }} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Heading */}
                        <div className="mb-7">
                            <h2 className="text-3xl font-extrabold mb-1" style={{ color: "var(--foreground)" }}>
                                {step === 1 ? "Create your account" : "Complete your profile"}
                            </h2>
                            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                {step === 1
                                    ? "Set up your credentials to get started"
                                    : "Tell us a little about yourself"}
                            </p>
                        </div>

                        {step === 1 ? (
                            <>
                                {/* Social sign-up */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { icon: <Chrome className="w-4 h-4" />, label: "Google" },
                                        { icon: <Github className="w-4 h-4" />, label: "GitHub" },
                                    ].map((p) => (
                                        <button
                                            key={p.label}
                                            type="button"
                                            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200"
                                            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "rgba(29,110,245,0.35)";
                                                e.currentTarget.style.background = "var(--nav-hover-bg)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = "var(--border)";
                                                e.currentTarget.style.background = "var(--card)";
                                            }}
                                        >
                                            {p.icon} {p.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-1 divider" />
                                    <span className="text-xs font-medium px-1" style={{ color: "var(--muted-foreground)" }}>or with email</span>
                                    <div className="flex-1 divider" />
                                </div>

                                <div className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                                            Work email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                            <input
                                                id="signup-email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@company.com"
                                                value={form.email}
                                                onChange={(e) => setField("email", e.target.value)}
                                                className="input-field pl-10"
                                                style={{ borderColor: errors.email ? "var(--destructive)" : undefined }}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                            <input
                                                id="signup-password"
                                                type={showPwd ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Min. 8 characters"
                                                value={form.password}
                                                onChange={(e) => setField("password", e.target.value)}
                                                className="input-field pl-10 pr-11"
                                                style={{ borderColor: errors.password ? "var(--destructive)" : undefined }}
                                            />
                                            <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2" onClick={() => setShowPwd(!showPwd)} style={{ color: "var(--muted-foreground)" }}>
                                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.password}</p>}
                                        {/* Strength meter */}
                                        {form.password && (
                                            <div className="mt-2">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="h-1 flex-1 rounded-full transition-all duration-300"
                                                            style={{
                                                                background: i <= pwdStrength ? strengthColors[pwdStrength] : "var(--border)",
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs" style={{ color: strengthColors[pwdStrength] }}>{strengthLabel}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                                            Confirm password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                            <input
                                                id="signup-confirm"
                                                type={showConfirm ? "text" : "password"}
                                                autoComplete="new-password"
                                                placeholder="Repeat password"
                                                value={form.confirm}
                                                onChange={(e) => setField("confirm", e.target.value)}
                                                className="input-field pl-10 pr-11"
                                                style={{ borderColor: errors.confirm ? "var(--destructive)" : undefined }}
                                            />
                                            <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2" onClick={() => setShowConfirm(!showConfirm)} style={{ color: "var(--muted-foreground)" }}>
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.confirm && <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.confirm}</p>}
                                    </div>

                                    <button type="button" onClick={handleNext} className="btn-primary w-full py-3 text-base mt-2">
                                        Continue
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                {/* Name row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>First name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                            <input
                                                id="signup-firstname"
                                                type="text"
                                                placeholder="John"
                                                value={form.firstName}
                                                onChange={(e) => setField("firstName", e.target.value)}
                                                className="input-field pl-10"
                                                style={{ borderColor: errors.firstName ? "var(--destructive)" : undefined }}
                                            />
                                        </div>
                                        {errors.firstName && <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>Last name</label>
                                        <input
                                            id="signup-lastname"
                                            type="text"
                                            placeholder="Doe"
                                            value={form.lastName}
                                            onChange={(e) => setField("lastName", e.target.value)}
                                            className="input-field"
                                            style={{ borderColor: errors.lastName ? "var(--destructive)" : undefined }}
                                        />
                                        {errors.lastName && <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.lastName}</p>}
                                    </div>
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                                        Company <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                        <input
                                            id="signup-company"
                                            type="text"
                                            placeholder="Acme Inc."
                                            value={form.company}
                                            onChange={(e) => setField("company", e.target.value)}
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            id="signup-agree"
                                            type="checkbox"
                                            checked={form.agree}
                                            onChange={(e) => setField("agree", e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
                                        />
                                        <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                            I agree to BotChat&apos;s{" "}
                                            <Link href="#" className="font-semibold" style={{ color: "var(--primary)" }}>Terms of Service</Link>
                                            {" "}and{" "}
                                            <Link href="#" className="font-semibold" style={{ color: "var(--primary)" }}>Privacy Policy</Link>
                                        </span>
                                    </label>
                                    {errors.agree && <p className="mt-1 text-xs" style={{ color: "var(--destructive)" }}>{errors.agree}</p>}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="btn-ghost flex-none px-4 py-3"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary flex-1 py-3 text-base"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin-slow" />
                                                Creating account…
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Create account
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        <p className="mt-5 text-center text-sm lg:hidden" style={{ color: "var(--muted-foreground)" }}>
                            Already have an account?{" "}
                            <Link href="/auth/sign-in" className="font-semibold" style={{ color: "var(--primary)" }}>Sign in</Link>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 px-6 py-4">
                    {["Privacy Policy", "Terms of Service", "Help"].map((t) => (
                        <Link key={t} href="#" className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
