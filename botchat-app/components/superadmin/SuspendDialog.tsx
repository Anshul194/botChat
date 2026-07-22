"use client";

import { useState } from "react";
import { Loader2, Ban, Play } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { suspendTenant, resumeTenant } from "@/store/slices/superadminSubscriptionSlice";

export default function SuspendDialog({ open, onClose, userId, userName, isSuspended }: {
    open: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
    isSuspended: boolean;
}) {
    const dispatch = useAppDispatch();
    const { actionLoading } = useAppSelector((s) => s.superadminSubscription);
    const [success, setSuccess] = useState(false);

    const handleAction = async () => {
        const result = isSuspended
            ? await dispatch(resumeTenant(userId))
            : await dispatch(suspendTenant(userId));
        if (result.meta.requestStatus === "fulfilled") {
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: "var(--background-overlay, rgba(0,0,0,0.50))", backdropFilter: "blur(6px)" }}>
            <div className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: isSuspended ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)" }}>
                            {isSuspended ? <Play className="w-5 h-5" style={{ color: "#10b981" }} /> : <Ban className="w-5 h-5" style={{ color: "#ef4444" }} />}
                        </div>
                        <div>
                            <h2 className="text-lg font-black" style={{ color: "var(--foreground)" }}>
                                {isSuspended ? "Resume Subscription" : "Suspend Subscription"}
                            </h2>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-80" style={{ background: "var(--muted)", color: "var(--foreground)" }}>×</button>
                </div>

                {success ? (
                    <div className="py-8 text-center">
                        <p className="text-lg font-bold" style={{ color: "#10b981" }}>
                            {isSuspended ? "Subscription resumed!" : "Subscription suspended."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-xl p-4 text-sm" style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)" }}>
                            {isSuspended
                                ? "This will restore full access for this tenant. They will be able to use all features included in their plan."
                                : "This will immediately block this tenant from accessing all paid features. Their subscription will remain active but suspended."}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 h-11 rounded-xl text-sm font-bold border" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={actionLoading}
                                className="flex-1 h-11 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: isSuspended ? "#10b981" : "#ef4444" }}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {isSuspended ? "Resume" : "Suspend"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
