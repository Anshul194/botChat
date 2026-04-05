"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy,
    CheckCircle2, Target, Bot, MousePointerClick, ArrowLeft,
    Menu as MenuIcon, Settings2, Sparkles, Box, RefreshCw, ChevronRight, Instagram, Layers,
    ChevronLeft, ChevronDown, ListFilter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PersistentMenu from "./PersistentMenu";

interface BotReply {
    id: number;
    instagram_id: string; // Used in API calls
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
    { id: 'ai_agent', label: 'AI Agent', icon: Bot },
    { id: 'action_buttons', label: 'Action Buttons', icon: MousePointerClick },
    { id: 'persistent_menu', label: 'Persistent Menu', icon: MenuIcon },
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

    const scrollRef = useRef<HTMLDivElement>(null);
    const [showPageDropdown, setShowPageDropdown] = useState(false);
    const [quickFindSearch, setQuickFindSearch] = useState("");

    const [actions, setActions] = useState<ActionData[]>([]);
    const [isActionsLoading, setIsActionsLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [selectedActionType, setSelectedActionType] = useState<string | null>(null);

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

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 200;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    const handleAccountSelect = (id: string | "all") => {
        setSelectedAccountId(id);
        setShowPageDropdown(false);
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
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#db2777]">Instagram Automation</span>
                            <div className="w-1 h-1 rounded-full bg-neutral-300" />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#db2777]/10 rounded-full">
                                <Instagram size={10} className="text-[#db2777]" />
                                <span className="text-[9px] font-medium text-[#db2777]">Neural Node</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight leading-none mt-1 uppercase">Instagram Reply Manager</h1>
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
                                    ? "bg-white dark:bg-neutral-700 text-[#db2777] shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                            )}
                        >
                            <menu.icon size={14} strokeWidth={2} />
                            {menu.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-[#db2777] transition-all"><Settings2 size={18} /></button>
                    <button className="px-6 py-2.5 rounded-2xl bg-[#db2777] text-white text-[13px] font-medium uppercase tracking-wider shadow-lg shadow-[#db2777]/20 hover:scale-105 active:scale-95 transition-all">Pulse stats</button>
                </div>
            </div>

            <div className="p-4 sm:p-8 space-y-8">
                {/* 2. ACCOUNTS SELECTOR (Scrollable + Dropdown) */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
                    <div className="flex-1 min-w-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 shadow-sm flex items-center relative">
                        <button onClick={() => scroll('left')} className="p-2 flex-shrink-0 text-neutral-400 hover:text-[#db2777] transition-colors z-10 bg-white dark:bg-neutral-900 shadow-[10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-l-xl">
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div ref={scrollRef} className="flex-1 min-w-0 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2 items-center">
                            <button
                                onClick={() => handleAccountSelect("all")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[14px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap",
                                    selectedAccountId === "all"
                                        ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900"
                                        : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                )}
                            >
                                All Accounts
                            </button>
                            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1 flex-shrink-0" />
                            {pages.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => handleAccountSelect(acc.instagram_id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap",
                                        selectedAccountId === acc.instagram_id
                                            ? "bg-[#db2777]/10 text-[#db2777] shadow-sm border border-[#db2777]/20"
                                            : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-transparent"
                                    )}
                                >
                                    @{acc.username}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => scroll('right')} className="p-2 flex-shrink-0 text-neutral-400 hover:text-[#db2777] transition-colors z-10 bg-white dark:bg-neutral-900 shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-r-xl">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative shrink-0 z-20">
                        <button
                            onClick={() => setShowPageDropdown(!showPageDropdown)}
                            className="h-full px-5 py-3 sm:py-0 w-full sm:w-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex items-center justify-between sm:justify-center gap-3 text-[13px] font-medium uppercase tracking-wider hover:border-[#db2777]/30 transition-colors text-neutral-700 dark:text-neutral-300"
                        >
                            <div className="flex items-center gap-2">
                                <ListFilter className="w-4 h-4 text-[#db2777]" />
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
                                                    placeholder="Search accounts..."
                                                    value={quickFindSearch}
                                                    onChange={(e) => setQuickFindSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-transparent focus:bg-white dark:focus:bg-neutral-800 focus:border-[#db2777]/20 text-xs outline-none transition-all"
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-1 overflow-y-auto custom-scrollbar">
                                            <button
                                                onClick={() => { handleAccountSelect("all"); setQuickFindSearch(""); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                                    selectedAccountId === "all" ? "bg-[#db2777]/10 text-[#db2777]" : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                )}
                                            >
                                                All Accounts
                                            </button>
                                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                                            {pages
                                                .filter(acc => !quickFindSearch || acc.username.toLowerCase().includes(quickFindSearch.toLowerCase()))
                                                .map(acc => (
                                                    <button
                                                        key={acc.id}
                                                        onClick={() => { handleAccountSelect(acc.instagram_id); setQuickFindSearch(""); }}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all truncate flex items-center gap-2",
                                                            selectedAccountId === acc.instagram_id ? "bg-[#db2777]/10 text-[#db2777]" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        )}
                                                    >
                                                        <Instagram className="w-3.5 h-3.5 text-[#db2777] shrink-0" />
                                                        <span className="truncate">{acc.username}</span>
                                                    </button>
                                                ))}
                                            {pages.filter(acc => acc.username.toLowerCase().includes(quickFindSearch.toLowerCase())).length === 0 && (
                                                <div className="py-8 text-center px-4">
                                                    <Search className="w-8 h-8 text-neutral-200 dark:text-neutral-800 mx-auto mb-2" />
                                                    <p className="text-xs text-neutral-400 font-medium italic">No accounts found</p>
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
                                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-transparent focus:bg-white focus:border-pink-300 dark:focus:border-pink-500/30 text-sm outline-none transition-all placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-gradient-to-r from-[#db2777] to-rose-500 hover:from-[#be185d] hover:to-rose-600 text-white px-6 py-2.5 rounded-xl font-medium uppercase text-[12px] tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                                    >
                                        <Sparkles className="w-4 h-4" /> Create IG Flow
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
                                                onClick={() => goToFlow(reply.id)}
                                                className="group bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/60 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-pink-200 dark:hover:border-pink-900/50 hover:bg-pink-50/30 dark:hover:bg-pink-900/10 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all group-hover:rotate-6",
                                                        reply.status === 'published' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                                                    )}>
                                                        <MessageSquare className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[15px] font-semibold text-neutral-900 dark:text-white truncate uppercase tracking-tight">{reply.name}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={cn(
                                                                "text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded",
                                                                reply.status === 'published' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20" : "bg-neutral-200/50 text-neutral-600 dark:text-neutral-400"
                                                            )}>
                                                                {reply.status}
                                                            </span>
                                                            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest whitespace-nowrap">
                                                                Type: {reply.trigger_type}
                                                            </span>
                                                            {selectedAccountId === "all" && (
                                                                <>
                                                                    <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline">•</span>
                                                                    <span className="text-[10px] text-[#db2777] font-semibold uppercase tracking-widest bg-[#db2777]/10 px-2 rounded-lg truncate max-w-[120px] sm:max-w-none">
                                                                        @{pages.find(p => p.instagram_id === reply.instagram_id)?.username || "Unknown"}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); goToFlow(reply.id); }}
                                                        className="flex-1 sm:flex-none py-2 px-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 shadow-sm active:scale-95 transition-all text-center whitespace-nowrap"
                                                    >
                                                        Edit Flow
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }}
                                                        className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 transition-all active:scale-95"
                                                        title={reply.status === 'published' ? "Pause" : "Live"}
                                                    >
                                                        {reply.status === 'published' ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }}
                                                        className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 transition-all active:scale-95"
                                                        title="Duplicate"
                                                    >
                                                        <Copy className="w-4 h-4 text-pink-500" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }}
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
                                        <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-pink-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No Automations Found</h3>
                                        <p className="text-sm text-neutral-500 max-w-xs mt-1 mb-6 font-medium">Create automated responses for your Instagram DMs and comments.</p>
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

                        {activeMenu === 'action_buttons' && (
                            <motion.div key="action" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">IG Action Shortcuts</h2>
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1">Connect system events to custom automation layers</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => fetchActions()}
                                            className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                                        >
                                            <RefreshCw className={cn("w-4 h-4", isActionsLoading && "animate-spin")} />
                                        </button>
                                        <button
                                            onClick={() => setShowActionModal(true)}
                                            className="bg-[#db2777] hover:bg-[#be185d] text-white px-6 py-2.5 rounded-xl font-medium text-[12px] uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" /> Create custom layer
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
                                                'action_story_mention': { label: 'Story Mention', desc: 'Triggered when someone mentions you in their story' },
                                                'action_story_private_reply': { label: 'Story Private Reply', desc: 'Send a private reply when someone interacts with your story' },
                                                'action_message_unsend': { label: 'Message Unsend Private Reply', desc: 'Send a private reply when someone unsends a message' },
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
                                                    className="group bg-neutral-50/50 dark:bg-neutral-950/20 shadow-sm border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 hover:border-pink-500/30 transition-all flex flex-col justify-between cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm",
                                                                action.automation_id ? "bg-pink-100 text-[#db2777] dark:bg-pink-900/40" : "bg-white dark:bg-neutral-900 text-neutral-400 dark:border-neutral-800"
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
                                                                className="w-full py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-pink-100 dark:border-pink-900/10 text-[#db2777] dark:text-pink-400 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-pink-50/50 dark:hover:bg-pink-900/20 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Box size={14} /> Open Flow Logic
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleActionCreate(action.type); }}
                                                                className="w-full py-3.5 rounded-2xl bg-[#db2777] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-pink-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
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
                                    <div className="py-20 text-center flex flex-col items-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[40px]">
                                        <div className="w-20 h-20 rounded-3xl bg-[#db2777]/5 dark:bg-[#db2777]/10 flex items-center justify-center mb-6">
                                            <MousePointerClick className="w-10 h-10 text-[#db2777]" />
                                        </div>
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">No custom shortcuts</h3>
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] max-w-xs mt-2 mb-8 mx-auto leading-relaxed">Map IG system events to neural automation layers to handle complex edge cases.</p>
                                        <button
                                            onClick={() => setShowActionModal(true)}
                                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3 rounded-2xl font-medium text-[11px] uppercase tracking-widest shadow-xl shadow-neutral-950/20 hover:scale-105 active:scale-95 transition-all"
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
                            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                                <Bot className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">IG Agent Intelligence</h3>
                                <p className="text-sm text-neutral-500 max-w-sm mt-2 font-medium mx-auto">Train a smart agent to handle Instagram DMs with neural precision.</p>
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
                                    New IG Flow {selectedAccountId !== "all" ? `for ${selectedAccountObj?.username}` : ""}
                                </h3>
                                <div className="space-y-4">
                                    {selectedAccountId === "all" && (
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Select IG Account</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreateAccountDropdownOpen(!isCreateAccountDropdownOpen)}
                                                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus-visible:border-pink-500 transition-all cursor-pointer flex items-center justify-between"
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
                                                            className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden"
                                                        >
                                                            <div className="p-2 border-b border-neutral-100 dark:border-neutral-800">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search accounts..."
                                                                        value={createAccountSearchQuery}
                                                                        onChange={(e) => setCreateAccountSearchQuery(e.target.value)}
                                                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-transparent focus:border-pink-500/30 text-sm outline-none transition-all"
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
                                                                                ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 font-semibold"
                                                                                : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                                        )}
                                                                    >
                                                                        <Instagram className="w-4 h-4 opacity-50" />
                                                                        <span className="truncate">{p.username}</span>
                                                                        {(newReply.instagram_id || creationAccountFallback?.instagram_id) === p.instagram_id && (
                                                                            <CheckCircle2 className="w-4 h-4 ml-auto" />
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
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Reply Type</label>
                                        <select
                                            value={newReply.trigger_type}
                                            onChange={(e) => setNewReply({ ...newReply, trigger_type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-pink-500 appearance-none transition-all cursor-pointer"
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
                                            className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-pink-500 transition-all disabled:opacity-50"
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
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? 'Creating...' : 'Create IG Flow'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* ACTION CREATION MODAL */}
                <AnimatePresence>
                    {showActionModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={() => setShowActionModal(false)} />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] p-10 w-full max-w-md shadow-2xl relative z-10">
                                <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-2 uppercase tracking-tight">Create IG Shortcut</h3>
                                <p className="text-sm text-neutral-500 mb-8 font-medium">Select a system event to automate with a new flow.</p>

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
                                                        : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-pink-500/50 hover:bg-pink-50/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", exists ? "bg-neutral-100 text-neutral-400" : "bg-pink-50 text-pink-500 group-hover:bg-pink-100")}>
                                                        {opt.icon}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-neutral-900 dark:text-white block leading-none">{opt.label}</span>
                                                        {exists && <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest mt-1 block">Already Configured</span>}
                                                    </div>
                                                </div>
                                                {!exists && <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-pink-500" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button onClick={() => setShowActionModal(false)} className="w-full mt-6 py-3.5 rounded-2xl text-neutral-400 hover:text-neutral-600 font-bold text-xs uppercase tracking-[0.2em] transition-all">Cancel</button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
