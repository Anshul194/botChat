"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Filter, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNotifications, markAllNotificationsRead, fetchNotificationPreferences, updateNotificationPreferences } from "@/store/slices/notificationSlice";
import NotificationItem from "@/components/notifications/NotificationItem";

const FILTER_TABS = [
    { key: "", label: "All" },
    { key: "subscription", label: "Subscription" },
    { key: "payment", label: "Payment" },
    { key: "billing", label: "Billing" },
];

const TYPE_TO_FILTER: Record<string, string> = {
    plan_expiring: "subscription",
    plan_expired: "subscription",
    payment_successful: "payment",
    payment_failed: "payment",
    coupon_applied: "billing",
    new_subscription: "billing",
    tenant_expired: "subscription",
    failed_payment_alert: "payment",
    tenant_suspended: "subscription",
};

export default function NotificationsPage() {
    const dispatch = useAppDispatch();
    const { notifications, loading, unreadCount, preferences } = useAppSelector((s) => s.notification);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        dispatch(fetchNotifications({ per_page: 50 }));
        dispatch(fetchNotificationPreferences());
    }, [dispatch]);

    const filtered = filter
        ? notifications.filter((n) => {
            const nFilter = TYPE_TO_FILTER[n.data?.type ?? n.type] ?? "";
            return nFilter === filter;
        })
        : notifications;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black" style={{ color: "var(--foreground)" }}>Notifications</h1>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={() => dispatch(markAllNotificationsRead())}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Preferences */}
            {preferences && (
                <div className="rounded-2xl border p-4"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <h3 className="text-xs font-bold mb-3" style={{ color: "var(--foreground)" }}>Notification Preferences</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {([
                            { key: "email_notifications" as const, label: "Email Notifications" },
                            { key: "billing_notifications" as const, label: "Billing" },
                            { key: "renewal_reminders" as const, label: "Renewal Reminders" },
                            { key: "payment_alerts" as const, label: "Payment Alerts" },
                        ]).map((pref) => (
                            <button
                                key={pref.key}
                                onClick={() => dispatch(updateNotificationPreferences({ [pref.key]: !preferences[pref.key] }))}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                                style={{
                                    background: preferences[pref.key] ? "rgba(16,185,129,0.1)" : "var(--card-bg)",
                                    color: preferences[pref.key] ? "#10b981" : "var(--muted-foreground)",
                                    border: `1px solid ${preferences[pref.key] ? "rgba(16,185,129,0.3)" : "var(--glass-border)"}`,
                                }}
                            >
                                <span className="w-2 h-2 rounded-full" style={{ background: preferences[pref.key] ? "#10b981" : "var(--muted-foreground)" }} />
                                {pref.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        style={{
                            background: filter === tab.key ? "var(--brand-gradient)" : "var(--glass-bg)",
                            color: filter === tab.key ? "#fff" : "var(--muted-foreground)",
                            border: `1px solid ${filter === tab.key ? "transparent" : "var(--glass-border)"}`,
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notifications list */}
            <div className="rounded-2xl border overflow-hidden"
                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                {loading ? (
                    <div className="space-y-0">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse"
                                style={{ borderBottom: i < 4 ? "1px solid var(--glass-border)" : "none" }}>
                                <div className="w-8 h-8 rounded-xl" style={{ background: "var(--glass-border)" }} />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 rounded" style={{ background: "var(--glass-border)" }} />
                                    <div className="h-2.5 w-48 rounded" style={{ background: "var(--glass-border)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-12 text-center">
                        <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--muted-foreground)", opacity: 0.4 }} />
                        <p className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>
                            {filter ? "No notifications in this category" : "No notifications yet"}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filtered.map((n, i) => (
                            <div key={n.id}
                                style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--glass-border)" : "none" }}>
                                <NotificationItem notification={n} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
