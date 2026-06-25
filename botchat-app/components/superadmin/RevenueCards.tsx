"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, Users, AlertTriangle, TrendingUp, Crown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStats } from "@/store/slices/superadminSubscriptionSlice";

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

function formatCurrency(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}

export default function RevenueCards() {
    const dispatch = useAppDispatch();
    const { stats, statsLoading } = useAppSelector((s) => s.superadminSubscription);

    useEffect(() => {
        dispatch(fetchSubscriptionStats());
    }, [dispatch]);

    if (statsLoading || !stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="rounded-2xl border p-5 animate-pulse" style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}>
                        <div className="h-4 w-20 rounded mb-3" style={{ background: "var(--glass-border)" }} />
                        <div className="h-8 w-28 rounded" style={{ background: "var(--glass-border)" }} />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        { label: "MRR", value: formatCurrency(stats.mrr), icon: TrendingUp, color: "#8b5cf6", desc: "Monthly Recurring Revenue" },
        { label: "ARR", value: formatCurrency(stats.arr), icon: DollarSign, color: "#0ea5e9", desc: "Annual Recurring Revenue" },
        { label: "Active Tenants", value: stats.active_tenants.toString(), icon: Users, color: "#10b981", desc: `${stats.total_tenants} total` },
        { label: "Expired Tenants", value: stats.expired_tenants.toString(), icon: AlertTriangle, color: "#f59e0b", desc: `${stats.suspended_tenants} suspended` },
        { label: "Total Revenue", value: formatCurrency(stats.total_revenue), icon: Crown, color: "#ec4899", desc: `${formatCurrency(stats.recent_revenue)} last 30d` },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-2xl border p-5"
                        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}18` }}>
                                <card.icon className="w-4 h-4" style={{ color: card.color }} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>{card.label}</span>
                        </div>
                        <p className="text-2xl font-black tabular-nums" style={{ color: "var(--foreground)" }}>{card.value}</p>
                        <p className="text-[11px] mt-1" style={{ color: "var(--muted-foreground)" }}>{card.desc}</p>
                    </motion.div>
                ))}
            </div>

            {stats.revenue_by_plan.length > 0 && (
                <motion.div variants={itemVariants} className="rounded-2xl border p-6"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Revenue by Plan</h3>
                    <div className="space-y-3">
                        {stats.revenue_by_plan.map((item) => {
                            const pct = stats.total_revenue > 0 ? (item.total_revenue / stats.total_revenue) * 100 : 0;
                            return (
                                <div key={item.plan_name}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="font-semibold" style={{ color: "var(--foreground)" }}>{item.plan_name}</span>
                                        <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{formatCurrency(item.total_revenue)}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--glass-border)" }}>
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--brand-gradient)" }} />
                                    </div>
                                    <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{item.order_count} orders</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
