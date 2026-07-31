"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMyPlan } from "@/store/slices/plansSlice";
import api from "@/lib/api";
import dynamic from "next/dynamic";
import {
    MessageSquare, Users, TrendingUp, ArrowUpRight, ArrowDownRight,
    Bot, Instagram, Facebook, Send, Activity, BarChart3,
    Sparkles, CreditCard, Settings, RefreshCw,
    ChevronRight, EyeOff, BookOpen,
    Database, HelpCircle, Shield, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const FlowChart = dynamic(() => import("./components/FlowChartComponent"), {
    ssr: false,
    loading: () => <div className="h-[280px] sm:h-[380px] w-full flex items-center justify-center text-xs text-foreground/50">Loading chart...</div>,
});

const MODULE_MAP: Record<string, { label: string; icon: typeof MessageSquare; href: string; color: string }> = {
    smart_inbox: { label: "Smart Inbox", icon: MessageSquare, href: "/social/smart-inbox", color: "#6C5CE7" },
    broadcast: { label: "Broadcast", icon: Send, href: "/broadcasts", color: "#06b6d4" },
    automation: { label: "Automation", icon: Bot, href: "/automations", color: "#10b981" },
    ai: { label: "AI Agent", icon: Sparkles, href: "/ai-training", color: "#f59e0b" },
    ai_knowledge: { label: "Knowledge Base", icon: BookOpen, href: "/ai-training", color: "#8b5cf6" },
    social_posting: { label: "Social Posting", icon: Instagram, href: "/posts/studio", color: "#db2777" },
    subscribers: { label: "Subscribers", icon: Users, href: "/dashboard/users", color: "#0ea5e9" },
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
    const color = getColor(widget.module);
    return (
        <div onClick={() => router.push(es.link)}
            className="group relative flex flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[160px] cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            style={{ borderColor: `${color}20`, background: `linear-gradient(135deg, ${color}05, transparent)` }}
        >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }} />
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: `${color}15` }}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
            </div>
            <p className="relative text-xs sm:text-sm font-bold mb-1">{es.action}</p>
            <p className="relative text-[10px] sm:text-xs font-medium text-foreground/50">Get started with {widget.module?.replace('_', ' ')}</p>
        </div>
    );
}

function KpiCard({ widget }: { widget: any }) {
    const Icon = getIcon(widget.module || widget.module_group);
    const color = getColor(widget.module || widget.module_group);
    const hasChange = widget.meta?.change;
    const router = useRouter();

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl border border-white/5 bg-card/50 backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            widget.action && "cursor-pointer"
        )}
            onClick={() => widget.action && router.push(widget.action.link)}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top right, ${color}15, transparent 70%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
            <div className="relative p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-foreground/60">
                        {widget.title}
                    </span>
                    <div className="rounded-xl p-1.5 sm:p-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]"
                        style={{ background: `${color}15` }}>
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color }} />
                    </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">{widget.value}</span>
                </div>
                {hasChange && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className={cn(
                            "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold",
                            widget.meta.up !== false
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                        )}>
                            {widget.meta.up !== false
                                ? <ArrowUpRight className="w-3 h-3" />
                                : <ArrowDownRight className="w-3 h-3" />}
                            {widget.meta.change}
                        </span>
                        <span className="text-[10px] text-foreground/50 font-medium">vs last period</span>
                    </div>
                )}
                {widget.meta?.percent !== undefined && (
                    <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(widget.meta.percent, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                    </div>
                )}
                {widget.action && (
                    <div className="mt-3 text-[11px] sm:text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ color }}>
                        {widget.action.label} <ChevronRight className="w-3 h-3" />
                    </div>
                )}
            </div>
        </div>
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
            <div className="flex items-center gap-3">
                <div className="h-3 w-0.5 rounded-full bg-primary/40" />
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-foreground/70">{title}</h3>
                <div className="flex-1 h-px bg-border/30" />
                <button onClick={onToggle} className="p-1 rounded-lg hover:bg-muted/20 transition-colors shrink-0">
                    <EyeOff className="w-3 h-3 text-foreground/40" />
                </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            className="group relative flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-white/5 bg-card/30 backdrop-blur-sm transition-all duration-200 hover:bg-card/60 hover:border-white/10 hover:shadow-lg text-left min-w-0 overflow-hidden"
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 30% 50%, ${info.color}08, transparent 70%)` }} />
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${info.color}15` }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: info.color }} />
            </div>
            <div className="relative flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold truncate text-foreground/80 group-hover:text-foreground transition-colors">{info.label}</p>
            </div>
            <ChevronRight className="relative w-3.5 h-3.5 text-foreground/30 shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/60" />
        </button>
    );
}

function QuickAction({ action }: { action: any }) {
    const router = useRouter();
    const color = getColor(action.icon || '');
    const Icon = KPI_ICONS[action.icon] || Activity;
    return (
        <button onClick={() => router.push(action.link)}
            className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/5 bg-card/40 backdrop-blur-sm text-xs font-bold whitespace-nowrap transition-all duration-200 hover:bg-card/70 hover:border-white/10 hover:shadow-md shrink-0"
        >
            <Icon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" style={{ color }} />
            {action.label}
        </button>
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
            const redirectItem = (item: any) => {
                const text = (item.label || item.link || '').toLowerCase();
                if (text.includes('smart') && text.includes('inbox')) return { ...item, link: '/social/smart-inbox' };
                if (text.includes('inbox')) return { ...item, link: '/social/smart-inbox' };
                if ((text.includes('upgrade') && text.includes('plan')) || text === 'upgrade plan') return { ...item, link: '/dashboard/billing' };
                return item;
            };
            setWidgets((d.widgets || []).map((w: any) => ({
                ...w,
                action: w.action ? redirectItem(w.action) : w.action,
            })));
            setCharts(d.charts || []);
            setNotifications(d.notifications || []);
            setQuickActions((d.quick_actions || []).map(redirectItem));
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

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    if (isLoading) {
        return (
            <div className="mx-auto max-w-[1400px] p-3 sm:p-6 space-y-5 sm:space-y-7">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted/10 animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-5 w-40 rounded-lg bg-muted/20 animate-pulse" />
                        <div className="h-3 w-24 rounded-lg bg-muted/10 animate-pulse" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-muted/10 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 shimmer" />
                    </div>)}
                </div>
                <div className="h-[200px] sm:h-[280px] rounded-2xl bg-muted/10 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 shimmer" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 sm:gap-7 p-3 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative shrink-0">
                        <Avatar className="w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                            <AvatarImage src={user?.profile_picture_url} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-bold text-sm sm:text-base">
                                {(user?.name || user?.email || 'U')[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight truncate">
                            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">Here&apos;s what&apos;s happening with your business</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <Button variant="outline" size="sm" className="rounded-xl text-[11px] font-bold h-9 px-3 sm:px-4 border-white/5 bg-card/40 backdrop-blur-sm hover:bg-card/70"
                        onClick={() => router.push('/dashboard/settings')}>
                        <RefreshCw className="w-3 h-3 mr-1.5" /> Customize
                    </Button>
                </div>
            </div>

            {/* Notifications bar */}
            {notifications.length > 0 && (
                <div className="flex flex-col gap-2">
                    {notifications.slice(0, 3).map((n: any, idx: number) => (
                        <div key={n.id}
                            className="group relative flex items-center gap-3 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-200 hover:translate-x-1 overflow-hidden"
                            style={{
                                borderColor: n.severity === 'error' ? 'rgba(239,68,68,0.15)' : n.severity === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                                background: n.severity === 'error' ? 'linear-gradient(135deg, rgba(239,68,68,0.04), transparent)' : n.severity === 'warning' ? 'linear-gradient(135deg, rgba(245,158,11,0.04), transparent)' : 'linear-gradient(135deg, rgba(16,185,129,0.04), transparent)'
                            }}
                            onClick={() => n.link && router.push(n.link)}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-60"
                                style={{ background: n.severity === 'error' ? '#ef4444' : n.severity === 'warning' ? '#f59e0b' : '#10b981' }} />
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                                style={{ background: n.severity === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)' }}>
                                {n.severity === 'error'
                                    ? <AlertTriangle className="w-4 h-4 text-red-400" />
                                    : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate text-foreground/90">{n.title}</p>
                                <p className="text-[11px] font-medium text-foreground/60 line-clamp-1">{n.message}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-foreground/40 shrink-0">{timeAgo(n.created_at)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            {quickActions.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mr-1 shrink-0">Jump to</span>
                    <div className="h-4 w-px bg-border/20 shrink-0" />
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
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-0.5 rounded-full bg-primary/40" />
                        <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-foreground/70">Charts & Trends</h3>
                        <div className="flex-1 h-px bg-border/30" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                        {charts.map((chart: any) => (
                            <div key={chart.key} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card/30 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: `linear-gradient(90deg, transparent, ${getColor(chart.module)}40, transparent)` }} />
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center gap-2.5 mb-4">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                            style={{ background: `${getColor(chart.module)}12` }}>
                                            <BarChart3 className="w-4 h-4" style={{ color: getColor(chart.module) }} />
                                        </div>
                                        <h4 className="text-sm sm:text-base font-bold tracking-tight">{chart.title}</h4>
                                    </div>
                                    <div className="h-[200px] sm:h-[250px] w-full">
                                        <FlowChart data={(chart.data || []).map((d: any) => ({ ...d, name: d.date || d.name || d.period }))} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Module Shortcuts */}
            {availableShortcuts.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-0.5 rounded-full bg-primary/40" />
                        <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.15em] text-foreground/70">All Modules</h3>
                        <div className="flex-1 h-px bg-border/30" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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
