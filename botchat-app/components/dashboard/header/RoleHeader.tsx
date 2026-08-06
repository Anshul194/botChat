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
            className="sticky top-0 z-[90] w-full px-4 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all duration-300"
            style={{
                background: "var(--topbar-bg, rgba(10, 10, 10, 0.7))",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid var(--topbar-border, rgba(255, 255, 255, 0.06))",
                boxShadow: "0 8px 32px -8px rgba(0, 0, 0, 0.3)",
            }}
        >
            {/* Left section: Workspace & Plan */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto shrink-0">
                <PlanCard data={data} />
                <div className="flex md:hidden overflow-x-auto no-scrollbar pb-1 gap-2 border-t border-white/5 pt-3 mt-1">
                    <RoleActions data={data} />
                </div>
            </div>

            {/* Center section: Dynamic Cards Loop */}
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar py-0.5">
                {isSuperAdmin && platform_stats ? (
                    <div className="flex items-center gap-3 min-w-max">
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                            <Users className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wide">{platform_stats.total_users} Users</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wide">${platform_stats.monthly_revenue.toFixed(2)} MRR</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                            <Activity className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wide">{platform_stats.total_broadcasts} Broadcasts</span>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Database className="w-4 h-4" />
                            <span className="text-xs font-bold tracking-wide">Status: {platform_stats.server_status.status}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 min-w-max snap-x snap-mandatory">
                        {cards && cards.map((card) => (
                            <div key={card.id} className="snap-start transition-transform hover:scale-[1.02] active:scale-95">
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
            <div className="hidden md:flex items-center justify-end shrink-0 pl-4 border-l border-white/10 ml-2">
                <RoleActions data={data} />
            </div>
        </div>
    );
};
