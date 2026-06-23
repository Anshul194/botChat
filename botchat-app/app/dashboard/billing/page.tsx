"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPlans, fetchMyPlan } from "@/store/slices/plansSlice";
import {
    CreditCard, CheckCircle2, Zap, Download, ShieldCheck,
    Star, Sparkles, TrendingUp, Users, Infinity, Rocket,
    ArrowRight, Building2, Receipt, CalendarClock,
    BadgeCheck, ChevronRight, Activity, BarChart3,
    RefreshCcw, Lock, CircleDot, Crown, Smartphone,
    MessageSquare, Bot, Wifi, Send, Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

const featureIcons: Record<string, any> = {
    whatsapp: Smartphone, telegram: Send, facebook: Globe, instagram: Globe,
    connect_account: Users, message_credit: MessageSquare, subscribers: Users,
    bot_ai_token: Bot, broadcast: Wifi, smart_inbox: Activity,
    live_chat: MessageSquare, drip_campaign: RefreshCcw, ecommerce: CreditCard,
};

const usageMock = [
    { label: "Auto-Replies", used: 44180, display: "44,180", limit: "Unlimited", pct: 88, color: "#8b5cf6", icon: RefreshCcw },
    { label: "Active Flows", used: 8, display: "8", limit: "Unlimited", pct: 67, color: "#0ea5e9", icon: Activity },
    { label: "IG Accounts", used: 2, display: "2 / 3", limit: "3", pct: 67, color: "#ec4899", icon: Users },
    { label: "FB Accounts", used: 1, display: "1 / 3", limit: "3", pct: 33, color: "#f59e0b", icon: Users },
];

const invoices = [
    { id: "INV-2025-024", date: "Feb 1, 2025", amount: "₹79.00", status: "Paid" },
    { id: "INV-2025-023", date: "Jan 1, 2025", amount: "₹79.00", status: "Paid" },
    { id: "INV-2025-022", date: "Dec 1, 2024", amount: "₹79.00", status: "Paid" },
];

function getFeatureVal(features: Record<string, any> | undefined, key: string): string {
    if (!features) return "0";
    const v = features[key];
    if (typeof v === "object" && v !== null) return String(v.value ?? v.enabled ?? "0");
    return String(v ?? "0");
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

export default function BillingPage() {
    const dispatch = useAppDispatch();
    const { plans, userPlan, isLoading } = useAppSelector((s) => s.plans);
    const user = useAppSelector((s) => s.auth.user);

    useEffect(() => {
        dispatch(fetchPlans());
        dispatch(fetchMyPlan());
    }, [dispatch]);

    const currentPlan = userPlan;

    const planPrice = currentPlan ? `₹${currentPlan.price}` : "₹0";
    const planName = currentPlan?.name || "Free";
    const planInterval = currentPlan
        ? `${currentPlan.duration} ${currentPlan.duration_type}`
        : "";

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--nav-active-color)" }}>
                        Account
                    </p>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                        Billing & Plans
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Manage your subscription, usage, and invoices
                    </p>
                </div>
                {user?.plan_expired_date && (
                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border"
                        style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)", background: "var(--glass-bg)" }}>
                        <CalendarClock className="w-3.5 h-3.5" />
                        Expires: {user.plan_expired_date}
                    </div>
                )}
            </motion.div>

            {/* Current Plan Hero */}
            <motion.div variants={itemVariants}>
                <div className="relative rounded-2xl overflow-hidden border"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 20% 50%, #8b5cf6 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #6366f1 0%, transparent 60%)" }} />
                    <div className="relative p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex items-center gap-5 flex-1">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "var(--brand-gradient)", boxShadow: "0 0 24px rgba(139,92,246,0.25)" }}>
                                    <Crown className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <h2 className="text-xl font-black" style={{ color: "var(--foreground)" }}>
                                            {currentPlan ? `${planName} Plan` : "No Plan Active"}
                                        </h2>
                                        {currentPlan && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full text-white uppercase"
                                                style={{ background: "var(--brand-gradient)" }}>
                                                <CircleDot className="w-2.5 h-2.5" />Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                        {currentPlan ? `${planPrice} / ${planInterval}` : "Subscribe to a plan to unlock features"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex flex-col items-center px-5 py-3 rounded-xl border"
                                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                                    <span className="text-2xl font-black" style={{ color: "var(--foreground)" }}>{planPrice}</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                        / {planInterval || "mo"}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center px-5 py-3 rounded-xl border"
                                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                                    <span className="text-2xl font-black" style={{ color: "#10b981" }}>
                                        {currentPlan ? getFeatureVal(currentPlan.features, "message_credit") : "0"}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                        msg credits
                                    </span>
                                </div>
                                <Link href="/pricing">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                                        style={{ background: "var(--brand-gradient)" }}
                                    >
                                        <Rocket className="w-4 h-4" /> {currentPlan ? "Change Plan" : "View Plans"}
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Usage */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Usage This Month</h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {user?.plan_expired_date ? `Resets on ${user.plan_expired_date}` : "Based on your current plan"}
                        </p>
                    </div>
                    <TrendingUp className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {usageMock.map((u) => (
                        <div key={u.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                        style={{ background: `${u.color}18` }}>
                                        <u.icon className="w-3.5 h-3.5" style={{ color: u.color }} />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{u.label}</span>
                                </div>
                                <span className="text-sm font-bold tabular-nums" style={{ color: u.color }}>
                                    {u.display}
                                    <span className="text-xs font-normal ml-1" style={{ color: "var(--muted-foreground)" }}>
                                        {u.limit !== "Unlimited" && `/ ${u.limit}`}
                                    </span>
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--glass-border)" }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${u.pct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                    className="h-full rounded-full"
                                    style={{ background: u.color }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{u.pct}% used</span>
                                {u.pct >= 80 && (
                                    <span className="text-[11px] font-semibold text-amber-500">Near limit</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Plans Grid */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Available Plans</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-2xl" style={{ borderColor: "var(--glass-border)" }}>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No plans available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan, idx) => {
                            const isCurrent = userPlan?.id === plan.id;
                            const accentColor = plan.is_highlighted ? "#8b5cf6" : "#0ea5e9";

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="relative rounded-2xl border flex flex-col overflow-hidden"
                                    style={isCurrent
                                        ? { borderColor: accentColor + "60", background: "var(--glass-bg)", boxShadow: `0 0 40px ${accentColor}12` }
                                        : { borderColor: "var(--glass-border)", background: "var(--glass-bg)" }
                                    }
                                >
                                    {isCurrent && (
                                        <div className="absolute top-0 left-0 right-0 h-0.5"
                                            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
                                    )}
                                    {plan.is_highlighted && !isCurrent && (
                                        <div className="absolute top-4 right-4">
                                            <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full text-white uppercase"
                                                style={{ background: "var(--brand-gradient)" }}>
                                                Popular
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ background: `${accentColor}18` }}>
                                                <Crown className="w-5 h-5" style={{ color: accentColor }} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                                                {plan.description && (
                                                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{plan.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-1 mb-5">
                                            <span className="text-4xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>
                                                ₹{plan.price}
                                            </span>
                                            <span className="mb-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                                                / {plan.duration} {plan.duration_type}
                                            </span>
                                        </div>

                                        <div className="border-t mb-4" style={{ borderColor: "var(--glass-border)" }} />

                                        <ul className="space-y-2.5 flex-1 mb-6">
                                            {[
                                                { key: "connect_account", label: "Connected Accounts", icon: Users },
                                                { key: "message_credit", label: "Message Credits", icon: MessageSquare },
                                                { key: "subscribers", label: "Subscribers", icon: Users },
                                                { key: "bot_ai_token", label: "AI Tokens", icon: Bot },
                                            ].map((f) => (
                                                <li key={f.key} className="flex items-center gap-2.5">
                                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
                                                    <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                                        {getFeatureVal(plan.features, f.key)} {f.label}
                                                    </span>
                                                </li>
                                            ))}
                                            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                                                {["whatsapp", "telegram", "facebook", "instagram"].filter((ch) => getFeatureVal(plan.features, ch) === "1").map((ch) => {
                                                    const Icon = featureIcons[ch] || Globe;
                                                    return (
                                                        <span key={ch} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                                            style={{ background: `${accentColor}12`, color: accentColor }}>
                                                            <Icon className="w-3 h-3" /> {ch}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </ul>

                                        <Link href={isCurrent ? "#" : "/pricing"} className="w-full">
                                            <motion.button
                                                whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                                                whileTap={{ scale: isCurrent ? 1 : 0.97 }}
                                                disabled={isCurrent}
                                                className={cn(
                                                    "w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                                    isCurrent && "opacity-80 cursor-default"
                                                )}
                                                style={isCurrent
                                                    ? { background: "var(--brand-gradient)", color: "white" }
                                                    : { background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}30` }
                                                }
                                            >
                                                {isCurrent ? "Current Plan" : "Upgrade"}
                                                {!isCurrent && <ChevronRight className="w-4 h-4" />}
                                            </motion.button>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Payment & Summary */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-5"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Payment Method</h2>
                        <button
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                            style={{ borderColor: "var(--glass-border)", color: "var(--nav-active-color)" }}
                        >
                            Update
                        </button>
                    </div>
                    <div className="flex items-center gap-3.5 p-4 rounded-xl border"
                        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                        <div className="w-12 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--brand-gradient)" }}>
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Visa •••• 4242</p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Expires 12/2027</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <ShieldCheck className="w-3 h-3" /> Secured
                        </span>
                    </div>
                    <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                        <Lock className="w-3 h-3" /> 256-bit SSL encryption · PCI DSS compliant
                    </p>
                </div>

                <div className="rounded-2xl border p-5"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <h2 className="text-sm font-bold mb-5" style={{ color: "var(--foreground)" }}>Billing Summary</h2>
                    <div className="space-y-3">
                        {[
                            { label: `${planName} Plan (${planInterval || "monthly"})`, value: planPrice },
                            { label: "Promotional discount", value: "−$0.00", muted: true },
                            { label: "Tax (GST 0%)", value: "₹0.00", muted: true },
                        ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between text-sm">
                                <span style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                                <span className="font-medium tabular-nums" style={{ color: row.muted ? "var(--muted-foreground)" : "var(--foreground)" }}>
                                    {row.value}
                                </span>
                            </div>
                        ))}
                        <div className="border-t pt-3 flex items-center justify-between"
                            style={{ borderColor: "var(--glass-border)" }}>
                            <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Total due</span>
                            <span className="text-lg font-black gradient-text">{planPrice} / {planInterval || "mo"}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Invoices */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Invoice History</h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {invoices.length} invoices · all paid
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:opacity-80"
                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", borderColor: "var(--glass-border)" }}
                    >
                        <Download className="w-3.5 h-3.5" /> Export All
                    </button>
                </div>
                <div className="space-y-2">
                    {invoices.map((inv, i) => (
                        <motion.div
                            key={inv.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="group flex items-center gap-4 p-4 rounded-xl border transition-colors"
                            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: "rgba(16,185,129,0.1)" }}>
                                <Receipt className="w-4 h-4" style={{ color: "#10b981" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{inv.id}</p>
                                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{inv.date}</p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                                {inv.status}
                            </span>
                            <span className="text-sm font-black tabular-nums w-16 text-right" style={{ color: "var(--foreground)" }}>
                                {inv.amount}
                            </span>
                            <button
                                className="w-8 h-8 rounded-lg flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}
                            >
                                <Download className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
