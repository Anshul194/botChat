"use client";

import { useState } from "react";
import { CreditCard, Check, Zap, ArrowUpRight, Download, Shield, Star } from "lucide-react";

const plans = [
    {
        name: "Starter", price: 29, current: false, color: "#06b6d4",
        features: ["1 IG + 1 FB account", "500 auto-replies/mo", "3 automation flows", "Basic analytics"],
        cta: "Downgrade",
    },
    {
        name: "Pro", price: 79, current: true, color: "#7c3aed", popular: true,
        features: ["3 IG + 3 FB accounts", "Unlimited auto-replies", "Unlimited flows + AI", "Advanced analytics", "A/B testing", "Priority support"],
        cta: "Current Plan",
    },
    {
        name: "Business", price: 199, current: false, color: "#f59e0b",
        features: ["Unlimited accounts", "Custom AI training", "White-label", "API access", "Dedicated manager", "SLA guarantee"],
        cta: "Upgrade",
    },
];

const invoices = [
    { id: "INV-2025-024", date: "Feb 1, 2025", amount: "$79.00", status: "Paid" },
    { id: "INV-2025-023", date: "Jan 1, 2025", amount: "$79.00", status: "Paid" },
    { id: "INV-2025-022", date: "Dec 1, 2024", amount: "$79.00", status: "Paid" },
    { id: "INV-2025-021", date: "Nov 1, 2024", amount: "$49.00", status: "Paid" },
];

const usage = [
    { label: "Auto-Replies", used: 44180, limit: null, pct: 88, color: "#7c3aed" },
    { label: "Active Flows", used: 8, limit: null, pct: 67, color: "#06b6d4" },
    { label: "IG Accounts", used: 2, limit: 3, pct: 67, color: "#ec4899" },
    { label: "FB Accounts", used: 1, limit: 3, pct: 33, color: "#3b82f6" },
];

export default function BillingPage() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    return (
        <div className="space-y-6 max-w-[1400px] p-4 sm:p-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Billing & Plans</h1>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Manage your subscription and payment details</p>
            </div>

            {/* Current Plan Banner */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "var(--brand-gradient)" }} />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--brand-gradient)", boxShadow: "var(--glow-purple)" }}>
                            <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Pro Plan</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--brand-gradient)", color: "white" }}>ACTIVE</span>
                            </div>
                            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>$79/month · Renews March 1, 2025</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>$79</div>
                            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>per month</div>
                        </div>
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                            style={{ background: "var(--brand-gradient)", color: "white" }}>
                            Upgrade Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Usage */}
            <div className="glass-card rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-5" style={{ color: "var(--foreground)" }}>Usage This Month</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {usage.map((u) => (
                        <div key={u.label}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{u.label}</span>
                                <span className="text-sm font-bold" style={{ color: u.color }}>
                                    {typeof u.used === "number" && u.used > 100
                                        ? u.used.toLocaleString()
                                        : u.used}
                                    {u.limit ? ` / ${u.limit}` : u.label === "Auto-Replies" ? " / Unlimited" : ""}
                                </span>
                            </div>
                            <div className="h-2 rounded-full" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${u.pct}%`, background: u.color }} />
                            </div>
                            <div className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>{u.pct}% used</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plans */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Available Plans</h2>
                    <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        {(["monthly", "yearly"] as const).map((c) => (
                            <button key={c} onClick={() => setBillingCycle(c)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                                style={billingCycle === c ? { background: "var(--brand-gradient)", color: "white" } : { color: "var(--muted-foreground)" }}>
                                {c} {c === "yearly" && <span className="text-[10px] ml-1 opacity-80">-20%</span>}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                        <div key={plan.name} className="glass-card rounded-2xl p-6 relative overflow-hidden"
                            style={plan.current ? { border: `1px solid ${plan.color}50`, boxShadow: `0 0 30px ${plan.color}15` } : {}}>
                            {plan.current && (
                                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "var(--brand-gradient)" }} />
                            )}
                            {plan.popular && (
                                <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                    style={{ background: "var(--brand-gradient)", color: "white" }}>POPULAR</div>
                            )}
                            <h3 className="text-lg font-bold mb-1" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                            <div className="flex items-end gap-1 mb-5">
                                <span className="text-3xl font-extrabold" style={{ color: "var(--foreground)" }}>
                                    ${billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price}
                                </span>
                                <span className="mb-1 text-sm" style={{ color: "var(--muted-foreground)" }}>/mo</span>
                            </div>
                            <div className="space-y-2 mb-6">
                                {plan.features.map((f) => (
                                    <div key={f} className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} />
                                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                                style={plan.current
                                    ? { background: "var(--brand-gradient)", color: "white" }
                                    : { background: `${plan.color}15`, color: plan.color, border: `1px solid ${plan.color}30` }}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Payment Method</h2>
                        <button className="text-xs font-medium" style={{ color: "var(--brand-purple)" }}>Update</button>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        <div className="w-10 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                            <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Visa •••• 4242</p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Expires 12/2027</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: "#10b981" }}>
                            <Shield className="w-3 h-3" />Secure
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Billing Summary</h2>
                    </div>
                    <div className="space-y-2">
                        {[
                            { label: "Pro Plan (monthly)", value: "$79.00" },
                            { label: "Discount", value: "-$0.00" },
                            { label: "Tax", value: "$0.00" },
                        ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between text-sm">
                                <span style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                                <span style={{ color: "var(--foreground)" }}>{row.value}</span>
                            </div>
                        ))}
                        <div className="border-t pt-2 flex items-center justify-between font-bold text-sm"
                            style={{ borderColor: "var(--glass-border)" }}>
                            <span style={{ color: "var(--foreground)" }}>Total</span>
                            <span className="gradient-text">$79.00/mo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Invoice History</h2>
                    <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                        <Download className="w-3.5 h-3.5" />Export All
                    </button>
                </div>
                <div className="space-y-2">
                    {invoices.map((inv) => (
                        <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                                    <Check className="w-4 h-4" style={{ color: "#10b981" }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{inv.id}</p>
                                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{inv.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-medium px-2 py-1 rounded-full"
                                    style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{inv.status}</span>
                                <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{inv.amount}</span>
                                <button className="p-1.5 rounded-lg hover:opacity-70" style={{ background: "var(--glass-bg)" }}>
                                    <Download className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
