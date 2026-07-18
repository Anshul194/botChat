"use client";

import { Users, MessageSquare, PlugZap } from "lucide-react";
import { usePlanFeature } from "@/hooks/usePlanFeature";

const rows = [
    { key: "team_member", label: "Team", icon: Users },
    { key: "message_credit", label: "Messages", icon: MessageSquare },
    { key: "connect_account", label: "Accounts", icon: PlugZap },
];

export default function UsageCard() {
    const { usage } = usePlanFeature();

    return (
        <div className="rounded-2xl border p-4 sm:p-6" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <h2 className="text-sm sm:text-base font-bold" style={{ color: "var(--foreground)" }}>Plan Usage</h2>
            <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {rows.map(({ key, label, icon: Icon }) => {
                    const item = usage[key];
                    const limit = item?.limit ?? -1;
                    const used = item?.used ?? 0;
                    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

                    return (
                        <div key={key} className="rounded-2xl border p-3 sm:p-4" style={{ borderColor: "var(--glass-border)" }}>
                            <div className="mb-2 sm:mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold" style={{ color: "var(--foreground)" }}>
                                    <Icon className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> {label}
                                </div>
                                <span className="text-xs sm:text-sm font-black" style={{ color: "var(--nav-active-color)" }}>
                                    {used}/{limit < 0 ? "∞" : limit}
                                </span>
                            </div>
                            <div className="h-1.5 sm:h-2 overflow-hidden rounded-full" style={{ background: "var(--glass-border)" }}>
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--brand-gradient)" }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
