"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchExpiringSoon } from "@/store/slices/superadminSubscriptionSlice";
import Link from "next/link";

export default function ExpiringSoonAlert() {
    const dispatch = useAppDispatch();
    const { expiringSoon, expiringLoading } = useAppSelector((s) => s.superadminSubscription);
    const [days, setDays] = useState(30);

    useEffect(() => {
        dispatch(fetchExpiringSoon({ days }));
    }, [dispatch, days]);

    const critical = expiringSoon.filter((t) => t.urgency === "critical");
    const warning = expiringSoon.filter((t) => t.urgency === "warning");

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border p-6"
            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#f59e0b18" }}>
                        <Clock className="w-4 h-4" style={{ color: "#f59e0b" }} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Expiring Soon</h3>
                        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{expiringSoon.length} tenants</p>
                    </div>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="px-2 py-1 text-xs rounded-lg border"
                    style={{ borderColor: "var(--glass-border)", background: "var(--card-bg)", color: "var(--foreground)" }}
                >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                </select>
            </div>

            {expiringLoading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--glass-border)" }} />
                    ))}
                </div>
            ) : expiringSoon.length === 0 ? (
                <p className="text-xs py-6 text-center" style={{ color: "var(--muted-foreground)" }}>
                    No tenants expiring in the next {days} days
                </p>
            ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                    {critical.length > 0 && (
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#ef4444" }}>
                            Critical ({critical.length})
                        </p>
                    )}
                    {critical.map((tenant) => (
                        <TenantRow key={tenant.id} tenant={tenant} />
                    ))}

                    {warning.length > 0 && (
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: "#f59e0b" }}>
                            Warning ({warning.length})
                        </p>
                    )}
                    {warning.map((tenant) => (
                        <TenantRow key={tenant.id} tenant={tenant} />
                    ))}

                    {expiringSoon.filter((t) => t.urgency === "normal").length > 0 && (
                        <p className="text-[10px] font-bold uppercase tracking-wider mt-2" style={{ color: "var(--muted-foreground)" }}>
                            Upcoming ({expiringSoon.filter((t) => t.urgency === "normal").length})
                        </p>
                    )}
                    {expiringSoon.filter((t) => t.urgency === "normal").map((tenant) => (
                        <TenantRow key={tenant.id} tenant={tenant} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function TenantRow({ tenant }: { tenant: { id: number; name: string; email: string; plan_expired_date: string; days_remaining: number; urgency: string } }) {
    const borderColor = tenant.urgency === "critical" ? "#ef4444" : tenant.urgency === "warning" ? "#f59e0b" : "var(--glass-border)";
    return (
        <Link
            href={`/dashboard/superadmin/subscriptions/${tenant.id}`}
            className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:opacity-80"
            style={{ borderColor, background: "var(--card-bg)" }}
        >
            <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{tenant.name}</p>
                <p className="text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>{tenant.email}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold tabular-nums" style={{ color: tenant.urgency === "critical" ? "#ef4444" : "#f59e0b" }}>
                    {tenant.days_remaining}d
                </span>
                <ChevronRight className="w-3 h-3" style={{ color: "var(--muted-foreground)" }} />
            </div>
        </Link>
    );
}
