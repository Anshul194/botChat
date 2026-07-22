"use client";

import { useState, useEffect } from "react";
import { 
    X, BarChart3, Clock, RefreshCw, 
    MessageSquare, User, Calendar, 
    ExternalLink, CheckCircle2, AlertCircle,
    ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface ReportSummary {
    total: number;
    success: number;
    failed: number;
    campaign?: {
        id: number;
        campaign_name: string;
        status: string;
        comment_type: string;
        schedule_type: string;
        template?: {
            name: string;
            messages: string[];
        }
    }
}

interface ReportItem {
    id: number;
    post_id: string;
    comment_message: string;
    comment_id: string;
    commented_at: string;
    status: string;
    error_message?: string;
}

interface CommentReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: "facebook" | "instagram";
    postId: string;
    pageId: string;
}

export function CommentReportModal({ 
    isOpen, 
    onClose, 
    platform,
    postId,
    pageId
}: CommentReportModalProps) {
    const { showModal } = useModal();
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [meta, setMeta] = useState<{ current_page: number, last_page: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (isOpen && postId) {
            fetchReport();
        }
    }, [isOpen, postId]);

    const fetchReport = async (pageNum = 1) => {
        setIsLoading(true);
        try {
            const endpoint = platform === "facebook" 
                ? `/facebook/post-auto-comment/${postId}/report` 
                : `/instagram/post-auto-comment/${postId}/report`;
            
            const res = await api.get(`${endpoint}?page_id=${pageId}&page=${pageNum}&platform=${platform}`);
            setReports(Array.isArray(res.data?.data) ? res.data.data : []);
            if (res.data?.summary) {
                setSummary(res.data.summary);
            }
            if (res.data?.meta) {
                setMeta(res.data.meta);
                setPage(pageNum);
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-2xl w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col h-full max-h-full sm:max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-inner">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">Campaign Execution Report</h2>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-2 border-l-2 border-emerald-500 pl-3 ml-0.5">Automated Lifecycle Analytics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => fetchReport()} className="p-3 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-neutral-400">
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-neutral-400 hover:text-rose-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[var(--card)] dark:bg-neutral-900">
                    
                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Hits</p>
                                <h4 className="text-2xl font-black text-indigo-600 tracking-tight">{summary.total}</h4>
                            </div>
                            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Successful</p>
                                <h4 className="text-2xl font-black text-emerald-600 tracking-tight">{summary.success}</h4>
                            </div>
                            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 col-span-2 sm:col-span-1">
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Failed</p>
                                <h4 className="text-2xl font-black text-rose-600 tracking-tight">{summary.failed}</h4>
                            </div>
                        </div>
                    )}

                    {summary?.campaign && (
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                    {summary.campaign.campaign_name}
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest",
                                    summary.campaign.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                )}>
                                    {summary.campaign.status}
                                </div>
                            </div>
                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                Mode: <span className="text-neutral-900 dark:text-white">{summary.campaign.comment_type}</span>
                            </div>
                        </div>
                    )}

                    {summary?.campaign?.template?.messages && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Planned Messages</h3>
                            <div className="flex flex-wrap gap-2 px-2">
                                {summary.campaign.template.messages.map((msg, idx) => (
                                    <div key={idx} className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                                        {msg.replace(/"/g, '')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Interaction History</h3>
                        {isLoading && reports.length === 0 ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-neutral-50 dark:bg-neutral-800/50 rounded-3xl animate-pulse border border-neutral-100 dark:border-neutral-800" />
                                ))}
                            </div>
                        ) : reports.length > 0 ? (
                            reports.map((item) => (
                                <div key={item.id} className="group p-5 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800 hover:border-emerald-500/30 transition-all hover:bg-[var(--card)] dark:hover:bg-neutral-900 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--card)] dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                                <MessageSquare className="w-5 h-5 text-emerald-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed italic">
                                                    "{item.comment_message ?? '-'}"
                                                </p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    {item.commented_at && (
                                                        <>
                                                            <div className="flex items-center gap-1.5 text-neutral-400">
                                                                <Calendar size={12} className="text-neutral-300" />
                                                                <span className="text-[10px] font-black uppercase tracking-tight">
                                                                    {new Date(item.commented_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-neutral-400 border-l border-neutral-200 dark:border-neutral-800 pl-4">
                                                                <Clock size={12} className="text-neutral-300" />
                                                                <span className="text-[10px] font-black uppercase tracking-tight">
                                                                    {new Date(item.commented_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                                                item.status === "success" || !item.error_message
                                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                    : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                            )}>
                                                {(item.status === "success" || !item.error_message) ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                                {(item.status === "success" || !item.error_message) ? "Deployed" : "Failed"}
                                            </div>
                                            {item.comment_id && (
                                                <a 
                                                    href={`https://facebook.com/${item.comment_id}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                                                >
                                                    View Source <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {item.error_message && (
                                        <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[11px] font-medium text-rose-500/80 flex items-center gap-2">
                                            <AlertCircle size={12} />
                                            {item.error_message}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
                                    <BarChart3 className="w-10 h-10" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">Analytics Empty</h3>
                                <p className="text-[11px] font-bold mt-2 text-neutral-400 max-w-[200px] mx-auto uppercase">No recorded interactions for this campaign lifecycle yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {meta && meta.last_page > 1 && (
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={page <= 1 || isLoading}
                                    onClick={() => fetchReport(page - 1)}
                                    className="px-4 py-2 rounded-xl bg-[var(--card)] dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary transition-all disabled:opacity-30"
                                >
                                    Back
                                </button>
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] px-3">
                                    Page {meta.current_page} <span className="text-neutral-300">/</span> {meta.last_page}
                                </span>
                                <button 
                                    disabled={page >= meta.last_page || isLoading}
                                    onClick={() => fetchReport(page + 1)}
                                    className="px-4 py-2 rounded-xl bg-[var(--card)] dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary transition-all disabled:opacity-30"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 rounded-2xl bg-[var(--card)] dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 transition-all active:scale-95 shadow-sm"
                    >
                        Close Analytics
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
