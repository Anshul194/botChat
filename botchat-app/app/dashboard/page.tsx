"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMyPlan } from "@/store/slices/plansSlice";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import {
    MessageSquare, Zap, Users, TrendingUp, ArrowUpRight, ArrowDownRight,
    Bot, Instagram, Facebook, Send, Clock, MoreVertical, Activity, Target,
    Shield, Globe, Cpu, CheckCircle2, Wifi, HardDrive, BarChart3, Layers,
    Workflow, Sparkles, Bell, UserPlus, CreditCard, Settings, RefreshCw,
    ChevronRight, ChevronDown, Eye, EyeOff, GripVertical, Layout,
    List, Plus, FileText, Play, Pause, Trash2, Copy, BookOpen,
    Image, Database, HelpCircle, X, PanelLeftClose, PanelLeftOpen, Tags,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const FlowChart = dynamic(() => import("./components/FlowChartClient"), {
    ssr: false,
    loading: () => <div className="h-[280px] sm:h-[380px] w-full flex items-center justify-center text-xs text-muted-foreground">Loading chart...</div>,
});

const MODULE_MAP: Record<string, { label: string; icon: typeof MessageSquare; href: string; color: string }> = {
    smart_inbox: { label: "Smart Inbox", icon: MessageSquare, href: "/dashboard/inbox", color: "#6C5CE7" },
    broadcast: { label: "Broadcast", icon: Send, href: "/dashboard/broadcasts", color: "#06b6d4" },
    automation: { label: "Automation", icon: Bot, href: "/dashboard/automations", color: "#10b981" },
    ai: { label: "AI Agent", icon: Sparkles, href: "/dashboard/ai-training", color: "#f59e0b" },
    ai_knowledge: { label: "Knowledge Base", icon: BookOpen, href: "/dashboard/ai-training", color: "#8b5cf6" },
    social_posting: { label: "Social Posting", icon: Instagram, href: "/dashboard/posts/studio", color: "#db2777" },
    subscribers: { label: "Subscribers", icon: Users, href: "/dashboard/content-library", color: "#0ea5e9" },
    analytics: { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics", color: "#14b8a6" },
    storage: { label: "Storage", icon: Database, href: "/dashboard/settings", color: "#64748b" },
    billing: { label: "Billing", icon: CreditCard, href: "/dashboard/billing", color: "#f59e0b" },
    settings: { label: "Settings", icon: Settings, href: "/dashboard/settings", color: "#6366f1" },
};

const KPI_ICONS: Record<string, typeof MessageSquare> = {
    conversations: MessageSquare, subscribers: Users, broadcast: Send,
    social_posting: Instagram, ai: Sparkles, automation: Bot,
    facebook: Facebook, instagram: Instagram, team: Users,
    billing: CreditCard, storage: Database, usage: Activity,
    revenue: TrendingUp, subscriptions: Shield, system: Cpu,
    support: HelpCircle,
};

const KPI_COLORS: Record<string, string> = {
    conversations: "#6C5CE7", subscribers: "#0ea5e9", broadcast: "#06b6d4",
    social_posting: "#db2777", ai: "#f59e0b", automation: "#10b981",
    facebook: "#1877F2", instagram: "#E1306C", team: "#14b8a6",
    billing: "#f59e0b", storage: "#64748b", usage: "#8b5cf6",
    revenue: "#10b981", subscriptions: "#6366f1", system: "#64748b",
    support: "#ef4444",
};

function getIcon(key: string): typeof MessageSquare {
    return KPI_ICONS[key] || KPI_ICONS[Object.keys(KPI_ICONS).find(k => key.includes(k)) || ''] || Activity;
}

function getColor(key: string): string {
    return KPI_COLORS[key] || KPI_COLORS[Object.keys(KPI_COLORS).find(k => key.includes(k)) || ''] || "#6C5CE7";
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

function EmptyStateCard({ widget }: { widget: any }) {
    const router = useRouter();
    const es = widget.empty_state;
    if (!es) return null;
    const Icon = KPI_ICONS[widget.module] || HelpCircle;
    return (
        <Card className="border-dashed border-2 border-muted bg-muted/5 flex flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[160px] hover:border-primary/40 transition-colors cursor-pointer group"
            onClick={() => router.push(es.link)}
        >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `${getColor(widget.module)}12` }}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: getColor(widget.module) }} />
            </div>
            <p className="text-xs sm:text-sm font-bold mb-1">{es.action}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Get started with {widget.module?.replace('_', ' ')}</p>
        </Card>
    );
}

function KpiCard({ widget }: { widget: any }) {
    const Icon = getIcon(widget.module || widget.module_group);
    const color = getColor(widget.module || widget.module_group);
    const es = widget.empty_state;
    const hasChange = widget.meta?.change;
    const router = useRouter();

    return (
        <Card className={cn(
            "group relative overflow-hidden border-none bg-card/50 shadow-premium transition-all hover:translate-y-[-3px] hover:shadow-hover",
            widget.action && "cursor-pointer"
        )}
            onClick={() => widget.action && router.push(widget.action.link)}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {widget.title}
                </CardTitle>
                <div className="rounded-xl p-1.5 sm:p-2" style={{ background: `${color}15` }}>
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color }} />
                </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-xl sm:text-3xl font-black tracking-tighter">{widget.value}</div>
                {hasChange && (
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5">
                        <Badge variant={widget.meta.up !== false ? "default" : "destructive"} className={cn(
                            "px-1.5 py-0 text-[9px] sm:text-[10px] font-bold",
                            widget.meta.up !== false && "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        )}>
                            {widget.meta.up !== false
                                ? <ArrowUpRight className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                : <ArrowDownRight className="mr-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                            {widget.meta.change}
                        </Badge>
                        <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground italic">vs last period</span>
                    </div>
                )}
                {widget.meta?.percent !== undefined && (
                    <Progress value={widget.meta.percent} className="h-1.5 mt-2" style={{ background: `${color}20` }} />
                )}
                {widget.action && (
                    <div className="mt-3 text-[10px] sm:text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color }}>
                        {widget.action.label} <ChevronRight className="w-3 h-3" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function WidgetSection({ title, widgets, hidden, onToggle }: {
    title: string; widgets: any[]; hidden: boolean; onToggle: () => void;
}) {
    if (hidden) return null;
    const visible = widgets.filter(w => !w.empty_state || widgets.some(x => x.key !== w.key));
    const empties = widgets.filter(w => w.empty_state);
    const hasData = visible.some(w => w.value !== 0 && w.value !== '0' && w.value !== 'N/A');
    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground/60">{title}</h3>
                <button onClick={onToggle} className="p-1 rounded-lg hover:bg-muted/20 transition-colors">
                    {hidden ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground/40" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground/40" />}
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((w: any) => w.empty_state && !hasData ? (
                    <EmptyStateCard key={w.key} widget={w} />
                ) : w.empty_state && hasData ? null : (
                    <KpiCard key={w.key} widget={w} />
                ))}
                {!hasData && empties.slice(0, 1).map((w: any) => (
                    <EmptyStateCard key={w.key} widget={w} />
                ))}
            </div>
        </div>
    );
}

function ModuleShortcut({ module, onClick }: { module: string; onClick: () => void }) {
    const info = MODULE_MAP[module];
    if (!info) return null;
    const Icon = info.icon;
    return (
        <button onClick={onClick}
            className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-border/5 bg-muted/10 transition-all hover:bg-muted/20 hover:border-border/20 text-left min-w-0"
        >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${info.color}15` }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: info.color }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-black truncate">{info.label}</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100" />
        </button>
    );
}

function QuickAction({ action }: { action: any }) {
    const router = useRouter();
    const color = getColor(action.icon || '');
    const Icon = KPI_ICONS[action.icon] || Activity;
    return (
        <Button variant="outline" onClick={() => router.push(action.link)}
            className="rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-2 h-auto py-2.5 px-3 sm:px-4 justify-start w-full"
        >
            <Icon className="w-3.5 h-3.5" style={{ color }} />
            {action.label}
        </Button>
    );
}

export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);

    const [widgets, setWidgets] = useState<any[]>([]);
    const [charts, setCharts] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [quickActions, setQuickActions] = useState<any[]>([]);
    const [enabledModules, setEnabledModules] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hiddenSections, setHiddenSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchMyPlan());
        loadDashboard();
    }, [user]);

    const loadDashboard = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const role = user.role === 'ADMIN' || user.type === 'TENANT' || user.type === 'ADMIN' ? 'tenant-admin' : 'tenant-user';
            const response = await api.get(`/dashboard/${role}`);
            const d = response.data.data;
            setWidgets(d.widgets || []);
            setCharts(d.charts || []);
            setNotifications(d.notifications || []);
            setQuickActions(d.quick_actions || []);
            setEnabledModules(d.modules || []);
        } catch (e) {
            console.error("Dashboard load failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedWidgets = useMemo(() => {
        const groups: Record<string, any[]> = {};
        widgets.forEach(w => {
            const g = w.module || w.module_group || 'other';
            if (!groups[g]) groups[g] = [];
            groups[g].push(w);
        });
        return groups;
    }, [widgets]);

    const moduleKeys = Object.keys(MODULE_MAP);
    const availableShortcuts = enabledModules.filter(m => moduleKeys.includes(m));

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-4 sm:space-y-6">
                <div className="h-8 w-48 rounded-lg bg-muted/20 animate-pulse" />
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-muted/10 animate-pulse" />)}
                </div>
                <div className="h-[280px] rounded-2xl bg-muted/10 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:gap-6 p-3 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter">
                        Overview<span className="text-primary">.</span>
                    </h1>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Your business at a glance</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative">
                        <Bell className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] sm:text-xs font-bold"
                        onClick={() => router.push('/dashboard/settings')}>
                        <RefreshCw className="w-3 h-3 mr-1" /> Customize
                    </Button>
                </div>
            </div>

            {/* Notifications bar */}
            {notifications.length > 0 && (
                <div className="flex flex-col gap-2">
                    {notifications.slice(0, 3).map((n: any) => (
                        <div key={n.id}
                            className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all hover:translate-x-1"
                            style={{
                                borderColor: n.severity === 'error' ? '#ef444430' : n.severity === 'warning' ? '#f59e0b30' : '#10b98130',
                                background: n.severity === 'error' ? '#ef444405' : n.severity === 'warning' ? '#f59e0b05' : '#10b98105'
                            }}
                            onClick={() => n.link && router.push(n.link)}
                        >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: n.severity === 'error' ? '#ef444415' : '#f59e0b15' }}>
                                {n.severity === 'error'
                                    ? <AlertTriangle className="w-4 h-4 text-red-500" />
                                    : <AlertTriangle className="w-4 h-4 text-amber-500" />}
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
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {quickActions.map((a: any) => (
                        <QuickAction key={a.label} action={a} />
                    ))}
                </div>
            )}

            {/* Module Widget Sections */}
            <div className="space-y-6 sm:space-y-8">
                {Object.entries(groupedWidgets).map(([group, groupWidgets]) => (
                    <WidgetSection
                        key={group}
                        title={MODULE_MAP[group]?.label || group.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        widgets={groupWidgets}
                        hidden={hiddenSections[group] || false}
                        onToggle={() => setHiddenSections(p => ({ ...p, [group]: !p[group] }))}
                    />
                ))}
            </div>

            {/* Charts */}
            {charts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground/60">Charts & Trends</h3>
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                        {charts.map((chart: any) => (
                            <Card key={chart.key} className="border-none bg-card/30 shadow-premium">
                                <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-black tracking-tight">
                                        <BarChart3 className="w-4 h-4" style={{ color: getColor(chart.module) }} />
                                        {chart.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                                    <div className="h-[200px] sm:h-[250px] w-full flex items-center justify-center">
                                        <FlowChart data={(chart.data || []).map((d: any) => ({ ...d, name: d.date || d.name || d.period }))} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Module Shortcuts */}
            {availableShortcuts.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground/60">Modules</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
                        {availableShortcuts.map(m => (
                            <ModuleShortcut key={m} module={m} onClick={() => {
                                const info = MODULE_MAP[m];
                                if (info) router.push(info.href);
                            }} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function AlertTriangle(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}
