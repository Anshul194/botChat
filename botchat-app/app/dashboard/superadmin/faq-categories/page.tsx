"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, Loader2, Search, FolderTree } from "lucide-react";
import { toast } from "sonner";

interface FaqCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    sort_order: number;
    status: "Draft" | "Published";
    faqs_count?: number;
}

export default function SuperAdminFaqCategoriesPage() {
    const [categories, setCategories] = useState<FaqCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Form Modal / Inline State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FaqCategory | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        icon: "",
        sort_order: 0,
        status: "Published" as "Draft" | "Published",
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/faq-categories", {
                params: { search, page, per_page: 15 },
            });
            if (res.data?.success) {
                setCategories(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.last_page);
                }
            }
        } catch {
            toast.error("Failed to load FAQ categories.");
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setFormData({
            name: "",
            slug: "",
            description: "",
            icon: "",
            sort_order: 0,
            status: "Published",
        });
        setIsFormOpen(true);
    };

    const handleOpenEdit = (category: FaqCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || "",
            icon: category.icon || "",
            sort_order: category.sort_order || 0,
            status: category.status || "Published",
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Category name is required.");
            return;
        }

        setSubmitting(true);
        try {
            if (editingCategory) {
                await api.put(`/faq-categories/${editingCategory.id}`, formData);
                toast.success("FAQ Category updated successfully.");
            } else {
                await api.post("/faq-categories", formData);
                toast.success("FAQ Category created successfully.");
            }
            setIsFormOpen(false);
            fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save category.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (category: FaqCategory) => {
        if (category.faqs_count && category.faqs_count > 0) {
            toast.error(`Cannot delete category with ${category.faqs_count} associated FAQs.`);
            return;
        }
        if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) return;

        try {
            await api.delete(`/faq-categories/${category.id}`);
            toast.success("FAQ Category deleted.");
            fetchCategories();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete category.");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                        <FolderTree className="w-6 h-6 text-primary" /> FAQ Categories
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                        Organize FAQs into logical categories for Landing Page & Tenant Dashboard.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all inline-flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Category
                </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search categories by name or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Category Form Drawer / Section */}
            {isFormOpen && (
                <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-primary/30 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">
                        {editingCategory ? "Edit Category" : "New Category"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Getting Started"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Slug (Auto-Generated)</label>
                            <input
                                type="text"
                                placeholder="getting-started"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Icon (Lucide / Emoji)</label>
                            <input
                                type="text"
                                placeholder="e.g. help-circle or 🚀"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Sort Order</label>
                            <input
                                type="number"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Draft" | "Published" })}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-primary"
                            >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Description</label>
                            <input
                                type="text"
                                placeholder="Brief description of this FAQ category..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setIsFormOpen(false)}
                            className="px-4 py-2 rounded-xl border border-[var(--border)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--muted)]/50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            {editingCategory ? "Update Category" : "Save Category"}
                        </button>
                    </div>
                </form>
            )}

            {/* Categories Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 flex justify-center items-center text-[var(--muted-foreground)]">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading FAQ categories...
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-12 text-center text-xs sm:text-sm text-[var(--muted-foreground)]">
                        No FAQ categories found. Click &quot;Add Category&quot; to create one.
                    </div>
                ) : (
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30 text-[var(--muted-foreground)] font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Slug</th>
                                <th className="py-3 px-4 text-center">FAQs Count</th>
                                <th className="py-3 px-4 text-center">Sort Order</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {categories.map((c) => (
                                <tr key={c.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-bold text-[var(--foreground)]">{c.name}</div>
                                        {c.description && (
                                            <div className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">{c.description}</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-xs text-[var(--muted-foreground)]">{c.slug}</td>
                                    <td className="py-3 px-4 text-center font-bold">{c.faqs_count ?? 0}</td>
                                    <td className="py-3 px-4 text-center">{c.sort_order}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                                            c.status === "Published"
                                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right space-x-1">
                                        <button
                                            onClick={() => handleOpenEdit(c)}
                                            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-primary text-[var(--muted-foreground)] hover:text-primary transition-all"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c)}
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
