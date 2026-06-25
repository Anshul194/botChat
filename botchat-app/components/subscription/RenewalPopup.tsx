"use client";

import { useEffect, useState } from "react";
import { usePlanFeature } from "@/hooks/usePlanFeature";
import { useRouter } from "next/navigation";
import { X, Crown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RenewalPopup() {
    const { currentPlan, isSuperAdmin } = usePlanFeature();
    const expired = usePlanFeature().isExpired();
    const remaining = usePlanFeature().daysRemaining();
    const router = useRouter();
    const [dismissed, setDismissed] = useState(false);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isSuperAdmin) return;
        if (dismissed) return;
        const key = `renewal_popup_dismissed_${currentPlan?.id}`;
        if ((expired || (remaining !== null && remaining <= 3)) && currentPlan?.id && !sessionStorage.getItem(key)) {
            /* eslint-disable react-hooks/set-state-in-effect */
            setShow(true);
            /* eslint-enable react-hooks/set-state-in-effect */
        }
    }, [expired, remaining, currentPlan?.id, dismissed, isSuperAdmin]);

    const handleDismiss = () => {
        setDismissed(true);
        setShow(false);
        if (currentPlan?.id) {
            sessionStorage.setItem(`renewal_popup_dismissed_${currentPlan.id}`, "1");
        }
    };

    const handleRenew = () => {
        handleDismiss();
        router.push("/dashboard/billing");
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[300] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
                        style={{ background: "var(--card-bg)", border: "1px solid var(--glass-border)" }}
                    >
                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4">
                            <button onClick={handleDismiss}
                                className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
                                style={{ color: "var(--muted-foreground)" }}>
                                <X className="w-4 h-4" />
                            </button>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: expired ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)" }}>
                                <Crown className="w-6 h-6" style={{ color: expired ? "#ef4444" : "#f59e0b" }} />
                            </div>
                            <h2 className="text-lg font-black" style={{ color: "var(--foreground)" }}>
                                {expired ? "Plan Expired" : "Renew Your Plan"}
                            </h2>
                            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                                {expired
                                    ? `Your ${currentPlan?.name ?? "plan"} has expired. Renew now to continue using all features.`
                                    : `Your ${currentPlan?.name ?? "plan"} expires in ${remaining} day${remaining !== 1 ? "s" : ""}. Renew early to avoid service interruption.`}
                            </p>
                        </div>

                        {/* Plan info */}
                        {currentPlan && (
                            <div className="mx-6 p-4 rounded-xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{currentPlan.name}</span>
                                    <span className="text-sm font-black" style={{ color: "var(--foreground)" }}>₹{currentPlan.price}</span>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="px-6 py-4 flex gap-3">
                            <button onClick={handleDismiss}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors"
                                style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                                Later
                            </button>
                            <button onClick={handleRenew}
                                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors"
                                style={{ background: "var(--brand-gradient)" }}>
                                {expired ? "Renew Now" : "Extend Plan"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
