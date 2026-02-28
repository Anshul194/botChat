"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye, EyeOff, Mail, Lock, Zap, MessageSquare,
    ArrowRight, Github, Chrome, Check, AlertCircle,
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

    const [showPwd, setShowPwd] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // Status states for micro feedback
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [serverError, setServerError] = useState("");

    const validate = () => {
        const e: typeof errors = {};
        if (!form.email) e.email = "Required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid structure";
        if (!form.password) e.password = "Required";
        else if (form.password.length < 6) e.password = "Too short";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 2000);
            return;
        }

        setStatus("loading");
        setServerError("");

        try {
            await dispatch(loginUser({ email: form.email, password: form.password })).unwrap();

            // Contextual morph to success
            setStatus("success");

            // Soft route push
            setTimeout(() => {
                router.push("/dashboard");
            }, 1000);
        } catch (err: any) {
            // Inline physical visual rejection
            setStatus("error");
            setServerError(err || "Invalid credentials");
            setTimeout(() => setStatus("idle"), 2500);
        }
    };

    return (
        <div
            className="auth-bg min-h-screen flex"
            style={{ background: "var(--background)" }}
        >
            {/* ── Left Panel — Branding ──────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[46%] flex-col relative overflow-hidden"
                style={{
                    background: "linear-gradient(160deg, var(--brand-pink-dark) 0%, var(--primary) 55%, var(--accent) 100%)",
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
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 absolute top-0 w-full z-10">
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
                <div className="flex-1 flex items-center justify-center px-6 py-8 h-full">
                    <motion.div
                        className="w-full max-w-[380px] mt-12"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div className="mb-8 text-center flex flex-col items-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 lg:hidden">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-1.5" style={{ color: "var(--foreground)" }}>
                                Welcome back
                            </h2>
                            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                Enter your details to access your workspace
                            </p>
                        </div>

                        {/* Social (De-emphasized contextually) */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {[
                                { icon: <Chrome className="w-4 h-4" />, label: "Google" },
                                { icon: <Github className="w-4 h-4" />, label: "GitHub" },
                            ].map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 hover:bg-muted/50"
                                    style={{
                                        background: "var(--card)",
                                        borderColor: "var(--border)",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    {p.icon}
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 divider opacity-50" />
                            <span className="text-xs font-medium px-1" style={{ color: "var(--muted-foreground)" }}>
                                OR
                            </span>
                            <div className="flex-1 divider opacity-50" />
                        </div>

                        {/* Form Body - uses animation to physically reject errors */}
                        <motion.form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4"
                            animate={status === "error" ? { x: [-8, 8, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="space-y-3.5">
                                {/* Email Input */}
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                                        style={{ color: status === "error" && errors.email ? "var(--destructive)" : "var(--muted-foreground)" }}
                                    />
                                    <input
                                        id="signin-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="Email address"
                                        value={form.email}
                                        onChange={(e) => {
                                            setForm((f) => ({ ...f, email: e.target.value }));
                                            if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                                            if (serverError) setServerError("");
                                        }}
                                        className="input-field pl-10 h-12 rounded-xl transition-all"
                                        style={{
                                            background: "var(--background)",
                                            borderColor: errors.email || (status === "error" && !errors.password) ? "var(--destructive)" : "var(--border)",
                                            boxShadow: status === "error" && errors.email ? "0 0 0 1px var(--destructive)" : undefined
                                        }}
                                    />
                                    <AnimatePresence>
                                        {errors.email && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
                                                style={{ color: "var(--destructive)" }}
                                            >
                                                {errors.email}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Password Input */}
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                                        style={{ color: status === "error" && errors.password ? "var(--destructive)" : "var(--muted-foreground)" }}
                                    />
                                    <input
                                        id="signin-password"
                                        type={showPwd ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        value={form.password}
                                        onChange={(e) => {
                                            setForm((f) => ({ ...f, password: e.target.value }));
                                            if (errors.password) setErrors((er) => ({ ...er, password: undefined }));
                                            if (serverError) setServerError("");
                                        }}
                                        className="input-field pl-10 pr-11 h-12 rounded-xl transition-all"
                                        style={{
                                            background: "var(--background)",
                                            borderColor: errors.password ? "var(--destructive)" : "var(--border)",
                                            boxShadow: status === "error" && errors.password ? "0 0 0 1px var(--destructive)" : undefined
                                        }}
                                    />
                                    <AnimatePresence>
                                        {errors.password && !showPwd && (
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute right-10 top-1/2 -translate-y-1/2 text-xs font-semibold"
                                                style={{ color: "var(--destructive)" }}
                                            >
                                                {errors.password}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    <button
                                        type="button"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-foreground"
                                        onClick={() => setShowPwd(!showPwd)}
                                        style={{ color: "var(--muted-foreground)" }}
                                    >
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pb-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="relative flex items-center justify-center w-4 h-4 border rounded transition-colors"
                                        style={{ borderColor: "var(--border)" }}>
                                        <input
                                            type="checkbox"
                                            className="peer absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity z-10" />
                                        <div className="absolute inset-0 rounded bg-primary scale-0 peer-checked:scale-100 transition-transform origin-center" />
                                    </div>
                                    <span className="text-xs transition-colors group-hover:text-foreground" style={{ color: "var(--muted-foreground)" }}>
                                        Keep me signed in
                                    </span>
                                </label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-xs font-semibold hover:underline"
                                    style={{ color: "var(--primary)" }}
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Inline Server Error Rejection (Context instead of Notification) */}
                            <AnimatePresence>
                                {status === "error" && serverError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="flex items-center justify-center gap-2 text-xs font-medium bg-destructive/10 text-destructive rounded-lg py-2.5 overflow-hidden"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        {serverError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Main CTA Morphing Physical State */}
                            <motion.button
                                type="submit"
                                disabled={status === "loading" || status === "success"}
                                className="w-full h-12 rounded-xl flex items-center justify-center font-semibold text-white transition-shadow relative overflow-hidden"
                                animate={{
                                    backgroundColor:
                                        status === "error" ? "var(--destructive)" :
                                            status === "success" ? "#10b981" : // emerald-500
                                                "var(--primary)",
                                    scale: status === "success" ? 1.02 : 1
                                }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    // Layer gradient on idle/load logic
                                    background: status === "idle" || status === "loading" ? "var(--brand-gradient)" : undefined,
                                    opacity: status === "loading" ? 0.9 : 1,
                                    cursor: status === "success" || status === "loading" ? "default" : "pointer"
                                }}
                            >
                                <AnimatePresence mode="popLayout">
                                    {status === "idle" && (
                                        <motion.span
                                            key="idle"
                                            initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                            exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
                                            className="flex items-center gap-2"
                                        >
                                            Sign In
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.span>
                                    )}
                                    {status === "loading" && (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            className="w-5 h-5 border-[2.5px] border-white/30 border-t-white rounded-full spin-slow"
                                        />
                                    )}
                                    {status === "success" && (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-2"
                                        >
                                            <Check className="w-5 h-5" strokeWidth={3} />
                                        </motion.div>
                                    )}
                                    {status === "error" && (
                                        <motion.span
                                            key="error"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center gap-2"
                                        >
                                            Failed
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </motion.form>

                        <p className="mt-8 text-center text-sm lg:hidden" style={{ color: "var(--muted-foreground)" }}>
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/sign-up" className="font-semibold" style={{ color: "var(--primary)" }}>
                                Sign up free
                            </Link>
                        </p>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center gap-4 px-6 py-6 absolute bottom-0 w-full text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {["Privacy", "Terms", "Help"].map((t) => (
                        <Link key={t} href="#" className="hover:text-foreground transition-colors">
                            {t}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
