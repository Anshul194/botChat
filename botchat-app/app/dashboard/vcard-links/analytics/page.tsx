"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, subDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, Eye, Users, ArrowLeft, Loader2, BarChart2, Globe2, Chrome, Smartphone, Activity, Globe, MapPin, Link as LinkIcon, Monitor, Languages, Link2, Clock, TrendingUp, TrendingDown, Zap, ChevronLeft, ChevronRight, X } from "lucide-react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchVcardStatistics } from "@/store/slices/vcardsSlice";

const FILTERS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'entries', label: 'Entries', icon: Activity },
    { id: 'continent_code', label: 'Continent', icon: Globe },
    { id: 'country', label: 'Countries', icon: Globe2 },
    { id: 'city_name', label: 'Cities', icon: MapPin },
    { id: 'referrer_host', label: 'Referrers', icon: LinkIcon },
    { id: 'device', label: 'Devices', icon: Smartphone },
    { id: 'os', label: 'Operating systems', icon: Monitor },
    { id: 'browser', label: 'Browsers', icon: Chrome },
    { id: 'language', label: 'Languages', icon: Languages },
    { id: 'utm_source', label: 'UTMs', icon: Link2 },
    { id: 'hour', label: 'Visit hours', icon: Clock },
];

/* ─── Quick Preset Ranges ──────────────────────────────────── */
const PRESETS = [
    { label: 'Last 7 days',  start: () => subDays(new Date(), 6),  end: () => new Date() },
    { label: 'Last 14 days', start: () => subDays(new Date(), 13), end: () => new Date() },
    { label: 'Last 30 days', start: () => subDays(new Date(), 29), end: () => new Date() },
    { label: 'Last 90 days', start: () => subDays(new Date(), 89), end: () => new Date() },
];

/* ─── DateRangePicker ────────────────────────────────────────── */
function DateRangePicker({ value, onChange }: {
    value: { start: string; end: string };
    onChange: (range: { start: string; end: string }) => void;
}) {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(startOfMonth(new Date()));
    const [hoverDay, setHoverDay] = useState<Date | null>(null);
    const [picking, setPicking] = useState<{ start: Date } | null>(null); // mid-selection
    const ref = useRef<HTMLDivElement>(null);

    const selectedStart = startOfDay(new Date(value.start));
    const selectedEnd   = startOfDay(new Date(value.end));

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
    // leading empty cells
    const startWeekday = startOfMonth(month).getDay(); // 0=Sun

    const isInRange = (day: Date) => {
        if (picking) {
            const rangeEnd = hoverDay || picking.start;
            const [a, b] = picking.start <= rangeEnd ? [picking.start, rangeEnd] : [rangeEnd, picking.start];
            return isWithinInterval(day, { start: a, end: b });
        }
        return isWithinInterval(day, { start: selectedStart, end: selectedEnd });
    };
    const isStart = (day: Date) => picking ? isSameDay(day, picking.start) : isSameDay(day, selectedStart);
    const isEnd   = (day: Date) => {
        if (picking) return hoverDay ? isSameDay(day, hoverDay) : isSameDay(day, picking.start);
        return isSameDay(day, selectedEnd);
    };

    const handleDayClick = (day: Date) => {
        if (!picking) {
            setPicking({ start: day });
        } else {
            const [a, b] = picking.start <= day ? [picking.start, day] : [day, picking.start];
            onChange({ start: format(a, 'yyyy-MM-dd'), end: format(b, 'yyyy-MM-dd') });
            setPicking(null);
            setOpen(false);
        }
    };

    const applyPreset = (preset: typeof PRESETS[0]) => {
        onChange({ start: format(preset.start(), 'yyyy-MM-dd'), end: format(preset.end(), 'yyyy-MM-dd') });
        setOpen(false);
        setPicking(null);
    };

    const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                onClick={() => setOpen(v => !v)}
                className="h-14 px-8 rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl flex items-center gap-3 text-[12px] font-black uppercase tracking-widest text-[var(--foreground)] shadow-sm hover:shadow-md hover:bg-[var(--card)] transition-all"
            >
                <Calendar size={18} className="text-primary" />
                {format(new Date(value.start), 'dd MMM, yyyy')} – {format(new Date(value.end), 'dd MMM, yyyy')}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-[500] bg-[var(--card)] border border-[var(--border)] rounded-[2rem] shadow-[0_32px_80px_rgba(0,0,0,0.2)] w-[340px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-3">
                        <button onClick={() => setMonth(m => addMonths(m, -1))} className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest">
                            {format(month, 'MMMM yyyy')}
                        </span>
                        <button onClick={() => setMonth(m => addMonths(m, 1))} className="w-9 h-9 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Weekday labels */}
                    <div className="grid grid-cols-7 px-4 mb-1">
                        {WEEK.map(w => (
                            <div key={w} className="text-center text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] py-1">{w}</div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="grid grid-cols-7 px-4 pb-4 gap-y-1">
                        {/* Leading empty cells */}
                        {Array.from({ length: startWeekday }).map((_, i) => <div key={`e${i}`} />)}
                        {days.map(day => {
                            const inRange = isInRange(day);
                            const start   = isStart(day);
                            const end     = isEnd(day);
                            const today   = isSameDay(day, new Date());
                            return (
                                <button
                                    key={day.toISOString()}
                                    onMouseEnter={() => picking && setHoverDay(day)}
                                    onMouseLeave={() => picking && setHoverDay(null)}
                                    onClick={() => handleDayClick(day)}
                                    className={cn(
                                        "h-9 w-full text-[13px] font-bold transition-all duration-150 relative flex items-center justify-center",
                                        inRange && !start && !end && "bg-primary/10 text-primary rounded-none",
                                        start && "bg-primary text-primary-foreground rounded-l-xl shadow-md shadow-primary/20",
                                        end   && !start && "bg-primary text-primary-foreground rounded-r-xl shadow-md shadow-primary/20",
                                        start && end && "rounded-xl",
                                        !inRange && !start && !end && "text-[var(--foreground)] hover:bg-[var(--background)] rounded-xl",
                                        today && !start && !end && !inRange && "ring-1 ring-primary/40 rounded-xl"
                                    )}
                                >
                                    {format(day, 'd')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    <div className="mx-4 border-t border-[var(--border)]" />

                    {/* Preset chips */}
                    <div className="px-4 py-4 flex flex-wrap gap-2">
                        {PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => applyPreset(p)}
                                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-[11px] font-black uppercase tracking-wider text-[var(--muted-foreground)] hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Cancel mid-pick hint */}
                    {picking && (
                        <div className="px-5 pb-4 flex items-center justify-between">
                            <span className="text-[11px] text-primary font-bold animate-pulse">Click end date…</span>
                            <button onClick={() => setPicking(null)} className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] flex items-center gap-1 hover:text-rose-500 transition-colors">
                                <X size={12} /> Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Custom Tooltip ─────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-4 shadow-2xl min-w-[160px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-3">{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between gap-6 mb-1.5 last:mb-0">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.stroke }} />
                        <span className="text-[11px] font-bold text-[var(--muted-foreground)] capitalize">{p.name}</span>
                    </div>
                    <span className="text-sm font-black text-[var(--foreground)]">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ─── Unique Stat Card ───────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, gradient, trend, trendVal, delay = 0 }: any) => (
    <div
        className="relative bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-6 overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Ambient blob */}
        <div className={cn("absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500", color)} />

        {/* Top row */}
        <div className="flex items-start justify-between mb-6 relative z-10">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", gradient)}>
                <Icon size={20} />
            </div>
            {trend !== undefined && (
                <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    trend >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}>
                    {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(trendVal || trend)}%
                </div>
            )}
        </div>

        {/* Value */}
        <div className="relative z-10">
            <p className="text-4xl font-black tracking-tight text-[var(--foreground)] leading-none mb-2">{value}</p>
            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{label}</p>
        </div>

        {/* Bottom decorative bar */}
        <div className={cn("absolute bottom-0 left-0 right-0 h-1 opacity-60", gradient)} />
    </div>
);

function VcardLinksAnalyticsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const pageId = searchParams.get("page");

    const { data, isLoading } = useAppSelector((s: any) => s.vcards.statistics);
    const [activeTab, setActiveTab] = useState("overview");
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);

    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        end: format(new Date(), "yyyy-MM-dd"),
    });

    useEffect(() => {
        if (!pageId) return;
        dispatch(fetchVcardStatistics({ vcardId: pageId, type: activeTab, start_date: dateRange.start, end_date: dateRange.end }));
    }, [dispatch, pageId, activeTab, dateRange]);

    const pageviews = activeTab === 'overview' ? (data?.totals?.pageviews || 0) : 0;
    const visitors = activeTab === 'overview' ? (data?.totals?.visitors || 0) : 0;
    const avgPerDay = useMemo(() => {
        const raw = data?.chart || [];
        return raw.length > 0 ? Math.round(pageviews / raw.length) : 0;
    }, [data, pageviews]);
    const visitorRate = pageviews > 0 ? Math.round((visitors / pageviews) * 100) : 0;

    const chartData = useMemo(() => {
        const raw = data?.chart || [];
        if (raw.length > 0) {
            return raw.map((item: any) => ({
                date: format(new Date(item.date), "dd MMM"),
                pageviews: item.pageviews || 0,
                visitors: item.visitors || 0,
            }));
        }
        return [
            { date: "15 Apr", pageviews: 11, visitors: 4 },
            { date: "16 Apr", pageviews: 9, visitors: 3 },
            { date: "17 Apr", pageviews: 13, visitors: 8 },
            { date: "18 Apr", pageviews: 3, visitors: 1 },
            { date: "19 Apr", pageviews: 10, visitors: 6 },
        ];
    }, [data]);

    const renderDataRows = () => {
        let items: any[] = [];
        if (data?.rows) items = data.rows;
        else if (activeTab === 'entries') items = data?.rows || data?.latest || [];
        else if (data?.statistics?.[activeTab]) {
            const stats = data.statistics[activeTab];
            items = Object.keys(stats).map(key => ({ name: key || 'Unknown', count: stats[key] })).sort((a, b) => b.count - a.count);
        } else if (Array.isArray(data)) items = data;
        else if (data?.items || data?.list) items = data.items || data.list;

        const totalSum = data?.total_sum || items.reduce((acc: number, item: any) => acc + parseInt(item.total || item.count || item.views || 1, 10), 0);

        const PALETTE = ["bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-teal-500"];

        return (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">{FILTERS.find(f => f.id === activeTab)?.label || 'Data Breakdown'}</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-right">Metrics</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={2} className="p-12 text-center text-[var(--muted-foreground)] font-bold text-sm uppercase tracking-widest">No data available for this period.</td></tr>
                        ) : items.map((item: any, i: number) => {
                            let name: any = 'Unknown';
                            if (item.value !== undefined) name = item.value;
                            else if (activeTab === 'country') name = item.country_code;
                            else if (activeTab === 'city_name') name = item.city_name;
                            else if (activeTab === 'hour') name = item.hour !== undefined && item.hour !== null ? `${item.hour}:00` : null;
                            else name = item[activeTab] || item.name || item.key;
                            
                            if (name === null || name === undefined || name === '') name = 'Unknown';

                            let subtext = "";
                            let count = parseInt(item.total || item.count || item.views || 1, 10);
                            if (activeTab === 'entries') {
                                name = item.city_name ? `${item.city_name}, ${item.country_code}` : item.country_code || 'Unknown Location';
                                subtext = `${item.browser_name || 'Unknown'} on ${item.os_name || 'Unknown'} (${item.device_type || 'Unknown'})`;
                                count = 1;
                            }
                            const pct = item.percent || item.pct || Math.round((count / Math.max(totalSum, 1)) * 100);
                            const countryCode = item.country_code || item.code || (activeTab === 'country' && name !== 'Unknown' && name.length === 2 ? name : null);
                            const barColor = PALETTE[i % PALETTE.length];

                            return (
                                <tr key={i} className="group hover:bg-primary/[0.02] transition-colors border-b border-[var(--border)]/50 last:border-none">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            {countryCode && countryCode !== 'Direct / None' ? (
                                                <div className="w-14 h-14 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                                    <img src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`} alt="flag" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                </div>
                                            ) : (
                                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 text-sm font-black shadow-lg transition-all duration-500 group-hover:scale-110", barColor)}>
                                                    {name.slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-base truncate group-hover:text-primary transition-colors leading-tight">{name}</p>
                                                {subtext && (
                                                    <p className="text-[11px] text-[var(--muted-foreground)] font-bold flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity mt-1">
                                                        {subtext} • {item.datetime ? format(new Date(item.datetime), "dd MMM, HH:mm") : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col items-end gap-2">
                                            {activeTab !== 'entries' && (
                                                <>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-[var(--foreground)]">{pct}%</span>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tighter bg-[var(--background)] text-primary">
                                                            {count} views
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 w-48">
                                                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                            <div className={cn("h-full rounded-full transition-all duration-1000 group-hover:brightness-110", barColor)} style={{ width: `${pct}%` }} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 relative overflow-hidden">
            {/* Decorative Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-full space-y-8 relative z-10 p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => router.push('/dashboard/vcard-links')} className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10 hover:scale-[1.02] transition-transform">
                                <ArrowLeft size={24} />
                            </button>
                            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                Vcard Link Statistics
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Traffic Overview</h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-xl">
                                Detailed breakdown of views, visitors, and engagement for your vcard link.
                            </p>
                        </div>
                    </div>
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>

                {/* Scrollable Filter Bar */}
                <div className="flex overflow-x-auto pb-2 hide-scrollbar">
                    <div className="h-16 rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl flex items-center px-4 shadow-sm min-w-max gap-2">
                        {FILTERS.map(f => (
                            <button key={f.id} onClick={() => setActiveTab(f.id)}
                                className={cn("px-4 py-2 rounded-xl transition-all flex items-center gap-2",
                                    activeTab === f.id ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                                )}
                            >
                                <f.icon className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-wider">{f.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)]/60 backdrop-blur-sm rounded-[2.5rem] gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)] animate-pulse">Scanning data...</p>
                        </div>
                    )}

                    {activeTab === 'overview' ? (
                        <div className="space-y-6">

                            {/* ── KPI CARDS — split layout ─────────────────────────── */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* LEFT: two stacked mini cards */}
                                <div className="flex flex-col gap-6">
                                    <StatCard
                                        label="Total Pageviews"
                                        value={pageviews.toLocaleString()}
                                        icon={Eye}
                                        color="bg-blue-500"
                                        gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                                        trend={12}
                                        trendVal={12}
                                    />
                                    <StatCard
                                        label="Unique Visitors"
                                        value={visitors.toLocaleString()}
                                        icon={Users}
                                        color="bg-indigo-500"
                                        gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
                                        trend={8}
                                        trendVal={8}
                                        delay={80}
                                    />
                                </div>

                                {/* CENTER: large radial donut card */}
                                <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-[2rem] p-6 overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col items-center justify-center">
                                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity bg-primary" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Visitor Rate</p>
                                    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
                                        <ResponsiveContainer width={160} height={160}>
                                            <RadialBarChart
                                                cx="50%" cy="50%"
                                                innerRadius="70%" outerRadius="100%"
                                                startAngle={90} endAngle={90 - (visitorRate / 100) * 360}
                                                data={[{ value: visitorRate, fill: "url(#radialGrad)" }]}
                                            >
                                                <defs>
                                                    <linearGradient id="radialGrad" x1="0" y1="0" x2="1" y2="1">
                                                        <stop offset="0%" stopColor="#6366f1" />
                                                        <stop offset="100%" stopColor="#ec4899" />
                                                    </linearGradient>
                                                </defs>
                                                <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "var(--border)" }} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-[var(--foreground)]">{visitorRate}%</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">rate</span>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-[var(--muted-foreground)] mt-4 text-center">Visitors / Pageviews ratio</p>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 opacity-60" />
                                </div>

                                {/* RIGHT: two stacked mini cards */}
                                <div className="flex flex-col gap-6">
                                    <StatCard
                                        label="Avg Views / Day"
                                        value={avgPerDay.toLocaleString()}
                                        icon={Activity}
                                        color="bg-rose-500"
                                        gradient="bg-gradient-to-br from-rose-500 to-orange-500"
                                        delay={160}
                                    />
                                    <StatCard
                                        label="Days Tracked"
                                        value={chartData.length}
                                        icon={Zap}
                                        color="bg-emerald-500"
                                        gradient="bg-gradient-to-br from-emerald-500 to-teal-500"
                                        delay={240}
                                    />
                                </div>
                            </div>

                            {/* ── COMPOSED CHART ───────────────────────────────────── */}
                            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
                                {/* Top ambient glow */}
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                                {/* Chart header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-base font-black text-[var(--foreground)] tracking-tight">Traffic Trends</h3>
                                        <p className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest mt-0.5">Last 30 days</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Pageviews</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 border-dashed" style={{ borderBottom: '2px dashed' }} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Visitors</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[340px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="gVisitors" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                                <filter id="glow">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '6 3' }} />
                                            <Area
                                                type="monotoneX"
                                                dataKey="pageviews"
                                                name="Pageviews"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fill="url(#gViews)"
                                                activeDot={{ r: 7, strokeWidth: 3, stroke: '#fff', fill: '#3b82f6', filter: 'url(#glow)' }}
                                            />
                                            <Line
                                                type="monotoneX"
                                                dataKey="visitors"
                                                name="Visitors"
                                                stroke="#6366f1"
                                                strokeWidth={2.5}
                                                strokeDasharray="6 3"
                                                dot={false}
                                                activeDot={{ r: 7, strokeWidth: 3, stroke: '#fff', fill: '#6366f1', filter: 'url(#glow)' }}
                                            />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderDataRows()
                    )}
                </div>
            </div>

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

export default function VcardLinksAnalyticsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <VcardLinksAnalyticsContent />
        </Suspense>
    );
}
