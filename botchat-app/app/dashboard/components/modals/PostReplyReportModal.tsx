"use client";

import { useState, useEffect } from "react";
import { 
    X, BarChart3, Clock, RefreshCw, 
    MessageSquare, User, Calendar, 
    ExternalLink, CheckCircle2, AlertCircle,
    Instagram, Facebook, MessageCircle
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
        name: string;
        status: string;
        reply_type: string;
    }
}

interface ReportItem {
    id: number;
    comment_id: string;
    comment_text: string;
    reply_text: string;
    reply_id: string;
    status: string;
    created_at: string;
    error_message?: string;
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
                ? `/facebook/comment-manager/post-auto-reply/report/${postId}` 
                : `/instagram/comment-manager/post-auto-reply/report/${postId}`;
            
            const res = await api.get(`${endpoint}?platform=${platform}&instagram_id=${instagramId}`);
            
            if (res.data.success || res.data.is_success) {
                const results = res.data.data?.results || res.data.data || [];
                setReports(Array.isArray(results) ? results : []);
                if (res.data.data?.summary) {
                    setSummary(res.data.data.summary);
                } else {
                    // Fallback summary
                    const total = results.length;
                    const success = results.filter((r: any) => r.status === "success" || !r.error_message).length;
                    setSummary({
                        total,
                        success,
                        failed: total - success,
                        campaign: res.data.data?.campaign
                    });
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Auto Reply Report</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                {platform === 'instagram' ? <Instagram size={10} /> : <Facebook size={10} />}
                                {platform} Campaign Lifecycle
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => fetchReport()} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400">
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-slate-400 hover:text-rose-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-slate-900">
                    
                    {/* Summary Stats */}
                    {summary && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Hits</p>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{summary.total}</h4>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Successful</p>
                                <h4 className="text-xl font-bold text-emerald-600 tracking-tight">{summary.success}</h4>
                            </div>
                            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10">
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Failed</p>
                                <h4 className="text-xl font-bold text-rose-600 tracking-tight">{summary.failed}</h4>
                            </div>
                        </div>
                    )}

                    {summary?.campaign && (
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                                    {summary.campaign.name}
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
                                    summary.campaign.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                )}>
                                    {summary.campaign.status}
                                </div>
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Type: <span className="text-slate-900 dark:text-white">{summary.campaign.reply_type}</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Interaction History</h3>
                        {isLoading && reports.length === 0 ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
                                ))}
                            </div>
                        ) : reports.length > 0 ? (
                            <div className="space-y-3">
                                {reports.map((item) => (
                                    <div key={item.id} className="group p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 hover:border-pink-500/30 transition-all hover:bg-white dark:hover:bg-slate-800/40 shadow-sm">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare className="w-5 h-5 text-pink-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comment</p>
                                                        <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400 italic">
                                                            "{item.comment_text}"
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 p-3 rounded-xl bg-pink-50/50 dark:bg-pink-500/5 border border-pink-100/50 dark:border-pink-500/10">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <MessageCircle className="w-3 h-3 text-pink-500" />
                                                            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest">Reply Sent</span>
                                                        </div>
                                                        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                                            {item.reply_text}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <Calendar size={12} className="text-slate-300" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                                                {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-4">
                                                            <Clock size={12} className="text-slate-300" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                                                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                                                    item.status === "success" || !item.error_message
                                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                        : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                                )}>
                                                    {(item.status === "success" || !item.error_message) ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                                    {(item.status === "success" || !item.error_message) ? "Success" : "Failed"}
                                                </div>
                                                {item.reply_id && (
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        ID: {item.reply_id.slice(0, 8)}...
                                                    </div>
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
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 text-center opacity-40">
                                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                    <BarChart3 className="w-8 h-8" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">Analytics Empty</h3>
                                <p className="text-[10px] font-bold mt-2 text-slate-400 max-w-[200px] mx-auto uppercase">No recorded interactions for this post yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-pink-600 transition-all active:scale-95 shadow-sm"
                    >
                        Close Analytics
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
