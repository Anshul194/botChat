"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPlans } from "@/store/slices/plansSlice";
import {
    CreditCard, CheckCircle2, Crown, ArrowRight, CalendarClock,
    Receipt, Loader2, AlertTriangle, CheckCircle, XCircle,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import BillingSummaryCard from "@/components/subscription/BillingSummaryCard";
import UsageCard from "@/components/subscription/UsageCard";
import PaymentHistoryTable from "@/components/billing/PaymentHistoryTable";
import { usePlanFeature } from "@/hooks/usePlanFeature";
import { fetchSubscription } from "@/store/slices/subscriptionSlice";
import { clearPaymentState } from "@/store/slices/paymentSlice";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

export default function BillingPage() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const { plans, userPlan, isLoading } = useAppSelector((s) => s.plans);
    const { isExpired, expiryDate, currentPlan, daysRemaining } = usePlanFeature();
    const paymentStatus = useMemo<string | null>(() => {
        const p = searchParams.get("payment");
        if (p === "success") return "success";
        if (p === "failed") return "failed";
        if (p === "cancelled") return "cancelled";
        return null;
    }, [searchParams]);

    useEffect(() => {
        dispatch(fetchPlans());
        dispatch(fetchSubscription());
        dispatch(clearPaymentState());
    }, [dispatch]);

    const currentPlanData = currentPlan || userPlan;
    const expired = isExpired();
    const planName = currentPlanData?.name || "Free";
    const planPrice = currentPlanData ? formatCurrency(currentPlanData.price ?? 0) : formatCurrency(0);
    const planInterval = currentPlanData ? `${currentPlanData.duration} ${currentPlanData.duration_type}` : "";
    const days = daysRemaining();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
        >
            {/* Payment Status Banner */}
            {paymentStatus === "success" && (
                <motion.div variants={itemVariants} className="rounded-2xl border p-4 flex items-center gap-3"
                    style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.08)" }}>
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Payment Successful!</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Your plan has been upgraded. Welcome to {planName}!</p>
                    </div>
                </motion.div>
            )}
            {paymentStatus === "failed" && (
                <motion.div variants={itemVariants} className="rounded-2xl border p-4 flex items-center gap-3"
                    style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Payment Failed</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Please try again or use a different payment method.</p>
                    </div>
                </motion.div>
            )}
            {paymentStatus === "cancelled" && (
                <motion.div variants={itemVariants} className="rounded-2xl border p-4 flex items-center gap-3"
                    style={{ borderColor: "rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.08)" }}>
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Payment Cancelled</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>No charges were made. You can retry whenever you&apos;re ready.</p>
                    </div>
                </motion.div>
            )}

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
                {expiryDate && (
                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border"
                        style={{ borderColor: expired ? "rgba(239,68,68,0.3)" : "var(--glass-border)", color: expired ? "#ef4444" : "var(--muted-foreground)", background: "var(--glass-bg)" }}>
                        <CalendarClock className="w-3.5 h-3.5" />
                        {expired ? "Expired" : "Expires"}: {expiryDate}
                    </div>
                )}
            </motion.div>

            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6">
                <BillingSummaryCard />
                <UsageCard />
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "View Plans", desc: "Compare & upgrade", href: "/dashboard/billing/plans", icon: Crown, color: "#8b5cf6" },
                    { label: "Payment History", desc: "View receipts", href: "/dashboard/billing/invoices", icon: Receipt, color: "#0ea5e9" },
                    { label: "Usage", desc: "Monitor limits", href: "#usage", icon: CreditCard, color: "#10b981" },
                    { label: "Current Plan", desc: expired ? "Expired — renew now" : `${days !== null ? `${Math.max(0, days)} days left` : "Active"}`, href: "#", icon: CalendarClock, color: expired ? "#ef4444" : "#f59e0b" },
                ].map((item) => (
                    <Link key={item.label} href={item.href} className="group">
                        <div className="rounded-2xl border p-4 transition-all hover:scale-[1.02]"
                            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
                                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{item.label}</p>
                                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{item.desc}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--muted-foreground)" }} />
                            </div>
                        </div>
                    </Link>
                ))}
            </motion.div>

            {/* Current Plan Hero */}
            <motion.div variants={itemVariants}>
                <div className="relative rounded-2xl overflow-hidden border"
                    style={{ background: "var(--glass-bg)", borderColor: expired ? "rgba(239,68,68,0.3)" : "var(--glass-border)" }}>
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
                        style={{ background: "radial-gradient(ellipse at 20% 50%, #8b5cf6 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #6366f1 0%, transparent 60%)" }} />
                    <div className="relative p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            <div className="flex items-center gap-5 flex-1">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                                    expired ? "bg-red-500/20" : "")}
                                    style={expired ? {} : { background: "var(--brand-gradient)", boxShadow: "0 0 24px rgba(139,92,246,0.25)" }}>
                                    <Crown className={cn("w-7 h-7", expired ? "" : "text-white")} style={expired ? { color: "#ef4444" } : {}} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 mb-1">
                                        <h2 className="text-xl font-black" style={{ color: "var(--foreground)" }}>
                                            {currentPlanData ? `${planName} Plan` : "No Plan Active"}
                                        </h2>
                                        {currentPlanData && (
                                            <span className={cn("inline-flex items-center gap-1 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full text-white uppercase",
                                                expired ? "bg-red-500" : "")}
                                                style={expired ? {} : { background: "var(--brand-gradient)" }}>
                                                <CheckCircle2 className="w-2.5 h-2.5" />{expired ? "Expired" : "Active"}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                        {currentPlanData ? `${planPrice} / ${planInterval || "month"}` : "Subscribe to a plan to unlock features"}
                                        {days !== null && !expired && ` · ${Math.max(0, days)} days remaining`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <Link href="/dashboard/billing/plans">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all"
                                        style={{ background: expired ? "#ef4444" : "var(--brand-gradient)" }}
                                    >
                                        {expired ? "Renew Plan" : currentPlanData ? "Change Plan" : "View Plans"}
                                        <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Plans Grid */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Available Plans</h2>
                    <Link href="/dashboard/billing/plans" className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: "var(--nav-active-color)" }}>
                        View all plans <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                    </div>
                ) : plans.length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-2xl" style={{ borderColor: "var(--glass-border)" }}>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No plans available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.slice(0, 3).map((plan, idx) => {
                            const isCurrent = userPlan?.id === plan.id;
                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="relative rounded-2xl border flex flex-col overflow-hidden"
                                    style={isCurrent
                                        ? { borderColor: "#8b5cf6" + "60", background: "var(--glass-bg)", boxShadow: "0 0 40px rgba(139,92,246,0.12)" }
                                        : { borderColor: "var(--glass-border)", background: "var(--glass-bg)" }
                                    }
                                >
                                    {isCurrent && (
                                        <div className="absolute top-0 left-0 right-0 h-0.5"
                                            style={{ background: "linear-gradient(90deg, transparent, #8b5cf6, transparent)" }} />
                                    )}

                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)" }}>
                                                <Crown className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-1 mb-5">
                                            <span className="text-4xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>
                                                {formatCurrency(plan.price)}
                                            </span>
                                            <span className="mb-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
                                                / {plan.duration} {plan.duration_type}
                                            </span>
                                        </div>

                                        <Link
                                            href={isCurrent ? "#" : `/dashboard/billing/plans`}
                                            className="w-full mt-auto"
                                        >
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
                                                    : { background: "rgba(139,92,246,0.12)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.3)" }
                                                }
                                            >
                                                {isCurrent ? "Current Plan" : "Upgrade"}
                                                {!isCurrent && <ArrowRight className="w-4 h-4" />}
                                            </motion.button>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Payment History */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Payment History</h2>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            Recent transactions and receipts
                        </p>
                    </div>
                    <Link href="/dashboard/billing/invoices" className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg border transition-colors hover:opacity-80"
                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", borderColor: "var(--glass-border)" }}>
                        <Receipt className="w-3.5 h-3.5" /> View All
                    </Link>
                </div>
                <PaymentHistoryTable />
            </motion.div>
        </motion.div>
    );
}
