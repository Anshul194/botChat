"use client";

import React, { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Props = { data: Array<Record<string, any>>; chartType?: string };

const COLORS = ["#6C5CE7", "#ec4899", "#10b981", "#f59e0b", "#06b6d4", "#8b5cf6", "#ef4444", "#14b8a6"];

export default function FlowChartClient({ data, chartType: forcedType }: Props) {
    const { chartType, keys, hasMultiple } = useMemo(() => {
        if (!data || data.length === 0) return { chartType: 'bar', keys: [], hasMultiple: false };
        const allKeys = Object.keys(data[0]).filter(k => k !== 'name' && k !== 'date' && k !== 'period' && k !== 'time' && k !== 'hour');
        return {
            chartType: forcedType || (allKeys.length > 2 ? 'area' : allKeys.length > 1 ? 'line' : 'bar'),
            keys: allKeys,
            hasMultiple: allKeys.length > 1,
        };
    }, [data, forcedType]);

    if (!data || data.length === 0) {
        return <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data available</div>;
    }

    const xKey = data[0]?.name !== undefined ? 'name' : data[0]?.date !== undefined ? 'date' : data[0]?.period !== undefined ? 'period' : data[0]?.time !== undefined ? 'time' : data[0]?.hour !== undefined ? 'hour' : Object.keys(data[0]).find(k => typeof data[0][k] === 'string') || 'name';

    if (chartType === 'pie') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={data} dataKey="count" nameKey="plan_name" cx="50%" cy="50%" outerRadius={100} label>
                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    }

    if (chartType === 'area') {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                        {keys.map((k, i) => (
                            <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                    <Tooltip />
                    {keys.map((k, i) => (
                        <Area key={k} type="monotone" dataKey={k} fill={`url(#grad_${k})`} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    if (chartType === 'line' || hasMultiple) {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                    <Tooltip />
                    <Legend />
                    {keys.map((k, i) => (
                        <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                <Tooltip />
                <Bar dataKey={keys[0]} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
