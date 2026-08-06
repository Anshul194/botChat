"use client";

import React, { useState } from 'react';

interface UsageTooltipProps {
    title: string;
    used: number;
    limit: number | string;
    remaining: number | string | null;
    isUnlimited?: boolean;
    resetsAt?: string;
    children: React.ReactNode;
}

export const UsageTooltip: React.FC<UsageTooltipProps> = ({
    title,
    used,
    limit,
    remaining,
    isUnlimited = false,
    resetsAt,
    children,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-block w-full"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div
                    role="tooltip"
                    className="absolute z-[150] bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-48 p-3 rounded-xl shadow-2xl backdrop-blur-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                    style={{
                        background: "var(--topbar-dropdown-bg, rgba(15, 23, 42, 0.92))",
                        border: "1px solid var(--topbar-dropdown-border, rgba(255, 255, 255, 0.12))",
                        color: "var(--foreground, #ffffff)",
                    }}
                >
                    <div className="flex items-center justify-between border-b pb-1.5 mb-2" style={{ borderColor: "var(--glass-border, rgba(255, 255, 255, 0.1))" }}>
                        <span className="text-xs font-bold truncate">{title}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase">
                            {isUnlimited ? 'Unlimited' : 'Quota'}
                        </span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Used:</span>
                            <span className="font-bold">{used.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="font-bold text-emerald-400">
                                {isUnlimited ? 'Unlimited' : (remaining !== null ? remaining.toLocaleString() : 'N/A')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Limit:</span>
                            <span className="font-semibold">{isUnlimited ? '∞ Unlimited' : limit.toLocaleString()}</span>
                        </div>
                        {resetsAt && (
                            <div className="flex justify-between pt-1 border-t border-white/5 text-[10px] text-muted-foreground">
                                <span>Resets:</span>
                                <span className="font-medium text-sky-400">{resetsAt}</span>
                            </div>
                        )}
                    </div>
                    {/* Tooltip arrow pointer */}
                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent"
                        style={{ borderTopColor: "var(--topbar-dropdown-bg, rgba(15, 23, 42, 0.92))" }}
                    />
                </div>
            )}
        </div>
    );
};
