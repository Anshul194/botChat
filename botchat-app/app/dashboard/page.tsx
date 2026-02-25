"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    MessageSquare,
    Zap,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Bot,
    Instagram,
    Facebook,
    Send,
    Clock,
} from "lucide-react";

const areaData = [
    { date: "Mon", messages: 320, replies: 280, leads: 42 },
    { date: "Tue", messages: 480, replies: 420, leads: 68 },
    { date: "Wed", messages: 390, replies: 340, leads: 51 },
    { date: "Thu", messages: 620, replies: 580, leads: 95 },
    { date: "Fri", messages: 740, replies: 690, leads: 112 },
    { date: "Sat", messages: 560, replies: 510, leads: 84 },
    { date: "Sun", messages: 430, replies: 390, leads: 63 },
];

const pieData = [
    { name: "Instagram", value: 62, color: "#ec4899" },
    { name: "Facebook", value: 38, color: "#3b82f6" },
];

const topAutomations = [
    { name: "Story Reply → DM", platform: "instagram", triggers: 1284, rate: "94%", status: "active" },
    { name: "Comment Capture", platform: "instagram", triggers: 876, rate: "87%", status: "active" },
    { name: "Messenger Welcome", platform: "facebook", triggers: 654, rate: "91%", status: "active" },
    { name: "Pricing FAQ Bot", platform: "both", triggers: 432, rate: "78%", status: "active" },
];

const recentConvs = [
    { name: "Sarah J.", msg: "Do you ship internationally?", time: "2m", platform: "instagram", unread: true },
    { name: "Mike C.", msg: "What's your return policy?", time: "8m", platform: "facebook", unread: true },
    { name: "Emma D.", msg: "Thanks! That's perfect 🙏", time: "15m", platform: "instagram", unread: false },
    { name: "Alex K.", msg: "Can I get a discount?", time: "1h", platform: "facebook", unread: false },
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
                    <p key={i} className="font-semibold text-xs" style={{ color: p.color }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

    const stats = [
        { label: "Total Messages", value: "48,291", change: "+18%", up: true, icon: MessageSquare, color: "#7c3aed" },
        { label: "Automated Replies", value: "44,180", change: "+22%", up: true, icon: Zap, color: "#06b6d4" },
        { label: "New Leads", value: "3,847", change: "+31%", up: true, icon: Users, color: "#10b981" },
        { label: "Conversion Rate", value: "8.4%", change: "-0.3%", up: false, icon: TrendingUp, color: "#f59e0b" },
    ];

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                        Good evening, Anshul 👋
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Here's what's happening across your accounts
                    </p>
                </div>
                <div className="flex items-center rounded-xl p-1 gap-1" style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                }}>
                    {(["7d", "30d", "90d"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={period === p
                                ? { background: "var(--brand-gradient)", color: "white" }
                                : { color: "var(--muted-foreground)" }
                            }
                        >{p}</button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="stats-card glass-card rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 0% 100%, ${s.color}15, transparent 60%)` }} />
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${s.up ? "text-green-500" : "text-red-500"}`}
                                    style={{ background: s.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                                    {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {s.change}
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-1" style={{ color: "var(--foreground)" }}>{s.value}</div>
                            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Area Chart */}
                <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Message Activity</h2>
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Messages received vs automated replies</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {[{ label: "Messages", color: "#7c3aed" }, { label: "Replies", color: "#06b6d4" }, { label: "Leads", color: "#10b981" }].map((l) => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={areaData} margin={{ left: -20, bottom: 0 }}>
                            <defs>
                                {[
                                    { id: "msg", color: "#7c3aed" },
                                    { id: "reply", color: "#06b6d4" },
                                    { id: "leads", color: "#10b981" },
                                ].map(({ id, color }) => (
                                    <linearGradient key={id} id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="messages" stroke="#7c3aed" strokeWidth={2} fill="url(#grad-msg)" name="Messages" />
                            <Area type="monotone" dataKey="replies" stroke="#06b6d4" strokeWidth={2} fill="url(#grad-reply)" name="Replies" />
                            <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} fill="url(#grad-leads)" name="Leads" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="glass-card rounded-2xl p-6">
                    <h2 className="text-base font-semibold mb-1" style={{ color: "var(--foreground)" }}>Platform Split</h2>
                    <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Message source breakdown</p>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]} contentStyle={{ background: "var(--popover)", border: "1px solid var(--glass-border)", borderRadius: "12px", fontSize: "12px" }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                        {pieData.map((p) => (
                            <div key={p.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                                    <span className="text-sm" style={{ color: "var(--foreground)" }}>{p.name}</span>
                                </div>
                                <span className="text-sm font-bold" style={{ color: p.color }}>{p.value}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {[
                            { label: "Avg Response", value: "1.2s", color: "#06b6d4" },
                            { label: "Open Rate", value: "94%", color: "#10b981" },
                            { label: "Lead Rate", value: "8.4%", color: "#f59e0b" },
                            { label: "Bot Accuracy", value: "97%", color: "#7c3aed" },
                        ].map((q) => (
                            <div key={q.label} className="p-2 rounded-xl text-center" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <div className="text-sm font-bold" style={{ color: q.color }}>{q.value}</div>
                                <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{q.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Top Automations */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Top Automations</h2>
                        <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {topAutomations.map((a, i) => (
                            <div key={a.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: "var(--brand-gradient)" }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>{a.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {a.platform === "instagram" && <Instagram className="w-3 h-3" style={{ color: "#ec4899" }} />}
                                        {a.platform === "facebook" && <Facebook className="w-3 h-3" style={{ color: "#3b82f6" }} />}
                                        {a.platform === "both" && <><Instagram className="w-3 h-3" style={{ color: "#ec4899" }} /><Facebook className="w-3 h-3" style={{ color: "#3b82f6" }} /></>}
                                        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{a.triggers.toLocaleString()} triggers</span>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-bold" style={{ color: "#10b981" }}>{a.rate}</div>
                                    <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>reply rate</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Conversations */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Recent Conversations</h2>
                        <button className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                            Open Inbox
                        </button>
                    </div>
                    <div className="space-y-2">
                        {recentConvs.map((c) => (
                            <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors message-item" style={{ border: "1px solid var(--glass-border)" }}>
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{ background: c.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                                    {c.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.name}</span>
                                        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{c.time}</span>
                                    </div>
                                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>{c.msg}</p>
                                </div>
                                {c.unread && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#7c3aed" }} />}
                            </div>
                        ))}
                    </div>

                    {/* Quick stats */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                            { icon: Clock, label: "Avg Wait", value: "1.2s", color: "#06b6d4" },
                            { icon: Bot, label: "Bot Rate", value: "94%", color: "#7c3aed" },
                            { icon: Send, label: "Sent Today", value: "284", color: "#10b981" },
                        ].map((q) => (
                            <div key={q.label} className="p-2 rounded-xl text-center" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <q.icon className="w-4 h-4 mx-auto mb-1" style={{ color: q.color }} />
                                <div className="text-sm font-bold" style={{ color: q.color }}>{q.value}</div>
                                <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{q.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
