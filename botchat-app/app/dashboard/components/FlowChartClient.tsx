"use client";

import React from "react";
import { ComposedChart, Area, Bar, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = { data: Array<any> };

export default function FlowChartClient({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                <defs>
                    <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                <Tooltip />
                <Area type="monotone" dataKey="active" fill="url(#flowGrad)" stroke="#ec4899" strokeWidth={3} />
                <Bar dataKey="auto" barSize={30} fill="#a855f7" radius={[6, 6, 0, 0]} opacity={0.4} />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }} />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
