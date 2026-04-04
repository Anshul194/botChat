"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Bot, Target, Zap, MessageSquare, Sparkles, FileText, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchCampaigns, deleteCampaign, setSelectedCampaign,
    clearSelectedCampaign, type Campaign,
} from "@/store/slices/aiTrainingSlice";
import { useModal } from "@/components/providers/ModalProvider";
import CreateCampaignPanel from "./CreateCampaignPanel";
import EditCampaignDialog from "./EditCampaignDialog";

// ── Campaign Card ─────────────────────────────────────────────────────────────
function CampaignCard({
    campaign,
    onEdit,
    onDelete,
}: {
    campaign: Campaign;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const isActive = campaign.status === "active";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all duration-200"
        >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-sm flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate leading-snug">
                            {campaign.name}
                        </h4>
                        <span className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider",
                            isActive ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"
                        )}>
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isActive ? "bg-emerald-500" : "bg-neutral-400"
                            )} />
                            {campaign.status || "idle"}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onEdit}
                        className="w-7 h-7 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center justify-center text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="Edit campaign"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete campaign"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Description */}
            {campaign.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
                    {campaign.description}
                </p>
            )}

            {/* System Prompt Preview */}
            {campaign.system_prompt && (
                <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-lg px-3 py-2 mb-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3 h-3 text-pink-500" />
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                            System Prompt
                        </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 font-mono leading-relaxed">
                        {campaign.system_prompt}
                    </p>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                <span className="text-[10px] text-neutral-400">
                    {campaign.created_at
                        ? new Date(campaign.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                        })
                        : "Just now"}
                </span>
                <div className="flex items-center gap-1 text-neutral-300">
                    <FileText className="w-3 h-3" />
                    <span className="text-[10px]">Campaign</span>
                </div>
            </div>
        </motion.div>
    );
}

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
                <div className="max-w-6xl mx-auto px-6 py-8 space-y-7">

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                AI Training
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Manage campaigns and train your AI agents
                            </p>
                        </div>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold shadow-sm shadow-pink-500/20 active:scale-95 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </button>
                    </div>

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Total", value: campaigns.length, icon: Target, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
                            { label: "Active", value: campaigns.filter(c => c.status === "active").length, icon: Zap, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                            { label: "Inactive", value: campaigns.filter(c => c.status !== "active").length, icon: MessageSquare, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-3"
                            >
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">{stat.value}</div>
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Search ── */}
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-pink-400 dark:focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20 transition-all"
                        />
                    </div>

                    {/* ── Content ── */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
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
                                    className="mt-5 flex items-center gap-1.5 text-sm text-pink-600 font-semibold hover:underline"
                                >
                                    Create Campaign <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filtered.map((campaign) => (
                                    <CampaignCard
                                        key={campaign.id}
                                        campaign={campaign}
                                        onEdit={() => openEdit(campaign)}
                                        onDelete={() => handleDelete(campaign)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
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
