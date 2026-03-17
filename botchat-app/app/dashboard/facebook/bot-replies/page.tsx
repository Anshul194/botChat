"use client";

import { useEffect, useState } from "react";
import { 
    Plus, Search, MoreHorizontal, MessageSquare, 
    Play, Pause, Trash2, Copy, Eye, Send, 
    ChevronRight, Filter, RefreshCw, LayoutGrid, List as ListIcon,
    AlertCircle, CheckCircle2, Clock, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

export default function BotRepliesPage() {
    const [replies, setReplies] = useState<BotReply[]>([]);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    
    const [newReply, setNewReply] = useState({
        name: "",
        facebook_page_id: "",
        trigger_type: "exact",
        trigger_value: ""
    });

    const fetchReplies = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/facebook/bot-replies");
            if (response.data.success || response.data.is_success) {
                setReplies(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Replies Error:", error);
            toast.error("Failed to load bot replies");
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

    useEffect(() => {
        fetchReplies();
        fetchPages();
    }, []);

    const handleCreate = async () => {
        const isKeywordRequired = !['welcome', 'fallback'].includes(newReply.trigger_type);
        if (!newReply.name || !newReply.facebook_page_id || (isKeywordRequired && !newReply.trigger_value)) {
            toast.error("Please fill all required fields");
            return;
        }
        setIsCreating(true);
        try {
            const response = await api.post("/facebook/bot-replies", newReply);
            if (response.data.success || response.data.is_success) {
                toast.success("Bot reply created successfully");
                setShowCreateModal(false);
                fetchReplies();
            }
        } catch (error) {
            toast.error("Failed to create bot reply");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this bot reply?")) return;
        try {
            await api.delete(`/facebook/bot-replies/${id}`);
            toast.success("Bot reply deleted");
            setReplies(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Failed to delete bot reply");
        }
    };

    const handleDuplicate = async (id: number) => {
        try {
            await api.post(`/facebook/bot-replies/${id}/duplicate`);
            toast.success("Bot reply duplicated");
            fetchReplies();
        } catch (error) {
            toast.error("Failed to duplicate bot reply");
        }
    };

    const handleToggleStatus = async (reply: BotReply) => {
        const newStatus = reply.status === 'published' ? 'draft' : 'publish';
        try {
            await api.patch(`/facebook/bot-replies/${reply.id}/${newStatus}`);
            toast.success(`Bot reply set to ${newStatus === 'publish' ? 'Live' : 'Draft'}`);
            fetchReplies();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredReplies = replies.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.trigger_value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">
                        Facebook <span className="text-indigo-600">Bot Replies</span>
                    </h1>
                    <p className="text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] opacity-70">
                        Intelligent auto-replies for your Messenger audience
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-neutral-100 dark:bg-white/5 p-1 rounded-xl border border-neutral-200 dark:border-white/10 shadow-inner">
                        <button 
                            onClick={() => setViewMode('grid')} 
                            className={cn(
                                "p-2 px-4 rounded-lg transition-all flex items-center gap-2", 
                                viewMode === 'grid' ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-400"
                            )}>
                            <LayoutGrid className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Grid</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={cn(
                                "p-2 px-4 rounded-lg transition-all flex items-center gap-2", 
                                viewMode === 'list' ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-400"
                            )}>
                            <ListIcon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">List</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Create Bot</span>
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Bots", val: replies.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", icon: MessageSquare },
                    { label: "Active Now", val: replies.filter(r => r.status === 'published').length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: CheckCircle2 },
                    { label: "Drafts", val: replies.filter(r => r.status === 'draft').length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", icon: Clock },
                    { label: "Connected Pages", val: pages.length, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10", icon: LayoutGrid },
                ].map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: i * 0.1 }}
                        key={s.label} 
                        className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 p-5 rounded-2xl shadow-sm flex items-center gap-4"
                    >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", s.bg)}>
                            <s.icon className={cn("w-6 h-6", s.color)} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-neutral-900 dark:text-white leading-none">{s.val}</div>
                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tool Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input 
                        type="text" 
                        placeholder="SEARCH BOTS BY NAME OR KEYWORDS..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 ring-indigo-500/20 transition-all placeholder:text-neutral-400"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={fetchReplies}
                        className="p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 rounded-xl border border-neutral-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-neutral-100 dark:bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredReplies.length > 0 ? (
                <div className={cn(
                    viewMode === 'grid' 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" 
                        : "flex flex-col gap-3"
                )}>
                    <AnimatePresence mode="popLayout">
                        {filteredReplies.map((reply, idx) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                key={reply.id}
                                className={cn(
                                    "group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 transition-all hover:shadow-xl hover:shadow-indigo-500/5",
                                    viewMode === 'grid' ? "rounded-3xl p-6 flex flex-col h-full" : "rounded-2xl p-4 flex items-center justify-between"
                                )}
                            >
                                <div className={cn("flex items-start", viewMode === 'grid' ? "justify-between mb-6" : "gap-4 flex-1")}>
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600", viewMode === 'list' && "w-10 h-10")}>
                                        <MessageSquare className={cn("w-6 h-6", viewMode === 'list' && "w-5 h-5")} />
                                    </div>
                                    <div className={cn("flex-1", viewMode === 'grid' ? "ml-4" : "ml-0")}>
                                        <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">{reply.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">On {reply.page_name || 'Selected Page'}</span>
                                            <div className={cn(
                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                reply.status === 'published' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-neutral-100 text-neutral-400 dark:bg-white/5"
                                            )}>
                                                {reply.status}
                                            </div>
                                        </div>
                                    </div>
                                    {viewMode === 'grid' && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDelete(reply.id)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {viewMode === 'grid' && (
                                    <div className="space-y-4 mb-8">
                                        <div className="bg-neutral-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-neutral-100/50 dark:border-white/5">
                                            <div className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Zap className="w-3 h-3 text-indigo-500" />
                                                Trigger {reply.trigger_type}
                                            </div>
                                            <div className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 p-2 rounded-lg border border-neutral-100 dark:border-white/5 break-words">
                                                {reply.trigger_value}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Updated {new Date(reply.updated_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                )}

                                <div className={cn("flex items-center gap-2", viewMode === 'grid' ? "mt-auto" : "")}>
                                    <button 
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/5"
                                        onClick={() => window.location.href = `/dashboard/flows?id=${reply.id}&platform=facebook`}
                                    >
                                        <Eye className="w-4 h-4" />
                                        Launch Builder
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(reply)}
                                        className={cn(
                                            "p-3 rounded-xl transition-all active:scale-95",
                                            reply.status === 'published' ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                        )}
                                        title={reply.status === 'published' ? 'Set to Draft' : 'Go Live'}
                                    >
                                        {reply.status === 'published' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDuplicate(reply.id)}
                                        className="p-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all active:scale-95"
                                        title="Duplicate"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    {viewMode === 'list' && (
                                        <button onClick={() => handleDelete(reply.id)} className="p-3 rounded-xl hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-100 dark:border-white/5 rounded-3xl p-16 text-center flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
                        <MessageSquare className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-2">No Bot Replies Found</h2>
                    <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-[0.2em] max-w-sm mb-8 opacity-70">
                        Start your first automated conversation to engage with your Facebook audience 24/7.
                    </p>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-3 rounded-xl bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.25em] shadow-xl shadow-indigo-500/30 active:scale-95 transition-all"
                    >
                        Design Your First Bot
                    </button>
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">New Bot Configuration</h3>
                                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Set the foundations for your automation</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-400">
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Internal Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="E.G. SUPPORT BOT / SPRING CAMPAIGN"
                                        value={newReply.name}
                                        onChange={(e) => setNewReply({...newReply, name: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Target Page</label>
                                    <select 
                                        value={newReply.facebook_page_id}
                                        onChange={(e) => setNewReply({...newReply, facebook_page_id: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">SELECT A CONNECTED PAGE</option>
                                        {pages.map(page => (
                                            <option key={page.page_id} value={page.page_id}>{page.page_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Trigger Type</label>
                                        <select 
                                            value={newReply.trigger_type}
                                            onChange={(e) => setNewReply({...newReply, trigger_type: e.target.value})}
                                            className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="exact">EXACT KEYWORD</option>
                                            <option value="contains">CONTAINS KEYWORD</option>
                                            <option value="starts_with">STARTS WITH</option>
                                            <option value="welcome">WELCOME MESSAGE</option>
                                            <option value="fallback">DEFAULT FALLBACK</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">Keywords</label>
                                        <input 
                                            type="text" 
                                            placeholder={['welcome', 'fallback'].includes(newReply.trigger_type) ? "NOT REQUIRED" : "HELP, PRICE, INFO"}
                                            value={newReply.trigger_value}
                                            onChange={(e) => setNewReply({...newReply, trigger_value: e.target.value})}
                                            className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/5 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 ring-indigo-500/20 transition-all disabled:opacity-30"
                                            disabled={['welcome', 'fallback'].includes(newReply.trigger_type)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 rounded-2xl bg-neutral-100 dark:bg-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleCreate}
                                        disabled={isCreating}
                                        className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all disabled:opacity-50"
                                    >
                                        {isCreating ? 'Synchronizing...' : 'Initialize Bot'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
