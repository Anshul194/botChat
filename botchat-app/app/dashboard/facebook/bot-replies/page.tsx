"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy,
    CheckCircle2, Target, Bot, MousePointerClick,
    Menu, Settings2, Sparkles, Box, RefreshCw, ChevronRight,
    ChevronLeft, ChevronDown, ListFilter, ArrowLeft, Facebook as FacebookIcon,
    ShieldAlert, X, MoreVertical, Pencil, ExternalLink, BarChart2, History, Layout, Grid, Globe, Zap, MousePointer2, Info, Loader2, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import PersistentMenu from "./PersistentMenu";
import { AiAgentSettingsPanel } from "../../instagram/AiAgentSettingsPanel";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    { id: 'persistent_menu', label: 'Persistent Menu', icon: Menu },
] as const;

type MenuId = typeof MENUS[number]['id'];

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex-1 tracking-tight uppercase">{title}</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 no-scrollbar">{children}</div>
                    {footer && <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-14 pl-6 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
            />
        </div>
    </div>
);

const SelectField = ({ label, options, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">{label}</label>
        <div className="relative">
            <select
                {...props}
                className="w-full h-14 pl-6 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer shadow-inner"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
);


export default function BotRepliesPage() {
    const router = useRouter();
    const { showModal, showConfirm } = useModal();
    const [replies, setReplies] = useState<BotReply[]>([]);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPageId, setSelectedPageId] = useState<string | "all">("all");
    const [activeMenu, setActiveMenu] = useState<MenuId>('bot_reply');

    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState<'row' | 'card'>('row');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [newReply, setNewReply] = useState({
        name: "",
        facebook_page_id: "",
        trigger_type: "exact",
        trigger_value: ""
    });

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

    const handlePageSelect = (id: string | "all") => {
        setSelectedPageId(id);
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

    const handleEdit = (reply: BotReply) => {
        router.push(`/dashboard/flows?id=${reply.id}&platform=facebook`);
    };

    const creationPageIdFallback = selectedPageId === "all" ? (pages[0]?.page_id || "") : selectedPageId;



    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 relative overflow-hidden -m-4 md:-m-6">
            {/* Decorative Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--primary)] opacity-[0.08] rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent)] opacity-[0.05] rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-full space-y-12 relative z-10 p-6 sm:p-10">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col xl:flex-row xl:items-end justify-between gap-10"
                >
                    <div className="space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] shadow-2xl shadow-[var(--primary)]/10">
                                <FacebookIcon size={32} />
                            </div>
                            <div className="flex flex-col">
                                <div className="px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-black uppercase tracking-[0.25em] w-fit">
                                    Facebook Neural Studio
                                </div>
                                <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mt-3 uppercase">
                                    Bot Replies
                                </h1>
                            </div>
                        </div>
                        <p className="text-[var(--muted-foreground)] font-medium max-w-3xl text-xl leading-relaxed">
                            Orchestrate high-performance automated conversations for your Facebook accounts with precision neural triggering and AI branching.
                        </p>
                        
                        {/* Tab Switcher inside Header */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-2 rounded-[2.5rem] w-fit border border-slate-200 dark:border-slate-800 shadow-inner">
                            {MENUS.map(menu => (
                                <button
                                    key={menu.id}
                                    onClick={() => setActiveMenu(menu.id)}
                                    className={cn(
                                        "px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4 transition-all",
                                        activeMenu === menu.id
                                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xl"
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                                    )}
                                >
                                    <menu.icon size={16} strokeWidth={3} />
                                    {menu.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
                        {/* Page Selector */}
                        <div className="relative min-w-[280px]">
                            <select 
                                value={selectedPageId}
                                onChange={(e) => handlePageSelect(e.target.value)}
                                className="w-full h-20 pl-8 pr-14 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white outline-none appearance-none cursor-pointer shadow-lg focus:border-primary transition-all"
                            >
                                <option value="all">All Connected Pages</option>
                                {pages.map(page => (
                                    <option key={page.page_id} value={page.page_id}>{page.page_name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                        </div>

                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="h-20 px-10 rounded-3xl bg-[var(--primary)] text-white text-[13px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-5 shadow-2xl shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                        >
                            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" /> 
                            New Auto Reply
                        </button>
                    </div>
                </motion.div>


            <div className="max-w-full relative z-10">


                {/* Main Content Area */}
                <div className="min-h-[600px] space-y-10">
                    <AnimatePresence mode="wait">
                        {activeMenu === 'bot_reply' && (
                            <motion.div
                                key="bot_reply_list"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                {/* Search & View Toggle Bar */}
                                <div className="h-24 rounded-[3rem] border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-3xl flex items-center justify-between px-10 shadow-lg">
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="relative w-full max-w-lg group">
                                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
                                            <input
                                                placeholder="Search neural replies..."
                                                className="w-full pl-10 h-12 bg-transparent text-sm font-black uppercase tracking-[0.2em] focus:outline-none"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="hidden lg:flex items-center gap-4">
                                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-[var(--border)] rounded-[1.5rem] p-2 h-14">
                                            <button
                                                onClick={() => setView('row')}
                                                className={cn(
                                                    "px-8 py-2.5 rounded-xl transition-all flex items-center gap-3",
                                                    view === 'row' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                                )}
                                            >
                                                <Layout className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">List</span>
                                            </button>
                                            <button
                                                onClick={() => setView('card')}
                                                className={cn(
                                                    "px-8 py-2.5 rounded-xl transition-all flex items-center gap-3",
                                                    view === 'card' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                                )}
                                            >
                                                <Grid className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Cards</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="h-[500px] flex flex-col items-center justify-center gap-8 text-[var(--muted-foreground)]">
                                        <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/30" />
                                        <p className="text-sm font-black uppercase tracking-[0.4em] animate-pulse">Syncing Neural Nodes...</p>
                                    </div>
                                ) : filteredReplies.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-[500px] flex flex-col items-center justify-center text-center p-12 rounded-[5rem] border-2 border-dashed border-[var(--border)] bg-slate-50/30 dark:bg-slate-900/10 shadow-inner"
                                    >
                                        <div className="w-28 h-28 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mb-10 shadow-inner">
                                            <Bot className="w-12 h-12 text-primary" />
                                        </div>
                                        <h3 className="text-3xl font-black mb-4 uppercase tracking-tight">No Responses Found</h3>
                                        <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-12 font-medium text-lg leading-relaxed">
                                            {searchQuery ? "No neural nodes match your search criteria. Try a different query." : "Build your first automated reply layer and start saving time with high-performance bot logic."}
                                        </p>
                                        <button 
                                            onClick={() => setShowCreateModal(true)} 
                                            className="h-16 px-12 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.25em] shadow-2xl hover:scale-105 transition-all flex items-center gap-4"
                                        >
                                            <Plus size={20} strokeWidth={4} /> Create Neural Node
                                        </button>
                                    </motion.div>
                                ) : view === 'card' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
                                        {filteredReplies.map((reply) => (
                                            <BotReplyCard 
                                                key={reply.id} 
                                                reply={reply} 
                                                pages={pages}
                                                onEdit={handleEdit} 
                                                onToggleStatus={handleToggleStatus}
                                                onDuplicate={handleDuplicate}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[4rem] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-[var(--border)]">
                                                    <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Automation Identity</th>
                                                    <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Neural Trigger</th>
                                                    <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Connected Page</th>
                                                    <th className="px-12 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] text-right">Operations</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredReplies.map((reply) => (
                                                    <BotReplyRow 
                                                        key={reply.id} 
                                                        reply={reply} 
                                                        pages={pages}
                                                        onEdit={handleEdit} 
                                                        onToggleStatus={handleToggleStatus}
                                                        onDuplicate={handleDuplicate}
                                                        onDelete={handleDelete}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeMenu === 'ai_agent' && (
                            <motion.div key="ai_agent_tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
                                {selectedPageId !== "all" ? (
                                    <AiAgentSettingsPanel
                                        platform="facebook"
                                        accountId={selectedPageId}
                                        accountName={pages.find(p => p.page_id === selectedPageId)?.page_name || "Facebook Page"}
                                    />
                                ) : (
                                    <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 rounded-[5rem] border-2 border-dashed border-amber-200 bg-amber-50/30">
                                        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-8 shadow-inner">
                                            <ShieldAlert className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight text-amber-900">Account Selection Required</h3>
                                        <p className="text-amber-700/70 max-w-sm mx-auto mt-4 font-bold uppercase tracking-[0.15em] text-xs leading-relaxed">
                                            AI Neural Agents are bound to specific accounts. Please select a single page from the header to begin deep agent configuration.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeMenu === 'action_buttons' && (
                            <motion.div key="actions_tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                                    {actions.map((action) => (
                                        <ActionCard key={action.type} action={action} onConfigure={() => handleConfigureAction(action.type)} onToggle={() => handleActionToggle(action)} onDelete={() => handleActionDelete(action)} onOpenFlow={() => goToFlow(action.automation_id!)} />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeMenu === 'persistent_menu' && (
                            <motion.div key="persistent_menu_tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
                                {selectedPageId !== "all" ? (
                                    <PersistentMenu pageId={selectedPageId} actions={actions} />
                                ) : (
                                    <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 rounded-[5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
                                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-inner">
                                            <Menu className="w-10 h-10 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Menu Scope Required</h3>
                                        <p className="text-slate-700/70 dark:text-slate-400/70 max-w-sm mx-auto mt-4 font-bold uppercase tracking-[0.15em] text-xs leading-relaxed">
                                            Persistent menus are profile-specific. Select an account above to modify its navigation and command structure.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

                {/* CREATE MODAL */}
                {/* Creation Modal */}
            <ModalShell
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Initialize Neural Reply"
                icon={<MessageSquare size={20} />}
                footer={
                    <div className="flex gap-4">
                        <button onClick={() => setShowCreateModal(false)} className="flex-1 h-14 rounded-2xl border border-slate-200 text-slate-400 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-50 transition-colors">Cancel</button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="flex-[1.8] h-14 px-8 rounded-2xl bg-[var(--primary)] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-[var(--primary)]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {isCreating ? "Initializing..." : "Create Response Node"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-10 py-2">
                    <InputField
                        label="Internal Identity (Name)"
                        value={newReply.name}
                        onChange={(e: any) => setNewReply((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Welcome Message"
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <SelectField
                            label="Neural Trigger Type"
                            value={newReply.trigger_type}
                            onChange={(e: any) => setNewReply((prev) => ({ ...prev, trigger_type: e.target.value }))}
                            options={[
                                { value: "exact", label: "Exact Match" },
                                { value: "contains", label: "Contains Keyword" },
                                { value: "welcome", label: "Welcome Message" },
                                { value: "fallback", label: "Fallback (No Match)" }
                            ]}
                        />
                        
                        {!['welcome', 'fallback'].includes(newReply.trigger_type) && (
                            <InputField
                                label="Trigger Keyword"
                                value={newReply.trigger_value}
                                onChange={(e: any) => setNewReply((prev) => ({ ...prev, trigger_value: e.target.value }))}
                                placeholder="e.g. help, price"
                            />
                        )}
                    </div>

                    <SelectField
                        label="Target Meta Account"
                        value={newReply.facebook_page_id || creationPageIdFallback}
                        onChange={(e: any) => setNewReply((prev) => ({ ...prev, facebook_page_id: e.target.value }))}
                        options={[
                            ...pages.map(p => ({ value: p.page_id, label: p.page_name }))
                        ]}
                    />

                    <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-6 shadow-inner">
                        <Info size={24} className="text-indigo-600 mt-1 shrink-0" />
                        <p className="text-[12px] text-indigo-700/80 dark:text-indigo-400 font-bold uppercase tracking-[0.1em] leading-relaxed">
                            Once initialized, you can access the Neural Flow Designer to build complex multi-step logical paths, media-rich sequences, and AI-driven branching logic.
                        </p>
                    </div>
                </div>
            </ModalShell>

            {/* Action Selection Modal */}
            {showActionModal && (
                <ModalShell
                    open={showActionModal}
                    onClose={() => setShowActionModal(false)}
                    title="Map System Action"
                    icon={<Target size={20} />}
                >
                    <div className="space-y-6">
                         <div className="mb-8">
                            <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Choose a custom automated response to trigger for the <span className="text-primary font-black uppercase tracking-widest">"{selectedActionType}"</span> system event.</p>
                        </div>
                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 no-scrollbar">
                            {replies.filter(r => r.facebook_page_id === selectedPageId).map(r => (
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
                                    className="w-full group p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all flex items-center justify-between"
                                >
                                    <div className="text-left">
                                        <div className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl leading-tight">{r.name}</div>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full", r.status === 'published' ? "bg-emerald-100 text-emerald-600 shadow-sm" : "bg-slate-200 text-slate-500")}>{r.status}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">• {r.trigger_type}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={24} className="text-slate-300 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                </button>
                            ))}
                            {replies.filter(r => r.facebook_page_id === selectedPageId).length === 0 && (
                                <div className="text-center py-16 px-8 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                                    <p className="text-sm font-black text-slate-300 uppercase tracking-[0.3em]">No Flows Found for this Page</p>
                                </div>
                            )}
                            <button
                                onClick={() => { setShowActionModal(false); setShowCreateModal(true); }}
                                className="w-full p-10 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all font-black text-xs uppercase tracking-[0.3em] flex flex-col items-center justify-center gap-6 group"
                            >
                                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner"><Plus size={32} strokeWidth={4} /></div>
                                Initialize New Target Flow
                            </button>
                        </div>
                    </div>
                </ModalShell>
            )}
        </div>
    );
}

function BotReplyCard({ reply, pages, onEdit, onToggleStatus, onDuplicate, onDelete }: any) {
    const isLive = reply.status === 'published';
    const page = pages.find((p: any) => p.page_id === reply.facebook_page_id);

    return (
        <div 
            onClick={() => onEdit(reply)}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-[4rem] p-10 hover:shadow-[0_32px_128px_rgba(0,0,0,0.1)] hover:border-primary/50 transition-all duration-700 flex flex-col gap-8 relative overflow-hidden cursor-pointer"
        >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Bot className="w-40 h-40" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className={cn(
                    "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110",
                    isLive ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" : "bg-slate-500/10 text-slate-500 group-hover:bg-slate-500 group-hover:text-white"
                )}>
                    <MessageSquare size={32} strokeWidth={2.5} />
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-xl">
                    <span className={cn("w-2.5 h-2.5 rounded-full shadow-sm", isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                        {isLive ? "Active Node" : "Draft Layer"}
                    </span>
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                <h3 className="font-black text-2xl group-hover:text-primary transition-colors truncate uppercase tracking-tight leading-tight">{reply.name}</h3>
                <div className="flex items-center gap-3 text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                    <Zap size={14} className="text-[var(--primary)]" /> 
                    {reply.trigger_type}: {reply.trigger_value || "System Event"}
                </div>
                {page && (
                     <div className="flex items-center gap-2.5 text-[10px] font-black text-primary uppercase tracking-[0.25em] mt-2 px-3 py-1 bg-primary/5 rounded-full w-fit">
                        <FacebookIcon size={12} className="fill-primary" /> {page.page_name}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-[var(--border)] relative z-10 mt-auto">
                <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => onToggleStatus(reply)}
                        className={cn(
                            "relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 shadow-inner",
                            isLive ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                        )}
                    >
                        <span className={cn("pointer-events-none block h-5 w-5 rounded-full bg-white shadow-xl ring-0 transition-transform duration-300", isLive ? "translate-x-7" : "translate-x-0.5")} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Node Logic</span>
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onDuplicate(reply.id)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/30 text-slate-500 hover:text-primary transition-all flex items-center justify-center shadow-sm">
                        <Copy size={20} />
                    </button>
                    <BotReplyActions reply={reply} onEdit={onEdit} onDelete={onDelete} />
                </div>
            </div>
        </div>
    );
}

function BotReplyRow({ reply, pages, onEdit, onToggleStatus, onDuplicate, onDelete }: any) {
    const isLive = reply.status === 'published';
    const page = pages.find((p: any) => p.page_id === reply.facebook_page_id);

    return (
        <tr 
            onClick={() => onEdit(reply)}
            className="group hover:bg-primary/[0.02] transition-all border-b border-[var(--border)]/50 last:border-none cursor-pointer"
        >
            <td className="px-12 py-10">
                <div className="flex items-center gap-8">
                    <div className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:scale-110 transition-all duration-700 shadow-inner",
                        isLive ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" : "bg-slate-500/10 text-slate-500 group-hover:bg-slate-500 group-hover:text-white"
                    )}>
                        <MessageSquare size={32} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-2xl truncate group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{reply.name}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <span className={cn("text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full shadow-sm", isLive ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                                {reply.status}
                            </span>
                            <span className="text-[11px] text-[var(--muted-foreground)] font-bold uppercase tracking-[0.3em] opacity-40">Sync Node: {new Date(reply.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-12 py-10">
                <div className="inline-flex flex-col gap-2">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3">
                        <Zap size={16} className="text-[var(--primary)]" /> {reply.trigger_type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] truncate max-w-[240px]">
                        {reply.trigger_value || "Global Meta Event"}
                    </span>
                </div>
            </td>
            <td className="px-12 py-10">
                {page ? (
                    <div className="flex items-center gap-4 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm w-fit transition-all group-hover:border-primary/20">
                        <FacebookIcon size={16} className="text-[var(--primary)] fill-[var(--primary)]" />
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">{page.page_name}</span>
                    </div>
                ) : (
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Detached Page</span>
                )}
            </td>
            <td className="px-12 py-10 text-right">
                <div className="flex items-center justify-end gap-4" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => onToggleStatus(reply)}
                        className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border shadow-lg hover:scale-110",
                            isLive ? "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100"
                        )}
                    >
                        {isLive ? <Pause size={20} strokeWidth={2.5} /> : <Play size={20} strokeWidth={2.5} />}
                    </button>
                    <button onClick={() => onDuplicate(reply.id)} className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center shadow-lg hover:scale-110">
                        <Copy size={20} />
                    </button>
                    <BotReplyActions reply={reply} onEdit={onEdit} onDelete={onDelete} />
                </div>
            </td>
        </tr>
    );
}

function BotReplyActions({ reply, onEdit, onDelete }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-14 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-950 shadow-lg hover:scale-110">
                    <MoreVertical size={24} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-4 rounded-[2.5rem] border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl shadow-[0_32px_128px_rgba(0,0,0,0.25)]">
                <DropdownMenuItem onClick={() => onEdit(reply)} className="h-14 rounded-2xl gap-5 px-5 cursor-pointer">
                    <Pencil size={20} className="text-slate-500" /> <span className="font-black text-[12px] uppercase tracking-[0.2em]">Neural Designer</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-14 rounded-2xl gap-5 px-5 cursor-pointer" onClick={() => window.open(`https://facebook.com/${reply.facebook_page_id}`, '_blank')}>
                    <ExternalLink size={20} className="text-slate-500" /> <span className="font-black text-[12px] uppercase tracking-[0.2em]">Meta Context</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-14 rounded-2xl gap-5 px-5 cursor-pointer">
                    <BarChart2 size={20} className="text-slate-500" /> <span className="font-black text-[12px] uppercase tracking-[0.2em]">Deep Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-14 rounded-2xl gap-5 px-5 cursor-pointer">
                    <History size={20} className="text-slate-500" /> <span className="font-black text-[12px] uppercase tracking-[0.2em] opacity-40">System Trace</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-3 bg-slate-100 dark:bg-white/5" />
                <DropdownMenuItem onClick={() => onDelete(reply.id)} className="h-14 rounded-2xl gap-5 px-5 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                    <Trash2 size={20} className="text-red-500" /> <span className="font-black text-[12px] uppercase tracking-[0.2em]">Purge Node</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ActionCard({ action, onConfigure, onToggle, onDelete, onOpenFlow }: any) {
    const isMapped = !!action.automation_id;
    const isLive = action.status === 'published';

    return (
        <div className="group bg-[var(--card)] border border-[var(--border)] rounded-[4.5rem] p-12 hover:shadow-[0_32px_128px_rgba(0,0,0,0.15)] hover:border-primary/50 transition-all duration-700 flex flex-col gap-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Target className="w-48 h-48" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className={cn(
                    "w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-inner transition-all duration-700 group-hover:rotate-6",
                    isMapped ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                )}>
                    <Zap size={44} strokeWidth={2.5} />
                </div>
                {isMapped && (
                    <div className="flex gap-4">
                        <button onClick={onToggle} className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center transition-all active:scale-90 shadow-lg hover:scale-110", isLive ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-emerald-50 border-emerald-100 text-emerald-600")}>
                            {isLive ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button onClick={onDelete} className="w-12 h-12 rounded-2xl border bg-red-50 text-red-500 border-red-100 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90 shadow-lg hover:scale-110">
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4 relative z-10 flex-1">
                <div className="flex items-center gap-4">
                    <h3 className="font-black text-3xl uppercase tracking-tight text-slate-900 dark:text-white leading-tight">{action.label}</h3>
                    {isMapped && <span className={cn("w-3 h-3 rounded-full shadow-lg", isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />}
                </div>
                <p className="text-[var(--muted-foreground)] font-medium text-lg leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                    {isMapped 
                        ? "Currently governed by an active neural flow layer. Custom logic has overridden the system default behavior."
                        : "Operating on core system logic. Create a custom neural layer to orchestrate tailored responses for this event."}
                </p>
            </div>

            <div className="mt-10 relative z-10">
                {isMapped ? (
                    <button onClick={onOpenFlow} className="w-full h-20 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-primary/20 text-primary font-black uppercase tracking-[0.3em] text-[12px] shadow-sm hover:shadow-2xl hover:bg-primary/5 transition-all flex items-center justify-center gap-4">
                        <Box size={20} /> DESIGNER STUDIO
                    </button>
                ) : (
                    <button onClick={onConfigure} className="w-full h-20 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-neutral-900 font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
                        <Plus size={20} strokeWidth={4} /> OVERRIDE LOGIC
                    </button>
                )}
            </div>
        </div>
    );
}
