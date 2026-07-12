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
        <div className="min-h-screen bg-transparent font-sans w-full min-w-0 -m-4 md:-m-6">
            {/* ── MOBILE HEADER (hidden on md+) ─────────────────────────────── */}
            <div className="md:hidden sticky top-0 z-[50] bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className="-ml-1 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight truncate">Facebook Integration</span>
                </div>
                <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Settings2 className="w-4 h-4" />
                </button>
            </div>

            {/* ── DESKTOP HEADER (hidden on mobile) ────────────────────────────── */}
            {/* 1. PREMIUM BRANDED HEADER */}
            <div className="hidden md:flex sticky top-[-24px] z-[50] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 px-8 py-3 flex-wrap md:flex-nowrap items-center justify-between gap-y-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#0866FF]">Facebook Automation</span>
                            <div className="w-1 h-1 rounded-full bg-neutral-300" />
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0866FF]/10 rounded-full">
                                <FacebookIcon className="w-2.5 h-2.5 text-[#0866FF]" />
                                <span className="text-[9px] font-medium text-[#0866FF]">Neural Node</span>
                            </div>
                        </div>
                        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight leading-none mt-1 uppercase">Facebook Reply Manager</h1>
                    </div>
                </div>

                <div className="order-last md:order-none w-full md:w-auto flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-x-auto no-scrollbar scroll-smooth">
                    <div className="flex items-center min-w-max">
                        {MENUS.map(menu => (
                            <button
                                key={menu.id}
                                onClick={() => setActiveMenu(menu.id)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-[13px] font-medium uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap",
                                    activeMenu === menu.id
                                        ? "bg-[#0866FF] text-white shadow-md"
                                        : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                                )}
                            >
                                <menu.icon className="w-[14px] h-[14px]" strokeWidth={2} />
                                {menu.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 transition-all"><Settings2 className="w-[18px] h-[18px]" /></button>
                    <button className="px-6 py-2.5 rounded-2xl text-white text-[13px] font-medium uppercase tracking-wider hover:scale-105 active:scale-95 transition-all" style={{ background: "linear-gradient(135deg, #0866FF 0%, #0055D4 100%)", boxShadow: "0 10px 20px -5px rgba(8, 102, 255, 0.3)" }}>Pulse stats</button>
                </div>
            </div>

            <div className="w-full pt-4 sm:p-8 space-y-4 sm:space-y-8 pb-28 lg:pb-8 px-4 sm:px-8 md:px-0">

                {/* ── MOBILE: Main Navigation Tabs (hidden on desktop) ────────────── */}
                <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                    {MENUS.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => setActiveMenu(menu.id)}
                            className={cn(
                                "px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0",
                                activeMenu === menu.id
                                    ? "bg-[#0866FF] text-white shadow-md"
                                    : "bg-white dark:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                            )}
                        >
                            <menu.icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                            {menu.label}
                        </button>
                    ))}
                </div>

                {/* ── MOBILE: title + subtitle ──────────────────────────────────── */}
                <div className="md:hidden pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#0866FF] mb-1">Facebook Automation</p>
                    <h2 className="text-[20px] font-bold text-neutral-900 dark:text-white leading-tight">
                        {MENUS.find(m => m.id === activeMenu)?.label || 'Facebook Reply Manager'}
                    </h2>
                </div>

                {/* ── MOBILE: pill page tabs ────────────────────────────────── */}
                <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                    <button
                        onClick={() => handlePageSelect("all")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all flex-shrink-0 border",
                            selectedPageId === "all"
                                ? "bg-[#0866FF] border-[#0866FF] text-white shadow-sm shadow-blue-500/30"
                                : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                        )}
                    >
                        All Pages
                    </button>
                    {pages.map(page => (
                        <button
                            key={page.id}
                            onClick={() => handlePageSelect(page.page_id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all flex-shrink-0 border",
                                selectedPageId === page.page_id
                                    ? "bg-neutral-800 border-neutral-800 text-white dark:bg-white dark:border-white dark:text-neutral-900"
                                    : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                            )}
                        >
                            {page.page_name}
                        </button>
                    ))}
                </div>

                {/* 2. PAGES SELECTOR (desktop only) */}
                <div className="hidden md:flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
                    <div className="flex-1 min-w-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 shadow-sm flex items-center relative">
                        <button onClick={() => scroll('left')} className="p-2 flex-shrink-0 text-neutral-400 transition-colors z-10 bg-white dark:bg-neutral-900 shadow-[10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-l-xl">
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div ref={scrollRef} className="flex-1 min-w-0 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2 items-center">
                            <button
                                onClick={() => handlePageSelect("all")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[14px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap",
                                    selectedPageId === "all"
                                        ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900"
                                        : "bg-transparent text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                )}
                            >
                                All Pages
                            </button>
                            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1 flex-shrink-0" />
                            {pages.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => handlePageSelect(page.page_id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap",
                                        selectedPageId === page.page_id
                                            ? "shadow-sm border border-[#0866FF]/30 bg-[#0866FF]/5 text-[#0866FF]"
                                            : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-transparent"
                                    )}
                                >
                                    {page.page_name}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => scroll('right')} className="p-2 flex-shrink-0 text-neutral-400 transition-colors z-10 bg-white dark:bg-neutral-900 shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-r-xl">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative shrink-0 z-20">
                        <button
                            onClick={() => setShowPageDropdown(!showPageDropdown)}
                            className="h-full px-5 py-3 sm:py-0 w-full sm:w-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex items-center justify-between sm:justify-center gap-3 text-[13px] font-medium uppercase tracking-wider transition-colors text-neutral-700 dark:text-neutral-300"
                            style={{ borderColor: showPageDropdown ? "#0866FF" : undefined }}
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
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-transparent focus:bg-white dark:focus:bg-neutral-800 text-xs outline-none transition-all"
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
                                                All Pages
                                            </button>
                                            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                                            {pages
                                                .filter(page => !quickFindSearch || page.page_name.toLowerCase().includes(quickFindSearch.toLowerCase()))
                                                .map(page => (
                                                    <button
                                                        key={page.id}
                                                        onClick={() => { handlePageSelect(page.page_id); setQuickFindSearch(""); }}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all truncate flex items-center gap-2",
                                                            selectedPageId === page.page_id ? "bg-[#0866FF]/10 text-[#0866FF]" : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                        )}
                                                    >
                                                        <FacebookIcon className="w-3.5 h-3.5 shrink-0 text-[#0866FF]" />
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
                <div className="w-full min-w-0 md:bg-white md:dark:bg-neutral-900 md:border md:border-neutral-200 md:dark:border-neutral-800 md:rounded-3xl md:p-8 md:shadow-sm">
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
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-[#0866FF]/50 focus:ring-2 focus:ring-[#0866FF]/10 text-sm outline-none transition-all placeholder:text-neutral-400 shadow-sm"
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
                                                className="group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 md:border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#0866FF]/30 transition-all"
                                            >
                                                {/* Left accent bar */}
                                                <div className={cn("absolute left-0 top-0 bottom-0 w-[3px] rounded-l-full transition-colors", reply.status === 'published' ? 'bg-[#0866FF]' : 'bg-neutral-200 dark:bg-neutral-700')} />

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
                                                                    ? "bg-gradient-to-br from-blue-50 to-blue-100 text-[#0866FF]"
                                                                    : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                                                            )}>
                                                                <MessageSquare className="w-4.5 h-4.5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-[14px] font-semibold text-neutral-900 dark:text-white truncate leading-snug">{reply.name}</h4>
                                                                {selectedPageId === "all" && (
                                                                    <span className="text-[11px] text-[#0866FF] font-medium">
                                                                        {pages.find(p => p.page_id === reply.facebook_page_id)?.page_name || "Unknown Page"}
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
                                                            className="py-3 flex flex-col items-center justify-center gap-0.5 text-[#0866FF] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group/btn"
                                                        >
                                                            <Settings2 className="w-4 h-4" />
                                                            <span className="text-[9px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }}
                                                            className={cn("py-3 flex flex-col items-center justify-center gap-0.5 transition-colors group/btn",
                                                                reply.status === 'published' ? "text-amber-500 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                                                            )}
                                                        >
                                                            {reply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                            <span className="text-[9px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">
                                                                {reply.status === 'published' ? 'Pause' : 'Go Live'}
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group/btn"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                            <span className="text-[9px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Copy</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }}
                                                            className="py-3 flex flex-col items-center justify-center gap-0.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/btn"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span className="text-[9px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Delete</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* ── DESKTOP CARD LAYOUT (unchanged) ── */}
                                                <div className="hidden md:grid grid-cols-12 items-center gap-4 px-6 py-4">
                                                    {/* Name + Icon */}
                                                    <div className="flex items-center gap-4 col-span-5 min-w-0">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all",
                                                            reply.status === 'published' ? "bg-[#0866FF]/10 text-[#0866FF]" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                                                        )}>
                                                            <MessageSquare className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <h4 className="text-[15px] font-bold text-neutral-900 dark:text-white truncate">{reply.name}</h4>
                                                            {selectedPageId === "all" && (
                                                                <div className="flex items-center mt-1">
                                                                    <span className="text-[10px] text-[#0866FF] font-semibold uppercase tracking-wider bg-[#0866FF]/10 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                                                                        {pages.find(p => p.page_id === reply.facebook_page_id)?.page_name || "Unknown Page"}
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
                                                        <button onClick={(e) => { e.stopPropagation(); goToFlow(reply.id); }} className="py-2 px-4 rounded-xl bg-[#0866FF]/10 hover:bg-[#0866FF]/20 text-[#0866FF] border border-[#0866FF]/20 text-xs font-bold transition-all text-center active:scale-95">Edit Flow</button>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }} className={cn("p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all active:scale-95", reply.status === 'published' ? "hover:bg-amber-50 text-neutral-400 hover:text-amber-500" : "hover:bg-emerald-50 text-neutral-400 hover:text-emerald-500")} title={reply.status === 'published' ? "Pause" : "Go Live"}>
                                                                {reply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                            </button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-neutral-400 hover:text-blue-500 transition-all active:scale-95" title="Duplicate"><Copy className="w-4 h-4" /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all active:scale-95" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No Automations Found</h3>
                                        <p className="text-sm text-neutral-500 max-w-xs mt-1 mb-6 font-medium">Create automated responses for your Facebook messages.</p>
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
                                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">FB Action Shortcuts</h2>
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1">Connect system events to custom automation layers</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => fetchActions()}
                                            className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
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
                                                    className="group bg-neutral-50/50 dark:bg-neutral-950/20 shadow-sm border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 hover:border-blue-500/30 transition-all flex flex-col justify-between cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm",
                                                                action.automation_id ? "bg-blue-100 text-[#0866FF] dark:bg-blue-900/40" : "bg-white dark:bg-neutral-900 text-neutral-400 dark:border-neutral-800"
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
                                                                className="w-full py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-blue-100 dark:border-blue-900/10 text-[#0866FF] dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Box size={14} /> Open Flow Logic
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleActionCreate(action.type); }}
                                                                className="w-full py-3.5 rounded-2xl bg-[#0866FF] text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
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
                                        <div className="w-20 h-20 rounded-3xl bg-[#0866FF]/5 dark:bg-[#0866FF]/10 flex items-center justify-center mb-6">
                                            <MousePointerClick className="w-10 h-10 text-[#0866FF]" />
                                        </div>
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">No custom shortcuts</h3>
                                        <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] max-w-xs mt-2 mb-8 mx-auto leading-relaxed">Map FB system events to neural automation layers to handle complex edge cases.</p>
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
                                        className="w-full max-w-md p-10 bg-blue-50 dark:bg-blue-500/10 rounded-[40px] border border-blue-100 dark:border-blue-500/20 flex flex-col items-center gap-4 text-center grayscale-0 mx-auto"
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
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-[28px] sm:rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
                            >
                                {/* Drag handle */}
                                <div className="sm:hidden flex justify-center pt-3.5 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>

                                {/* Blue accent header */}
                                <div className="relative px-6 pt-5 pb-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                                    <div className="absolute top-3 right-4">
                                        <button
                                            onClick={() => setEditReply(null)}
                                            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Bot Reply</p>
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
                                        <span className="text-[11px] text-blue-200 font-medium">· {editReply.trigger_type}</span>
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
                                        {selectedPageId === "all" && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3.5 col-span-2">
                                                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest mb-1">Facebook Page</p>
                                                <p className="text-[13px] font-bold text-blue-700 dark:text-blue-300 truncate">
                                                    {pages.find(p => p.page_id === editReply.facebook_page_id)?.page_name || "Unknown"}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA — Open Flow Builder */}
                                    <button
                                        onClick={() => { setEditReply(null); goToFlow(editReply.id); }}
                                        className="w-full py-3.5 rounded-xl text-white font-semibold text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-500/25"
                                        style={{ background: "linear-gradient(135deg, #0866FF 0%, #0055D4 100%)" }}
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
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto shadow-2xl relative z-10"
                            >
                                {/* Modal drag handle (mobile) */}
                                <div className="sm:hidden flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>
                                <div className="px-6 pt-4 pb-7 sm:p-8">
                                    {/* Modal header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0866FF] mb-1">Facebook Automation</p>
                                            <h3 className="text-[18px] font-bold text-neutral-900 dark:text-white leading-tight">
                                                New FB Flow {selectedPageId !== "all" ? `— ${selectedPageObj?.page_name}` : ""}
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
                                        {selectedPageId === "all" && (
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Select FB Page</label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCreatePageDropdownOpen(!isCreatePageDropdownOpen)}
                                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus-visible:border-blue-500 transition-all cursor-pointer flex items-center justify-between"
                                                    >
                                                        <span className={cn(
                                                            "truncate",
                                                            !(newReply.facebook_page_id || creationPageFallback?.page_id) && "text-neutral-400"
                                                        )}>
                                                            {pages.find(p => p.page_id === (newReply.facebook_page_id || creationPageFallback?.page_id))?.page_name || "Select a page..."}
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
                                                                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-transparent focus:border-blue-500/30 text-sm outline-none transition-all"
                                                                            autoFocus
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="max-h-48 overflow-y-auto no-scrollbar p-1">
                                                                    {pages.filter(p => !createPageSearchQuery || p.page_name.toLowerCase().includes(createPageSearchQuery.toLowerCase())).map(p => (
                                                                        <button
                                                                            key={p.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setNewReply({ ...newReply, facebook_page_id: p.page_id });
                                                                                setIsCreatePageDropdownOpen(false);
                                                                            }}
                                                                            className={cn(
                                                                                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2",
                                                                                (newReply.facebook_page_id || creationPageFallback?.page_id) === p.page_id
                                                                                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                                                                                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                                            )}
                                                                        >
                                                                            <FacebookIcon className="w-4 h-4 opacity-50 text-[#0866FF]" />
                                                                            <span className="truncate">{p.page_name}</span>
                                                                            {(newReply.facebook_page_id || creationPageFallback?.page_id) === p.page_id && (
                                                                                <CheckCircle2 className="w-4 h-4 ml-auto text-blue-500" />
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
                                            <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Template Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Support Bot (FB)"
                                                value={newReply.name}
                                                onChange={(e) => setNewReply({ ...newReply, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Reply Type</label>
                                            <select
                                                value={newReply.trigger_type}
                                                onChange={(e) => setNewReply({ ...newReply, trigger_type: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-blue-500 appearance-none transition-all cursor-pointer"
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
                                                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-blue-500 transition-all disabled:opacity-50"
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
                                                className="w-full py-3 rounded-xl bg-[#0866FF] text-white font-semibold text-sm shadow-md hover:bg-[#0055D4] hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                                                    className="flex-1 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm" onClick={() => setShowActionModal(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-3xl sm:rounded-[32px] w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl relative z-10"
                            >
                                <div className="sm:hidden flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                </div>
                                <div className="px-6 pt-5 pb-8 sm:p-10">
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 tracking-tight">Map FB Shortcut</h3>
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
                                                            : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 hover:border-blue-500/50 hover:bg-blue-50/20"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", exists ? "bg-neutral-100 text-neutral-400" : "bg-blue-50 text-blue-500 group-hover:bg-blue-100")}>
                                                            {opt.icon}
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-neutral-900 dark:text-white block leading-none">{opt.label}</span>
                                                            {exists && <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest mt-1 block">Already Configured</span>}
                                                        </div>
                                                    </div>
                                                    {!exists && <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-blue-500" />}
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
        </div>
    );
}

