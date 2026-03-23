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

    const [stats, setStats] = useState([
        { label: "Active Pages", value: "0", icon: Layers, color: "text-blue-600 dark:text-blue-400" },
        { label: "Automations", value: "0", icon: Webhook, color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Total Followers", value: "0", icon: Users, color: "text-violet-600 dark:text-violet-400" },
    ]);

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

                setStats([
                    {
                        label: "Active Pages",
                        value: fetchedPages.length.toString(),
                        icon: Layers,
                        color: "text-blue-600 dark:text-blue-400",
                    },
                    {
                        label: "Automations",
                        value: fetchedPages.filter((p: FacebookPageData) => p.is_enabled).length.toString(),
                        icon: Webhook,
                        color: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                        label: "Total Followers",
                        value: fetchedPages
                            .reduce((acc: number, p: FacebookPageData) => acc + (p.followers_count || 0), 0)
                            .toLocaleString(),
                        icon: Users,
                        color: "text-violet-600 dark:text-violet-400",
                    },
                ]);
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

    return (
        <div className="bg-gray-50/40 dark:bg-gray-950 min-h-screen pb-20">
            {/* Floating Header Bar (Non-Sticky) */}
            <div className="z-40 mx-auto max-w-[1480px] px-4 md:px-8 pt-6">
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white dark:border-white/5 rounded-3xl p-4 md:p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center gap-4 pl-2">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Facebook className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                                Facebook Assets
                            </h1>
                            <p className="hidden md:block text-[10px] uppercase tracking-widest font-black text-gray-400 opacity-80">
                                Manage connected identities
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pr-1">
                        <div className="hidden lg:flex items-center gap-6 mr-6 border-r border-gray-200 dark:border-white/5 pr-6">
                            {stats.slice(0, 2).map(s => (
                                <div key={s.label} className="flex flex-col items-end">
                                    <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">{s.label}</span>
                                    <span className="text-sm font-black dark:text-white">{isLoading ? "—" : s.value}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={fetchConnectedPages}
                            disabled={isLoading}
                            className="p-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                        >
                            <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mx-auto max-w-[1480px] px-4 md:px-8 mt-10">
                <div className="space-y-12">
                    {/* Hero + Stats Section */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <div className="h-full rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10 space-y-6 max-w-xl">
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                        Connect & Automate with Meta
                                    </h2>
                                    <p className="text-blue-50/80 text-base leading-relaxed">
                                        Link your Facebook Pages and Instagram profiles to power smart messaging and automation.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <button
                                            onClick={handleConnectFacebook}
                                            disabled={isConnecting}
                                            className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg hover:shadow-xl active:scale-95 transition-all"
                                        >
                                            {isConnecting ? "Syncing..." : "Connect Account"}
                                        </button>
                                        <button
                                            onClick={() => (window.location.href = "/dashboard/facebook/bot-replies")}
                                            className="rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all"
                                        >
                                            Bot Replies
                                        </button>
                                    </div>
                                </div>
                                <Facebook className="absolute -right-8 -bottom-8 h-40 w-40 opacity-15 rotate-12" />
                            </div>
                        </div>

                        <div className="lg:col-span-4 flex flex-col gap-4">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="flex-1 rounded-2xl border bg-white p-5 shadow-sm dark:border-white/5 dark:bg-gray-900/40"
                                >
                                    <div className="flex items-center justify-between h-full">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 shadow-inner">
                                                <stat.icon className={cn("h-5 w-5", stat.color)} />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                {stat.label}
                                            </span>
                                        </div>
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">
                                            {isLoading ? "—" : stat.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connected Accounts */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Connected Accounts
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((acc) => (
                                <div
                                    key={acc.id}
                                    className="group rounded-2xl border bg-gray-50/50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/40 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="relative shrink-0">
                                            <div className="h-16 w-16 overflow-hidden rounded-2xl border dark:border-gray-700 shadow-inner">
                                                {acc.avatar ? (
                                                    <img
                                                        src={acc.avatar}
                                                        alt={acc.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-300 text-2xl font-bold">
                                                        {acc.name?.[0] ?? "?"}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-[#1877F2] p-1.5 shadow-md ring-2 ring-white dark:ring-gray-900">
                                                <Facebook className="h-4 w-4 text-white" fill="currentColor" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="text-xl font-semibold truncate">{acc.name}</div>
                                            <div className="mt-1.5 flex items-center gap-2 text-base text-emerald-600 dark:text-emerald-400 font-medium">
                                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                                                Connected
                                            </div>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setConfirmModal({
                                                    show: true,
                                                    type: "disconnect-account",
                                                    pageId: acc.id,
                                                    pageName: acc.name,
                                                })
                                            }
                                            className="rounded-xl bg-red-50/0 p-3 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {accounts.length === 0 && !isLoading && (
                                <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
                                    <p className="text-lg text-gray-500 dark:text-gray-400">
                                        No accounts connected yet. Start by connecting your Facebook account.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Connected Pages & Profiles */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                                Connected Pages & Profiles
                            </h2>
                            <div className="flex rounded-xl border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 shadow-sm p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={cn(
                                        "px-5 py-2.5 text-base font-medium rounded-lg transition-all",
                                        viewMode === "grid"
                                            ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    )}
                                >
                                    <LayoutGrid className="inline h-5 w-5 mr-2" />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "px-5 py-2.5 text-base font-medium rounded-lg transition-all",
                                        viewMode === "list"
                                            ? "bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    )}
                                >
                                    <List className="inline h-5 w-5 mr-2" />
                                    List
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div
                                className={cn(
                                    "grid gap-8",
                                    viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-6"
                                )}
                            >
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse rounded-2xl bg-gray-50 dark:bg-gray-800 h-72 shadow-sm" />
                                ))}
                            </div>
                        ) : pages.length > 0 ? (
                            <div
                                className={cn(
                                    "grid gap-8",
                                    viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-6"
                                )}
                            >
                                {pages.map((page) => (
                                    <div
                                        key={page.id}
                                        className="group relative rounded-3xl border bg-gray-50/30 p-7 shadow-sm dark:border-gray-800 dark:bg-gray-800/20 hover:shadow-xl hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300"
                                    >
                                        <div className={cn("flex gap-6", viewMode === "grid" ? "flex-col items-center text-center" : "items-center")}>
                                            <div className="relative shrink-0">
                                                <div
                                                    className={cn(
                                                        "overflow-hidden rounded-2xl border dark:border-gray-700 shadow-inner",
                                                        viewMode === "grid" ? "h-24 w-24" : "h-20 w-20"
                                                    )}
                                                >
                                                    {page.picture ? (
                                                        <img
                                                            src={page.picture}
                                                            alt={page.page_name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-300 text-3xl font-bold">
                                                            {page.page_name?.[0] ?? "P"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-3 -right-3 h-9 w-9 rounded-full bg-[#1877F2] p-2 shadow-lg ring-2 ring-white dark:ring-gray-900">
                                                    <Facebook className="h-5 w-5 text-white" fill="currentColor" />
                                                </div>
                                            </div>

                                            <div className="space-y-2 flex-1 min-w-0">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                                                    {page.page_name}
                                                </h3>
                                                <p className="text-base text-gray-600 dark:text-gray-400">{page.category || "Facebook Page"}</p>
                                                {page.instagram_username && (
                                                    <div className="flex items-center gap-2.5 text-base text-pink-600 dark:text-pink-400 font-medium mt-1">
                                                        <Instagram className="h-5 w-5" />
                                                        @{page.instagram_username}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className={cn("flex items-center gap-5 mt-8", viewMode === "grid" ? "justify-center" : "")}>
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
                                                    "flex items-center gap-3 rounded-2xl px-6 py-3 text-base font-semibold transition-all shadow-sm",
                                                    page.is_enabled
                                                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900/70"
                                                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:hover:bg-emerald-900/70"
                                                )}
                                            >
                                                {page.is_enabled ? <Pause className="h-5 w-5" /> : <Power className="h-5 w-5" />}
                                                {page.is_enabled ? "Pause Automation" : "Enable Automation"}
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
                                                className="rounded-2xl bg-red-50/50 p-4 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition-colors"
                                            >
                                                <Trash2 className="h-6 w-6" />
                                            </button>
                                        </div>

                                        {page.is_enabled && (
                                            <div className="absolute top-6 right-6 flex h-4 w-4 items-center justify-center">
                                                <div className="absolute h-4 w-4 rounded-full bg-emerald-500 opacity-40 animate-ping" />
                                                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/20 p-16 text-center shadow-sm">
                                <Facebook className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    No Pages Connected Yet
                                </h3>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
                                    Connect your Facebook account to start managing pages, enabling automations, and growing your presence.
                                </p>
                                <button
                                    onClick={handleConnectFacebook}
                                    className="rounded-2xl bg-indigo-600 px-10 py-4 text-lg font-semibold text-white shadow-xl hover:bg-indigo-700 active:scale-[0.98] transition-all"
                                >
                                    Connect Your First Account
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmModal?.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.94, opacity: 0 }}
                            className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl dark:bg-gray-900 dark:border dark:border-gray-800"
                        >
                            <div
                                className={cn(
                                    "mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl",
                                    confirmModal.type.includes("disconnect")
                                        ? "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                                        : "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                                )}
                            >
                                {confirmModal.type.includes("disconnect") ? (
                                    <Trash2 className="h-10 w-10" />
                                ) : (
                                    <Power className="h-10 w-10" />
                                )}
                            </div>

                            <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
                                {confirmModal.type.includes("disconnect")
                                    ? "Disconnect"
                                    : confirmModal.type === "enable"
                                        ? "Enable"
                                        : "Pause"}{" "}
                                Confirmation
                            </h3>

                            <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                                Are you sure you want to{" "}
                                {confirmModal.type.includes("disconnect") ? "permanently disconnect" : confirmModal.type}{" "}
                                <strong className="text-gray-900 dark:text-white">{confirmModal.pageName}</strong>?
                            </p>

                            <div className="flex gap-5">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className="flex-1 rounded-2xl border border-gray-300 py-4 text-lg font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAction}
                                    className={cn(
                                        "flex-1 rounded-2xl py-4 text-lg font-semibold text-white transition-all active:scale-[0.98]",
                                        confirmModal.type.includes("disconnect")
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-indigo-600 hover:bg-indigo-700"
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