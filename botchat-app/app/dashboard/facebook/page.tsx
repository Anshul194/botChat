"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Facebook,
    Instagram,
    RefreshCw,
    Layers,
    Webhook,
    Users,
    Trash2,
    Power,
    Pause,
    LayoutGrid,
    List,
    TrendingUp,
    Plus,
    Loader2,
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
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: "enable" | "disable" | "disconnect" | "disconnect-account";
        pageId: string | number;
        pageName: string;
    } | null>(null);

    const fetchConnectedPages = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/social/facebook-connect");
            if (response.data.is_success || response.data.success) {
                const fetchedAccounts = response.data.data.facebook_accounts || [];
                setAccounts(fetchedAccounts);

                const fetchedPages = fetchedAccounts
                    .flatMap((acc: any) => acc.pages || [])
                    .map((p: any) => ({
                        ...p,
                        is_enabled: !!p.is_enabled,
                    }));
                setPages(fetchedPages);
            }
        } catch (err) {
            toast.error("Couldn't load your Facebook assets");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectedPages();
    }, []);

    const handleConnectFacebook = useCallback(async () => {
        if (isConnecting) return;
        setIsConnecting(true);

        const width = 600;
        const height = 750;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        const popup = window.open(
            "about:blank",
            "facebook-connect",
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
            toast.error("Popup blocked! Please allow popups for this site.");
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
                }, 800);
            } else {
                popup.close();
                setIsConnecting(false);
                toast.error("No redirect URL received from server");
            }
        } catch (err: any) {
            console.error("Facebook connect error:", err);
            popup?.close();
            setIsConnecting(false);
            toast.error("Failed to start Facebook connection");
        }
    }, [isConnecting, api, toast, fetchConnectedPages]);

    const handleAction = async () => {
        if (!confirmModal) return;
        const { type, pageId } = confirmModal;
        setConfirmModal(null);

        try {
            let endpoint = "";
            if (type === "enable")
                endpoint = `/social/facebook-connect/page/${pageId}/enable`;
            if (type === "disable")
                endpoint = `/social/facebook-connect/page/${pageId}/disable`;
            if (type === "disconnect")
                endpoint = `/social/facebook-connect/page/${pageId}/disconnect`;
            if (type === "disconnect-account")
                endpoint = `/social/facebook-connect/account/${pageId}/disconnect`;

            const response = await api.post(endpoint);
            if (response.data.is_success || response.data.success) {
                toast.success(response.data.message || "Action completed successfully");
                fetchConnectedPages();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Action failed");
        }
    };

    const stats = [
        { 
            label: "Connected Pages", 
            value: pages.length.toString(), 
            icon: Layers, 
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        { 
            label: "Active Automations", 
            value: pages.filter(p => p.is_enabled).length.toString(), 
            icon: Webhook, 
            color: "text-indigo-500",
            bg: "bg-indigo-500/10"
        },
        { 
            label: "Total Reach", 
            value: pages.reduce((acc, p) => acc + (p.followers_count || 0), 0).toLocaleString(), 
            icon: Users, 
            color: "text-violet-500",
            bg: "bg-violet-500/10"
        },
    ];

    return (
        <div className="bg-gray-50/40 dark:bg-gray-950 min-h-screen pb-20">
            {/* High-Fidelity Header */}
            <div className="z-40 mx-auto max-w-[1480px] px-4 md:px-8 pt-6">
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white dark:border-white/5 rounded-3xl p-4 md:p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-4 pl-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Facebook className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none tracking-tight">Facebook Connect</h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className={cn("flex h-1.5 w-1.5 rounded-full", isLoading ? "bg-amber-500" : "bg-blue-500 animate-pulse")} />
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono">
                                    {isLoading ? "Fetching..." : "Protocol Active"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                         <div className="hidden lg:flex items-center gap-6 border-r pr-6 border-neutral-200 dark:border-neutral-800">
                            {stats.map(s => (
                                <div key={s.label} className="text-right">
                                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.1em] block">{s.label}</span>
                                    <span className="text-sm font-black dark:text-white leading-none">{s.value}</span>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={fetchConnectedPages}
                            disabled={isLoading}
                            className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-neutral-100 dark:border-neutral-700 hover:border-blue-200 transition-all shadow-sm"
                        >
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-blue-500")} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-[1480px] px-4 md:px-8 py-8 space-y-10">
                {/* Hero Cluster */}
                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Premium Hero */}
                        <div className="group relative rounded-[2.5rem] bg-neutral-900 border border-neutral-800 p-8 md:p-12 overflow-hidden shadow-2xl transition-all hover:border-blue-500/30">
                            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
                            <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700" />
                            
                            <div className="relative z-10 max-w-xl space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-black uppercase tracking-[0.15em]">
                                    <Webhook className="w-4 h-4" />
                                    Meta Platform Integration
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                                    Scale Your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">Facebook</span> Presence
                                </h2>
                                <p className="text-neutral-400 text-lg leading-relaxed font-medium">
                                    Power your sales and support with smart comment replies, message sequences, and automated Page management tools.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button
                                        onClick={handleConnectFacebook}
                                        disabled={isConnecting}
                                        className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-[0_10px_40px_rgb(37,99,235,0.3)] hover:shadow-[0_15px_50px_rgb(37,99,235,0.4)] hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3"
                                    >
                                        {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Facebook className="w-5 h-5 fill-current" />}
                                        {isConnecting ? "AUTHORIZING..." : "CONNECT PAGE"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Connected User Overview */}
                        {accounts.map(acc => (
                            <motion.div 
                                key={acc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group rounded-[2rem] bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:border-blue-500/30 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-neutral-800 shadow-xl">
                                            {acc.avatar ? (
                                                <img src={acc.avatar} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-black text-2xl uppercase">{acc.name[0]}</div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center border-2 border-white dark:border-neutral-900 shadow-lg">
                                            <Facebook className="w-3.5 h-3.5 text-white fill-current" />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block mb-0.5">Primary Authenticator</span>
                                        <h3 className="text-xl font-black text-neutral-900 dark:text-white leading-none">{acc.name}</h3>
                                        <div className="flex items-center gap-2.5 mt-2">
                                            <span className="text-[10px] font-black uppercase text-blue-500">Live Connection</span>
                                            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase">{acc.pages.length} Assets Found</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setConfirmModal({ show: true, type: "disconnect-account", pageId: acc.id, pageName: acc.name })}
                                    className="p-4 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Meta Stats Panel */}
                    <div className="lg:col-span-4 grid gap-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="group relative rounded-[2rem] border bg-white dark:bg-neutral-900/50 p-7 shadow-sm dark:border-neutral-800 hover:border-blue-500/20 transition-all"
                            >
                                <div className="space-y-6">
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", stat.bg)}>
                                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">
                                                {stat.label}
                                            </span>
                                            <span className="text-3xl font-black text-neutral-900 dark:text-white">
                                                {isLoading ? "..." : stat.value}
                                            </span>
                                        </div>
                                        <TrendingUp className="w-10 h-10 text-neutral-100 dark:text-neutral-800 group-hover:text-blue-100 dark:group-hover:text-neutral-700 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-8">
                    <div>
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Active Reach</h2>
                        <p className="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-1">Facebook Pages & Profiles</p>
                    </div>
                    <div className="flex rounded-2xl border dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 p-1.5 shadow-sm">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                                viewMode === "grid"
                                    ? "bg-white dark:bg-neutral-100 shadow-md text-blue-600 dark:text-black"
                                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                            )}
                        >
                            <LayoutGrid className="inline h-4 w-4 mr-2" />
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                                viewMode === "list"
                                    ? "bg-white dark:bg-neutral-100 shadow-md text-blue-600 dark:text-black"
                                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                            )}
                        >
                            <List className="inline h-4 w-4 mr-2" />
                            List
                        </button>
                    </div>
                </div>

                {/* Pages List */}
                {isLoading ? (
                    <div className={cn("grid gap-8", viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "")}>
                         {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse h-64 rounded-3xl bg-neutral-100 dark:bg-neutral-800/40" />
                        ))}
                    </div>
                ) : pages.length > 0 ? (
                    <div className={cn("grid gap-8", viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col")}>
                        {pages.map((page) => (
                             <div
                             key={page.id}
                             className={cn(
                                 "group relative rounded-[2.5rem] border bg-white p-8 shadow-sm dark:border-white/5 dark:bg-gray-900/40 hover:shadow-2xl hover:border-blue-500/50 transition-all duration-500",
                                 viewMode === "list" && "flex items-center justify-between"
                             )}
                         >
                             <div className={cn("flex gap-6", viewMode === "grid" ? "flex-col items-center text-center" : "items-center")}>
                                 <div className="relative shrink-0">
                                     <div className={cn(
                                         "overflow-hidden rounded-[2rem] border-4 border-neutral-50 dark:border-neutral-800 shadow-lg group-hover:scale-105 transition-all duration-500 ring-1 ring-neutral-100 dark:ring-white/10",
                                         viewMode === "grid" ? "h-24 w-24" : "h-20 w-20"
                                     )}>
                                         {page.picture ? (
                                             <img
                                                 src={page.picture}
                                                 alt={page.page_name}
                                                 className="h-full w-full object-cover"
                                             />
                                         ) : (
                                             <div className="flex h-full w-full items-center justify-center bg-blue-600 text-white text-3xl font-black uppercase">
                                                 {page.page_name[0]}
                                             </div>
                                         )}
                                     </div>
                                     <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-blue-600 p-2 shadow-xl ring-4 ring-white dark:ring-gray-900 group-hover:rotate-12 transition-transform">
                                         <Facebook className="h-full w-full text-white fill-current" />
                                     </div>
                                 </div>

                                 <div className="space-y-1.5 flex-1 min-w-0">
                                     <h3 className="text-xl font-black text-neutral-900 dark:text-white truncate tracking-tight group-hover:text-blue-600 transition-colors">
                                         {page.page_name}
                                     </h3>
                                     <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 font-mono tracking-tighter uppercase whitespace-nowrap">
                                         ID: {page.page_id}
                                     </p>
                                     <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">{page.category || "Social Entity"}</p>
                                     
                                     {page.instagram_username && (
                                         <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 text-[10px] font-black uppercase mt-2">
                                            <Instagram className="w-3 h-3" />
                                            @{page.instagram_username}
                                         </div>
                                     )}
                                 </div>
                             </div>

                             <div className={cn("flex items-center gap-4", viewMode === "grid" ? "mt-8" : "ml-8")}>
                                 <button
                                     onClick={() =>
                                         setConfirmModal({
                                             show: true,
                                             type: page.is_enabled ? "disable" : "enable",
                                             pageId: page.id,
                                             pageName: page.page_name,
                                         })
                                     }
                                     className={cn(
                                         "flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest transition-all shadow-sm",
                                         page.is_enabled
                                             ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20"
                                             : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20"
                                     )}
                                 >
                                     {page.is_enabled ? <Pause className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                     {page.is_enabled ? "Pause" : "Enable"}
                                 </button>

                                 <button
                                     onClick={() =>
                                         setConfirmModal({
                                             show: true,
                                             type: "disconnect",
                                             pageId: page.id,
                                             pageName: page.page_name,
                                         })
                                     }
                                     className="p-3.5 rounded-2xl bg-neutral-50 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 dark:bg-gray-800/40 dark:hover:bg-rose-950/40 transition-all shadow-sm"
                                 >
                                     <Trash2 className="h-5 w-5" />
                                 </button>
                             </div>

                             {page.is_enabled && (
                                 <div className="absolute top-6 right-6">
                                     <div className="absolute h-4 w-4 rounded-full bg-emerald-500 opacity-40 animate-ping" />
                                     <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-md relative" />
                                 </div>
                             )}
                         </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[3rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 p-20 text-center">
                         <div className="w-24 h-24 rounded-3xl bg-white dark:bg-neutral-900 shadow-xl mx-auto mb-8 flex items-center justify-center">
                            <Facebook className="h-12 w-12 text-neutral-300" />
                        </div>
                        <h3 className="text-2xl font-black text-neutral-900 dark:text-white mb-4 uppercase tracking-tight">No Facebook Pages Found</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-10 text-lg font-medium">Link your Facebook account to start managing pages and enabling automations.</p>
                        <button
                            onClick={handleConnectFacebook}
                             className="rounded-2xl bg-blue-600 px-12 py-4 text-xs font-black uppercase tracking-widest text-white shadow-2xl hover:bg-blue-700 transition-all active:scale-95"
                        >
                            Connect Your First Account
                        </button>
                    </div>
                )}
            </main>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {confirmModal?.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 20 }}
                            className="w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-neutral-900 p-10 shadow-2xl dark:border dark:border-neutral-800"
                        >
                            <div className={cn(
                                "mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] shadow-inner",
                                confirmModal.type.includes("disconnect") ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                            )}>
                                {confirmModal.type.includes("disconnect") ? <Trash2 className="h-10 w-10" /> : <Power className="h-10 w-10" />}
                            </div>

                            <h3 className="text-3xl font-black text-center text-neutral-900 dark:text-white mb-4 uppercase tracking-tight leading-none">
                                {confirmModal.type.includes("disconnect") ? "Disconnect" : confirmModal.type === "enable" ? "Enable" : "Pause"} Action
                            </h3>

                            <p className="text-center text-neutral-500 dark:text-neutral-400 mb-12 text-lg font-medium">
                                Proceed with operation for <strong className="text-neutral-900 dark:text-white font-black">{confirmModal.pageName}</strong>?
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 py-4 text-xs font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    className={cn(
                                        "flex-1 rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all",
                                        confirmModal.type.includes("disconnect") ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
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