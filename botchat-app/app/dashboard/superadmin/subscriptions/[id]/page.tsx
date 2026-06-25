"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeft, Crown, Calendar, Loader2,
    CreditCard, RotateCcw, Ban, Play,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTenantDetail, clearDetail } from "@/store/slices/superadminSubscriptionSlice";
import { formatCurrency } from "@/lib/formatCurrency";
import ManualPlanDialog from "@/components/superadmin/ManualPlanDialog";
import ExtendExpiryDialog from "@/components/superadmin/ExtendExpiryDialog";
import SuspendDialog from "@/components/superadmin/SuspendDialog";
import ResetUsageDialog from "@/components/superadmin/ResetUsageDialog";
import SubscriptionTimeline from "@/components/superadmin/SubscriptionTimeline";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    active: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    expired: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
    suspended: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    free: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" },
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

export default function TenantSubscriptionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const dispatch = useAppDispatch();
    const { detail, detailLoading } = useAppSelector((s) => s.superadminSubscription);

    const [showAssign, setShowAssign] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [showSuspend, setShowSuspend] = useState(false);
    const [showReset, setShowReset] = useState(false);

    useEffect(() => {
        if (id) dispatch(fetchTenantDetail(id));
        return () => { dispatch(clearDetail()); };
    }, [id, dispatch]);

    useEffect(() => {
        if ((showAssign || showExtend || showSuspend || showReset) === false && id) {
            dispatch(fetchTenantDetail(id));
        }
    }, [showAssign, showExtend, showSuspend, showReset, id, dispatch]);

    if (detailLoading || !detail) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
            </div>
        );
    }

    const { user, plan, expiry, status, days_remaining, usage, payments, timeline } = detail;
    const style = STATUS_STYLE[status] ?? STATUS_STYLE.free;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center gap-4">
                <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center border"
                    style={{ borderColor: "var(--glass-border)" }}>
                    <ArrowLeft className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{user.name}</h1>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                    style={{ background: style.bg, color: style.color }}>
                    {status}
                </span>
            </motion.div>

            {/* Plan & Expiry Card */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: "var(--brand-gradient)", boxShadow: "0 0 24px rgba(139,92,246,0.25)" }}>
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black" style={{ color: "var(--foreground)" }}>
                                {plan ? `${plan.name} Plan` : "No Plan"}
                            </h2>
                            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                                {plan ? `${formatCurrency(plan.price)} / ${plan.duration} ${plan.duration_type}` : "Free tier"}
                                {days_remaining !== null && ` · ${days_remaining} days remaining`}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setShowAssign(true)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                            style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                            <CreditCard className="w-3.5 h-3.5" /> Assign Plan
                        </button>
                        <button onClick={() => setShowExtend(true)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                            style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}>
                            <Calendar className="w-3.5 h-3.5" /> Extend
                        </button>
                        <button onClick={() => setShowReset(true)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                            style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Usage
                        </button>
                        <button onClick={() => setShowSuspend(true)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold"
                            style={{ background: user.is_suspended ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: user.is_suspended ? "#10b981" : "#ef4444" }}>
                            {user.is_suspended ? <Play className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            {user.is_suspended ? "Resume" : "Suspend"}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Usage */}
            {usage.length > 0 && (
                <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Feature Usage</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {usage.map((u) => {
                            const limit = plan?.features?.[u.feature_key] ? Number(plan.features[u.feature_key]) : null;
                            const pct = limit && limit > 0 ? Math.min(100, (u.used_count / limit) * 100) : 0;
                            return (
                                <div key={u.feature_key} className="rounded-xl border p-3" style={{ borderColor: "var(--glass-border)" }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{u.feature_key}</span>
                                        <span className="text-xs font-bold tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                                            {u.used_count}{limit !== null ? ` / ${limit}` : ""}
                                        </span>
                                    </div>
                                    {limit !== null && (
                                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--glass-border)" }}>
                                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--brand-gradient)" }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Payment History */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Payment History</h3>
                {payments.length === 0 ? (
                    <p className="text-sm py-4 text-center" style={{ color: "var(--muted-foreground)" }}>No payments yet.</p>
                ) : (
                    <div className="space-y-2">
                        {payments.map((p) => {
                            const pStyle = p.status === "success" ? STATUS_STYLE.active : STATUS_STYLE.expired;
                            return (
                                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border"
                                    style={{ borderColor: "var(--glass-border)" }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: pStyle.bg }}>
                                        <CreditCard className="w-4 h-4" style={{ color: pStyle.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                            {p.payment_id || `#${p.id}`}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                            {p.payment_type} {p.coupon_code ? `· coupon: ${p.coupon_code}` : ""}
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded-full capitalize"
                                        style={{ background: pStyle.bg, color: pStyle.color }}>
                                        {p.status}
                                    </span>
                                    <span className="text-sm font-black tabular-nums" style={{ color: "var(--foreground)" }}>
                                        {formatCurrency(p.amount)}
                                    </span>
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                        {new Date(p.created_at).toLocaleDateString("en-IN")}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            {/* Timeline */}
            <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Subscription Timeline</h3>
                <SubscriptionTimeline events={timeline} />
            </motion.div>

            {/* Dialogs */}
            <ManualPlanDialog open={showAssign} onClose={() => setShowAssign(false)} userId={id} userName={user.name} />
            <ExtendExpiryDialog open={showExtend} onClose={() => setShowExtend(false)} userId={id} userName={user.name} currentExpiry={expiry} />
            <SuspendDialog open={showSuspend} onClose={() => setShowSuspend(false)} userId={id} userName={user.name} isSuspended={user.is_suspended} />
            <ResetUsageDialog open={showReset} onClose={() => setShowReset(false)} userId={id} userName={user.name} />
        </motion.div>
    );
}
