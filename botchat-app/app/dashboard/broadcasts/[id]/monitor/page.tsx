"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getBroadcastProgress,
    pauseBroadcast,
    resumeBroadcast,
    cancelBroadcast
} from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import { formatTime } from "@/lib/date";
import {
    Loader2, ArrowLeft, Play, Pause, XCircle, Send,
    CheckCircle2, AlertCircle, Clock, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function BroadcastMonitorPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const campaignId = Number(params.id);

    const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // Poll every 5 seconds for live progress
    const { data: progressData, isLoading } = useQuery({
        queryKey: ["broadcastProgress", campaignId],
        queryFn: () => getBroadcastProgress(campaignId),
        refetchInterval: 5000,
    });

    const pauseMutation = useMutation({
        mutationFn: () => pauseBroadcast(campaignId),
        onSuccess: () => {
            toast.success("Campaign paused successfully");
            queryClient.invalidateQueries({ queryKey: ["broadcastProgress"] });
            setIsPauseModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to pause campaign");
        }
    });

    const resumeMutation = useMutation({
        mutationFn: () => resumeBroadcast(campaignId),
        onSuccess: () => {
            toast.success("Campaign resumed successfully");
            queryClient.invalidateQueries({ queryKey: ["broadcastProgress"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to resume campaign");
        }
    });

    const cancelMutation = useMutation({
        mutationFn: () => cancelBroadcast(campaignId),
        onSuccess: () => {
            toast.success("Campaign cancelled successfully");
            queryClient.invalidateQueries({ queryKey: ["broadcastProgress"] });
            setIsCancelModalOpen(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to cancel campaign");
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
            </div>
        );
    }

    const progress = progressData || {};
    const { status, total = 0, sent = 0, failed = 0, skipped = 0, queued = 0, progress: percent = 0, eta } = progress;

    const isActive = status === 'sending' || status === 'queued';
    const isPaused = status === 'paused';
    const isCompleted = status === 'completed';
    const isCancelled = status === 'cancelled';

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/broadcasts')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Campaign Monitor</h1>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Live sending progress and status</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/broadcasts/${campaignId}/analytics`)}>
                        Analytics Overview
                    </Button>
                    {isActive && (
                        <Button variant="outline" className="border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800"
                            onClick={() => setIsPauseModalOpen(true)}
                        >
                            <Pause className="w-4 h-4 mr-2" /> Pause
                        </Button>
                    )}
                    {isPaused && (
                        <Button variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800"
                            onClick={() => resumeMutation.mutate()}
                            disabled={resumeMutation.isPending}
                        >
                            {resumeMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            Resume
                        </Button>
                    )}
                    {(isActive || isPaused || status === 'scheduled') && (
                        <Button variant="outline" className="border-red-200 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800"
                            onClick={() => setIsCancelModalOpen(true)}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Progress Card */}
            <div className="glass-card rounded-2xl p-6 md:p-8 space-y-8" style={{ border: "1px solid var(--glass-border)" }}>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold">Sending Progress</h2>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider
                                ${status === 'sending' ? 'bg-blue-100 text-blue-700' : ''}
                                ${status === 'queued' ? 'bg-purple-100 text-purple-700' : ''}
                                ${status === 'scheduled' ? 'bg-indigo-100 text-indigo-700' : ''}
                                ${status === 'completed' ? 'bg-emerald-100 text-emerald-700' : ''}
                                ${status === 'paused' ? 'bg-orange-100 text-orange-700' : ''}
                                ${status === 'cancelled' || status === 'failed' ? 'bg-red-100 text-red-700' : ''}
                            `}>
                                {status}
                            </span>
                        </div>
                        {eta && <p className="text-sm text-neutral-500 mt-2">Estimated completion: {formatTime(new Date(eta))}</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-bold text-brand-purple">{percent}%</p>
                        <p className="text-sm text-neutral-500 font-medium">{sent + failed + skipped} / {total} Processed</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-brand-purple transition-all duration-500 ease-in-out relative"
                        style={{ width: `${percent}%` }}
                    >
                        {isActive && (
                            <div className="absolute inset-0 bg-[var(--card)]/20 animate-pulse"></div>
                        )}
                    </div>
                </div>

                {/* Stat Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border bg-[var(--card)] dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Sent</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-2">{sent.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-[var(--card)] dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Queued</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">{queued.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-[var(--card)] dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> Failed</p>
                        <p className="text-2xl font-bold text-red-600 mt-2">{failed.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-[var(--card)] dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800">
                        <p className="text-xs font-semibold text-neutral-500 uppercase flex items-center gap-2"><XCircle className="w-3.5 h-3.5" /> Skipped</p>
                        <p className="text-2xl font-bold text-orange-600 mt-2">{skipped.toLocaleString()}</p>
                    </div>
                </div>

            </div>

            <ConfirmModal
                isOpen={isPauseModalOpen}
                onClose={() => setIsPauseModalOpen(false)}
                onConfirm={() => pauseMutation.mutate()}
                title="Pause Campaign?"
                message="In-flight messages will finish, but no new messages will be sent until you resume. Are you sure?"
                confirmText="Pause Campaign"
                type="warning"
            />

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={() => cancelMutation.mutate()}
                title="Cancel Campaign?"
                message="This will permanently stop the campaign. All remaining queued recipients will be marked as skipped. This action cannot be undone."
                confirmText="Cancel Campaign"
                type="danger"
            />

        </div>
    );
}
