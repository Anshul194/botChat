"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    getBroadcastAnalytics,
    getBroadcastCampaign,
} from "@/services/messengerBroadcast.service";
import { formatTime, formatDateTime } from "@/lib/date";
import {
    Loader2, ArrowLeft, Send, CheckCircle2, BookOpen, MousePointerClick,
    XCircle, BarChart2, TrendingUp, Link2, Users, Clock, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pct = (n: number) => `${n.toFixed(1)}%`;

const fmt = (n: number) => n?.toLocaleString() ?? "0";

function statusBadge(status: string) {
    const map: Record<string, string> = {
        draft: "bg-neutral-100 text-neutral-600",
        ready: "bg-cyan-100 text-cyan-700",
        scheduled: "bg-indigo-100 text-indigo-700",
        queued: "bg-purple-100 text-purple-700",
        sending: "bg-blue-100 text-blue-700",
        completed: "bg-emerald-100 text-emerald-700",
        paused: "bg-orange-100 text-orange-700",
        failed: "bg-red-100 text-red-700",
        cancelled: "bg-red-100 text-red-700",
    };
    return map[status] ?? "bg-neutral-100 text-neutral-600";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    label, value, icon: Icon, color, sub,
}: {
    label: string; value: string | number; icon: React.ElementType;
    color: string; sub?: string;
}) {
    return (
        <div className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}>{label}</p>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "22" }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>{value}</p>
            {sub && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
        </div>
    );
}

// ─── Rate Card ────────────────────────────────────────────────────────────────

function RateCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted-foreground)" }}>{label}</p>
            <p className="text-3xl font-bold" style={{ color }}>{pct(value)}</p>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(value, 100)}%`, background: color }} />
            </div>
        </div>
    );
}

// ─── Funnel Bar ───────────────────────────────────────────────────────────────

function FunnelStep({
    label, count, total, color, icon: Icon,
}: { label: string; count: number; total: number; color: string; icon: React.ElementType }) {
    const width = total > 0 ? Math.min((count / total) * 100, 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium" style={{ color: "var(--foreground)" }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                    {label}
                </span>
                <span className="font-bold tabular-nums" style={{ color }}>
                    {fmt(count)} <span className="text-xs font-normal ml-1" style={{ color: "var(--muted-foreground)" }}>
                        ({pct(width)})
                    </span>
                </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${width}%`, background: color }} />
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BroadcastAnalyticsPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = Number(params.id);

    const { data: campaignRes } = useQuery({
        queryKey: ["broadcastCampaign", campaignId],
        queryFn: () => getBroadcastCampaign(campaignId),
    });

    const { data: analyticsRes, isLoading } = useQuery({
        queryKey: ["broadcastAnalytics", campaignId],
        queryFn: () => getBroadcastAnalytics(campaignId),
        refetchInterval: (q) => {
            const status = q.state.data?.data?.status;
            return status === "sending" || status === "queued" ? 8000 : false;
        },
    });

    const campaign = campaignRes?.data;
    const analytics = analyticsRes?.data;

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--brand-purple)" }} />
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
                <BarChart2 className="w-12 h-12 opacity-30" />
                <p style={{ color: "var(--muted-foreground)" }}>No analytics data available yet.</p>
                <Button variant="outline" onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/monitor`)}>
                    Go to Monitor
                </Button>
            </div>
        );
    }

    const { counters, rates, status_breakdown, hourly_timeline, links, timestamps } = analytics;
    const total = counters?.total ?? 0;

    // Compute max for hourly chart
    const maxHourly = Math.max(...(hourly_timeline?.map((h: any) => h.count) ?? [1]), 1);

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4 sm:p-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon"
                        onClick={() => router.push("/dashboard/broadcasts")}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                                {campaign?.name ?? "Campaign Analytics"}
                            </h1>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${statusBadge(analytics.status)}`}>
                                {analytics.status}
                            </span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            Delivery tracking · {analytics.channel_type === "facebook" ? "Facebook Messenger" : "Instagram DM"}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm"
                        onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/analytics/recipients`)}>
                        <Users className="w-4 h-4 mr-2" />
                        Recipients Report
                    </Button>
                    <Button variant="outline" size="sm"
                        onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/monitor`)}>
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Live Monitor
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="rounded-2xl p-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>
                        Overall Progress
                    </p>
                    <p className="text-2xl font-bold" style={{ color: "var(--brand-purple)" }}>
                        {analytics.progress}%
                    </p>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${analytics.progress}%`, background: "var(--brand-purple)" }} />
                </div>
                <div className="flex justify-between mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                    <span>{fmt(counters.sent + counters.failed + counters.skipped)} processed</span>
                    <span>{fmt(total)} total recipients</span>
                </div>
            </div>

            {/* Counter Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard label="Sent" value={fmt(counters.sent)} icon={Send} color="#8b5cf6" />
                <StatCard label="Delivered" value={fmt(counters.delivered)} icon={CheckCircle2} color="#10b981" />
                <StatCard label="Read" value={fmt(counters.read)} icon={BookOpen} color="#3b82f6" />
                <StatCard label="Clicked" value={fmt(counters.clicked)} icon={MousePointerClick} color="#f59e0b" />
                <StatCard label="Failed" value={fmt(counters.failed)} icon={XCircle} color="#ef4444" />
                <StatCard label="Skipped" value={fmt(counters.skipped)} icon={XCircle} color="#6b7280" />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <RateCard label="Delivery Rate" value={rates.delivery_rate} color="#10b981" />
                <RateCard label="Open Rate" value={rates.open_rate} color="#3b82f6" />
                <RateCard label="CTR" value={rates.ctr} color="#f59e0b" />
                <RateCard label="Fail Rate" value={rates.fail_rate} color="#ef4444" />
            </div>

            {/* Funnel + Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delivery Funnel */}
                <div className="rounded-2xl p-6 space-y-5"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" style={{ color: "var(--brand-purple)" }} />
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Delivery Funnel</h2>
                    </div>
                    <div className="space-y-4">
                        <FunnelStep label="Sent" count={counters.sent} total={total} color="#8b5cf6" icon={Send} />
                        <FunnelStep label="Delivered" count={counters.delivered} total={total} color="#10b981" icon={CheckCircle2} />
                        <FunnelStep label="Read" count={counters.read} total={total} color="#3b82f6" icon={BookOpen} />
                        <FunnelStep label="Clicked" count={counters.clicked} total={total} color="#f59e0b" icon={MousePointerClick} />
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="rounded-2xl p-6 space-y-5"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" style={{ color: "var(--brand-purple)" }} />
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Recipient Status</h2>
                    </div>
                    <div className="space-y-3">
                        {Object.entries(status_breakdown ?? {}).map(([status, count]: any) => (
                            <div key={status} className="flex items-center justify-between py-2 border-b last:border-0"
                                style={{ borderColor: "var(--border)" }}>
                                <span className="text-sm font-medium capitalize" style={{ color: "var(--foreground)" }}>
                                    {status}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                                        <div className="h-full rounded-full bg-brand-purple"
                                            style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, background: "var(--brand-purple)" }} />
                                    </div>
                                    <span className="text-sm font-bold w-10 text-right tabular-nums"
                                        style={{ color: "var(--foreground)" }}>{fmt(count)}</span>
                                </div>
                            </div>
                        ))}
                        {Object.keys(status_breakdown ?? {}).length === 0 && (
                            <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>
                                No recipient data yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Hourly Send Timeline */}
            {(hourly_timeline?.length ?? 0) > 0 && (
                <div className="rounded-2xl p-6 space-y-5"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" style={{ color: "var(--brand-purple)" }} />
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                            Hourly Send Timeline <span className="text-sm font-normal ml-1" style={{ color: "var(--muted-foreground)" }}>(last 24h)</span>
                        </h2>
                    </div>
                    <div className="flex items-end gap-1 h-32">
                        {hourly_timeline.map((h: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                <div
                                    className="w-full rounded-t-sm transition-all duration-300"
                                    style={{
                                        height: `${Math.max((h.count / maxHourly) * 100, 4)}%`,
                                        background: "var(--brand-purple)",
                                        opacity: 0.75,
                                    }}
                                />
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 whitespace-nowrap
                                    text-xs px-2 py-1 rounded shadow-lg"
                                    style={{ background: "var(--card)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}>
                                    {formatTime(new Date(h.hour), 'HH:mm')} — {h.count} sent
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                        Each bar = 1 hour window
                    </p>
                </div>
            )}

            {/* Link Click Stats */}
            {(links?.length ?? 0) > 0 && (
                <div className="rounded-2xl p-6 space-y-4"
                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    <div className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" style={{ color: "var(--brand-purple)" }} />
                        <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Link Performance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs font-semibold uppercase"
                                    style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                                    <th className="text-left py-2 pr-4">URL</th>
                                    <th className="text-right py-2 px-3">Total Clicks</th>
                                    <th className="text-right py-2 pl-3">Unique Clickers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {links.map((l: any, i: number) => (
                                    <tr key={i} className="border-b last:border-0"
                                        style={{ borderColor: "var(--border)" }}>
                                        <td className="py-3 pr-4">
                                            <a href={l.original_url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 hover:underline truncate max-w-xs"
                                                style={{ color: "var(--brand-purple)" }}>
                                                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                                {l.original_url}
                                            </a>
                                        </td>
                                        <td className="py-3 px-3 text-right font-bold tabular-nums"
                                            style={{ color: "#f59e0b" }}>{fmt(l.total_clicks)}</td>
                                        <td className="py-3 pl-3 text-right font-bold tabular-nums"
                                            style={{ color: "#8b5cf6" }}>{fmt(l.unique_clickers)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Timestamps */}
            <div className="rounded-2xl p-6"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <h2 className="text-sm font-bold mb-4" style={{ color: "var(--muted-foreground)" }}>
                    CAMPAIGN TIMELINE
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {[
                        { label: "Scheduled", value: timestamps?.scheduled_at },
                        { label: "Started", value: timestamps?.started_at },
                        { label: "Completed", value: timestamps?.completed_at },
                        { label: "Last Activity", value: timestamps?.last_activity },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                                style={{ color: "var(--muted-foreground)" }}>{label}</p>
                            <p style={{ color: "var(--foreground)" }}>
                                {value ? formatDateTime(new Date(value)) : "—"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
