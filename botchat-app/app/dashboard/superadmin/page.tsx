"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
    TrendingUp, Shield, Cpu, HelpCircle, Users, DollarSign,
    Building, CreditCard, RefreshCw, Bell, ChevronRight,
    Activity, AlertTriangle, BarChart3, Settings, Tag,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FlowChart = dynamic(() => import("../components/FlowChartComponent"), {
    ssr: false,
    loading: () => <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>,
});

const KPI_COLORS: Record<string, string> = {
    revenue: "#10b981", mrr: "#06b6d4", arr: "#6366f1",
    subscriptions: "#8b5cf6", system: "#64748b", support: "#ef4444",
    tenants: "#f59e0b",
};

function getColor(key: string): string {
    for (const [k, v] of Object.entries(KPI_COLORS)) {
        if (key.includes(k)) return v;
    }
    return "#6C5CE7";
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function SuperAdminDashboardPage() {
    const router = useRouter();
    const [data, setData] = useState<any>({ widgets: [], charts: [], notifications: [], quick_actions: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                const response = await api.get('/dashboard/super-admin');
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWidgets();
    }, []);

    const kpiWidgets = useMemo(() => data.widgets.filter((w: any) => w.type === 'kpi'), [data.widgets]);
    const chartWidgets = useMemo(() => data.charts || [], [data]);
    const notifications = useMemo(() => data.notifications || [], [data]);
    const quickActions = useMemo(() => data.quick_actions || [], [data]);

    if (loading) {
        return (
            <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="h-8 w-64 rounded-lg bg-muted/20 animate-pulse" />
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/10 animate-pulse" />)}
                </div>
                <div className="h-[300px] rounded-2xl bg-muted/10 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:gap-6 p-3 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter">
                        Super Admin<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Platform-wide SaaS overview</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] sm:text-xs font-bold"
                        onClick={() => router.push('/dashboard/settings')}>
                        <Settings className="w-3 h-3 mr-1" />System Settings
                    </Button>
                </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="flex flex-col gap-2">
                    {notifications.slice(0, 3).map((n: any) => (
                        <div key={n.id}
                            className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all hover:translate-x-1"
                            style={{
                                borderColor: n.severity === 'error' ? '#ef444430' : '#f59e0b30',
                                background: n.severity === 'error' ? '#ef444405' : '#f59e0b05',
                            }}
                            onClick={() => n.link && router.push(n.link)}
                        >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: n.severity === 'error' ? '#ef444415' : '#f59e0b15' }}>
                                <AlertTriangle className="w-4 h-4" style={{ color: n.severity === 'error' ? '#ef4444' : '#f59e0b' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{n.title}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground shrink-0">{timeAgo(n.created_at)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {quickActions.map((a: any) => (
                        <Button key={a.label} variant="outline" size="sm"
                            onClick={() => router.push(a.link)}
                            className="rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-2 h-auto py-2 px-3 whitespace-nowrap">
                            <CreditCard className="w-3 h-3" />
                            {a.label}
                        </Button>
                    ))}
                </div>
            )}

            {/* KPI Widgets */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {kpiWidgets.map((widget: any) => {
                    const color = getColor(widget.key);
                    return (
                        <Card key={widget.key} className="group relative overflow-hidden border-none bg-card/50 shadow-premium transition-all hover:translate-y-[-3px] hover:shadow-hover">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }} />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                                <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">
                                    {widget.title}
                                </CardTitle>
                                <Badge variant="outline" className="h-4 px-1.5 text-[8px] font-bold" style={{ borderColor: `${color}30`, color }}>
                                    {widget.value}
                                </Badge>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                <div className="text-xl sm:text-2xl font-black tracking-tighter">{widget.value}</div>
                                {widget.meta?.change && (
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <Badge className={cn(
                                            "px-1.5 py-0 text-[9px] sm:text-[10px] font-bold",
                                            widget.meta.up !== false ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {widget.meta.up !== false ? '↑' : '↓'} {widget.meta.change}
                                        </Badge>
                                        <span className="text-[10px] font-medium text-muted-foreground">vs last period</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts */}
            {chartWidgets.length > 0 && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                    {chartWidgets.map((chart: any) => (
                        <Card key={chart.key} className="border-none bg-card/30 shadow-premium col-span-1">
                            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-black tracking-tight">
                                    <BarChart3 className="w-4 h-4 text-primary" />
                                    {chart.title}
                                </CardTitle>
                                <CardDescription className="text-xs">Last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                <div className="h-[250px] sm:h-[300px] w-full">
                                    <FlowChart data={chart.data || []} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
