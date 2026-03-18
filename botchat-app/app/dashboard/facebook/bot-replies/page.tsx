"use client";

import { useEffect, useState, useMemo } from "react";
import { 
    Plus, Search, MessageSquare, Play, Pause, Trash2, Copy, 
    CheckCircle2, Target, Bot, MousePointerClick, 
    Menu as MenuIcon, Settings2, Sparkles, Box
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

const MENUS = [
    { id: 'bot_reply', label: 'Bot Replies', icon: MessageSquare },
    { id: 'ai_agent', label: 'AI Agent', icon: Bot },
    { id: 'action_buttons', label: 'Action Buttons', icon: MousePointerClick },
    { id: 'persistent_menu', label: 'Persistent Menu', icon: MenuIcon },
] as const;

type MenuId = typeof MENUS[number]['id'];

export default function BotRepliesPage() {
    const router = useRouter();
    const [replies, setReplies] = useState<BotReply[]>([]);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
    const [activeMenu, setActiveMenu] = useState<MenuId>('bot_reply');
    
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
                if (fetchedPages.length > 0 && !selectedPage) {
                    setSelectedPage(fetchedPages[0]);
                    setNewReply(prev => ({ ...prev, facebook_page_id: fetchedPages[0].page_id }));
                }
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
            setNewReply({
                name: "",
                facebook_page_id: selectedPage?.page_id || "",
                trigger_type: "exact",
                trigger_value: ""
            });
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

    const filteredReplies = useMemo(() => {
        return replies.filter(r => 
            r.facebook_page_id === selectedPage?.page_id &&
            (r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.trigger_value.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [replies, selectedPage, searchQuery]);

    return (
        <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 font-sans pb-24 max-w-7xl mx-auto">
            
            {/* 1. PAGES SELECTOR (Modern Subtle Bar) */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-2 mb-8 shadow-sm flex items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 flex flex-shrink-0 items-center justify-center mr-3 ml-1">
                    <Target className="w-5 h-5" />
                </div>
                <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar pr-2 items-center">
                    {pages.length > 0 ? pages.map(page => (
                        <button
                            key={page.page_id}
                            onClick={() => {
                                setSelectedPage(page);
                                setNewReply(prev => ({ ...prev, facebook_page_id: page.page_id }));
                            }}
                            className={cn(
                                "px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all whitespace-nowrap",
                                selectedPage?.page_id === page.page_id 
                                    ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 shadow-sm"
                                    : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            )}
                        >
                            {page.page_name}
                        </button>
                    )) : (
                        <div className="text-sm font-medium text-neutral-400 px-2 py-2">Loading Connected Pages...</div>
                    )}
                </div>
            </div>

            {/* 2. MENU TABS (Inline simple tabs instead of gigantic cards) */}
            <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto no-scrollbar">
                {MENUS.map(menu => (
                    <button
                        key={menu.id}
                        onClick={() => setActiveMenu(menu.id)}
                        className={cn(
                            "pb-4 px-2 text-[15px] font-semibold flex items-center gap-2 transition-all relative whitespace-nowrap",
                            activeMenu === menu.id 
                                ? "text-purple-600 dark:text-purple-400" 
                                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
                        )}
                    >
                        <menu.icon className="w-4 h-4" />
                        {menu.label}
                        {activeMenu === menu.id && (
                            <motion.div 
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-500 rounded-t-full" 
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
                                                        <span className="text-xs text-neutral-500 font-medium">
                                                            Type: {reply.trigger_type}
                                                        </span>
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
                                                >
                                                    {reply.status === 'published' ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(reply.id)}
                                                    className="p-2.5 rounded-lg border border-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-all active:scale-95"
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
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Start Building Flows</h3>
                                    <p className="text-sm text-neutral-500 max-w-xs mt-1 mb-6">Create your first automated response trigger to engage your page audience 24/7.</p>
                                    <button 
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:scale-105 transition-transform"
                                    >
                                        Create Reply
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* OTHER TABS (Simplified placeholders) */}
                    {activeMenu === 'action_buttons' && (
                        <motion.div key="action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Messenger Action Buttons</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {["Get Started", "No Match", "Location Reply", "Unsubscribe", "Resubscribe", "Chat with Human", "Chat with Bot"].map((btn, i) => (
                                    <div key={i} className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-800 transition-colors cursor-pointer group">
                                        <h3 className="font-bold text-neutral-900 dark:text-white text-[15px]">{btn}</h3>
                                        <div className="mt-3 flex items-center text-[12px] font-semibold text-purple-600 transition-all">
                                            <Settings2 className="w-4 h-4 mr-1.5" /> Configure Endpoint
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeMenu === 'ai_agent' && (
                        <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                            <Bot className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">AI Agent Intelligence</h3>
                            <p className="text-sm text-neutral-500 max-w-sm mt-2 font-medium mx-auto">Train and manage a natural language processing model. Coming extremely soon.</p>
                        </motion.div>
                    )}

                    {activeMenu === 'persistent_menu' && (
                        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
                            <MenuIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Persistent Menu</h3>
                            <p className="text-sm text-neutral-500 max-w-sm mt-2 font-medium mx-auto">Design the permanent hamburger menu that displays inside Messenger.</p>
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
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">New Automation for {selectedPage?.page_name}</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Internal Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Sales Inquiry"
                                        value={newReply.name}
                                        onChange={(e) => setNewReply({...newReply, name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Trigger Operator</label>
                                    <select 
                                        value={newReply.trigger_type}
                                        onChange={(e) => setNewReply({...newReply, trigger_type: e.target.value})}
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
                                        onChange={(e) => setNewReply({...newReply, trigger_value: e.target.value})}
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
    );
}
