"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

export function useRazorpay() {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.Razorpay) { setScriptLoaded(true); return; }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => { document.body.removeChild(script); };
    }, []);

    const checkout = useCallback(async (planId: number, couponCode?: string) => {
        if (!scriptLoaded) throw new Error("Razorpay SDK not loaded");
        setProcessing(true);

        try {
            const { data } = await api.post("/payment/initiate", {
                plan_id: planId,
                gateway: "razorpay",
                ...(couponCode ? { coupon_code: couponCode } : {}),
            });

            const result = data?.data ?? data;
            const orderId = result.order_id ?? result.id;
            const key = result.key ?? result.razorpay_key ?? "";

            if (!orderId) throw new Error("No order ID returned");

            return new Promise<{ status: "success" | "failed" | "cancelled" }>((resolve) => {
                const options = {
                    key,
                    order_id: orderId,
                    name: "BotChat",
                    description: "Subscription Payment",
                    handler: async function (response: {
                        razorpay_payment_id: string;
                        razorpay_order_id: string;
                        razorpay_signature: string;
                    }) {
                        try {
                            await api.post("/payment/razorpay/verify", {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                plan_id: planId,
                            });
                            window.dispatchEvent(new CustomEvent("payment:success"));
                            resolve({ status: "success" });
                        } catch {
                            resolve({ status: "failed" });
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            resolve({ status: "cancelled" });
                        },
                    },
                    prefill: { name: "", email: "", contact: "" },
                    theme: { color: "#7c3aed" },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Payment failed";
            throw new Error(msg);
        } finally {
            setProcessing(false);
        }
    }, [scriptLoaded]);

    return { checkout, processing, scriptLoaded };
}
