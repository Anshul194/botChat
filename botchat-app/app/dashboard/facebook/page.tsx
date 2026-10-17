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
import { SafeDisconnectModal, DisconnectTarget } from "@/components/channels/SafeDisconnectModal";

import { useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();
    const highlightPageId = searchParams.get("highlight_page");

    const [accounts, setAccounts] = useState<FacebookAccount[]>([]);
    const [pages, setPages] = useState<FacebookPageData[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const { showModal } = useModal();
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: "enable" | "disable" | "disconnect" | "disconnect-account" | "clean";
        pageId: string | number;
        pageName: string;
    } | null>(null);
    const [safeDisconnectTarget, setSafeDisconnectTarget] = useState<DisconnectTarget | null>(null);

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

    // Scroll into view & highlight page card if redirected with highlight_page query param
    useEffect(() => {
        if (highlightPageId && pages.length > 0) {
            const timer = setTimeout(() => {
                const el = document.getElementById(`page-card-${highlightPageId}`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [highlightPageId, pages]);

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
    }, [isConnecting, showModal, fetchConnectedPages]);

    const handleAction = async () => {
        if (!confirmModal || isActionLoading) return;
        const { type, pageId } = confirmModal;
        setIsActionLoading(true);

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
                setConfirmModal(null);
                await fetchConnectedPages();
            } else {
                showModal("error", "Error", response.data.message || "Action failed");
            }
        } catch (err: any) {
            showModal("error", "Error", err.response?.data?.message || "Action failed");
        } finally {
            setIsActionLoading(false);
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
        <div className="pb-16">
            <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                {/* Header */}
                <header data-tour="page-heading" className="w-full rounded-2xl border border-gray-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3.5 sm:px-6 py-3 sm:py-4 shadow-sm flex items-center justify-between gap-2.5 sm:gap-4 relative z-10">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        {/* Back arrow — mobile only */}
                        <button
                            onClick={() => window.history.back()}
                            className="sm:hidden -ml-1 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                            aria-label="Back"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        {/* FB icon — desktop only */}
                        <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-600 items-center justify-center text-white shadow-sm flex-shrink-0">
                            <Facebook className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight truncate">
                                    Facebook Integration
                                </h1>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-[10px] sm:text-xs font-medium flex-shrink-0">
                                    <span className={cn("flex h-1.5 w-1.5 rounded-full flex-shrink-0", isLoading ? "bg-amber-500 animate-ping" : "bg-emerald-500")} />
                                    <span>{isLoading ? "Synchronizing..." : "System Active"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={fetchConnectedPages}
                            disabled={isLoading}
                            className="rounded-xl flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                            aria-label="Refresh pages"
                        >
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-primary")} />
                        </Button>
                        {/* Connect button — desktop only */}
                        <Button
                            onClick={handleConnectFacebook}
                            disabled={isConnecting}
                            className="hidden sm:flex h-10 px-4 rounded-xl bg-gradient-to-r from-[#1877f2] to-[#0052d4] hover:opacity-95 text-white font-medium text-sm active:scale-95 transition-all items-center gap-2 shadow-sm border-0 flex-shrink-0"
                        >
                            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
                            {isConnecting ? "Authorizing..." : "Connect Account"}
                        </Button>
                    </div>
                </header>

                {/* Full-width CTA — mobile only */}
                <button
                    onClick={handleConnectFacebook}
                    disabled={isConnecting}
                    className="sm:hidden w-full h-11 sm:h-12 rounded-2xl bg-gradient-to-r from-[#1877f2] to-[#0052d4] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
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
                                "rounded-2xl border border-gray-200/80 bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-sm dark:border-neutral-800 transition duration-200",
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
                <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white">Connected Profiles</h2>
                        <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">Manage your Facebook accounts and related pages</p>
                    </div>
                </div>

                {/* Pages List */}
                {isLoading ? (
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse h-48 rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800" />
                        ))}
                    </div>
                ) : accounts.length > 0 ? (
                    <div className="space-y-6 sm:space-y-8">
                        {accounts.map(account => (
                            <div key={account.id} className="space-y-3 sm:space-y-6">
                                {/* Account row: compact card on mobile, side-by-side on desktop */}
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-gray-300 text-base sm:text-lg font-bold flex-shrink-0">
                                            {account.avatar ? (
                                                <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{account.name ? account.name[0]?.toUpperCase() : "F"}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm sm:text-lg font-semibold text-neutral-900 dark:text-white truncate">{account.name}</h3>
                                                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-medium flex-shrink-0">Verified</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 truncate">Facebook Authenticator · {account.pages.length} Pages</p>
                                        </div>
                                        {/* Desktop: inline Disconnect button */}
                                        <Button
                                            variant="ghost"
                                            onClick={() => setSafeDisconnectTarget({ id: account.id, name: account.name, type: "account", platform: "facebook" })}
                                            className="hidden sm:flex h-10 px-4 rounded-xl text-rose-600 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-medium items-center gap-2 border border-rose-100 dark:border-rose-900/50 flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Disconnect Account
                                        </Button>
                                    </div>
                                    {/* Mobile: full-width disconnect at bottom */}
                                    <div className="sm:hidden border-t border-gray-100 dark:border-neutral-800">
                                        <button
                                            onClick={() => setSafeDisconnectTarget({ id: account.id, name: account.name, type: "account", platform: "facebook" })}
                                            className="w-full py-3 px-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Disconnect Account
                                        </button>
                                    </div>
                                </div>

                                {/* Page cards grid */}
                                <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 pl-2 sm:pl-8 border-l-2 ml-1 sm:ml-4 dark:border-neutral-800 pb-2 sm:pb-4">
                                    {account.pages.map((rawPage) => {
                                        const page = {
                                            ...rawPage,
                                            is_enabled: rawPage.is_enabled === "1" || rawPage.is_enabled === 1 || rawPage.is_enabled === true,
                                        };
                                        const isHighlighted = highlightPageId && (String(page.id) === String(highlightPageId) || String(page.page_id) === String(highlightPageId));

                                        return (
                                            <div
                                                key={page.id}
                                                id={`page-card-${page.id}`}
                                                className={cn(
                                                    "group relative rounded-2xl border border-gray-200/80 bg-white dark:bg-neutral-900 p-4 sm:p-5 shadow-sm dark:border-neutral-800 transition duration-200 hover:shadow-md",
                                                    isHighlighted && "ring-2 ring-primary ring-offset-2 animate-pulse shadow-2xl border-primary"
                                                )}
                                            >
                                                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                                                    <div className="relative shrink-0 flex-shrink-0">
                                                        <div className="h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                                                            {page.picture ? (
                                                                <img
                                                                    src={page.picture}
                                                                    alt={page.page_name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-lg sm:text-xl font-bold text-gray-500 dark:text-gray-400">
                                                                    {page.page_name ? page.page_name[0]?.toUpperCase() : "P"}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0 pr-5">
                                                        <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white truncate">
                                                            {page.page_name}
                                                        </h3>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono truncate">
                                                            {page.page_id}
                                                        </p>
                                                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">{page.category || "Social Entity"}</p>
                                                    </div>

                                                    {page.is_enabled && (
                                                        <div className="absolute top-4 sm:top-5 right-4 sm:right-5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-900/30" title="Active Automation" />
                                                    )}
                                                </div>

                                                {/* Desktop: wrapped buttons */}
                                                <div className="hidden sm:flex flex-wrap items-center gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={isActionLoading}
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
                                                        {page.is_enabled ? <Pause className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                        {page.is_enabled ? "Disable Bot" : "Enable Bot"}
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" asChild title="View on Facebook" className="rounded-xl bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:hover:bg-blue-900/20 transition-colors">
                                                        <a href={`https://facebook.com/${page.page_id}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => setConfirmModal({ show: true, type: "clean", pageId: page.id, pageName: page.page_name })} title="Clean Data" className="rounded-xl bg-gray-50 text-gray-500 hover:text-primary hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 transition-colors">
                                                        <Eraser className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => setSafeDisconnectTarget({ id: page.id, name: page.page_name, type: "page", platform: "facebook" })} title="Disconnect Page" className="rounded-xl bg-gray-50 text-gray-500 hover:text-destructive hover:bg-destructive/10 dark:bg-gray-800 dark:hover:bg-destructive/20 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {/* Mobile action bar: divider-separated icon row */}
                                                <div className="sm:hidden -mx-4 -mb-4 mt-3 border-t border-gray-100 dark:border-neutral-800 flex items-stretch">
                                                    <button
                                                        disabled={isActionLoading}
                                                        onClick={() => setConfirmModal({ show: true, type: page.is_enabled ? "disable" : "enable", pageId: page.id, pageName: page.page_name })}
                                                        className={cn(
                                                            "flex-1 min-w-0 py-2.5 px-2 flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-colors border-r border-gray-100 dark:border-neutral-800",
                                                            page.is_enabled ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20" : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                                        )}
                                                    >
                                                        {page.is_enabled ? <Pause className="w-3.5 h-3.5 flex-shrink-0" /> : <Power className="w-3.5 h-3.5 flex-shrink-0" />}
                                                        <span className="truncate">{page.is_enabled ? "Disable Bot" : "Enable Bot"}</span>
                                                    </button>
                                                    <a href={`https://facebook.com/${page.page_id}`} target="_blank" rel="noopener noreferrer" className="w-10 sm:w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors border-r border-gray-100 dark:border-neutral-800 flex-shrink-0" title="View on Facebook">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button onClick={() => setConfirmModal({ show: true, type: "clean", pageId: page.id, pageName: page.page_name })} className="w-10 sm:w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-primary transition-colors border-r border-gray-100 dark:border-neutral-800 flex-shrink-0" title="Clean Data">
                                                        <Eraser className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setSafeDisconnectTarget({ id: page.id, name: page.page_name, type: "page", platform: "facebook" })} className="w-10 sm:w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex-shrink-0" title="Disconnect Page">
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
                    <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900 p-8 sm:p-12 text-center max-w-2xl mx-auto mt-6 sm:mt-12">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-gray-100 dark:border-neutral-700 mx-auto mb-6 flex items-center justify-center">
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
            </div>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {confirmModal?.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
                        <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm" onClick={() => !isActionLoading && setConfirmModal(null)} />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 sm:p-6 shadow-xl z-10 mx-4 sm:mx-0"
                        >
                            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2 truncate">
                                Confirm {confirmModal.type === 'enable' ? 'Enable Bot' : confirmModal.type === 'disable' ? 'Disable Bot' : confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1).replace("-", " ")}
                            </h3>

                            <p className="text-[var(--muted-foreground)] mb-6 text-sm leading-relaxed">
                                Are you sure you want to {confirmModal.type === 'enable' ? 'enable bot automation for' : confirmModal.type === 'disable' ? 'disable bot automation for' : confirmModal.type.replace("-", " ")} <strong className="font-medium text-[var(--foreground)]">{confirmModal.pageName}</strong>? {confirmModal.type === 'disable' ? 'When disabled, all automated replies, comment automations, and bot flows will be immediately stopped.' : 'This will resume automated responses for incoming interactions.'}
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    disabled={isActionLoading}
                                    onClick={() => setConfirmModal(null)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors shrink-0 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={isActionLoading}
                                    onClick={handleAction}
                                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all active:scale-95 hover:opacity-90 shrink-0 inline-flex items-center gap-2 disabled:opacity-50"
                                    style={{
                                        background: confirmModal.type.includes("disconnect")
                                            ? "rgb(225 29 72)" // rose-600
                                            : "var(--primary)"
                                    }}
                                >
                                    {isActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BUG-003: Safe Disconnect Modal with Stop-All-Campaigns Flow */}
            <SafeDisconnectModal
                open={Boolean(safeDisconnectTarget)}
                onOpenChange={(open) => !open && setSafeDisconnectTarget(null)}
                target={safeDisconnectTarget}
                onSuccess={fetchConnectedPages}
            />
        </div>
    );
}