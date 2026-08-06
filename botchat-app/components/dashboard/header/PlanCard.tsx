"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Sparkles, CreditCard, Shield, Clock, AlertTriangle, ArrowUpRight,
    Users, PlusCircle, Settings, Server, FileText, Gift, Megaphone
} from 'lucide-react';
import { DashboardHeaderData } from '@/store/slices/dashboardHeaderSlice';

interface PlanCardProps {
    data: DashboardHeaderData;
}

export const PlanCard: React.FC<PlanCardProps> = ({ data }) => {
    const router = useRouter();
    const { role, workspace, subscription, platform_stats } = data;

    if (role === 'super_admin') {
        return (
            <div
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl shrink-0"
                style={{
                    background: "linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(16, 185, 129, 0.1))",
                    border: "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
                }}
            >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Server className="w-4 h-4" />
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-foreground">Platform Command</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-purple-500/20 text-purple-400 rounded-full uppercase">
                            Super Admin
                        </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        {platform_stats?.total_tenants || 0} Tenants | {platform_stats?.active_subscriptions || 0} Active Subscriptions
                    </p>
                </div>
            </div>
        );
    }

    const planName = subscription?.plan_name || 'Free Plan';
    const status = subscription?.status || 'active';
    const daysRemaining = subscription?.days_remaining ?? 0;
    const isOwner = role === 'admin';

    const statusBadgeColor =
        status === 'active'
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : status === 'trial'
            ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
            : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

    return (
        <div
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl shrink-0 transition-all duration-200"
            style={{
                background: "var(--glass-bg, rgba(255, 255, 255, 0.03))",
                border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.08))",
                backdropFilter: "blur(12px)",
            }}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ background: "var(--brand-gradient, linear-gradient(135deg, #6C5CE7, #10b981))" }}
            >
                <Sparkles className="w-4 h-4" />
            </div>

            <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black truncate text-foreground">{workspace.name}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 border rounded-full uppercase ${statusBadgeColor}`}>
                        {status}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-primary/10 text-primary rounded-full uppercase">
                        {isOwner ? 'Owner' : 'Member'}
                    </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <span className="font-bold text-foreground/90">{planName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Clock className="w-2.5 h-2.5" />
                        {daysRemaining} Days Left
                    </span>
                </div>
            </div>
        </div>
    );
};
