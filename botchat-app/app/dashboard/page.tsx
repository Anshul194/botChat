"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    ComposedChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
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
    MoreVertical,
    Activity,
    Target,
    Shield,
    Globe,
    Cpu,
    CheckCircle2,
    Wifi,
    HardDrive,
    BarChart3,
    Layers,
    Workflow,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

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

const interactionFlowData = [
    { time: "09:00", active: 120, auto: 80, success: 95 },
    { time: "12:00", active: 250, auto: 200, success: 180 },
    { time: "15:00", active: 450, auto: 380, success: 340 },
    { time: "18:00", active: 380, auto: 320, success: 290 },
    { time: "21:00", active: 620, auto: 580, success: 520 },
    { time: "00:00", active: 210, auto: 180, success: 160 },
];

const hourlyEngagementData = [
    { hour: "6am", instagram: 45, facebook: 32 },
    { hour: "9am", instagram: 82, facebook: 54 },
    { hour: "12pm", instagram: 110, facebook: 88 },
    { hour: "3pm", instagram: 95, facebook: 72 },
    { hour: "6pm", instagram: 140, facebook: 110 },
    { hour: "9pm", instagram: 180, facebook: 145 },
    { hour: "12am", instagram: 85, facebook: 62 },
];

const recentConvs = [
    { name: "Sarah J.", msg: "Do you ship internationally?", time: "2m", platform: "instagram", unread: true },
    { name: "Mike C.", msg: "What's your return policy?", time: "8m", platform: "facebook", unread: true },
    { name: "Emma D.", msg: "Thanks! That's perfect 🙏", time: "15m", platform: "instagram", unread: false },
    { name: "Alex K.", msg: "Can I get a discount?", time: "1h", platform: "facebook", unread: false },
];

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
    }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-xl border bg-card/95 p-3 shadow-xl backdrop-blur-md">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                            <p className="text-xs font-semibold">
                                {p.name}: <span className="text-foreground">{p.value}</span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export default function DashboardPage() {
    const stats = [
        { label: "Total Messages", value: "48,291", change: "+18.2%", up: true, icon: MessageSquare, color: "#ec4899" },
        { label: "Automated Replies", value: "44,180", change: "+22.4%", up: true, icon: Zap, color: "#a855f7" },
        { label: "Conversion Rate", value: "8.4%", change: "-0.3%", up: false, icon: TrendingUp, color: "#f59e0b" },
        { label: "New Leads", value: "3,847", change: "+31.0%", up: true, icon: Users, color: "#10b981" },
    ];

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tighter sm:text-3xl md:text-4xl">
                        Overview<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-sm">Premium analytics for your connected accounts</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <Tabs defaultValue="7d" className="w-full sm:w-[300px]">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                            <TabsTrigger value="7d" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">7D</TabsTrigger>
                            <TabsTrigger value="30d" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">30D</TabsTrigger>
                            <TabsTrigger value="90d" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">90D</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" size="icon" className="rounded-xl">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <Card key={s.label} className="group relative overflow-hidden border-none bg-card/50 shadow-premium transition-all hover:translate-y-[-4px] hover:shadow-hover">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: `radial-gradient(circle at top right, ${s.color}10, transparent 70%)` }} />

                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                                {s.label}
                            </CardTitle>
                            <div className="rounded-xl p-2" style={{ background: `${s.color}15` }}>
                                <s.icon className="h-4 w-4" style={{ color: s.color }} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tighter">{s.value}</div>
                            <div className="mt-2 flex items-center gap-1.5">
                                <Badge variant={s.up ? "default" : "destructive"} className={cn(
                                    "px-1.5 py-0 text-[10px] font-bold",
                                    s.up && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                )}>
                                    {s.up ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
                                    {s.change}
                                </Badge>
                                <span className="text-[10px] font-medium text-muted-foreground italic">vs last period</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid: Advanced Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Performance Flow (Composed Chart) */}
                <Card className="col-span-1 border-none bg-card/30 shadow-premium lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                                <Workflow className="h-5 w-5 text-primary" />
                                Performance Flow
                            </CardTitle>
                            <CardDescription>Multi-layered interaction mapping across 24h</CardDescription>
                        </div>
                        <div className="hidden items-center gap-6 sm:flex">
                            {[{ name: "Live", color: "#ec4899" }, { name: "Auto", color: "#a855f7" }, { name: "Success", color: "#10b981" }].map((l) => (
                                <div key={l.name} className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: l.name === "Success" ? "transparent" : l.color, border: l.name === "Success" ? `2px solid ${l.color}` : 'none' }} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{l.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[380px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={interactionFlowData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="active" fill="url(#flowGrad)" stroke="#ec4899" strokeWidth={3} />
                                    <Bar dataKey="auto" barSize={30} fill="#a855f7" radius={[6, 6, 0, 0]} opacity={0.4} />
                                    <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-3 border-t border-border/10 bg-muted/5 p-6">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Flow Velocity</p>
                            <p className="text-lg font-black text-[#ec4899]">High</p>
                        </div>
                        <div className="text-center border-x border-border/10">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Path Success</p>
                            <p className="text-lg font-black text-emerald-500">92.4%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">Drop-off Rate</p>
                            <p className="text-lg font-black text-amber-500">4.2%</p>
                        </div>
                    </CardFooter>
                </Card>

                {/* Engagement Peak (Bar Chart) */}
                <Card className="border-none bg-card/30 shadow-premium flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                            <BarChart3 className="h-5 w-5 text-indigo-500" />
                            Channel Impact
                        </CardTitle>
                        <CardDescription>Engagement spikes by platform</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-2">
                        <div className="h-[280px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyEngagementData} layout="vertical" margin={{ left: -10, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="hour" type="category" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 800 }} width={45} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                    <Bar dataKey="instagram" stackId="a" fill="#ec4899" radius={[0, 0, 0, 0]} barSize={12} />
                                    <Bar dataKey="facebook" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter className="p-0">
                        <div className="w-full space-y-3 p-6 pt-2 bg-gradient-to-t from-muted/20 to-transparent rounded-b-3xl">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">IG Saturation</span>
                                <span className="text-xs font-black text-pink-500">62%</span>
                            </div>
                            <Progress value={62} className="h-1 bg-muted/20" />
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">FB Reach</span>
                                <span className="text-xs font-black text-blue-500">38%</span>
                            </div>
                            <Progress value={38} className="h-1 bg-muted/20" />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Top Automations */}
                <Card className="border-none bg-card/30 shadow-premium">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                Elite Flows
                            </CardTitle>
                            <CardDescription>Most triggered automation sequences</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl font-bold">
                            Flow Lab
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {topAutomations.map((a, i) => (
                            <div key={a.name} className="flex items-center gap-4 rounded-2xl border border-border/5 bg-muted/10 p-4 transition-all hover:bg-muted/20">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-black text-white shadow-lg"
                                    style={{ background: "var(--brand-gradient)" }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="truncate text-sm font-black tracking-tight">{a.name}</h4>
                                        <Badge variant="outline" className="h-4 px-1 text-[8px] font-bold uppercase tracking-widest">Active</Badge>
                                    </div>
                                    <div className="mt-1 flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 opacity-60">
                                            {a.platform === "instagram" ? <Instagram className="h-3 w-3 text-pink-500" /> : <Facebook className="h-3 w-3 text-blue-500" />}
                                            <span className="text-[10px] font-bold uppercase">{a.platform}</span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-border" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{a.triggers.toLocaleString()} hits</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black tracking-tighter text-emerald-500">{a.rate}</div>
                                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Success</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Inbox */}
                <Card className="border-none bg-card/30 shadow-premium">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                                <Send className="h-5 w-5 text-primary" />
                                Smart Inbox
                            </CardTitle>
                            <CardDescription>High-priority pending conversations</CardDescription>
                        </div>
                        <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
                            Launch Inbox
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentConvs.map((c) => (
                            <div key={c.name} className="group flex items-center gap-4 rounded-2xl border border-border/5 bg-muted/10 p-3.5 transition-all hover:bg-primary/5 cursor-pointer">
                                <div className="relative">
                                    <Avatar className="h-11 w-11 rounded-2xl border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="rounded-2xl bg-primary/10 text-xs font-black text-primary">
                                            {c.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {c.unread && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-background"></span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-black tracking-tight">{c.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{c.time} ago</span>
                                    </div>
                                    <p className="truncate text-xs font-medium text-muted-foreground">{c.msg}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    {c.platform === "instagram" ? <Instagram className="h-4 w-4 text-pink-500" /> : <Facebook className="h-4 w-4 text-blue-500" />}
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="grid grid-cols-3 gap-3 pt-0">
                        {[
                            { icon: Clock, label: "Avg Wait", value: "1.2s", color: "#ec4899" },
                            { icon: Bot, label: "Bot Rate", value: "94%", color: "#a855f7" },
                            { icon: Activity, label: "Sentiment", value: "97%", color: "#10b981" },
                        ].map((q) => (
                            <div key={q.label} className="flex flex-col items-center justify-center rounded-2xl border border-border/5 bg-muted/20 p-3 text-center transition-all hover:bg-muted/40">
                                <q.icon className="mb-1.5 h-4 w-4" style={{ color: q.color }} />
                                <div className="text-sm font-black tracking-tighter" style={{ color: q.color }}>{q.value}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{q.label}</div>
                            </div>
                        ))}
                    </CardFooter>
                </Card>
            </div>
            {/* Final Row: Team & System */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Team Pulse */}
                <Card className="border-none bg-card/30 shadow-premium">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                            <Users className="h-5 w-5 text-emerald-500" />
                            Team Pulse
                        </CardTitle>
                        <CardDescription>Human agent occupancy and status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { name: "Anshul Gupta", role: "Super Admin", status: "Available", color: "#10b981", load: 15 },
                            { name: "Support AI-1", role: "Virtual Agent", status: "Busy", color: "#06b6d4", load: 88 },
                            { name: "Rahul S.", role: "Lead Dev", status: "Offline", color: "#64748b", load: 0 },
                        ].map((member) => (
                            <div key={member.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                        <AvatarFallback className="bg-muted text-[10px] font-bold">{member.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-black leading-none">{member.name}</p>
                                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">{member.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="h-4 px-1 text-[8px] font-black uppercase" style={{ color: member.color, borderColor: `${member.color}30` }}>
                                        {member.status}
                                    </Badge>
                                    <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted/20">
                                        <div className="h-full" style={{ width: `${member.load}%`, background: member.color }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" className="w-full rounded-xl text-xs font-bold opacity-50 hover:opacity-100">
                            Manage Team Settings
                        </Button>
                    </CardFooter>
                </Card>

                {/* System Integrity */}
                <Card className="col-span-1 border-none bg-card/30 shadow-premium lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight">
                                <Shield className="h-5 w-5 text-indigo-500" />
                                Infrastructure Host
                            </CardTitle>
                            <CardDescription>Real-time server health and API uptime</CardDescription>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            All Systems Operational
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            {[
                                { label: "Main Cluster", icon: Cpu, value: "11% Load", color: "#6366f1" },
                                { label: "Edge Proxy", icon: Globe, value: "14ms Latency", color: "#06b6d4" },
                                { label: "Database", icon: HardDrive, value: "Healthy", color: "#10b981" },
                            ].map((s) => (
                                <div key={s.label} className="flex flex-col items-center justify-center rounded-2xl border border-border/5 bg-muted/10 p-4">
                                    <div className="mb-3 rounded-full p-3" style={{ background: `${s.color}10` }}>
                                        <s.icon className="h-5 w-5" style={{ color: s.color }} />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                                    <p className="mt-1 text-sm font-black">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 rounded-2xl bg-muted/10 p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-tight">API Throughput</span>
                                <span className="text-xs font-black text-[#ec4899] italic">99.98% Success</span>
                            </div>
                            <div className="flex gap-1.5">
                                {Array.from({ length: 48 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-8 flex-1 rounded-sm transition-all hover:scale-110 cursor-help",
                                            i === 12 || i === 34 ? "bg-amber-500/50" : "bg-emerald-500/50"
                                        )}
                                        title={i === 12 || i === 34 ? "Slight delay detected" : "Perfect performance"}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
