"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X, ArrowUpRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNotifications, fetchUnreadCount, markAllNotificationsRead } from "@/store/slices/notificationSlice";
import NotificationItem from "./NotificationItem";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

export default function NotificationBell() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { theme } = useTheme();
    const isLight = theme === "light";
    const { notifications, unreadCount } = useAppSelector((s) => s.notification);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchUnreadCount());
        const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000);
        return () => clearInterval(interval);
    }, [dispatch]);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    useEffect(() => {
        if (open && notifications.length === 0) {
            dispatch(fetchNotifications({ per_page: 8 }));
        }
    }, [open, notifications.length, dispatch]);

    const handleMarkAllRead = () => {
        dispatch(markAllNotificationsRead());
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-110"
                style={{
                    color: open ? "var(--foreground)" : "var(--muted-foreground)",
                    background: open ? "var(--topbar-item-hover)" : "transparent",
                }}
            >
                <Bell className="w-[16px] h-[16px]" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                        style={{ background: "#ef4444" }}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{ background: isLight ? "rgba(255,255,255,0.98)" : "rgba(12,16,28,0.98)", border: `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.07)"}`, backdropFilter: "blur(20px)" }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}` }}>
                        <div className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5" style={{ color: "#6C5CE7" }} />
                            <span className="text-[13px] font-black" style={{ color: "var(--foreground)" }}>Notifications</span>
                            {unreadCount > 0 && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                    style={{ background: "rgba(108,92,231,0.14)", color: "#6C5CE7" }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
                                    style={{ color: "#6C5CE7" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(108,92,231,0.08)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    Mark all read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)}
                                className="p-1 rounded-lg transition-colors"
                                style={{ color: "var(--muted-foreground)" }}>
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications list */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
                                No notifications yet
                            </div>
                        ) : (
                            notifications.slice(0, 8).map((n, i) => (
                                <div key={n.id}
                                    style={{ borderBottom: i < Math.min(notifications.length, 8) - 1 ? `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"}` : "none" }}>
                                    <NotificationItem notification={n} />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3" style={{ borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}` }}>
                        <button
                            onClick={() => { setOpen(false); router.push("/dashboard/notifications"); }}
                            className="w-full text-[11px] font-bold flex items-center justify-center gap-1 py-2 rounded-xl transition-colors"
                            style={{ color: "#6C5CE7" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(108,92,231,0.08)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            View all notifications <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
