"use client";

import { UserPlus, CreditCard, Ban, DollarSign, Calendar } from "lucide-react";

const ICONS: Record<string, typeof UserPlus> = {
    "user-plus": UserPlus,
    "credit-card": CreditCard,
    "ban": Ban,
    "dollar-sign": DollarSign,
    "calendar": Calendar,
};

export default function SubscriptionTimeline({ events }: {
    events: { type: string; label: string; date: string; icon: string; color: string; details?: Record<string, unknown> }[];
}) {
    if (!events || events.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No timeline events yet.</p>
            </div>
        );
    }

    return (
        <div className="relative ml-4">
            <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "var(--glass-border)" }} />
            <div className="space-y-6">
                {events.map((event, i) => {
                    const Icon = ICONS[event.icon] || CreditCard;
                    return (
                        <div key={i} className="relative pl-6">
                            <div className="absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-1.5 border-2"
                                style={{ background: event.color, borderColor: "var(--card)" }} />
                            <div>
                                <div className="flex items-center gap-2">
                                    <Icon className="w-3.5 h-3.5" style={{ color: event.color }} />
                                    <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{event.label}</span>
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                    {new Date(event.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                                {event.details && (
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                        {Object.entries(event.details).filter(([, v]) => v != null).map(([k, v]) => (
                                            <span key={k} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                                style={{ background: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                                                {k}: {String(v)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
