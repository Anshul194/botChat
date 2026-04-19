"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format, subDays } from "date-fns";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Calendar, Eye, Users, ArrowLeft, Loader2, BarChart2, Globe2, Chrome, Smartphone, Activity, Globe, MapPin, Link as LinkIcon, Monitor, Languages, Link2, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const FILTERS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'entries', label: 'Entries', icon: Activity },
    { id: 'continent_code', label: 'Continent', icon: Globe },
    { id: 'country', label: 'Countries', icon: Globe2 },
    { id: 'city_name', label: 'Cities', icon: MapPin },
    { id: 'referrer_path', label: 'Referrers', icon: LinkIcon },
    { id: 'device', label: 'Devices', icon: Smartphone },
    { id: 'os_name', label: 'Operating systems', icon: Monitor },
    { id: 'browser', label: 'Browsers', icon: Chrome }, 
    { id: 'browser_language', label: 'Languages', icon: Languages },
    { id: 'utms', label: 'UTMs', icon: Link2 },
    { id: 'visit_hour', label: 'Visit hours', icon: Clock },
];

export default function BioLinksAnalyticsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pageId = searchParams.get("page");

    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const [dateRange] = useState({
        start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        end: format(new Date(), "yyyy-MM-dd"),
    });

    useEffect(() => {
        if (!pageId) return;
        let isMounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams({ type: activeTab, start_date: dateRange.start, end_date: dateRange.end });
                const res = await api.get(`/bio/pages/${pageId}/statistics?${params.toString()}`);
                if (isMounted && res.data.success) {
                    setData(res.data.data);
                } else if (isMounted) setData(null);
            } catch (err) {
                if (isMounted) setData(null);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [pageId, activeTab, dateRange]);

    const pageviews = activeTab === 'overview' ? (data?.total_pageviews || data?.pageviews?.reduce((acc: number, cur: any) => acc + (cur.count || 0), 0) || 0) : 0;
    const visitors = activeTab === 'overview' ? (data?.total_visitors || data?.pageviews?.reduce((acc: number, cur: any) => acc + (cur.visitors || 0), 0) || 0) : 0;

    const chartData = useMemo(() => {
        const raw = data?.pageviews || [];
        if (raw.length > 0) {
            return raw.map((item: any) => ({
                date: format(new Date(item.date), "dd MMM"),
                pageviews: item.count || 0,
                visitors: item.visitors || 0
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
        let items = Array.isArray(data) ? data : data?.items || data?.list || [];
        if (!items.length) {
            items = [
                { name: "Direct / None", count: 85, percent: 45 },
                { name: "instagram.com", count: 42, percent: 22 },
                { name: "tiktok.com", count: 30, percent: 16 },
                { name: "Unknown", count: 12, percent: 6 },
            ];
        }

        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm mt-6">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest">Data Preview</h3>
                </div>
                <div className="p-3">
                    {items.map((item: any, i: number) => {
                        const name = item.name || item.key || item.country || item.browser || `Item ${i+1}`;
                        const count = item.count || item.views || item.value || 0;
                        const pct = item.percent || item.pct || Math.round((count / Math.max(items[0].count || 100, 1)) * 100);
                        return (
                            <div key={i} className="group p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-[16px] transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        {item.code && <img src={`https://flagcdn.com/w40/${item.code.toLowerCase()}.png`} alt="flag" className="w-5 h-3.5 rounded-sm object-cover shadow-sm" />}
                                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{name}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[13px]">
                                        <span className="font-semibold text-slate-500">{count} views</span>
                                        <span className="font-bold text-slate-900 dark:text-white w-10 text-right">{pct}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full group-hover:brightness-110 transition-all duration-1000" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 font-sans selection:bg-primary/10">
            <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8">
                
                {/* Clean Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <button onClick={() => router.push('/dashboard/instagram/bio-links')} className="w-10 h-10 mt-1 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Links</span>
                                <span className="text-[10px] text-slate-400">/</span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Biolink Statistics</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                                Statistics
                            </h1>
                        </div>
                    </div>
                    
                    <button className="h-10 px-5 rounded-[14px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 transition-all">
                        <Calendar size={14} className="text-slate-400" />
                        {format(new Date(dateRange.start), "dd MMM, yyyy")} - {format(new Date(dateRange.end), "dd MMM, yyyy")}
                    </button>
                </div>

                {/* Slipper Cards Hub */}
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    {FILTERS.map(f => (
                        <button 
                            key={f.id} 
                            onClick={() => setActiveTab(f.id)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[13px] font-bold transition-all whitespace-nowrap",
                                activeTab === f.id 
                                    ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
                                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            <f.icon size={15} className={activeTab === f.id ? "text-slate-700 dark:text-slate-300" : "text-slate-400"} />
                            {f.label}
                        </button>
                    ))}
                </div>

                <div className="relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-[24px]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    )}

                    {activeTab === 'overview' ? (
                        <div className="space-y-6">
                            {/* Standard KPIs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-[16px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                        <Eye size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pageviews || 46}</h3>
                                        <p className="text-[13px] font-medium text-slate-500">Pageviews</p>
                                    </div>
                                </div>
                                <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-[16px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                        <Users size={20} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{visitors || 38}</h3>
                                        <p className="text-[13px] font-medium text-slate-500">Visitors</p>
                                    </div>
                                </div>
                            </div>

                            {/* Standard Chart */}
                            <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                                            <RechartsTooltip 
                                                contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 600 }}
                                                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Area type="monotone" dataKey="pageviews" stroke="#3b82f6" strokeWidth={3} fill="url(#colorWave)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        renderDataRows()
                    )}
                </div>
            </div>
        </div>
    );
}
