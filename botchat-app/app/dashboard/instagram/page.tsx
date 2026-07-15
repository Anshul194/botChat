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
    Eraser,
    BrainCircuit,
    ArrowLeft,
    Bot,
    ChevronLeft,
    Settings,
    Plus,
    Info,
    ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { AiAgentSettingsPanel } from "./AiAgentSettingsPanel";

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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedAccountForSettings, setSelectedAccountForSettings] = useState<{ id: number | string; name: string } | null>(null);
    const { showModal, showConfirm } = useModal();
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        type: "enable" | "disable" | "disconnect" | "disconnect-account" | "clean";
        pageId: string | number;
        pageName: string;
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

        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data?.type === 'SOCIAL_CONNECTION_SUCCESS') {
                window.removeEventListener('message', handleMessage);
                setIsConnecting(false);
                fetchConnectedAccounts();
            } else if (event.data?.type === 'oauth-error') {
                window.removeEventListener('message', handleMessage);
                setIsConnecting(false);
                showModal("error", "Connection Failed", event.data.error || 'Failed to connect Instagram account.');
            }
        };
        window.addEventListener('message', handleMessage);

        try {
            const response = await api.get("/social/instagram-connect/redirect");
            const redirectUrl = response.data.data?.url || response.data.data?.redirect_url;

            if (redirectUrl) {
                popup.location.href = redirectUrl;

                const pollTimer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(pollTimer);
                        window.removeEventListener('message', handleMessage);
                        setIsConnecting(false);
                        fetchConnectedAccounts();
                    }
                }, 800);
            } else {
                popup.close();
                window.removeEventListener('message', handleMessage);
                setIsConnecting(false);
                showModal("error", "Error", "No redirect URL received from server");
            }
        } catch (err: any) {
            window.removeEventListener('message', handleMessage);
            popup?.close();
            setIsConnecting(false);
            showModal("error", "Error", "Failed to start Instagram connection");
        }
    }, [isConnecting, api, showModal, fetchConnectedAccounts]);

    const handleAction = async (type: string, accountId: string | number) => {
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

    const handleConfirmAction = async () => {
        if (!confirmModal) return;
        const { type, pageId } = confirmModal;
        setConfirmModal(null);
        await handleAction(type, pageId);
    };

    const stats = [
        {
            label: "Connected Pages",
            value: accounts.length.toString(),
            icon: Layers,
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            label: "Active Automations",
            value: accounts.filter(a => a.is_active).length.toString(),
            icon: Webhook,
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            label: "Total Reach",
            value: accounts.reduce((acc, a) => acc + (a.followers_count || 0), 0).toLocaleString(),
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10"
        },
    ];

    const groupedAccounts = accounts.reduce((acc, obj) => {
        const fbGroup = obj.page?.account || { id: 'unknown', name: 'Unknown Account', avatar: null };
        if (!acc[fbGroup.id]) {
            acc[fbGroup.id] = { ...fbGroup, instagrams: [] };
        }
        acc[fbGroup.id].instagrams.push(obj);
        return acc;
    }, {} as Record<string | number, any>);

    const groupedArray = Object.values(groupedAccounts);

    return (
        <div className="bg-gray-50/50 dark:bg-gray-950 min-h-screen pb-16">
            {/* Header */}
            <header data-tour="page-heading" className="border-b bg-white dark:bg-gray-900 dark:border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-30">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* Back arrow — mobile only */}
                    {selectedAccountForSettings ? (
                        <button
                            onClick={() => {
                                setSelectedAccountForSettings(null);
                                setIsSettingsOpen(false);
                            }}
                            className="sm:hidden -ml-1 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => window.history.back()}
                            className="sm:hidden -ml-1 p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    {/* IG icon — desktop only */}
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center text-primary shadow-sm border border-primary/20 flex-shrink-0">
                        <Instagram className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-[15px] sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight truncate">Instagram Integration</h1>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                            <span className={cn("flex h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full flex-shrink-0", isLoading ? "bg-amber-500" : "bg-emerald-500")} />
                            <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                                {isLoading ? "Synchronizing..." : "System Active"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {selectedAccountForSettings && (
                        <button
                            onClick={() => {
                                setSelectedAccountForSettings(null);
                                setIsSettingsOpen(false);
                            }}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all border dark:border-neutral-700"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchConnectedAccounts}
                        disabled={isLoading}
                        className="rounded-xl"
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-primary")} />
                    </Button>
                    {/* Settings — mobile only */}
                    <button className="sm:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                    {/* Connect button — desktop only */}
                    <Button
                        onClick={handleInstagramConnect}
                        disabled={isConnecting}
                        className="hidden sm:flex h-10 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-95 transition-all items-center gap-2 shadow-sm"
                    >
                        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Instagram className="w-4 h-4" />}
                        {isConnecting ? "Authorizing..." : "Connect Account"}
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-8">

                {/* Full-width CTA — mobile only */}
                <button
                    onClick={handleInstagramConnect}
                    disabled={isConnecting}
                    className="sm:hidden w-full h-12 rounded-2xl bg-primary text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
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

                {/* Profiles Header */}
                <div className="flex items-center justify-between border-b pb-4 dark:border-neutral-800">
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Connected Profiles</h2>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">Manage your connected Instagram business accounts</p>
                    </div>
                </div>

                {/* Profiles List */}
                {isSettingsOpen && selectedAccountForSettings ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Agent Configuration</h2>
                                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest opacity-60">Neural Engine Context: @{selectedAccountForSettings.name}</p>
                            </div>
                        </div>

                        <AiAgentSettingsPanel
                            platform="instagram"
                            accountId={selectedAccountForSettings.id}
                            accountName={selectedAccountForSettings.name}
                        />
                    </div>
                ) : isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse h-48 rounded-2xl bg-white dark:bg-neutral-900 border dark:border-neutral-800" />
                        ))}
                    </div>
                ) : groupedArray.length > 0 ? (
                    <div className="space-y-8">
                        {groupedArray.map(group => (
                            <div key={group.id} className="space-y-3 sm:space-y-6">
                                {/* Account row: compact card on mobile, side-by-side on desktop */}
                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border dark:border-neutral-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border dark:border-neutral-700 bg-gray-100 flex items-center justify-center text-gray-500 text-lg font-bold flex-shrink-0">
                                            {group.avatar ? <img src={group.avatar} className="w-full h-full object-cover" /> : group.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-[14px] sm:text-lg font-semibold text-neutral-900 dark:text-white truncate">{group.name}</h3>
                                                {group.id !== 'unknown' && <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] sm:text-xs font-medium flex-shrink-0">Verified</span>}
                                            </div>
                                            <p className="text-[12px] sm:text-sm text-neutral-500">Facebook Authenticator · {group.instagrams.length} Profiles</p>
                                        </div>
                                        {/* Desktop: inline Disconnect button */}
                                        {group.id !== 'unknown' && (
                                            <Button
                                                variant="ghost"
                                                onClick={() => setConfirmModal({ show: true, type: "disconnect-account", pageId: group.id, pageName: group.name })}
                                                className={cn(
                                                    "hidden sm:flex h-10 px-4 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-medium items-center gap-2 border border-rose-100 dark:border-rose-900/50",
                                                    group.instagrams.some((p: any) => p.is_active) && "opacity-50 cursor-not-allowed pointer-events-none grayscale"
                                                )}
                                                disabled={group.instagrams.some((p: any) => p.is_active)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Account
                                            </Button>
                                        )}
                                    </div>
                                    {/* Mobile: full-width disconnect at bottom */}
                                    {group.id !== 'unknown' && (
                                        <div className="sm:hidden border-t dark:border-neutral-800">
                                            <button
                                                onClick={() => setConfirmModal({ show: true, type: "disconnect-account", pageId: group.id, pageName: group.name })}
                                                disabled={group.instagrams.some((p: any) => p.is_active)}
                                                className={cn(
                                                    "w-full py-3 flex items-center justify-center gap-2 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors",
                                                    group.instagrams.some((p: any) => p.is_active) && "opacity-40 pointer-events-none"
                                                )}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Disconnect Account
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {group.instagrams.some((p: any) => p.is_active) && group.id !== 'unknown' && (
                                    <div className="mx-2 sm:mx-4 px-3.5 sm:px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 flex items-start gap-2.5 sm:gap-3 text-amber-800 dark:text-amber-400 text-[12px] sm:text-sm">
                                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>You must disable all automations before you can disconnect this Facebook account.</p>
                                    </div>
                                )}

                                {/* Profile cards grid */}
                                <div className="grid gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 pl-3 sm:pl-8 border-l-2 ml-2 sm:ml-4 dark:border-neutral-800 pb-4">
                                    {group.instagrams.map((acc: any) => {
                                        const isActive = acc.is_active === "1" || acc.is_active === 1 || acc.is_active === true;
                                        return (
                                            <div
                                                key={acc.id}
                                                className="group relative rounded-2xl border bg-white dark:bg-neutral-900 p-5 shadow-sm dark:border-neutral-800 transition duration-200 hover:shadow-md"
                                            >
                                                <div className="flex items-start gap-4 mb-5">
                                                    <div className="relative shrink-0">
                                                        <div className="h-14 w-14 overflow-hidden rounded-xl border dark:border-neutral-700 bg-gray-100 flex items-center justify-center">
                                                            {acc.profile_picture_url ? (
                                                                <img
                                                                    src={acc.profile_picture_url}
                                                                    alt={acc.username}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-xl font-bold text-gray-500">{acc.username[0]}</span>
                                                            )}
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

                                                    {isActive && (
                                                        <div className="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm ring-4 ring-emerald-50 dark:ring-emerald-900/30" title="Active Automation" />
                                                    )}
                                                </div>

                                                {/* Desktop: wrapped buttons */}
                                                <div className="hidden sm:flex flex-wrap items-center gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            setConfirmModal({
                                                                show: true,
                                                                type: isActive ? "disable" : "enable",
                                                                pageId: acc.id,
                                                                pageName: acc.username,
                                                            })
                                                        }
                                                        className={cn(
                                                            "flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-sm font-medium transition-colors",
                                                            isActive
                                                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-500 dark:hover:bg-amber-500/20"
                                                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20"
                                                        )}
                                                    >
                                                        {isActive ? "Disable Page" : "Enable Page"}
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" asChild title="View on Instagram" className="rounded-xl bg-gray-50 text-gray-500 hover:text-primary hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 transition-colors">
                                                        <a href={`https://instagram.com/${acc.username}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => setConfirmModal({ show: true, type: "clean", pageId: acc.id, pageName: acc.username })} title="Clean Data" className="rounded-xl bg-gray-50 text-gray-500 hover:text-primary hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-primary/20 transition-colors">
                                                        <Eraser className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => setConfirmModal({ show: true, type: "disconnect", pageId: acc.id, pageName: acc.username })} title="Disconnect Account" className="rounded-xl bg-gray-50 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {/* Mobile action bar: divider-separated icon row */}
                                                <div className="sm:hidden -mx-4 -mb-4 mt-3 border-t dark:border-neutral-800 flex items-center">
                                                    <button
                                                        onClick={() => setConfirmModal({ show: true, type: isActive ? "disable" : "enable", pageId: acc.id, pageName: acc.username })}
                                                        className={cn(
                                                            "flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-colors border-r dark:border-neutral-800",
                                                            isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                                                        )}
                                                    >
                                                        {isActive ? <Pause className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                                                        {isActive ? "Pause Bot" : "Find Out"}
                                                    </button>
                                                    <a href={`https://instagram.com/${acc.username}`} target="_blank" rel="noopener noreferrer" className="w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-primary transition-colors border-r dark:border-neutral-800">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button onClick={() => setConfirmModal({ show: true, type: "clean", pageId: acc.id, pageName: acc.username })} className="w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-primary transition-colors border-r dark:border-neutral-800">
                                                        <Eraser className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setConfirmModal({ show: true, type: "disconnect", pageId: acc.id, pageName: acc.username })} className="w-11 py-2.5 flex items-center justify-center text-gray-400 hover:text-rose-600 transition-colors">
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
                            <Instagram className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No Instagram Profiles Found</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md mx-auto text-sm">Connect your Instagram business account to unlock DM automations, comment auto-replies, and scheduled content.</p>
                        <button
                            onClick={handleInstagramConnect}
                            className="rounded-xl bg-primary px-8 py-3 text-sm font-medium text-white shadow-sm shadow-primary/20 hover:opacity-90 transition duration-200 active:scale-95"
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
                                    onClick={handleConfirmAction}
                                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all active:scale-95 hover:opacity-90"
                                    style={{
                                        background: confirmModal.type.includes("disconnect")
                                            ? "rgb(225 29 72)"
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
