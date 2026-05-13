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
    Loader2,
    Eraser,
    ExternalLink,
    AlertCircle,
    Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface FacebookPageData {
    id: number;
    page_id: string;
    page_name: string;
    page_access_token: string;
    category?: string;
    picture?: string;
    is_enabled: string | number | boolean;
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
    const { showModal } = useModal();
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: "enable" | "disable" | "disconnect" | "disconnect-account" | "clean";
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
                        is_enabled: p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true,
                    }));
                setPages(fetchedPages);
            }
        } catch (err) {
            showModal("error", "Error", "Couldn't load your Facebook pages");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectedPages();

        // Listen for messages from the popup
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data?.type === 'SOCIAL_CONNECTION_SUCCESS') {
                fetchConnectedPages();
                setIsConnecting(false);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleConnectFacebook = useCallback(async () => {
        if (isConnecting) return;
        setIsConnecting(true);

        try {
            const response = await api.get("/social/facebook-connect/redirect");
            const redirectUrl = response.data.data?.url || response.data.data?.redirect_url;

            if (redirectUrl) {
                // Open in a popup
                const width = 600;
                const height = 700;
                const left = (window.innerWidth - width) / 2 + window.screenX;
                const top = (window.innerHeight - height) / 2 + window.screenY;
                
                const popup = window.open(
                    redirectUrl, 
                    'Facebook Connect', 
                    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
                );

                if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                    // Popup blocked
                    setIsConnecting(false);
                    showModal("error", "Popup Blocked", "Please allow popups to connect your Facebook account.");
                } else {
                    // Start a timer to stop the loading state if the popup is closed manually
                    const checkClosed = setInterval(() => {
                        if (popup.closed) {
                            clearInterval(checkClosed);
                            setIsConnecting(false);
                        }
                    }, 1000);
                }
            } else {
                setIsConnecting(false);
                showModal("error", "Error", "No redirect URL received from server");
            }
        } catch (err: any) {
            console.error("Facebook connect error:", err);
            setIsConnecting(false);
            showModal("error", "Error", "Failed to start Facebook connection");
        }
    }, [isConnecting, api, showModal, fetchConnectedPages]);

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
            if (type === "clean")
                endpoint = `/social/facebook-connect/page/${pageId}/clean`;

            const response = await api.post(endpoint);
            if (response.data.is_success || response.data.success) {
                showModal("success", "Success", response.data.message || "Action completed successfully");
                fetchConnectedPages();
            }
        } catch (err: any) {
            showModal("error", "Error", err.response?.data?.message || "Action failed");
        }
    };

    const stats = [
        {
            label: "Connected Pages",
            value: pages.length.toString(),
            icon: Layers,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-500/10"
        },
        {
            label: "Active Automations",
            value: pages.filter(p => p.is_enabled).length.toString(),
            icon: Webhook,
            color: "text-indigo-600",
            bg: "bg-indigo-50 dark:bg-indigo-500/10"
        },
        {
            label: "Total Reach",
            value: pages.reduce((acc, p) => acc + (p.followers_count || 0), 0).toLocaleString(),
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50 dark:bg-violet-500/10"
        },
    ];

    return (
        <div className="bg-gray-50/50 dark:bg-gray-950 min-h-screen pb-16">
            {/* Header */}
            <header className="border-b bg-white dark:bg-gray-900 dark:border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                        <Facebook className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">Facebook Integration</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("flex h-2 w-2 rounded-full", isLoading ? "bg-amber-500" : "bg-emerald-500")} />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {isLoading ? "Synchronizing..." : "System Active"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchConnectedPages}
                        disabled={isLoading}
                        className="rounded-xl"
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-primary")} />
                    </Button>
                    <Button
                        onClick={handleConnectFacebook}
                        disabled={isConnecting}
                        className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                    >
                        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
                        {isConnecting ? "Authorizing..." : "Connect Account"}
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
                {/* Stats Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-2xl border bg-white dark:bg-neutral-900 p-6 shadow-sm dark:border-neutral-800 transition duration-200"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                                <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    {stat.label}
                                </h3>
                            </div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {isLoading ? "..." : stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid Header */}
                <div className="flex items-center justify-between border-b pb-4 dark:border-neutral-800">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Connected Profiles</h2>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">Manage your Facebook accounts and related pages</p>
                    </div>
                </div>

                {/* Pages List */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse h-48 rounded-2xl bg-white dark:bg-neutral-900 border dark:border-neutral-800" />
                        ))}
                    </div>
                ) : accounts.length > 0 ? (
                    <div className="space-y-8">
                        {accounts.map(account => (
                            <div key={account.id} className="space-y-6">
                                <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-5 rounded-2xl border dark:border-neutral-800 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border dark:border-neutral-700 bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">
                                            {account.avatar ? <img src={account.avatar} className="w-full h-full object-cover" /> : account.name[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{account.name}</h3>
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs font-medium">Verified</span>
                                            </div>
                                            <p className="text-sm text-neutral-500">Facebook Authenticator · {account.pages.length} Pages</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setConfirmModal({ show: true, type: "disconnect-account", pageId: account.id, pageName: account.name })}
                                        className={cn(
                                            "h-10 px-4 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-medium flex items-center gap-2 border border-rose-100 dark:border-rose-900/50",
                                            account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true) && "opacity-50 cursor-not-allowed pointer-events-none grayscale"
                                        )}
                                        disabled={account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Account
                                    </Button>
                                </div>

                                {account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true) && (
                                    <div className="mx-4 mt-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 flex items-center gap-3 text-amber-800 dark:text-amber-400 text-sm">
                                        <Info className="w-4 h-4 shrink-0" />
                                        <p>You must disable all pages before you can disconnect this Facebook account.</p>
                                    </div>
                                )}

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pl-4 md:pl-8 border-l-2 ml-4 dark:border-neutral-800 pb-4">
                                    {account.pages.map((rawPage) => {
                                        const page = {
                                            ...rawPage,
                                            is_enabled: rawPage.is_enabled === "1" || rawPage.is_enabled === 1 || rawPage.is_enabled === true,
                                        };
                                        return (
                                        <div
                                            key={page.id}
                                            className="group relative rounded-2xl border bg-white dark:bg-neutral-900 p-5 shadow-sm dark:border-neutral-800 transition duration-200 hover:shadow-md"
                                        >
                                            <div className="flex items-start gap-4 mb-5">
                                                <div className="relative shrink-0">
                                                    <div className="h-14 w-14 overflow-hidden rounded-xl border dark:border-neutral-700 bg-gray-100 flex items-center justify-center">
                                                        {page.picture ? (
                                                            <img
                                                                src={page.picture}
                                                                alt={page.page_name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xl font-bold text-gray-500">{page.page_name[0]}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-1 flex-1 min-w-0 pr-6">
                                                    <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
                                                        {page.page_name}
                                                    </h3>
                                                    <p className="text-xs text-neutral-500 font-mono">
                                                        {page.page_id}
                                                    </p>
                                                    <p className="text-xs font-medium text-neutral-500">{page.category || "Social Entity"}</p>
                                                </div>

                                                {page.is_enabled && (
                                                    <div className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-900/30" title="Active Automation" />
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setConfirmModal({
                                                            show: true,
                                                            type: page.is_enabled ? "disable" : "enable",
                                                            pageId: page.id,
                                                            pageName: page.page_name,
                                                        })
                                                    }
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-sm font-medium transition-colors",
                                                        page.is_enabled
                                                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:hover:bg-amber-500/20"
                                                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20"
                                                    )}
                                                >
                                                    {page.is_enabled ? "Disable Page" : "Enable Page"}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    asChild
                                                    title="View on Facebook"
                                                    className="rounded-xl bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/20 transition-colors"
                                                >
                                                    <a href={`https://facebook.com/${page.page_id}`} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        setConfirmModal({
                                                            show: true,
                                                            type: "clean",
                                                            pageId: page.id,
                                                            pageName: page.page_name,
                                                        })
                                                    }
                                                    title="Clean Data"
                                                    className="rounded-xl bg-gray-50 text-gray-500 hover:text-primary hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 transition-colors"
                                                >
                                                    <Eraser className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    onClick={() =>
                                                        setConfirmModal({
                                                            show: true,
                                                            type: "disconnect",
                                                            pageId: page.id,
                                                            pageName: page.page_name,
                                                        })
                                                    }
                                                    title="Disconnect Page"
                                                    className="rounded-xl bg-gray-50 text-gray-500 hover:text-destructive hover:bg-destructive/10 dark:bg-gray-800 dark:hover:bg-destructive/20 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900 p-12 text-center max-w-2xl mx-auto mt-12">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mx-auto mb-6 flex items-center justify-center">
                            <Facebook className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No Facebook Pages Found</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto text-sm">Connect your Facebook account to start managing pages, setting up auto-replies, and configuring comment macros.</p>
                        <button
                            onClick={handleConnectFacebook}
                            className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition duration-200 active:scale-95"
                        >
                            Connect Account
                        </button>
                    </div>
                )}
            </main>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {confirmModal?.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl border dark:border-gray-800 z-10"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Confirm {confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1).replace("-", " ")}
                            </h3>
                            
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                Are you sure you want to {confirmModal.type.replace("-", " ")} <strong className="font-medium text-gray-900 dark:text-white">{confirmModal.pageName}</strong>? This action will modify your automation state for this entity.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-colors",
                                        confirmModal.type.includes("disconnect") ? "bg-rose-600 hover:bg-rose-700" :
                                        confirmModal.type === "clean" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"
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