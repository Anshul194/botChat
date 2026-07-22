"use client";

import { useState, useEffect } from "react";
import { 
    X, BarChart3, RefreshCw, Megaphone, 
    MessageSquare, Layers, Calendar, 
    AlertCircle, CheckCircle2, MoreHorizontal,
    ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface CampaignReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportType: "auto-reply" | "auto-comment" | "full-page-reply";
    platform: "facebook" | "instagram";
    pageId: string;
}

export function CampaignReportModal({ 
    isOpen, 
    onClose, 
    reportType,
    platform,
    pageId 
}: CampaignReportModalProps) {
    const { showModal } = useModal();
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedItem, setExpandedItem] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchReport();
        }
    }, [isOpen, reportType, pageId]);

    const fetchReport = async () => {
        setIsLoading(true);
        setData([]);
        setStats(null);
        try {
            const endpoint = `/${platform}/report/${reportType}`;
            const res = await api.get(`${endpoint}?page_id=${pageId}`);
            
            const responseData = res.data?.data;

            // API returns { success: true, data: { stats: {...}, data: [...templates] } }
            if (responseData?.stats) {
                setStats(responseData.stats);
            }

            // data.data can be an array of templates, or a paginated object
            const items = Array.isArray(responseData?.data)
                ? responseData.data
                : Array.isArray(responseData?.data?.data)
                    ? responseData.data.data
                    : Array.isArray(responseData)
                        ? responseData
                        : [];

            setData(items);
        } catch (error) {
            console.error("Fetch Campaign Report Error:", error);
            showModal("error", "Error", "Failed to load report analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const config = { 
        title: reportType === "auto-reply" ? "Auto Reply Performance" : 
               reportType === "auto-comment" ? "Auto Comment Performance" : 
               "Full Page Strategy Insights", 
        icon: reportType === "auto-reply" ? Megaphone : 
              reportType === "auto-comment" ? MessageSquare : 
              Layers, 
        color: "text-primary",
        bg: "bg-primary/5" 
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
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none sm:rounded-2xl w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden flex flex-col h-full max-h-full sm:max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div className="flex items-center gap-5">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", config.bg, config.color)}>
                            <config.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">{config.title}</h2>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-2 border-l-2 border-primary pl-3">Global Campaign Analytics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchReport} className="p-3.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-all active:scale-90">
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={onClose} className="p-3.5 rounded-2xl hover:bg-primary/10 text-neutral-400 hover:text-primary transition-all active:scale-90">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Global Stats Summary */}
                {stats && (
                    <div className="px-6 py-4 sm:px-8 sm:py-6 bg-[var(--card)] dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                        {[
                            { label: "Total Hits", value: stats.total, color: "text-primary" },
                            { label: "Successful", value: stats.sent, color: "text-primary" },
                            { label: "Failed", value: stats.failed, color: "text-primary/60" },
                            ...(stats.hidden !== undefined ? [{ label: "Hidden", value: stats.hidden, color: "text-primary/40" }] : [])
                        ].map((stat, i) => (
                            <div key={i} className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</h4>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-12 gap-4 px-10 py-4 bg-neutral-50/50 dark:bg-neutral-950/20 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-black text-neutral-400 uppercase tracking-widest items-center">
                    <div className="col-span-1 flex justify-center">#</div>
                    <div className="col-span-4">Campaign context</div>
                    <div className="col-span-3">Configuration Logic</div>
                    <div className="col-span-3">Status Tracking</div>
                    <div className="col-span-1 text-right">View</div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[var(--card)] dark:bg-neutral-900 text-sm">
                    {isLoading && data.length === 0 ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-primary/5 rounded-2xl animate-pulse" />
                        ))
                    ) : data.length > 0 ? (
                        data.map((item, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className={cn(
                                    "grid grid-cols-12 gap-x-4 gap-y-5 px-5 py-5 sm:px-8 sm:py-6 rounded-2xl bg-[var(--card)] dark:bg-neutral-950 border transition-all items-center hover:shadow-xl hover:shadow-primary/5 cursor-pointer",
                                    expandedItem === item.id ? "border-primary/30 ring-4 ring-primary/5" : "border-neutral-100 dark:border-neutral-800"
                                )} onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}>
                                    <div className="col-span-1 sm:col-span-1 flex justify-center text-[11px] font-black text-primary/20">
                                        {idx + 1}
                                    </div>
                                    <div className="col-span-11 sm:col-span-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                                            <BarChart3 size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-black text-neutral-800 dark:text-neutral-200 truncate leading-tight mb-1">
                                                {item.name || item.campaign_name || "Untitled Campaign"}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-tight">
                                                <span>{item.page?.page_name || "Page Asset"}</span>
                                                <span className="w-1 h-1 rounded-full bg-primary/20" />
                                                <span className="font-mono">ID: {item.id}</span>
                                            </div>
                                        </div>
                                    </div>
 
                                    <div className="col-span-6 sm:col-span-3 flex flex-col justify-center">
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1 block sm:hidden">Configuration Logic</span>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 bg-primary/5 text-primary">
                                                {item.reply_type || "Generic"} Logic
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 pl-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-neutral-800 dark:text-white leading-none">
                                                    {(item.multiple_reply_enabled == 1 || item.multiple_reply_enabled === "1") ? "ON" : "OFF"}
                                                </span>
                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Multi</span>
                                            </div>
                                            <div className="h-5 w-px bg-primary/10" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-neutral-800 dark:text-white leading-none">
                                                    {(item.comment_reply_enabled == 1 || item.comment_reply_enabled === "1") ? "ON" : "OFF"}
                                                </span>
                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Inline</span>
                                            </div>
                                        </div>
                                    </div>
 
                                    <div className="col-span-5 sm:col-span-3 flex flex-col justify-center">
                                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1 block sm:hidden">Status Tracking</span>
                                        <div className={cn(
                                            "px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 w-fit",
                                            (item.is_active == 1 || item.is_active === "1" || item.status === 'active')
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                                        )}>
                                            {(item.is_active == 1 || item.is_active === "1" || item.status === 'active') ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            {(item.is_active == 1 || item.is_active === "1" || item.status === 'active') ? "Active" : "Paused"}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 ml-1 text-neutral-400 text-[10px] font-bold uppercase tracking-widest">
                                            <Calendar size={12} className="text-primary/40" />
                                            <span>
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : "Recently Added"}
                                            </span>
                                        </div>
                                    </div>
 
                                    <div className="col-span-1 sm:col-span-1 text-right flex sm:block items-center justify-end">
                                        <div className={cn("inline-flex p-3 rounded-2xl transition-all", expandedItem === item.id ? "bg-primary text-white" : "bg-primary/5 text-primary shadow-sm")}>
                                            <MoreHorizontal className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail Section */}
                                <AnimatePresence>
                                    {expandedItem === item.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mx-8 p-8 rounded-2xl bg-primary/[0.02] border border-primary/10 space-y-8">
                                                {/* Per-campaign log stats */}
                                                {(item.log_total !== undefined) && (
                                                    <div className="grid grid-cols-4 gap-4">
                                                        {[
                                                            { label: 'Total', value: item.log_total },
                                                            { label: 'Sent', value: item.log_sent },
                                                            { label: 'Failed', value: item.log_failed },
                                                            { label: 'Hidden', value: item.log_hidden },
                                                        ].map((s, i) => (
                                                            <div key={i} className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                                                                <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">{s.label}</p>
                                                                <h5 className="text-xl font-black text-primary tracking-tighter">{s.value ?? 0}</h5>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-10">
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] ml-2">Message Content</h5>
                                                        <div className="p-6 rounded-3xl bg-[var(--card)] dark:bg-neutral-900 border border-primary/10 text-[13px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed italic shadow-sm">
                                                            {item.message ? `"${item.message}"` : "Dynamic filter-based content deployment"}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-6 rounded-3xl bg-[var(--card)] dark:bg-neutral-900 border border-primary/10 shadow-sm flex flex-col justify-center">
                                                            <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-2">Privacy Control</p>
                                                            <div className={cn("text-[11px] font-black", (item.hide_after_reply == 1 || item.hide_after_reply === "1") ? "text-primary" : "text-neutral-400")}>
                                                                {(item.hide_after_reply == 1 || item.hide_after_reply === "1") ? "HIDE ENABLED" : "DISPLAY PUBLIC"}
                                                            </div>
                                                        </div>
                                                        <div className="p-6 rounded-3xl bg-[var(--card)] dark:bg-neutral-900 border border-primary/10 shadow-sm flex flex-col justify-center">
                                                            <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-2">Source Type</p>
                                                            <div className={cn("text-[11px] font-black", (item.is_template == 1 || item.is_template === "1") ? "text-primary" : "text-neutral-400")}>
                                                                {(item.is_template == 1 || item.is_template === "1") ? "SYSTEM TEMPLATE" : "CUSTOM CAMPAIGN"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-6 border-t border-primary/10">
                                                    <div className="flex gap-3">
                                                        <div className="px-4 py-2 rounded-xl bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                                            METRIC.TENANT: {item.tenant_id}
                                                        </div>
                                                        <div className="px-4 py-2 rounded-xl bg-primary/5 text-[10px] font-bold text-primary uppercase tracking-widest">
                                                            POSTS MAPPED: {item.posts_count ?? 0}
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                                                        Last Sync: {item.updated_at ? new Date(item.updated_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center shadow-inner">
                                <BarChart3 className="w-10 h-10 text-primary/20" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em] leading-none">Insights Pending</h3>
                                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight mt-4 max-w-[240px] mx-auto opacity-70">
                                    Establish an active automation sequence to begin tracking performance metrics.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-neutral-50/50 dark:bg-neutral-950/20 border-t border-neutral-100 dark:border-neutral-800 flex justify-start">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 active:scale-95 bg-[var(--card)]"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
