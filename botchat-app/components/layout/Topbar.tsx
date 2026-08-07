"use client";

import { useState, useEffect, useRef } from "react";
import {
    ChevronDown, X, Menu, User, Building2, CreditCard, Sparkles, LogOut,
    PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, fetchMe } from "@/store/slices/authSlice";
import { useTenantSettings } from "@/providers/TenantSettingsProvider";
import { HeaderClock } from "@/components/layout/HeaderClock";
import { useTourContext } from "@/components/onboarding/OnboardingTour";
import { TopbarUsagePopup } from "@/components/layout/TopbarUsagePopup";

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
    "/dashboard/campaigns": "Campaigns",
    "/dashboard/settings": "Settings",
    "/dashboard/billing": "Billing",
    "/dashboard/users": "User Management",
};

export default function Topbar({ onMenuToggle, collapsed, onToggleSidebar, mobileSidebarOpen }: TopbarProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { settings } = useTenantSettings();
    const pathname = usePathname();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { startTour } = useTourContext();
    const page = PAGE_MAP[pathname] ?? "Dashboard";

    const accountItems: { label: string; icon: LucideIcon; color: string; href: string; action?: () => void }[] = [
        { label: "Profile Settings", icon: User, color: "#6C5CE7", href: "/dashboard/settings", action: () => dispatch(fetchMe()) },
        { label: "Workspace", icon: Building2, color: "#10b981", href: "/dashboard/settings" },
        { label: "Billing & Plan", icon: CreditCard, color: "#f59e0b", href: "/dashboard/billing" },
    ];
    const initial = mounted ? (user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'A') : 'A';
    const role = mounted ? (user?.role?.replace('_', ' ') || user?.type || 'Member') : 'Member';

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(t);
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
            className="h-[52px] sm:h-[60px] flex items-center px-2 sm:px-4 gap-1 sm:gap-2 flex-shrink-0 relative z-[100]"
            style={{
                background: "var(--topbar-bg)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid var(--topbar-border)",
            }}
        >
            {/* Decorative layer (glow + accent line) — clipped, doesn't block the profile dropdown */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                <div className="absolute -top-10 right-24 w-56 h-24 rounded-full"
                    style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 70%)", animation: "topbar-glow 6s ease-in-out infinite" }} />
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                        background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--nav-active-color) 55%, transparent) 25%, var(--nav-active-color) 50%, color-mix(in srgb, var(--nav-active-color) 55%, transparent) 75%, transparent 100%)",
                        backgroundSize: "200% 100%",
                        animation: "topbar-gradient 7s linear infinite",
                    }} />
            </div>

            <button
                onClick={onMenuToggle}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                    background: "var(--topbar-item-bg)",
                    border: "1px solid var(--topbar-item-border)",
                    color: "var(--muted-foreground)",
                }}
                title="Toggle menu"
                aria-label="Toggle sidebar navigation"
                onFocus={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "var(--nav-active-color)"; }}
                onBlur={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--topbar-item-border)"; }}
            >
                {mobileSidebarOpen
                    ? <X className="w-4 h-4" />
                    : <Menu className="w-4 h-4" />}
            </button>

            <button
                onClick={onToggleSidebar}
                className="hidden md:flex w-10 h-10 items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                    background: "var(--topbar-item-bg)",
                    border: "1px solid var(--topbar-item-border)",
                    color: "var(--muted-foreground)",
                }}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onFocus={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "var(--nav-active-color)"; }}
                onBlur={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--topbar-item-border)"; }}
            >
                {collapsed
                    ? <PanelLeftOpen className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" />
                    : <PanelLeftClose className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px]" />}
            </button>

            <div className="w-px h-4 sm:h-5 flex-shrink-0"
                style={{ background: "var(--topbar-item-border)" }} />

            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 overflow-hidden" style={{ maxWidth: 160 }}>
                <span className="hidden sm:inline text-[10px] sm:text-[11px] font-semibold truncate max-w-[70px]" style={{ color: "var(--foreground)", opacity: 0.72 }}>{settings.appName}</span>
                <span className="hidden sm:inline w-1 h-1 rounded-full flex-shrink-0"
                    style={{ background: "var(--nav-active-color)", boxShadow: "0 0 6px var(--nav-active-color)" }} />
                <span className="text-[12px] sm:text-[13px] font-black tracking-tight truncate"
                    style={{
                        background: "linear-gradient(90deg, var(--foreground) 40%, var(--nav-active-color))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>{page}</span>
            </div>

            {/* HeaderClock — only renders space when xl+ (matches hidden xl:flex inside) */}
            <div className="hidden xl:block flex-shrink-0">
                <HeaderClock />
            </div>

            {/* ── Center flex-1: usage pills fill all remaining space ── */}
            <div className="flex-1 flex items-center justify-end gap-1 sm:gap-1.5 min-w-0">
                <TopbarUsagePopup />
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">

                <div data-tour="topbar-theme" className="flex-shrink-0"><ThemeToggle /></div>

                <div className="w-px h-4 sm:h-5 mx-0 sm:mx-0.5" style={{ background: "var(--topbar-divider)" }} />

                <div className="relative" ref={profileRef} data-tour="topbar-profile">
                    <button
                        onClick={() => setProfileOpen(o => !o)}
                        className="flex items-center gap-1 sm:gap-2 pl-1 pr-1.5 sm:pr-2.5 py-1 rounded-full transition-all duration-200 hover:scale-[1.02]"
                        style={{
                            background: profileOpen ? "var(--topbar-item-hover)" : "transparent",
                            border: "1.5px solid",
                            borderColor: profileOpen ? "color-mix(in srgb, var(--nav-active-color) 40%, transparent)" : "transparent",
                            boxShadow: profileOpen ? "0 0 18px color-mix(in srgb, var(--nav-active-color) 22%, transparent)" : "none",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "var(--topbar-item-bg)"; }}
                        onMouseLeave={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
                        onFocus={e => { e.currentTarget.style.background = "var(--topbar-item-bg)"; }}
                        onBlur={e => { if (!profileOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-[13px] font-black text-white shrink-0"
                            style={{
                                background: "var(--brand-gradient)",
                                boxShadow: "0 0 0 2px var(--topbar-bg), 0 0 0 3px color-mix(in srgb, var(--nav-active-color) 55%, transparent), 0 3px 12px color-mix(in srgb, var(--primary) 45%, transparent)",
                            }}>
                            {initial}
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500"
                                style={{ boxShadow: "0 0 0 2px var(--topbar-bg), 0 0 8px rgba(16,185,129,0.8)" }} />
                        </div>
                        <div className="hidden lg:block text-left ml-0.5">
                            <p className="text-[12px] sm:text-[13px] font-black leading-none truncate max-w-[80px]" style={{ color: "var(--foreground)" }}>{mounted ? (user?.name?.split(' ')[0] || 'User') : 'User'}</p>
                            <p className="text-[8px] sm:text-[9px] font-bold truncate max-w-[70px] mt-0.5" style={{ color: "var(--nav-active-color)" }}>{role}</p>
                        </div>
                        <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden lg:block ml-0.5 transition-transform duration-200 flex-shrink-0"
                            style={{ color: "var(--muted-foreground)", transform: profileOpen ? "rotate(180deg)" : "none" }} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-[calc(100%+8px)] w-60 sm:w-72 rounded-2xl shadow-2xl overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-150"
                            style={{ background: "var(--topbar-dropdown-bg)", border: "1px solid var(--topbar-dropdown-border)", backdropFilter: "blur(20px)" }}>
                            {/* Header */}
                            <div className="p-3.5 sm:p-4 relative overflow-hidden"
                                style={{ borderBottom: "1px solid var(--topbar-dropdown-border)" }}>
                                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                                    style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 25%, transparent) 0%, transparent 70%)" }} />
                                <div className="flex items-center gap-3 relative">
                                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm sm:text-base font-black text-white shrink-0"
                                        style={{ background: "var(--brand-gradient)", boxShadow: "0 0 0 2px var(--topbar-bg), 0 0 0 3.5px color-mix(in srgb, var(--nav-active-color) 50%, transparent)" }}>
                                        {initial}
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500"
                                            style={{ boxShadow: "0 0 0 2px var(--topbar-dropdown-bg), 0 0 8px rgba(16,185,129,0.8)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] sm:text-[13px] font-black truncate">{mounted ? (user?.name || 'User') : 'User'}</p>
                                        <p className="text-[9px] sm:text-[10px] truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                            {mounted ? (user?.email || 'your@email.com') : 'your@email.com'}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[8px] font-black px-2 py-1 rounded-full uppercase"
                                        style={{ background: "color-mix(in srgb, var(--nav-active-color) 14%, transparent)", color: "var(--nav-active-color)" }}>
                                        {mounted ? (user?.type || 'Member') : 'Member'}
                                    </span>
                                </div>
                            </div>

                            {/* Section label */}
                            <div className="px-3.5 sm:px-4 pt-2.5 pb-1">
                                <span className="text-[9px] font-black tracking-widest" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>ACCOUNT</span>
                            </div>

                            {accountItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.label}
                                        href={item.href}
                                        onClick={() => {
                                            setProfileOpen(false);
                                            item.action?.();
                                        }}
                                        className="w-full text-left px-3.5 sm:px-4 py-2.5 text-[11px] sm:text-[12px] font-semibold transition-all duration-150 flex items-center gap-2.5 group/item"
                                        style={{ color: "var(--topbar-fg)" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = `${item.color}0F`; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover/item:scale-110"
                                            style={{ background: `${item.color}14`, color: item.color }}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        {item.label}
                                        <ChevronDown className="w-3 h-3 ml-auto opacity-0 group-hover/item:opacity-70 transition-opacity" style={{ transform: "rotate(-90deg)" }} />
                                    </Link>
                                );
                            })}

                            <div className="px-3.5 sm:px-4 pt-2.5 pb-1" style={{ borderTop: "1px solid var(--topbar-dropdown-border)" }}>
                                <span className="text-[9px] font-black tracking-widest" style={{ color: "var(--muted-foreground)", opacity: 0.6 }}>SUPPORT</span>
                            </div>

                            <button
                                className="w-full text-left px-3.5 sm:px-4 py-2.5 text-[11px] sm:text-[12px] font-semibold transition-all duration-150 flex items-center gap-2.5 group/item"
                                style={{ color: "var(--topbar-fg)" }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(108,92,231,0.10)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                                onClick={() => { setProfileOpen(false); startTour(); }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover/item:scale-110"
                                    style={{ background: "rgba(108,92,231,0.14)", color: "#6C5CE7" }}>
                                    <Sparkles className="w-3.5 h-3.5" />
                                </div>
                                Restart Product Tour
                            </button>

                            {/* Sign out */}
                            <div className="p-2" style={{ borderTop: "1px solid var(--topbar-dropdown-border)" }}>
                                <button
                                    className="w-full text-left px-3 py-2.5 text-[11px] sm:text-[12px] font-bold rounded-xl transition-all duration-150 flex items-center gap-2.5 group/item"
                                    style={{ color: "var(--muted-foreground)" }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.10)"; e.currentTarget.style.color = "#ef4444"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
                                    onClick={handleLogout}>
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-150 group-hover/item:scale-110"
                                        style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                                        <LogOut className="w-3.5 h-3.5" />
                                    </div>
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
