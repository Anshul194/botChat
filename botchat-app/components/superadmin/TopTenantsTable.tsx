"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTopTenants } from "@/store/slices/superadminSubscriptionSlice";
import Link from "next/link";

function formatCurrency(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}

function statusColor(status: string) {
    switch (status) {
        case "active": return "#10b981";
        case "expired": return "#f59e0b";
        case "suspended": return "#ef4444";
        default: return "var(--muted-foreground)";
    }
}

export default function TopTenantsTable() {
    const dispatch = useAppDispatch();
    const { topTenants, topTenantsLoading } = useAppSelector((s) => s.superadminSubscription);

    useEffect(() => {
        dispatch(fetchTopTenants({ limit: 10 }));
    }, [dispatch]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#f59e0b18" }}>
                    <Trophy className="w-4 h-4" style={{ color: "#f59e0b" }} />
                </div>
                <div>
                    <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Top Tenants by Revenue</h3>
                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Highest paying tenants</p>
                </div>
            </div>

            {topTenantsLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "var(--glass-border)" }} />
                    ))}
                </div>
            ) : topTenants.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--muted-foreground)" }}>No revenue data yet</p>
            ) : (
                <div className="space-y-2">
                    {topTenants.map((tenant, i) => (
                        <Link
                            key={tenant.id}
                            href={`/dashboard/superadmin/subscriptions/${tenant.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl border transition-colors hover:opacity-80"
                            style={{ borderColor: "var(--glass-border)", background: "var(--card-bg)" }}
                        >
                            <span className="text-xs font-black w-6 text-center tabular-nums" style={{ color: i < 3 ? "#f59e0b" : "var(--muted-foreground)" }}>
                                #{i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{tenant.name}</p>
                                    {i === 0 && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: "#f59e0b" }} />}
                                </div>
                                <p className="text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>
                                    {tenant.plan_name ?? "Free"} &middot; {tenant.order_count} orders
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{formatCurrency(tenant.total_revenue)}</p>
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: `${statusColor(tenant.status)}18`, color: statusColor(tenant.status) }}>
                                    {tenant.status}
                                </span>
                            </div>
                            <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
                        </Link>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
