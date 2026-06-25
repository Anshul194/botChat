"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { usePlanFeature } from "@/hooks/usePlanFeature";

export default function UpgradeCard({ feature }: { feature?: string }) {
    const { currentPlan } = usePlanFeature();

    return (
        <div className="rounded-3xl border p-8 text-center" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "var(--brand-gradient-soft)", color: "var(--nav-active-color)" }}>
                <LockKeyhole className="h-7 w-7" />
            </div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest" style={{ background: "var(--nav-active-bg)", color: "var(--nav-active-color)" }}>
                <Sparkles className="h-3.5 w-3.5" /> Upgrade required
            </div>
            <h2 className="text-2xl font-black" style={{ color: "var(--foreground)" }}>Plan required</h2>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--muted-foreground)" }}>
                Your current {currentPlan?.name ? `${currentPlan.name} plan` : "plan"} does not include {feature ? <span className="font-bold">{feature.replace(/_/g, " ")}</span> : "this feature"}.
            </p>
            <Link href="/dashboard/billing" className="mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white" style={{ background: "var(--brand-gradient)" }}>
                Upgrade plan <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}
