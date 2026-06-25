"use client";

import { CheckCircle2, AlertTriangle, Crown, Ban, Bell, DollarSign, Tag } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { markNotificationRead, type Notification } from "@/store/slices/notificationSlice";
import { useRouter } from "next/navigation";

const TYPE_MAP: Record<string, { icon: typeof CheckCircle2; color: string }> = {
    plan_expiring: { icon: AlertTriangle, color: "#f59e0b" },
    plan_expired: { icon: AlertTriangle, color: "#ef4444" },
    payment_successful: { icon: CheckCircle2, color: "#10b981" },
    payment_failed: { icon: AlertTriangle, color: "#ef4444" },
    coupon_applied: { icon: Tag, color: "#8b5cf6" },
    new_subscription: { icon: Crown, color: "#0ea5e9" },
    tenant_expired: { icon: AlertTriangle, color: "#f59e0b" },
    failed_payment_alert: { icon: DollarSign, color: "#ef4444" },
    tenant_suspended: { icon: Ban, color: "#ef4444" },
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function NotificationItem({ notification }: { notification: Notification }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const typeKey = notification.data?.type ?? notification.type;
    const config = TYPE_MAP[typeKey] ?? { icon: Bell, color: "#6C5CE7" };
    const Icon = config.icon;
    const isUnread = !notification.read_at;

    const handleClick = async () => {
        if (isUnread) {
            dispatch(markNotificationRead(notification.id));
        }
        if (notification.data?.action_url) {
            router.push(notification.data.action_url);
        }
    };

    return (
        <button
            onClick={handleClick}
            className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
            style={{
                background: isUnread ? "rgba(108,92,231,0.04)" : "transparent",
            }}
        >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${config.color}15` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-[12px] font-bold truncate" style={{ color: "var(--foreground)" }}>
                        {notification.data?.title ?? "Notification"}
                    </p>
                    {isUnread && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#6C5CE7" }} />}
                </div>
                <p className="text-[11px] mt-0.5 leading-snug line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                    {notification.data?.message ?? ""}
                </p>
                {notification.data?.action_label && (
                    <span className="text-[10px] font-semibold mt-1 inline-block" style={{ color: "#6C5CE7" }}>
                        {notification.data.action_label} →
                    </span>
                )}
            </div>
            <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                {timeAgo(notification.created_at)}
            </span>
        </button>
    );
}
