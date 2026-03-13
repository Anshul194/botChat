// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Mail, Lock, Zap, MessageSquare,
    ArrowRight, Chrome, Check, AlertCircle, Facebook,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import { loginUser, fetchMe } from "@/store/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    const [socialLoading, setSocialLoading] = useState<string | null>(null);

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

    const handleSocialLogin = async (platform: string) => {
        if (socialLoading) return;
        setSocialLoading(platform);

        // 1. Create a professional centered popup
        const width = 600;
        const height = 750;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        
        const popup = window.open(
            'about:blank',
            `social-auth-${platform}`,
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
            toast.error("Popup blocked! Please allow popups for this site.");
            setSocialLoading(null);
            return;
        }

        try {
            // 2. Get the official OAuth redirect URL from your backend
            const response = await api.get(`/auth/social/${platform}`);
            
            if (response.data.success && response.data.data.redirect_url) {
                // Point the popup to Facebook/Google
                popup.location.href = response.data.data.redirect_url;

                // 3. Monitor the popup and session
                const pollTimer = setInterval(async () => {
                    // If user manually closes the popup, check if they actually logged in
                    if (popup.closed) {
                        clearInterval(pollTimer);
                        setSocialLoading(null);
                        
                        // Attempt to fetch the session (works if backend set cookies or if we can poll API)
                        const result = await dispatch(fetchMe());
                        if (fetchMe.fulfilled.match(result)) {
                            toast.success(`Welcome back!`, {
                                description: "You've successfully connected your account."
                            });
                            router.push('/dashboard');
                        }
                        return;
                    }

                    try {
                        // If same-domain (Production), we can try to auto-detect the JSON content
                        // and close the window automatically for the user.
                        if (popup.location.href.includes('/callback')) {
                            const bodyText = popup.document.body.innerText;
                            if (bodyText.includes('"success":true')) {
                                clearInterval(pollTimer);
                                const data = JSON.parse(bodyText);
                                if (data.data?.token) {
                                    localStorage.setItem('token', data.data.token);
                                    await dispatch(fetchMe());
                                    popup.close();
                                    router.push('/dashboard');
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore cross-origin errors during the OAuth redirect phases
                    }
                }, 1000);

            } else {
                popup.close();
                toast.error(`Failed to initialize ${platform} login`);
                setSocialLoading(null);
            }
        } catch (err: any) {
            popup.close();
            console.error(`${platform} Login Error:`, err);
            toast.error(err.response?.data?.message || `Error connecting to ${platform}`);
            setSocialLoading(null);
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
                        <div className="flex flex-col gap-2.5 mb-8">
                            {[
                                {
                                    id: 'google',
                                    label: 'Continue with Google',
                                    icon: (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z" fill="#EA4335" />
                                        </svg>
                                    ),
                                },
                                {
                                    id: 'facebook',
                                    label: 'Continue with Facebook',
                                    icon: (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
                                            ? <div className="w-4 h-4 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                                            : p.icon}
                                    </span>
                                    <span className="flex-1 text-center">{p.label}</span>
                                    <span className="w-5" />
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
