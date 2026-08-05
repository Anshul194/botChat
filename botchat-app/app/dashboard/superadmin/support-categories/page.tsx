"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Plus, Edit2, Trash2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Category {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    sort_order: number;
}

export default function SupportCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/support-categories");
            if (res.data?.success) setCategories(res.data.data);
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/support-categories/${editingId}`, { name, description });
            } else {
                await api.post("/support-categories", { name, description });
            }
            setName("");
            setDescription("");
            setEditingId(null);
            fetchCategories();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to save category.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (c: Category) => {
        setEditingId(c.id);
        setName(c.name);
        setDescription(c.description || "");
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this category?")) return;
        try {
            await api.delete(`/support-categories/${id}`);
            fetchCategories();
        } catch {
            alert("Failed to delete category.");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <Link
                href="/dashboard/superadmin/tickets"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Global Tickets
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">Support Categories</h1>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">Manage ticket categories selectable by tenants.</p>
                </div>
            </div>

            {/* Category Form */}
            <form onSubmit={handleSave} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">
                    {editingId ? "Edit Category" : "Add New Category"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Category Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Technical Issue"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Description</label>
                        <input
                            type="text"
                            placeholder="Brief description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={saving || !name.trim()}
                        className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        {editingId ? "Update" : "Add Category"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => { setEditingId(null); setName(""); setDescription(""); }}
                            className="px-4 py-2 rounded-xl border border-[var(--border)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--muted)]/50 transition-all"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Categories Table */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 flex justify-center text-[var(--muted-foreground)]">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading categories...
                    </div>
                ) : (
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30 text-[var(--muted-foreground)] font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Description</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {categories.map((c) => (
                                <tr key={c.id} className="hover:bg-[var(--muted)]/20 transition-colors">
                                    <td className="py-3 px-4 font-bold text-[var(--foreground)]">{c.name}</td>
                                    <td className="py-3 px-4 text-[var(--muted-foreground)]">{c.description || "-"}</td>
                                    <td className="py-3 px-4 text-right space-x-1">
                                        <button
                                            onClick={() => handleEdit(c)}
                                            className="p-1.5 rounded-lg border border-[var(--border)] hover:border-primary text-[var(--muted-foreground)] hover:text-primary transition-all"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(c.id)}
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
