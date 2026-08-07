"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardHeader } from "@/store/slices/dashboardHeaderSlice";
import { usePathname, useRouter } from "next/navigation";
import {
    Sparkles, Clock, ArrowUpRight, X, ChevronDown,
    Users, MessageSquare, Share2, Radio, Calendar, Zap,
    HardDrive, Link as LinkIcon, Globe, QrCode, Bot, UserCheck, Code,
    BarChart3, TrendingUp, AlertTriangle, Megaphone, BrainCircuit,
    Settings,
} from "lucide-react";
import { HeaderCardItem } from "@/store/slices/dashboardHeaderSlice";

const ICON_MAP: Record<string, any> = {
    Users, MessageSquare, Sparkles, Share2, Radio, Calendar, Zap,
    HardDrive, Link: LinkIcon, Globe, QrCode, Bot, UserCheck, Code,
    Megaphone, BrainCircuit, Settings,
};

// Short labels for inline topbar pills
const SHORT_LABEL: Record<string, string> = {
    subscribers:    "Subscriber",
    messages:       "Message",
    ai_tokens:      "AI Token",
    broadcast:      "Broadcasts",
    bio_links:      "Bio Links",
    social_posting: "Social Posts",
    ai_agents:      "AI Agents",
    smart_inbox:    "Inbox",
    social_accounts:"Social",
    automation_rules:"Automations",
    storage:        "Storage",
    custom_domains: "Domains",
};

const COLOR_HEX: Record<string, string> = {
    green:  "#10b981",
    yellow: "#f59e0b",
    red:    "#ef4444",
    purple: "#8b5cf6",
    blue:   "#38bdf8",
    orange: "#f97316",
    pink:   "#ec4899",
    cyan:   "#06b6d4",
};

function getColorHex(color: string) {
    return COLOR_HEX[color] || color || "#10b981";
}

// ─── Compact inline ring pill — matches first screenshot exactly ─────────────
// Layout: [SVG ring with % inside] [label\nused/limit]
function InlineRingPill({ card }: { card: HeaderCardItem }) {
    const SIZE = 38;
    const R    = 14;
    const circ = 2 * Math.PI * R;
    const hex  = getColorHex(card.color);

    const isCritical = !card.is_unlimited && card.percentage >= 80;
    const isWarn     = !card.is_unlimited && card.percentage >= 50;
    const ringColor  = isCritical ? "#ef4444" : isWarn ? "#f59e0b" : "#10b981"; // always green unless warn/critical

    const pct    = Math.min(100, card.is_unlimited ? 0 : card.percentage);
    const filled = (pct / 100) * circ;

    const label = SHORT_LABEL[card.feature_key] ?? card.title;
    const limitStr = card.is_unlimited ? "∞"
        : card.limit >= 1_000_000 ? `${(card.limit / 1_000_000).toFixed(1)}M`
        : card.limit >= 1000      ? `${Math.round(card.limit / 1000)}K`
        : String(card.limit);
    const usedStr = card.used >= 1_000_000 ? `${(card.used / 1_000_000).toFixed(1)}M`
        : card.used >= 1000 ? `${(card.used / 1000).toFixed(1)}K`
        : String(card.used);

    return (
        <div
            className="flex items-center gap-2 select-none"
            title={`${card.title}: ${card.used.toLocaleString()} / ${card.is_unlimited ? "∞" : card.limit.toLocaleString()}`}
        >
            {/* Ring */}
            <div className="relative flex-shrink-0" style={{ width: SIZE, height: SIZE }}>
                {isCritical && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
                        style={{ background: ringColor }} />
                )}
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="absolute" style={{ transform: "rotate(-90deg)" }}>
                    {/* Track */}
                    <circle cx={SIZE/2} cy={SIZE/2} r={R}
                        stroke="rgba(128,128,128,0.25)" strokeWidth={2.5} fill="none" />
                    {/* Progress */}
                    <circle cx={SIZE/2} cy={SIZE/2} r={R}
                        stroke={ringColor} strokeWidth={2.5} fill="none"
                        strokeDasharray={card.is_unlimited ? `${circ} 0` : `${filled} ${circ - filled}`}
                        strokeLinecap="round"
                        style={{
                            filter: `drop-shadow(0 0 4px ${ringColor}99)`,
                            transition: "stroke-dasharray 0.8s ease",
                        }}
                    />
                </svg>
                {/* Center text — only show % for limited, leave empty for unlimited */}
                {!card.is_unlimited && (
                    <span
                        className="absolute inset-0 flex items-center justify-center font-black leading-none"
                        style={{ fontSize: "10px", color: ringColor }}
                    >
                        {`${pct}%`}
                    </span>
                )}
            </div>

            {/* Label + value */}
            <div className="flex flex-col" style={{ gap: 3 }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--foreground)", lineHeight: 1 }}>
                    {label}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 600, lineHeight: 1 }}>
                    <span style={{ color: ringColor, fontWeight: 800 }}>{usedStr}</span>
                    <span style={{ color: "var(--muted-foreground)", opacity: 0.5 }}>/</span>
                    {card.is_unlimited
                        ? <span style={{ color: "var(--muted-foreground)", fontWeight: 500, fontSize: "12px", letterSpacing: "-0.5px" }}>∞</span>
                        : <span style={{ color: "var(--muted-foreground)", fontWeight: 600 }}>{limitStr}</span>
                    }
                </span>
            </div>
        </div>
    );
}

// ─── Popup row — single col list, matches second screenshot ─────────────────
function PopupRow({ card, onClick }: { card: HeaderCardItem; onClick?: () => void }) {
    const hex        = getColorHex(card.color);
    const isCritical = !card.is_unlimited && card.percentage >= 80;
    const isWarn     = !card.is_unlimited && card.percentage >= 50 && card.percentage < 80;
    const ringColor  = isCritical ? "#ef4444" : isWarn ? "#f59e0b" : hex;
    const IconComponent = ICON_MAP[card.icon] || Zap;

    const SIZE = 36; const R = 13;
    const circ = 2 * Math.PI * R;
    const pct  = Math.min(100, card.is_unlimited ? 0 : card.percentage);
    const fill = (pct / 100) * circ;

    const limitStr = card.is_unlimited ? "∞"
        : card.limit >= 1_000_000 ? `${(card.limit / 1_000_000).toFixed(1)}M`
        : card.limit >= 1000      ? `${Math.round(card.limit / 1000)}K`
        : String(card.limit);

    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150"
            style={{ borderBottom: "1px solid var(--topbar-dropdown-border)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${hex}18`, color: hex }}>
                <IconComponent className="w-4 h-4" />
            </div>

            {/* Name + value */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold leading-tight truncate" style={{ fontSize: "13px", color: "var(--foreground)" }}>
                    {card.title}
                </p>
                <p className="leading-tight mt-1" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                    <span style={{ fontWeight: 700, color: "var(--foreground)", opacity: 0.85 }}>
                        {card.used.toLocaleString()}
                    </span>
                    <span style={{ opacity: 0.4 }}>{" / "}</span>
                    {card.is_unlimited
                        ? <span style={{ color: ringColor, fontWeight: 400, fontSize: "15px", letterSpacing: "-0.5px" }}>∞</span>
                        : <span style={{ fontWeight: 600 }}>{card.limit.toLocaleString()}</span>
                    }
                </p>
            </div>

            {/* Ring */}
            <div className="shrink-0 relative" style={{ width: SIZE, height: SIZE }}>
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}
                    style={{ transform: "rotate(-90deg)", position: "absolute" }}>
                    <circle cx={SIZE/2} cy={SIZE/2} r={R}
                        stroke="rgba(255,255,255,0.1)" strokeWidth={2.5} fill="none" />
                    <circle cx={SIZE/2} cy={SIZE/2} r={R}
                        stroke={ringColor} strokeWidth={2.5} fill="none"
                        strokeDasharray={card.is_unlimited ? `${circ} 0` : `${fill} ${circ - fill}`}
                        strokeLinecap="round"
                        style={{
                            filter: `drop-shadow(0 0 2px ${ringColor}80)`,
                            transition: "stroke-dasharray 0.8s ease",
                        }}
                    />
                </svg>
                {/* Center text — only % for limited, empty for unlimited */}
                {!card.is_unlimited && (
                    <span className="absolute inset-0 flex items-center justify-center font-black"
                        style={{ fontSize: "8px", color: ringColor }}>
                        {`${pct}%`}
                    </span>
                )}
            </div>
        </div>
    );
}

// ─── Main exported component ───────────────────────────────────────────────
export function TopbarUsagePopup() {
    const dispatch  = useAppDispatch();
    const pathname  = usePathname();
    const router    = useRouter();
    const { data, loading } = useAppSelector((s) => s.dashboardHeader);
    const [open, setOpen]   = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchDashboardHeader(pathname));
    }, [dispatch, pathname]);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    if (!data || data.role === "super_admin") return null;

    const { subscription, cards } = data;
    const planName  = subscription?.plan_name ?? "Free";
    const daysLeft  = subscription?.days_remaining ?? 0;
    const status    = subscription?.status ?? "active";

    const critical    = (cards || []).filter((c) => !c.is_unlimited && c.percentage >= 80);
    const statusColor = status === "active" ? "#10b981" : status === "trial" ? "#38bdf8" : "#ef4444";

    // All cards for inline display — show progressively fewer on smaller screens
    const allCards = cards || [];

    return (
        <div className="relative flex items-center gap-1.5 flex-shrink-0" ref={ref}>

            {/* ── Plan Chip — visible xl+ ───────────────────────────── */}
            <div
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full cursor-pointer select-none transition-all duration-200 hover:opacity-80 active:scale-95 flex-shrink-0"
                style={{
                    background: `color-mix(in srgb, ${statusColor} 12%, var(--topbar-item-bg, rgba(255,255,255,0.06)))`,
                    border: `1px solid color-mix(in srgb, ${statusColor} 30%, transparent)`,
                }}
                onClick={() => router.push("/dashboard/billing")}
                title="Go to Billing"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && router.push("/dashboard/billing")}
            >
                <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: statusColor }} />
                <span className="text-[11px] font-bold truncate max-w-[80px]" style={{ color: "var(--foreground)" }}>
                    {planName}
                </span>
                <span
                    className="flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                        fontSize: "10px",
                        background: daysLeft <= 7 ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.12)",
                        color: daysLeft <= 7 ? "#ef4444" : "#10b981",
                    }}
                >
                    <Clock className="w-3 h-3" />
                    {daysLeft}d
                </span>
            </div>

            {/* ── Always show first 3 pills — hidden on mobile/tablet to avoid overflow ── */}
            {allCards.slice(0, 3).map((card) => (
                <button
                    key={card.id}
                    onClick={() => setOpen(true)}
                    className="hidden lg:flex items-center px-1.5 py-1 rounded-xl transition-all duration-200 hover:opacity-80 active:scale-95 cursor-pointer border-none outline-none bg-transparent flex-shrink-0"
                >
                    <InlineRingPill card={card} />
                </button>
            ))}

            {/* ── "Usage ▾" Dropdown Button ─────────────────────────── */}
            <button
                id="topbar-usage-btn"
                onClick={() => setOpen((o) => !o)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-80 active:scale-95 flex-shrink-0"
                style={{
                    background: open
                        ? "color-mix(in srgb, var(--primary) 15%, var(--topbar-item-bg, rgba(255,255,255,0.06)))"
                        : "var(--topbar-item-bg, rgba(255,255,255,0.06))",
                    border: `1.5px solid ${
                        open
                            ? "color-mix(in srgb, var(--primary) 50%, transparent)"
                            : "rgba(255,255,255,0.12)"
                    }`,
                    boxShadow: open ? "0 0 14px color-mix(in srgb, var(--primary) 20%, transparent)" : "none",
                }}
                title="View all usage"
                aria-label="Open usage panel"
                aria-expanded={open}
            >
                {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                ) : (
                    <BarChart3 className="w-3.5 h-3.5" style={{ color: open ? "var(--primary)" : "var(--muted-foreground)" }} />
                )}
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)" }}>
                    Usage
                </span>
                {critical.length > 0 && (
                    <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                        style={{ background: "#ef4444", boxShadow: "0 0 6px #ef4444aa" }}
                    >
                        {critical.length}
                    </span>
                )}
                <ChevronDown
                    className="w-3.5 h-3.5 transition-transform duration-200"
                    style={{
                        color: "var(--muted-foreground)",
                        transform: open ? "rotate(180deg)" : "none",
                    }}
                />
            </button>

            {/* ── Usage Popup ─────────────────────────────────────────── */}
            {open && (
                <div
                    id="topbar-usage-panel"
                    className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-[56px] md:top-[calc(100%+10px)] w-auto md:w-[340px] rounded-2xl shadow-2xl overflow-hidden z-[300] animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{
                        background:           "var(--topbar-dropdown-bg)",
                        border:               "1px solid var(--topbar-dropdown-border)",
                        backdropFilter:       "blur(28px)",
                        WebkitBackdropFilter: "blur(28px)",
                    }}
                >
                    {/* ── Popup Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 relative overflow-hidden"
                        style={{ borderBottom: "1px solid var(--topbar-dropdown-border)" }}
                    >
                        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 70%)" }} />
                        <div className="flex items-center gap-2.5 relative">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                style={{ background: "var(--brand-gradient, linear-gradient(135deg,#6C5CE7,#a855f7))", boxShadow: "0 0 12px color-mix(in srgb, var(--primary) 35%, transparent)" }}>
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.2, color: "var(--foreground)" }}>
                                    Usage Overview
                                </p>
                                <p className="mt-1" style={{ fontSize: "11px", color: "var(--muted-foreground)", lineHeight: 1.2 }}>
                                    {planName} · {daysLeft} days left
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative">
                            {critical.length > 0 && (
                                <span className="flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full"
                                    style={{ fontSize: "11px", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {critical.length} critical
                                </span>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                                style={{ color: "var(--muted-foreground)" }}
                                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                aria-label="Close usage panel"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* ── Card list — single column, easy to read */}
                    <div className="overflow-y-auto no-scrollbar" style={{ maxHeight: 380 }}>
                        {allCards.map((card) => (
                            <PopupRow
                                key={card.id}
                                card={card}
                                onClick={() => {
                                    if (card.click_url) router.push(card.click_url);
                                    setOpen(false);
                                }}
                            />
                        ))}
                    </div>

                    {/* ── Footer */}
                    <div
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{ borderTop: "1px solid var(--topbar-dropdown-border)" }}
                    >
                        <p style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                            {allCards.length} features tracked
                        </p>
                        <button
                            onClick={() => { router.push("/dashboard/billing"); setOpen(false); }}
                            className="flex items-center gap-1.5 font-bold px-3.5 py-1.5 rounded-lg transition-all duration-150 hover:opacity-90 active:scale-95"
                            style={{
                                fontSize: "11px",
                                background: "var(--brand-gradient, linear-gradient(135deg,#6C5CE7,#a855f7))",
                                color: "#fff",
                                boxShadow: "0 0 10px color-mix(in srgb, var(--primary) 28%, transparent)",
                            }}
                        >
                            Upgrade Plan
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

