"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy,
    CheckCircle2, Target, Bot, MousePointerClick, ArrowLeft,
    Menu, Settings2, Sparkles, Box, RefreshCw, ChevronRight, Facebook as FacebookIcon, Layers,
    ChevronLeft, ChevronDown, ListFilter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PersistentMenu from "./PersistentMenu";
import IceBreakersPanel from "./IceBreakersPanel";
import { AiAgentSettingsPanel } from "../../instagram/AiAgentSettingsPanel";


interface BotReply {
    id: number;
    facebook_page_id: string; // Used in API calls
    name: string;
    trigger_type: string;
    trigger_value: string;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    page_name?: string;
}

interface FacebookPageData {
    id: number;
    page_id: string;
    page_name: string;
    is_enabled: boolean;
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

export default function FacebookBotRepliesPage() {
    const router = useRouter();
    const [replies, setReplies] = useState<BotReply[]>([]);
    const [pages, setPages] = useState<FacebookPageData[]>([]);
    const { showModal, showConfirm } = useModal();
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPageId, setSelectedPageId] = useState<string | "all">("all");
    const [activeMenu, setActiveMenu] = useState<MenuId>('bot_reply');

    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [showPageDropdown, setShowPageDropdown] = useState(false);
    const [quickFindSearch, setQuickFindSearch] = useState("");

    const [actions, setActions] = useState<ActionData[]>([]);
    const [isActionsLoading, setIsActionsLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedActionType, setSelectedActionType] = useState<string | null>(null);

    // Edit modal state
    const [editReply, setEditReply] = useState<BotReply | null>(null);

    const [newReply, setNewReply] = useState({
        name: "",
        facebook_page_id: "",
        trigger_type: "exact",
        trigger_value: ""
    });

    const [isCreatePageDropdownOpen, setIsCreatePageDropdownOpen] = useState(false);
    const [createPageSearchQuery, setCreatePageSearchQuery] = useState("");

    const selectedPageObj = useMemo(() => pages.find(p => p.page_id === selectedPageId) || null, [pages, selectedPageId]);

    const fetchReplies = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/facebook/bot-replies");
            if (response.data.success || response.data.is_success) {
                setReplies(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Fetch Replies Error:", error);
            const errorMsg = error.response?.data?.message || "Failed to load Facebook bot replies";
            showModal("error", "Error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [api, showModal]);

    const fetchPages = useCallback(async () => {
        try {
            const response = await api.get("/social/facebook-connect");
            if (response.data.success || response.data.is_success) {
                const fetchedAccounts = response.data.data.facebook_accounts || [];
                const fetchedPages = fetchedAccounts.flatMap((acc: any) => acc.pages || []);
                setPages(fetchedPages);
            }
        } catch (error) {
            console.error("Fetch Pages Error:", error);
        }
    }, [api]);

    const fetchActions = useCallback(async (pageIdToUse?: string) => {
        const pageId = pageIdToUse || selectedPageId;
        const page = pages.find(p => p.page_id === pageId) || (pages.length ? pages[0] : null);
        if (!page || !page.page_id) return;
        setIsActionsLoading(true);
        try {
            const response = await api.get(`/facebook/actions?page_id=${page.page_id}`);
            if (response.data.success || response.data.is_success) {
                setActions(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Actions Error:", error);
        } finally {
            setIsActionsLoading(false);
        }
    }, [api, selectedPageId, pages]);

    useEffect(() => {
        fetchReplies();
        fetchPages();
    }, [fetchReplies, fetchPages]);

    useEffect(() => {
        if (activeMenu === 'action_buttons' || activeMenu === 'persistent_menu') {
            if (selectedPageId === "all" && pages.length > 0) {
                setSelectedPageId(pages[0].page_id);
            } else if (selectedPageId !== "all") {
                fetchActions();
            }
        }
    }, [activeMenu, selectedPageId, pages, fetchActions]);

    const handleCreate = async () => {
        const rccFb = selectedPageId === "all" ? (pages[0] || null) : selectedPageObj;
        const targetPageId = newReply.facebook_page_id || rccFb?.page_id || "";

        const submitData = { ...newReply, facebook_page_id: targetPageId };

        const isKeywordRequired = !['welcome', 'fallback'].includes(submitData.trigger_type);
        if (!submitData.name || !submitData.facebook_page_id || (isKeywordRequired && !submitData.trigger_value)) {
            showModal("error", "Missing Fields", "Please fill all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const response = await api.post("/facebook/bot-replies", submitData);
            if (response.data.success || response.data.is_success) {
                showModal("success", "Success", "Facebook bot reply created successfully");
                setShowCreateModal(false);
                fetchReplies();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to create Facebook bot reply";
            showModal("error", "Error", errorMsg);
        } finally {
            setIsCreating(false);
            setNewReply({
                name: "",
                facebook_page_id: targetPageId,
                trigger_type: "exact",
                trigger_value: ""
            });
            setIsCreatePageDropdownOpen(false);
            setCreatePageSearchQuery("");
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
                    await api.delete(`/facebook/bot-replies/${id}`);
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
            await api.patch(`/facebook/bot-replies/${reply.id}/${newStatus}`);
            showModal("success", "Success", `Bot reply set to ${newStatus === 'publish' ? 'Live' : 'Draft'}`);
            fetchReplies();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to update status";
            showModal("error", "Error", errorMsg);
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await api.post(`/facebook/bot-replies/${id}/duplicate`);
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
            await api.patch(`/facebook/bot-replies/${action.automation_id}/${newStatus}`);
            showModal("success", "Success", `Action status updated`);
            if (selectedPageId !== "all") fetchActions();
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
                    await api.delete(`/facebook/actions/${action.automation_id}`);
                    showModal("success", "Unmapped", "Action unmapped successfully");
                    if (selectedPageId !== "all") {
                        fetchActions(selectedPageId);
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
        if (!type || !selectedPageObj || !selectedPageObj.page_id) return;
        setIsCreating(true);
        try {
            const response = await api.post("/facebook/actions", {
                page_id: selectedPageObj.page_id,
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
        router.push(`/dashboard/flows?id=${replyId}&platform=facebook`);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 200;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    const handlePageSelect = (id: string | "all") => {
        setSelectedPageId(id);
        setShowPageDropdown(false);
        if (id !== "all") {
            const page = pages.find(p => p.page_id === id);
            if (page) {
                setNewReply(prev => ({
                    ...prev,
                    facebook_page_id: page.page_id
                }));
            }
        }
    };

    const filteredReplies = useMemo(() => {
        return replies.filter(r =>
            (selectedPageId === "all" || r.facebook_page_id === selectedPageId) &&
            (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.trigger_value.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [replies, selectedPageId, searchQuery]);

    const creationPageFallback = selectedPageId === "all" ? (pages[0] || null) : selectedPageObj;

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
                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-[#0866FF]">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-medium tracking-widest uppercase leading-none text-[#0866FF]">Facebook</span>
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
                                <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#0866FF]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── PAGE BODY ─────────────────────────────────────────────────── */}
            <div className="w-full pt-5 pb-20 md:pb-10 space-y-4 md:space-y-6">

                {/* Page filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <button
                        onClick={() => handlePageSelect("all")}
                        className={cn(
                            "px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-all shrink-0 border",
                            selectedPageId === "all"
                                ? "bg-[#0866FF] border-[#0866FF] text-white shadow-sm"
                                : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                    >
                        All Pages
                    </button>
                    {pages.map(page => (
                        <button
                            key={page.id}
                            onClick={() => handlePageSelect(page.page_id)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-all shrink-0 border",
                                selectedPageId === page.page_id
                                    ? "bg-[#0866FF] border-[#0866FF] text-white shadow-sm"
                                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            )}
                        >
                            {page.page_name}
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
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                        <input
                                            type="text"
                                            placeholder="Search replies..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all placeholder:opacity-50"
                                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="w-full sm:w-auto text-white px-5 py-3 rounded-xl font-semibold text-[13px] tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap shadow-lg shadow-blue-500/20"
                                        style={{ background: "linear-gradient(135deg, #0866FF 0%, #0055D4 100%)" }}
                                    >
                                        <Plus className="w-4 h-4" /> Create FB Flow
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
                                                className="group relative bg-[var(--card)] dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 md:border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#0866FF]/30 transition-all"
                                            >
                                                {/* Left accent bar */}
                                                <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full transition-colors", reply.status === 'published' ? 'bg-[#0866FF]' : 'bg-neutral-200 dark:bg-neutral-700')} />

                                                {/* ── MOBILE CARD LAYOUT ── */}
                                                <div className="md:hidden">
                                                    <button
                                                        onClick={() => setEditReply(reply)}
                                                        className="w-full text-left p-4"
                                                    >
                                                        <div className="flex items-start gap-3.5">
                                                            <div className={cn(
                                                                "w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center",
                                                                reply.status === 'published'
                                                                    ? "bg-[#0866FF]/10 text-[#0866FF]"
                                                                    : "text-[var(--muted-foreground)]"
                                                            )} style={{ background: reply.status !== 'published' ? "var(--glass-border)" : "" }}>
                                                                <MessageSquare className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pt-0.5">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h4 className="text-[14px] font-bold truncate" style={{ color: "var(--foreground)" }}>{reply.name}</h4>
                                                                    {reply.status === 'published' ? (
                                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0"
                                                                            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0"
                                                                            style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Draft
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {selectedPageId === "all" && (
                                                                    <span className="text-[11px] font-medium mt-0.5 block" style={{ color: "#0866FF" }}>
                                                                        {pages.find(p => p.page_id === reply.facebook_page_id)?.page_name || "Unknown Page"}
                                                                    </span>
                                                                )}
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-[11px] font-medium inline-flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                                                                        <Target className="w-3 h-3" /> {reply.trigger_type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>

                                                    <div className="border-t grid grid-cols-4 divide-x" style={{ borderColor: "var(--glass-border)" }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setEditReply(reply); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors active:scale-95"
                                                            style={{ color: "#0866FF" }}
                                                        >
                                                            <Settings2 className="w-4 h-4" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }}
                                                            className={cn("py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors active:scale-95",
                                                                reply.status === 'published' ? "text-amber-500" : "text-emerald-500"
                                                            )}
                                                        >
                                                            {reply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                            {reply.status === 'published' ? 'Pause' : 'Go Live'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors active:scale-95"
                                                            style={{ color: "var(--muted-foreground)" }}
                                                        >
                                                            <Copy className="w-4 h-4" /> Copy
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors active:scale-95"
                                                            style={{ color: "var(--muted-foreground)" }}
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ── DESKTOP CARD LAYOUT ── */}
                                                <div className="hidden md:grid grid-cols-12 items-center gap-4 px-6 py-5">
                                                    <div className="flex items-center gap-4 col-span-5 min-w-0">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-all",
                                                            reply.status === 'published' ? "bg-[#0866FF]/10 text-[#0866FF]" : ""
                                                        )} style={{ background: reply.status !== 'published' ? "var(--glass-border)" : "" }}>
                                                            <MessageSquare className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <h4 className="text-[15px] font-bold truncate" style={{ color: "var(--foreground)" }}>{reply.name}</h4>
                                                            {selectedPageId === "all" && (
                                                                <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 truncate max-w-[180px] inline-block" style={{ color: "#0866FF" }}>
                                                                    {pages.find(p => p.page_id === reply.facebook_page_id)?.page_name || "Unknown Page"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center col-span-2">
                                                        {reply.status === 'published' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                                                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                                                style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Draft
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center col-span-2">
                                                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                                                            style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                                                            {reply.trigger_type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2 col-span-3">
                                                        <button onClick={(e) => { e.stopPropagation(); goToFlow(reply.id); }}
                                                            className="py-2 px-4 rounded-xl text-xs font-bold transition-all active:scale-95"
                                                            style={{ background: "rgba(8,102,255,0.1)", color: "#0866FF", border: "1px solid rgba(8,102,255,0.2)" }}>
                                                            Edit Flow
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }}
                                                            className={cn("p-2 rounded-xl transition-all active:scale-95",
                                                                reply.status === 'published' ? "text-amber-500" : "text-emerald-500")}
                                                            style={{ border: "1px solid var(--glass-border)" }}
                                                            title={reply.status === 'published' ? "Pause" : "Go Live"}>
                                                            {reply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }}
                                                            className="p-2 rounded-xl transition-all active:scale-95"
                                                            style={{ border: "1px solid var(--glass-border)", color: "var(--muted-foreground)" }}
                                                            title="Duplicate">
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }}
                                                            className="p-2 rounded-xl transition-all active:scale-95"
                                                            style={{ border: "1px solid var(--glass-border)", color: "var(--muted-foreground)" }}
                                                            title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(8,102,255,0.08)" }}>
                                            <MessageSquare className="w-8 h-8" style={{ color: "#0866FF" }} />
                                        </div>
                                        <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>No Automations Found</h3>
                                        <p className="text-sm mt-1 mb-6 max-w-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Create automated responses for your Facebook messages.</p>
                                        <button onClick={() => setShowCreateModal(true)}
                                            className="px-6 py-2.5 rounded-xl font-medium text-sm shadow-md transition-transform active:scale-95 text-white"
                                            style={{ background: "linear-gradient(135deg, #0866FF 0%, #0055D4 100%)" }}>
                                            Build First Reply
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeMenu === 'ice_breakers' && (
                            <IceBreakersPanel
                                pages={pages}
                                selectedPageId={selectedPageId}
                                channelType="facebook"
                            />
                        )}

                        {activeMenu === 'action_buttons' && (
                            <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">FB Action Shortcuts</h2>
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1">Connect system events to custom automation layers</p>
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
                                                'action_get_started': { label: 'Get Started', desc: 'Triggered when someone opens your Messenger' },
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
                                                    className="group bg-neutral-50/50 dark:bg-neutral-950/20 shadow-sm border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all flex flex-col justify-between cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm",
                                                                action.automation_id ? "bg-blue-100 text-[#0866FF] dark:bg-blue-900/40" : "bg-[var(--card)] dark:bg-neutral-900 text-neutral-400 dark:border-neutral-800"
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
                                                                className="w-full py-3 rounded-2xl bg-[var(--card)] dark:bg-neutral-900 border-2 border-blue-100 dark:border-blue-900/10 text-[#0866FF] dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Box size={14} /> Open Flow Logic
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleActionCreate(action.type); }}
                                                                className="w-full py-3 rounded-2xl bg-[#0866FF] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
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
                                        <div className="w-20 h-20 rounded-3xl bg-[#0866FF]/5 dark:bg-[#0866FF]/10 flex items-center justify-center mb-6">
                                            <MousePointerClick className="w-10 h-10 text-[#0866FF]" />
                                        </div>
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">No custom shortcuts</h3>
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] max-w-xs mt-2 mb-8 mx-auto leading-relaxed">Map FB system events to neural automation layers to handle complex edge cases.</p>
                                        <button
                                            onClick={() => setShowActionModal(true)}
                                            className="bg-neutral-900 dark:bg-[var(--card)] text-white dark:text-neutral-900 px-8 py-3 rounded-2xl font-medium text-[11px] uppercase tracking-widest shadow-xl shadow-neutral-950/20 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            Build custom layer
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeMenu === 'persistent_menu' && selectedPageObj && selectedPageId !== "all" && (
                            <PersistentMenu
                                pageId={selectedPageObj.page_id}
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
                                {selectedPageId !== "all" ? (
                                    <div className="w-full">
                                        <AiAgentSettingsPanel
                                            platform="facebook"
                                            accountId={selectedPageId}
                                            accountName={selectedPageObj?.page_name || "Facebook Page"}
                                        />
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full max-w-md p-10 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex flex-col items-center gap-4 text-center grayscale-0 mx-auto"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
                                            <Bot className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h4 className="text-lg font-black text-blue-900 dark:text-blue-400 uppercase tracking-tight leading-tight">Environment Required</h4>
                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-500/80 uppercase tracking-widest leading-relaxed">Please select a specific Facebook page from the header to enable neural agent configuration.</p>
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
                                className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                                onClick={() => setEditReply(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 60 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 60 }}
                                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                                className="w-full max-w-md rounded-t-[28px] sm:rounded-3xl shadow-2xl relative z-10 overflow-hidden"
                                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                            >
                                <div className="sm:hidden flex justify-center pt-3.5 pb-1">
                                    <div className="w-10 h-1 rounded-full" style={{ background: "var(--glass-border)" }} />
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "#0866FF" }}>Bot Reply</p>
                                            <h3 className="text-[17px] font-bold leading-tight truncate pr-4" style={{ color: "var(--foreground)" }}>{editReply.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {editReply.status === 'published' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Draft
                                                </span>
                                            )}
                                            <button onClick={() => setEditReply(null)}
                                                className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--muted-foreground)" }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-5">
                                        <div className="rounded-2xl p-3.5" style={{ background: "var(--glass-bg)" }}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>Trigger Type</p>
                                            <p className="text-[13px] font-bold" style={{ color: "var(--foreground)" }}>{editReply.trigger_type}</p>
                                        </div>
                                        {editReply.trigger_value && (
                                            <div className="rounded-2xl p-3.5" style={{ background: "var(--glass-bg)" }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted-foreground)" }}>Keyword</p>
                                                <p className="text-[13px] font-bold truncate" style={{ color: "var(--foreground)" }}>{editReply.trigger_value}</p>
                                            </div>
                                        )}
                                        {selectedPageId === "all" && (
                                            <div className="rounded-2xl p-3.5 col-span-2" style={{ background: "rgba(8,102,255,0.06)" }}>
                                                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#0866FF" }}>Facebook Page</p>
                                                <p className="text-[13px] font-bold truncate" style={{ color: "var(--foreground)" }}>
                                                    {pages.find(p => p.page_id === editReply.facebook_page_id)?.page_name || "Unknown"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => { setEditReply(null); goToFlow(editReply.id); }}
                                        className="w-full py-3 rounded-xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-500/25 mb-3"
                                        style={{ background: "linear-gradient(135deg, #0866FF 0%, #0055D4 100%)" }}
                                    >
                                        <Box className="w-4 h-4" /> Open Flow Builder
                                    </button>

                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => { handleToggleStatus(editReply); setEditReply(null); }}
                                            className={cn("py-3 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-1.5 border transition-all",
                                                editReply.status === 'published'
                                                    ? "text-amber-500" : "text-emerald-500"
                                            )}
                                            style={{ background: editReply.status === 'published' ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", borderColor: editReply.status === 'published' ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)" }}>
                                            {editReply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            {editReply.status === 'published' ? 'Pause' : 'Go Live'}
                                        </button>
                                        <button onClick={() => { handleDuplicate(editReply.id); setEditReply(null); }}
                                            className="py-3 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-1.5 transition-all"
                                            style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                                            <Copy className="w-4 h-4" /> Duplicate
                                        </button>
                                        <button onClick={() => { setEditReply(null); handleDelete(editReply.id); }}
                                            className="py-3 rounded-xl text-[12px] font-semibold flex flex-col items-center gap-1.5 transition-all"
                                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="pb-6 sm:pb-0" />
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
                                className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                                onClick={() => setShowCreateModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10"
                                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                            >
                                <div className="sm:hidden flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full" style={{ background: "var(--glass-border)" }} />
                                </div>
                                <div className="px-6 pt-4 pb-7 sm:p-8">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#0866FF" }}>Facebook Automation</p>
                                            <h3 className="text-[18px] font-bold leading-tight" style={{ color: "var(--foreground)" }}>
                                                New FB Flow {selectedPageId !== "all" ? `— ${selectedPageObj?.page_name}` : ""}
                                            </h3>
                                        </div>
                                        <button onClick={() => setShowCreateModal(false)}
                                            className="ml-3 mt-0.5 p-1.5 rounded-lg shrink-0 transition-colors" style={{ color: "var(--muted-foreground)" }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {selectedPageId === "all" && (
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Select FB Page</label>
                                                <div className="relative">
                                                    <button type="button" onClick={() => setIsCreatePageDropdownOpen(!isCreatePageDropdownOpen)}
                                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all cursor-pointer flex items-center justify-between"
                                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}>
                                                        <span className={cn("truncate", !(newReply.facebook_page_id || creationPageFallback?.page_id) && "opacity-50")}>
                                                            {pages.find(p => p.page_id === (newReply.facebook_page_id || creationPageFallback?.page_id))?.page_name || "Select a page..."}
                                                        </span>
                                                        <ChevronDown className={cn("w-4 h-4 transition-transform", isCreatePageDropdownOpen && "rotate-180")} style={{ color: "var(--muted-foreground)" }} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isCreatePageDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                                className="absolute z-50 w-full mt-2 overflow-hidden rounded-xl shadow-xl"
                                                                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                                                                <div className="p-2" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                                                                    <div className="relative">
                                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                                                        <input type="text" placeholder="Search pages..." value={createPageSearchQuery}
                                                                            onChange={(e) => setCreatePageSearchQuery(e.target.value)}
                                                                            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all"
                                                                            style={{ background: "var(--glass-bg)", color: "var(--foreground)", border: "1px solid transparent" }}
                                                                            autoFocus />
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto no-scrollbar p-1">
                                                                    {pages.filter(p => !createPageSearchQuery || p.page_name.toLowerCase().includes(createPageSearchQuery.toLowerCase())).map(p => (
                                                                        <button key={p.id} type="button"
                                                                            onClick={() => { setNewReply({ ...newReply, facebook_page_id: p.page_id }); setIsCreatePageDropdownOpen(false); }}
                                                                            className={cn("w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2",
                                                                                (newReply.facebook_page_id || creationPageFallback?.page_id) === p.page_id
                                                                                    ? "font-semibold" : ""
                                                                            )}
                                                                            style={(newReply.facebook_page_id || creationPageFallback?.page_id) === p.page_id
                                                                                ? { background: "rgba(8,102,255,0.1)", color: "#0866FF" }
                                                                                : { color: "var(--foreground)" }}>
                                                                            <FacebookIcon className="w-4 h-4 opacity-50" style={{ color: "#0866FF" }} />
                                                                            <span className="truncate">{p.page_name}</span>
                                                                            {(newReply.facebook_page_id || creationPageFallback?.page_id) === p.page_id && (
                                                                                <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: "#0866FF" }} />
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                    {pages.filter(p => p.page_name.toLowerCase().includes(createPageSearchQuery.toLowerCase())).length === 0 && (
                                                                        <div className="py-4 text-center text-xs" style={{ color: "var(--muted-foreground)" }}>No pages found</div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Template Name</label>
                                            <input type="text" placeholder="e.g. Support Bot (FB)" value={newReply.name}
                                                onChange={(e) => setNewReply({ ...newReply, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Reply Type</label>
                                            <select value={newReply.trigger_type} onChange={(e) => setNewReply({ ...newReply, trigger_type: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none transition-all cursor-pointer"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}>
                                                <option value="exact">Exact Match</option>
                                                <option value="contains">Contains Word</option>
                                                <option value="starts_with">Starts With</option>
                                                <option value="keywords">Multiple Keywords</option>
                                                <option value="welcome">Welcome</option>
                                                <option value="fallback">Fallback</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>Keywords</label>
                                            <input type="text"
                                                placeholder={['welcome', 'fallback'].includes(newReply.trigger_type) ? "Disabled for this trigger" : "help, support"}
                                                value={newReply.trigger_value} onChange={(e) => setNewReply({ ...newReply, trigger_value: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                disabled={['welcome', 'fallback'].includes(newReply.trigger_type)} />
                                        </div>
                                        <div className="pt-4 flex flex-col gap-3">
                                            <button onClick={async () => { await handleCreate(); const latest = replies[replies.length - 1]; if (latest) await handleToggleStatus({ ...latest, status: 'draft' }); }}
                                                disabled={isCreating}
                                                className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                style={{ background: "linear-gradient(135deg, #0866FF 0%, #0055D4 100%)" }}>
                                                {isCreating ? 'Creating...' : 'Save & Publish'}
                                            </button>
                                            <div className="flex gap-3">
                                                <button onClick={() => setShowCreateModal(false)}
                                                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                                                    style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                                                    Cancel
                                                </button>
                                                <button onClick={handleCreate} disabled={isCreating}
                                                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                    style={{ background: "var(--glass-bg)", color: "var(--foreground)", border: "1px solid var(--glass-border)" }}>
                                                    {isCreating ? 'Creating...' : 'Save as Draft'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* ACTION CONFIGURATION MODAL */}
                <AnimatePresence>
                    {showActionModal && (
                        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                                onClick={() => setShowActionModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl relative z-10"
                                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                                <div className="sm:hidden flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full" style={{ background: "var(--glass-border)" }} />
                                </div>
                                <div className="px-6 pt-5 pb-8 sm:p-10">
                                    <h3 className="text-xl font-bold mb-1 tracking-tight" style={{ color: "var(--foreground)" }}>Map FB Shortcut</h3>
                                    <p className="text-sm mb-6 font-medium" style={{ color: "var(--muted-foreground)" }}>Select a system event to automate with a new flow.</p>

                                    <div className="space-y-3">
                                        {[
                                            { type: 'action_get_started', label: 'Get Started', icon: <Play className="w-4 h-4" /> },
                                            { type: 'action_no_match', label: 'No Match / Fallback', icon: <RefreshCw className="w-4 h-4" /> },
                                            { type: 'action_ice_breaker', label: 'Ice Breakers', icon: <Layers className="w-4 h-4" /> },
                                        ].map(opt => {
                                            const exists = actions.some(a => a.type === opt.type);
                                            return (
                                                <button key={opt.type} onClick={() => handleActionCreate(opt.type)} disabled={exists || isCreating}
                                                    className={cn("w-full p-4 rounded-3xl border text-left flex items-center justify-between group transition-all",
                                                        exists ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500/50")}
                                                    style={{ background: "var(--glass-bg)", borderColor: exists ? "var(--glass-border)" : "var(--glass-border)" }}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                                            exists ? "" : "")}
                                                            style={{ background: exists ? "var(--glass-border)" : "rgba(8,102,255,0.1)", color: exists ? "var(--muted-foreground)" : "#0866FF" }}>
                                                            {opt.icon}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold block leading-none" style={{ color: "var(--foreground)" }}>{opt.label}</span>
                                                            {exists && <span className="text-[10px] font-black uppercase tracking-widest mt-1 block" style={{ color: "#f59e0b" }}>Already Configured</span>}
                                                        </div>
                                                    </div>
                                                    {!exists && <ChevronRight className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button onClick={() => setShowActionModal(false)}
                                        className="w-full mt-5 py-3 rounded-2xl font-medium text-sm transition-all"
                                        style={{ color: "var(--muted-foreground)" }}>Cancel</button>
                                </div>
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
                            style={{ color: activeMenu === menu.id ? "#0866FF" : "var(--muted-foreground)" }}
                        >
                            {/* Active pill indicator */}
                            {activeMenu === menu.id && (
                                <span className="absolute top-0 left-3 right-3 h-[2.5px] rounded-full bg-[#0866FF]" />
                            )}
                            <div
                                className="w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                                style={{
                                    background: activeMenu === menu.id ? "rgba(8,102,255,0.09)" : "transparent",
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

