"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, Loader2, Search, HelpCircle, Star, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface FaqCategory {
    id: number;
    name: string;
}

interface FaqItem {
    id: number;
    category_id: number;
    question: string;
    slug: string;
    answer: string;
    display_location: "landing" | "tenant" | "both";
    status: "Draft" | "Published";
    is_featured: boolean;
    sort_order: number;
    updated_at: string;
    category?: FaqCategory;
}

export default function SuperAdminFaqListPage() {
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [categories, setCategories] = useState<FaqCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get("/faq-categories", { params: { paginate: false } });
            if (res.data?.success) setCategories(res.data.data);
        } catch { }
    }, []);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/faqs", {
                params: {
                    search,
                    category_id: selectedCategory,
                    status: selectedStatus,
                    display_location: selectedLocation,
                    page,
                    per_page: 15,
                },
            });
            if (res.data?.success) {
                setFaqs(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.last_page);
                }
            }
        } catch {
            toast.error("Failed to load FAQs.");
        } finally {
            setLoading(false);
        }
    }, [search, selectedCategory, selectedStatus, selectedLocation, page]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const handleDelete = async (faq: FaqItem) => {
        if (!confirm(`Delete FAQ "${faq.question}"?`)) return;
        try {
            await api.delete(`/faqs/${faq.id}`);
            toast.success("FAQ deleted successfully.");
            fetchFaqs();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete FAQ.");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-primary" /> FAQ Management
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                        Create and manage FAQs displayed across Landing Website & Tenant Dashboard.
                    </p>
                </div>
                <Link
                    href="/dashboard/superadmin/faqs/create"
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create FAQ
                </Link>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                        <input
                            type="text"
                            placeholder="Search question, answer..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-primary"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-primary"
                    >
                        <option value="">All Statuses</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                    <select
                        value={selectedLocation}
                        onChange={(e) => { setSelectedLocation(e.target.value); setPage(1); }}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-primary"
                    >
                        <option value="">All Locations</option>
                        <option value="landing">Landing Only</option>
                        <option value="tenant">Tenant Dashboard Only</option>
                        <option value="both">Both (Landing + Tenant)</option>
                    </select>
                </div>
            </div>

            {/* FAQs Data Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 flex justify-center items-center text-[var(--muted-foreground)]">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading FAQs...
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="p-12 text-center text-xs sm:text-sm text-[var(--muted-foreground)]">
                        No FAQs found matching your criteria.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30 text-[var(--muted-foreground)] font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">Question</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4 text-center">Location</th>
                                <th className="py-3 px-4 text-center">Featured</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center">Sort Order</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {faqs.map((f) => (
                                <tr key={f.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                                    <td className="py-3.5 px-4 max-w-md">
                                        <div className="font-bold text-[var(--foreground)] line-clamp-1">{f.question}</div>
                                        <div className="font-mono text-[11px] text-[var(--muted-foreground)]">{f.slug}</div>
                                    </td>
                                    <td className="py-3.5 px-4 font-semibold text-[var(--foreground)]">
                                        {f.category?.name || "General"}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-600">
                                            {f.display_location}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        {f.is_featured ? (
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 mx-auto" />
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                                            f.status === "Published"
                                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                        }`}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-mono text-xs">{f.sort_order}</td>
                                    <td className="py-3.5 px-4 text-right space-x-1">
                                        <Link
                                            href={`/dashboard/superadmin/faqs/${f.id}/edit`}
                                            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-primary text-[var(--muted-foreground)] hover:text-primary transition-all inline-block"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(f)}
                                            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-red-500 text-[var(--muted-foreground)] hover:text-red-500 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
