"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Plan } from "@/store/slices/plansSlice";

const FEATURE_ROWS: { key: string; label: string }[] = [
    { key: "connect_account", label: "Connected Accounts" },
    { key: "message_credit", label: "Message Credits" },
    { key: "subscribers", label: "Subscribers" },
    { key: "bot_ai_token", label: "AI Tokens" },
    { key: "broadcast", label: "Broadcast Campaigns" },
    { key: "smart_inbox", label: "Smart Inbox" },
    { key: "social_posting", label: "Social Posting" },
    { key: "analytics", label: "Analytics" },
    { key: "bio_links", label: "Bio Links" },
    { key: "short_links", label: "Short Links" },
    { key: "vcard", label: "VCard Links" },
    { key: "domains", label: "Custom Domains" },
    { key: "pixels", label: "Pixels & Tracking" },
    { key: "team_member", label: "Team Members" },
    { key: "facebook", label: "Facebook" },
    { key: "instagram", label: "Instagram" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "telegram", label: "Telegram" },
];

function getFeatureVal(features: Record<string, unknown> | undefined, key: string): string {
    if (!features) return "0";
    const v = features[key];
    if (v === null || v === undefined) return "0";
    if (typeof v === "boolean") return v ? "1" : "0";
    if (typeof v === "object") return String((v as Record<string, unknown>).value ?? (v as Record<string, unknown>).enabled ?? "0");
    return String(v);
}

function isEnabled(val: string): boolean {
    return val !== "0" && val !== "false" && val !== "";
}

export default function PlanComparisonTable({ plans, currentPlanId }: { plans: Plan[]; currentPlanId?: number }) {
    if (plans.length === 0) return null;

    return (
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--glass-border)" }}>
            <table className="w-full text-sm">
                <thead>
                    <tr style={{ background: "var(--glass-bg)" }}>
                        <th className="sticky left-0 z-10 p-4 text-left text-xs font-bold uppercase tracking-widest" style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", minWidth: 180 }}>
                            Feature
                        </th>
                        {plans.map((p) => (
                            <th key={p.id} className={cn("p-4 text-center text-sm font-black", currentPlanId === p.id && "")}
                                style={{ color: currentPlanId === p.id ? "var(--nav-active-color)" : "var(--foreground)", minWidth: 140 }}>
                                <div>{p.name}</div>
                                <div className="text-lg font-black mt-1">{formatPrice(p.price)}</div>
                                <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                    /{p.duration} {p.duration_type}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {FEATURE_ROWS.map(({ key, label }, i) => (
                        <tr key={key} className={cn(i % 2 === 0 ? "" : "", "transition-colors hover:opacity-90")}
                            style={{ background: i % 2 === 0 ? "var(--glass-bg)" : "transparent" }}>
                            <td className="sticky left-0 z-10 p-4 text-sm font-semibold" style={{ background: i % 2 === 0 ? "var(--glass-bg)" : "transparent", color: "var(--foreground)" }}>
                                {label}
                            </td>
                            {plans.map((p) => {
                                const val = getFeatureVal(p.features, key);
                                const enabled = isEnabled(val);
                                return (
                                    <td key={p.id} className={cn("p-4 text-center", currentPlanId === p.id ? "" : "")}>
                                        {enabled ? (
                                            val === "1" ? (
                                                <Check className="mx-auto h-5 w-5" style={{ color: "var(--nav-active-color)" }} />
                                            ) : (
                                                <span className="font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{val}</span>
                                            )
                                        ) : (
                                            <Minus className="mx-auto h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function formatPrice(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}
