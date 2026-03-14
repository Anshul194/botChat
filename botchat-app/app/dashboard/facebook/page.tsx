"use client";

import { useEffect, useState } from "react";
import {
    Facebook, Instagram, Check, X, RefreshCw, Layers, Webhook, TrendingUp, Users, Trash2, Power, Pause, ChevronRight, Settings, MessageSquare, Plus, Link2, MoreHorizontal, LayoutGrid, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FacebookPageData {
    id: number;
    page_id: string;
    page_name: string;
    page_access_token: string;
    category?: string;
    picture?: string;
    is_enabled: boolean;
    instagram_username?: string;
    followers_count?: number;
}

interface FacebookAccount {
    id: number;
    name: string;
    avatar?: string;
    status: string;
    pages: FacebookPageData[];
}

export default function FacebookPage() {
    const [accounts, setAccounts] = useState<FacebookAccount[]>([]);
    const [pages, setPages] = useState<FacebookPageData[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: 'enable' | 'disable' | 'disconnect' | 'disconnect-account';
        pageId: string | number;
        pageName: string;
    } | null>(null);

    const [stats, setStats] = useState([
        { label: "Active Pages", value: "0", icon: Layers, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
        { label: "Automation", value: "0", icon: Webhook, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        { label: "Total Reach", value: "0", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
    ]);

    const fetchConnectedPages = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/social/facebook-connect");
            if (response.data.is_success || response.data.success) {
                const fetchedAccounts = response.data.data.facebook_accounts || [];
                setAccounts(fetchedAccounts);
                
                const fetchedPages = fetchedAccounts.flatMap((acc: any) => acc.pages || []).map((p: any) => ({
                    ...p,
                    is_enabled: !!(p.is_enabled === 1 || p.is_enabled === "1" || p.is_enabled === true)
                }));
                setPages(fetchedPages);

                setStats([
                    { label: "Active Pages", value: fetchedPages.length.toString(), icon: Layers, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Automation", value: fetchedPages.filter((p: any) => p.is_enabled).length.toString(), icon: Webhook, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                    { label: "Total Reach", value: fetchedPages.reduce((acc: number, p: any) => acc + (p.followers_count || 0), 0).toLocaleString(), icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
                ]);
            }
        } catch (err: any) {
            console.error("Fetch Pages Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectedPages();
    }, []);

    const handleConnectFacebook = async () => {
        if (isConnecting) return;
        setIsConnecting(true);
        const width = 600;
        const height = 750;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        const popup = window.open('about:blank', 'facebook-connect', `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`);
        if (!popup) {
            toast.error("Popup blocked!");
            setIsConnecting(false);
            return;
        }
        try {
            const response = await api.get("/social/facebook-connect/redirect");
            const redirectUrl = response.data.data?.url || response.data.data?.redirect_url;
            if (redirectUrl) {
                popup.location.href = redirectUrl;
                const pollTimer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(pollTimer);
                        setIsConnecting(false);
                        fetchConnectedPages();
                    }
                }, 1000);
            } else {
                popup.close();
                setIsConnecting(false);
            }
        } catch (err) {
            popup.close();
            setIsConnecting(false);
        }
    };

    const handleAction = async () => {
        if (!confirmModal) return;
        const { type, pageId } = confirmModal;
        setConfirmModal(null);
        try {
            let endpoint = "";
            if (type === 'enable') endpoint = `/social/facebook-connect/page/${pageId}/enable`;
            else if (type === 'disable') endpoint = `/social/facebook-connect/page/${pageId}/disable`;
            else if (type === 'disconnect') endpoint = `/social/facebook-connect/page/${pageId}/disconnect`;
            else if (type === 'disconnect-account') endpoint = `/social/facebook-connect/account/${pageId}/disconnect`;
            
            const response = await api.post(endpoint);
            if (response.data.is_success || response.data.success) {
                toast.success(response.data.message || "Success");
                if (type === 'enable' || type === 'disable') {
                    setPages(prev => prev.map(p => (String(p.id) === String(pageId) || String(p.page_id) === String(pageId)) ? { ...p, is_enabled: type === 'enable' } : p));
                }
                fetchConnectedPages();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed");
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in duration-300">
            {/* Minimal Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">Facebook Assets</h1>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.1em] mt-0.5 opacity-60">Manage your connected social identities</p>
                </div>
                <button onClick={fetchConnectedPages} className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg transition-all">
                    <RefreshCw className={cn("w-4 h-4 text-neutral-400", isLoading && "animate-spin")} />
                </button>
            </div>

            {/* Compact Header Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Slim Hero */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg border border-blue-500/20">
                    <div className="relative z-10 space-y-3">
                        <h2 className="text-xl font-bold tracking-tight">Expand reach with Meta Assets</h2>
                        <p className="text-blue-100/70 text-[11px] font-medium max-w-sm">Connect your business pages to synchronize messages and automate engagement layers.</p>
                        <button onClick={handleConnectFacebook} disabled={isConnecting} className="px-5 py-2 rounded-lg bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-blue-50">
                            {isConnecting ? "Syncing..." : "Connect Account"}
                        </button>
                    </div>
                    <Facebook className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-48 h-48 opacity-10 rotate-12" />
                </div>

                {/* Vertical Mini Stats */}
                <div className="grid grid-cols-1 gap-2">
                    {stats.map((s) => (
                        <div key={s.label} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-xl p-3 px-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", s.bg)}>
                                    <s.icon className={cn("w-4 h-4", s.color)} />
                                </div>
                                <span className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.1em]">{s.label}</span>
                            </div>
                            <span className="text-sm font-black text-neutral-900 dark:text-white">{isLoading ? ".." : s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Connected Accounts Sub-Row */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.25em]">Connected Platforms</h2>
                    <button className="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Manage All</button>
                </div>
                <div className="flex flex-wrap gap-3">
                    {accounts.length > 0 ? accounts.map((acc) => (
                        <div key={acc.id} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-lg p-3 pr-4 flex items-center gap-4 shadow-sm group">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border-2 border-white dark:border-neutral-900 shadow-sm">
                                    {acc.avatar ? <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-blue-500/10 text-blue-500 text-[10px] font-bold">{acc.name[0]}</div>}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-md bg-[#1877F2] flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-sm">
                                    <Facebook className="w-2 h-2 text-white fill-current" />
                                </div>
                            </div>
                            <div className="min-w-0 pr-2">
                                <div className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-tight truncate">{acc.name}</div>
                                <div className="text-[8px] text-emerald-500 font-black uppercase mt-0.5 flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    Active
                                </div>
                            </div>
                            <button 
                                onClick={() => setConfirmModal({ show: true, type: 'disconnect-account', pageId: acc.id, pageName: acc.name })}
                                className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )) : <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest p-2">Sync Account to begin</div>}
                </div>
            </div>

            {/* Identities Hub */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/5">
                    <h2 className="text-[10px] font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.25em]">Identity Assets</h2>
                    <div className="flex bg-neutral-100 dark:bg-white/5 p-0.5 rounded-lg border border-neutral-200 dark:border-white/10 shadow-inner">
                        <button onClick={() => setViewMode('grid')} className={cn("p-1.5 px-3 rounded-md transition-all flex items-center gap-1.5", viewMode === 'grid' ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600")}>
                            <LayoutGrid className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Grid</span>
                        </button>
                        <button onClick={() => setViewMode('list')} className={cn("p-1.5 px-3 rounded-md transition-all flex items-center gap-1.5", viewMode === 'list' ? "bg-white dark:bg-neutral-800 shadow-sm text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600")}>
                            <List className="w-3 h-3" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">List</span>
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-2")}>
                        {[1, 2, 3, 4].map((i) => <div key={i} className={cn("bg-neutral-50 dark:bg-white/5 animate-pulse rounded-lg", viewMode === 'grid' ? "h-48" : "h-14")} />)}
                    </div>
                ) : pages.length > 0 ? (
                    <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-2")}>
                        {pages.map((page) => (
                            <div key={page.id} className={cn(
                                "group bg-white dark:bg-neutral-900 border transition-all hover:bg-neutral-50/50 dark:hover:bg-white/[0.02]",
                                viewMode === 'grid' 
                                    ? "p-6 rounded-lg shadow-sm flex flex-col items-center text-center relative hover:shadow-md" 
                                    : "p-3 px-5 rounded-lg flex items-center justify-between border-neutral-100 dark:border-white/5"
                            )}>
                                {/* Status Indicator */}
                                {viewMode === 'grid' && (
                                    <div className="absolute top-4 right-4">
                                        <div className={cn("w-2 h-2 rounded-full", page.is_enabled ? "bg-emerald-500 shadow-sm" : "bg-neutral-200 dark:bg-neutral-800")} />
                                    </div>
                                )}

                                {/* Main Identity Content */}
                                <div className={cn("flex items-center", viewMode === 'grid' ? "flex-col mb-4" : "gap-4")}>
                                    <div className="relative mb-0">
                                        <div className={cn("rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-white/5", viewMode === 'grid' ? "w-16 h-16 mb-4" : "w-10 h-10")}>
                                            {page.picture ? <img src={page.picture} alt={page.page_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-blue-500 font-bold text-lg">{page.page_name[0]}</div>}
                                        </div>
                                        <div className={cn("absolute -bottom-1 -right-1 rounded-md bg-[#1877F2] flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-sm", viewMode === 'grid' ? "w-6 h-6" : "w-4 h-4")}>
                                            <Facebook className={cn(viewMode === 'grid' ? "w-3 h-3" : "w-2 h-2", "text-white fill-current")} />
                                        </div>
                                    </div>
                                    <div className={cn(viewMode === 'grid' ? "text-center space-y-1" : "min-w-0 pr-4")}>
                                        <div className="text-[11px] font-black text-neutral-900 dark:text-white uppercase tracking-tight truncate max-w-[140px]">{page.page_name}</div>
                                        <div className="text-[8px] text-neutral-400 font-black uppercase tracking-widest">{page.category || "General Identity"}</div>
                                        {page.instagram_username && (
                                            <div className="flex items-center justify-center gap-1 text-[8px] text-pink-500 font-black mt-1 uppercase tracking-tight">
                                                <Instagram className="w-2.5 h-2.5" /> {page.instagram_username}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className={cn("flex items-center", viewMode === 'grid' ? "w-full space-y-2 mt-auto" : "gap-3")}>
                                    {viewMode === 'list' && (
                                        <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", page.is_enabled ? "bg-emerald-50 text-emerald-600 border-emerald-500/10" : "bg-neutral-50 text-neutral-400 border-neutral-100")}>
                                            {page.is_enabled ? "Running" : "Paused"}
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setConfirmModal({ show: true, type: page.is_enabled ? 'disable' : 'enable', pageId: page.id, pageName: page.page_name })}
                                        className={cn(
                                            "flex items-center justify-center transition-all",
                                            viewMode === 'grid' 
                                                ? "w-full py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2 bg-neutral-100 dark:bg-white/5 text-neutral-900 dark:text-white hover:bg-neutral-200" 
                                                : "p-2 hover:bg-neutral-100 rounded-lg text-neutral-400"
                                        )}
                                    >
                                        {page.is_enabled ? <Pause className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                        {viewMode === 'grid' && (page.is_enabled ? "Pause" : "Enable")}
                                    </button>
                                    <button 
                                        onClick={() => setConfirmModal({ show: true, type: 'disconnect', pageId: page.id, pageName: page.page_name })}
                                        className={cn("text-neutral-300 hover:text-red-500 transition-colors", viewMode === 'grid' ? "absolute bottom-3 right-3 p-1.5 opacity-0 group-hover:opacity-100" : "p-2")}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-900 border-2 border-dashed border-neutral-100 dark:border-white/5 rounded-xl p-12 text-center flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center mb-4"><Facebook className="w-6 h-6 text-neutral-400" /></div>
                        <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight mb-1">No Assets Syncronized</h3>
                        <p className="text-[10px] text-neutral-500 max-w-xs mb-6 uppercase tracking-wide">Link your business accounts to start scaling AI automation across your channels.</p>
                        <button onClick={handleConnectFacebook} className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-95">Link First Identity</button>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmModal?.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-[2px]">
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-white/5 rounded-xl p-8 w-full max-w-xs shadow-2xl text-center">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6", confirmModal.type === 'disconnect' ? "bg-red-50 text-red-500" : "bg-indigo-50 text-indigo-500")}>
                                {confirmModal.type === 'disconnect' ? <Trash2 className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
                            </div>
                            <h3 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-2">{confirmModal.type} Connection</h3>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide mb-8 px-2 leading-relaxed">Confirm action for identity assets belonging to <span className="text-neutral-900 dark:text-white">{confirmModal.pageName}</span>?</p>
                            <div className="flex gap-2">
                                <button onClick={() => setConfirmModal(null)} className="flex-1 py-2.5 rounded-lg bg-neutral-100 text-[9px] font-black uppercase tracking-widest text-neutral-400 transition-colors hover:bg-neutral-200">Cancel</button>
                                <button onClick={handleAction} className={cn("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all active:scale-95", confirmModal.type === 'disconnect' ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700")}>Confirm</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
