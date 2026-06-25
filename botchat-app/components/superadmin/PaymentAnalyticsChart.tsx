"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPaymentAnalytics } from "@/store/slices/superadminSubscriptionSlice";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

function formatCurrency(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}

export default function PaymentAnalyticsChart() {
    const dispatch = useAppDispatch();
    const { paymentAnalytics, paymentLoading } = useAppSelector((s) => s.superadminSubscription);
    const [days, setDays] = useState(90);

    useEffect(() => {
        dispatch(fetchPaymentAnalytics({ days }));
    }, [dispatch, days]);

    const trendData = paymentAnalytics?.monthly_trend ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Payment Analytics</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Success vs failure rates</p>
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
                </select>
            </div>

            {paymentLoading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2" style={{ borderColor: "var(--brand-gradient)", borderTopColor: "transparent" }} />
                </div>
            ) : !paymentAnalytics ? (
                <div className="h-64 flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
                    No payment data available
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                        {[
                            { label: "Total Orders", value: paymentAnalytics.summary.total_orders.toString(), color: "#8b5cf6" },
                            { label: "Successful", value: paymentAnalytics.summary.successful_orders.toString(), color: "#10b981" },
                            { label: "Failed", value: paymentAnalytics.summary.failed_orders.toString(), color: "#ef4444" },
                            { label: "Success Rate", value: `${paymentAnalytics.summary.success_rate}%`, color: "#0ea5e9" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: `${item.color}10` }}>
                                <p className="text-lg font-black tabular-nums" style={{ color: item.color }}>{item.value}</p>
                                <p className="text-[10px] font-semibold uppercase" style={{ color: "var(--muted-foreground)" }}>{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Monthly success rate chart */}
                    {trendData.length > 0 && (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 12, border: "1px solid var(--glass-border)", background: "var(--card-bg)", fontSize: 12 }}
                                    />
                                    <Legend iconType="circle" iconSize={8} />
                                    <Bar dataKey="success_count" name="Successful" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="failure_count" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Gateway breakdown */}
                    {paymentAnalytics.by_gateway.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-xs font-bold mb-3" style={{ color: "var(--foreground)" }}>By Payment Gateway</h4>
                            <div className="space-y-2">
                                {paymentAnalytics.by_gateway.map((gw) => (
                                    <div key={gw.payment_type ?? "unknown"} className="flex items-center justify-between text-xs">
                                        <span style={{ color: "var(--foreground)" }}>{gw.payment_type ?? "Unknown"}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{gw.count} orders</span>
                                            <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{formatCurrency(gw.total_amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coupon usage */}
                    {paymentAnalytics.coupon_usage.length > 0 && (
                        <div className="mt-6">
                            <h4 className="text-xs font-bold mb-3" style={{ color: "var(--foreground)" }}>Top Coupons</h4>
                            <div className="space-y-2">
                                {paymentAnalytics.coupon_usage.map((c) => (
                                    <div key={c.coupon_code} className="flex items-center justify-between text-xs">
                                        <span className="font-mono font-semibold" style={{ color: "#8b5cf6" }}>{c.coupon_code}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="tabular-nums" style={{ color: "var(--muted-foreground)" }}>{c.usage_count} uses</span>
                                            <span className="tabular-nums" style={{ color: "#10b981" }}>-{formatCurrency(c.total_discount)}</span>
                                            <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{formatCurrency(c.total_amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}
