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
    ChevronLeft,
    Settings,
    Plus,
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
        } catch (err: any) {
            const message = err.response?.data?.message || "Couldn't load your Facebook pages";
            const expired = err.response?.data?.expired;
            const feature = err.response?.data?.feature;
            const title = expired ? "Subscription Expired" : feature ? "Feature Not Available" : "Error";
            showModal("error", title, message);
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
            } else if (event.data?.type === 'oauth-error') {
                setIsConnecting(false);
                showModal("error", "Connection Failed", event.data.error || 'Failed to connect Facebook account.');
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
            const message = err.response?.data?.message || "Failed to start Facebook connection";
            const feature = err.response?.data?.feature;
            const expired = err.response?.data?.expired;
            const title = expired ? "Subscription Expired" : feature ? "Feature Not Available" : "Error";
            showModal("error", title, message);
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
            <header data-tour="page-heading" className="border-b bg-white dark:bg-gray-900 dark:border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-30">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* Back arrow — mobile only */}
                    <button
                        onClick={() => window.history.back()}
                        className="sm:hidden -ml-1 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {/* FB icon — desktop only */}
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center text-white shadow-sm flex-shrink-0">
                        <Facebook className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-[15px] sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight truncate">Facebook Integration</h1>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                            <span className={cn("flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full flex-shrink-0", isLoading ? "bg-amber-500" : "bg-emerald-500")} />
                            <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                                {isLoading ? "Synchronizing..." : "System Active"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchConnectedPages}
                        disabled={isLoading}
                        className="rounded-xl"
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-primary")} />
                    </Button>
                    {/* Connect button — desktop only */}
                    <Button
                        onClick={handleConnectFacebook}
                        disabled={isConnecting}
                        className="hidden sm:flex h-10 px-4 rounded-xl bg-gradient-to-r from-[#1877f2] to-[#0052d4] hover:opacity-95 text-white font-medium text-sm active:scale-95 transition-all items-center gap-2 shadow-sm border-0"
                    >
                        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
                        {isConnecting ? "Authorizing..." : "Connect Account"}
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8">

                {/* Full-width CTA — mobile only */}
                <button
                    onClick={handleConnectFacebook}
                    disabled={isConnecting}
                    className="sm:hidden w-full h-12 rounded-2xl bg-gradient-to-r from-[#1877f2] to-[#0052d4] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                    {isConnecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Authorizing...</> : <><Plus className="w-4 h-4" /> Connect Account</>}
                </button>

                {/* Stats Panel */}
                {/* Mobile: 2-col grid w/ first stat full-width | Desktop: 3-col equal */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.label}
                            className={cn(
                                "rounded-2xl border bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-sm dark:border-neutral-800 transition duration-200",
                                idx === 0 && "col-span-2 md:col-span-1"
                            )}
                        >
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                <div className={cn("w-9 h-9 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                    <stat.icon className={cn("w-4 h-4 sm:w-6 sm:h-6", stat.color)} />
                                </div>
                                <h3 className="text-[11px] sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-tight">
                                    {stat.label}
                                </h3>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
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
                            <div key={account.id} className="space-y-3 sm:space-y-6">
                                {/* Account row: compact card on mobile, side-by-side on desktop */}
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border dark:border-neutral-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border dark:border-neutral-700 bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold flex-shrink-0">
                                            {account.avatar ? <img src={account.avatar} className="w-full h-full object-cover" /> : account.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[14px] sm:text-lg font-semibold text-neutral-900 dark:text-white truncate">{account.name}</h3>
                                                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] sm:text-xs font-medium flex-shrink-0">Verified</span>
                                            </div>
                                            <p className="text-[12px] sm:text-sm text-neutral-500">Facebook Authenticator · {account.pages.length} Pages</p>
                                        </div>
                                        {/* Desktop: inline Disconnect button */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => setConfirmModal({ show: true, type: "disconnect-account", pageId: account.id, pageName: account.name })}
                                            className={cn(
                                                "hidden sm:flex h-10 px-4 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-medium items-center gap-2 border border-rose-100 dark:border-rose-900/50",
                                                account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true) && "opacity-50 cursor-not-allowed pointer-events-none grayscale"
                                            )}
                                            disabled={account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Account
                                        </Button>
                                    </div>
                                    {/* Mobile: full-width disconnect at bottom */}
                                    <div className="sm:hidden border-t dark:border-neutral-800">
                                        <button
                                            onClick={() => setConfirmModal({ show: true, type: "disconnect-account", pageId: account.id, pageName: account.name })}
                                            disabled={account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true)}
                                            className={cn(
                                                "w-full py-3 flex items-center justify-center gap-2 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors",
                                                account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true) && "opacity-40 pointer-events-none"
                                            )}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Disconnect Account
                                        </button>
                                    </div>
                                </div>

                                {account.pages.some(p => p.is_enabled === "1" || p.is_enabled === 1 || p.is_enabled === true) && (
                                    <div className="mx-2 sm:mx-4 px-3.5 sm:px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 flex items-start gap-2.5 sm:gap-3 text-amber-800 dark:text-amber-400 text-[12px] sm:text-sm">
                                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>You must disable all pages before you can disconnect this Facebook account.</p>
                                    </div>
                                )}

                                {/* Page cards grid */}
                                <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 pl-3 sm:pl-8 border-l-2 ml-2 sm:ml-4 dark:border-neutral-800 pb-4">
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

                                                {/* Mobile: compact flat action bar | Desktop: wrapped buttons */}
                                                <div className="hidden sm:flex flex-wrap items-center gap-3">
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
                                                    <Button variant="ghost" size="icon-sm" asChild title="View on Facebook" className="rounded-xl bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/20 transition-colors">
                                                        <a href={`https://facebook.com/${page.page_id}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => setConfirmModal({ show: true, type: "clean", pageId: page.id, pageName: page.page_name })} title="Clean Data" className="rounded-xl bg-gray-50 text-gray-500 hover:text-primary hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 transition-colors">
                                                        <Eraser className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => setConfirmModal({ show: true, type: "disconnect", pageId: page.id, pageName: page.page_name })} title="Disconnect Page" className="rounded-xl bg-gray-50 text-gray-500 hover:text-destructive hover:bg-destructive/10 dark:bg-gray-800 dark:hover:bg-destructive/20 transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {/* Mobile action bar: divider-separated icon row */}
                                                <div className="sm:hidden -mx-4 -mb-4 mt-3 border-t dark:border-neutral-800 flex items-center">
                                                    <button
                                                        onClick={() => setConfirmModal({ show: true, type: page.is_enabled ? "disable" : "enable", pageId: page.id, pageName: page.page_name })}
                                                        className={cn(
                                                            "flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-colors border-r dark:border-neutral-800",
                                                            page.is_enabled ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                                                        )}
                                                    >
                                                        {page.is_enabled ? <Pause className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                        {page.is_enabled ? "Pause Bot" : "Find Out"}
                                                    </button>
                                                    <a href={`https://facebook.com/${page.page_id}`} target="_blank" rel="noopener noreferrer" className="w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors border-r dark:border-neutral-800">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button onClick={() => setConfirmModal({ show: true, type: "clean", pageId: page.id, pageName: page.page_name })} className="w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-primary transition-colors border-r dark:border-neutral-800">
                                                        <Eraser className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setConfirmModal({ show: true, type: "disconnect", pageId: page.id, pageName: page.page_name })} className="w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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
                            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#1877f2] to-[#0052d4] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition duration-200 active:scale-95 inline-flex items-center justify-center gap-2"
                        >
                            <Facebook className="w-4 h-4" />
                            Connect Account
                        </button>
                    </div>
                )}
            </main>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {confirmModal?.show && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
                                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all active:scale-95 hover:opacity-90"
                                    style={{
                                        background: confirmModal.type.includes("disconnect")
                                            ? "rgb(225 29 72)" // rose-600
                                            : "var(--primary)"
                                    }}
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