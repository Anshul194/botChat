"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, fetchMe } from "@/store/slices/authSlice";
import { useMemo } from "react";
import {
    LayoutDashboard, MessageSquare, Zap, BarChart3, Users, Settings,
    Instagram, Facebook, Plus, Sparkles, CreditCard, GitBranch,
    Target, Inbox, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface SidebarProps { collapsed: boolean; onToggle: () => void; onClose?: () => void; }

const navGroups = [
    {
        group: "MAIN", color: "#6C5CE7",
        items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", badge: null },
            { label: "Inbox", icon: Inbox, href: "/dashboard/inbox", badge: "12" },
            { label: "Automations", icon: Zap, href: "/dashboard/automations", badge: null },
            { label: "Flow Builder", icon: GitBranch, href: "/dashboard/flows", badge: "New" },
        ],
    },
    {
        group: "PLATFORMS", color: "#ec4899",
        items: [
            { label: "Instagram", icon: Instagram, href: "/dashboard/instagram", badge: null },
            { label: "Facebook", icon: Facebook, href: "/dashboard/facebook", badge: null },
        ],
    },
    {
        group: "GROWTH", color: "#10b981",
        items: [
            { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", badge: null },
            { label: "Contacts", icon: Users, href: "/dashboard/contacts", badge: null },
            { label: "Campaigns", icon: Target, href: "/dashboard/campaigns", badge: null },
        ],
    },
    {
        group: "WORKSPACE", color: "#f59e0b",
        items: [
            { label: "Settings", icon: Settings, href: "/dashboard/settings", badge: null },
            { label: "Billing", icon: CreditCard, href: "/dashboard/billing", badge: null },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(s => s.auth);
    const [showLogout, setShowLogout] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [glowColor, setGlowColor] = useState("#6C5CE7");

    const adminGroups = [
        {
            group: "ADMINISTRATION", color: "#6366f1",
            items: [
                { label: "User Management", icon: Users, href: "/dashboard/users", badge: null },
            ],
        }
    ];

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        for (const g of navGroups) {
            for (const item of g.items) {
                if (pathname === item.href || pathname.startsWith(item.href + "/")) {
                    setGlowColor(g.color);
                    return;
                }
            }
        }
    }, [pathname]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await new Promise(r => setTimeout(r, 600));
        await dispatch(logoutUser());
        router.push("/auth/sign-in");
    };

    return (
        <>
            {/* ─────────────────────────────────────────────────────────────────
                Sidebar panel — NO bleed-out element, clean contained panel
            ───────────────────────────────────────────────────────────────── */}
            <aside
                className={cn(
                    "flex flex-col h-screen transition-all duration-300 ease-in-out z-30 relative overflow-hidden flex-shrink-0",
                    collapsed ? "w-[72px]" : "w-[252px]"
                )}
                style={{
                    background: "var(--sidebar)",
                    borderRight: "1px solid var(--sidebar-border)",
                }}
            >
                {/* Ambient section glow */}
                <div className="absolute inset-0 pointer-events-none transition-all duration-700"
                    style={{ background: `radial-gradient(ellipse at 10% 20%, ${glowColor}10, transparent 60%)` }} />

                {/* ── Logo ── */}
                <div className={cn(
                    "flex items-center gap-3 px-4 py-5 flex-shrink-0",
                    collapsed && "justify-center px-3"
                )}
                    style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "var(--brand-gradient)",
                            boxShadow: "0 0 18px rgba(108,92,231,0.45), 0 3px 10px rgba(108,92,231,0.3)",
                        }}>
                        <MessageSquare className="w-[17px] h-[17px] text-white" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden min-w-0">
                            <span className="font-black text-[17px] gradient-text tracking-tight block leading-none">BotChat</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-semibold text-muted-foreground">Pro · All live</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── New Automation pill ── */}
                <div className={cn("px-3 pt-4", collapsed && "px-2")}>
                    {!collapsed ? (
                        <button className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-bold text-white group transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                            style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 18px rgba(108,92,231,0.4)" }}>
                            <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                                <Plus className="w-3 h-3" />
                            </div>
                            <span className="flex-1 text-left">New Automation</span>
                            <Sparkles className="w-3.5 h-3.5 opacity-70" />
                        </button>
                    ) : (
                        <button className="w-full flex items-center justify-center p-2.5 rounded-full text-white transition-all duration-200 hover:scale-110"
                            style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 14px rgba(108,92,231,0.4)" }}>
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* ── Nav ── */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-none">
                    {(() => {
                        const adminGroups = [
                            {
                                group: "ADMINISTRATION", color: "#6366f1",
                                items: [
                                    { label: "User Management", icon: Users, href: "/dashboard/users", badge: null },
                                ],
                            }
                        ];

                        // Redundant check: Redux -> LocalStorage -> Type Match
                        const isSuperAdminUser = (() => {
                            if (!mounted) return false;

                            // 1. Check Redux State
                            if (user?.role?.toUpperCase() === 'SUPER_ADMIN' ||
                                user?.type?.toLowerCase().includes('admin') ||
                                (Array.isArray(user?.roles) && user?.roles.some(r => String(r).toLowerCase().includes('admin')))) {
                                return true;
                            }

                            // 2. Direct LocalStorage fallback (Resilience for first-mount)
                            if (typeof window !== 'undefined') {
                                try {
                                    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
                                    if (localUser?.role?.toUpperCase() === 'SUPER_ADMIN' ||
                                        localUser?.type?.toLowerCase().includes('admin') ||
                                        (Array.isArray(localUser?.roles) && localUser?.roles.some((r: any) => String(r).toLowerCase().includes('admin')))) {
                                        return true;
                                    }
                                } catch (e) { }
                            }
                            return false;
                        })();

                        const displayGroups = isSuperAdminUser ? [...navGroups, ...adminGroups] : navGroups;

                        return displayGroups.map(group => (
                            <div key={group.group}>
                                {!collapsed ? (
                                    <div className="flex items-center gap-2 px-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: group.color }} />
                                        <span className="text-[9px] font-black tracking-[0.15em] uppercase" style={{ color: `${group.color}AA` }}>
                                            {group.group}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="h-px mx-2 mb-2 rounded-full" style={{ background: `${group.color}25` }} />
                                )}

                                <div className="space-y-0.5">
                                    {group.items.map(item => {
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={onClose}
                                                title={collapsed ? item.label : undefined}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 rounded-full text-sm transition-all duration-200 group",
                                                    isActive ? "font-bold" : "text-muted-foreground",
                                                    collapsed && "justify-center px-2"
                                                )}
                                                style={isActive ? {
                                                    background: `${group.color}18`,
                                                    color: group.color,
                                                    boxShadow: `0 0 0 1px ${group.color}22, 0 2px 10px ${group.color}15`,
                                                } : undefined}
                                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = `${group.color}0D`; }}
                                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                                            >
                                                {/* Circular icon */}
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200",
                                                    isActive ? "" : "group-hover:scale-110"
                                                )}
                                                    style={{
                                                        background: isActive ? group.color : `${group.color}18`,
                                                        boxShadow: isActive ? `0 0 12px ${group.color}55` : "none",
                                                    }}>
                                                    <item.icon className="w-[15px] h-[15px]"
                                                        style={{ color: isActive ? "white" : group.color }} />
                                                </div>

                                                {!collapsed && (
                                                    <>
                                                        <span className="flex-1 truncate">{item.label}</span>
                                                        {item.badge && (
                                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                                                style={{ background: `${group.color}20`, color: group.color, border: `1px solid ${group.color}30` }}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ));
                    })()}
                </nav>

                {/* ── Connected accounts ── */}
                {!collapsed && (
                    <div className="mx-3 mb-3 p-3.5 rounded-2xl"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        <p className="text-[9px] font-black tracking-widest text-muted-foreground mb-3 uppercase">Connected</p>
                        {[
                            { label: "@mybrand", bg: "linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)", icon: Instagram },
                            { label: "My Page", bg: "linear-gradient(135deg,#1877f2,#1d6ef5)", icon: Facebook },
                        ].map(acc => (
                            <div key={acc.label} className="flex items-center gap-2.5 mb-2.5 last:mb-0">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ background: acc.bg }}>
                                    <acc.icon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-xs font-semibold text-foreground flex-1">{acc.label}</span>
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-emerald-500">LIVE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── User profile ── */}
                <div
                    className="flex items-center gap-2.5 mx-3 mb-3 p-3 rounded-2xl cursor-pointer group transition-all duration-200 hover:bg-white/5"
                    style={{ border: "1px solid var(--glass-border)" }}
                    onClick={() => !collapsed && setShowLogout(true)}
                >
                    <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[13px] font-black text-white group-hover:scale-105 transition-transform duration-200"
                        style={{ background: "var(--brand-gradient)", boxShadow: "0 0 14px rgba(108,92,231,0.35), 0 2px 6px rgba(108,92,231,0.25)" }}>
                        {mounted ? (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "A") : "A"}
                    </div>
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-foreground truncate leading-none">
                                    {mounted ? (user?.name || "Admin User") : "Admin User"}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate capitalize">
                                    {mounted ? (user?.type || user?.role || "Pro Plan") : "Pro Plan"}
                                </p>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); setShowLogout(true); }}
                                className="p-1.5 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100">
                                <LogOut className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {/* Logout dialog */}
            <Dialog open={showLogout} onOpenChange={setShowLogout}>
                <DialogContent className="sm:max-w-[360px] p-6 gap-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500"
                            style={{ boxShadow: "0 0 20px rgba(244,63,94,0.15)" }}>
                            <LogOut className="w-6 h-6 ml-0.5" />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-xl text-center font-black">See you later?</DialogTitle>
                            <DialogDescription className="text-center pt-1.5">
                                You'll be logged out of your BotChat workspace.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t mt-2">
                        <button onClick={() => setShowLogout(false)} disabled={isLoggingOut}
                            className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors hover:bg-muted border border-border">
                            Cancel
                        </button>
                        <button onClick={handleLogout} disabled={isLoggingOut}
                            className="flex-1 py-2.5 rounded-full text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center gap-2">
                            {isLoggingOut
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><LogOut className="w-4 h-4" />Log out</>}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
