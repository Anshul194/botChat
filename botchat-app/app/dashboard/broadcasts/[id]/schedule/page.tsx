"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    getBroadcastReview, 
    generateRecipients, 
    regenerateRecipients,
    getBroadcastRecipients,
    scheduleBroadcast
} from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import {
    Loader2, CheckCircle2, ChevronRight, Users, MessageSquare,
    Calendar, Send, AlertCircle, Clock, Facebook, Instagram,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function ReviewAndSchedulePage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const campaignId = Number(params.id);

    const [isScheduling, setIsScheduling] = useState(false);
    const [page, setPage] = useState(1);
    const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);

    const { data: reviewData, isLoading: isLoadingReview } = useQuery({
        queryKey: ["broadcastReview", campaignId],
        queryFn: () => getBroadcastReview(campaignId),
    });

    const { data: recipientsData, isLoading: isLoadingRecipients } = useQuery({
        queryKey: ["broadcastRecipients", campaignId, page],
        queryFn: () => getBroadcastRecipients(campaignId, page),
    });

    const review = reviewData?.data;

    const generateMutation = useMutation({
        mutationFn: () => generateRecipients(campaignId),
        onSuccess: (res) => {
            toast.success(`Successfully generated ${res.total_recipients} recipients!`);
            queryClient.invalidateQueries({ queryKey: ["broadcastReview"] });
            queryClient.invalidateQueries({ queryKey: ["broadcastRecipients"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to generate recipients");
        }
    });

    const regenerateMutation = useMutation({
        mutationFn: () => regenerateRecipients(campaignId),
        onSuccess: (res) => {
            toast.success(`Successfully regenerated ${res.total_recipients} recipients!`);
            setPage(1);
            queryClient.invalidateQueries({ queryKey: ["broadcastReview"] });
            queryClient.invalidateQueries({ queryKey: ["broadcastRecipients"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to regenerate recipients");
        }
    });

    const scheduleMutation = useMutation({
        mutationFn: (data: { schedule_type: 'now' | 'later', scheduled_at?: string }) => scheduleBroadcast(campaignId, data),
        onSuccess: (res) => {
            toast.success(res.message || "Broadcast scheduled successfully!");
            router.push(`/dashboard/broadcasts/${campaignId}/monitor`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to schedule broadcast");
            setIsScheduling(false);
        }
    });

    const handleSend = () => {
        setIsScheduling(true);
        scheduleMutation.mutate({ schedule_type: 'now' });
    };

    if (isLoadingReview) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
            </div>
        );
    }

    const { audience_ready, message_ready, recipients_ready, review_passed, missing_steps, summary } = review || {};

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6">
            {/* Wizard Progress Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 glass-card rounded-xl px-5 py-4"
                style={{ border: "1px solid var(--glass-border)" }}>
                <div className="flex items-center gap-3 text-sm font-medium flex-wrap">
                    <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 className="w-4 h-4" /> Campaign</span>
                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                    <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 className="w-4 h-4" /> Audience</span>
                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                    <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 className="w-4 h-4" /> Message</span>
                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                    <span className="flex items-center gap-1.5 font-bold" style={{ color: "var(--brand-purple)" }}><Calendar className="w-4 h-4" /> Review & Schedule</span>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 md:p-8 space-y-8" style={{ border: "1px solid var(--glass-border)" }}>
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Review & Schedule Broadcast</h1>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                        {recipients_ready ? "Review your generated recipients before sending." : "Generate your recipients to lock in your audience."}
                    </p>
                </div>

                {!audience_ready || !message_ready ? (
                    <div className="p-4 rounded-xl flex gap-3 items-start" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                        <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#ef4444" }} />
                        <div>
                            <h3 className="font-semibold text-sm" style={{ color: "#ef4444" }}>Campaign is not ready</h3>
                            <ul className="mt-2 space-y-1 text-xs" style={{ color: "#ef4444" }}>
                                {missing_steps?.map((step: string, i: number) => (
                                    <li key={i}>• {step}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : !recipients_ready ? (
                     <div className="p-6 rounded-xl flex flex-col items-center justify-center gap-4 border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
                         <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                             <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                         </div>
                         <div className="text-center">
                            <h3 className="font-semibold">Generate Recipients</h3>
                            <p className="text-sm text-neutral-500 mt-1 max-w-sm">We need to lock in your audience filters and generate the list of recipients before you can send.</p>
                         </div>
                         <Button 
                            onClick={() => generateMutation.mutate()} 
                            disabled={generateMutation.isPending}
                            className="bg-brand-purple hover:bg-brand-purple/90 text-white shadow-lg shadow-brand-purple/20 mt-2"
                         >
                            {generateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Generate Recipients
                         </Button>
                     </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Audience Summary */}
                        <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
                                <Users className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Recipients Generated</p>
                                <div className="flex items-end justify-between">
                                <p className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>{summary?.audience_size?.toLocaleString() || 0}</p>
                                
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 text-xs text-neutral-500 hover:text-brand-purple"
                                    onClick={() => setIsRegenerateModalOpen(true)}
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" /> Regenerate
                                </Button>
                                
                                <ConfirmModal
                                    isOpen={isRegenerateModalOpen}
                                    onClose={() => setIsRegenerateModalOpen(false)}
                                    onConfirm={() => regenerateMutation.mutate()}
                                    title="Regenerate Recipients?"
                                    message="This will delete the current recipient list and rebuild it based on your saved audience filters. Are you sure?"
                                    confirmText="Regenerate"
                                    type="warning"
                                />
                            </div>
                        </div>

                        {/* Channel Summary */}
                        <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: summary?.channel === "facebook" ? "rgba(59,130,246,0.12)" : "rgba(236,72,153,0.12)", color: summary?.channel === "facebook" ? "#3b82f6" : "#ec4899" }}>
                                {summary?.channel === "facebook" ? <Facebook className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Platform</p>
                            <p className="text-lg font-bold capitalize" style={{ color: "var(--foreground)" }}>{summary?.channel || "Not Set"}</p>
                        </div>

                        {/* Message Summary */}
                        <div className="p-5 rounded-2xl space-y-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>Message Type</p>
                            <p className="text-lg font-bold capitalize" style={{ color: "var(--foreground)" }}>{(summary?.message_type || "Not Set").replace('_', ' ')}</p>
                        </div>
                    </div>
                )}

                {/* Recipient Table */}
                {recipients_ready && (
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-lg">Recipient Preview</CardTitle>
                            <CardDescription>First 50 generated recipients are shown here.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoadingRecipients ? (
                                <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
                            ) : recipientsData?.data?.length > 0 ? (
                                <div className="w-full overflow-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 dark:bg-neutral-900 border-b dark:border-neutral-800">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Subscriber Name</th>
                                                <th className="px-6 py-3 font-medium">PSID/IGSID</th>
                                                <th className="px-6 py-3 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                                            {recipientsData.data.map((r: any) => (
                                                <tr key={r.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                    <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">{r.subscriber_name || 'Unknown'}</td>
                                                    <td className="px-6 py-3 text-xs text-neutral-500 font-mono">{r.subscriber_id}</td>
                                                    <td className="px-6 py-3">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-sm text-neutral-500">No recipients found. Try regenerating.</div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: "var(--glass-border)" }}>
                    <Button variant="ghost" onClick={() => router.back()} disabled={isScheduling}>
                        Back to Message
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" disabled={!review_passed || isScheduling}>
                            <Clock className="w-4 h-4 mr-2" /> Schedule for Later
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!review_passed || isScheduling}
                            className="bg-brand-purple hover:bg-brand-purple/90 text-white shadow-lg shadow-brand-purple/20"
                        >
                            {isScheduling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Mark Ready to Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
