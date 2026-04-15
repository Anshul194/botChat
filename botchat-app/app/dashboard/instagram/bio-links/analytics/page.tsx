"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Search, Calendar, Filter } from "lucide-react";

const FlowChart = dynamic(() => import("@/app/dashboard/components/FlowChartClient"), { ssr: false, loading: () => <div className="h-[360px] flex items-center justify-center">Loading chart...</div> });
const ChannelChart = dynamic(() => import("@/app/dashboard/components/ChannelImpactChartClient"), { ssr: false, loading: () => <div className="h-[240px] flex items-center justify-center">Loading chart...</div> });

export default function BioLinksAnalyticsPage() {
    const msgTrend = useMemo(() => [
        { date: "Apr 1", ig: 340, fb: 220 },
        { date: "Apr 5", ig: 480, fb: 310 },
        { date: "Apr 10", ig: 390, fb: 280 },
        { date: "Apr 15", ig: 620, fb: 420 },
        { date: "Apr 20", ig: 580, fb: 390 },
        { date: "Apr 25", ig: 710, fb: 480 },
    ], []);

    const hourly = useMemo(() => [
        { hour: "6am", instagram: 45, facebook: 32 },
        { hour: "9am", instagram: 82, facebook: 54 },
        { hour: "12pm", instagram: 110, facebook: 88 },
        { hour: "3pm", instagram: 95, facebook: 72 },
        { hour: "6pm", instagram: 140, facebook: 110 },
        { hour: "9pm", instagram: 180, facebook: 145 },
    ], []);

    return (
        <div className="max-w-[1200px] mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Links statistics</h1>
                    <p className="text-sm text-muted-foreground mt-1">Detailed performance for your bio links — trends, top pages and visitor breakdowns</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-2 bg-muted/10 px-3 py-1 rounded-xl">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input placeholder="Search pages" className="bg-transparent outline-none text-sm" />
                    </div>
                    <button className="px-3 py-2 rounded-xl bg-white/80 border border-border shadow-sm text-sm flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Last 30d
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {['Overview','Referrers','Countries','Devices','Browsers','Languages'].map((c) => (
                    <button key={c} className="px-3 py-1.5 rounded-full text-sm bg-muted/10 hover:bg-muted/20">{c}</button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                    <button className="px-3 py-1 rounded-lg bg-muted/10 text-sm flex items-center gap-2"><Filter className="w-4 h-4"/> Filters</button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-4 flex flex-col">
                    <div className="text-xs text-muted-foreground">Total Clicks</div>
                    <div className="text-2xl font-bold">12,342</div>
                    <div className="text-[11px] text-muted-foreground mt-2">+8.4% vs last period</div>
                </Card>
                <Card className="p-4 flex flex-col">
                    <div className="text-xs text-muted-foreground">CTR</div>
                    <div className="text-2xl font-bold">4.3%</div>
                    <div className="text-[11px] text-muted-foreground mt-2">Stable</div>
                </Card>
                <Card className="p-4 flex flex-col">
                    <div className="text-xs text-muted-foreground">Unique Visitors</div>
                    <div className="text-2xl font-bold">8,112</div>
                    <div className="text-[11px] text-muted-foreground mt-2">+2.1% growth</div>
                </Card>
                <Card className="p-4 flex flex-col">
                    <div className="text-xs text-muted-foreground">Referrals</div>
                    <div className="text-2xl font-bold">1,234</div>
                    <div className="text-[11px] text-muted-foreground mt-2">Top: Instagram</div>
                </Card>
            </div>

            {/* Main charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold">Pageviews & Clicks</h2>
                            <div className="text-xs text-muted-foreground">Last 30 days</div>
                        </div>
                        <FlowChart data={msgTrend} />
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <Card className="p-4">
                            <h3 className="font-semibold mb-3">Top Countries</h3>
                            <div className="space-y-3">
                                <CountryRow name="United States" pct={34} />
                                <CountryRow name="India" pct={18} />
                                <CountryRow name="Brazil" pct={12} />
                            </div>
                        </Card>
                        <Card className="p-4">
                            <h3 className="font-semibold mb-3">Top Pages</h3>
                            <div className="space-y-3 text-sm text-muted-foreground">
                                <div>@botchatautomation <span className="float-right font-bold text-foreground">34%</span></div>
                                <div>@divyangtechlabs <span className="float-right font-bold text-foreground">18%</span></div>
                                <div>@paper5431 <span className="float-right font-bold text-foreground">12%</span></div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div>
                    <Card className="p-4 mb-4">
                        <h3 className="font-semibold mb-3">Channel Impact</h3>
                        <ChannelChart data={hourly} />
                    </Card>

                    <Card className="p-4">
                        <h3 className="font-semibold mb-3">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <StatTile label="Avg. Session" value="00:42" />
                            <StatTile label="Bounce" value="28%" />
                            <StatTile label="Conversions" value="512" />
                            <StatTile label="New Users" value="3,210" />
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="p-4">
                <h3 className="font-semibold mb-4">Detailed table</h3>
                <div className="text-sm text-muted-foreground">(Table placeholder - integrate with backend)</div>
            </Card>
        </div>
    );
}

function CountryRow({ name, pct }: { name: string; pct: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="text-sm truncate">{name}</div>
                    <div className="text-sm font-bold">{pct}%</div>
                </div>
                <div className="h-2 bg-muted/20 rounded-full mt-2 overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" />
                </div>
            </div>
        </div>
    );
}

function StatTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-2 bg-muted/10 rounded">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="font-bold text-foreground">{value}</div>
        </div>
    );
}
