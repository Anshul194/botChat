"use client";

import { useState } from "react";
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
    PolarAngleAxis, Radar,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Download, Calendar } from "lucide-react";
import { MessageSquare, BarChart2, Zap, Target } from "lucide-react";

const msgTrend = [
    { date: "Feb 1", ig: 340, fb: 220 },
    { date: "Feb 5", ig: 480, fb: 310 },
    { date: "Feb 10", ig: 390, fb: 280 },
    { date: "Feb 15", ig: 620, fb: 420 },
    { date: "Feb 20", ig: 580, fb: 390 },
    { date: "Feb 25", ig: 710, fb: 480 },
];

const weeklyBar = [
    { day: "Mon", replies: 280, leads: 45, opens: 240 },
    { day: "Tue", replies: 420, leads: 72, opens: 380 },
    { day: "Wed", replies: 320, leads: 58, opens: 290 },
    { day: "Thu", replies: 550, leads: 95, opens: 510 },
    { day: "Fri", replies: 640, leads: 112, opens: 580 },
    { day: "Sat", replies: 480, leads: 88, opens: 430 },
    { day: "Sun", replies: 360, leads: 61, opens: 320 },
];

const radarData = [
    { subject: "Open Rate", A: 94 },
    { subject: "Reply Rate", A: 72 },
    { subject: "Lead Conv.", A: 38 },
    { subject: "Retention", A: 85 },
    { subject: "Satisfaction", A: 91 },
    { subject: "Speed", A: 98 },
];

const topKeywords = [
    { word: "pricing", count: 1284, up: true, pct: "+24%" },
    { word: "hello", count: 987, up: true, pct: "+15%" },
    { word: "discount", count: 843, up: false, pct: "-8%" },
    { word: "support", count: 756, up: true, pct: "+31%" },
    { word: "order", count: 621, up: true, pct: "+9%" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="px-3 py-2 rounded-xl text-sm" style={{
                background: "var(--popover)",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--shadow-card)",
            }}>
                <p className="text-xs mb-1 font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="font-semibold text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Analytics</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Deep insights into your messaging performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        {(["7d", "30d", "90d"] as const).map((p) => (
                            <button key={p} onClick={() => setPeriod(p)} className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                                style={period === p ? { background: "var(--brand-gradient)", color: "white" } : { color: "var(--muted-foreground)" }}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                        style={{ background: "rgba(124,58,237,0.1)", color: "var(--brand-purple-light)", border: "1px solid rgba(124,58,237,0.2)" }}>
                        <Download className="w-4 h-4" />Export
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Messages", value: "48,291", change: "+18.2%", up: true, icon: MessageSquare, color: "#7c3aed", sub: "vs last period" },
                    { label: "Leads Generated", value: "3,847", change: "+24.1%", up: true, icon: Target, color: "#10b981", sub: "from DM flows" },
                    { label: "Auto Reply Rate", value: "91.4%", change: "+4.2%", up: true, icon: Zap, color: "#06b6d4", sub: "of all messages" },
                    { label: "Avg Response Time", value: "1.2s", change: "-0.3s", up: true, icon: BarChart2, color: "#f59e0b", sub: "Lightning fast!" },
                ].map((kpi) => (
                    <div key={kpi.label} className="stats-card glass-card rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `radial-gradient(circle at 0% 100%, ${kpi.color}10, transparent 60%)` }} />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}15` }}>
                                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg`}
                                    style={{ color: kpi.up ? "#10b981" : "#ef4444", background: kpi.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                                    {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {kpi.change}
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-1" style={{ color: "var(--foreground)" }}>{kpi.value}</div>
                            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>{kpi.label}</div>
                            <div className="text-[10px] mt-0.5 opacity-60" style={{ color: "var(--muted-foreground)" }}>{kpi.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Message Volume Trend</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Instagram vs Facebook</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {[{ label: "Instagram", color: "#ec4899" }, { label: "Facebook", color: "#3b82f6" }].map((l) => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={msgTrend} margin={{ left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="fbGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="ig" stroke="#ec4899" strokeWidth={2} fill="url(#igGrad)" name="Instagram" />
                            <Area type="monotone" dataKey="fb" stroke="#3b82f6" strokeWidth={2} fill="url(#fbGrad)" name="Facebook" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Performance Score</h2>
                    <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Overall automation health</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="var(--glass-border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                            <Radar name="Score" dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 text-center">
                        <div className="text-2xl font-bold gradient-text">A+ Score</div>
                        <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Above 90th percentile</div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                    <h2 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Weekly Performance</h2>
                    <p className="text-xs mb-5" style={{ color: "var(--muted-foreground)" }}>Replies, leads & message opens</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyBar} margin={{ left: -20, bottom: 0 }} barGap={4} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="replies" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Replies" />
                            <Bar dataKey="leads" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Leads" />
                            <Bar dataKey="opens" fill="#ec4899" radius={[4, 4, 0, 0]} name="Opens" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Top Keywords</h2>
                    <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Most used trigger words</p>
                    <div className="space-y-3">
                        {topKeywords.map((kw, i) => (
                            <div key={kw.word} className="flex items-center gap-3">
                                <div className="w-5 text-center text-xs font-bold" style={{ color: "var(--muted-foreground)" }}>{i + 1}</div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>#{kw.word}</span>
                                        <span className="text-xs font-semibold" style={{ color: kw.up ? "#10b981" : "#ef4444" }}>{kw.pct}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                        <div className="h-full rounded-full" style={{
                                            width: `${(kw.count / topKeywords[0].count) * 100}%`,
                                            background: i === 0 ? "var(--brand-gradient)" : `hsl(${260 - i * 20}, 70%, 60%)`,
                                        }} />
                                    </div>
                                    <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{kw.count.toLocaleString()} mentions</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
