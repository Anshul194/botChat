"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchRevenueTrends } from "@/store/slices/superadminSubscriptionSlice";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";

export default function RevenueOverviewChart() {
    const dispatch = useAppDispatch();
    const { revenueTrends, revenueTrendsPeriod, revenueLoading } = useAppSelector((s) => s.superadminSubscription);
    const [period, setPeriod] = useState<"daily" | "monthly">("daily");
    const [days, setDays] = useState(90);

    useEffect(() => {
        dispatch(fetchRevenueTrends({ period, days }));
    }, [dispatch, period, days]);

    const chartData = revenueTrends.map((d) => ({
        ...d,
        label: d.period,
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Revenue Overview</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Revenue trend over time</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--glass-border)" }}>
                        {(["daily", "monthly"] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className="px-3 py-1 text-xs font-semibold capitalize transition-colors"
                                style={{
                                    background: period === p ? "var(--brand-gradient)" : "transparent",
                                    color: period === p ? "#fff" : "var(--muted-foreground)",
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-2 py-1 text-xs rounded-lg border"
                        style={{ borderColor: "var(--glass-border)", background: "var(--card-bg)", color: "var(--foreground)" }}
                    >
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={180}>6 months</option>
                        <option value={365}>1 year</option>
                    </select>
                </div>
            </div>

            {revenueLoading ? (
                <div className="h-72 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--brand-gradient)", borderTopColor: "transparent" }} />
                </div>
            ) : chartData.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No revenue data available
                </div>
            ) : (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip
                                contentStyle={{ borderRadius: 12, border: "1px solid var(--glass-border)", background: "var(--card-bg)", fontSize: 12 }}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={((value: number) => [formatCurrency(value), "Revenue"]) as any}
                                labelStyle={{ color: "var(--foreground)" }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revenueGrad)" name="revenue" />
                            <Area type="monotone" dataKey="cumulative_revenue" stroke="#10b981" strokeWidth={1.5} fill="none" strokeDasharray="5 5" name="cumulative" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {revenueTrendsPeriod !== period && (
                <p className="text-[10px] mt-2 text-center" style={{ color: "var(--muted-foreground)" }}>
                    Showing {revenueTrendsPeriod} data
                </p>
            )}
        </motion.div>
    );
}
