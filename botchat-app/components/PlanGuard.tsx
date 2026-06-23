"use client";

import React from "react";
import { useSelector } from "react-redux";
import { Crown, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { selectUserPlan, hasFeature } from "@/lib/plan";

interface PlanGuardProps {
    feature: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgrade?: boolean;
}

export default function PlanGuard({ feature, children, fallback, showUpgrade = true }: PlanGuardProps) {
    const userPlan = useSelector(selectUserPlan);
    const allowed = hasFeature(userPlan, feature);

    if (allowed) return <>{children}</>;

    if (fallback) return <>{fallback}</>;

    if (!showUpgrade) return null;

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background z-10 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: "var(--glass-bg, rgba(0,0,0,0.7))", backdropFilter: "blur(8px)" }}>
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span style={{ color: "var(--foreground, #fff)" }}>Available on higher plans</span>
                    <Link href="/pricing">
                        <span className="flex items-center gap-1 text-primary font-bold ml-1 cursor-pointer hover:underline">
                            Upgrade <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </Link>
                </div>
            </div>
            <div className="pointer-events-none select-none blur-[2px] opacity-60">
                {children}
            </div>
        </div>
    );
}

export function UpgradeBadge({ planName }: { planName?: string }) {
    return (
        <Link href="/pricing">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                <Crown className="w-3 h-3" />
                {planName ? `Upgrade to ${planName}` : "Upgrade Plan"}
            </span>
        </Link>
    );
}

export function PlanLimitBar({ used, limit, label }: { used: number; limit: number; label: string }) {
    const pct = limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;
    const color = pct >= 90 ? "#ef4444" : pct >= 75 ? "#f59e0b" : "#10b981";

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium" style={{ color: "var(--foreground)" }}>{label}</span>
                <span className="font-bold tabular-nums" style={{ color }}>{used} / {limit}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--glass-border)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}
