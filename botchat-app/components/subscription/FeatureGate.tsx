"use client";

import { ReactNode } from "react";
import { usePlanFeature } from "@/hooks/usePlanFeature";
import UpgradeCard from "./UpgradeCard";

export default function FeatureGate({
    feature,
    children,
    fallback,
    hide = false,
}: {
    feature: string;
    children: ReactNode;
    fallback?: ReactNode;
    hide?: boolean;
}) {
    const { canAccess, loading } = usePlanFeature();

    if (loading) return null;
    if (canAccess(feature)) return <>{children}</>;
    if (hide) return null;

    return <>{fallback ?? <UpgradeCard feature={feature} />}</>;
}
