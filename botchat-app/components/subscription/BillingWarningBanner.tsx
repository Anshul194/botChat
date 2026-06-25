"use client";

import { usePlanFeature } from "@/hooks/usePlanFeature";
import { AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";

export default function BillingWarningBanner() {
    const { currentPlan, isSuperAdmin } = usePlanFeature();
    const expired = usePlanFeature().isExpired();
    const remaining = usePlanFeature().daysRemaining();

    if (isSuperAdmin) return null;
    if (!currentPlan) return null;

    if (expired) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#ef4444" }} />
                <p className="text-xs font-semibold flex-1" style={{ color: "#ef4444" }}>
                    Your <strong>{currentPlan.name}</strong> plan has expired. Some features are limited.
                </p>
                <Link href="/dashboard/billing"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: "#ef4444", color: "#fff" }}>
                    Renew Now
                </Link>
            </div>
        );
    }

    if (remaining !== null && remaining <= 7) {
        const isUrgent = remaining <= 3;
        const color = isUrgent ? "#f59e0b" : "#f59e0b";
        return (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
                style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                <Clock className="w-4 h-4 flex-shrink-0" style={{ color }} />
                <p className="text-xs font-semibold flex-1" style={{ color }}>
                    Your <strong>{currentPlan.name}</strong> plan expires in <strong>{remaining} day{remaining !== 1 ? "s" : ""}</strong>.
                </p>
                <Link href="/dashboard/billing"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: color, color: "#fff" }}>
                    Renew
                </Link>
            </div>
        );
    }

    return null;
}
