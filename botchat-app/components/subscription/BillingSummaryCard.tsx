"use client";

import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import { usePlanFeature } from "@/hooks/usePlanFeature";

export default function BillingSummaryCard() {
    const { currentPlan, expiryDate, isExpired, daysRemaining } = usePlanFeature();
    const expired = isExpired();
    const days = daysRemaining();

    return (
        <div className="rounded-2xl border p-6" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--nav-active-color)" }}>Subscription</p>
                    <h2 className="mt-1 text-2xl font-black" style={{ color: "var(--foreground)" }}>{currentPlan?.name || "Free"}</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                        <CalendarClock className="h-4 w-4" /> {expiryDate ? `Expires ${expiryDate}` : "No expiry date"}
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${expired ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {expired ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        {expired ? "Expired" : "Active"}
                    </span>
                    {days !== null && (
                        <span className="rounded-full px-4 py-2 text-sm font-black" style={{ background: "var(--nav-active-bg)", color: "var(--nav-active-color)" }}>
                            {Math.max(0, days)} days remaining
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
