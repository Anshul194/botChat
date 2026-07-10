"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Bot, Target, Zap, MessageSquare, Sparkles, ChevronRight, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchCampaigns, deleteCampaign, setSelectedCampaign,
    clearSelectedCampaign, type Campaign,
} from "@/store/slices/aiTrainingSlice";
import { useModal } from "@/components/providers/ModalProvider";
import CreateCampaignPanel from "./CreateCampaignPanel";
import EditCampaignDialog from "./EditCampaignDialog";

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AITrainingPage() {
    const dispatch = useAppDispatch();
    const { campaigns, isLoading, selectedCampaign } = useAppSelector((s) => s.aiTraining);
    const { showConfirm, showModal } = useModal();

    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => { dispatch(fetchCampaigns()); }, [dispatch]);

    const openEdit = (campaign: Campaign) => {
        dispatch(setSelectedCampaign(campaign));
        setIsEditOpen(true);
    };

    const handleDelete = (campaign: Campaign) => {
        showConfirm({
            title: "Delete Campaign?",
            message: `"${campaign.name}" will be permanently deleted. This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                const res = await dispatch(deleteCampaign(campaign.id));
                if (deleteCampaign.fulfilled.match(res)) {
                    showModal("success", "Deleted", "Campaign deleted successfully.");
                } else {
                    toast.error("Failed to delete campaign");
                }
            },
        });
    };

    const filtered = campaigns.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
                <div className="py-6 sm:py-8 space-y-6 sm:space-y-7">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                        <h1 data-tour="page-heading" className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                            AI Training
                        </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Manage campaigns and train your AI agents
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center justify-center gap-2 h-10 sm:h-9 px-4 rounded-xl text-white text-sm font-semibold active:scale-95 transition-all shadow-lg w-full sm:w-auto"
                            style={{ background: "var(--brand-gradient)", boxShadow: "0 8px 16px -4px rgba(29, 110, 245, 0.25)" }}
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </button>
                    </div>



                    {/* ── Search ── */}
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {/* ── Table ── */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-7 h-7 text-primary animate-spin" />
                            <p className="text-sm text-neutral-400">Loading campaigns...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
                                <Bot className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                                {search ? "No campaigns found" : "No campaigns yet"}
                            </h3>
                            <p className="text-sm text-neutral-400 mt-1 max-w-xs">
                                {search
                                    ? "Try a different search term."
                                    : "Create your first AI training campaign to get started."}
                            </p>
                            {!search && (
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="mt-5 flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline"
                                >
                                    Create Campaign <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* ── Mobile list ── */}
                            <div className="block sm:hidden space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {filtered.map((campaign) => {
                                        const isActive = campaign.status === "active";
                                        return (
                                            <motion.div
                                                key={campaign.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3.5"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                                                        {campaign.name}
                                                    </div>
                                                    {campaign.description && (
                                                        <div className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                                                            {campaign.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "w-2 h-2 rounded-full flex-shrink-0",
                                                    isActive ? "bg-emerald-500" : "bg-neutral-400"
                                                )} />
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <button
                                                        onClick={() => openEdit(campaign)}
                                                        className="w-7 h-7 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(campaign)}
                                                        className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* ── Desktop table ── */}
                            <div className="hidden sm:block bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                                                <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Name</th>
                                                <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Description</th>
                                                <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap hidden lg:table-cell">System Prompt</th>
                                                <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Status</th>
                                                <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap hidden md:table-cell">Created</th>
                                                <th className="text-right px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 whitespace-nowrap">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                            <AnimatePresence mode="popLayout">
                                                {filtered.map((campaign) => {
                                                    const isActive = campaign.status === "active";
                                                    return (
                                                        <motion.tr
                                                            key={campaign.id}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm flex-shrink-0">
                                                                        <Bot className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[200px] block">
                                                                        {campaign.name}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1 max-w-[240px] block">
                                                                    {campaign.description || "—"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 hidden lg:table-cell">
                                                                <div className="flex items-center gap-1.5 max-w-[220px]">
                                                                    <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                                                    <span className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                                                        {campaign.prompt_message || "—"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={cn(
                                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border",
                                                                    isActive
                                                                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                                                                )}>
                                                                    <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-neutral-400")} />
                                                                    {campaign.status || "inactive"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 hidden md:table-cell">
                                                                <div className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-neutral-500">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    <span>
                                                                        {campaign.created_at
                                                                            ? formatDate(new Date(campaign.created_at), 'MMM D, YYYY')
                                                                            : "—"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <button
                                                                        onClick={() => openEdit(campaign)}
                                                                        className="w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(campaign)}
                                                                        className="w-8 h-8 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                        Showing {filtered.length} of {campaigns.length} campaigns
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Panels / Dialogs ── */}
            <CreateCampaignPanel
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />

            <EditCampaignDialog
                campaign={selectedCampaign}
                open={isEditOpen}
                onClose={() => {
                    setIsEditOpen(false);
                    dispatch(clearSelectedCampaign());
                }}
            />
        </>
    );
}
