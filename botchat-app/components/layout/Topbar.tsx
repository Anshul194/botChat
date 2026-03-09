"use client";

import { useState, useEffect, useRef } from "react";
import {
    Bell, Search, ChevronDown, Sparkles, Zap, X,
    MessageSquare, TrendingUp, AlertTriangle, CheckCircle2,
    ArrowUpRight, Settings, PanelLeftClose, PanelLeftOpen, Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, fetchMe } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

interface TopbarProps {
    onMenuToggle: () => void;
    collapsed: boolean;
    onToggleSidebar: () => void;
    mobileSidebarOpen?: boolean;
}

const NOTIFS = [
    { id: 1, icon: CheckCircle2, color: "#10b981", title: "Flow completed", desc: "Story Reply → DM — 1,284 done", time: "2m" },
    { id: 2, icon: TrendingUp, color: "#6C5CE7", title: "Lead spike +31%", desc: "3,847 new leads captured today", time: "15m" },
    { id: 3, icon: MessageSquare, color: "#ec4899", title: "2 unread DMs", desc: "Sarah J. and Mike C. need attention", time: "22m" },
    { id: 4, icon: AlertTriangle, color: "#f59e0b", title: "API rate limit", desc: "Facebook API at 80% of hourly quota", time: "1h" },
];

const PAGE_MAP: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/inbox": "Smart Inbox",
    "/dashboard/automations": "Automations",
    "/dashboard/flows": "Flow Builder",
    "/dashboard/instagram": "Instagram",
    "/dashboard/facebook": "Facebook",
    "/dashboard/analytics": "Analytics",
    "/dashboard/contacts": "Contacts",
    "/dashboard/campaigns": "Campaigns",
    "/dashboard/settings": "Settings",
    "/dashboard/billing": "Billing",
};

export default function Topbar({ onMenuToggle, collapsed, onToggleSidebar, mobileSidebarOpen }: TopbarProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const pathname = usePathname();
    const isLight = theme === "light";
    const [notifOpen, setNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [mounted, setMounted] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const page = PAGE_MAP[pathname] ?? "Dashboard";

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push("/auth/sign-in");
    };

    useEffect(() => {
        const t = setInterval(() => setPulse(p => !p), 1800);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const pill = (
        active: boolean,
        light: boolean
    ) => ({
        background: active
            ? (light ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.1)")
            : "transparent",
    });

    return (
        <header
            className="h-[60px] flex items-center px-4 gap-3 flex-shrink-0 relative"
            style={{
                background: isLight ? "rgba(255,255,255,0.94)" : "rgba(9,11,20,0.95)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.06)"}`,
            }}
        >
            {/* Top gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
                style={{ background: "linear-gradient(90deg,rgba(108,92,231,0.7),rgba(236,72,153,0.45),transparent 65%)" }} />

            {/* ── Mobile hamburger (only on small screens) ── */}
            <button
                onClick={onMenuToggle}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                    background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)",
                    border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)"}`,
                    color: "var(--muted-foreground)",
                }}
                title="Toggle menu"
            >
                {mobileSidebarOpen
                    ? <X className="w-[15px] h-[15px]" />
                    : <Menu className="w-[15px] h-[15px]" />}
            </button>

            {/* ── Sidebar toggle (desktop only) ── */}
            <button
                onClick={onToggleSidebar}
                className="hidden md:flex w-9 h-9 items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                    background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)",
                    border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.09)"}`,
                    color: "var(--muted-foreground)",
                }}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed
                    ? <PanelLeftOpen className="w-[15px] h-[15px]" />
                    : <PanelLeftClose className="w-[15px] h-[15px]" />}
            </button>

            {/* Separator */}
            <div className="w-px h-5 flex-shrink-0"
                style={{ background: isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)" }} />

            {/* ── Breadcrumb — page name visible on mobile too ── */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="hidden sm:inline text-[11px] font-semibold" style={{ color: "var(--muted-foreground)" }}>BotChat</span>
                <span className="hidden sm:inline" style={{ color: "var(--muted-foreground)", opacity: 0.35, fontSize: 13 }}>/</span>
                <span className="text-[13px] font-black tracking-tight" style={{ color: "var(--foreground)" }}>{page}</span>
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-px h-5 flex-shrink-0"
                style={{ background: isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)" }} />

            {/* ── Search pill — hidden on mobile, shown on sm+ ── */}
            <div className="hidden sm:flex flex-1 max-w-[460px]">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full cursor-pointer group transition-all duration-200"
                    style={{
                        background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}`,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "rgba(108,92,231,0.45)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.08)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <Search className="w-3.5 h-3.5 flex-shrink-0 group-hover:text-[#6C5CE7] transition-colors"
                        style={{ color: "var(--muted-foreground)" }} />
                    <span className="flex-1 text-[13px] select-none" style={{ color: "var(--muted-foreground)" }}>
                        Search anything…
                    </span>
                    <div className="hidden sm:flex items-center gap-0.5">
                        <kbd className="flex items-center justify-center w-[18px] h-[18px] rounded-md text-[9px] font-bold font-mono"
                            style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.09)", color: "var(--muted-foreground)", border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }}>⌘</kbd>
                        <kbd className="flex items-center justify-center px-1.5 h-[18px] rounded-md text-[9px] font-bold font-mono"
                            style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.09)", color: "var(--muted-foreground)", border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }}>K</kbd>
                    </div>
                </div>
            </div>

            {/* ── Right cluster ── */}
            <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">

                {/* Live pill */}
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-black mr-1.5"
                    style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <span className={cn(
                        "w-1.5 h-1.5 rounded-full bg-emerald-500 transition-all duration-500",
                        pulse ? "scale-150 opacity-40" : "scale-100 opacity-100"
                    )} style={{ boxShadow: "0 0 4px #10b981" }} />
                    All systems live
                </div>

                {/* Upgrade */}
                <button className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-black transition-all duration-200 hover:opacity-90 hover:scale-[1.03] active:scale-[0.97]"
                    style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "0 2px 14px rgba(108,92,231,0.38)" }}>
                    <Zap className="w-3.5 h-3.5" />
                    Upgrade
                </button>

                {/* Divider */}
                <div className="w-px h-5 mx-1"
                    style={{ background: isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)" }} />

                {/* Theme */}
                <div className="flex-shrink-0"><ThemeToggle /></div>

                {/* Settings */}
                <TopBtn title="Settings" isLight={isLight}>
                    <Settings className="w-[16px] h-[16px]" />
                </TopBtn>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <TopBtn title="Notifications" isLight={isLight} active={notifOpen} onClick={() => setNotifOpen(o => !o)}>
                        <Bell className="w-[16px] h-[16px]" />
                        <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px] rounded-full border-[1.5px]"
                            style={{ background: "#ef4444", borderColor: isLight ? "white" : "#09111e" }} />
                    </TopBtn>

                    {/* Notif dropdown */}
                    {notifOpen && (
                        <div className="absolute right-0 top-[calc(100%+10px)] w-[calc(100vw-2rem)] sm:w-[340px] max-w-[340px] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                            style={{ background: isLight ? "rgba(255,255,255,0.98)" : "rgba(12,16,28,0.98)", border: `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.07)"}`, backdropFilter: "blur(20px)" }}>
                            <div className="flex items-center justify-between px-4 py-3"
                                style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}` }}>
                                <div className="flex items-center gap-2">
                                    <Bell className="w-3.5 h-3.5" style={{ color: "#6C5CE7" }} />
                                    <span className="text-[13px] font-black">Notifications</span>
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                                        style={{ background: "rgba(108,92,231,0.14)", color: "#6C5CE7" }}>4</span>
                                </div>
                                <button onClick={() => setNotifOpen(false)}
                                    className="p-1 rounded-lg transition-colors"
                                    style={{ color: "var(--muted-foreground)" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {NOTIFS.map((n, i) => (
                                <div key={n.id}
                                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                                    style={{ borderBottom: i < NOTIFS.length - 1 ? `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"}` : "none" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.025)" : "rgba(255,255,255,0.03)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${n.color}15` }}>
                                        <n.icon className="w-3.5 h-3.5" style={{ color: n.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-bold" style={{ color: "var(--foreground)" }}>{n.title}</p>
                                        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "var(--muted-foreground)" }}>{n.desc}</p>
                                    </div>
                                    <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>{n.time}</span>
                                </div>
                            ))}

                            <div className="p-3" style={{ borderTop: `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}` }}>
                                <button className="w-full text-[11px] font-bold flex items-center justify-center gap-1 py-2 rounded-xl transition-colors"
                                    style={{ color: "#6C5CE7" }}
                                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(108,92,231,0.08)")}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                    View all notifications <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 mx-0.5" style={{ background: isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)" }} />

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(o => !o)}
                        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            background: profileOpen ? (isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)") : "transparent",
                            border: `1.5px solid ${profileOpen ? (isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)") : "transparent"}`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)"; }}
                        onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black text-white"
                            style={{ background: "var(--brand-gradient)", boxShadow: "0 2px 10px rgba(108,92,231,0.4)" }}>
                            {mounted ? (user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A') : 'A'}
                        </div>
                        <div className="hidden md:block text-left ml-0.5">
                            <p className="text-[13px] font-black leading-none" style={{ color: "var(--foreground)" }}>{mounted ? (user?.name?.split(' ')[0] || 'User') : 'User'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                <p className="text-[9px] font-bold" style={{ color: "var(--muted-foreground)" }}>{mounted ? (user?.type || 'Pro Plan') : 'Pro Plan'}</p>
                            </div>
                        </div>
                        <ChevronDown className="w-3 h-3 hidden md:block ml-0.5 transition-transform duration-200 flex-shrink-0"
                            style={{ color: "var(--muted-foreground)", transform: profileOpen ? "rotate(180deg)" : "none" }} />
                    </button>

                    {/* Profile dropdown */}
                    {profileOpen && (
                        <div className="absolute right-0 top-[calc(100%+10px)] w-56 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                            style={{ background: isLight ? "rgba(255,255,255,0.98)" : "rgba(12,16,28,0.98)", border: `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.07)"}`, backdropFilter: "blur(20px)" }}>
                            <div className="p-4" style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.06)"}` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white"
                                        style={{ background: "var(--brand-gradient)" }}>
                                        {mounted ? (user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A') : 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-black truncate">{mounted ? (user?.name || 'User') : 'User'}</p>
                                        <p className="text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>{mounted ? (user?.type || 'Member') : 'Member'} · {mounted ? (user?.role?.replace('_', ' ') || 'User') : 'User'}</p>
                                    </div>
                                </div>
                            </div>
                            {[
                                { label: "Profile Settings", color: "#6C5CE7", href: "/dashboard/settings", action: () => dispatch(fetchMe()) },
                                { label: "Workspace", color: "#10b981", href: "/dashboard/settings" },
                                { label: "Billing & Plan", color: "#f59e0b", href: "/dashboard/billing" },
                            ].map(item => (
                                <Link key={item.label}
                                    href={item.href}
                                    onClick={() => {
                                        setProfileOpen(false);
                                        if ('action' in item) (item as any).action();
                                    }}
                                    className="w-full text-left px-4 py-3 text-[12px] font-semibold transition-colors flex items-center gap-2.5"
                                    style={{ color: "var(--foreground)", borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"}` }}
                                    onMouseEnter={e => (e.currentTarget.style.background = `${item.color}0D`)}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                                    {item.label}
                                </Link>
                            ))}
                            <button className="w-full text-left px-4 py-3 text-[12px] font-bold text-rose-500 transition-colors"
                                onClick={handleLogout}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.07)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

/* ── Shared icon button — round, consistent 36px ── */
function TopBtn({ children, title, onClick, active, isLight }: {
    children: React.ReactNode; title?: string; onClick?: () => void;
    active?: boolean; isLight: boolean;
}) {
    return (
        <button
            title={title}
            onClick={onClick}
            className="relative w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-110"
            style={{
                color: active ? "var(--foreground)" : "var(--muted-foreground)",
                background: active ? (isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.09)") : "transparent",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "var(--foreground)";
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--muted-foreground)";
                }
            }}
        >
            {children}
        </button>
    );
}
