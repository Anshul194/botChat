"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Mail, Lock, User, Building2, Zap,
    MessageSquare, ArrowRight, Chrome, Check, AlertCircle,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import { registerUser } from "@/store/slices/authSlice";
import { useSocialLogin } from "@/hooks/useSocialLogin";
import { Facebook } from "lucide-react";

export default function SignUpPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { theme } = useTheme();
    const isLight = theme === "light";
    const { handleSocialLogin, socialLoading } = useSocialLogin();

    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
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

    const handleNext = () => { if (validateStep1()) setStep(2); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setLoading(true);
        try {
            await dispatch(registerUser({
                name: `${form.firstName.trim()} ${form.lastName.trim()}`,
                email: form.email.trim(),
                password: form.password,
                password_confirmation: form.confirm,
            })).unwrap();
            router.push("/dashboard");
        } catch (err: any) {
            // Show the API error message under the submit button
            setErrors((prev) => ({ ...prev, _api: typeof err === 'string' ? err : err?.message || 'Registration failed. Please try again.' }));
        } finally {
            setLoading(false);
        }
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
    const strengthColors = ["", "#ef4444", "#f59e0b", "var(--primary)", "#22c55e"];

    const features = [
        "Unlimited Instagram & Facebook connections",
        "AI-powered automated replies",
        "Advanced flow builder",
        "Real-time analytics dashboard",
    ];

    // Shared input style
    const inputStyle = (hasError: boolean) => ({
        background: isLight ? "#ffffff" : "rgba(255,255,255,0.06)",
        border: `1.5px solid ${hasError ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
        color: isLight ? "#1e1b4b" : "#f1f5f9",
    });
    const labelStyle = { color: isLight ? "#1e1b4b" : "#e2e8f0" };

    return (
        <div className="min-h-screen flex" style={{ background: isLight ? "#f8fafc" : "#06030f" }}>

            {/* ── Left panel ── */}
            <div
                className="hidden lg:flex lg:w-[44%] flex-col relative overflow-hidden"
                style={{ background: "linear-gradient(155deg, #124ba8 0%, #1e5fd4 45%, #6366f1 100%)" }}
            >
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #38b2ff 0%, transparent 70%)" }} />
                <div className="absolute bottom-20 -left-10 w-56 h-56 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "36px 36px",
                    }} />
                <div className="relative z-10 flex flex-col h-full p-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">BotChat</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center mt-12">
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-xs font-semibold w-fit mb-6">
                            <Zap className="w-3.5 h-3.5" /> Start free — no credit card needed
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
                        <div className="flex items-center gap-4">
                            {["SOC 2", "GDPR", "ISO 27001"].map((b) => (
                                <div key={b} className="bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-white/80 text-xs font-semibold">{b}</div>
                            ))}
                            <span className="text-white/50 text-xs">Certified</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {["B", "A", "M", "K", "S"].map((l, i) => (
                                <div key={l} className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold text-xs"
                                    style={{ background: `hsl(${320 + i * 15}, 80%, ${50 + i * 5}%)`, zIndex: 5 - i }}>
                                    {l}
                                </div>
                            ))}
                        </div>
                        <p className="text-white/70 text-sm"><span className="text-white font-semibold">2,400+</span> joined this month</p>
                    </div>
                </div>
            </div>

            {/* ── Right panel ── */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
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
                        <span className="text-sm whitespace-nowrap" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                            <span className="hidden sm:inline">Have an account? </span>
                            <Link href="/auth/sign-in" className="font-semibold" style={{ color: "#ec4899" }}>Sign in</Link>
                        </span>
                        <ThemeToggle />
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-y-auto">
                    <div className="w-full max-w-[420px]">

                        {/* Step indicator */}
                        <div className="flex items-center gap-2 mb-7">
                            {[1, 2].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                        style={{
                                            background: step >= s ? "linear-gradient(135deg, #1e5fd4, #6366f1)" : isLight ? "#f1f5f9" : "rgba(255,255,255,0.08)",
                                            color: step >= s ? "#fff" : isLight ? "#94a3b8" : "#64748b",
                                            boxShadow: step === s ? "0 0 16px rgba(30,95,212,0.4)" : "none",
                                        }}>
                                        {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                                    </div>
                                    <span className="text-xs font-medium"
                                        style={{ color: step >= s ? isLight ? "#1e1b4b" : "#e2e8f0" : isLight ? "#94a3b8" : "#64748b" }}>
                                        {s === 1 ? "Account" : "Profile"}
                                    </span>
                                    {s < 2 && (
                                        <div className="w-10 h-px mx-1"
                                            style={{ background: step > 1 ? "var(--primary)" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" }} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Heading */}
                        <div className="mb-7">
                            <h2 className="text-2xl font-extrabold mb-1.5" style={{ color: isLight ? "#1e1b4b" : "#f8fafc" }}>
                                {step === 1 ? "Create your account ✨" : "Complete your profile"}
                            </h2>
                            <p className="text-sm" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                                {step === 1 ? "Set up your credentials to get started" : "Tell us a little about yourself"}
                            </p>
                        </div>

                        {step === 1 ? (
                            <>
                                {/* Social */}
                                <div className="flex flex-col gap-2.5 mb-6">
                                    {[
                                        {
                                            id: 'google',
                                            label: 'Continue with Google',
                                            icon: (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84z" fill="#EA4335" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            id: 'facebook',
                                            label: 'Continue with Facebook',
                                            icon: (
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                                                </svg>
                                            ),
                                        },
                                    ].map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => handleSocialLogin(p.id)}
                                            disabled={!!socialLoading}
                                            className="relative flex items-center gap-3 w-full px-[18px] h-12 rounded-xl text-sm font-medium transition-all"
                                            style={{
                                                background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                                border: `0.5px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)'}`,
                                                color: isLight ? '#1e1b4b' : '#f1f5f9',
                                            }}
                                        >
                                            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                                {socialLoading === p.id
                                                    ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                    : p.icon}
                                            </span>
                                            <span className="flex-1 text-center">{p.label}</span>
                                            <span className="w-5" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-1 h-px" style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }} />
                                    <span className="text-xs px-1" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>or with email</span>
                                    <div className="flex-1 h-px" style={{ background: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)" }} />
                                </div>

                                <div className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Work email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                                style={{ color: isLight ? "#94a3b8" : "#64748b" }} />
                                            <input id="signup-email" type="email" autoComplete="email" placeholder="you@company.com"
                                                value={form.email} onChange={(e) => setField("email", e.target.value)}
                                                className="w-full pl-10 pr-4 h-12 rounded-xl text-sm outline-none transition-all"
                                                style={inputStyle(!!errors.email)}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,95,212,0.12)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = errors.email ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                                style={{ color: isLight ? "#94a3b8" : "#64748b" }} />
                                            <input id="signup-password" type={showPwd ? "text" : "password"} autoComplete="new-password"
                                                placeholder="Min. 8 characters" value={form.password} onChange={(e) => setField("password", e.target.value)}
                                                className="w-full pl-10 pr-12 h-12 rounded-xl text-sm outline-none transition-all"
                                                style={inputStyle(!!errors.password)}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,95,212,0.12)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = errors.password ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                            />
                                            <button type="button" onClick={() => setShowPwd(!showPwd)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
                                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}><AlertCircle className="w-3 h-3" />{errors.password}</p>}
                                        {form.password && (
                                            <div className="mt-2">
                                                <div className="flex gap-1 mb-1">
                                                    {[1, 2, 3, 4].map((i) => (
                                                        <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                                            style={{ background: i <= pwdStrength ? strengthColors[pwdStrength] : isLight ? "#e2e8f0" : "rgba(255,255,255,0.1)" }} />
                                                    ))}
                                                </div>
                                                <p className="text-xs font-medium" style={{ color: strengthColors[pwdStrength] }}>{strengthLabel}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Confirm password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                                style={{ color: isLight ? "#94a3b8" : "#64748b" }} />
                                            <input id="signup-confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password"
                                                placeholder="Repeat password" value={form.confirm} onChange={(e) => setField("confirm", e.target.value)}
                                                className="w-full pl-10 pr-12 h-12 rounded-xl text-sm outline-none transition-all"
                                                style={inputStyle(!!errors.confirm)}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,95,212,0.12)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = errors.confirm ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                            />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
                                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.confirm && <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}><AlertCircle className="w-3 h-3" />{errors.confirm}</p>}
                                    </div>

                                    <button type="button" onClick={handleNext}
                                        className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all mt-2"
                                        style={{
                                            background: "linear-gradient(135deg, #1e5fd4 0%, #6366f1 100%)",
                                            boxShadow: "0 4px 20px rgba(30,95,212,0.30)"
                                        }}>
                                        Continue <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                {/* Name row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>First name</label>
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                                style={{ color: isLight ? "#94a3b8" : "#64748b" }} />
                                            <input id="signup-firstname" type="text" placeholder="John"
                                                value={form.firstName} onChange={(e) => setField("firstName", e.target.value)}
                                                className="w-full pl-10 pr-3 h-12 rounded-xl text-sm outline-none transition-all"
                                                style={inputStyle(!!errors.firstName)}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,95,212,0.12)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = errors.firstName ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                            />
                                        </div>
                                        {errors.firstName && <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>Last name</label>
                                        <input id="signup-lastname" type="text" placeholder="Doe"
                                            value={form.lastName} onChange={(e) => setField("lastName", e.target.value)}
                                            className="w-full px-3 h-12 rounded-xl text-sm outline-none transition-all"
                                            style={inputStyle(!!errors.lastName)}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,95,212,0.12)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = errors.lastName ? "#ef4444" : isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                        {errors.lastName && <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{errors.lastName}</p>}
                                    </div>
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={labelStyle}>
                                        Company <span className="font-normal" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                            style={{ color: isLight ? "#94a3b8" : "#64748b" }} />
                                        <input id="signup-company" type="text" placeholder="Acme Inc."
                                            value={form.company} onChange={(e) => setField("company", e.target.value)}
                                            className="w-full pl-10 pr-4 h-12 rounded-xl text-sm outline-none transition-all"
                                            style={inputStyle(false)}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,95,212,0.12)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div>
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input id="signup-agree" type="checkbox" checked={form.agree}
                                            onChange={(e) => setField("agree", e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded accent-primary cursor-pointer flex-shrink-0" />
                                        <span className="text-sm" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                                            I agree to BotChat&apos;s{" "}
                                            <Link href="#" className="font-semibold" style={{ color: "var(--primary)" }}>Terms of Service</Link>
                                            {" "}and{" "}
                                            <Link href="#" className="font-semibold" style={{ color: "var(--primary)" }}>Privacy Policy</Link>
                                        </span>
                                    </label>
                                    {errors.agree && <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}><AlertCircle className="w-3 h-3" />{errors.agree}</p>}
                                </div>

                                {errors._api && (
                                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid rgba(239,68,68,0.25)" }}>
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#ef4444" }} />
                                        <p className="text-sm font-medium" style={{ color: "#ef4444" }}>{errors._api}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)}
                                        className="px-5 h-12 rounded-xl text-sm font-semibold transition-all"
                                        style={{
                                            background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.07)",
                                            color: isLight ? "#64748b" : "#94a3b8",
                                            border: `1.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`
                                        }}>
                                        Back
                                    </button>
                                    <button type="submit" disabled={loading}
                                        className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all"
                                        style={{
                                            background: "linear-gradient(135deg, #1e5fd4 0%, #6366f1 100%)",
                                            boxShadow: "0 4px 20px rgba(30,95,212,0.30)",
                                            opacity: loading ? 0.85 : 1
                                        }}>
                                        {loading ? (
                                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                                        ) : (
                                            <>Create account <ArrowRight className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        <p className="mt-5 text-center text-sm lg:hidden" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                            Already have an account?{" "}
                            <Link href="/auth/sign-in" className="font-semibold" style={{ color: "#ec4899" }}>Sign in</Link>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-5 px-6 py-4 text-xs" style={{ color: isLight ? "#94a3b8" : "#475569" }}>
                    {["Privacy Policy", "Terms of Service", "Help"].map((t) => (
                        <Link key={t} href="#" className="hover:underline">{t}</Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
