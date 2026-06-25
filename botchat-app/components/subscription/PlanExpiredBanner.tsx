"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { usePlanFeature } from "@/hooks/usePlanFeature";

export default function PlanExpiredBanner() {
    const { isExpired, expiryDate, currentPlan } = usePlanFeature();

    if (!isExpired()) return null;

    return (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div>
                    <p className="font-black text-red-600 dark:text-red-400">Your subscription has expired.</p>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {currentPlan?.name || "Current plan"} expired{expiryDate ? ` on ${expiryDate}` : ""}. Renew to restore premium access.
                    </p>
                </div>
            </div>
            <Link href="/dashboard/billing" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white">
                Renew plan <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
