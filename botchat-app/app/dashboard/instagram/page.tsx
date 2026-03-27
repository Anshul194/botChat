"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Instagram,
    Facebook,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface InstagramAccount {
    id: number;
    username: string;
    name: string;
    profile_picture_url?: string;
    is_active: boolean;
    followers_count?: number;
    page?: {
        id: number;
        page_id: string;
        page_name: string;
        account?: {
            id: number;
            name: string;
            avatar?: string;
        };
    };
}

export default function InstagramPage() {
    const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isLoading, setIsLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const { showModal } = useModal();
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: "enable" | "disable" | "disconnect" | "disconnectAll" | "clean";
        accountId: string | number;
        username: string;
    } | null>(null);

    const fetchConnectedAccounts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/social/instagram-connect");
            if (response.data.is_success || response.data.success) {
                const fetchedAccounts = response.data.data.instagram_accounts || [];
                setAccounts(fetchedAccounts.map((acc: any) => ({
                    ...acc,
                    is_active: acc.is_active === "1" || acc.is_active === 1 || acc.is_active === true,
                })));
            }
        } catch (err) {
            showModal("error", "Error", "Couldn't load your Instagram accounts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConnectedAccounts();
    }, []);

    const handleInstagramConnect = useCallback(async () => {
        if (isConnecting) return;
        setIsConnecting(true);

        const width = 600;
        const height = 750;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        const popup = window.open(
            "about:blank",
            "instagram-connect",
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
            showModal("error", "Error", "Popup blocked! Please allow popups for this site.");
            setIsConnecting(false);
            return;
        }

        try {
            const response = await api.get("/social/instagram-connect/redirect");
            const redirectUrl = response.data.data?.url || response.data.data?.redirect_url;

            if (redirectUrl) {
                popup.location.href = redirectUrl;

                const pollTimer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(pollTimer);
                        setIsConnecting(false);
                        fetchConnectedAccounts();
                    }
                }, 800);
            } else {
                popup.close();
                setIsConnecting(false);
                showModal("error", "Error", "No redirect URL received from server");
            }
        } catch (err: any) {
            popup?.close();
            setIsConnecting(false);
            showModal("error", "Error", "Failed to start Instagram connection");
        }
    }, [isConnecting, api, showModal, fetchConnectedAccounts]);

    const handleAction = async () => {
        if (!confirmModal) return;
        const { type, accountId } = confirmModal;
        setConfirmModal(null);

        try {
            let response;
            if (type === "enable") {
                response = await api.post(`/social/instagram-connect/account/${accountId}/enable`);
            } else if (type === "disable") {
                response = await api.post(`/social/instagram-connect/account/${accountId}/disable`);
            } else if (type === "clean") {
                response = await api.post(`/social/instagram-connect/account/${accountId}/clean`);
            } else if (type === "disconnect") {
                response = await api.delete(`/social/instagram-connect/account/${accountId}`);
            } else if (type === "disconnectAll") {
                response = await api.post(`/social/instagram-connect/facebook-account/${accountId}/disconnect-all`);
            }

            if (response?.data?.is_success || response?.data?.success) {
                showModal("success", "Success", response.data.message || "Action completed successfully");
                fetchConnectedAccounts();
            }
        } catch (err: any) {
            showModal("error", "Error", err.response?.data?.message || "Action failed");
        }
    };

    const stats = [
        {
            label: "Connected Pages",
            value: accounts.length.toString(),
            icon: Layers,
            color: "text-pink-600",
            bg: "bg-pink-50 dark:bg-pink-500/10"
        },
        {
            label: "Active Automations",
            value: accounts.filter(a => a.is_active).length.toString(),
            icon: Webhook,
            color: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-500/10"
        },
        {
            label: "Total Reach",
            value: accounts.reduce((acc, a) => acc + (a.followers_count || 0), 0).toLocaleString(),
            icon: Users,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-500/10"
        },
    ];

    const groupedAccounts = accounts.reduce((acc, obj) => {
        const fbGroup = obj.page?.account;
        if (!fbGroup) return acc;
        if (!acc[fbGroup.id]) {
            acc[fbGroup.id] = { ...fbGroup, instagrams: [] };
        }
        acc[fbGroup.id].instagrams.push(obj);
        return acc;
    }, {} as Record<number, any>);

    const groupedArray = Object.values(groupedAccounts);

    return (
        <div className="bg-gray-50/50 dark:bg-gray-950 min-h-screen pb-16">
            {/* Header */}
            <header className="border-b bg-white dark:bg-gray-900 dark:border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                        <Instagram className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">Instagram Integration</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("flex h-2 w-2 rounded-full", isLoading ? "bg-amber-500" : "bg-emerald-500")} />
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {isLoading ? "Synchronizing..." : "System Active"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchConnectedAccounts}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 text-gray-600 dark:text-gray-300"
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-pink-500")} />
                    </button>
                    <button
                        onClick={handleInstagramConnect}
                        disabled={isConnecting}
                        className="h-10 px-5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                    >
                        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}
                        {isConnecting ? "Authorizing..." : "Connect Profile"}
                    </button>
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

                {/* Profiles Header */}
                <div className="flex items-center justify-between border-b pb-4 dark:border-neutral-800">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Connected Profiles</h2>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">Manage your connected Instagram business accounts</p>
                    </div>
                </div>

                {/* Profiles List */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse h-48 rounded-2xl bg-white dark:bg-neutral-900 border dark:border-neutral-800" />
                        ))}
                    </div>
                ) : groupedArray.length > 0 ? (
                    <div className="space-y-8">
                        {groupedArray.map(group => (
                            <div key={group.id} className="space-y-6">
                                <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-5 rounded-2xl border dark:border-neutral-800 shadow-sm block">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border dark:border-neutral-700 bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold">
                                                {group.avatar ? <img src={group.avatar} className="w-full h-full object-cover" /> : group.name[0]}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white dark:border-neutral-900">
                                                <Facebook className="w-2.5 h-2.5 text-white fill-current" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{group.name}</h3>
                                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-xs font-medium">Verified</span>
                                            </div>
                                            <p className="text-sm text-neutral-500">Facebook Authenticator · {group.instagrams.length} Profiles</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setConfirmModal({ show: true, type: "disconnectAll", accountId: group.id, username: group.name })}
                                        className="p-2.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                        title="Disconnect Master Account"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pl-4 md:pl-8 border-l-2 ml-4 dark:border-neutral-800 pb-4">
                                    {group.instagrams.map((acc: any) => (
                                <div
                                    key={acc.id}
                                    className="group relative rounded-2xl border bg-white dark:bg-neutral-900 p-5 shadow-sm dark:border-neutral-800 transition duration-200 hover:shadow-md"
                                >
                                    <div className="flex items-start gap-4 mb-5">
                                        <div className="relative shrink-0">
                                            <div className="h-14 w-14 overflow-hidden rounded-xl border dark:border-neutral-700 bg-gray-100 flex items-center justify-center p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                                                <div className="h-full w-full bg-white dark:bg-neutral-900 rounded-[10px] overflow-hidden flex items-center justify-center">
                                                    {acc.profile_picture_url ? (
                                                        <img
                                                            src={acc.profile_picture_url}
                                                            alt={acc.username}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xl font-bold text-pink-500">{acc.username[0]}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1 flex-1 min-w-0 pr-6">
                                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white truncate">
                                                {acc.name || acc.username}
                                            </h3>
                                            <p className="text-xs text-neutral-500 font-medium">
                                                @{acc.username}
                                            </p>
                                            {acc.page && (
                                                <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1">
                                                    <Facebook className="w-3 h-3 text-blue-500" />
                                                    via {acc.page.page_name}
                                                </div>
                                            )}
                                        </div>

                                        {acc.is_active && (
                                            <div className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-900/30" title="Active Automation" />
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={() =>
                                                setConfirmModal({
                                                    show: true,
                                                    type: acc.is_active ? "disable" : "enable",
                                                    accountId: acc.id,
                                                    username: acc.username,
                                                })
                                            }
                                            className={cn(
                                                "flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-sm font-medium transition-colors",
                                                acc.is_active
                                                    ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:hover:bg-amber-500/20"
                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20"
                                            )}
                                        >
                                            {acc.is_active ? "Disable automations" : "Enable modules"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                setConfirmModal({
                                                    show: true,
                                                    type: "clean",
                                                    accountId: acc.id,
                                                    username: acc.username,
                                                })
                                            }
                                            title="Clean Data"
                                            className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:text-pink-600 hover:bg-pink-50 dark:bg-gray-800 dark:hover:bg-pink-900/40 transition-colors"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </button>

                                        <button
                                            onClick={() =>
                                                setConfirmModal({
                                                    show: true,
                                                    type: "disconnect",
                                                    accountId: acc.id,
                                                    username: acc.username,
                                                })
                                            }
                                            title="Disconnect Account"
                                            className="p-2 rounded-xl bg-gray-50 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:bg-gray-800 dark:hover:bg-rose-900/40 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            }
        </div>
    ) : (
                    <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900 p-12 text-center max-w-2xl mx-auto mt-12">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mx-auto mb-6 flex items-center justify-center">
                            <Instagram className="h-8 w-8 text-pink-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No Instagram Profiles Found</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto text-sm">Connect your Instagram business account to unlock DM automations, comment auto-replies, and scheduled content.</p>
                        <button
                            onClick={handleInstagramConnect}
                            className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 text-sm font-medium text-white shadow-sm hover:opacity-90 transition duration-200 active:scale-95"
                        >
                            Connect Profile
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
                                Confirm {confirmModal.type === "disconnectAll" ? "Master Disconnect" : confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1).replace("-", " ")}
                            </h3>
                            
                            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
                                Are you sure you want to {confirmModal.type === "disconnectAll" ? "disconnect the master Facebook account and all linked Instagram pages" : `${confirmModal.type.replace("-", " ")}`} <strong className="font-medium text-gray-900 dark:text-white">{confirmModal.username}</strong>? This action will modify your automation state.
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
                                        confirmModal.type === "clean" ? "bg-pink-600 hover:bg-pink-700" : "bg-pink-600 hover:bg-pink-700"
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
