import type { Plan } from "@/store/slices/plansSlice";

export function getFeatureVal(features: Record<string, any> | undefined, key: string): string {
    if (!features) return "0";
    const v = features[key];
    if (typeof v === "object" && v !== null) return String(v.value ?? v.enabled ?? "0");
    return String(v ?? "0");
}

export function hasFeature(plan: Plan | null | undefined, feature: string): boolean {
    if (!plan) return false;
    return getFeatureVal(plan.features, feature) !== "0";
}

export function hasFeatureMin(plan: Plan | null | undefined, feature: string, min: number): boolean {
    if (!plan) return false;
    const val = Number(getFeatureVal(plan.features, feature));
    return val >= min;
}

export function getFeatureLimit(plan: Plan | null | undefined, feature: string, fallback = 0): number {
    if (!plan) return fallback;
    return Number(getFeatureVal(plan.features, feature)) || fallback;
}

/** Selector: get user's current plan from Redux */
export function selectUserPlan(state: any): Plan | null {
    return state.plans?.userPlan ?? null;
}

/** Selector: get all plans */
export function selectPlans(state: any): Plan[] {
    return state.plans?.plans ?? [];
}
