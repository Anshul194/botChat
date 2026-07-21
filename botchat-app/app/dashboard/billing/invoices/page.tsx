"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { ArrowLeft, Download, Printer, Receipt, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPaymentHistory, PaymentRecord } from "@/store/slices/paymentSlice";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

export default function InvoicesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { history, loading } = useAppSelector((s) => s.payment);
    const printRef = useRef<HTMLDivElement>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<PaymentRecord | null>(null);

    useEffect(() => {
        dispatch(fetchPaymentHistory());
    }, [dispatch]);

    const handlePrint = () => {
        const printContent = document.getElementById("invoice-print-area");
        if (!printContent) return;
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`
            <html><head><title>Invoice</title>
            <style>
                body { font-family: var(--app-font-family, 'Inter', sans-serif); padding: 40px; color: #1e293b; }
                .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
                .invoice-title { font-size: 32px; font-weight: 900; letter-spacing: -1px; }
                .details { margin-bottom: 30px; }
                .details p { margin: 4px 0; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { text-align: left; padding: 10px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; background: #f1f5f9; }
                td { padding: 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
                .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: 900; }
                .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; }
            </style></head><body>${printContent.innerHTML}</body></html>
        `);
        win.document.close();
        win.print();
    };

    if (selectedInvoice) {
        return (
            <motion.div initial="hidden" animate="show" className="max-w-[800px] mx-auto px-3 sm:px-6 lg:p-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    <button onClick={() => setSelectedInvoice(null)} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold self-start"
                        style={{ color: "var(--nav-active-color)" }}>
                        <ArrowLeft className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Back
                    </button>
                    <div className="flex gap-2">
                        <button onClick={handlePrint}
                            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border"
                            style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                            <Printer className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> <span className="hidden sm:inline">Print</span>
                        </button>
                        <button
                            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border"
                            style={{ borderColor: "var(--glass-border)", color: "var(--muted-foreground)" }}>
                            <Download className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>

                <div ref={printRef} id="invoice-print-area" className="rounded-2xl border p-5 sm:p-8 md:p-12"
                    style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <div className="flex justify-between items-start mb-6 sm:mb-10">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>INVOICE</h1>
                            <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: "var(--muted-foreground)" }}>#{selectedInvoice.payment_id || `INV-${selectedInvoice.id}`}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-base sm:text-lg font-black" style={{ color: "var(--foreground)" }}>BotChat</p>
                            <p className="text-[10px] sm:text-xs" style={{ color: "var(--muted-foreground)" }}>botchat.app</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-10">
                        <div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-2" style={{ color: "var(--muted-foreground)" }}>Billed To</p>
                            <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>Customer</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1 sm:mb-2" style={{ color: "var(--muted-foreground)" }}>Invoice Date</p>
                            <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                {selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                            </p>
                        </div>
                    </div>

                    <table className="w-full" style={{ borderColor: "var(--glass-border)" }}>
                        <thead>
                            <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                                <th className="text-left py-2 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Description</th>
                                <th className="text-right py-2 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b" style={{ borderColor: "var(--glass-border)" }}>
                                <td className="py-3 sm:py-4 text-xs sm:text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                    {selectedInvoice.plan_name || "Subscription"} Plan
                                </td>
                                <td className="py-3 sm:py-4 text-xs sm:text-sm font-black text-right tabular-nums" style={{ color: "var(--foreground)" }}>
                                    {formatPrice(selectedInvoice.amount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="text-right mt-4 sm:mt-5">
                        <p className="text-base sm:text-lg font-black" style={{ color: "var(--foreground)" }}>Total: {formatPrice(selectedInvoice.amount)}</p>
                        <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1" style={{ color: "var(--muted-foreground)" }}>Status: <span className="font-semibold capitalize">{selectedInvoice.status}</span></p>
                    </div>

                    <div className="mt-8 sm:mt-12 text-center text-[10px] sm:text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Thank you for your business!
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial="hidden" animate="show" className="max-w-[900px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
            <motion.div variants={itemVariants} className="flex items-center gap-3 sm:gap-4">
                <button onClick={() => router.push("/dashboard/billing")} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shrink-0"
                    style={{ borderColor: "var(--glass-border)" }}>
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
                <div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-0.5 sm:mb-1" style={{ color: "var(--nav-active-color)" }}>Billing</p>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>Invoices</h1>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>View and download your payment receipts</p>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-12 sm:py-16">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                </div>
            ) : history.length === 0 ? (
                <motion.div variants={itemVariants} className="text-center py-12 sm:py-16 border border-dashed rounded-2xl"
                    style={{ borderColor: "var(--glass-border)" }}>
                    <Receipt className="mx-auto h-8 sm:h-10 w-8 sm:w-10 mb-3 sm:mb-4" style={{ color: "var(--muted-foreground)" }} />
                    <p className="text-sm sm:text-base font-semibold" style={{ color: "var(--foreground)" }}>No invoices yet</p>
                    <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: "var(--muted-foreground)" }}>Invoices will appear here after your first payment.</p>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="space-y-2">
                    {history.map((item: PaymentRecord, i: number) => (
                        <motion.div
                            key={item.id ?? i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => setSelectedInvoice(item)}
                            className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all cursor-pointer hover:opacity-85"
                            style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
                        >
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: item.status === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                                <Receipt className="w-3.5 sm:w-4 h-3.5 sm:h-4" style={{ color: item.status === "success" ? "#10b981" : "#ef4444" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                                    {item.payment_id || `INV-${String(item.id).padStart(4, "0")}`}
                                </p>
                                <p className="text-[10px] sm:text-xs" style={{ color: "var(--muted-foreground)" }}>
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : ""}
                                </p>
                            </div>
                            <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full capitalize shrink-0"
                                style={{
                                    background: item.status === "success" ? "rgba(16,185,129,0.1)" : item.status === "failed" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                                    color: item.status === "success" ? "#10b981" : item.status === "failed" ? "#ef4444" : "#f59e0b",
                                }}>
                                {item.status}
                            </span>
                            <span className="text-xs sm:text-sm font-black tabular-nums w-16 sm:w-20 text-right shrink-0" style={{ color: "var(--foreground)" }}>
                                {formatPrice(item.amount)}
                            </span>
                            <ChevronRightIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--muted-foreground)" }} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}

function ChevronRightIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

function formatPrice(v: number): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(v);
}
