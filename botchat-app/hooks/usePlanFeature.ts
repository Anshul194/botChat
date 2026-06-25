import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";

const aliases: Record<string, string[]> = {
    ai_agent: ["bot_ai_agent"],
    bot_ai_agent: ["ai_agent"],
    smart_inbox: ["live_chat"],
    live_chat: ["smart_inbox"],
};

function keysFor(feature: string) {
    return [feature, ...(aliases[feature] || [])];
}

export function usePlanFeature() {
    const subscription = useAppSelector((state) => state.subscription);

    return useMemo(() => {
        const canAccess = (feature: string) => {
            if (!feature) return true;
            if (subscription.loading) return false;
            if (subscription.expired) return false;
            if (!subscription.currentPlan) return true;

            return keysFor(feature).some((key) => subscription.features[key] === true);
        };

        const usageFor = (feature: string) => {
            for (const key of keysFor(feature)) {
                if (subscription.usage[key]) return subscription.usage[key];
            }
            return undefined;
        };

        const used = (feature: string) => usageFor(feature)?.used ?? 0;
        const limit = (feature: string) => usageFor(feature)?.limit ?? -1;
        const remaining = (feature: string) => usageFor(feature)?.remaining ?? -1;
        const isExpired = () => subscription.expired;
        const daysRemaining = () => {
            if (!subscription.expiryDate) return null;
            const end = new Date(subscription.expiryDate).getTime();
            if (Number.isNaN(end)) return null;
            return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
        };

        return {
            ...subscription,
            canAccess,
            remaining,
            used,
            limit,
            isExpired,
            daysRemaining,
        };
    }, [subscription]);
}
