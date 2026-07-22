"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuperAdminDashboardPage() {
    const [widgets, setWidgets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                const response = await api.get('/dashboard/super-admin');
                if (response.data.success) {
                    setWidgets(response.data.data.widgets);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard widgets", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWidgets();
    }, []);

    if (loading) {
        return <div className="p-6">Loading Super Admin Dashboard...</div>;
    }

    const kpiWidgets = widgets.filter(w => w.type === 'kpi');
    const chartWidgets = widgets.filter(w => w.type === 'chart');

    return (
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:gap-6 p-3 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
            
            <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {kpiWidgets.map(widget => (
                    <Card key={widget.key} className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{widget.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold tracking-tight">{widget.value}</div>
                            {widget.meta && widget.meta.change && (
                                <p className={`text-xs mt-1 ${widget.meta.up ? 'text-green-500' : 'text-red-500'}`}>
                                    {widget.meta.up ? '↑' : '↓'} {widget.meta.change}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {chartWidgets.map(widget => (
                    <Card key={widget.key} className="col-span-1 shadow-sm ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle>{widget.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] flex items-center justify-center bg-secondary/20 rounded-md">
                                <p className="text-sm text-muted-foreground">Chart visual for {widget.title} goes here</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
