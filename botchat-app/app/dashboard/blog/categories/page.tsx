"use client";

import React, { useState, useEffect } from "react";
import {
    Plus, Search, Edit3, Trash2,
    Layers, Grid, MoreVertical,
    ChevronLeft, Image as ImageIcon,
    Activity, ArrowUpDown, Layout
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Category {
    id: number;
    name: string;
    description: string;
    image?: string;
    image_url?: string;
    status: number;
    sort_order: number;
    blogs_count?: number;
}

export default function BlogCategoriesPage() {
    const pathname = usePathname();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<'row' | 'card'>('card');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sortOrder, setSortOrder] = useState(0);
    const [image, setImage] = useState<File | null>(null);
    const [imagePrev, setImagePrev] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get("/blog-categories", {
                params: { search }
            });
            if (res.data.success || res.data.is_success) {
                setCategories(res.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [search]);

    const openCreateModal = () => {
        setEditingCategory(null);
        setName("");
        setDescription("");
        setSortOrder(0);
        setImage(null);
        setImagePrev("");
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategory(cat);
        setName(cat.name);
        setDescription(cat.description || "");
        setSortOrder(cat.sort_order);
        setImage(null);
        setImagePrev(cat.image_url || cat.image || "");
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePrev(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("sort_order", sortOrder.toString());
        if (image) formData.append("image", image);
        if (editingCategory) formData.append("_method", "PATCH");

        try {
            const url = editingCategory ? `/blog-categories/${editingCategory.id}` : "/blog-categories";
            const res = await api.post(url, formData);
            if (res.data.success || res.data.is_success) {
                toast.success(editingCategory ? "Category updated" : "Category created");
                setIsModalOpen(false);
                fetchCategories();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setActionLoading(false);
        }
    };

    const deleteCategory = async (id: number) => {
        if (!confirm("Are you sure? This may affect blogs assigned to this category.")) return;
        try {
            const res = await api.delete(`/blog-categories/${id}`);
            if (res.data.success || res.data.is_success) {
                toast.success("Category deleted");
                fetchCategories();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/blog" className="p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors shadow-sm">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Editorial Hub</h1>
                        <div className="flex items-center gap-6 mt-4">
                            <Link
                                href="/dashboard/blog"
                                className={`pb-2 text-sm font-black uppercase tracking-[0.2em] transition-all border-b-4 ${pathname === '/dashboard/blog' ? 'border-black text-black' : 'border-transparent text-[var(--muted-foreground)]/70 hover:text-[var(--muted-foreground)]'
                                    }`}
                            >
                                All Posts
                            </Link>
                            <Link
                                href="/dashboard/blog/categories"
                                className={`pb-2 text-sm font-black uppercase tracking-[0.2em] transition-all border-b-4 ${pathname.includes('categories') ? 'border-black text-black' : 'border-transparent text-[var(--muted-foreground)]/70 hover:text-[var(--muted-foreground)]'
                                    }`}
                            >
                                Categories
                            </Link>
                        </div>
                    </div>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-6 py-3 rounded-2xl bg-black text-white font-black hover:bg-[var(--muted)] transition-all flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            {/* Controls Bar */}
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]/50 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-[var(--muted)]/50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-black/5 transition-all outline-none"
                    />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 px-6 text-[var(--muted-foreground)]/70">
                        <Grid className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-widest">{categories.length} Total</span>
                    </div>
                    <div className="flex items-center bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl p-1 h-10 shrink-0">
                        <button
                            onClick={() => setView('row')}
                            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 ${view === 'row' ? "bg-[var(--card)] text-black shadow-md border border-[var(--border)]" : "text-[var(--muted-foreground)]/70 hover:text-[var(--foreground)]"
                                }`}
                        >
                            <Layout className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">List</span>
                        </button>
                        <button
                            onClick={() => setView('card')}
                            className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-2 ${view === 'card' ? "bg-[var(--card)] text-black shadow-md border border-[var(--border)]" : "text-[var(--muted-foreground)]/70 hover:text-[var(--foreground)]"
                                }`}
                        >
                            <Grid className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Cards</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories View */}
            <div className={view === 'card' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                {loading ? (
                    view === 'card'
                        ? [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[200px] bg-[var(--muted)]/50 animate-pulse rounded-2xl" />)
                        : [1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--muted)]/50 animate-pulse rounded-[24px]" />)
                ) : categories.length === 0 ? (
                    <div className="col-span-full h-[300px] flex flex-col items-center justify-center bg-[var(--card)] rounded-2xl border border-[var(--border)] border-dashed">
                        <Layers className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-[var(--muted-foreground)]/70 font-bold">No categories found.</p>
                    </div>
                ) : (
                    categories.map((cat) => (
                        view === 'card' ? (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group relative"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-[var(--muted)]/50 border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
                                        {(cat.image_url || cat.image) ? (
                                            <img src={(cat.image_url || cat.image)} className="w-full h-full object-cover" />
                                        ) : (
                                            <Activity className="w-6 h-6 text-[var(--muted-foreground)]/50" />
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEditModal(cat)}
                                            className="p-2 rounded-xl hover:bg-[var(--muted)]/60 text-[var(--muted-foreground)]/70 hover:text-black transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            className="p-2 rounded-xl hover:bg-red-50 text-[var(--muted-foreground)]/70 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black text-[var(--foreground)] tracking-tight mb-1">{cat.name}</h3>
                                    <p className="text-[var(--muted-foreground)] text-sm font-medium line-clamp-2 mb-6 h-10">{cat.description || 'No description provided.'}</p>

                                    <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                                        <div className="bg-[var(--muted)]/50 px-3 py-1 rounded-lg">
                                            <span className="text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">{cat.blogs_count || 0} Articles</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 grayscale opacity-50">
                                            <ArrowUpDown className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black">{cat.sort_order}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 rounded-[24px] bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--muted)]/50 border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
                                        {(cat.image_url || cat.image) ? (
                                            <img src={(cat.image_url || cat.image)} className="w-full h-full object-cover" />
                                        ) : (
                                            <Activity className="w-5 h-5 text-[var(--muted-foreground)]/50" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-base font-black text-[var(--foreground)] tracking-tight truncate">{cat.name}</h3>
                                        <p className="text-[var(--muted-foreground)] text-xs font-medium truncate max-w-md">{cat.description || 'No description provided.'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    <div className="bg-[var(--muted)]/50 px-3 py-1.5 rounded-xl hidden sm:block">
                                        <span className="text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">{cat.blogs_count || 0} Articles</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 grayscale opacity-50 hidden sm:flex">
                                        <ArrowUpDown className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black">{cat.sort_order}</span>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                        <button
                                            onClick={() => openEditModal(cat)}
                                            className="p-2.5 rounded-xl hover:bg-[var(--muted)]/60 text-[var(--muted-foreground)]/70 hover:text-black transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(cat.id)}
                                            className="p-2.5 rounded-xl hover:bg-red-50 text-[var(--muted-foreground)]/70 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[var(--card)] w-full max-w-none sm:max-w-lg min-h-screen sm:min-h-0 rounded-none sm:rounded-2xl shadow-2xl relative z-10 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">{editingCategory ? 'Edit Taxonomy' : 'Add Taxonomy'}</h2>
                                    <p className="text-[var(--muted-foreground)] text-sm font-medium">Define metadata for better editorial organization.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-8">
                                        <label className="shrink-0 cursor-pointer group">
                                            <div className="w-24 h-24 rounded-2xl bg-[var(--muted)]/50 border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 group-hover:bg-[var(--muted)]/60 transition-colors relative overflow-hidden">
                                                {imagePrev ? (
                                                    <img src={imagePrev} className="absolute inset-0 w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-6 h-6 text-[var(--muted-foreground)]/50" />
                                                        <span className="text-[8px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">Icon</span>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70 flex items-center gap-2 ml-1">Category Name</label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    required
                                                    placeholder="e.g. Scaling"
                                                    className="w-full bg-[var(--muted)]/50 border-none rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-black/5"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70 flex items-center gap-2 ml-1">Epic Description</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="What wisdom does this section hold?"
                                            className="w-full h-24 bg-[var(--muted)]/50 border-none rounded-2xl p-4 font-medium text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-black/5 resize-none"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70 flex items-center gap-2 ml-1">Sort Order</label>
                                        <input
                                            type="number"
                                            value={sortOrder}
                                            onChange={e => setSortOrder(parseInt(e.target.value))}
                                            className="w-full bg-[var(--muted)]/50 border-none rounded-2xl p-4 font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-black/5"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-[var(--muted)]/50 text-[var(--muted-foreground)] font-black rounded-2xl hover:bg-[var(--muted)]/60 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="flex-1 py-4 bg-black text-white font-black rounded-2xl hover:bg-[var(--muted)] transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Generate')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
