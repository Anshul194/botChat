"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscription } from "@/store/slices/subscriptionSlice";

export default function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!isInitialized || !isAuthenticated) return;
        dispatch(fetchSubscription());
    }, [dispatch, isAuthenticated, isInitialized]);

    useEffect(() => {
        const refresh = () => dispatch(fetchSubscription());

        window.addEventListener("subscription:refresh", refresh);
        window.addEventListener("payment:success", refresh);
        window.addEventListener("plan:changed", refresh);

        return () => {
            window.removeEventListener("subscription:refresh", refresh);
            window.removeEventListener("payment:success", refresh);
            window.removeEventListener("plan:changed", refresh);
        };
    }, [dispatch]);

    return <>{children}</>;
}
