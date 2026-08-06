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
                
                let btnStyle = "px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-glass-border hover:bg-glass-hover text-foreground transition-all flex items-center gap-1 shrink-0";
                
                if (action.variant === 'primary') {
                    btnStyle = "px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1 shrink-0";
                } else if (action.variant === 'gradient') {
                    btnStyle = "px-3 py-1.5 rounded-lg text-xs font-extrabold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-all shadow-sm flex items-center gap-1 shrink-0";
                } else if (action.variant === 'icon') {
                    btnStyle = "px-2 py-1.5 rounded-lg text-xs font-semibold border border-glass-border hover:bg-glass-hover text-foreground transition-all shrink-0";
                }

                return (
                    <button
                        key={action.id}
                        type="button"
                        onClick={() => router.push(action.url)}
                        className={btnStyle}
                        title={action.label}
                    >
                        <IconComponent className="w-3.5 h-3.5" />
                        {action.variant !== 'icon' && <span>{action.label}</span>}
                    </button>
                );
            })}
        </div>
    );
};
