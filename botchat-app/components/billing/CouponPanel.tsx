"use client";

import { useState } from "react";
import { Percent, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { applyCoupon } from "@/store/slices/paymentSlice";

export default function CouponPanel({ onApplied, planPrice }: {
    onApplied: (data: { code: string; discount: number; finalAmount: number }) => void;
    planPrice: number;
}) {
    const dispatch = useAppDispatch();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ discount: number; finalAmount: number } | null>(null);
    const [error, setError] = useState("");
    const [appliedCode, setAppliedCode] = useState("");

    const handleApply = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setError("");

        try {
            const data = await dispatch(applyCoupon(code.trim())).unwrap();
            const discount = data?.discount ?? data?.discount_amount ?? 0;
            const finalAmount = data?.final_amount ?? data?.finalAmount ?? planPrice;
            const resultData = { discount, finalAmount };
            setResult(resultData);
            setAppliedCode(code.trim());
            onApplied({ code: code.trim(), ...resultData });
        } catch (err: unknown) {
            setError(typeof err === "string" ? err : "Invalid coupon code");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border p-5" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--foreground)" }}>Have a coupon?</h3>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input
                        value={code}
                        onChange={(e) => { setCode(e.target.value); setResult(null); setError(""); }}
                        placeholder="Enter coupon code"
                        className="w-full h-11 pl-9 pr-3 rounded-xl text-sm border outline-none transition-all"
                        style={{ background: "var(--glass-bg)", borderColor: error ? "var(--destructive)" : "var(--glass-border)", color: "var(--foreground)" }}
                        disabled={!!result}
                    />
                </div>
                {result ? (
                    <button
                        onClick={() => { setCode(""); setResult(null); setAppliedCode(""); setError(""); }}
                        className="h-11 px-4 rounded-xl text-sm font-bold border"
                        style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}
                    >
                        Remove
                    </button>
                ) : (
                    <button
                        onClick={handleApply}
                        disabled={loading || !code.trim()}
                        className="h-11 px-5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                        style={{ background: "var(--brand-gradient)" }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </button>
                )}
            </div>

            {result && (
                <div className="mt-3 space-y-1.5 rounded-xl border p-3" style={{ borderColor: "var(--glass-border)" }}>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 font-medium" style={{ color: "var(--foreground)" }}>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {appliedCode}
                        </span>
                        <span className="font-bold text-emerald-500">-{formatPrice(result.discount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t pt-1.5" style={{ borderColor: "var(--glass-border)" }}>
                        <span className="font-bold" style={{ color: "var(--foreground)" }}>Final amount</span>
                        <span className="font-black" style={{ color: "var(--foreground)" }}>{formatPrice(result.finalAmount)}</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "var(--destructive, #ef4444)" }}>
                    <XCircle className="w-3.5 h-3.5" /> {error}
                </div>
            )}
        </div>
    );
}

function formatPrice(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}
