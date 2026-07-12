"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy,
    CheckCircle2, Target, Bot, MousePointerClick, ArrowLeft,
    Menu, Settings2, Sparkles, Box, RefreshCw, ChevronRight, Instagram, Layers,
    ChevronLeft, ChevronDown, ListFilter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { SwipeHint } from "@/components/ui/swipe-hint";
import { useRouter } from "next/navigation";
import PersistentMenu from "./PersistentMenu";
import { AiAgentSettingsPanel } from "../AiAgentSettingsPanel";


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
        <div className="min-h-screen bg-transparent font-sans w-full min-w-0 -m-4 md:-m-6">
            {/* ── UNIFIED PAGE HEADER ─────────────────────────────────────────── */}
            <div className="sticky top-[-16px] md:top-[-24px] z-[50] flex flex-col" style={{
                background: "var(--card)",
                borderBottom: "1px solid var(--border)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.10)"
            }}>
                <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-y-4 px-4 sm:px-8 py-3">
                    <div className="flex items-center gap-2 sm:gap-4 font-sans">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileSidebar'))}
                            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full transition-all"
                            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="hidden xs:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center transition-all shadow-sm"
                            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                        >
                            <ArrowLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-[#db2777]">Instagram Automation</span>
                                <div className="hidden xs:block w-1 h-1 rounded-full bg-neutral-300" />
                                <div className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 bg-[#db2777]/10 rounded-full">
                                    <Instagram className="w-2.5 h-2.5 text-[#db2777]" />
                                    <span className="text-[8px] sm:text-[9px] font-medium text-[#db2777]">Neural Node</span>
                                </div>
                            </div>
                            <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold tracking-tight leading-none mt-1 uppercase whitespace-normal" style={{ color: "var(--foreground)" }}>Instagram Reply Manager</h1>
                        </div>
                    </div>

                    <div className="order-last md:order-none w-full md:w-auto flex items-center p-1 rounded-2xl border overflow-x-auto no-scrollbar scroll-smooth" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                        <div className="flex items-center min-w-max">
                            {MENUS.map(menu => (
                                <button
                                    key={menu.id}
                                    onClick={() => setActiveMenu(menu.id)}
                                    className={cn(
                                        "px-4 sm:px-5 py-2 rounded-xl text-[12px] sm:text-[13px] font-medium uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap",
                                        activeMenu === menu.id
                                            ? "bg-[#db2777] text-white shadow-md shadow-pink-500/25"
                                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                    )}
                                >
                                    <menu.icon className="w-3.5 h-3.5 sm:w-[14px] sm:h-[14px]" strokeWidth={2} />
                                    {menu.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button className="p-2 sm:p-2.5 rounded-full transition-all" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}><Settings2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" /></button>
                        <button className="hidden xs:block px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl text-[var(--primary-foreground)] text-[12px] sm:text-[13px] font-medium uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md" style={{ background: "var(--primary)" }}>Pulse stats</button>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-8 space-y-8 pb-32 lg:pb-8">
                {/* 2. ACCOUNTS SELECTOR (Scrollable + Dropdown) */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
                    <div className="flex-1 min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1.5 shadow-sm flex items-center relative">
                        <SwipeHint containerRef={scrollRef} storageKey="ig-account-pills" align="right" className="absolute -top-5 right-4 z-10" />
                        <button onClick={() => scroll('left')} className="p-2 flex-shrink-0 text-[var(--muted-foreground)] transition-colors z-10 bg-transparent rounded-l-xl">
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div ref={scrollRef} className="flex-1 min-w-0 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2 items-center">
                            <button
                                onClick={() => handleAccountSelect("all")}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-[14px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap",
                                    selectedAccountId === "all"
                                        ? "bg-[var(--foreground)] text-[var(--background)] shadow-md"
                                        : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                                )}
                            >
                                All Accounts
                            </button>
                            <div className="w-px h-6 bg-[var(--border)] mx-1 flex-shrink-0" />
                            {pages.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => handleAccountSelect(acc.instagram_id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap",
                                        selectedAccountId === acc.instagram_id
                                            ? "shadow-sm border"
                                            : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 border border-transparent"
                                    )}
                                    style={selectedAccountId === acc.instagram_id ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)", borderColor: "var(--nav-active-border)" } : undefined}
                                >
                                    @{acc.username}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => scroll('right')} className="p-2 flex-shrink-0 text-[var(--muted-foreground)] transition-colors z-10 bg-transparent rounded-r-xl">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative shrink-0 z-20">
                        <button
                            onClick={() => setShowPageDropdown(!showPageDropdown)}
                            className="h-full px-5 py-3 sm:py-0 w-full sm:w-auto bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center justify-between sm:justify-center gap-3 text-[13px] font-medium uppercase tracking-wider transition-colors text-[var(--foreground)]"
                            style={{ borderColor: showPageDropdown ? "var(--nav-active-border)" : undefined }}
                        >
                            <div className="flex items-center gap-2">
                                <ListFilter className="w-4 h-4" style={{ color: "var(--nav-active-color)" }} />
                                Quick Find
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", showPageDropdown && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                            {showPageDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-[calc(100%+8px)] w-64 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
                                >
                                    <div className="flex flex-col max-h-[350px]">
                                        <div className="p-2 border-b border-[var(--border)] sticky top-0 bg-[var(--card)] z-10">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                                                <input
                                                    type="text"
                                                    placeholder="Search accounts..."
                                                    value={quickFindSearch}
                                                    onChange={(e) => setQuickFindSearch(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--muted)] border border-transparent focus:bg-[var(--card)] text-xs outline-none transition-all"
                                                    style={{ borderColor: quickFindSearch ? "var(--nav-active-border)" : undefined }}
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
                                                    selectedAccountId === "all" ? "" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50"
                                                )}
                                                style={selectedAccountId === "all" ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)" } : undefined}
                                            >
                                                All Accounts
                                            </button>
                                            <div className="h-px bg-[var(--border)] my-1" />
                                            {pages
                                                .filter(acc => !quickFindSearch || acc.username.toLowerCase().includes(quickFindSearch.toLowerCase()))
                                                .map(acc => (
                                                    <button
                                                        key={acc.id}
                                                        onClick={() => { handleAccountSelect(acc.instagram_id); setQuickFindSearch(""); }}
                                                        className={cn(
                                                            "w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all truncate flex items-center gap-2",
                                                            selectedAccountId === acc.instagram_id ? "" : "text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                                                        )}
                                                        style={selectedAccountId === acc.instagram_id ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)" } : undefined}
                                                    >
                                                        <Instagram className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--nav-active-color)" }} />
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
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm w-full min-w-0">
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
                                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] focus:bg-[var(--card)] focus:border-[var(--primary)] text-sm outline-none transition-all placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2.5 rounded-xl font-medium uppercase text-[12px] tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap shadow-md"
                                    >
                                        <Sparkles className="w-4 h-4" /> Create IG Flow
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 rounded-2xl bg-[var(--muted)]/50 animate-pulse" />
                                        ))}
                                    </div>
                                ) : filteredReplies.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {/* Header row for a professional table-like appearance in grid, hidden on mobile */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider border-b border-[var(--border)]">
                                            <div className="col-span-5">Automation Name</div>
                                            <div className="col-span-2">Status</div>
                                            <div className="col-span-2">Trigger Type</div>
                                            <div className="col-span-3 text-right">Actions</div>
                                        </div>

                                        {filteredReplies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                onClick={() => goToFlow(reply.id)}
                                                className="group relative bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 md:px-6 md:py-4 flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 transition-all hover:shadow-md hover:border-[var(--primary)]/30 cursor-pointer overflow-hidden"
                                            >
                                                {/* Left Accent indicator for active/draft */}
                                                <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-colors", reply.status === 'published' ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]')} />

                                                {/* Name and Icon */}
                                                <div className="flex items-center gap-4 col-span-5 min-w-0">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-all",
                                                        reply.status === 'published' ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                                                    )}>
                                                        <MessageSquare className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <h4 className="text-sm md:text-[15px] font-bold text-[var(--foreground)] truncate" title={reply.name}>
                                                            {reply.name}
                                                        </h4>
                                                        {selectedAccountId === "all" && (
                                                            <div className="flex items-center mt-1">
                                                                <span className="text-[10px] text-[var(--primary)] font-semibold uppercase tracking-wider bg-[var(--primary)]/10 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                                                                    @{pages.find(p => p.instagram_id === reply.instagram_id)?.username || "Unknown"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="flex items-center col-span-2 mt-2 md:mt-0">
                                                    {reply.status === 'published' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Live
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Trigger Type */}
                                                <div className="flex items-center col-span-2">
                                                    <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider border border-[var(--border)] px-2.5 py-1 rounded-lg bg-[var(--muted)]/50">
                                                        {reply.trigger_type}
                                                    </span>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-wrap md:flex-nowrap items-center md:justify-end gap-2 col-span-3 w-full md:w-auto mt-2 md:mt-0">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); goToFlow(reply.id); }}
                                                        className="flex-1 md:flex-none py-2 px-4 rounded-xl bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/20 text-xs font-bold transition-all text-center whitespace-nowrap active:scale-95"
                                                    >
                                                        Edit Flow
                                                    </button>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(reply); }}
                                                            className={cn("p-2 rounded-xl border border-[var(--border)] transition-all active:scale-95 bg-transparent", reply.status === 'published' ? "hover:bg-amber-500/10 text-[var(--muted-foreground)] hover:text-amber-500 hover:border-amber-200" : "hover:bg-emerald-500/10 text-[var(--muted-foreground)] hover:text-emerald-500 hover:border-emerald-200")}
                                                            title={reply.status === 'published' ? "Pause Flow" : "Go Live"}
                                                        >
                                                            {reply.status === 'published' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDuplicate(reply.id); }}
                                                            className="p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/20 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all active:scale-95 bg-transparent"
                                                            title="Duplicate"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(reply.id); }}
                                                            className="p-2 rounded-xl border border-[var(--border)] hover:bg-rose-500/10 hover:border-rose-500/20 text-[var(--muted-foreground)] hover:text-rose-500 transition-all active:scale-95 bg-transparent"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-16 text-center flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                                            <MessageSquare className="w-8 h-8 text-[var(--primary)]" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-[var(--foreground)]">No Automations Found</h3>
                                        <p className="text-sm text-[var(--muted-foreground)] max-w-xs mt-1 mb-6 font-medium">Create automated responses for your Instagram DMs and comments.</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2.5 rounded-xl font-medium text-sm shadow-md hover:scale-105 transition-transform"
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
                                        {/* <button
                                            onClick={() => setShowActionModal(true)}
                                            className="bg-[#db2777] hover:bg-[#be185d] text-white px-6 py-2.5 rounded-xl font-medium text-[12px] uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" /> Create custom layer
                                        </button> */}
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
                                                    className="group bg-[var(--card)] border border-[var(--border)] rounded-[32px] p-6 hover:border-[var(--primary)]/30 transition-all flex flex-col justify-between cursor-pointer"
                                                >
                                                    <div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm",
                                                                action.automation_id ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                                                            )}>
                                                                {action.type === 'action_get_started' ? <Play className="w-6 h-6 fill-current" /> : <RefreshCw className="w-6 h-6" />}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {action.automation_id && (
                                                                    <>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleActionToggle(action); }}
                                                                            className={cn(
                                                                                "p-2 rounded-lg border border-[var(--border)] bg-transparent transition-all active:scale-90",
                                                                                action.status === 'published' ? "text-amber-600 hover:bg-amber-500/10 border-amber-200" : "text-emerald-600 hover:bg-emerald-500/10 border-emerald-200"
                                                                            )}
                                                                            title={action.status === 'published' ? "Pause Action" : "Resume Action"}
                                                                        >
                                                                            {action.status === 'published' ? <Pause size={14} /> : <Play size={14} />}
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleActionDelete(action); }}
                                                                            className="p-2 rounded-lg border border-[var(--border)] bg-transparent text-[var(--muted-foreground)] hover:text-red-505 hover:bg-red-500/10 hover:border-red-200 transition-all active:scale-90"
                                                                            title="Unmap Action"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">{def.label}</h3>
                                                            {action.automation_id && (
                                                                <div className={cn(
                                                                    "w-1.5 h-1.5 rounded-full",
                                                                    action.status === 'published' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" : "bg-[var(--muted)]"
                                                                )} />
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-[var(--muted-foreground)] font-medium leading-relaxed">{def.desc}</p>
                                                    </div>

                                                    <div className="mt-8">
                                                        {action.automation_id ? (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); goToFlow(action.automation_id!); }}
                                                                className="w-full py-3.5 rounded-2xl bg-transparent border-2 border-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-[var(--primary)]/10 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                <Box size={14} /> Open Flow Logic
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleActionCreate(action.type); }}
                                                                className="w-full py-3.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-pink-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
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
                                    <div className="py-20 text-center flex flex-col items-center border-2 border-dashed border-[var(--border)] rounded-[40px]">
                                        <div className="w-20 h-20 rounded-3xl bg-[var(--primary)]/5 flex items-center justify-center mb-6">
                                            <MousePointerClick className="w-10 h-10 text-[var(--primary)]" />
                                        </div>
                                        <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight leading-none">No custom shortcuts</h3>
                                        <p className="text-[11px] text-[var(--muted-foreground)] font-bold uppercase tracking-[0.15em] max-w-xs mt-2 mb-8 mx-auto leading-relaxed">Map IG system events to neural automation layers to handle complex edge cases.</p>
                                        <button
                                            onClick={() => setShowActionModal(true)}
                                            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-8 py-3 rounded-2xl font-medium text-[11px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
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
                                        className="w-full max-w-md p-10 bg-[var(--primary)]/5 rounded-[40px] border border-[var(--primary)]/20 flex flex-col items-center gap-4 text-center grayscale-0 mx-auto"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 flex items-center justify-center mb-2">
                                            <Bot className="w-8 h-8 text-[var(--primary)]" />
                                        </div>
                                        <h4 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight leading-tight">Environment Required</h4>
                                        <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest leading-relaxed">Please select a specific Instagram account from the sidebar to enable neural agent configuration.</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* CREATE MODAL */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
                                onClick={() => setShowCreateModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="bg-[var(--card)] border border-[var(--border)] rounded-none sm:rounded-3xl p-5 xs:p-6 sm:p-8 w-full max-w-none sm:max-w-md min-h-screen sm:min-h-0 shadow-xl relative z-10"
                            >
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-6">
                                    New IG Flow {selectedAccountId !== "all" ? `for ${selectedAccountObj?.username}` : ""}
                                </h3>
                                <div className="space-y-4">
                                    {selectedAccountId === "all" && (
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-[var(--muted-foreground)]">Select IG Account</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCreateAccountDropdownOpen(!isCreateAccountDropdownOpen)}
                                                    className="w-full px-4 py-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus-visible:border-[var(--primary)] transition-all cursor-pointer flex items-center justify-between"
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
                                                            className="absolute z-50 w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
                                                        >
                                                            <div className="p-2 border-b border-[var(--border)]">
                                                                <div className="relative">
                                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search accounts..."
                                                                        value={createAccountSearchQuery}
                                                                        onChange={(e) => setCreateAccountSearchQuery(e.target.value)}
                                                                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--muted)]/55 border border-[var(--border)] focus:border-[var(--primary)] text-sm outline-none transition-all"
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
                                                                                ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                                                                                : "text-[var(--foreground)] hover:bg-[var(--muted)]/50"
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
                                        <label className="text-[13px] font-semibold text-[var(--muted-foreground)]">Template Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Support Bot (IG)"
                                            value={newReply.name}
                                            onChange={(e) => setNewReply({ ...newReply, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-semibold text-[var(--muted-foreground)]">Reply Type</label>
                                        <select
                                            value={newReply.trigger_type}
                                            onChange={(e) => setNewReply({ ...newReply, trigger_type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] appearance-none transition-all cursor-pointer"
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
                                        <label className="text-[13px] font-semibold text-[var(--muted-foreground)]">Keywords</label>
                                        <input
                                            type="text"
                                            placeholder={['welcome', 'fallback'].includes(newReply.trigger_type) ? "Disabled for this trigger" : "help, support"}
                                            value={newReply.trigger_value}
                                            onChange={(e) => setNewReply({ ...newReply, trigger_value: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] transition-all disabled:opacity-50"
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
                                            className="w-full py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? 'Creating...' : '⚡ Save & Publish'}
                                        </button>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setShowCreateModal(false)}
                                                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--muted-foreground)] font-semibold text-sm transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreate}
                                                disabled={isCreating}
                                                className="flex-1 py-3 rounded-xl border border-[var(--border)] bg-transparent text-[var(--muted-foreground)] font-semibold text-sm hover:bg-[var(--muted)]/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isCreating ? 'Creating...' : 'Save as Draft'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* ACTION CREATION MODAL */}
                <AnimatePresence>
                    {showActionModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={() => setShowActionModal(false)} />
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] border border-[var(--border)] rounded-none sm:rounded-[40px] p-10 w-full max-w-none sm:max-w-md min-h-screen sm:min-h-0 shadow-2xl relative z-10">
                                <h3 className="text-2xl font-black text-[var(--foreground)] mb-2 uppercase tracking-tight">Create IG Shortcut</h3>
                                <p className="text-sm text-[var(--muted-foreground)] mb-8 font-medium">Select a system event to automate with a new flow.</p>

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
                                                        ? "bg-[var(--muted)]/50 border-[var(--border)] opacity-50 cursor-not-allowed"
                                                        : "bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/10"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", exists ? "bg-[var(--muted)] text-[var(--muted-foreground)]" : "bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)]/20")}>
                                                        {opt.icon}
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-[var(--foreground)] block leading-none">{opt.label}</span>
                                                        {exists && <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest mt-1 block">Already Configured</span>}
                                                    </div>
                                                </div>
                                                {!exists && <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button onClick={() => setShowActionModal(false)} className="w-full mt-6 py-3.5 rounded-2xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-bold text-xs uppercase tracking-[0.2em] transition-all">Cancel</button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
