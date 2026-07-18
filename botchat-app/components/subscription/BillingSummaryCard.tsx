"use client";

import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import { usePlanFeature } from "@/hooks/usePlanFeature";

export default function BillingSummaryCard() {
    const { currentPlan, expiryDate, isExpired, daysRemaining } = usePlanFeature();
    const expired = isExpired();
    const days = daysRemaining();

    return (
        <div className="rounded-2xl border p-4 sm:p-6" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest" style={{ color: "var(--nav-active-color)" }}>Subscription</p>
                    <h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-black truncate" style={{ color: "var(--foreground)" }}>{currentPlan?.name || "Free"}</h2>
                    <p className="mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <CalendarClock className="h-3.5 sm:h-4 w-3.5 sm:w-4 shrink-0" /> {expiryDate ? `Expires ${expiryDate}` : "No expiry date"}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={`inline-flex items-center gap-1 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-black ${expired ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {expired ? <XCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <CheckCircle2 className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
                        {expired ? "Expired" : "Active"}
                    </span>
                    {days !== null && (
                        <span className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-black whitespace-nowrap" style={{ background: "var(--nav-active-bg)", color: "var(--nav-active-color)" }}>
                            {Math.max(0, days)}d remaining
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
