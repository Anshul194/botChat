"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardHeader } from '@/store/slices/dashboardHeaderSlice';
import { PlanCard } from './PlanCard';
import { UsageCard } from './UsageCard';
import { RoleActions } from './RoleActions';
import { RoleHeaderSkeleton } from './RoleHeaderSkeleton';
import { Activity, Users, DollarSign, Database } from 'lucide-react';

export const RoleHeader: React.FC = () => {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const router = useRouter();
    const { data, loading, error } = useAppSelector((state) => state.dashboardHeader);

    useEffect(() => {
        dispatch(fetchDashboardHeader(pathname));
    }, [dispatch, pathname]);

    if (loading || !data) {
        return <RoleHeaderSkeleton />;
    }

    if (error) {
        return null;
    }

    const { role, cards, platform_stats } = data;
    const isSuperAdmin = role === 'super_admin';

    return (
        <div
            className="sticky top-0 z-[90] w-full px-3 sm:px-4 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 transition-all duration-300"
            style={{
                background: "var(--topbar-bg, rgba(15, 23, 42, 0.85))",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--topbar-border, rgba(255, 255, 255, 0.08))",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
        >
            {/* Left section: Workspace & Plan */}
            <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto shrink-0">
                <PlanCard data={data} />
                <div className="md:hidden">
                    <RoleActions data={data} />
                </div>
            </div>

            {/* Center section: Dynamic Cards Loop (Zero Hardcoded Cards!) */}
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar py-0.5">
                {isSuperAdmin && platform_stats ? (
                    <div className="flex items-center gap-2.5 min-w-max">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{platform_stats.total_users} Users</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">${platform_stats.monthly_revenue.toFixed(2)} MRR</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                            <Activity className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{platform_stats.total_broadcasts} Broadcasts</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Database className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Status: {platform_stats.server_status.status}</span>
                        </div>
                    </div>
                ) : (
                    /* Dynamic Cards Loop from Backend Plugin Config */
                    <div className="flex items-center gap-2 min-w-max snap-x snap-mandatory">
                        {cards && cards.map((card) => (
                            <div key={card.id} className="snap-start">
                                <UsageCard
                                    card={card}
                                    compact={true}
                                    onUpgradeClick={() => router.push('/dashboard/billing')}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Right Quick Actions */}
            <div className="hidden md:flex items-center justify-end shrink-0">
                <RoleActions data={data} />
            </div>
        </div>
    );
};
