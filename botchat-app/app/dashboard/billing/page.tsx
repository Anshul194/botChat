"use client";

import { useState } from "react";
import {
    CreditCard,
    CheckCircle2,
    Zap,
    Download,
    ShieldCheck,
    Star,
    Sparkles,
    TrendingUp,
    Users,
    Infinity,
    Rocket,
    ArrowRight,
    Building2,
    Receipt,
    CalendarClock,
    BadgeCheck,
    ChevronRight,
    Activity,
    BarChart3,
    RefreshCcw,
    Lock,
    CircleDot,
    Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Starter",
        price: 29,
        current: false,
        accentColor: "#0ea5e9",
        icon: Zap,
        description: "Perfect for individuals getting started",
        features: [
            { text: "1 IG + 1 FB account", icon: Users },
            { text: "500 auto-replies / mo", icon: RefreshCcw },
            { text: "3 automation flows", icon: Activity },
            { text: "Basic analytics", icon: BarChart3 },
        ],
        cta: "Downgrade",
        ctaVariant: "ghost" as const,
    },
    {
        name: "Pro",
        price: 79,
        current: true,
        accentColor: "#8b5cf6",
        icon: Crown,
        description: "For growing businesses & power users",
        popular: true,
        features: [
            { text: "3 IG + 3 FB accounts", icon: Users },
            { text: "Unlimited auto-replies", icon: Infinity },
            { text: "Unlimited flows + AI", icon: Sparkles },
            { text: "Advanced analytics", icon: BarChart3 },
            { text: "A/B testing", icon: Activity },
            { text: "Priority support", icon: ShieldCheck },
        ],
        cta: "Current Plan",
        ctaVariant: "primary" as const,
    },
    {
        name: "Business",
        price: 199,
        current: false,
        accentColor: "#f59e0b",
        icon: Building2,
        description: "Enterprise-grade for large teams",
        features: [
            { text: "Unlimited accounts", icon: Infinity },
            { text: "Custom AI training", icon: Sparkles },
            { text: "White-label solution", icon: Star },
            { text: "Full API access", icon: Lock },
            { text: "Dedicated manager", icon: Users },
            { text: "SLA guarantee", icon: BadgeCheck },
        ],
        cta: "Upgrade",
        ctaVariant: "accent" as const,
    },
];

const invoices = [
    { id: "INV-2025-024", date: "Feb 1, 2025", amount: "$79.00", status: "Paid" },
    { id: "INV-2025-023", date: "Jan 1, 2025", amount: "$79.00", status: "Paid" },
    { id: "INV-2025-022", date: "Dec 1, 2024", amount: "$79.00", status: "Paid" },
    { id: "INV-2025-021", date: "Nov 1, 2024", amount: "$49.00", status: "Paid" },
];

const usage = [
    { label: "Auto-Replies", used: 44180, display: "44,180", limit: "Unlimited", pct: 88, color: "#8b5cf6", icon: RefreshCcw },
    { label: "Active Flows", used: 8, display: "8", limit: "Unlimited", pct: 67, color: "#0ea5e9", icon: Activity },
    { label: "IG Accounts", used: 2, display: "2 / 3", limit: "3", pct: 67, color: "#ec4899", icon: Users },
    { label: "FB Accounts", used: 1, display: "1 / 3", limit: "3", pct: 33, color: "#f59e0b", icon: Users },
];

export default function BillingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.07 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
        >
            {/* ── Header ── */}
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
                <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border"
                    style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)", background: "var(--glass-bg)" }}>
                    <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                    Next billing: March 1, 2025
                </div>
            </motion.div>

            {/* ── Current Plan Hero ── */}
            <motion.div variants={itemVariants}>
                <div className="relative rounded-2xl overflow-hidden border"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    {/* Subtle ambient gradient */}
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 20% 50%, #8b5cf6 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #6366f1 0%, transparent 60%)" }} />

                    <div className="relative p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Left: plan info */}
                            <div className="flex items-center gap-5 flex-1">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: "var(--brand-gradient)", boxShadow: "0 0 24px rgba(139,92,246,0.25)" }}>
                                    <Crown className="w-7 h-7 text-white" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <h2 className="text-xl font-black" style={{ color: "var(--foreground)" }}>Pro Plan</h2>
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full text-white uppercase"
                                            style={{ background: "var(--brand-gradient)" }}>
                                            <CircleDot className="w-2.5 h-2.5" aria-hidden="true" />Active
                                        </span>
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                        $79 / month · Renews March 1, 2025
                                    </p>
                                </div>
                            </div>

                            {/* Right: stats + actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex flex-col items-center px-5 py-3 rounded-xl border"
                                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                                    <span className="text-2xl font-black" style={{ color: "var(--foreground)" }}>$79</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>/ month</span>
                                </div>
                                <div className="flex flex-col items-center px-5 py-3 rounded-xl border"
                                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                                    <span className="text-2xl font-black" style={{ color: "#10b981" }}>44k</span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>replies sent</span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                                    style={{ background: "var(--brand-gradient)" }}
                                >
                                    <Rocket className="w-4 h-4" aria-hidden="true" /> Upgrade Plan
                                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Usage ── */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Usage This Month</h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Resets on March 1, 2025</p>
                    </div>
                    <TrendingUp className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} aria-hidden="true" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {usage.map((u) => (
                        <div key={u.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                        style={{ background: `${u.color}18` }}>
                                        <u.icon className="w-3.5 h-3.5" style={{ color: u.color }} aria-hidden="true" />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{u.label}</span>
                                </div>
                                <span className="text-sm font-bold tabular-nums" style={{ color: u.color }}>
                                    {u.display}
                                    <span className="text-xs font-normal ml-1" style={{ color: "var(--muted-foreground)" }}>
                                        {u.limit !== u.display.split(" / ")[1] && `/ ${u.limit}`}
                                    </span>
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden"
                                style={{ background: "var(--glass-border)" }}>
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

            {/* ── Plans ── */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Available Plans</h2>
                    {/* Billing toggle */}
                    <div className="relative flex items-center rounded-xl p-1 gap-1 border"
                        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                        {(["monthly", "yearly"] as const).map((c) => (
                            <button key={c} onClick={() => setBillingCycle(c)}
                                className="relative px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all z-10"
                                style={billingCycle === c
                                    ? { background: "var(--brand-gradient)", color: "white" }
                                    : { color: "var(--muted-foreground)" }
                                }>
                                {c}
                                {c === "yearly" && (
                                    <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={billingCycle === "yearly"
                                            ? { background: "rgba(255,255,255,0.2)", color: "white" }
                                            : { background: "#10b98120", color: "#10b981" }}>
                                        -20%
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan, idx) => {
                        const Icon = plan.icon;
                        const price = billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price;

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="relative rounded-2xl border flex flex-col overflow-hidden"
                                style={plan.current
                                    ? { borderColor: plan.accentColor + "60", background: "var(--glass-bg)", boxShadow: `0 0 40px ${plan.accentColor}12` }
                                    : { borderColor: "var(--glass-border)", background: "var(--glass-bg)" }
                                }
                            >
                                {/* Top accent line */}
                                {plan.current && (
                                    <div className="absolute top-0 left-0 right-0 h-0.5"
                                        style={{ background: `linear-gradient(90deg, transparent, ${plan.accentColor}, transparent)` }} />
                                )}

                                {/* Popular badge */}
                                {plan.popular && (
                                    <div className="absolute top-4 right-4">
                                        <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full text-white uppercase"
                                            style={{ background: "var(--brand-gradient)" }}>
                                            Popular
                                        </span>
                                    </div>
                                )}

                                <div className="p-6 flex flex-col flex-1">
                                    {/* Icon + name */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ background: plan.accentColor + "18" }}>
                                            <Icon className="w-5 h-5" style={{ color: plan.accentColor }} aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                                            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{plan.description}</p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-end gap-1 mb-5">
                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={price}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 8 }}
                                                className="text-4xl font-black tabular-nums"
                                                style={{ color: "var(--foreground)" }}
                                            >
                                                ${price}
                                            </motion.span>
                                        </AnimatePresence>
                                        <span className="mb-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>/ mo</span>
                                        {billingCycle === "yearly" && (
                                            <span className="mb-1.5 ml-1 text-[11px] font-semibold line-through"
                                                style={{ color: "var(--muted-foreground)" }}>${plan.price}</span>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t mb-4" style={{ borderColor: "var(--glass-border)" }} />

                                    {/* Features */}
                                    <ul className="space-y-2.5 flex-1 mb-6" role="list" aria-label={`${plan.name} plan features`}>
                                        {plan.features.map((f) => (
                                            <li key={f.text} className="flex items-center gap-2.5">
                                                <CheckCircle2
                                                    className="w-4 h-4 flex-shrink-0"
                                                    style={{ color: plan.accentColor }}
                                                    aria-hidden="true"
                                                />
                                                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{f.text}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        disabled={plan.current}
                                        aria-label={`${plan.cta} – ${plan.name} plan`}
                                        className={cn(
                                            "w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                                            plan.current && "opacity-80 cursor-default"
                                        )}
                                        style={plan.current
                                            ? { background: "var(--brand-gradient)", color: "white" }
                                            : plan.ctaVariant === "accent"
                                                ? { background: plan.accentColor + "18", color: plan.accentColor, border: `1px solid ${plan.accentColor}35` }
                                                : { background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }
                                        }
                                    >
                                        {plan.cta}
                                        {!plan.current && <ChevronRight className="w-4 h-4" aria-hidden="true" />}
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Payment & Summary ── */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Method */}
                <div className="rounded-2xl border p-5"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Payment Method</h2>
                        <button
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                            style={{ borderColor: "var(--glass-border)", color: "var(--nav-active-color)" }}
                            aria-label="Update payment method"
                        >
                            Update
                        </button>
                    </div>

                    <div className="flex items-center gap-3.5 p-4 rounded-xl border"
                        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                        <div className="w-12 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--brand-gradient)" }}>
                            <CreditCard className="w-5 h-5 text-white" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Visa •••• 4242</p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Expires 12/2027</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Secured
                        </div>
                    </div>

                    <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                        <Lock className="w-3 h-3" aria-hidden="true" />
                        256-bit SSL encryption · PCI DSS compliant
                    </p>
                </div>

                {/* Billing Summary */}
                <div className="rounded-2xl border p-5"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <h2 className="text-sm font-bold mb-5" style={{ color: "var(--foreground)" }}>Billing Summary</h2>
                    <div className="space-y-3">
                        {[
                            { label: "Pro Plan (monthly)", value: "$79.00" },
                            { label: "Promotional discount", value: "−$0.00", muted: true },
                            { label: "Tax (GST 0%)", value: "$0.00", muted: true },
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
                            <span className="text-lg font-black gradient-text">$79.00 / mo</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Invoices ── */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Invoice History</h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {invoices.length} invoices · all paid
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        aria-label="Export all invoices"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:opacity-80"
                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", borderColor: "var(--glass-border)" }}
                    >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" /> Export All
                    </motion.button>
                </div>

                <div className="space-y-2">
                    {invoices.map((inv, i) => (
                        <motion.div
                            key={inv.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="group flex items-center gap-4 p-4 rounded-xl border transition-colors hover:border-neutral-300 dark:hover:border-neutral-600"
                            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
                        >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(16,185,129,0.1)" }}>
                                <Receipt className="w-4 h-4" style={{ color: "#10b981" }} aria-hidden="true" />
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
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label={`Download invoice ${inv.id}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}
                            >
                                <Download className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} aria-hidden="true" />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}