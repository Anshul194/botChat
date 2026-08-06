"use client";

import React from 'react';

interface ProgressCircleProps {
    percentage: number;
    color: 'green' | 'yellow' | 'red' | 'purple' | string;
    size?: number;
    strokeWidth?: number;
    isUnlimited?: boolean;
}

const COLOR_MAP: Record<string, string> = {
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
};

export const ProgressCircle: React.FC<ProgressCircleProps> = ({
    percentage,
    color,
    size = 36,
    strokeWidth = 3.5,
    isUnlimited = false,
}) => {
    const strokeColor = COLOR_MAP[color] || color || '#10b981';
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const safePercentage = Math.min(100, Math.max(0, percentage));
    const strokeDashoffset = isUnlimited ? 0 : circumference - (safePercentage / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background track circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="var(--glass-border, rgba(255, 255, 255, 0.1))"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                    style={{
                        filter: `drop-shadow(0 0 4px ${strokeColor}40)`,
                    }}
                />
            </svg>
            <span
                className="absolute text-[10px] font-extrabold tracking-tighter"
                style={{ color: strokeColor }}
            >
                {isUnlimited ? '∞' : `${Math.round(safePercentage)}%`}
            </span>
        </div>
    );
};
