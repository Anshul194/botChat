"use client";

import { useSelector } from "react-redux";
import { Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { selectUserPlan } from "@/lib/plan";
import { cn } from "@/lib/utils";

interface CurrentPlanBadgeProps {
    className?: string;
    showUpgrade?: boolean;
    compact?: boolean;
}

export default function CurrentPlanBadge({ className, showUpgrade = true, compact = false }: CurrentPlanBadgeProps) {
    const plan = useSelector(selectUserPlan);

    if (!plan) {
        return (
            <Link href="/pricing">
                <span className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity",
                    "bg-primary text-primary-foreground",
                    className
                )}>
                    <Crown className="w-3 h-3" />
                    {compact ? "Upgrade" : "No Plan — Subscribe"}
                    <ArrowRight className="w-3 h-3" />
                </span>
            </Link>
        );
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white" }}>
                <Crown className="w-3 h-3" />
                {compact ? plan.name : `${plan.name} Plan`}
            </span>
            {showUpgrade && (
                <Link href="/pricing">
                    <span className="text-[10px] font-semibold text-primary hover:underline cursor-pointer flex items-center gap-0.5">
                        Change <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                </Link>
            )}
        </div>
    );
}
