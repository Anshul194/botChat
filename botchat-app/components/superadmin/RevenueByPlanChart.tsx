"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStats } from "@/store/slices/superadminSubscriptionSlice";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#ef4444", "#06b6d4", "#f97316"];

function formatCurrency(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}

export default function RevenueByPlanChart() {
    const dispatch = useAppDispatch();
    const { stats, statsLoading } = useAppSelector((s) => s.superadminSubscription);

    useEffect(() => {
        if (!stats) dispatch(fetchSubscriptionStats());
    }, [dispatch, stats]);

    const data = (stats?.revenue_by_plan ?? []).map((item) => ({
        name: item.plan_name,
        value: item.total_revenue,
        orders: item.order_count,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        >
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--foreground)" }}>Revenue by Plan</h3>

            {statsLoading || !stats ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--brand-gradient)", borderTopColor: "transparent" }} />
                </div>
            ) : data.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No plan revenue data
                </div>
            ) : (
                <>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid var(--glass-border)", background: "var(--card-bg)", fontSize: 12 }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={((value: number) => [formatCurrency(value), "Revenue"]) as any}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value: string) => <span style={{ color: "var(--foreground)", fontSize: 12 }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {data.map((item, i) => {
                            const pct = stats.total_revenue > 0 ? (item.value / stats.total_revenue) * 100 : 0;
                            return (
                                <div key={item.name} className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs flex-1 truncate" style={{ color: "var(--foreground)" }}>{item.name}</span>
                                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{formatCurrency(item.value)}</span>
                                    <span className="text-[10px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{pct.toFixed(1)}%</span>
                                    <span className="text-[10px] tabular-nums" style={{ color: "var(--muted-foreground)" }}>{item.orders} orders</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </motion.div>
    );
}
