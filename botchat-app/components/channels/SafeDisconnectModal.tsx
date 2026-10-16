"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    ShieldAlert,
    Trash2,
    Layers,
    Calendar,
    Radio,
    Clock,
    RefreshCw,
    Info,
    ChevronDown,
    ChevronUp,
    FileText,
    MessageSquare,
    Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export interface DisconnectTarget {
    id: number | string;
    name: string;
    type: "account" | "page" | "instagram" | "facebook-account-ig";
    platform: "facebook" | "instagram";
    extraId?: string;
}

export interface ImpactCampaign {
    id: number | string;
    name: string;
    type: string;
    type_label: string;
    status: string;
    schedule_time?: string | null;
    channel?: string;
}

export interface ImpactData {
    platform: string;
    account_name: string;
    account_identifier: string;
    pages_count: number;
    instagram_count: number;
    counts: {
        total_impacted: number;
        active_campaigns: number;
        scheduled_campaigns: number;
        pending_recipients: number;
        queued_jobs_estimate: number;
    };
    queue_limitation_notice?: string;
    campaigns: ImpactCampaign[];
    actions_summary: {
        will_stop: string[];
        will_cancel: string[];
        will_retain: string[];
        will_disconnect: string[];
    };
}

interface SafeDisconnectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    target: DisconnectTarget | null;
    onSuccess: () => Promise<void> | void;
}

export function SafeDisconnectModal({
    open,
    onOpenChange,
    target,
    onSuccess,
}: SafeDisconnectModalProps) {
    const [isLoadingImpact, setIsLoadingImpact] = useState(false);
    const [impactData, setImpactData] = useState<ImpactData | null>(null);
    const [impactError, setImpactError] = useState<string | null>(null);

    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [disconnectStep, setDisconnectStep] = useState<
        "idle" | "stopping" | "disconnecting" | "completed" | "failed"
    >("idle");
    const [actionError, setActionError] = useState<string | null>(null);
    const [showCampaignsList, setShowCampaignsList] = useState(true);

    const fetchImpact = useCallback(async () => {
        if (!target) return;
        setIsLoadingImpact(true);
        setImpactError(null);
        setActionError(null);
        setDisconnectStep("idle");

        try {
            let endpoint = "";
            if (target.platform === "facebook") {
                if (target.type === "account") {
                    endpoint = `/social/facebook-connect/account/${target.id}/disconnect-impact`;
                } else {
                    endpoint = `/social/facebook-connect/page/${target.id}/disconnect-impact`;
                }
            } else {
                if (target.type === "facebook-account-ig") {
                    endpoint = `/social/instagram-connect/facebook-account/${target.id}/disconnect-impact`;
                } else {
                    endpoint = `/social/instagram-connect/account/${target.id}/disconnect-impact`;
                }
            }

            const res = await api.get(endpoint);
            if (res.data?.is_success && res.data?.data) {
                setImpactData(res.data.data);
            } else {
                setImpactError(res.data?.message || "Failed to calculate campaign impact.");
            }
        } catch (err: any) {
            console.error("Impact fetch error:", err);
            setImpactError(
                err.response?.data?.message ||
                "Failed to communicate with server to verify active campaigns."
            );
        } finally {
            setIsLoadingImpact(false);
        }
    }, [target]);

    useEffect(() => {
        if (open && target) {
            fetchImpact();
        } else {
            setImpactData(null);
            setImpactError(null);
            setActionError(null);
            setIsDisconnecting(false);
            setDisconnectStep("idle");
        }
    }, [open, target, fetchImpact]);

    const handleExecuteDisconnect = async () => {
        if (!target || isDisconnecting) return;
        setIsDisconnecting(true);
        setActionError(null);
        setDisconnectStep("stopping");

        try {
            let endpoint = "";
            let method: "post" | "delete" = "post";

            if (target.platform === "facebook") {
                if (target.type === "account") {
                    endpoint = `/social/facebook-connect/account/${target.id}/disconnect`;
                } else {
                    endpoint = `/social/facebook-connect/page/${target.id}/disconnect`;
                }
            } else {
                if (target.type === "facebook-account-ig") {
                    endpoint = `/social/instagram-connect/facebook-account/${target.id}/disconnect-all`;
                } else {
                    endpoint = `/social/instagram-connect/account/${target.id}/disconnect`;
                }
            }

            // Stage 1: Stopping campaigns & invalidating work
            setDisconnectStep("stopping");

            // Execute backend safe stop & disconnect
            const response = await (method === "post"
                ? api.post(endpoint, { stop_campaigns: true })
                : api.delete(endpoint));

            if (response.data?.is_success) {
                setDisconnectStep("completed");
                setTimeout(async () => {
                    await onSuccess();
                    onOpenChange(false);
                }, 800);
            } else {
                setDisconnectStep("failed");
                setActionError(response.data?.message || "Disconnection failed on server.");
            }
        } catch (err: any) {
            console.error("Disconnect error:", err);
            setDisconnectStep("failed");
            setActionError(
                err.response?.data?.message ||
                err.message ||
                "An unexpected error occurred while disconnecting the account."
            );
        } finally {
            setIsDisconnecting(false);
        }
    };

    if (!target) return null;

    const totalActive = impactData?.counts?.total_impacted ?? 0;
    const activeCampaigns = impactData?.counts?.active_campaigns ?? 0;
    const scheduledCampaigns = impactData?.counts?.scheduled_campaigns ?? 0;
    const pendingRecipients = impactData?.counts?.pending_recipients ?? 0;

    return (
        <Dialog open={open} onOpenChange={(o) => {
            if (!isDisconnecting) {
                onOpenChange(o);
            }
        }}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl p-6 !z-[99999] border dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                                Disconnect {target.platform === "facebook" ? "Facebook" : "Instagram"}{" "}
                                {target.type === "page" ? "Page" : "Account"}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
                                Safe shutdown verification and campaign impact review
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Account details badge */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 my-1">
                    <div className="min-w-0">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                            Target Connection
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                            {target.name}
                        </h4>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize font-semibold border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30">
                        {target.platform} {target.type}
                    </Badge>
                </div>

                {/* Loading State */}
                {isLoadingImpact && (
                    <div className="py-10 flex flex-col items-center justify-center gap-3 text-neutral-500">
                        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
                        <p className="text-sm font-medium">Checking active campaigns & queue tasks...</p>
                        <p className="text-xs text-neutral-400">Querying authoritative tenant and channel states</p>
                    </div>
                )}

                {/* Impact Error */}
                {!isLoadingImpact && impactError && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>Unable to retrieve campaign impact</span>
                        </div>
                        <p className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed">
                            {impactError}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchImpact}
                            className="mt-2 text-xs border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Retry Check
                        </Button>
                    </div>
                )}

                {/* Impact Loaded View */}
                {!isLoadingImpact && impactData && (
                    <div className="space-y-4 my-2">
                        {/* Metrics Cards */}
                        <div className="grid grid-cols-3 gap-2.5">
                            <div className={cn(
                                "p-3 rounded-2xl border text-center transition-all",
                                activeCampaigns > 0
                                    ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50"
                                    : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800"
                            )}>
                                <span className="block text-xl font-extrabold text-neutral-900 dark:text-white">
                                    {activeCampaigns}
                                </span>
                                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                    Active Campaigns
                                </span>
                            </div>

                            <div className={cn(
                                "p-3 rounded-2xl border text-center transition-all",
                                scheduledCampaigns > 0
                                    ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50"
                                    : "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800"
                            )}>
                                <span className="block text-xl font-extrabold text-neutral-900 dark:text-white">
                                    {scheduledCampaigns}
                                </span>
                                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                    Scheduled Posts
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl border bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 text-center">
                                <span className="block text-xl font-extrabold text-neutral-900 dark:text-white">
                                    {pendingRecipients}
                                </span>
                                <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                    Pending Recipients
                                </span>
                            </div>
                        </div>

                        {/* Impact Alert or Zero Active State */}
                        {totalActive > 0 ? (
                            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
                                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                    <span className="font-semibold block mb-0.5">Active automations running</span>
                                    Disconnecting will stop {totalActive} running and scheduled automation(s). All in-flight queued deliveries will be safely halted.
                                </div>
                            </div>
                        ) : (
                            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-300 text-xs leading-relaxed flex items-start gap-2.5">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                                <div>
                                    <span className="font-semibold block mb-0.5">No active campaigns running</span>
                                    Safe to disconnect immediately. Webhook subscriptions and credentials will be removed.
                                </div>
                            </div>
                        )}

                        {/* Expandable Campaign Items List */}
                        {impactData.campaigns.length > 0 && (
                            <div className="border dark:border-neutral-800 rounded-2xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowCampaignsList(!showCampaignsList)}
                                    className="w-full px-3.5 py-2.5 bg-neutral-100/70 dark:bg-neutral-800/70 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                                >
                                    <span>Affected Campaigns & Flows ({impactData.campaigns.length})</span>
                                    {showCampaignsList ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                {showCampaignsList && (
                                    <div className="max-h-44 overflow-y-auto divide-y dark:divide-neutral-800 p-1 bg-white dark:bg-neutral-900/50">
                                        {impactData.campaigns.map((camp, idx) => (
                                            <div
                                                key={`${camp.type}-${camp.id}-${idx}`}
                                                className="px-3 py-2 flex items-center justify-between text-xs gap-2"
                                            >
                                                <div className="min-w-0">
                                                    <p className="font-medium text-neutral-900 dark:text-white truncate">
                                                        {camp.name}
                                                    </p>
                                                    <span className="text-[10px] text-neutral-400">
                                                        {camp.type_label}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className="capitalize text-[10px] shrink-0 font-medium px-2 py-0.5"
                                                >
                                                    {camp.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* What happens to data */}
                        <div className="space-y-2 text-xs">
                            <h5 className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-neutral-500" />
                                What happens upon confirmation:
                            </h5>
                            <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border dark:border-neutral-800/80 space-y-1">
                                    <span className="font-semibold text-rose-600 dark:text-rose-400 block">
                                        Stopped & Cancelled
                                    </span>
                                    <p className="text-neutral-500 dark:text-neutral-400 leading-normal">
                                        Active broadcasts, scheduled posts, auto-comments, and bot reply triggers will halt immediately.
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border dark:border-neutral-800/80 space-y-1">
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">
                                        Retained & Preserved
                                    </span>
                                    <p className="text-neutral-500 dark:text-neutral-400 leading-normal">
                                        Historical analytics, message conversations, and campaign statistics are safely kept.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Error during Disconnect */}
                        {actionError && (
                            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1">
                                <p className="font-semibold flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4 shrink-0 text-rose-600" /> Disconnection Incomplete
                                </p>
                                <p className="leading-relaxed">{actionError}</p>
                                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
                                    Automations remain disabled to protect your account. You can safely retry.
                                </p>
                            </div>
                        )}

                        {/* In-progress state */}
                        {isDisconnecting && (
                            <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                                <span>Stopping all campaigns and removing credentials...</span>
                            </div>
                        )}

                        {disconnectStep === "completed" && (
                            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Account disconnected successfully. Refreshing integrations...</span>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isDisconnecting}
                        onClick={() => onOpenChange(false)}
                        className="rounded-xl text-neutral-600 dark:text-neutral-400"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isLoadingImpact || isDisconnecting || Boolean(impactError)}
                        onClick={handleExecuteDisconnect}
                        className="rounded-xl font-semibold gap-2 shadow-sm bg-rose-600 hover:bg-rose-700 text-white"
                    >
                        {isDisconnecting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Stopping & Disconnecting...
                            </>
                        ) : actionError ? (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Retry Disconnect
                            </>
                        ) : totalActive > 0 ? (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Stop All Active Campaigns & Disconnect
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Confirm Disconnect
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
