"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getBroadcastProgress,
    pauseBroadcast,
    resumeBroadcast,
    retryBroadcast,
    cancelBroadcast,
} from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import { formatTime } from "@/lib/date";
import {
    Loader2, ArrowLeft, Play, Pause, XCircle, Send,
    CheckCircle2, AlertCircle, Clock, RefreshCw, BarChart2,
    Ban, AlertTriangle, Hourglass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
    draft:     { label: "Draft",     color: "#6b7280", bg: "#f3f4f6", Icon: Clock },
    scheduled: { label: "Scheduled", color: "#6366f1", bg: "#e0e7ff", Icon: Hourglass },
    ready:     { label: "Ready",     color: "#8b5cf6", bg: "#ede9fe", Icon: Clock },
    queued:    { label: "Queued",    color: "#3b82f6", bg: "#dbeafe", Icon: Clock },
    sending:   { label: "Sending",   color: "#3b82f6", bg: "#dbeafe", Icon: Send },
    paused:    { label: "Paused",    color: "#f59e0b", bg: "#fef3c7", Icon: Pause },
    completed: { label: "Completed", color: "#10b981", bg: "#d1fae5", Icon: CheckCircle2 },
    failed:    { label: "Failed",    color: "#ef4444", bg: "#fee2e2", Icon: AlertCircle },
    cancelled: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6", Icon: Ban },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
    const { label, color, bg, Icon } = cfg;
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ color, background: bg }}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}

function StatCard({ label, value, color, Icon }: { label: string; value: number; color: string; Icon: any }) {
    return (
        <div className="p-4 rounded-2xl flex flex-col gap-2"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" style={{ color }} />
                <p className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--muted-foreground)" }}>{label}</p>
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value.toLocaleString()}</p>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function BroadcastMonitorPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const campaignId = Number(params.id);

    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);

    // Poll every 4 s; auto-stop on terminal states
    const { data: progressData, isLoading } = useQuery({
        queryKey: ["broadcastProgress", campaignId],
        queryFn: () => getBroadcastProgress(campaignId),
        refetchInterval: (query: any) => {
            const s = query.state?.data?.status;
            return ["completed", "cancelled", "failed"].includes(s) ? false : 4000;
        },
    });

    const p = (progressData || {}) as any;
    const {
        status,
        campaign_name,
        total = 0, sent = 0, failed = 0, skipped = 0, queued = 0,
        progress: percent = 0, eta,
        can_pause = false, can_resume = false, can_retry = false, can_cancel = false,
    } = p;

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["broadcastProgress", campaignId] });

    const pauseMutation = useMutation({
        mutationFn: () => pauseBroadcast(campaignId),
        onSuccess: () => { toast.success("Campaign paused."); setIsPauseModalOpen(false); invalidate(); },
        onError: (e: any) => { toast.error(e.response?.data?.message || "Failed to pause"); setIsPauseModalOpen(false); },
    });

    const resumeMutation = useMutation({
        mutationFn: () => resumeBroadcast(campaignId),
        onSuccess: (r: any) => { toast.success(r.message || "Campaign resumed!"); invalidate(); },
        onError: (e: any) => { toast.error(e.response?.data?.message || "Failed to resume"); },
    });

    const retryMutation = useMutation({
        mutationFn: () => retryBroadcast(campaignId),
        onSuccess: (r: any) => { toast.success(r.message || "Campaign re-queued!"); setIsRetryModalOpen(false); invalidate(); },
        onError: (e: any) => { toast.error(e.response?.data?.message || "Failed to retry"); setIsRetryModalOpen(false); },
    });

    const cancelMutation = useMutation({
        mutationFn: () => cancelBroadcast(campaignId),
        onSuccess: (r: any) => { toast.success(r.message || "Campaign cancelled."); setIsCancelModalOpen(false); invalidate(); },
        onError: (e: any) => { toast.error(e.response?.data?.message || "Failed to cancel"); setIsCancelModalOpen(false); },
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
            </div>
        );
    }

    const isActiveStatus = ["sending", "queued"].includes(status);
    const barColor = status === "failed" ? "#ef4444"
        : status === "paused" ? "#f59e0b"
        : status === "completed" ? "#10b981"
        : "var(--brand-purple)";

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/broadcasts')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
                            {campaign_name || "Campaign Monitor"}
                        </h1>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Live sending progress and status</p>
                    </div>
                </div>

                {/* ── Action buttons — driven by backend can_* flags ── */}
                <div className="flex flex-wrap gap-2 items-center">
                    <Button variant="outline" size="sm"
                        onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/analytics`)}>
                        <BarChart2 className="w-4 h-4 mr-2" />Analytics
                    </Button>

                    {can_pause && (
                        <button
                            onClick={() => setIsPauseModalOpen(true)}
                            disabled={pauseMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}
                        >
                            {pauseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
                            Pause
                        </button>
                    )}

                    {can_resume && (
                        <button
                            onClick={() => resumeMutation.mutate()}
                            disabled={resumeMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7" }}
                        >
                            {resumeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Resume
                        </button>
                    )}

                    {can_retry && (
                        <button
                            onClick={() => setIsRetryModalOpen(true)}
                            disabled={retryMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ background: "var(--brand-purple)", color: "#fff" }}
                        >
                            {retryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Retry Campaign
                        </button>
                    )}

                    {can_cancel && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            disabled={cancelMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                            style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}
                        >
                            {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* ── Progress card ── */}
            <div className="rounded-2xl p-6 md:p-8 space-y-7"
                style={{ border: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>

                {/* Status + % */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                        <StatusBadge status={status} />
                        {eta && (
                            <p className="text-sm flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                                <Clock className="w-3.5 h-3.5" />
                                Estimated completion: {formatTime(new Date(eta))}
                            </p>
                        )}
                        {status === "paused" && (
                            <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>
                                Campaign is paused — click Resume to continue sending.
                            </p>
                        )}
                        {status === "failed" && (
                            <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                                Campaign failed — click Retry to re-process failed recipients.
                            </p>
                        )}
                        {status === "completed" && (
                            <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                                Campaign completed successfully!
                            </p>
                        )}
                        {status === "cancelled" && (
                            <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
                                Campaign was cancelled.
                            </p>
                        )}
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-5xl font-bold" style={{ color: "var(--brand-purple)" }}>{percent}%</p>
                        <p className="text-sm font-medium mt-1" style={{ color: "var(--muted-foreground)" }}>
                            {(sent + failed + skipped).toLocaleString()} / {total.toLocaleString()} Processed
                        </p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${percent}%`,
                            background: barColor,
                            ...(isActiveStatus ? { animation: "pulse 2s ease-in-out infinite" } : {}),
                        }}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Sent"    value={sent}    color="#10b981" Icon={Send} />
                    <StatCard label="Queued"  value={queued}  color="#3b82f6" Icon={Clock} />
                    <StatCard label="Failed"  value={failed}  color="#ef4444" Icon={AlertCircle} />
                    <StatCard label="Skipped" value={skipped} color="#f59e0b" Icon={XCircle} />
                </div>

                {/* Failed recipients alert */}
                {status === "failed" && failed > 0 && (
                    <div className="flex gap-3 items-start rounded-xl px-4 py-3"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>
                                {failed.toLocaleString()} recipients could not be reached
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#ef4444", opacity: 0.8 }}>
                                Common cause: Meta 24-hour messaging window policy. Click "Retry Campaign" to
                                re-attempt, or view the Recipients Report for per-recipient error details.
                            </p>
                            <button
                                className="text-xs font-bold mt-2 underline underline-offset-2"
                                style={{ color: "#ef4444" }}
                                onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/analytics/recipients`)}
                            >
                                View Recipients Report →
                            </button>
                        </div>
                    </div>
                )}

                {/* Paused hint */}
                {status === "paused" && queued > 0 && (
                    <div className="flex gap-3 items-start rounded-xl px-4 py-3"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                        <Pause className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                        <p className="text-sm" style={{ color: "#92400e" }}>
                            <strong>{queued.toLocaleString()}</strong> recipients are waiting. Click <strong>Resume</strong> to continue sending.
                        </p>
                    </div>
                )}
            </div>

            {/* ── Modals ── */}
            <ConfirmModal
                isOpen={isPauseModalOpen}
                onClose={() => setIsPauseModalOpen(false)}
                onConfirm={() => pauseMutation.mutate()}
                title="Pause Campaign?"
                message="In-flight messages will finish, but no new messages will be sent until you resume. You can resume at any time."
                confirmText={pauseMutation.isPending ? "Pausing..." : "Pause Campaign"}
                type="warning"
            />

            <ConfirmModal
                isOpen={isRetryModalOpen}
                onClose={() => setIsRetryModalOpen(false)}
                onConfirm={() => retryMutation.mutate()}
                title="Retry Campaign?"
                message="All failed and skipped recipients will be re-processed. Recipients already marked as 'sent' will NOT be messaged again."
                confirmText={retryMutation.isPending ? "Retrying..." : "Retry Campaign"}
                type="warning"
            />

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={() => cancelMutation.mutate()}
                title="Cancel Campaign?"
                message="This will permanently stop the campaign. All remaining queued recipients will be marked as skipped. This action cannot be undone."
                confirmText={cancelMutation.isPending ? "Cancelling..." : "Cancel Campaign"}
                type="danger"
            />
        </div>
    );
}

