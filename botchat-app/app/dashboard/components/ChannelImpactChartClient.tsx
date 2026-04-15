"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Props = { data: Array<any> };

export default function ChannelImpactChartClient({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: -10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="hour" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 800 }} width={45} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="instagram" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} barSize={12} />
                <Bar dataKey="facebook" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
        </ResponsiveContainer>
    );
}
