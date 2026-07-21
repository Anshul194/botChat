"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy,
    CheckCircle2, Target, Bot, MousePointerClick, ArrowLeft,
    Menu, Settings2, Sparkles, Box, RefreshCw, ChevronRight, Instagram, Layers,
    ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PersistentMenu from "./PersistentMenu";
import IceBreakersPanel from "../../facebook/bot-replies/IceBreakersPanel";
import { AiAgentSettingsPanel } from "../AiAgentSettingsPanel";


interface BotReply {
    id: number;
    instagram_id: string;
    name: string;
    trigger_type: string;
    trigger_value: string;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    page_name?: string;
}

interface InstagramPageData {
    id: number;
    instagram_id: string;
    username: string;
    page?: {
        page_name: string;
        page_id: string;
    }
}

interface ActionData {
    type: string;
    label: string;
    automation_id: number | null;
    status: 'published' | 'draft' | null;
}

const MENUS = [
    { id: 'bot_reply', label: 'Bot Replies', icon: MessageSquare },
    { id: 'ice_breakers', label: 'Ice Breakers', icon: Sparkles },
    { id: 'ai_agent', label: 'AI Agent', icon: Bot },
    { id: 'action_buttons', label: 'Action Buttons', icon: MousePointerClick },
    { id: 'persistent_menu', label: 'Persistent Menu', icon: Menu },
] as const;

type MenuId = typeof MENUS[number]['id'];

export default function InstagramBotRepliesPage() {
    const router = useRouter();
    const [replies, setReplies] = useState<BotReply[]>([]);
    const [pages, setPages] = useState<InstagramPageData[]>([]);
    const { showModal, showConfirm } = useModal();
    const [isLoading, setIsLoading] = useState(true);

    const [selectedAccountId, setSelectedAccountId] = useState<string | "all">("all");
    const [activeMenu, setActiveMenu] = useState<MenuId>('bot_reply');

    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [actions, setActions] = useState<ActionData[]>([]);
    const [isActionsLoading, setIsActionsLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedActionType, setSelectedActionType] = useState<string | null>(null);

    const [editReply, setEditReply] = useState<BotReply | null>(null);

    const [newReply, setNewReply] = useState({
        name: "",
        page_id: "",
        instagram_id: "",
        trigger_type: "exact",
        trigger_value: ""
    });

    const [isCreateAccountDropdownOpen, setIsCreateAccountDropdownOpen] = useState(false);
    const [createAccountSearchQuery, setCreateAccountSearchQuery] = useState("");

    const selectedAccountObj = useMemo(() => pages.find(p => p.instagram_id === selectedAccountId) || null, [pages, selectedAccountId]);

    const fetchReplies = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/instagram/bot-replies?platform=instagram");
            if (response.data.success || response.data.is_success) {
                setReplies(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Fetch Replies Error:", error);
            const errorMsg = error.response?.data?.message || "Failed to load Instagram bot replies";
            showModal("error", "Error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [api, showModal]);

    const fetchPages = useCallback(async () => {
        try {
            const response = await api.get("/social/instagram-connect");
            if (response.data.success || response.data.is_success) {
                const fetchedAccounts = response.data.data.instagram_accounts || [];
                setPages(fetchedAccounts);
            }
        } catch (error) {
            console.error("Fetch Pages Error:", error);
        }
    }, [api]);

    const fetchActions = useCallback(async (accountIdToUse?: string) => {
        const accountId = accountIdToUse || selectedAccountId;
        const acc = pages.find(p => p.instagram_id === accountId) || (pages.length ? pages[0] : null);
        if (!acc || !acc.page?.page_id) return;
        setIsActionsLoading(true);
        try {
            const response = await api.get(`/instagram/actions?page_id=${acc.page.page_id}&platform=instagram`);
            if (response.data.success || response.data.is_success) {
                setActions(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Actions Error:", error);
        } finally {
            setIsActionsLoading(false);
        }
    }, [api, selectedAccountId, pages]);

    useEffect(() => {
        fetchReplies();
        fetchPages();
    }, [fetchReplies, fetchPages]);

    useEffect(() => {
        if (activeMenu === 'action_buttons' || activeMenu === 'persistent_menu') {
            if (selectedAccountId === "all" && pages.length > 0) {
                setSelectedAccountId(pages[0].instagram_id);
            } else if (selectedAccountId !== "all") {
                fetchActions();
            }
        }
    }, [activeMenu, selectedAccountId, pages, fetchActions]);

    const handleCreate = async () => {
        const rccFb = selectedAccountId === "all" ? (pages[0] || null) : selectedAccountObj;
        const targetInstagramId = newReply.instagram_id || rccFb?.instagram_id || "";
        const targetPageId = newReply.page_id || rccFb?.page?.page_id || "";

        const submitData = { ...newReply, instagram_id: targetInstagramId, page_id: targetPageId };

        const isKeywordRequired = !['welcome', 'fallback'].includes(submitData.trigger_type);
        if (!submitData.name || !submitData.instagram_id || (isKeywordRequired && !submitData.trigger_value)) {
            showModal("error", "Missing Fields", "Please fill all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const response = await api.post("/instagram/bot-replies", submitData);
            if (response.data.success || response.data.is_success) {
                showModal("success", "Success", "Instagram bot reply created successfully");
                setShowCreateModal(false);
                fetchReplies();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to create Instagram bot reply";
            showModal("error", "Error", errorMsg);
        } finally {
            setIsCreating(false);
            setNewReply({
                name: "",
                page_id: targetPageId,
                instagram_id: targetInstagramId,
                trigger_type: "exact",
                trigger_value: ""
            });
            setIsCreateAccountDropdownOpen(false);
            setCreateAccountSearchQuery("");
        }
    };

    const handleDelete = async (id: number) => {
        const reply = replies.find(r => r.id === id);
        showConfirm({
            title: "Delete Reply?",
            message: `Are you sure you want to delete "${reply?.name || 'this reply'}"? This action cannot be undone.`,
            confirmText: "Delete",
            type: "danger",
            onConfirm: async () => {
                try {
                    await api.delete(`/instagram/bot-replies/${id}`);
                    showModal("success", "Deleted", "Bot reply deleted successfully");
                    setReplies(prev => prev.filter(r => r.id !== id));
                } catch (error: any) {
                    const errorMsg = error.response?.data?.message || "Failed to delete bot reply";
                    showModal("error", "Error", errorMsg);
                }
            }
        });
    };

    const handleToggleStatus = async (reply: BotReply) => {
        const newStatus = reply.status === 'published' ? 'draft' : 'publish';
        try {
            await api.patch(`/instagram/bot-replies/${reply.id}/${newStatus}`);
            showModal("success", "Success", `Bot reply set to ${newStatus === 'publish' ? 'Live' : 'Draft'}`);
            fetchReplies();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to update status";
            showModal("error", "Error", errorMsg);
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await api.post(`/instagram/bot-replies/${id}/duplicate`);
            showModal("success", "Success", "Bot reply duplicated");
            fetchReplies();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to duplicate bot reply";
            showModal("error", "Error", errorMsg);
        }
    };

    const handleActionToggle = async (action: ActionData) => {
        if (!action.automation_id) return;
        try {
            const newStatus = action.status === 'published' ? 'draft' : 'publish';
            await api.patch(`/instagram/bot-replies/${action.automation_id}/${newStatus}`);
            showModal("success", "Success", `Action status updated`);
            if (selectedAccountId !== "all") fetchActions();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to toggle action";
            showModal("error", "Error", errorMsg);
        }
    };

    const handleActionDelete = async (action: ActionData) => {
        if (!action.automation_id) return;
        showConfirm({
            title: "Unmap Action?",
            message: `Are you sure you want to unmap "${action.label}"?`,
            confirmText: "Unmap",
            type: "danger",
            onConfirm: async () => {
                try {
                    await api.delete(`/instagram/actions/${action.automation_id}`);
                    showModal("success", "Unmapped", "Action unmapped successfully");
                    if (selectedAccountId !== "all") {
                        fetchActions(selectedAccountId);
                    }
                } catch (error: any) {
                    const errorMsg = error.response?.data?.message || "Failed to remove mapping";
                    showModal("error", "Error", errorMsg);
                }
            }
        });
    };

    const handleConfigureAction = async (type: string) => {
        setSelectedActionType(type);
        setShowActionModal(true);
    };

    const handleActionCreate = async (type: string) => {
        if (!type || !selectedAccountObj || !selectedAccountObj.page?.page_id) return;
        setIsCreating(true);
        try {
            const response = await api.post("/instagram/actions", {
                page_id: selectedAccountObj.page.page_id,
                action_type: type,
                name: type === 'action_no_match' ? 'No Match' : type === 'action_get_started' ? 'Get Started' : 'Ice Breakers'
            });
            if (response.data.success || response.data.is_success) {
                const automationId = response.data.data?.automation_id || response.data.data?.id;
                showModal("success", "Success", "Action created successfully");
                setShowActionModal(false);
                fetchActions();
                if (automationId) {
                    goToFlow(automationId);
                }
            }
        } catch (error) {
            showModal("error", "Error", "Failed to create action");
        } finally {
            setIsCreating(false);
        }
    };

    const goToFlow = (replyId: number) => {
        router.push(`/dashboard/flows?id=${replyId}&platform=instagram`);
    };

    const handleAccountSelect = (id: string | "all") => {
        setSelectedAccountId(id);
        if (id !== "all") {
            const acc = pages.find(p => p.instagram_id === id);
            if (acc) {
                setNewReply(prev => ({
                    ...prev,
                    instagram_id: acc.instagram_id,
                    page_id: acc.page?.page_id || ""
                }));
            }
        }
    };

    const filteredReplies = useMemo(() => {
        return replies.filter(r =>
            (selectedAccountId === "all" || r.instagram_id === selectedAccountId) &&
            (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.trigger_value.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [replies, selectedAccountId, searchQuery]);

    const creationAccountFallback = selectedAccountId === "all" ? (pages[0] || null) : selectedAccountObj;

    const IG_PINK = "#db2777";

    return (
        <div className="bg-transparent w-full min-w-0">

            {/* ── UNIFIED PAGE HEADER ─────────────────────────────────────────── */}
            <div className="sticky top-[-16px] md:top-[-24px] z-[50] flex flex-col -mx-4 -mt-4 md:-mx-6 md:-mt-6"
                style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                {/* Top row: back + brand + title */}
                <div className="flex items-center gap-3 px-4 md:px-8 pt-3 pb-2.5 md:pt-4 md:pb-3">
                    <button
                        onClick={() => router.back()}
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                    >
                        <ArrowLeft className="w-[15px] h-[15px]" strokeWidth={2.5} />
                    </button>
                    {/* Brand dot + text */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, #E1306C, #833AB4)` }}>
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-medium tracking-widest uppercase leading-none" style={{ color: IG_PINK }}>Instagram</span>
                            <h1 className="text-[14px] md:text-[16px] font-semibold leading-tight truncate" style={{ color: "var(--foreground)" }}>
                                {MENUS.find(m => m.id === activeMenu)?.label || 'Bot Replies'}
                            </h1>
                        </div>
                    </div>
                </div>
                {/* Desktop tab strip — underline style */}
                <div className="hidden md:flex items-end gap-0 px-8 overflow-x-auto no-scrollbar">
                    {MENUS.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => setActiveMenu(menu.id)}
                            className={cn(
                                "relative px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0",
                                activeMenu === menu.id
                                    ? "text-[var(--foreground)]"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            )}
                        >
                            <menu.icon className="w-3.5 h-3.5" strokeWidth={activeMenu === menu.id ? 2.5 : 2} />
                            {menu.label}
                            {activeMenu === menu.id && (
                                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: IG_PINK }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PAGE BODY ─────────────────────────────────────────────────── */}
            <div className="w-full pt-5 pb-28 md:pb-10 space-y-4 md:space-y-6">

                {/* Account filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => handleAccountSelect("all")}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-all flex-shrink-0 border",
                            selectedAccountId === "all"
                                ? "border-transparent text-white shadow-sm"
                                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                        style={selectedAccountId === "all" ? { background: IG_PINK } : undefined}
                    >
                        All Accounts
                    </button>
                    {pages.map(acc => (
                        <button
                            key={acc.id}
                            onClick={() => handleAccountSelect(acc.instagram_id)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-all flex-shrink-0 border",
                                selectedAccountId === acc.instagram_id
                                    ? "border-transparent text-[var(--background)]"
                                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            )}
                            style={selectedAccountId === acc.instagram_id ? { background: "var(--foreground)" } : undefined}
                        >
                            @{acc.username}
                        </button>
                    ))}
                </div>

                {/* 3. MAIN WORKSPACE */}
                <div className="w-full min-w-0 bg-transparent md:bg-[var(--card)] border border-transparent md:border-[var(--border)] p-0 md:p-6 rounded-2xl md:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                    <AnimatePresence mode="wait">

                        {/* ── BOT REPLIES CONTENT */}
                        {activeMenu === 'bot_reply' && (
                            <motion.div
                                key="bot_reply"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col"
                            >
                                {/* Search + Create */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-8">
                                    <div className="relative w-full sm:max-w-sm">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <input
                                            type="text"
                                            placeholder="Search replies..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--foreground)] focus:border-[#db2777]/50 focus:ring-2 focus:ring-[#db2777]/10 text-sm outline-none transition-all placeholder:text-neutral-400/50 shadow-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="w-full sm:w-auto text-white px-5 py-3 rounded-xl font-semibold text-[13px] tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${IG_PINK} 0%, #be185d 100%)`, boxShadow: `${IG_PINK}40 0px 4px 14px` }}
                                    >
                                        <Plus className="w-4 h-4" /> Create IG Flow
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                                        ))}
                                    </div>
                                ) : filteredReplies.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {/* Header row — desktop only */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                                            <div className="col-span-5">Automation Name</div>
                                            <div className="col-span-2">Status</div>
                                            <div className="col-span-2">Trigger Type</div>
                                            <div className="col-span-3 text-right">Actions</div>
                                        </div>

                                        {filteredReplies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="group relative bg-[var(--card)] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 md:border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#db2777]/30 transition-all"
                                            >
                                                {/* Left accent bar */}
                                                <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full transition-colors", reply.status === 'published' ? 'bg-[#db2777]' : 'bg-neutral-200 dark:bg-neutral-700')} />

                                                {/* ── MOBILE CARD LAYOUT ── */}
                                                <div className="md:hidden">
                                                    {/* Card body — tappable to open edit modal */}
                                                    <button
                                                        onClick={() => setEditReply(reply)}
                                                        className="w-full text-left pl-5 pr-4 pt-4 pb-3.5"
                                                    >
                                                        {/* Row 1: Icon + Name + Status badge */}
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm",
                                                                reply.status === 'published'
                                                                    ? "bg-gradient-to-br from-pink-50 to-pink-100 text-[#db2777]"
                                                                    : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                                                            )}>
                                                                <MessageSquare className="w-4.5 h-4.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-[14px] font-semibold text-neutral-900 dark:text-white truncate leading-snug">{reply.name}</h4>
                                                                {selectedAccountId === "all" && (
                                                                    <span className="text-[11px] font-medium" style={{ color: IG_PINK }}>
                                                                        @{pages.find(p => p.instagram_id === reply.instagram_id)?.username || "Unknown"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {reply.status === 'published' ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 flex-shrink-0">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Draft
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Row 2: Trigger badge + Tap hint */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Target className="w-3 h-3 text-neutral-400" />
                                                                <span className="text-[11px] text-neutral-500 font-medium">{reply.trigger_type}</span>
                                                            </div>
                                                            <span className="text-[10px] text-neutral-300 dark:text-neutral-600 font-medium">Tap to manage →</span>
                                                        </div>
                                                    </button>

                                                    {/* Action row — 4 buttons */}
                                                    <div className="border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-4 divide-x divide-neutral-100 dark:divide-neutral-800">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditReply(reply); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-0.5 text-[#db2777] hover:bg-[var(--primary)]/10 dark:hover:bg-pink-900/20 transition-colors group/btn"
                                                        >
                                                            <Settings2 className="w-4 h-4" />
                                                            <span className="text-[9px] font-semibold tracking-wide">Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }}
                                                            className={cn("py-3 flex flex-col items-center justify-center gap-0.5 transition-colors group/btn",
                                                                reply.status === 'published' ? "text-amber-500 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                                                            )}
                                                        >
                                                            {reply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                            <span className="text-[9px] font-semibold tracking-wide">
                                                                {reply.status === 'published' ? 'Pause' : 'Go Live'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 dark:hover:bg-pink-900/20 transition-colors group/btn"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            <span className="text-[9px] font-semibold tracking-wide">Copy</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/btn"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span className="text-[9px] font-semibold tracking-wide">Delete</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ── DESKTOP CARD LAYOUT ── */}
                                                <div className="hidden md:grid grid-cols-12 items-center gap-4 px-6 py-4">
                                                    {/* Name + Icon */}
                                                    <div className="flex items-center gap-4 col-span-5 min-w-0">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all",
                                                            reply.status === 'published' ? "bg-[#db2777]/10 text-[#db2777]" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                                                        )}>
                                                            <MessageSquare className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <h4 className="text-[15px] font-bold text-neutral-900 dark:text-white truncate">{reply.name}</h4>
                                                            {selectedAccountId === "all" && (
                                                                <div className="flex items-center mt-1">
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md truncate max-w-[150px]" style={{ background: `${IG_PINK}18`, color: IG_PINK }}>
                                                                        @{pages.find(p => p.instagram_id === reply.instagram_id)?.username || "Unknown"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Status */}
                                                    <div className="flex items-center col-span-2">
                                                        {reply.status === 'published' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Draft
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Trigger */}
                                                    <div className="flex items-center col-span-2">
                                                        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">{reply.trigger_type}</span>
                                                    </div>
                                                    {/* Actions */}
                                                    <div className="flex items-center justify-end gap-2 col-span-3">
                                                        <button onClick={(e) => { e.stopPropagation(); goToFlow(reply.id); }} className="py-2 px-4 rounded-xl text-xs font-bold transition-all text-center active:scale-95" style={{ background: `${IG_PINK}18`, color: IG_PINK, border: `1px solid ${IG_PINK}33` }}>Edit Flow</button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }} className={cn("p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all active:scale-95", reply.status === 'published' ? "hover:bg-amber-50 text-neutral-400 hover:text-amber-500" : "hover:bg-emerald-50 text-neutral-400 hover:text-emerald-500")} title={reply.status === 'published' ? "Pause" : "Go Live"}>
                                                                {reply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--primary)]/100/10 text-neutral-400 hover:text-[var(--primary)] transition-all active:scale-95" title="Duplicate"><Copy className="w-4 h-4" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all active:scale-95" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 dark:bg-[var(--primary)]/100/10 flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-[var(--primary)]/80" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No Automations Found</h3>
                                        <p className="text-sm text-neutral-500 max-w-xs mt-1 mb-6 font-medium">Create automated responses for your Instagram messages.</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="bg-neutral-900 dark:bg-[var(--card)] text-white dark:text-neutral-900 px-6 py-2.5 rounded-xl font-medium text-sm shadow-md hover:scale-105 transition-transform"
                                        >
                                            Build First Reply
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeMenu === 'ice_breakers' && (
                            <IceBreakersPanel
                                pages={pages}
                                selectedPageId={selectedAccountId}
                                channelType="instagram"
                            />
                        )}

                        {activeMenu === 'action_buttons' && (
                            <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                    <div>
                                        <h2 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>IG Action Shortcuts</h2>
                                        <p className="text-xs font-medium mt-1" style={{ color: "var(--muted-foreground)" }}>Connect system events to custom automation flows</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => fetchActions()}
                                            className="p-3 rounded-2xl bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                                        >
                                            <RefreshCw className={cn("w-4 h-4", isActionsLoading && "animate-spin")} />
                                        </button>
                                    </div>
                                </div>

                                {isActionsLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-44 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                                        ))}
                                    </div>
                                ) : actions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {actions.map(action => {
                                            const labels: Record<string, { label: string, desc: string }> = {
                                                'action_get_started': { label: 'Get Started', desc: 'Triggered when someone opens your DM' },
                                                'action_no_match': { label: 'No Match / Fallback', desc: 'Triggered when no bot reply matches' },
                                                'action_ice_breaker': { label: 'Ice Breakers', desc: 'Precomputed conversation starters' },
                                            };
                                            const def = labels[action.type] || { label: action.label || action.type, desc: 'Custom System Action' };

                                            return (
                                                <div
                                                    key={action.type}
                                                    onClick={() => {
                                                        if (action.automation_id) {
                                                            goToFlow(action.automation_id);
                                                        } else {
                                                            handleConfigureAction(action.type);
                                                        }
                                                    }}
                                                    className="group bg-neutral-50/50 dark:bg-neutral-950/20 shadow-sm border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 hover:border-[var(--primary)]/30 transition-all flex flex-col justify-between cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm",
                                                                action.automation_id ? "bg-[var(--primary)]/20 text-[#db2777] dark:bg-pink-900/40" : "bg-[var(--card)] dark:bg-neutral-900 text-neutral-400 dark:border-neutral-800"
                                                            )}>
                                                                {action.type === 'action_get_started' ? <Play className="w-6 h-6 fill-current" /> : <RefreshCw className="w-6 h-6" />}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {action.automation_id && (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleActionToggle(action); }}
                                                                            className={cn(
                                                                                "p-2 rounded-lg border transition-all active:scale-90",
                                                                                action.status === 'published' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                                            )}
                                                                            title={action.status === 'published' ? "Pause Action" : "Resume Action"}
                                                                        >
                                                                            {action.status === 'published' ? <Pause size={14} /> : <Play size={14} />}
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleActionDelete(action); }}
                                                                            className="p-2 rounded-lg border bg-red-50 text-red-500 border-red-100 hover:bg-red-100 transition-all active:scale-90"
                                                                            title="Unmap Action"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">{def.label}</h3>
                                                            {action.automation_id && (
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    action.status === 'published' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" : "bg-neutral-300"
                                                                )} />
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">{def.desc}</p>
                                                    </div>

                                                    <div className="mt-8">
                                                        {action.automation_id ? (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); goToFlow(action.automation_id!); }}
                                                                className="w-full py-3 rounded-2xl bg-[var(--card)] dark:bg-neutral-900 border-2 border-pink-100 dark:border-pink-900/10 text-[#db2777] dark:text-[var(--primary)]/80 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-[var(--primary)]/10/50 dark:hover:bg-pink-900/20 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Box size={14} /> Open Flow Logic
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleActionCreate(action.type); }}
                                                                className="w-full py-3 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                                                style={{ background: `linear-gradient(135deg, ${IG_PINK} 0%, #be185d 100%)`, boxShadow: `${IG_PINK}40 0px 4px 14px` }}
                                                            >
                                                                <Plus size={14} strokeWidth={2.5} /> Create Custom Layer
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-2xl">
                                        <div className="w-20 h-20 rounded-3xl bg-[var(--primary)]/10 dark:bg-[var(--primary)]/100/5 flex items-center justify-center mb-6">
                                            <MousePointerClick className="w-10 h-10 text-[var(--primary)]/80" />
                                        </div>
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">No custom shortcuts</h3>
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] max-w-xs mt-2 mb-8 mx-auto leading-relaxed">Map IG system events to neural automation layers to handle complex edge cases.</p>
                                        <button
                                            onClick={() => setShowActionModal(true)}
                                            className="bg-neutral-900 dark:bg-[var(--card)] text-white dark:text-neutral-900 px-8 py-3 rounded-2xl font-medium text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Build custom layer
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeMenu === 'persistent_menu' && selectedAccountObj && selectedAccountId !== "all" && (
                            <PersistentMenu
                                instagramId={selectedAccountObj.instagram_id}
                                pageId={selectedAccountObj.page?.page_id || ""}
                                actions={actions}
                            />
                        )}

                        {activeMenu === 'ai_agent' && (
                            <motion.div
                                key="ai"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-6 px-4 max-w-6xl mx-auto"
                            >
                                {selectedAccountId !== "all" ? (
                                    <div className="w-full">
                                        <AiAgentSettingsPanel
                                            platform="instagram"
                                            accountId={selectedAccountId}
                                            accountName={selectedAccountObj?.username || "Instagram Account"}
                                        />
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full max-w-md p-10 bg-[var(--primary)]/10 dark:bg-[var(--primary)]/100/10 rounded-2xl border border-pink-100 dark:border-[var(--primary)]/20 flex flex-col items-center gap-4 text-center grayscale-0 mx-auto"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/20 dark:bg-pink-900/30 flex items-center justify-center mb-2">
                                            <Bot className="w-8 h-8 text-[var(--primary)]" />
                                        </div>
                                        <h4 className="text-lg font-black text-pink-900 dark:text-[var(--primary)]/80 uppercase tracking-tight leading-tight">Environment Required</h4>
                                        <p className="text-xs font-bold text-pink-700 dark:text-[var(--primary)]/80 uppercase tracking-widest leading-relaxed">Please select a specific Instagram account from the header to enable neural agent configuration.</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* EDIT REPLY MODAL */}
                <AnimatePresence>
                    {editReply && (
                        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
                                onClick={() => setEditReply(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 60 }}
                                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                                className="bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-[28px] sm:rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
                            >
                                {/* Drag handle */}
                                <div className="sm:hidden flex justify-center pt-3.5 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>

                                {/* Pink accent header */}
                                <div className="relative px-6 pt-5 pb-5 text-white" style={{ background: `linear-gradient(135deg, ${IG_PINK} 0%, #be185d 100%)` }}>
                                    <div className="absolute top-3 right-4">
                                        <button
                                            onClick={() => setEditReply(null)}
                                            className="p-1.5 rounded-full bg-[var(--card)]/10 hover:bg-[var(--card)]/20 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-pink-200 mb-1">Bot Reply</p>
                                    <h3 className="text-[17px] font-bold leading-tight pr-8 truncate">{editReply.name}</h3>
                                    <div className="flex items-center gap-2 mt-2">
                                        {editReply.status === 'published' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Draft
                                            </span>
                                        )}
                                        <span className="text-[11px] text-pink-200 font-medium">· {editReply.trigger_type}</span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="px-6 py-5 space-y-3">
                                    {/* Info rows */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-3.5">
                                            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">Trigger Type</p>
                                            <p className="text-[13px] font-bold text-neutral-800 dark:text-white uppercase">{editReply.trigger_type}</p>
                                        </div>
                                        {editReply.trigger_value && (
                                            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-3.5">
                                                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">Keyword</p>
                                                <p className="text-[13px] font-bold text-neutral-800 dark:text-white truncate">{editReply.trigger_value}</p>
                                            </div>
                                        )}
                                        {selectedAccountId === "all" && (
                                            <div className="rounded-2xl p-3.5 col-span-2" style={{ background: `${IG_PINK}12` }}>
                                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: IG_PINK }}>Instagram Account</p>
                                                <p className="text-[13px] font-bold truncate" style={{ color: IG_PINK }}>
                                                    @{pages.find(p => p.instagram_id === editReply.instagram_id)?.username || "Unknown"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA — Open Flow Builder */}
                                    <button
                                        onClick={() => { setEditReply(null); goToFlow(editReply.id); }}
                                        className="w-full py-3 rounded-xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${IG_PINK} 0%, #be185d 100%)`, boxShadow: `${IG_PINK}40 0px 4px 14px` }}
                                    >
                                        <Box className="w-4 h-4" /> Open Flow Builder
                                    </button>

                                    {/* Secondary actions */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => { handleToggleStatus(editReply); setEditReply(null); }}
                                            className={cn("py-3 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-1.5 transition-all border",
                                                editReply.status === 'published'
                                                    ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                                                    : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                            )}
                                        >
                                            {editReply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            {editReply.status === 'published' ? 'Pause' : 'Go Live'}
                                        </button>
                                        <button
                                            onClick={() => { handleDuplicate(editReply.id); setEditReply(null); }}
                                            className="py-3 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Duplicate
                                        </button>
                                        <button
                                            onClick={() => { setEditReply(null); handleDelete(editReply.id); }}
                                            className="py-3 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-1.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Safe area bottom (mobile) */}
                                <div className="h-safe-area-inset-bottom pb-6 sm:pb-0" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* CREATE MODAL */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
                                onClick={() => setShowCreateModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl relative z-10"
                            >
                                {/* Modal drag handle (mobile) */}
                                <div className="sm:hidden flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>
                                <div className="px-6 pt-4 pb-7 sm:p-8">
                                    {/* Modal header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: IG_PINK }}>Instagram Automation</p>
                                            <h3 className="text-[18px] font-bold text-neutral-900 dark:text-white leading-tight">
                                                New IG Flow {selectedAccountId !== "all" ? `— ${selectedAccountObj?.username}` : ""}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="ml-3 mt-0.5 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedAccountId === "all" && (
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Select IG Account</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCreateAccountDropdownOpen(!isCreateAccountDropdownOpen)}
                                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus-visible:border-[var(--primary)] transition-all cursor-pointer flex items-center justify-between"
                                                    >
                                                        <span className={cn(
                                                            "truncate",
                                                            !(newReply.instagram_id || creationAccountFallback?.instagram_id) && "text-neutral-400"
                                                        )}>
                                                            {pages.find(p => p.instagram_id === (newReply.instagram_id || creationAccountFallback?.instagram_id))?.username || "Select an account..."}
                                                        </span>
                                                        <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCreateAccountDropdownOpen && "rotate-180")} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isCreateAccountDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                                className="absolute z-50 w-full mt-2 bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden"
                                                            >
                                                                <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                                                                    <div className="relative">
                                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search accounts..."
                                                                            value={createAccountSearchQuery}
                                                                            onChange={(e) => setCreateAccountSearchQuery(e.target.value)}
                                                                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-transparent focus:border-[var(--primary)]/30 text-sm outline-none transition-all"
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto no-scrollbar p-1">
                                                                    {pages.filter(p => !createAccountSearchQuery || p.username.toLowerCase().includes(createAccountSearchQuery.toLowerCase())).map(p => (
                                                                        <button
                                                                            key={p.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setNewReply({ ...newReply, instagram_id: p.instagram_id, page_id: p.page?.page_id || "" });
                                                                                setIsCreateAccountDropdownOpen(false);
                                                                            }}
                                                                            className={cn(
                                                                                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2",
                                                                                (newReply.instagram_id || creationAccountFallback?.instagram_id) === p.instagram_id
                                                                                    ? "bg-[var(--primary)]/10 dark:bg-[var(--primary)]/100/10 text-[var(--primary)] dark:text-[var(--primary)]/80 font-semibold"
                                                                                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                                            )}
                                                                        >
                                                                            <Instagram className="w-4 h-4 opacity-50" style={{ color: IG_PINK }} />
                                                                            <span className="truncate">{p.username}</span>
                                                                            {(newReply.instagram_id || creationAccountFallback?.instagram_id) === p.instagram_id && (
                                                                                <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: IG_PINK }} />
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                    {pages.filter(p => p.username.toLowerCase().includes(createAccountSearchQuery.toLowerCase())).length === 0 && (
                                                                        <div className="py-4 text-center text-xs text-neutral-500">No accounts found</div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Template Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Support Bot (IG)"
                                                value={newReply.name}
                                                onChange={(e) => setNewReply({ ...newReply, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Reply Type</label>
                                            <select
                                                value={newReply.trigger_type}
                                                onChange={(e) => setNewReply({ ...newReply, trigger_type: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-[var(--primary)] appearance-none transition-all cursor-pointer"
                                            >
                                                <option value="exact">Exact Match</option>
                                                <option value="contains">Contains Word</option>
                                                <option value="starts_with">Starts With</option>
                                                <option value="keywords">Multiple Keywords</option>
                                                <option value="welcome">Welcome</option>
                                                <option value="fallback">Fallback</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Keywords</label>
                                            <input
                                                type="text"
                                                placeholder={['welcome', 'fallback'].includes(newReply.trigger_type) ? "Disabled for this trigger" : "help, support"}
                                                value={newReply.trigger_value}
                                                onChange={(e) => setNewReply({ ...newReply, trigger_value: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-[var(--primary)] transition-all disabled:opacity-50"
                                                disabled={['welcome', 'fallback'].includes(newReply.trigger_type)}
                                            />
                                        </div>
                                        <div className="pt-4 flex flex-col gap-3">
                                            <button
                                                onClick={async () => {
                                                    await handleCreate();
                                                    const latest = replies[replies.length - 1];
                                                    if (latest) await handleToggleStatus({ ...latest, status: 'draft' });
                                                }}
                                                disabled={isCreating}
                                                className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                style={{ background: `linear-gradient(135deg, ${IG_PINK} 0%, #be185d 100%)`, boxShadow: `${IG_PINK}40 0px 4px 14px` }}
                                            >
                                                {isCreating ? 'Creating...' : '⚡ Save & Publish'}
                                            </button>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowCreateModal(false)}
                                                    className="flex-1 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-sm transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleCreate}
                                                    disabled={isCreating}
                                                    className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-[var(--card)] dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {isCreating ? 'Creating...' : 'Save as Draft'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>{/* end inner px-6 */}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ACTION CONFIGURATION MODAL */}
                <AnimatePresence>
                    {showActionModal && (
                        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm" onClick={() => setShowActionModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl relative z-10"
                            >
                                <div className="sm:hidden flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>
                                <div className="px-6 pt-5 pb-8 sm:p-10">
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 tracking-tight">Map IG Shortcut</h3>
                                    <p className="text-sm text-neutral-500 mb-6 font-medium">Select a system event to automate with a new flow.</p>

                                    <div className="space-y-3">
                                        {[
                                            { type: 'action_get_started', label: 'Get Started', icon: <Play className="w-4 h-4" /> },
                                            { type: 'action_no_match', label: 'No Match / Fallback', icon: <RefreshCw className="w-4 h-4" /> },
                                            { type: 'action_ice_breaker', label: 'Ice Breakers', icon: <Layers className="w-4 h-4" /> },
                                        ].map(opt => {
                                            const exists = actions.some(a => a.type === opt.type);
                                            return (
                                                <button
                                                    key={opt.type}
                                                    onClick={() => handleActionCreate(opt.type)}
                                                    disabled={exists || isCreating}
                                                    className={cn(
                                                        "w-full p-4 rounded-3xl border text-left flex items-center justify-between group transition-all",
                                                        exists
                                                            ? "bg-neutral-50/50 border-neutral-100 dark:bg-neutral-900/50 dark:border-neutral-800 opacity-50 cursor-not-allowed"
                                                            : "bg-[var(--card)] dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10/20"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", exists ? "bg-neutral-100 text-neutral-400" : "bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)]/20")}>
                                                            {opt.icon}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-neutral-900 dark:text-white block leading-none">{opt.label}</span>
                                                            {exists && <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest mt-1 block">Already Configured</span>}
                                                        </div>
                                                    </div>
                                                    {!exists && <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-[var(--primary)]" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button onClick={() => setShowActionModal(false)} className="w-full mt-5 py-3 rounded-2xl text-neutral-400 hover:text-neutral-600 font-bold text-xs uppercase tracking-[0.2em] transition-all">Cancel</button>
                                </div>{/* end inner px-6 */}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60]"
                style={{
                    background: "var(--card)",
                    borderTop: "1px solid var(--border)",
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.10)",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)"
                }}>
                <div className="flex items-stretch px-1 pt-1.5 pb-1">
                    {MENUS.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => setActiveMenu(menu.id)}
                            className="flex flex-col items-center gap-0.5 py-1.5 transition-all min-w-0 flex-1 relative"
                            style={{ color: activeMenu === menu.id ? IG_PINK : "var(--muted-foreground)" }}
                        >
                            {/* Active pill indicator */}
                            {activeMenu === menu.id && (
                                <span className="absolute top-0 left-3 right-3 h-[2.5px] rounded-full" style={{ background: IG_PINK }} />
                            )}
                            <div
                                className="w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                                style={{
                                    background: activeMenu === menu.id ? `${IG_PINK}15` : "transparent",
                                    transform: activeMenu === menu.id ? "scale(1.08)" : "scale(1)"
                                }}
                            >
                                <menu.icon className="w-[17px] h-[17px]" strokeWidth={activeMenu === menu.id ? 2.5 : 1.8} />
                            </div>
                            <span className="text-[9.5px] font-medium leading-none" style={{ opacity: activeMenu === menu.id ? 1 : 0.5 }}>
                                {menu.label}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
