"use client";

import { useEffect, useState } from "react";
import {
    Facebook, Instagram, Check, X, RefreshCw, Layers, Webhook, TrendingUp, Users, Trash2, Power, Pause, ChevronRight, Settings, MessageSquare, Plus
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

export default function FacebookPage() {
    const [pages, setPages] = useState<FacebookPageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: 'enable' | 'disable' | 'disconnect';
        pageId: string;
        pageName: string;
    } | null>(null);

    const [stats, setStats] = useState([
        { label: "Active Pages", value: "0", icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Automation", value: "0", icon: Webhook, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Total Reach", value: "0", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    ]);

    const fetchConnectedPages = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/social/facebook-connect");
            if (response.data.is_success || response.data.success) {
                const accounts = response.data.data.facebook_accounts || [];
                const fetchedPages = accounts.flatMap((acc: any) => acc.pages || []).map((p: any) => ({
                    ...p,
                    // Robust boolean parsing for is_enabled (handles 0/1, strings, and booleans)
                    is_enabled: !!(p.is_enabled === 1 || p.is_enabled === "1" || p.is_enabled === true)
                }));
                setPages(fetchedPages);

                setStats([
                    { label: "Active Pages", value: fetchedPages.length.toString(), icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Automation", value: fetchedPages.filter((p: any) => p.is_enabled).length.toString(), icon: Webhook, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Total Reach", value: fetchedPages.reduce((acc: number, p: any) => acc + (p.followers_count || 0), 0).toLocaleString(), icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
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
            toast.error("Popup blocked! Please allow popups for this site.");
            setIsConnecting(false);
            return;
        }

        try {
            const response = await api.get("/social/facebook-connect/redirect");
            const isSuccess = response.data.is_success || response.data.success;
            const redirectUrl = response.data.data?.url || response.data.data?.redirect_url;

            if (isSuccess && redirectUrl) {
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

            const response = await api.post(endpoint);
            if (response.data.is_success || response.data.success) {
                toast.success(response.data.message || "Action completed successfully");

                // Optimistically update the UI state immediately
                if (type === 'enable' || type === 'disable') {
                    setPages(prev => prev.map(p =>
                        (String(p.id) === String(pageId) || String(p.page_id) === String(pageId))
                            ? { ...p, is_enabled: type === 'enable' }
                            : p
                    ));
                }

                fetchConnectedPages();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Action failed");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Minimal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Facebook Assets</h1>
                    <p className="text-sm text-neutral-500">Connect and manage your brand identities.</p>
                </div>
                <button
                    onClick={handleConnectFacebook}
                    disabled={isConnecting}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-[#1877F2] text-white hover:bg-[#166fe5] transition-all disabled:opacity-50"
                >
                    {isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>{isConnecting ? 'Connecting...' : 'Connect Identity'}</span>
                </button>
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg)}>
                            <s.icon className={cn("w-5 h-5", s.color)} />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-neutral-900 dark:text-white leading-none">{isLoading ? '...' : s.value}</div>
                            <div className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider mt-1">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pages Grid - Refined Layout */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-1">Active Identities</h2>
                    <button onClick={fetchConnectedPages} className="p-1 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md transition-colors">
                        <RefreshCw className={cn("w-3.5 h-3.5 text-neutral-400", isLoading && "animate-spin")} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl bg-neutral-100 dark:bg-white/5 animate-pulse" />)}
                    </div>
                ) : pages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <div key={page.id} className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl p-4 hover:border-[#1877F2]/40 transition-all flex flex-col justify-between group">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800">
                                                {page.picture ? (
                                                    <img src={page.picture} alt={page.page_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-500/10 text-blue-500 font-bold text-xl uppercase">
                                                        {page.page_name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#1877F2] border-2 border-white dark:border-[#0a0a0b] flex items-center justify-center">
                                                <Facebook className="w-3 h-3 text-white" />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-neutral-900 dark:text-white text-sm truncate">{page.page_name}</h3>
                                            <p className="text-[10px] text-neutral-500 truncate">{page.category || 'Identity'}</p>
                                            {page.instagram_username && (
                                                <div className="flex items-center gap-1 text-[10px] text-pink-500 font-medium mt-0.5">
                                                    <Instagram className="w-2.5 h-2.5" /> @{page.instagram_username}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setConfirmModal({ show: true, type: 'disconnect', pageId: page.id, pageName: page.page_name })}
                                            className="p-1.5 rounded-md text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                                            title="Disconnect"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                                            page.is_enabled
                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400"
                                        )}>
                                            {page.is_enabled ? 'Active' : 'Paused'}
                                        </span>
                                        <span className="text-[10px] text-neutral-400 font-medium flex items-center gap-1">
                                            <Users className="w-3 h-3" /> {page.followers_count || 0}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setConfirmModal({ show: true, type: page.is_enabled ? 'disable' : 'enable', pageId: page?.id, pageName: page.page_name })}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                                            page.is_enabled
                                                ? "bg-white dark:bg-white/5 border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/10"
                                                : "bg-blue-600 border-blue-600 text-white hover:bg-blue-500"
                                        )}
                                    >
                                        {page.is_enabled ? <Pause className="w-3 h-3" /> : <Power className="w-3 h-3" />}
                                        {page.is_enabled ? 'Pause' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-white/5 border border-dashed border-neutral-300 dark:border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
                            <Facebook className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Configure Assets</h3>
                        <p className="text-sm text-neutral-500 max-w-xs mb-8">Connect your Facebook Identities to enable AI automation.</p>
                        <button onClick={handleConnectFacebook} className="px-6 py-2 rounded-lg bg-[#1877F2] text-white font-semibold hover:bg-[#166fe5] transition-all">Get Started</button>
                    </div>
                )}
            </div>

            {/* Redesigned Modal - Compact & Contrast Focused */}
            <AnimatePresence>
                {confirmModal?.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#0f0f12] border border-neutral-200 dark:border-white/10 rounded-xl p-6 w-full max-w-sm shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                    confirmModal.type === 'disconnect' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    {confirmModal.type === 'disconnect' ? <Trash2 className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-white capitalize">{confirmModal.type} Connection</h3>
                                    <p className="text-[11px] text-neutral-500">Action cannot be undone.</p>
                                </div>
                            </div>

                            <p className="text-sm text-neutral-700 dark:text-neutral-400 mb-6 leading-relaxed">
                                Are you sure you want to {confirmModal.type} management for <span className="font-bold text-neutral-900 dark:text-white">{confirmModal.pageName}</span>?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 py-2 rounded-lg bg-neutral-100 dark:bg-white/5 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-sm font-bold text-white shadow-sm",
                                        confirmModal.type === 'disconnect' ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"
                                    )}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
