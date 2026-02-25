"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageSquare,
    Zap,
    BarChart3,
    Users,
    Settings,
    Instagram,
    Facebook,
    ChevronLeft,
    ChevronRight,
    Plus,
    Sparkles,
    CreditCard,
    GitBranch,
    Target,
    Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navItems = [
    {
        group: "MAIN",
        items: [
            { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", badge: null },
            { label: "Inbox", icon: Inbox, href: "/dashboard/inbox", badge: "12", badgeColor: "blue" },
            { label: "Automations", icon: Zap, href: "/dashboard/automations", badge: null },
            { label: "Flow Builder", icon: GitBranch, href: "/dashboard/flows", badge: "New", badgeColor: "sky" },
        ],
    },
    {
        group: "CONNECTIONS",
        items: [
            { label: "Instagram", icon: Instagram, href: "/dashboard/instagram", badge: null },
            { label: "Facebook", icon: Facebook, href: "/dashboard/facebook", badge: null },
        ],
    },
    {
        group: "ANALYTICS",
        items: [
            { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", badge: null },
            { label: "Contacts", icon: Users, href: "/dashboard/contacts", badge: null },
            { label: "Campaigns", icon: Target, href: "/dashboard/campaigns", badge: null },
        ],
    },
    {
        group: "SETTINGS",
        items: [
            { label: "Settings", icon: Settings, href: "/dashboard/settings", badge: null },
            { label: "Billing", icon: CreditCard, href: "/dashboard/billing", badge: null },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "flex flex-col h-screen transition-all duration-300 ease-in-out relative z-30",
                "border-r",
                collapsed ? "w-[70px]" : "w-[250px]"
            )}
            style={{
                background: "var(--sidebar)",
                borderColor: "var(--sidebar-border)",
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-3 px-4 py-5 border-b"
                style={{ borderColor: "var(--sidebar-border)" }}
            >
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 glow-blue-sm"
                    style={{ background: "var(--brand-gradient)" }}
                >
                    <MessageSquare className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <span className="font-bold text-lg gradient-text tracking-tight">BotChat</span>
                        <p className="text-[10px] text-muted-foreground">Pro Workspace</p>
                    </div>
                )}
            </div>

            {/* Quick Action — expanded */}
            {!collapsed && (
                <div className="px-3 pt-4">
                    <button
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                        style={{
                            background: "var(--brand-gradient)",
                            color: "white",
                            boxShadow: "var(--shadow-blue)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.90")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Automation</span>
                        <Sparkles className="w-3.5 h-3.5 ml-auto opacity-80" />
                    </button>
                </div>
            )}

            {/* Quick Action — collapsed */}
            {collapsed && (
                <div className="px-2 pt-3">
                    <button
                        className="w-full flex items-center justify-center p-2.5 rounded-xl transition-all duration-200"
                        style={{
                            background: "var(--brand-gradient)",
                            boxShadow: "var(--shadow-blue)",
                        }}
                    >
                        <Plus className="w-4 h-4 text-white" />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
                {navItems.map((group) => (
                    <div key={group.group}>
                        {!collapsed && (
                            <p className="text-[10px] font-semibold text-muted-foreground px-3 mb-2 tracking-widest">
                                {group.group}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    pathname.startsWith(item.href + "/");
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "nav-item flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200",
                                            isActive ? "active" : "text-muted-foreground"
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon
                                            style={{ width: "18px", height: "18px", flexShrink: 0 }}
                                            className={cn(
                                                isActive ? "" : "opacity-75"
                                            )}
                                        />
                                        {!collapsed && (
                                            <>
                                                <span className="flex-1 font-medium">{item.label}</span>
                                                {item.badge && (
                                                    <Badge
                                                        className="text-[10px] px-1.5 py-0 h-5 font-semibold border-0"
                                                        style={
                                                            item.badgeColor === "sky"
                                                                ? { background: "rgba(56,178,255,0.15)", color: "#38b2ff" }
                                                                : { background: "rgba(29,110,245,0.15)", color: "var(--brand-blue-light)" }
                                                        }
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Connected Accounts */}
            {!collapsed && (
                <div
                    className="mx-3 mb-3 p-3 rounded-xl"
                    style={{
                        background: "var(--glass-bg)",
                        border: "1px solid var(--glass-border)",
                    }}
                >
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2 tracking-wider">
                        CONNECTED
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
                            <Instagram className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-foreground font-medium">@mybrand</span>
                        <div className="ml-auto w-1.5 h-1.5 rounded-full status-online pulse-dot" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #1877f2, #1d6ef5)" }}>
                            <Facebook className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-foreground font-medium">My Page</span>
                        <div className="ml-auto w-1.5 h-1.5 rounded-full status-online pulse-dot" />
                    </div>
                </div>
            )}

            {/* User profile */}
            <div
                className="flex items-center gap-3 p-3 border-t mx-2 mb-2"
                style={{ borderColor: "var(--sidebar-border)" }}
            >
                <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--brand-gradient)" }}
                >
                    A
                </div>
                {!collapsed && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">Anshul</p>
                        <p className="text-[10px] text-muted-foreground truncate">Pro Plan</p>
                    </div>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
                style={{
                    background: "var(--brand-gradient)",
                    boxShadow: "var(--shadow-blue)",
                }}
            >
                {collapsed ? (
                    <ChevronRight className="w-3 h-3 text-white" />
                ) : (
                    <ChevronLeft className="w-3 h-3 text-white" />
                )}
            </button>
        </aside>
    );
}
