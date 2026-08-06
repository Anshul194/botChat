"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, MessageSquare, Sparkles, Share2, Radio, Calendar, Zap,
    HardDrive, Link as LinkIcon, Globe, QrCode, Bot, UserCheck, Code
} from 'lucide-react';
import { ProgressCircle } from './ProgressCircle';
import { UsageTooltip } from './UsageTooltip';
import { FeatureAccessBadge } from './FeatureAccessBadge';
import { HeaderCardItem } from '@/store/slices/dashboardHeaderSlice';

interface UsageCardProps {
    card: HeaderCardItem;
    onUpgradeClick?: () => void;
    compact?: boolean;
}

const ICON_MAP: Record<string, any> = {
    Users,
    MessageSquare,
    Sparkles,
    Share2,
    Radio,
    Calendar,
    Zap,
    HardDrive,
    Link: LinkIcon,
    Globe,
    QrCode,
    Bot,
    UserCheck,
    Code,
};

export const UsageCard: React.FC<UsageCardProps> = ({
    card,
    onUpgradeClick,
    compact = false,
}) => {
    const router = useRouter();
    const IconComponent = ICON_MAP[card.icon] || Zap;
    const isUnlimited = card.is_unlimited;
    const isEnabled = card.enabled;

    return (
        <UsageTooltip
            title={card.title}
            used={card.used}
            limit={isUnlimited ? 'Unlimited' : card.limit}
            remaining={card.remaining}
            isUnlimited={isUnlimited}
        >
            <div
                onClick={() => card.click_url && router.push(card.click_url)}
                className={`group relative rounded-xl p-2.5 sm:p-3 transition-all duration-200 hover:scale-[1.02] cursor-pointer flex items-center justify-between gap-2.5 ${
                    compact ? 'w-[160px] sm:w-[180px] shrink-0' : 'w-full'
                }`}
                style={{
                    background: "var(--glass-bg, rgba(255, 255, 255, 0.03))",
                    border: "1px solid var(--glass-border, rgba(255, 255, 255, 0.08))",
                    backdropFilter: "blur(12px)",
                }}
            >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{
                            background: `color-mix(in srgb, ${
                                card.color === 'purple'
                                    ? '#8b5cf6'
                                    : card.color === 'red'
                                    ? '#ef4444'
                                    : card.color === 'yellow'
                                    ? '#f59e0b'
                                    : '#10b981'
                            } 15%, transparent)`,
                            color:
                                card.color === 'purple'
                                    ? '#8b5cf6'
                                    : card.color === 'red'
                                    ? '#ef4444'
                                    : card.color === 'yellow'
                                    ? '#f59e0b'
                                    : '#10b981',
                        }}
                    >
                        <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold text-foreground/90 truncate">
                                {card.title}
                            </span>
                            {!isEnabled && (
                                <FeatureAccessBadge enabled={false} onClick={onUpgradeClick} />
                            )}
                        </div>

                        <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xs font-black tracking-tight text-foreground">
                                {card.used.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground/70 truncate">
                                / {isUnlimited ? '∞' : card.limit.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="shrink-0 flex items-center">
                    <ProgressCircle
                        percentage={card.percentage}
                        color={card.color}
                        isUnlimited={isUnlimited}
                        size={34}
                    />
                </div>
            </div>
        </UsageTooltip>
    );
};
