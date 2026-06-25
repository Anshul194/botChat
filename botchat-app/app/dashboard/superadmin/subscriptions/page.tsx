"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, Crown, ChevronRight, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptions } from "@/store/slices/superadminSubscriptionSlice";
import RevenueCards from "@/components/superadmin/RevenueCards";

const STATUS_TABS = [
    { key: "", label: "All" },
    { key: "active", label: "Active", color: "#10b981" },
    { key: "expired", label: "Expired", color: "#f59e0b" },
    { key: "suspended", label: "Suspended", color: "#ef4444" },
    { key: "free", label: "Free", color: "#94a3b8" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    active: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    expired: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
    suspended: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    free: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" },
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

export default function SubscriptionsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { tenants, loading, lastPage } = useAppSelector((s) => s.superadminSubscription);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        dispatch(fetchSubscriptions({ page, search, status: statusFilter, per_page: 15 }));
    }, [dispatch, page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = () => {
        setPage(1);
        dispatch(fetchSubscriptions({ page: 1, search, status: statusFilter, per_page: 15 }));
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--nav-active-color)" }}>
                        SuperAdmin
                    </p>
                    <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                        Subscription Management
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        Manage tenant subscriptions, billing, and revenue
                    </p>
                </div>
            </motion.div>

            {/* Revenue Cards */}
            <motion.div variants={itemVariants}>
                <RevenueCards />
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search tenants by name or email…"
                        className="w-full h-11 pl-10 pr-4 rounded-xl text-sm border outline-none"
                        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                            style={{
                                background: statusFilter === tab.key ? (tab.color || "var(--brand-gradient)") : "var(--glass-bg)",
                                color: statusFilter === tab.key ? "white" : "var(--muted-foreground)",
                                border: `1px solid ${statusFilter === tab.key ? "transparent" : "var(--glass-border)"}`,
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Table */}
            <motion.div variants={itemVariants} className="rounded-2xl border overflow-hidden"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                    </div>
                ) : tenants.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="mx-auto h-10 w-10 mb-3" style={{ color: "var(--muted-foreground)" }} />
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No tenants found.</p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold uppercase tracking-widest"
                            style={{ color: "var(--muted-foreground)", background: "var(--glass-bg)" }}>
                            <div className="col-span-3">Tenant</div>
                            <div className="col-span-2">Plan</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2">Expiry</div>
                            <div className="col-span-1">Price</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Rows */}
                        {tenants.map((t) => {
                            const style = STATUS_STYLE[t.subscription_status] ?? STATUS_STYLE.free;
                            return (
                                <div key={t.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:opacity-90 cursor-pointer"
                                    onClick={() => router.push(`/dashboard/superadmin/subscriptions/${t.id}`)}
                                >
                                    <div className="col-span-3 min-w-0">
                                        <p className="text-sm font-bold truncate" style={{ color: "var(--foreground)" }}>{t.name}</p>
                                        <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>{t.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        {t.plan ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
                                                style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                                                <Crown className="w-3 h-3" /> {t.plan.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                            style={{ background: style.bg, color: style.color }}>
                                            {t.subscription_status}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-xs font-medium tabular-nums" style={{ color: "var(--foreground)" }}>
                                            {t.plan_expired_date ?? "—"}
                                        </span>
                                    </div>
                                    <div className="col-span-1">
                                        <span className="text-sm font-bold tabular-nums" style={{ color: "var(--foreground)" }}>
                                            {t.plan ? `$${t.plan.price}` : "—"}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <ChevronRight className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t" style={{ borderColor: "var(--glass-border)" }}>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-40"
                            style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
                        >
                            Previous
                        </button>
                        <span className="text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>
                            Page {page} of {lastPage}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                            disabled={page >= lastPage}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-40"
                            style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
