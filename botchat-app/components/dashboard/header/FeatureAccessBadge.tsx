"use client";

import React from 'react';

interface FeatureAccessBadgeProps {
    enabled: boolean;
    upgradeRequired?: boolean;
    onClick?: () => void;
}

export const FeatureAccessBadge: React.FC<FeatureAccessBadgeProps> = ({
    enabled,
    upgradeRequired = false,
    onClick,
}) => {
    if (!enabled || upgradeRequired) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider transition-all duration-200 hover:scale-105"
                style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "#ef4444",
                }}
                title="Upgrade plan to unlock feature"
            >
                Upgrade Required
            </button>
        );
    }

    return (
        <span
            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "#10b981",
            }}
        >
            Enabled
        </span>
    );
};
