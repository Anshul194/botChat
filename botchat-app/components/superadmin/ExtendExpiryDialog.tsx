"use client";

import { useState } from "react";
import { Loader2, CalendarPlus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { extendTenantExpiry } from "@/store/slices/superadminSubscriptionSlice";

export default function ExtendExpiryDialog({ open, onClose, userId, userName, currentExpiry }: {
    open: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
    currentExpiry: string | null;
}) {
    const dispatch = useAppDispatch();
    const { actionLoading } = useAppSelector((s) => s.superadminSubscription);
    const [days, setDays] = useState(30);
    const [success, setSuccess] = useState(false);

    const handleExtend = async () => {
        const result = await dispatch(extendTenantExpiry({ id: userId, days }));
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
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(14,165,233,0.12)" }}>
                            <CalendarPlus className="w-5 h-5" style={{ color: "#0ea5e9" }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black" style={{ color: "var(--foreground)" }}>Extend Expiry</h2>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:opacity-80" style={{ background: "var(--muted)", color: "var(--foreground)" }}>×</button>
                </div>

                {success ? (
                    <div className="py-8 text-center">
                        <p className="text-lg font-bold" style={{ color: "#10b981" }}>Expiry extended!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentExpiry && (
                            <div className="rounded-xl p-3 text-sm" style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)" }}>
                                Current expiry: <span className="font-bold" style={{ color: "var(--foreground)" }}>{currentExpiry}</span>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Extend by (days)</label>
                            <div className="flex gap-2">
                                {[7, 15, 30, 60, 90, 365].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDays(d)}
                                        className="px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                                        style={{
                                            background: days === d ? "var(--brand-gradient)" : "var(--glass-bg)",
                                            color: days === d ? "white" : "var(--muted-foreground)",
                                            borderColor: days === d ? "transparent" : "var(--glass-border)",
                                        }}
                                    >
                                        {d}d
                                    </button>
                                ))}
                            </div>
                            <input
                                type="number"
                                value={days}
                                onChange={(e) => setDays(Number(e.target.value))}
                                min={1}
                                max={3650}
                                className="w-full h-11 px-3 mt-2 rounded-xl text-sm border outline-none"
                                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 h-11 rounded-xl text-sm font-bold border" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleExtend}
                                disabled={actionLoading || days < 1}
                                className="flex-1 h-11 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: "var(--brand-gradient)" }}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Extend
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
