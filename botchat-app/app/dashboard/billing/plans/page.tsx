"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Crown, CheckCircle2, ChevronRight, ArrowLeft, Sparkles, Loader2, Zap, Users, Bot, MessageSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPlans, Plan } from "@/store/slices/plansSlice";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import CouponPanel from "@/components/billing/CouponPanel";
import PlanComparisonTable from "@/components/billing/PlanComparisonTable";
import { useRazorpay } from "@/hooks/useRazorpay";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

export default function BillingPlansPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { plans, userPlan, isLoading } = useAppSelector((s) => s.plans);
    const user = useAppSelector((s) => s.auth.user);
    const isSuperAdmin = user?.role === "SUPER_ADMIN" || user?.type === "Super Admin";
    const { checkout, processing } = useRazorpay();
    const [couponData, setCouponData] = useState<{ code: string; discount: number; finalAmount: number } | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [paymentError, setPaymentError] = useState("");
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        dispatch(fetchPlans());
    }, [dispatch]);

    const handleSubscribe = async (plan: Plan) => {
        if (plan.id === userPlan?.id) return;
        setSelectedPlanId(plan.id);
        setPaymentError("");

        try {
            const result = await checkout(plan.id, couponData?.code);
            if (result.status === "success") {
                setSelectedPlanId(null);
            } else if (result.status === "cancelled") {
                setPaymentError("Payment was cancelled");
                setSelectedPlanId(null);
            } else {
                setPaymentError("Payment verification failed. Please try again.");
                setSelectedPlanId(null);
            }
        } catch (err: unknown) {
            setPaymentError(err instanceof Error ? err.message : "Payment failed");
            setSelectedPlanId(null);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="show"
            className="max-w-[1200px] mx-auto px-3 sm:px-6 lg:p-8 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-8"
        >
            <motion.div variants={itemVariants} className="flex items-center gap-3 sm:gap-4">
                <button onClick={() => router.back()} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shrink-0"
                    style={{ borderColor: "var(--glass-border)" }}>
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
                <div>
                    <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest mb-0.5 sm:mb-1" style={{ color: "var(--nav-active-color)" }}>Subscription</p>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>Choose a Plan</h1>
                </div>
            </motion.div>

            {paymentError && (
                <motion.div variants={itemVariants} className="rounded-2xl border p-3 sm:p-4" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)" }}>
                    <p className="text-xs sm:text-sm font-semibold" style={{ color: "#ef4444" }}>{paymentError}</p>
                </motion.div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-16 sm:py-24">
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                </div>
            ) : (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {plans.map((plan, idx) => {
                        const isCurrent = userPlan?.id === plan.id;
                        const isSelected = selectedPlanId === plan.id;
                        const isPopular = plan.is_highlighted && !isCurrent;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={cn(
                                    "relative rounded-2xl sm:rounded-3xl border-2 flex flex-col overflow-hidden transition-all",
                                    isCurrent ? "border-violet-500/50" : "hover:border-violet-500/30"
                                )}
                                style={{
                                    background: isCurrent
                                        ? "linear-gradient(180deg, rgba(139,92,246,0.08) 0%, transparent 100%)"
                                        : "var(--glass-bg)",
                                    borderColor: isCurrent ? "rgba(139,92,246,0.5)" : "var(--glass-border)",
                                }}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white rounded-b-xl"
                                            style={{ background: "var(--brand-gradient)" }}>
                                            <Sparkles className="w-2.5 sm:w-3 h-2.5 sm:h-3" /> Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className={cn("p-4 sm:p-6 flex flex-col flex-1", isPopular && "pt-10 sm:pt-12")}>
                                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: isCurrent ? "rgba(139,92,246,0.2)" : "var(--glass-border)" }}>
                                            <Crown className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: isCurrent ? "#8b5cf6" : "var(--muted-foreground)" }} />
                                        </div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-black" style={{ color: "var(--foreground)" }}>{plan.name}</h3>
                                            {plan.description && (
                                                <p className="text-[10px] sm:text-xs" style={{ color: "var(--muted-foreground)" }}>{plan.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-1 mb-4 sm:mb-5">
                                        <span className="text-2xl sm:text-4xl font-black tabular-nums leading-none" style={{ color: "var(--foreground)" }}>
                                            {formatCurrency(plan.price)}
                                        </span>
                                        <span className="mb-0.5 sm:mb-1.5 text-[10px] sm:text-sm" style={{ color: "var(--muted-foreground)" }}>
                                            / {plan.duration} {plan.duration_type}
                                        </span>
                                    </div>

                                    <div className="border-t mb-3 sm:mb-4" style={{ borderColor: "var(--glass-border)" }} />

                                    <ul className="space-y-2 sm:space-y-2.5 flex-1 mb-4 sm:mb-6">
                                        {[
                                            { key: "connect_account", label: "Connected Accounts", icon: Users },
                                            { key: "message_credit", label: "Message Credits", icon: MessageSquare },
                                            { key: "subscribers", label: "Subscribers", icon: Users },
                                            { key: "bot_ai_token", label: "AI Tokens", icon: Bot },
                                        ].map((f) => {
                                            const val = getFeatureVal(plan.features, f.key);
                                            return (
                                                <li key={f.key} className="flex items-center gap-2 sm:gap-2.5">
                                                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 shrink-0" style={{ color: val !== "0" ? "#8b5cf6" : "var(--muted-foreground)" }} />
                                                    <span className="text-xs sm:text-sm" style={{ color: val !== "0" ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                                        {val !== "0" ? `${val} ${f.label}` : `No ${f.label}`}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>

                                    {isSuperAdmin ? (
                                        <div className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-center"
                                            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                                            Full Access — Super Admin
                                        </div>
                                    ) : isCurrent ? (
                                        <div className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-center"
                                            style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                                            Current Plan
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(plan)}
                                            disabled={isSelected || processing}
                                            className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            style={{ background: "var(--brand-gradient)" }}
                                        >
                                            {isSelected || processing ? (
                                                <><Loader2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin" /> Processing…</>
                                            ) : (
                                                <><Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> Subscribe</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="md:col-span-2">
                    <CouponPanel planPrice={plans.find((p) => p.id === selectedPlanId)?.price ?? 0} onApplied={setCouponData} />
                </div>
                <div className="rounded-2xl border p-4 sm:p-5" style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}>
                    <h3 className="text-xs sm:text-sm font-bold mb-1.5 sm:mb-2" style={{ color: "var(--foreground)" }}>Need help?</h3>
                    <p className="text-[10px] sm:text-xs" style={{ color: "var(--muted-foreground)" }}>
                        Contact support for enterprise plans, custom requirements, or billing inquiries.
                    </p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}>
                <button
                    onClick={() => setShowComparison(!showComparison)}
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold py-1.5 sm:py-2"
                    style={{ color: "var(--nav-active-color)" }}
                >
                    {showComparison ? "Hide" : "Compare"} plans <ChevronRight className={`w-3.5 sm:w-4 h-3.5 sm:h-4 transition-transform ${showComparison ? "rotate-90" : ""}`} />
                </button>
                {showComparison && (
                    <div className="mt-3 sm:mt-4">
                        <PlanComparisonTable plans={plans} currentPlanId={userPlan?.id} />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

function getFeatureVal(features: Record<string, unknown> | undefined, key: string): string {
    if (!features) return "0";
    const v = features[key];
    if (v === null || v === undefined) return "0";
    if (typeof v === "boolean") return v ? "1" : "0";
    if (typeof v === "object") return String((v as Record<string, unknown>).value ?? (v as Record<string, unknown>).enabled ?? "0");
    return String(v);
}
