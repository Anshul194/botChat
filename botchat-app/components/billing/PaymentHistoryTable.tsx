"use client";

import { useEffect } from "react";
import { Receipt, Download, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPaymentHistory, PaymentRecord } from "@/store/slices/paymentSlice";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
    success: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
    refunded: { bg: "rgba(99,102,241,0.1)", color: "#6366f1" },
};

export default function PaymentHistoryTable() {
    const dispatch = useAppDispatch();
    const { history, loading } = useAppSelector((s) => s.payment);

    useEffect(() => {
        dispatch(fetchPaymentHistory());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--muted-foreground)" }} />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed rounded-2xl" style={{ borderColor: "var(--glass-border)" }}>
                <Receipt className="mx-auto h-8 w-8 mb-3" style={{ color: "var(--muted-foreground)" }} />
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>No payment history yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {history.map((item: PaymentRecord, i: number) => {
                const style = STATUS_STYLE[item.status] ?? { bg: "var(--glass-bg)", color: "var(--muted-foreground)" };
                return (
                    <div key={item.id ?? i}
                        className="group flex items-center gap-4 p-4 rounded-xl border transition-colors"
                        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
                    >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: style.bg }}>
                            <Receipt className="w-4 h-4" style={{ color: style.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                {item.plan_name ? `${item.plan_name} Plan` : item.payment_id || `Payment #${item.id}`}
                            </p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : ""}
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: style.bg, color: style.color }}>
                            {item.status}
                        </span>
                        <span className="text-sm font-black tabular-nums w-20 text-right" style={{ color: "var(--foreground)" }}>
                            {formatPrice(item.amount)}
                        </span>
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center border opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}>
                            <Download className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function formatPrice(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}
