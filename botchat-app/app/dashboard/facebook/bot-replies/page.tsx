"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy,
    CheckCircle2, Target, Bot, MousePointerClick,
    Menu as MenuIcon, Settings2, Sparkles, Box, RefreshCw, ChevronRight,
    ChevronLeft, ChevronDown, ListFilter, ArrowLeft, Facebook as FacebookIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PersistentMenu from "./PersistentMenu";

interface BotReply {
    id: number;
    facebook_page_id: string;
    name: string;
    trigger_type: string;
    trigger_value: string;
    status: 'draft' | 'published';
    created_at: string;
    updated_at: string;
    page_name?: string;
}

interface FacebookPage {
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
    { id: 'ai_agent', label: 'AI Agent', icon: Bot },
    { id: 'action_buttons', label: 'Action Buttons', icon: MousePointerClick },
    { id: 'persistent_menu', label: 'Persistent Menu', icon: MenuIcon },
] as const;

type MenuId = typeof MENUS[number]['id'];

export default function BotRepliesPage() {
    const router = useRouter();
    const { showModal, showConfirm } = useModal();
    const [replies, setReplies] = useState<BotReply[]>([]);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPageId, setSelectedPageId] = useState<string | "all">("all");
    const [activeMenu, setActiveMenu] = useState<MenuId>('bot_reply');

    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const [showPageDropdown, setShowPageDropdown] = useState(false);
    const [quickFindSearch, setQuickFindSearch] = useState("");

    const [newReply, setNewReply] = useState({
        name: "",
        facebook_page_id: "",
        trigger_type: "exact",
        trigger_value: ""
    });

    const [isCreatePageDropdownOpen, setIsCreatePageDropdownOpen] = useState(false);
    const [createPageSearchQuery, setCreatePageSearchQuery] = useState("");

    const [actions, setActions] = useState<ActionData[]>([]);
    const [isActionsLoading, setIsActionsLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedActionType, setSelectedActionType] = useState<string | null>(null);

    const fetchReplies = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/facebook/bot-replies");
            if (response.data.success || response.data.is_success) {
                setReplies(response.data.data || []);
            }
        } catch (error: any) {
            console.error("Fetch Replies Error:", error);
            const errorMsg = error.response?.data?.message || "Failed to load bot replies";
            showModal("error", "Error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPages = async () => {
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
    };

    const fetchActions = async (pageId: string) => {
        setIsActionsLoading(true);
        try {
            const response = await api.get(`/facebook/actions?page_id=${pageId}`);
            if (response.data.success || response.data.is_success) {
                setActions(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Actions Error:", error);
        } finally {
            setIsActionsLoading(false);
        }
    };

    useEffect(() => {
        fetchReplies();
        fetchPages();
    }, []);

    useEffect(() => {
        if (activeMenu === 'action_buttons' || activeMenu === 'persistent_menu') {
            if (selectedPageId === "all" && pages.length > 0) {
                setSelectedPageId(pages[0].page_id);
            } else if (selectedPageId !== "all") {
                fetchActions(selectedPageId);
            }
        }
    }, [activeMenu, selectedPageId, pages]);

    const handleCreate = async () => {
        const targetPageId = newReply.facebook_page_id || (selectedPageId === "all" ? (pages[0]?.page_id || "") : selectedPageId);
        const submitData = { ...newReply, facebook_page_id: targetPageId };

        const isKeywordRequired = !['welcome', 'fallback'].includes(submitData.trigger_type);
        if (!submitData.name || !submitData.facebook_page_id || (isKeywordRequired && !submitData.trigger_value)) {
            showModal("error", "Error", "Please fill all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const response = await api.post("/facebook/bot-replies", submitData);
            if (response.data.success || response.data.is_success) {
                showModal("success", "Created", "Bot reply created successfully");
                setShowCreateModal(false);
                fetchReplies();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to create bot reply";
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
            showModal("success", "Updated", `Bot reply set to ${newStatus === 'publish' ? 'Live' : 'Draft'}`);
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
            showModal("success", "Updated", `Action status updated`);
            if (selectedPageId !== "all") {
                fetchActions(selectedPageId);
            }
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
            setNewReply(prev => ({ ...prev, facebook_page_id: id }));
        }
    };

    const filteredReplies = useMemo(() => {
        return replies.filter(r =>
            (selectedPageId === "all" || r.facebook_page_id === selectedPageId) &&
            (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.trigger_value.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [replies, selectedPageId, searchQuery]);

    const creationPageIdFallback = selectedPageId === "all" ? (pages[0]?.page_id || "") : selectedPageId;

    const DS = {
        accent: "#0866FF",
        accentSoft: "rgba(8,102,255,0.06)",
        bg: "var(--background)",
        card: "var(--card)",
        border: "var(--border)",
        ink: "var(--foreground)",
        ink2: "var(--muted-foreground)",
        ink3: "var(--muted-foreground-3, #8e8e8e)",
    };

    return (
        <div className="min-h-screen bg-transparent font-sans w-full min-w-0">
            {/* 1. PREMIUM BRANDED HEADER */}
            <div className="sticky top-0 z-[50] bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0866FF]">Facebook Automation</span>
                            <div className="w-1 h-1 rounded-full bg-neutral-300" />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0866FF]/10 rounded-full">
                                <FacebookIcon size={10} className="text-[#0866FF] fill-[#0866FF]" />
                                <span className="text-[9px] font-medium text-[#0866FF]">Neural Node</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight leading-none mt-1 uppercase">Facebook Reply Manager</h1>
                    </div>
                </div>

                <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                    {MENUS.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => setActiveMenu(menu.id)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[13px] font-medium uppercase tracking-wider flex items-center gap-2 transition-all",
                                activeMenu === menu.id
                                    ? "bg-white dark:bg-neutral-700 text-[#0866FF] shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                            )}
                        >
                            <menu.icon size={14} strokeWidth={2} />
                            {menu.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-[#0866FF] transition-all"><Settings2 size={18} /></button>
                    <button className="px-6 py-2.5 rounded-2xl bg-[#0866FF] text-white text-[13px] font-medium uppercase tracking-wider shadow-lg shadow-[#0866FF]/20 hover:scale-105 active:scale-95 transition-all">Pulse stats</button>
                </div>
            </div>

            <div className="p-4 sm:p-8 space-y-8">
                {/* 2. PAGES SELECTOR (REFINED) */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
                    <div className="flex-1 min-w-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 shadow-sm flex items-center relative">
                        <button onClick={() => scroll('left')} className="p-2 flex-shrink-0 text-neutral-400 hover:text-[#0866FF] transition-colors z-10 bg-white dark:bg-neutral-900 shadow-[10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-l-xl">
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div ref={scrollRef} className="flex-1 min-w-0 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2 items-center">
                            <button
                                onClick={() => handlePageSelect("all")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[14px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                    selectedPageId === "all"
                                        ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900"
                                        : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                )}
                            >
                                All Accounts
                            </button>
                            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1 flex-shrink-0" />
                            {pages.map(page => (
                                <button
                                    key={page.page_id}
                                    onClick={() => handlePageSelect(page.page_id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap",
                                        selectedPageId === page.page_id
                                            ? "bg-[#0866FF]/10 text-[#0866FF] shadow-sm border border-[#0866FF]/20"
                                            : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-transparent"
                                    )}
                                >
                                    {page.page_name}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => scroll('right')} className="p-2 text-neutral-400 hover:text-[#0866FF] transition-colors z-10 bg-white dark:bg-neutral-900 shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-r-xl">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative shrink-0 z-20">
                        <button
                            onClick={() => setShowPageDropdown(!showPageDropdown)}
                            className="h-full px-5 py-3 sm:py-0 w-full sm:w-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex items-center justify-between sm:justify-center gap-3 text-[13px] font-black uppercase tracking-wider hover:border-[#0866FF]/30 transition-colors text-neutral-700 dark:text-neutral-300"
                        >
                            <div className="flex items-center gap-2">
                                <ListFilter className="w-4 h-4 text-[#0866FF]" />
                                Quick Find
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", showPageDropdown && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                            {showPageDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-[calc(100%+8px)] w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden"
                                >
                                    <div className="flex flex-col max-h-[350px]">
                                        <div className="p-2 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search pages..."
                                                    value={quickFindSearch}
                                                    onChange={(e) => setQuickFindSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-transparent focus:bg-white dark:focus:bg-neutral-800 focus:border-[#0866FF]/20 text-xs outline-none transition-all"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-1 overflow-y-auto custom-scrollbar">
                                            <button
                                                onClick={() => { handlePageSelect("all"); setQuickFindSearch(""); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                                    selectedPageId === "all" ? "bg-[#0866FF]/10 text-[#0866FF]" : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                )}
                                            >
                                                All Accounts
                                            </button>
                                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                                            {pages
                                                .filter(page => !quickFindSearch || page.page_name.toLowerCase().includes(quickFindSearch.toLowerCase()))
                                                .map(page => (
                                                    <button
                                                        key={page.page_id}
                                                        onClick={() => { handlePageSelect(page.page_id); setQuickFindSearch(""); }}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all truncate flex items-center gap-2",
                                                            selectedPageId === page.page_id ? "bg-[#0866FF]/10 text-[#0866FF]" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        )}
                                                    >
                                                        <FacebookIcon className="w-3.5 h-3.5 text-[#0866FF] shrink-0" />
                                                        <span className="truncate">{page.page_name}</span>
                                                    </button>
                                                ))}
                                            {pages.filter(page => page.page_name.toLowerCase().includes(quickFindSearch.toLowerCase())).length === 0 && (
                                                <div className="py-8 text-center px-4">
                                                    <Search className="w-8 h-8 text-neutral-200 dark:text-neutral-800 mx-auto mb-2" />
                                                    <p className="text-xs text-neutral-400 font-medium italic">No pages found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. MAIN WORKSPACE */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm w-full min-w-0">
                    <AnimatePresence mode="wait">

                        {/* BOT REPLIES CONTENT */}
                        {activeMenu === 'bot_reply' && (
                            <motion.div
                                key="bot_reply"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <input
                                            type="text"
                                            placeholder="Search replies..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-transparent focus:bg-white focus:border-purple-300 dark:focus:border-purple-500/30 text-sm outline-none transition-all placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                                    >
                                        <Sparkles className="w-4 h-4" /> Create Auto-Reply
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                                        ))}
                                    </div>
                                ) : filteredReplies.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredReplies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="group bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/60 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-purple-200 dark:hover:border-purple-900/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10"
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center",
                                                        reply.status === 'published' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                                    )}>
                                                        <MessageSquare className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[15px] font-bold text-neutral-900 dark:text-white truncate">{reply.name}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={cn(
                                                                "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded",
                                                                reply.status === 'published' ? "bg-emerald-100/50 text-emerald-700 dark:text-emerald-400" : "bg-neutral-200/50 text-neutral-600 dark:text-neutral-400"
                                                            )}>
                                                                {reply.status}
                                                            </span>
                                                            <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">
                                                                Type: {reply.trigger_type}
                                                            </span>
                                                            {selectedPageId === "all" && (
                                                                <>
                                                                    <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>
                                                                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-500/10 px-2 rounded-full truncate max-w-[120px] sm:max-w-none">
                                                                        {pages.find(p => p.page_id === reply.facebook_page_id)?.page_name || "Unknown"}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <button
                                                        onClick={() => window.location.href = `/dashboard/flows?id=${reply.id}&platform=facebook`}
                                                        className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm active:scale-95 transition-all text-center whitespace-nowrap"
                                                    >
                                                        Edit Flow
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(reply)}
                                                        className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 transition-all active:scale-95"
                                                        title={reply.status === 'published' ? "Pause" : "Live"}
                                                    >
                                                        {reply.status === 'published' ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicate(reply.id)}
                                                        className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 transition-all active:scale-95"
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="w-4 h-4 text-purple-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(reply.id)}
                                                        className="p-2.5 rounded-lg border border-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all active:scale-95"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-purple-400" />
                                        </div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No Automations Found</h3>
                                    <p className="text-sm text-neutral-500 max-w-xs mt-1 mb-6 font-medium">Create automated responses for your Facebook DMs and comments.</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 rounded-xl font-medium text-sm shadow-md hover:scale-105 transition-transform"
                                    >
                                        Build First Reply
                                    </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* OTHER TABS */}
                        {activeMenu === 'action_buttons' && (
                            <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                    <div>
                                        <div className="text-[10px] font-semibold uppercase tracking-widest text-[#0866FF] mb-2">Configure Action</div>
                                        <h3 className="text-3xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tight">Facebook Action Shortcuts</h3>
                                        <p className="text-xs text-neutral-400 mt-2 font-medium">Connect system events to custom automation layers</p>
                                    </div>
                                    <button
                                        onClick={() => fetchActions(selectedPageId !== "all" ? selectedPageId : (pages[0]?.page_id))}
                                        className="self-start sm:self-center p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                                    >
                                        <RefreshCw className={cn("w-4 h-4", isActionsLoading && "animate-spin")} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {actions.map((item) => {
                                        const isMapped = !!item.automation_id;
                                        const isLive = item.status === 'published';

                                        return (
                                            <div key={item.type} className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-6 transition-all hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-[0_20px_50px_-20px_rgba(168,85,247,0.15)] flex flex-col h-full">
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm",
                                                        isMapped ? "bg-purple-50 text-purple-600 dark:bg-purple-950/40" : "bg-neutral-50 text-neutral-400 dark:bg-neutral-800/40"
                                                    )}>
                                                        <MousePointerClick className="w-7 h-7" />
                                                    </div>

                                                    {isMapped && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleActionToggle(item)}
                                                                className={cn(
                                                                    "p-2.5 rounded-xl border transition-all active:scale-90",
                                                                    isLive ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                                )}
                                                                title={isLive ? "Pause Action" : "Resume Action"}
                                                            >
                                                                {isLive ? <Pause size={15} /> : <Play size={15} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleActionDelete(item)}
                                                                className="p-2.5 rounded-xl border bg-red-50 text-red-500 border-red-100 hover:bg-red-100 transition-all active:scale-90"
                                                                title="Unmap Action"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white text-lg leading-none uppercase tracking-tight">{item.label}</h3>
                                                        {isMapped && (
                                                            <div className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                isLive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-neutral-300"
                                                            )} />
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed max-w-[90%]">
                                                        {isMapped
                                                            ? `Currently mapped to an active flow layer. Click below to modify logic.`
                                                            : `This action is currently using the system default response.`}
                                                    </p>
                                                </div>
                                                <div className="mt-8">
                                                    {isMapped ? (
                                                        <button
                                                            onClick={() => goToFlow(item.automation_id!)}
                                                            className="w-full py-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-purple-100 dark:border-purple-900/10 text-purple-600 dark:text-purple-400 text-[11px] font-semibold uppercase tracking-wider shadow-sm hover:shadow-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Box size={14} /> Open Flow Logic
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleConfigureAction(item.type)}
                                                            className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[11px] font-semibold uppercase tracking-widest shadow-xl shadow-neutral-950/10 hover:shadow-purple-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Plus size={14} strokeWidth={2} /> Create Custom Layer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Action Management Modal */}
                                {showActionModal && (
                                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                                        <div className="absolute inset-0 bg-white/60 dark:bg-neutral-950/60 backdrop-blur-md" onClick={() => setShowActionModal(false)} />
                                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[40px] p-10 w-full max-w-xl shadow-2xl">
                                            <div className="mb-8">
                                                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-600 mb-2">Configure Action</div>
                                                <h3 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Select Target Flow</h3>
                                                <p className="text-xs text-neutral-400 mt-2 font-medium">Choose a custom automated response to trigger for this system event.</p>
                                            </div>

                                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar px-1">
                                                {replies.filter(r => r.facebook_page_id === selectedPageId).length > 0 ? (
                                                    replies.filter(r => r.facebook_page_id === selectedPageId).map(r => (
                                                        <button
                                                            key={r.id}
                                                            onClick={async () => {
                                                                try {
                                                                    await api.post(`/facebook/actions/${selectedActionType}`, { bot_reply_id: r.id, facebook_page_id: selectedPageId });
                                                                    showModal("success", "Mapped", "Action mapped!");
                                                                    setShowActionModal(false);
                                                                    fetchActions(selectedPageId);
                                                                } catch (e) { showModal("error", "Error", "Mapping failed"); }
                                                            }}
                                                            className="w-full group p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700/50 hover:bg-white dark:hover:bg-neutral-900 transition-all flex items-center justify-between shadow-sm"
                                                        >
                                                            <div>
                                                                <div className="font-black text-neutral-900 dark:text-white uppercase tracking-tight text-[15px]">{r.name}</div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded", r.status === 'published' ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-400")}>{r.status}</span>
                                                                    <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest leading-none">• {r.trigger_type}</span>
                                                                </div>
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <div className="text-xs text-neutral-400 font-medium italic">No suitable flows found for this page.</div>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={() => { setShowActionModal(false); setShowCreateModal(true); }}
                                                    className="w-full p-6 rounded-3xl border-2 border-dashed border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50/10 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center"><Plus size={18} strokeWidth={3} /></div>
                                                    Build New Target Flow
                                                </button>
                                            </div>

                                            <div className="mt-10">
                                                <button onClick={() => setShowActionModal(false)} className="w-full py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-black text-[11px] uppercase tracking-[0.2em] hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all">Go Back</button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeMenu === 'ai_agent' && (
                            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                                <Bot className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">AI Agent Intelligence</h3>
                                <p className="text-sm text-neutral-500 max-w-sm mt-2 font-medium mx-auto">Train and manage a natural language processing model. Coming extremely soon.</p>
                            </motion.div>
                        )}

                        {activeMenu === 'persistent_menu' && selectedPageId !== "all" && (
                            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <PersistentMenu
                                    pageId={selectedPageId}
                                    actions={actions}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CREATE MODAL */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
                                onClick={() => setShowCreateModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl relative z-10"
                            >
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                                    New Automation {selectedPageId !== "all" ? `for ${pages.find(p => p.page_id === selectedPageId)?.page_name}` : ""}
                                </h3>
                                <div className="space-y-4">
                                    {selectedPageId === "all" && (
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Select Page</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreatePageDropdownOpen(!isCreatePageDropdownOpen)}
                                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus-visible:border-purple-500 transition-all cursor-pointer flex items-center justify-between"
                                                >
                                                    <span className={cn(
                                                        "truncate",
                                                        !(newReply.facebook_page_id || creationPageIdFallback) && "text-neutral-400"
                                                    )}>
                                                        {pages.find(p => p.page_id === (newReply.facebook_page_id || creationPageIdFallback))?.page_name || "Select a page..."}
                                                    </span>
                                                    <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isCreatePageDropdownOpen && "rotate-180")} />
                                                </button>

                                                <AnimatePresence>
                                                    {isCreatePageDropdownOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                                                            className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden"
                                                        >
                                                            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search pages..."
                                                                        value={createPageSearchQuery}
                                                                        onChange={(e) => setCreatePageSearchQuery(e.target.value)}
                                                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-transparent focus:border-purple-500/30 text-sm outline-none transition-all"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="max-h-48 overflow-y-auto no-scrollbar p-1">
                                                                {pages.filter(p => !createPageSearchQuery || p.page_name.toLowerCase().includes(createPageSearchQuery.toLowerCase())).map(p => (
                                                                    <button
                                                                        key={p.page_id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setNewReply({ ...newReply, facebook_page_id: p.page_id });
                                                                            setIsCreatePageDropdownOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                            "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2",
                                                                            (newReply.facebook_page_id || creationPageIdFallback) === p.page_id
                                                                                ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold"
                                                                                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                                        )}
                                                                    >
                                                                        <FacebookIcon className="w-4 h-4 opacity-50 text-[#0866FF]" />
                                                                        <span className="truncate">{p.page_name}</span>
                                                                        {(newReply.facebook_page_id || creationPageIdFallback) === p.page_id && (
                                                                            <CheckCircle2 className="w-4 h-4 ml-auto" />
                                                                        )}
                                                                    </button>
                                                                ))}
                                                                {pages.filter(p => p.page_name.toLowerCase().includes(createPageSearchQuery.toLowerCase())).length === 0 && (
                                                                    <div className="py-4 text-center text-xs text-neutral-500">No pages found</div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Automation Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Sales Inquiry"
                                            value={newReply.name}
                                            onChange={(e) => setNewReply({ ...newReply, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Trigger Operator</label>
                                        <select
                                            value={newReply.trigger_type}
                                            onChange={(e) => setNewReply({ ...newReply, trigger_type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-purple-500 appearance-none transition-all cursor-pointer"
                                        >
                                            <option value="exact">Exact Match</option>
                                            <option value="contains">Contains Word</option>
                                            <option value="starts_with">Starts With</option>
                                            <option value="welcome">Welcome</option>
                                            <option value="fallback">Fallback</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Keywords</label>
                                        <input
                                            type="text"
                                            placeholder={['welcome', 'fallback'].includes(newReply.trigger_type) ? "Disabled for this trigger" : "price, cost, fee"}
                                            value={newReply.trigger_value}
                                            onChange={(e) => setNewReply({ ...newReply, trigger_value: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-purple-500 transition-all disabled:opacity-50"
                                            disabled={['welcome', 'fallback'].includes(newReply.trigger_type)}
                                        />
                                    </div>
                                    <div className="pt-4 flex gap-3">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-sm transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            disabled={isCreating}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? 'Creating...' : 'Create Flow'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
