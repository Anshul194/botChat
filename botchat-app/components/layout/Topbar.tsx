"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search, ChevronDown, X,
    Settings, PanelLeftClose, PanelLeftOpen, Menu,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, fetchMe } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import { useTenantSettings } from "@/providers/TenantSettingsProvider";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useTourContext } from "@/components/onboarding/OnboardingTour";
import { HelpCircle } from "lucide-react";

interface TopbarProps {
    onMenuToggle: () => void;
    collapsed: boolean;
    onToggleSidebar: () => void;
    mobileSidebarOpen?: boolean;
}

const PAGE_MAP: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/inbox": "Smart Inbox",
    "/social/smart-inbox": "Smart Inbox",
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
    const { settings } = useTenantSettings();
    const pathname = usePathname();
    const isLight = theme === "light";
    const [profileOpen, setProfileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { startTour } = useTourContext();
    const page = PAGE_MAP[pathname] ?? "Dashboard";

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push("/auth/sign-in");
    };

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <header
            className="h-[52px] sm:h-[60px] flex items-center px-2 sm:px-4 gap-1.5 sm:gap-3 flex-shrink-0 relative z-[100]"
            style={{
                background: "var(--topbar-bg)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid var(--topbar-border)",
            }}
        >
            <div className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
                style={{ background: "linear-gradient(90deg,rgba(108,92,231,0.7),rgba(236,72,153,0.45),transparent 65%)" }} />

            <button
                onClick={onMenuToggle}
                className="md:hidden w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                    background: "var(--topbar-item-bg)",
                    border: "1px solid var(--topbar-item-border)",
                    color: "var(--muted-foreground)",
                }}
                title="Toggle menu"
            >
                {mobileSidebarOpen
                    ? <X className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" />
                    : <Menu className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" />}
            </button>

            <button
                onClick={onToggleSidebar}
                className="hidden md:flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                    background: "var(--topbar-item-bg)",
                    border: "1px solid var(--topbar-item-border)",
                    color: "var(--muted-foreground)",
                }}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed
                    ? <PanelLeftOpen className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" />
                    : <PanelLeftClose className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" />}
            </button>

            <div className="w-px h-4 sm:h-5 flex-shrink-0"
                style={{ background: "var(--topbar-item-border)" }} />

            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-shrink-0">
                <span className="hidden sm:inline text-[10px] sm:text-[11px] font-semibold truncate max-w-[100px]" style={{ color: "var(--foreground)", opacity: 0.78 }}>{settings.appName}</span>
                <span className="hidden sm:inline" style={{ color: "var(--muted-foreground)", opacity: 0.35, fontSize: 13 }}>/</span>
                <span className="text-[12px] sm:text-[13px] font-black tracking-tight truncate max-w-[120px] sm:max-w-none" style={{ color: "var(--foreground)" }}>{page}</span>
            </div>

            <div className="hidden sm:block w-px h-4 sm:h-5 flex-shrink-0"
                style={{ background: isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)" }} />

            <div className="hidden sm:flex flex-1 max-w-[360px] lg:max-w-[460px] min-w-0">
                <div className="flex items-center gap-2 px-3 py-1.5 sm:py-2 rounded-full cursor-pointer group transition-all duration-200 w-full"
                    style={{
                        background: "var(--topbar-item-bg)",
                        border: "1.5px solid var(--topbar-item-border)",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "var(--nav-active-color)";
                        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(108,92,231,0.08)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "var(--topbar-item-border)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 group-hover:text-[#6C5CE7] transition-colors"
                        style={{ color: "var(--foreground)", opacity: 0.62 }} />
                    <span className="flex-1 text-[11px] sm:text-[13px] select-none truncate" style={{ color: "var(--foreground)", opacity: 0.72 }}>
                        Search anything…
                    </span>
                    <div className="hidden lg:flex items-center gap-0.5">
                        <kbd className="flex items-center justify-center w-[16px] h-[16px] rounded-md text-[8px] font-bold font-mono"
                            style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.09)", color: "var(--muted-foreground)", border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }}>⌘</kbd>
                        <kbd className="flex items-center justify-center px-1 h-[16px] rounded-md text-[8px] font-bold font-mono"
                            style={{ background: isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.09)", color: "var(--muted-foreground)", border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}` }}>K</kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1.5 ml-auto flex-shrink-0">
                <div className="w-px h-4 sm:h-5 mx-0.5 sm:mx-1"
                    style={{ background: isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)" }} />

                <div data-tour="topbar-theme" className="flex-shrink-0"><ThemeToggle /></div>

                <div data-tour="topbar-settings" className="hidden xs:block">
                    <Link href="/dashboard/settings">
                        <TopBtn title="Settings" isLight={isLight}>
                            <Settings className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                        </TopBtn>
                    </Link>
                </div>

                <div data-tour="topbar-notifications">
                    <NotificationBell />
                </div>

                <div className="w-px h-4 sm:h-5 mx-0 sm:mx-0.5" style={{ background: isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)" }} />

                <div className="relative" ref={profileRef} data-tour="topbar-profile">
                    <button
                        onClick={() => setProfileOpen(o => !o)}
                        className="flex items-center gap-1 sm:gap-2 pl-0.5 sm:pl-1 pr-1.5 sm:pr-2.5 py-0.5 sm:py-1 rounded-full transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            background: profileOpen ? (isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)") : "transparent",
                            border: `1.5px solid ${profileOpen ? (isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)") : "transparent"}`,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)"; }}
                        onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-[13px] font-black text-white shrink-0"
                            style={{ background: "var(--brand-gradient)", boxShadow: "0 2px 10px rgba(108,92,231,0.4)" }}>
                            {mounted ? (user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A') : 'A'}
                        </div>
                        <div className="hidden lg:block text-left ml-0.5">
                            <p className="text-[12px] sm:text-[13px] font-black leading-none truncate max-w-[80px]" style={{ color: "var(--foreground)" }}>{mounted ? (user?.name?.split(' ')[0] || 'User') : 'User'}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                <p className="text-[8px] sm:text-[9px] font-bold truncate max-w-[70px]" style={{ color: "var(--muted-foreground)" }}>{mounted ? (user?.type || 'Pro Plan') : 'Pro Plan'}</p>
                            </div>
                        </div>
                        <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden lg:block ml-0.5 transition-transform duration-200 flex-shrink-0"
                            style={{ color: "var(--muted-foreground)", transform: profileOpen ? "rotate(180deg)" : "none" }} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-[calc(100%+8px)] w-56 sm:w-64 rounded-2xl shadow-2xl overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-150"
                            style={{ background: isLight ? "rgba(255,255,255,0.98)" : "rgba(12,16,28,0.98)", border: `1px solid ${isLight ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.07)"}`, backdropFilter: "blur(20px)" }}>
                            <div className="p-3 sm:p-4" style={{ borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.06)"}` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-white shrink-0"
                                        style={{ background: "var(--brand-gradient)" }}>
                                        {mounted ? (user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A') : 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] sm:text-[13px] font-black truncate">{mounted ? (user?.name || 'User') : 'User'}</p>
                                        <p className="text-[9px] sm:text-[10px] truncate" style={{ color: "var(--muted-foreground)" }}>{mounted ? (user?.type || 'Member') : 'Member'} · {mounted ? (user?.role?.replace('_', ' ') || 'User') : 'User'}</p>
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
                                    className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-[12px] font-semibold transition-colors flex items-center gap-2 sm:gap-2.5"
                                    style={{ color: "var(--foreground)", borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"}` }}
                                    onMouseEnter={e => (e.currentTarget.style.background = `${item.color}0D`)}
                                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-[12px] font-semibold transition-colors flex items-center gap-2 sm:gap-2.5"
                                style={{ color: "var(--foreground)", borderBottom: `1px solid ${isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)"}` }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(108,92,231,0.08)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                onClick={() => { setProfileOpen(false); startTour(); }}
                            >
                                <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6C5CE7]" />
                                Restart Product Tour
                            </button>
                            <button className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-[12px] font-bold transition-colors"
                                style={{ color: "var(--muted-foreground)" }}
                                onMouseEnter={e => { e.currentTarget.style.background = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--foreground)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
                                onClick={handleLogout}>
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function TopBtn({ children, title, onClick, active, isLight }: {
    children: React.ReactNode; title?: string; onClick?: () => void;
    active?: boolean; isLight: boolean;
}) {
    return (
        <button
            title={title}
            onClick={onClick}
            className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-110"
            style={{
                color: active ? "var(--foreground)" : "var(--muted-foreground)",
                background: active ? "var(--topbar-item-hover)" : "transparent",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = "var(--topbar-item-bg)";
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
