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
        <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0 px-2">
            {/* Left section: Workspace & Plan */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
                <PlanCard data={data} />
            </div>

            {/* Center section: Dynamic Cards Loop */}
            <div className="hidden lg:flex flex-1 min-w-0 overflow-x-auto no-scrollbar items-center">
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
                    <div className="flex items-center gap-3 min-w-max">
                        {cards && cards.map((card) => (
                            <div key={card.id} className="transition-transform hover:scale-[1.02] active:scale-95">
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
