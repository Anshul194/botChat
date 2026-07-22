"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPlans, fetchMyPlan } from "@/store/slices/plansSlice";
import api from "@/lib/api";
import dynamic from "next/dynamic";
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
import { SwipeHint } from "@/components/ui/swipe-hint";

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
    { name: "Instagram", value: 62, color: "var(--primary)" },
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
    const dispatch = useDispatch<AppDispatch>();
    const throughputRef = useRef<HTMLDivElement>(null);

    const { user } = useSelector((state: RootState) => state.auth);
    const [stats, setStats] = useState<any[]>([]);
    
    useEffect(() => {
        dispatch(fetchMyPlan());
        dispatch(fetchPlans());

        const fetchWidgets = async () => {
            try {
                if (!user) return;
                const endpoint = user.role === 'ADMIN' ? '/dashboard/tenant-admin' : '/dashboard/tenant-user';
                const response = await api.get(endpoint);
                if (response.data.success) {
                    const widgets = response.data.data.widgets.filter((w: any) => w.type === 'kpi').map((w: any, idx: number) => {
                        const icons = [MessageSquare, Zap, TrendingUp, Users, Bot, Send, Target, BarChart3];
                        return {
                            label: w.title,
                            value: w.value,
                            change: w.meta?.change || '',
                            up: w.meta?.up ?? true,
                            icon: icons[idx % icons.length],
                            color: "var(--primary)"
                        };
                    });
                    setStats(widgets);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard widgets", error);
            }
        };
        fetchWidgets();
    }, [dispatch, user]);

    const FlowChart = dynamic(() => import("./components/FlowChartClient"), {
        ssr: false,
        loading: () => <div className="h-[380px] w-full flex items-center justify-center">Loading chart...</div>,
    });

    const ChannelImpactChart = dynamic(() => import("./components/ChannelImpactChartClient"), {
        ssr: false,
        loading: () => <div className="h-[280px] w-full flex items-center justify-center">Loading chart...</div>,
    });

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:gap-6 p-3 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div data-tour="dashboard-header" className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter">
                        Overview<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Premium analytics for your connected accounts</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Tabs defaultValue="7d" className="flex-1 sm:flex-none sm:w-[300px]">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                            <TabsTrigger value="7d" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-[10px] sm:text-xs">7D</TabsTrigger>
                            <TabsTrigger value="30d" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-[10px] sm:text-xs">30D</TabsTrigger>
                            <TabsTrigger value="90d" className="data-[state=active]:bg-background data-[state=active]:shadow-sm text-[10px] sm:text-xs">90D</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" size="icon" className="rounded-xl shrink-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div data-tour="stats-grid" className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <Card key={s.label} className="group relative overflow-hidden border-none bg-card/50 shadow-premium transition-all hover:translate-y-[-4px] hover:shadow-hover">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: `radial-gradient(circle at top right, ${s.color}10, transparent 70%)` }} />

                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                            <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">
                                {s.label}
                            </CardTitle>
                            <div className="rounded-xl p-1.5 sm:p-2" style={{ background: `${s.color}15` }}>
                                <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: s.color }} />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                            <div className="text-2xl sm:text-3xl font-black tracking-tighter">{s.value}</div>
                            <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5">
                                <Badge variant={s.up ? "default" : "destructive"} className={cn(
                                    "px-1.5 py-0 text-[9px] sm:text-[10px] font-bold",
                                    s.up && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                )}>
                                    {s.up ? <ArrowUpRight className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <ArrowDownRight className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                                    {s.change}
                                </Badge>
                                <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground italic">vs last period</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <Card data-tour="performance-flow" className="col-span-1 border-none bg-card/30 shadow-premium lg:col-span-2">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-6">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight">
                                <Workflow className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                Performance Flow
                            </CardTitle>
                            <CardDescription className="text-xs">Multi-layered interaction mapping across 24h</CardDescription>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                            {[{ name: "Live", color: "var(--primary)" }, { name: "Auto", color: "#6366f1" }, { name: "Success", color: "#10b981" }].map((l) => (
                                <div key={l.name} className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: l.name === "Success" ? "transparent" : l.color, border: l.name === "Success" ? `2px solid ${l.color}` : 'none' }} />
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{l.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        <div className="h-[280px] sm:h-[380px] w-full">
                            <FlowChart data={interactionFlowData} />
                        </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-3 border-t border-border/10 bg-muted/5 p-4 sm:p-6">
                        <div className="text-center">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">Flow Velocity</p>
                            <p className="text-base sm:text-lg font-black text-primary">High</p>
                        </div>
                        <div className="text-center border-x border-border/10">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">Path Success</p>
                            <p className="text-base sm:text-lg font-black text-emerald-500">92.4%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">Drop-off Rate</p>
                            <p className="text-base sm:text-lg font-black text-amber-500">4.2%</p>
                        </div>
                    </CardFooter>
                </Card>

                <Card data-tour="channel-impact" className="border-none bg-card/30 shadow-premium flex flex-col justify-between">
                    <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight">
                            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                            Channel Impact
                        </CardTitle>
                        <CardDescription className="text-xs">Engagement spikes by platform</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-2 px-4 sm:px-6">
                        <div className="h-[220px] sm:h-[280px] w-full mt-2 sm:mt-4">
                            <ChannelImpactChart data={hourlyEngagementData} />
                        </div>
                    </CardContent>
                    <CardFooter className="p-0">
                        <div className="w-full space-y-2 sm:space-y-3 p-4 sm:p-6 pt-2 sm:pt-2 bg-gradient-to-t from-muted/20 to-transparent rounded-b-3xl">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground">IG Saturation</span>
                                <span className="text-[11px] sm:text-xs font-black text-primary">62%</span>
                            </div>
                            <Progress value={62} className="h-1 bg-primary/20" />
                            <div className="flex items-center justify-between pt-0.5 sm:pt-1">
                                <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground">FB Reach</span>
                                <span className="text-[11px] sm:text-xs font-black text-blue-500">38%</span>
                            </div>
                            <Progress value={38} className="h-1 bg-primary/20" />
                        </div>
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                <Card data-tour="elite-flows" className="border-none bg-card/30 shadow-premium">
                    <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
                        <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight">
                                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                                Elite Flows
                            </CardTitle>
                            <CardDescription className="text-xs truncate">Most triggered automation sequences</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] sm:text-xs shrink-0">
                            Flow Lab
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                        {topAutomations.map((a, i) => (
                            <div key={a.name} className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-border/5 bg-muted/10 p-3 sm:p-4 transition-all hover:bg-muted/20">
                                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-[10px] sm:text-xs font-black text-white shadow-lg shrink-0"
                                    style={{ background: "var(--brand-gradient)" }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="truncate text-xs sm:text-sm font-black tracking-tight">{a.name}</h4>
                                        <Badge variant="outline" className="h-3 sm:h-4 px-1 text-[7px] sm:text-[8px] font-bold uppercase tracking-widest shrink-0">Active</Badge>
                                    </div>
                                    <div className="mt-0.5 sm:mt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <div className="flex items-center gap-1 sm:gap-1.5 opacity-60">
                                            {a.platform === "instagram" ? <Instagram className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" /> : <Facebook className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500" />}
                                            <span className="text-[9px] sm:text-[10px] font-bold uppercase">{a.platform}</span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-border hidden sm:block" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">{a.triggers.toLocaleString()} hits</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-base sm:text-lg font-black tracking-tighter text-emerald-500">{a.rate}</div>
                                    <div className="text-[9px] sm:text-[10px] font-bold uppercase text-muted-foreground">Success</div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card data-tour="smart-inbox-preview" className="border-none bg-card/30 shadow-premium">
                    <CardHeader className="flex flex-row items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6">
                        <div className="min-w-0">
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight">
                                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                Smart Inbox
                            </CardTitle>
                            <CardDescription className="text-xs truncate">High-priority pending conversations</CardDescription>
                        </div>
                        <Button className="rounded-xl font-bold text-[10px] sm:text-xs shadow-lg shadow-primary/20 shrink-0 px-3 sm:px-4 h-8 sm:h-9">
                            Launch Inbox
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6">
                        {recentConvs.map((c) => (
                            <div key={c.name} className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-border/5 bg-muted/10 p-3 sm:p-3.5 transition-all hover:bg-primary/5 cursor-pointer">
                                <div className="relative">
                                    <Avatar className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border-2 border-background shadow-lg transition-transform group-hover:scale-110">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="rounded-xl sm:rounded-2xl bg-primary/10 text-[10px] sm:text-xs font-black text-primary">
                                            {c.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {c.unread && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-4 sm:w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 bg-primary border-2 border-background"></span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm font-black tracking-tight">{c.name}</span>
                                        <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase shrink-0 ml-2">{c.time} ago</span>
                                    </div>
                                    <p className="truncate text-[10px] sm:text-xs font-medium text-muted-foreground">{c.msg}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
                                    {c.platform === "instagram" ? <Instagram className="h-3 w-3 sm:h-4 sm:w-4 text-primary" /> : <Facebook className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />}
                                    <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="grid grid-cols-3 gap-2 sm:gap-3 pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                        {[
                            { icon: Clock, label: "Avg Wait", value: "1.2s", color: "var(--primary)" },
                            { icon: Bot, label: "Bot Rate", value: "94%", color: "#6366f1" },
                            { icon: Activity, label: "Sentiment", value: "97%", color: "#10b981" },
                        ].map((q) => (
                            <div key={q.label} className="flex flex-col items-center justify-center rounded-2xl border border-border/5 bg-muted/20 p-2 sm:p-3 text-center transition-all hover:bg-muted/40">
                                <q.icon className="mb-1 h-3 w-3 sm:h-4 sm:w-4" style={{ color: q.color }} />
                                <div className="text-[11px] sm:text-sm font-black tracking-tighter" style={{ color: q.color }}>{q.value}</div>
                                <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{q.label}</div>
                            </div>
                        ))}
                    </CardFooter>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <Card data-tour="team-pulse" className="border-none bg-card/30 shadow-premium">
                    <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                            Team Pulse
                        </CardTitle>
                        <CardDescription className="text-xs">Human agent occupancy and status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                        {[
                            { name: "Anshul Gupta", role: "Super Admin", status: "Available", color: "#10b981", load: 15 },
                            { name: "Support AI-1", role: "Virtual Agent", status: "Busy", color: "#06b6d4", load: 88 },
                            { name: "Rahul S.", role: "Lead Dev", status: "Offline", color: "#64748b", load: 0 },
                        ].map((member) => (
                            <div key={member.name} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-background shadow-sm shrink-0">
                                        <AvatarFallback className="bg-muted text-[9px] sm:text-[10px] font-bold">{member.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="text-[11px] sm:text-xs font-black leading-none truncate">{member.name}</p>
                                        <p className="mt-0.5 text-[9px] sm:text-[10px] font-medium text-muted-foreground truncate">{member.role}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <Badge variant="outline" className="h-3 sm:h-4 px-1 text-[7px] sm:text-[8px] font-black uppercase" style={{ color: member.color, borderColor: `${member.color}30` }}>
                                        {member.status}
                                    </Badge>
                                    {member.load > 0 && (
                                        <div className="mt-1 h-1 w-12 sm:w-16 overflow-hidden rounded-full bg-muted/20">
                                            <div className="h-full rounded-full" style={{ width: `${member.load}%`, background: member.color }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <Button variant="ghost" className="w-full rounded-xl text-[10px] sm:text-xs font-bold opacity-50 hover:opacity-100">
                            Manage Team Settings
                        </Button>
                    </CardFooter>
                </Card>

                <Card data-tour="infrastructure" className="col-span-1 border-none bg-card/30 shadow-premium lg:col-span-2">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 pt-4 sm:pt-6">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-black tracking-tight">
                                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                                Infrastructure Host
                            </CardTitle>
                            <CardDescription className="text-xs">Real-time server health and API uptime</CardDescription>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-[9px] sm:text-xs whitespace-nowrap">
                            <CheckCircle2 className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            All Systems Operational
                        </Badge>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-3">
                            {[
                                { label: "Main Cluster", icon: Cpu, value: "11% Load", color: "#6366f1" },
                                { label: "Edge Proxy", icon: Globe, value: "14ms Latency", color: "#06b6d4" },
                                { label: "Database", icon: HardDrive, value: "Healthy", color: "#10b981" },
                            ].map((s) => (
                                <div key={s.label} className="flex flex-row sm:flex-col items-center sm:justify-center gap-3 sm:gap-0 rounded-2xl border border-border/5 bg-muted/10 p-3 sm:p-4">
                                    <div className="rounded-full p-2 sm:p-3 shrink-0" style={{ background: `${s.color}10` }}>
                                        <s.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: s.color }} />
                                    </div>
                                    <div className="sm:text-center">
                                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                                        <p className="text-xs sm:text-sm font-black">{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 sm:mt-8 rounded-2xl bg-muted/10 p-4 sm:p-6">
                            <div className="mb-3 sm:mb-4 flex items-center justify-between">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight">API Throughput</span>
                                <span className="text-[10px] sm:text-xs font-black text-primary italic">99.98% Success</span>
                            </div>
                            <div className="relative">
                                <SwipeHint containerRef={throughputRef} storageKey="dash-throughput" align="right" className="absolute -top-5 right-0" />
                                <div ref={throughputRef} className="flex gap-1 overflow-x-auto pb-1">
                                {Array.from({ length: 48 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-6 sm:h-8 flex-1 min-w-[4px] rounded-sm transition-all hover:scale-110 cursor-help",
                                            i === 12 || i === 34 ? "bg-amber-500/50" : "bg-emerald-500/50"
                                        )}
                                        title={i === 12 || i === 34 ? "Slight delay detected" : "Perfect performance"}
                                    />
                                ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
