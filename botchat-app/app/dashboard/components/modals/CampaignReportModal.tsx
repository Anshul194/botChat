"use client";

import { useState, useEffect } from "react";
import {
    X, BarChart3, RefreshCw, Megaphone,
    MessageSquare, Layers, Calendar,
    AlertCircle, CheckCircle2, MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
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

            // Handle different API response structures
            if (Array.isArray(res.data?.data)) {
                // Structure: { success, data: [...] }
                setData(res.data.data);
            } else if (res.data?.data?.data && Array.isArray(res.data.data.data)) {
                // Structure: { success, data: { stats, data: { data: [...] } } }
                setData(res.data.data.data);
                setStats(res.data.data.stats);
            } else if (res.data?.data && !Array.isArray(res.data.data)) {
                // Structure: { success, data: { stats, data: [...] } }
                const nestedData = res.data.data.data?.data || res.data.data.data || [];
                setData(Array.isArray(nestedData) ? nestedData : []);
                setStats(res.data.data.stats);
            }
        } catch (error) {
            console.error("Fetch Campaign Report Error:", error);
            toast.error("Failed to load report analytics");
        } finally {
            setIsLoading(false);
        }
    };

    const getReportConfig = () => {
        switch (reportType) {
            case "auto-reply":
                return {
                    title: "Auto Reply Performance",
                    icon: Megaphone,
                    color: "text-indigo-600",
                    accent: "indigo",
                    bg: "bg-indigo-50/50"
                };
            case "auto-comment":
                return {
                    title: "Auto Comment Performance",
                    icon: MessageSquare,
                    color: "text-blue-600",
                    accent: "blue",
                    bg: "bg-blue-50/50"
                };
            case "full-page-reply":
                return {
                    title: "Full Page Strategy Insights",
                    icon: Layers,
                    color: "text-pink-600",
                    accent: "pink",
                    bg: "bg-pink-50/50"
                };
            default:
                return {
                    title: "Campaign Insights",
                    icon: BarChart3,
                    color: "text-slate-600",
                    accent: "slate",
                    bg: "bg-slate-50/50"
                };
        }
    };

    const config = getReportConfig();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div className="flex items-center gap-5">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", config.bg, config.color)}>
                            <config.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">{config.title}</h2>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-2 border-l-2 border-primary pl-3">Global Campaign Analytics</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchReport} className="p-3.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-all active:scale-90">
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={onClose} className="p-3.5 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-neutral-400 hover:text-rose-500 transition-all active:scale-90">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Global Stats Summary */}
                {stats && (
                    <div className="px-8 py-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 grid grid-cols-4 gap-6">
                        {[
                            { label: "Total Hits", value: stats.total, color: "text-indigo-600" },
                            { label: "Successful", value: stats.sent, color: "text-emerald-600" },
                            { label: "Failed", value: stats.failed, color: "text-rose-600" },
                            ...(stats.hidden !== undefined ? [{ label: "Hidden", value: stats.hidden, color: "text-amber-600" }] : [])
                        ].map((stat, i) => (
                            <div key={i} className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</h4>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-10 py-4 bg-neutral-50/50 dark:bg-neutral-950/20 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-black text-neutral-400 uppercase tracking-widest items-center">
                    <div className="col-span-1 flex justify-center">#</div>
                    <div className="col-span-4">Campaign context</div>
                    <div className="col-span-3">Configuration</div>
                    <div className="col-span-3">Status Tracking</div>
                    <div className="col-span-1 text-right">View</div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white dark:bg-neutral-900">
                    {isLoading && data.length === 0 ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-neutral-50 dark:bg-neutral-800/20 rounded-[32px] animate-pulse" />
                        ))
                    ) : data.length > 0 ? (
                        data.map((item, idx) => (
                            <div key={idx} className="space-y-3">
                                <div className={cn(
                                    "grid grid-cols-12 gap-4 px-8 py-6 rounded-[32px] bg-white dark:bg-neutral-950 border transition-all items-center hover:shadow-xl hover:shadow-primary/5 cursor-pointer",
                                    expandedItem === item.id ? "border-primary/30 ring-4 ring-primary/5" : "border-neutral-100 dark:border-neutral-800"
                                )} onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}>
                                    <div className="col-span-1 flex justify-center text-[11px] font-black text-neutral-300">
                                        {idx + 1}
                                    </div>
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:scale-110 transition-transform">
                                            <BarChart3 size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[14px] font-black text-neutral-800 dark:text-neutral-200 truncate leading-tight mb-1">
                                                {item.name || item.campaign_name || "Untitled Campaign"}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">{item.page?.page_name || "Page Asset"}</p>
                                                <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight">ID: {item.id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-3">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                                config.bg, config.color, `border-${config.accent}-100 dark:border-${config.accent}-900/40`
                                            )}>
                                                {item.reply_type || "Generic"} Logic
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 pl-1">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-neutral-800 dark:text-white leading-none">
                                                    {item.multiple_reply_enabled === "1" ? "ON" : "OFF"}
                                                </span>
                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Multi</span>
                                            </div>
                                            <div className="h-5 w-px bg-neutral-100 dark:bg-neutral-800" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-neutral-800 dark:text-white leading-none">
                                                    {item.comment_reply_enabled === "1" ? "ON" : "OFF"}
                                                </span>
                                                <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Inline</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-3 flex flex-col justify-center">
                                        <div className={cn(
                                            "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 w-fit",
                                            (item.is_active === "1" || item.status === 'active' || item.is_enabled === "1")
                                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                        )}>
                                            {(item.is_active === "1" || item.status === 'active' || item.is_enabled === "1") ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            {(item.is_active === "1" || item.status === 'active' || item.is_enabled === "1") ? "Active Flow" : "Paused Flow"}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 ml-1 text-neutral-400">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : "Active"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <div className={cn("inline-flex p-3 rounded-2xl transition-all", expandedItem === item.id ? "bg-primary text-white" : "bg-neutral-50 dark:bg-neutral-800 text-neutral-400")}>
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
                                            <div className="mx-8 p-8 rounded-[32px] bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800 space-y-8">
                                                <div className="grid grid-cols-2 gap-10">
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Message Content</h5>
                                                        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-[13px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed italic">
                                                            {item.message ? `"${item.message}"` : "No direct message text (template based or filter based)"}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Hide After Reply</p>
                                                            <div className={cn("text-[11px] font-black", item.hide_after_reply === "1" ? "text-emerald-500" : "text-neutral-400")}>
                                                                {item.hide_after_reply === "1" ? "ENABLED" : "DISABLED"}
                                                            </div>
                                                        </div>
                                                        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2">Template Usage</p>
                                                            <div className={cn("text-[11px] font-black", item.is_template === "1" ? "text-indigo-500" : "text-neutral-400")}>
                                                                {item.is_template === "1" ? "SAVED TEMPLATE" : "CUSTOM FLOW"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                                    <div className="flex gap-2">
                                                        <div className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                                            Tenant ID: {item.tenant_id}
                                                        </div>
                                                        <div className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                                            Platform: {item.platform}
                                                        </div>
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
                            <div className="w-24 h-24 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center shadow-inner">
                                <BarChart3 className="w-10 h-10 text-neutral-200" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-[0.2em]">Insights Unavailable</h3>
                                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-tight mt-2 max-w-[240px] mx-auto opacity-70">
                                    Establish at least one automation sequence to unlock performance metrics.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50/50 dark:bg-neutral-950/20 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-all shadow-sm active:scale-95"
                    >
                        Dismiss Insights
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
