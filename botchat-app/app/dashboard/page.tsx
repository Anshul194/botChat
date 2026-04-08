"use client";

import { useState } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
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
    Instagram,
    Facebook,
    Send,
    Sparkles,
    Heart,
    Eye,
    Share2,
    MoreHorizontal,
    Bell,
    ChevronRight,
    Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Engagement data
const engagementData = [
    { day: "Mon", messages: 320, engagement: 85 },
    { day: "Tue", messages: 480, engagement: 92 },
    { day: "Wed", messages: 390, engagement: 78 },
    { day: "Thu", messages: 620, engagement: 95 },
    { day: "Fri", messages: 740, engagement: 88 },
    { day: "Sat", messages: 560, engagement: 91 },
    { day: "Sun", messages: 430, engagement: 86 },
];

const hourlyData = [
    { hour: "6am", value: 45 },
    { hour: "9am", value: 82 },
    { hour: "12pm", value: 110 },
    { hour: "3pm", value: 95 },
    { hour: "6pm", value: 140 },
    { hour: "9pm", value: 180 },
    { hour: "12am", value: 85 },
];

const topAutomations = [
    { name: "Story Reply DM", platform: "instagram", triggers: 1284, rate: 94, color: "#f472b6" },
    { name: "Comment Capture", platform: "instagram", triggers: 876, rate: 87, color: "#a78bfa" },
    { name: "Welcome Message", platform: "facebook", triggers: 654, rate: 91, color: "#22d3ee" },
    { name: "Pricing FAQ Bot", platform: "both", triggers: 432, rate: 78, color: "#34d399" },
];

const recentActivity = [
    { name: "Sarah Johnson", action: "replied to story", time: "2m", avatar: "SJ", unread: true },
    { name: "Mike Chen", action: "sent a message", time: "8m", avatar: "MC", unread: true },
    { name: "Emma Davis", action: "liked your post", time: "15m", avatar: "ED", unread: false },
    { name: "Alex Kim", action: "mentioned you", time: "1h", avatar: "AK", unread: false },
];

// SVG Illustration Components
const RocketIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        <defs>
            <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="url(#rocketGrad)" opacity="0.1" />
        <path d="M60 25 L75 65 L60 85 L45 65 Z" fill="url(#rocketGrad)" />
        <circle cx="60" cy="50" r="8" fill="white" opacity="0.9" />
        <path d="M52 85 L60 105 L68 85" fill="url(#flameGrad)" opacity="0.9" />
        <path d="M40 55 L45 65 L40 75" fill="url(#rocketGrad)" opacity="0.7" />
        <path d="M80 55 L75 65 L80 75" fill="url(#rocketGrad)" opacity="0.7" />
        <circle cx="30" cy="40" r="3" fill="#f472b6" opacity="0.5" />
        <circle cx="90" cy="35" r="2" fill="#22d3ee" opacity="0.5" />
        <circle cx="85" cy="80" r="2.5" fill="#a78bfa" opacity="0.5" />
    </svg>
);

const ChartIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        <defs>
            <linearGradient id="chartGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f472b6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
            </linearGradient>
        </defs>
        <rect x="20" y="70" width="15" height="35" rx="4" fill="#f472b6" opacity="0.8" />
        <rect x="42" y="50" width="15" height="55" rx="4" fill="#a78bfa" opacity="0.8" />
        <rect x="64" y="30" width="15" height="75" rx="4" fill="#22d3ee" opacity="0.8" />
        <rect x="86" y="45" width="15" height="60" rx="4" fill="#34d399" opacity="0.8" />
        <path d="M20 60 Q45 40, 70 25 T120 20" stroke="url(#rocketGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="70" cy="25" r="5" fill="#f472b6" />
    </svg>
);

const UsersIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        <defs>
            <linearGradient id="userGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="userGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
        </defs>
        <circle cx="60" cy="40" r="18" fill="url(#userGrad1)" />
        <ellipse cx="60" cy="85" rx="30" ry="20" fill="url(#userGrad1)" opacity="0.8" />
        <circle cx="30" cy="50" r="12" fill="url(#userGrad2)" opacity="0.6" />
        <ellipse cx="30" cy="80" rx="18" ry="12" fill="url(#userGrad2)" opacity="0.4" />
        <circle cx="90" cy="50" r="12" fill="url(#userGrad2)" opacity="0.6" />
        <ellipse cx="90" cy="80" rx="18" ry="12" fill="url(#userGrad2)" opacity="0.4" />
    </svg>
);

const MessageIllustration = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
        <defs>
            <linearGradient id="msgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
        </defs>
        <rect x="20" y="25" width="70" height="50" rx="12" fill="url(#msgGrad)" />
        <polygon points="35,75 50,75 40,90" fill="url(#msgGrad)" />
        <line x1="35" y1="42" x2="75" y2="42" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <line x1="35" y1="52" x2="65" y2="52" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="35" y1="62" x2="55" y2="62" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        <circle cx="95" cy="30" r="12" fill="#34d399" />
        <path d="M90 30 L93 33 L100 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

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
            <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                <div className="space-y-1.5">
                    {payload.map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                            <p className="text-sm font-semibold">
                                {p.name}: <span className="text-foreground">{p.value.toLocaleString()}</span>
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
    const [activeTab, setActiveTab] = useState<"7d" | "30d" | "90d">("7d");

    const stats = [
        { 
            label: "Total Messages", 
            value: "48,291", 
            change: "+18.2%", 
            up: true, 
            icon: MessageSquare, 
            illustration: MessageIllustration,
            gradient: "from-pink-500 via-purple-500 to-cyan-500"
        },
        { 
            label: "Auto Replies", 
            value: "44,180", 
            change: "+22.4%", 
            up: true, 
            icon: Zap, 
            illustration: RocketIllustration,
            gradient: "from-purple-500 via-pink-500 to-rose-500"
        },
        { 
            label: "Conversion", 
            value: "8.4%", 
            change: "-0.3%", 
            up: false, 
            icon: TrendingUp, 
            illustration: ChartIllustration,
            gradient: "from-cyan-500 via-purple-500 to-pink-500"
        },
        { 
            label: "New Leads", 
            value: "3,847", 
            change: "+31.0%", 
            up: true, 
            icon: Users, 
            illustration: UsersIllustration,
            gradient: "from-emerald-500 via-cyan-500 to-purple-500"
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Background gradient effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl blur-lg opacity-50" />
                                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                                    Dashboard
                                </h1>
                                <p className="text-muted-foreground text-sm mt-0.5">Welcome back! Here&apos;s your performance overview.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Time Range Selector */}
                        <div className="flex items-center bg-card/50 backdrop-blur-xl rounded-2xl p-1.5 border border-border">
                            {(["7d", "30d", "90d"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                                        activeTab === tab 
                                            ? "bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-lg" 
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {tab.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <Button 
                            variant="outline" 
                            size="icon" 
                            className="rounded-2xl border-border bg-card/50 backdrop-blur-xl hover:bg-card relative"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-background" />
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {stats.map((stat, index) => (
                        <Card 
                            key={stat.label} 
                            className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Gradient border on hover */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <CardContent className="relative p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="text-4xl font-black tracking-tight">{stat.value}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                className={cn(
                                                    "px-2 py-0.5 text-xs font-bold rounded-lg",
                                                    stat.up 
                                                        ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20" 
                                                        : "bg-red-500/15 text-red-500 hover:bg-red-500/20"
                                                )}
                                            >
                                                {stat.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                                {stat.change}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">vs last period</span>
                                        </div>
                                    </div>
                                    
                                    {/* SVG Illustration */}
                                    <div className="w-20 h-20 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                                        <stat.illustration />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Engagement Chart */}
                    <Card className="xl:col-span-2 border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold">Engagement Overview</CardTitle>
                                        <p className="text-sm text-muted-foreground">Messages & engagement rate this week</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground">
                                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.4} />
                                                <stop offset="50%" stopColor="#a78bfa" stopOpacity={0.2} />
                                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#f472b6" />
                                                <stop offset="50%" stopColor="#a78bfa" />
                                                <stop offset="100%" stopColor="#22d3ee" />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 600 }} 
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 600 }} 
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="messages" 
                                            stroke="url(#strokeGrad)" 
                                            strokeWidth={3} 
                                            fill="url(#engagementGrad)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Stats Footer */}
                            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
                                <div className="text-center">
                                    <p className="text-2xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">92.4%</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Avg Engagement</p>
                                </div>
                                <div className="text-center border-x border-border/50">
                                    <p className="text-2xl font-black bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">4.2k</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Peak Messages</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">+18%</p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Growth Rate</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Peak Hours */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                    <Eye className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Peak Hours</CardTitle>
                                    <p className="text-sm text-muted-foreground">Activity distribution</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f472b6" />
                                                <stop offset="100%" stopColor="#a78bfa" />
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="hour" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 600 }} 
                                        />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar 
                                            dataKey="value" 
                                            fill="url(#barGrad)" 
                                            radius={[8, 8, 0, 0]} 
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Best Time Badge */}
                            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10 border border-border/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Best Time to Post</p>
                                        <p className="text-lg font-black mt-1">9:00 PM</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Automations */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold">Top Automations</CardTitle>
                                        <p className="text-sm text-muted-foreground">Best performing flows</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {topAutomations.map((auto, i) => (
                                <div 
                                    key={auto.name}
                                    className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer"
                                >
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${auto.color}, ${auto.color}99)` }}
                                    >
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold truncate">{auto.name}</h4>
                                            {auto.platform === "instagram" && <Instagram className="w-4 h-4 text-pink-500" />}
                                            {auto.platform === "facebook" && <Facebook className="w-4 h-4 text-blue-500" />}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-0.5">{auto.triggers.toLocaleString()} triggers</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-black" style={{ color: auto.color }}>{auto.rate}%</p>
                                        <p className="text-xs text-muted-foreground">success</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                                        <Send className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                                        <p className="text-sm text-muted-foreground">Latest interactions</p>
                                    </div>
                                </div>
                                <Button className="rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold shadow-lg hover:opacity-90">
                                    Open Inbox
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentActivity.map((activity, i) => (
                                <div 
                                    key={i}
                                    className="group flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 border-2 border-border">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.name}`} />
                                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold">
                                                {activity.avatar}
                                            </AvatarFallback>
                                        </Avatar>
                                        {activity.unread && (
                                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full border-2 border-card flex items-center justify-center">
                                                <span className="w-2 h-2 bg-white rounded-full" />
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold truncate">{activity.name}</h4>
                                            {activity.unread && (
                                                <Badge className="bg-pink-500/15 text-pink-500 text-[10px] px-1.5 py-0">New</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{activity.action}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Platform Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: Heart, label: "Likes Today", value: "12.4k", change: "+24%", color: "#f472b6" },
                        { icon: MessageSquare, label: "Comments", value: "3.2k", change: "+18%", color: "#a78bfa" },
                        { icon: Share2, label: "Shares", value: "892", change: "+12%", color: "#22d3ee" },
                        { icon: Users, label: "New Followers", value: "1.8k", change: "+31%", color: "#34d399" },
                    ].map((item, i) => (
                        <Card key={i} className="group border-border/50 bg-card/50 backdrop-blur-xl hover:bg-card/80 transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                                        <p className="text-3xl font-black">{item.value}</p>
                                        <Badge className="bg-emerald-500/15 text-emerald-500 text-xs">
                                            <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                            {item.change}
                                        </Badge>
                                    </div>
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                        style={{ background: `${item.color}20` }}
                                    >
                                        <item.icon className="w-7 h-7" style={{ color: item.color }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
