"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Sparkles, CreditCard, FileText, ArrowUpRight, PlusCircle, Settings,
    Gift, Megaphone, Server, ShieldAlert, Eye, Radio, Calendar, MessageSquare, Bot, Plus
} from 'lucide-react';
import { DashboardHeaderData, HeaderQuickAction } from '@/store/slices/dashboardHeaderSlice';

interface RoleActionsProps {
    data: DashboardHeaderData;
}

const ACTION_ICON_MAP: Record<string, any> = {
    PlusCircle,
    Plus,
    CreditCard,
    Gift,
    Megaphone,
    Settings,
    Sparkles,
    FileText,
    Eye,
    Radio,
    Calendar,
    MessageSquare,
    Bot,
};

export const RoleActions: React.FC<RoleActionsProps> = ({ data }) => {
    const router = useRouter();
    const quickActions = data.quick_actions || [];

    return (
        <div className="flex items-center gap-1.5 shrink-0">
            {quickActions.map((action) => {
                const IconComponent = ACTION_ICON_MAP[action.icon] || Plus;
                
                let btnStyle = "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-semibold border border-white/10 hover:bg-white/10 text-foreground transition-all duration-200 flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-95 shadow-sm";
                
                if (action.variant === 'primary') {
                    btnStyle = "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-[13px] font-bold text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-95";
                } else if (action.variant === 'gradient') {
                    btnStyle = "px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-[13px] font-extrabold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-95 border border-emerald-500/20";
                } else if (action.variant === 'icon') {
                    btnStyle = "p-1.5 sm:p-2 rounded-xl text-xs sm:text-[13px] font-semibold border border-white/10 hover:bg-white/10 text-foreground transition-all duration-200 shrink-0 hover:scale-[1.02] active:scale-95 shadow-sm flex items-center justify-center";
                }

                return (
                    <button
                        key={action.id}
                        type="button"
                        onClick={() => router.push(action.url)}
                        className={btnStyle}
                        title={action.label}
                    >
                        <IconComponent className={action.variant === 'icon' ? "w-4 h-4 sm:w-4.5 sm:h-4.5" : "w-3.5 h-3.5 sm:w-4 sm:h-4"} />
                        {action.variant !== 'icon' && <span>{action.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};
