"use client";

import { useState, useEffect } from "react";
import { Loader2, Crown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPlans } from "@/store/slices/plansSlice";
import { assignTenantPlan } from "@/store/slices/superadminSubscriptionSlice";

export default function ManualPlanDialog({ open, onClose, userId, userName }: {
    open: boolean;
    onClose: () => void;
    userId: number;
    userName: string;
}) {
    const dispatch = useAppDispatch();
    const { plans } = useAppSelector((s) => s.plans);
    const { actionLoading } = useAppSelector((s) => s.superadminSubscription);
    const [planId, setPlanId] = useState<number>(0);
    const [expiry, setExpiry] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(fetchPlans());
        }
    }, [open, dispatch]);

    const handleAssign = async () => {
        if (!planId) return;
        const result = await dispatch(assignTenantPlan({ id: userId, plan_id: planId, plan_expired_date: expiry || undefined }));
        if (result.meta.requestStatus === "fulfilled") {
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-lg rounded-3xl border p-6 shadow-2xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)" }}>
                            <Crown className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black" style={{ color: "var(--foreground)" }}>Assign Plan</h2>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--glass-border)" }}>×</button>
                </div>

                {success ? (
                    <div className="py-8 text-center">
                        <p className="text-lg font-bold" style={{ color: "#10b981" }}>Plan assigned successfully!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Select Plan</label>
                            <select
                                value={planId}
                                onChange={(e) => setPlanId(Number(e.target.value))}
                                className="w-full h-11 px-3 rounded-xl text-sm border outline-none"
                                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                            >
                                <option value={0}>Choose a plan…</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}/{p.duration} {p.duration_type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Custom Expiry (optional)</label>
                            <input
                                type="date"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                                className="w-full h-11 px-3 rounded-xl text-sm border outline-none"
                                style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", color: "var(--foreground)" }}
                            />
                            <p className="text-[10px] mt-1" style={{ color: "var(--muted-foreground)" }}>Leave empty to auto-calculate from plan duration.</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 h-11 rounded-xl text-sm font-bold border" style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={!planId || actionLoading}
                                className="flex-1 h-11 rounded-xl text-sm font-bold text-white disabled:opacity-40 flex items-center justify-center gap-2"
                                style={{ background: "var(--brand-gradient)" }}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                Assign Plan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function formatCurrency(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}
