"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    getAnalyticsRecipients,
    getRecipientTimeline,
    getBroadcastCampaign,
} from "@/services/messengerBroadcast.service";
import {
    Loader2, ArrowLeft, Search, X, Send, CheckCircle2, BookOpen,
    MousePointerClick, XCircle, Clock, Link2, User, ExternalLink,
    ChevronLeft, ChevronRight, BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type Recipient = {
    id: number;
    subscriber_id: string;
    subscriber_name: string;
    channel_type: string;
    status: string;
    facebook_message_id: string | null;
    failure_reason: string | null;
    sent_at: string | null;
    delivered_at: string | null;
    read_at: string | null;
    clicked_at: string | null;
    last_event_at: string | null;
};

type TimelineEvent = {
    id: number;
    event_type: string;
    occurred_at: string;
    meta: Record<string, any>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
    pending:   { label: "Pending",   color: "#6b7280", bg: "#f3f4f6", Icon: Clock },
    sent:      { label: "Sent",      color: "#8b5cf6", bg: "#ede9fe", Icon: Send },
    delivered: { label: "Delivered", color: "#10b981", bg: "#d1fae5", Icon: CheckCircle2 },
    read:      { label: "Read",      color: "#3b82f6", bg: "#dbeafe", Icon: BookOpen },
    clicked:   { label: "Clicked",   color: "#f59e0b", bg: "#fef3c7", Icon: MousePointerClick },
    failed:    { label: "Failed",    color: "#ef4444", bg: "#fee2e2", Icon: XCircle },
    skipped:   { label: "Skipped",   color: "#6b7280", bg: "#f3f4f6", Icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    const { label, color, bg, Icon } = cfg;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ color, background: bg }}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}

const fmtTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "—";

// ─── Timeline Modal ───────────────────────────────────────────────────────────

function TimelineModal({
    campaignId,
    recipient,
    onClose,
}: {
    campaignId: number;
    recipient: Recipient;
    onClose: () => void;
}) {
    const { data, isLoading } = useQuery({
        queryKey: ["recipientTimeline", campaignId, recipient.id],
        queryFn: () => getRecipientTimeline(campaignId, recipient.id),
    });

    const timeline = data?.data;
    const events: TimelineEvent[] = timeline?.events ?? [];
    const links: any[] = timeline?.links ?? [];

    const EVENT_ICONS: Record<string, any> = {
        sent: Send,
        delivered: CheckCircle2,
        read: BookOpen,
        clicked: MousePointerClick,
        failed: XCircle,
        skipped: XCircle,
    };

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
        >
            {/* Modal */}
            <div
                className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
                style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 px-6 py-5 flex items-start justify-between"
                    style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                    <div>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" style={{ color: "var(--brand-purple)" }} />
                            <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                                {recipient.subscriber_name || recipient.subscriber_id}
                            </h2>
                        </div>
                        <StatusBadge status={recipient.status} />
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:opacity-70">
                        <X className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
                        </div>
                    ) : (
                        <>
                            {/* Recipient Meta */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: "Subscriber ID", value: recipient.subscriber_id },
                                    { label: "Channel", value: recipient.channel_type },
                                    { label: "Message ID", value: recipient.facebook_message_id || "—" },
                                    { label: "Failure", value: recipient.failure_reason || "—" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-xl p-3"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                                            style={{ color: "var(--muted-foreground)" }}>{label}</p>
                                        <p className="font-medium truncate" style={{ color: "var(--foreground)" }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Event Timeline */}
                            <div>
                                <h3 className="text-sm font-bold mb-4 flex items-center gap-2"
                                    style={{ color: "var(--foreground)" }}>
                                    <Clock className="w-4 h-4" style={{ color: "var(--brand-purple)" }} />
                                    Event Timeline
                                </h3>
                                {events.length === 0 ? (
                                    <p className="text-sm text-center py-4"
                                        style={{ color: "var(--muted-foreground)" }}>No events recorded yet</p>
                                ) : (
                                    <div className="relative pl-6 space-y-0">
                                        {/* Vertical line */}
                                        <div className="absolute left-2 top-2 bottom-2 w-px"
                                            style={{ background: "var(--border)" }} />

                                        {events.map((ev, idx) => {
                                            const cfg = STATUS_CONFIG[ev.event_type] ?? STATUS_CONFIG.sent;
                                            const Icon = EVENT_ICONS[ev.event_type] ?? Send;
                                            return (
                                                <div key={ev.id} className="relative flex gap-4 pb-5 last:pb-0">
                                                    {/* Dot */}
                                                    <div className="absolute -left-4 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                                                        style={{ background: cfg.bg, border: `2px solid ${cfg.color}` }}>
                                                        <Icon className="w-2.5 h-2.5" style={{ color: cfg.color }} />
                                                    </div>

                                                    <div className="flex-1 rounded-xl p-3"
                                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <span className="text-sm font-semibold capitalize"
                                                                style={{ color: cfg.color }}>{ev.event_type}</span>
                                                            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                                                {fmtTime(ev.occurred_at)}
                                                            </span>
                                                        </div>
                                                        {ev.meta && Object.keys(ev.meta).length > 0 && (
                                                            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                                                                {JSON.stringify(ev.meta)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Links */}
                            {links.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2"
                                        style={{ color: "var(--foreground)" }}>
                                        <Link2 className="w-4 h-4" style={{ color: "var(--brand-purple)" }} />
                                        Clicked Links
                                    </h3>
                                    <div className="space-y-2">
                                        {links.map((l: any) => (
                                            <div key={l.id} className="rounded-xl p-3 flex items-start gap-3"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                                <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5"
                                                    style={{ color: "var(--brand-purple)" }} />
                                                <div className="flex-1 min-w-0">
                                                    <a href={l.original_url} target="_blank" rel="noopener noreferrer"
                                                        className="text-xs hover:underline truncate block"
                                                        style={{ color: "var(--brand-purple)" }}>
                                                        {l.original_url}
                                                    </a>
                                                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                                                        {l.click_count} click{l.click_count !== 1 ? "s" : ""}
                                                        {l.first_clicked_at && ` · First: ${fmtTime(l.first_clicked_at)}`}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold"
                                                    style={{ color: "#f59e0b" }}>{l.click_count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Status Filter Tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
    { value: "", label: "All" },
    { value: "sent", label: "Sent" },
    { value: "delivered", label: "Delivered" },
    { value: "read", label: "Read" },
    { value: "clicked", label: "Clicked" },
    { value: "failed", label: "Failed" },
    { value: "skipped", label: "Skipped" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BroadcastRecipientsReportPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = Number(params.id);

    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

    const { data: campaignRes } = useQuery({
        queryKey: ["broadcastCampaign", campaignId],
        queryFn: () => getBroadcastCampaign(campaignId),
    });

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["analyticsRecipients", campaignId, statusFilter, search, page],
        queryFn: () => getAnalyticsRecipients(campaignId, {
            status: statusFilter || undefined,
            search: search || undefined,
            page,
            per_page: 25,
        }),
        keepPreviousData: true,
    } as any);

    const recipients: Recipient[] = data?.data ?? [];
    const meta = data?.meta ?? {};

    const handleSearch = useCallback(() => {
        setSearch(searchInput);
        setPage(1);
    }, [searchInput]);

    const clearSearch = () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon"
                        onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/analytics`)}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                            {campaignRes?.data?.name ?? "Campaign"} — Recipients
                        </h1>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            Per-recipient delivery tracking &amp; timeline
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm"
                    onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/analytics`)}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Analytics Overview
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "var(--muted-foreground)" }} />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search by name or PSID…"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
                        style={{
                            background: "var(--glass-bg)",
                            border: "1px solid var(--glass-border)",
                            color: "var(--foreground)",
                        }}
                    />
                    {searchInput && (
                        <button onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <Button size="sm" onClick={handleSearch}>Search</Button>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={statusFilter === tab.value ? {
                            background: "var(--brand-purple)",
                            color: "#fff",
                        } : {
                            background: "var(--glass-bg)",
                            border: "1px solid var(--glass-border)",
                            color: "var(--muted-foreground)",
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
                    </div>
                ) : recipients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <User className="w-10 h-10 opacity-30" />
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                            No recipients found
                            {statusFilter && ` with status "${statusFilter}"`}
                            {search && ` matching "${search}"`}
                        </p>
                    </div>
                ) : (
                    <>
                        {isFetching && (
                            <div className="px-4 py-2 flex items-center gap-2 text-xs border-b"
                                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                                <Loader2 className="w-3 h-3 animate-spin" /> Refreshing…
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs font-semibold uppercase"
                                        style={{ color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>
                                        <th className="text-left px-4 py-3">Subscriber</th>
                                        <th className="text-left px-4 py-3">Status</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Sent</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Delivered</th>
                                        <th className="text-left px-4 py-3 hidden lg:table-cell">Read</th>
                                        <th className="text-left px-4 py-3 hidden lg:table-cell">Clicked</th>
                                        <th className="text-right px-4 py-3">Timeline</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipients.map((r) => (
                                        <tr key={r.id}
                                            className="border-b last:border-0 hover:opacity-80 transition-opacity"
                                            style={{ borderColor: "var(--border)" }}>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium" style={{ color: "var(--foreground)" }}>
                                                        {r.subscriber_name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs font-mono mt-0.5"
                                                        style={{ color: "var(--muted-foreground)" }}>
                                                        {r.subscriber_id}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={r.status} />
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-xs"
                                                style={{ color: "var(--muted-foreground)" }}>
                                                {fmtTime(r.sent_at)}
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell text-xs"
                                                style={{ color: "var(--muted-foreground)" }}>
                                                {fmtTime(r.delivered_at)}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-xs"
                                                style={{ color: "var(--muted-foreground)" }}>
                                                {fmtTime(r.read_at)}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-xs"
                                                style={{ color: "var(--muted-foreground)" }}>
                                                {fmtTime(r.clicked_at)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => setSelectedRecipient(r)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                                                    style={{
                                                        background: "var(--brand-purple)",
                                                        color: "#fff",
                                                    }}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {meta.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t"
                                style={{ borderColor: "var(--border)" }}>
                                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                    Page {meta.current_page} of {meta.last_page} · {meta.total?.toLocaleString()} total
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"
                                        disabled={page <= 1}
                                        onClick={() => setPage(p => p - 1)}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="sm"
                                        disabled={page >= meta.last_page}
                                        onClick={() => setPage(p => p + 1)}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Timeline Modal */}
            {selectedRecipient && (
                <TimelineModal
                    campaignId={campaignId}
                    recipient={selectedRecipient}
                    onClose={() => setSelectedRecipient(null)}
                />
            )}
        </div>
    );
}
