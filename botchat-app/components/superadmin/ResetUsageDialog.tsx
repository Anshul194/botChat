"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetTenantUsage } from "@/store/slices/superadminSubscriptionSlice";

export default function ResetUsageDialog({ open, onClose, userId, userName }: {
    open: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
}) {
    const dispatch = useAppDispatch();
    const { actionLoading } = useAppSelector((s) => s.superadminSubscription);
    const [featureKey, setFeatureKey] = useState("");
    const [success, setSuccess] = useState(false);
    const [resetCount, setResetCount] = useState(0);

    const handleReset = async () => {
        const result = await dispatch(resetTenantUsage({ id: userId, feature_key: featureKey || undefined }));
        if (result.meta.requestStatus === "fulfilled") {
            const payload = result.payload as { reset_count?: number };
            setResetCount(payload?.reset_count ?? 0);
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-md rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.12)" }}>
                            <RotateCcw className="w-5 h-5" style={{ color: "#f59e0b" }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black" style={{ color: "var(--foreground)" }}>Reset Usage</h2>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--glass-border)" }}>×</button>
                </div>

                {success ? (
                    <div className="py-8 text-center">
                        <p className="text-lg font-bold" style={{ color: "#10b981" }}>Reset {resetCount} record(s)!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-xl p-4 text-sm" style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)" }}>
                            This will delete all feature usage records for this tenant. They will regain full usage limits.
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Feature Key (optional)</label>
                            <input
                                value={featureKey}
                                onChange={(e) => setFeatureKey(e.target.value)}
                                placeholder="Leave empty to reset all features"
                                className="w-full h-11 px-3 rounded-xl text-sm border outline-none"
                                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 h-11 rounded-xl text-sm font-bold border" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={actionLoading}
                                className="flex-1 h-11 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: "#f59e0b" }}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Reset Usage
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
