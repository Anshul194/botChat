"use client";

import React from 'react';

export const RoleHeaderSkeleton: React.FC = () => {
    return (
        <div
            className="w-full px-4 py-2.5 flex items-center justify-between gap-4 border-b animate-pulse"
            style={{
                background: "var(--topbar-bg, rgba(15, 23, 42, 0.75))",
                borderColor: "var(--topbar-border, rgba(255, 255, 255, 0.08))",
            }}
        >
            {/* Left section skeleton */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-white/10" />
                <div className="space-y-1.5">
                    <div className="w-24 h-3 rounded bg-white/10" />
                    <div className="w-32 h-2.5 rounded bg-white/5" />
                </div>
            </div>

            {/* Center section skeleton */}
            <div className="hidden md:flex items-center gap-3 overflow-hidden flex-1 px-4">
                <div className="w-40 h-10 rounded-xl bg-white/10 shrink-0" />
                <div className="w-40 h-10 rounded-xl bg-white/10 shrink-0" />
                <div className="w-40 h-10 rounded-xl bg-white/10 shrink-0" />
                <div className="w-40 h-10 rounded-xl bg-white/10 shrink-0" />
            </div>

            {/* Right section skeleton */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-24 h-8 rounded-lg bg-white/10" />
                <div className="w-16 h-8 rounded-lg bg-white/10" />
            </div>
        </div>
    );
};
