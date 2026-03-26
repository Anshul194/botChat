"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy,
    CheckCircle2, Target, Bot, MousePointerClick,
    Menu as MenuIcon, Settings2, Sparkles, Box, RefreshCw, ChevronRight, Instagram, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
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
    const [isLoading, setIsLoading] = useState(true);

    const [selectedAccount, setSelectedAccount] = useState<InstagramPageData | null>(null);
    const [activeMenu, setActiveMenu] = useState<MenuId>('bot_reply');

    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

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

    const fetchReplies = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/instagram/bot-replies");
            if (response.data.success || response.data.is_success) {
                setReplies(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Replies Error:", error);
            toast.error("Failed to load Instagram bot replies");
        } finally {
            setIsLoading(false);
        }
    }, [api, toast]);

    const fetchPages = useCallback(async () => {
        try {
            const response = await api.get("/social/instagram-connect");
            if (response.data.success || response.data.is_success) {
                const fetchedAccounts = response.data.data.instagram_accounts || [];
                setPages(fetchedAccounts);
                if (fetchedAccounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(fetchedAccounts[0]);
                    setNewReply(prev => ({ 
                        ...prev, 
                        page_id: fetchedAccounts[0].page?.page_id || "",
                        instagram_id: fetchedAccounts[0].instagram_id || ""
                    }));
                }
            }
        } catch (error) {
            console.error("Fetch Pages Error:", error);
        }
    }, [api, selectedAccount]);

    const fetchActions = useCallback(async () => {
        if (!selectedAccount || !selectedAccount.page?.page_id) return;
        setIsActionsLoading(true);
        try {
            const response = await api.get(`/instagram/actions?page_id=${selectedAccount.page.page_id}`);
            if (response.data.success || response.data.is_success) {
                setActions(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Actions Error:", error);
        } finally {
            setIsActionsLoading(false);
        }
    }, [api, selectedAccount]);

    useEffect(() => {
        fetchReplies();
        fetchPages();
    }, [fetchReplies, fetchPages]);

    useEffect(() => {
        if (activeMenu === 'action_buttons' || activeMenu === 'persistent_menu') {
            fetchActions();
        }
    }, [activeMenu, selectedAccount, fetchActions]);

    const handleCreate = async () => {
        const isKeywordRequired = !['welcome', 'fallback'].includes(newReply.trigger_type);
        if (!newReply.name || !newReply.instagram_id || (isKeywordRequired && !newReply.trigger_value)) {
            toast.error("Please fill all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const response = await api.post("/instagram/bot-replies", newReply);
            if (response.data.success || response.data.is_success) {
                toast.success("Instagram bot reply created successfully");
                setShowCreateModal(false);
                fetchReplies();
            }
        } catch (error) {
            toast.error("Failed to create Instagram bot reply");
        } finally {
            setIsCreating(false);
            setNewReply({
                name: "",
                page_id: selectedAccount?.page?.page_id || "",
                instagram_id: selectedAccount?.instagram_id || "",
                trigger_type: "exact",
                trigger_value: ""
            });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this Instagram bot reply?")) return;
        try {
            await api.delete(`/instagram/bot-replies/${id}`);
            toast.success("Bot reply deleted");
            setReplies(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Failed to delete bot reply");
        }
    };

    const handleToggleStatus = async (reply: BotReply) => {
        const newStatus = reply.status === 'published' ? 'draft' : 'publish';
        try {
            await api.patch(`/instagram/bot-replies/${reply.id}/${newStatus}`);
            toast.success(`Bot reply set to ${newStatus === 'publish' ? 'Live' : 'Draft'}`);
            fetchReplies();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await api.post(`/instagram/bot-replies/${id}/duplicate`);
            toast.success("Bot reply duplicated");
            fetchReplies();
        } catch (error) {
            toast.error("Failed to duplicate bot reply");
        }
    };

    const handleActionToggle = async (action: ActionData) => {
        if (!action.automation_id) return;
        try {
            const newStatus = action.status === 'published' ? 'draft' : 'publish';
            await api.patch(`/instagram/bot-replies/${action.automation_id}/${newStatus}`);
            toast.success(`Action status updated`);
            fetchActions();
        } catch (error) {
            toast.error("Failed to toggle action");
        }
    };

    const handleActionDelete = async (action: ActionData) => {
        if (!action.automation_id) return;
        if (!confirm("Are you sure? This will unmap the action.")) return;
        try {
            await api.delete(`/instagram/actions/${action.automation_id}`);
            toast.success("Action unmapped");
            fetchActions();
        } catch (error) {
            toast.error("Failed to remove mapping");
        }
    };

    const handleConfigureAction = async (type: string) => {
        setSelectedActionType(type);
        setShowActionModal(true);
    };

    const handleActionCreate = async (type: string) => {
        if (!type || !selectedAccount || !selectedAccount.page?.page_id) return;
        setIsCreating(true);
        try {
            const response = await api.post("/instagram/actions", {
                page_id: selectedAccount.page.page_id,
                action_type: type,
                name: type === 'action_no_match' ? 'No Match' : type === 'action_get_started' ? 'Get Started' : 'Ice Breakers'
            });
            if (response.data.success || response.data.is_success) {
                toast.success("Action created successfully");
                setShowActionModal(false);
                fetchActions();
            }
        } catch (error) {
            toast.error("Failed to create action");
        } finally {
            setIsCreating(false);
        }
    };

    const goToFlow = (replyId: number) => {
        router.push(`/dashboard/flows?id=${replyId}&platform=instagram`);
    };

    const filteredReplies = useMemo(() => {
        const targetIgId = selectedAccount?.instagram_id;
        return replies.filter(r =>
            r.instagram_id === targetIgId &&
            (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.trigger_value.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [replies, selectedAccount, searchQuery]);

    return (
        <div className="min-h-screen bg-transparent p-2 sm:p-4 lg:p-6 font-sans pb-24 w-full">

            {/* 1. ACCOUNTS SELECTOR */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 mb-8 shadow-sm flex items-center">
                <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-500/10 text-pink-600 flex flex-shrink-0 items-center justify-center mr-3 ml-1">
                    <Instagram className="w-5 h-5" />
                </div>
                <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar pr-2 items-center">
                    {pages.length > 0 ? pages.map(acc => (
                        <button
                            key={acc.id}
                            onClick={() => {
                                setSelectedAccount(acc);
                                setNewReply(prev => ({ ...prev, instagram_id: acc.instagram_id }));
                            }}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all whitespace-nowrap",
                                selectedAccount?.id === acc.id
                                    ? "bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 shadow-sm"
                                    : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            )}
                        >
                            {acc.username}
                        </button>
                    )) : (
                        <div className="text-sm font-medium text-neutral-400 px-2 py-2">Loading Connected Accounts...</div>
                    )}
                </div>
            </div>

            {/* 2. MENU TABS */}
            <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto no-scrollbar">
                {MENUS.map(menu => (
                    <button
                        key={menu.id}
                        onClick={() => setActiveMenu(menu.id)}
                        className={cn(
                            "pb-4 px-2 text-[15px] font-semibold flex items-center gap-2 transition-all relative whitespace-nowrap",
                            activeMenu === menu.id
                                ? "text-pink-600 dark:text-pink-400"
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                        )}
                    >
                        <menu.icon className="w-4 h-4" />
                        {menu.label}
                        {activeMenu === menu.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 dark:bg-pink-500 rounded-t-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* 3. MAIN WORKSPACE */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm">
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
                                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                                >
                                    <Sparkles className="w-4 h-4" /> Create IG Auto-Reply
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
                                            className="group bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/60 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-pink-200 dark:hover:border-pink-900/50 hover:bg-pink-50/30 dark:hover:bg-pink-900/10"
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
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => goToFlow(reply.id)}
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
                                                    <Copy className="w-4 h-4 text-pink-500" />
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
                                    <div className="w-16 h-16 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center mb-4">
                                        <MessageSquare className="w-8 h-8 text-pink-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Empty Instagram Library</h3>
                                    <p className="text-sm text-neutral-500 max-w-xs mt-1 mb-6">Create automated responses for your Instagram DMs and comments.</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:scale-105 transition-transform"
                                    >
                                        Create First Reply
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
                                        onClick={fetchActions}
                                        className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                                    >
                                        <RefreshCw className={cn("w-4 h-4", isActionsLoading && "animate-spin")} />
                                    </button>
                                    <button
                                        onClick={() => setShowActionModal(true)}
                                        className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> Create Action
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
                                        const def = labels[action.type] || { label: action.type, desc: 'Custom System Action' };
                                        
                                        return (
                                            <div key={action.type} className="group bg-neutral-50/50 dark:bg-neutral-950/20 shadow-sm border border-neutral-100 dark:border-neutral-800 rounded-[32px] p-6 hover:border-pink-500/30 transition-all flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-pink-500 shadow-sm">
                                                            {action.type === 'action_get_started' ? <Play className="w-5 h-5 fill-current" /> : <RefreshCw className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => goToFlow(action.automation_id!)} className="p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800 text-neutral-400 hover:text-pink-500 transition-all"><ChevronRight className="w-4 h-4" /></button>
                                                            <button onClick={() => handleActionDelete(action)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">{def.label}</h3>
                                                    <p className="text-[11px] text-neutral-400 font-medium leading-relaxed mt-1">{def.desc}</p>
                                                </div>

                                                <div className="mt-8 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", action.status === 'published' ? "bg-emerald-500" : "bg-neutral-300")} />
                                                        <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">{action.status || 'Draft'}</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleActionToggle(action)}
                                                        className={cn(
                                                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            action.status === 'published' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                        )}
                                                    >
                                                        {action.status === 'published' ? 'Pause' : 'Live'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-[40px]">
                                    <div className="w-20 h-20 rounded-3xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center mb-6">
                                        <MousePointerClick className="w-10 h-10 text-pink-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">No actions configured</h3>
                                    <p className="text-sm text-neutral-500 max-w-xs mt-2 mb-8 font-medium italic">Create your first IG system shortcut to automate welcome messages or no-match scenarios.</p>
                                    <button
                                        onClick={() => setShowActionModal(true)}
                                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-3 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
                                    >
                                        Create First Action
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeMenu === 'persistent_menu' && selectedAccount && (
                        <PersistentMenu 
                            instagramId={selectedAccount.instagram_id} 
                            pageId={selectedAccount.page?.page_id || ""} 
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
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">New IG Flow for {selectedAccount?.username}</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Bot Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Support Bot (IG)"
                                        value={newReply.name}
                                        onChange={(e) => setNewReply({ ...newReply, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Trigger Type</label>
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
    );
}
