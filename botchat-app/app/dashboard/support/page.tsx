"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Plus, Search, Filter, MessageSquare, Clock, AlertCircle, ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Ticket {
    id: number;
    ticket_number: string;
    subject: string;
    priority: "Low" | "Medium" | "High" | "Urgent";
    status: "Open" | "Resolved" | "Closed";
    last_reply_at: string;
    updated_at: string;
    category?: { id: number; name: string };
    user?: { id: number; name: string; email: string };
}

interface Category {
    id: number;
    name: string;
}

export default function TenantTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get("/support-categories");
            if (res.data?.success) {
                setCategories(res.data.data);
            }
        } catch { }
    }, []);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { page, per_page: 15 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category_id = categoryFilter;

            const res = await api.get("/support-tickets", { params });
            if (res.data?.success) {
                setTickets(res.data.data);
                setTotalPages(res.data.pagination?.last_page || 1);
            }
        } catch (e) {
            console.error("Failed to fetch tickets", e);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter, categoryFilter]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const getPriorityBadge = (p: string) => {
        switch (p) {
            case "Urgent": return "bg-red-500/10 text-red-600 border-red-500/20";
            case "High": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case "Medium": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
        }
    };

    const getStatusBadge = (s: string) => {
        switch (s) {
            case "Open": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "Resolved": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "Closed": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
            default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">Support Tickets</h1>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">Submit inquiries or track your technical and billing support tickets.</p>
                </div>
                <Link
                    href="/dashboard/support/create"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Create Ticket
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search ticket # or subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                    >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 flex justify-center items-center text-[var(--muted-foreground)]">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading tickets...
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-12 text-center text-[var(--muted-foreground)]">
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-bold text-sm">No support tickets found.</p>
                        <p className="text-xs mt-1">Need help? Click "Create Ticket" above.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30 text-[var(--muted-foreground)] font-bold uppercase tracking-wider text-[10px]">
                                    <th className="py-3.5 px-4">Ticket #</th>
                                    <th className="py-3.5 px-4">Subject</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4">Priority</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Updated</th>
                                    <th className="py-3.5 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {tickets.map((t) => (
                                    <tr key={t.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                                        <td className="py-3.5 px-4 font-mono font-bold text-primary">{t.ticket_number}</td>
                                        <td className="py-3.5 px-4 font-semibold text-[var(--foreground)]">{t.subject}</td>
                                        <td className="py-3.5 px-4 text-[var(--muted-foreground)]">{t.category?.name || "General"}</td>
                                        <td className="py-3.5 px-4">
                                            <span className={cn("px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider", getPriorityBadge(t.priority))}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={cn("px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider", getStatusBadge(t.status))}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-[var(--muted-foreground)] text-xs">
                                            {t.updated_at ? new Date(t.updated_at).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                            <button
                                                onClick={() => router.push(`/dashboard/support/${t.id}`)}
                                                className="px-3 py-1.5 rounded-lg border border-[var(--border)] font-bold text-xs uppercase tracking-wider hover:bg-primary hover:text-white transition-all inline-flex items-center gap-1"
                                            >
                                                View <ArrowUpRight className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
