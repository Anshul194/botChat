"use client";

import { useState, useEffect } from "react";
import {
    X, BarChart3, Clock, RefreshCw,
    MessageSquare, User, Calendar,
    ExternalLink, CheckCircle2, AlertCircle,
    Instagram, Facebook, MessageCircle, EyeOff, Trash2, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface ReportSummary {
    total: number;
    success: number;
    failed: number;
    hidden: number;
    deleted: number;
    private_replies: number;
    campaign?: {
        id: number;
        name: string;
        status: string;
        reply_type: string;
    }
}

interface ReportItem {
    id: number;
    comment_id: string;
    commenter_id: string;
    comment_text: string;
    reply_message: string;
    reply_type: string;
    status: string;
    is_hidden: boolean;
    is_deleted: boolean;
    created_at: string;
}

interface PostReplyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: "facebook" | "instagram";
    postId: string;
    instagramId?: string; // or pageId for facebook
}

export function PostReplyReportModal({
    isOpen,
    onClose,
    platform,
    postId,
    instagramId
}: PostReplyReportModalProps) {
    const { showModal } = useModal();
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [campaignInfo, setCampaignInfo] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            fetchReport();
        }
    }, [isOpen, postId]);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-reply/${postId}/report`
                : `/instagram/post-auto-reply/${postId}/report`;

            const res = await api.get(`${endpoint}?platform=${platform}&instagram_id=${instagramId}`);

            if (res.data.success || res.data.is_success) {
                const data = res.data.data || {};

                // The API returns 'logs' (paginated items) as the interaction list
                const logItems = data.logs || data.results || [];
                setReports(Array.isArray(logItems) ? logItems : []);

                // Campaign info
                setCampaignInfo(data.campaign_info || null);

                // The API returns a 'summary' object with these keys:
                // total_comments, comment_replies, private_replies, hidden_comments, deleted_comments
                const apiSummary = data.summary;
                if (apiSummary) {
                    const total = apiSummary.total_comments ?? 0;
                    const commentReplies = apiSummary.comment_replies ?? 0;
                    const privateReplies = apiSummary.private_replies ?? 0;
                    const successCount = commentReplies + privateReplies;
                    setSummary({
                        total,
                        success: successCount,
                        failed: total - successCount,
                        hidden: apiSummary.hidden_comments ?? 0,
                        deleted: apiSummary.deleted_comments ?? 0,
                        private_replies: privateReplies,
                        campaign: data.campaign_info?.template ? {
                            id: data.campaign_info.id,
                            name: data.campaign_info.template?.name || 'Campaign',
                            status: data.campaign_info.status,
                            reply_type: data.campaign_info.template?.reply_type || '',
                        } : undefined,
                    });
                } else {
                    // Fallback: compute from logs
                    const total = logItems.length;
                    const success = logItems.filter((r: ReportItem) => r.status === 'sent').length;
                    setSummary({ total, success, failed: total - success, hidden: 0, deleted: 0, private_replies: 0 });
                }
            }
        } catch (error) {
            console.error("Fetch Report Error:", error);
            showModal("error", "Error", "Failed to load report data");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-[var(--card)] dark:bg-[var(--background)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-[var(--border)] dark:border-[var(--border)] flex items-center justify-between bg-[var(--muted)]/50 dark:bg-[var(--background)]/80">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/100/10 text-[var(--primary)] flex items-center justify-center">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-md font-bold text-[var(--foreground)] dark:text-white uppercase tracking-tight leading-none">Auto Reply Report</h2>
                            <p className="text-[10px] text-[var(--muted-foreground)]/70 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                {platform === 'instagram' ? <Instagram size={10} /> : <Facebook size={10} />}
                                {platform} Campaign Lifecycle
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchReport()} className="p-2 rounded-xl hover:bg-[var(--muted)]/60 dark:hover:bg-[var(--muted)] transition-all text-[var(--muted-foreground)]/70">
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-[var(--muted-foreground)]/70 hover:text-rose-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[var(--card)] dark:bg-[var(--background)]">

                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-4 rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]">
                                <p className="text-[10px] font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest mb-1">Total Hits</p>
                                <h4 className="text-2xl font-bold text-[var(--foreground)] dark:text-white tracking-tight">{summary.total}</h4>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Successful</p>
                                <h4 className="text-2xl font-bold text-emerald-600 tracking-tight">{summary.success}</h4>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Failed</p>
                                <h4 className="text-2xl font-bold text-rose-600 tracking-tight">{summary.failed}</h4>
                            </div>
                            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10">
                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Hidden</p>
                                <h4 className="text-2xl font-bold text-amber-600 tracking-tight">{summary.hidden}</h4>
                            </div>
                        </div>
                    )}

                    {summary?.campaign && (
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest border border-[var(--border)] dark:border-[var(--border)]">
                                    {summary.campaign.name}
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                                    summary.campaign.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                )}>
                                    {summary.campaign.status}
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest">
                                Type: <span className="text-[var(--foreground)] dark:text-white">{summary.campaign.reply_type}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest ml-2">Interaction History</h3>
                        {isLoading && reports.length === 0 ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 rounded-2xl animate-pulse border border-[var(--border)] dark:border-[var(--border)]" />
                                ))}
                            </div>
                        ) : reports.length > 0 ? (
                            <div className="space-y-3">
                                {reports.map((item, idx) => (
                                    <div key={item.id ?? idx} className="group p-4 rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--muted)]/20 border border-[var(--border)] dark:border-[var(--border)] hover:border-[var(--primary)]/30 transition-all hover:bg-[var(--card)] dark:hover:bg-[var(--muted)]/30 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--card)] dark:bg-[var(--muted)] border border-[var(--border)] dark:border-[var(--border)] flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest">Comment</p>
                                                        <p className="text-[13px] font-medium text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/70 italic">
                                                            &ldquo;{item.comment_text || <span className="opacity-40">No text</span>}&rdquo;
                                                        </p>
                                                    </div>
                                                    {item.reply_message && (
                                                        <div className="mt-3 p-3 rounded-xl bg-[var(--primary)]/10/50 dark:bg-[var(--primary)]/100/5 border border-pink-100/50 dark:border-[var(--primary)]/10">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <MessageCircle className="w-3 h-3 text-[var(--primary)]" />
                                                                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest">
                                                                    {item.reply_type === 'private' ? 'DM Sent' : 'Reply Sent'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[13px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] leading-relaxed">
                                                                {item.reply_message}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                                                        {item.created_at && (
                                                            <>
                                                                <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]/70">
                                                                    <Calendar size={12} className="text-[var(--muted-foreground)]/50" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                                                        {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]/70 border-l border-[var(--border)] dark:border-[var(--border)] pl-4">
                                                                    <Clock size={12} className="text-[var(--muted-foreground)]/50" />
                                                                    <span className="text-[10px] font-bold uppercase tracking-tight">
                                                                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                        {item.reply_type && (
                                                            <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]/70 border-l border-[var(--border)] dark:border-[var(--border)] pl-4">
                                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]">{item.reply_type}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                                                    item.status === "sent"
                                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                                )}>
                                                    {item.status === "sent" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                                    {item.status === "sent" ? "Sent" : "Failed"}
                                                </div>
                                                {item.is_hidden && (
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                                                        <EyeOff size={10} /> Hidden
                                                    </div>
                                                )}
                                                {item.is_deleted && (
                                                    <div className="flex items-center gap-1 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                                                        <Trash2 size={10} /> Deleted
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <div className="w-16 h-16 rounded-full bg-[var(--muted)]/50 dark:bg-[var(--muted)] flex items-center justify-center mb-6">
                                    <BarChart3 className="w-8 h-8" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)] dark:text-white">Analytics Empty</h3>
                                <p className="text-[10px] font-bold mt-2 text-[var(--muted-foreground)]/70 max-w-[200px] mx-auto uppercase">No recorded interactions for this post yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border)] dark:border-[var(--border)] bg-[var(--muted)]/50 dark:bg-[var(--background)]/80 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl bg-[var(--card)] dark:bg-[var(--muted)] border border-[var(--border)] dark:border-[var(--border)] text-[11px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all active:scale-95 shadow-sm"
                    >
                        Close Analytics
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
