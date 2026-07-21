"use client";

import React, { useState, useEffect } from "react";
import {
    Plus, Search, Filter, MoreVertical,
    FileText, Eye, Edit3, Trash2, Globe,
    Clock, CheckCircle2, AlertCircle, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Blog {
    id: number;
    title: string;
    category?: { name: string };
    status: 'draft' | 'published' | 'scheduled';
    featured: boolean;
    published_at: string;
    reading_time: number;
    author_name: string;
    featured_image?: string;
}

export default function BlogManagementPage() {
    const pathname = usePathname();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await api.get("/blogs", {
                params: {
                    search,
                    status: statusFilter === "all" ? undefined : statusFilter
                }
            });
            if (res.data.success || res.data.is_success) {
                setBlogs(res.data.data || []);
            }
        } catch (error) {
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [search, statusFilter]);

    const toggleFeatured = async (id: number) => {
        try {
            const res = await api.patch(`/blogs/${id}/feature`);
            if (res.data.success || res.data.is_success) {
                toast.success("Featured status updated");
                fetchBlogs();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const deleteBlog = async (id: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            const res = await api.delete(`/blogs/${id}`);
            if (res.data.success || res.data.is_success) {
                toast.success("Blog deleted");
                fetchBlogs();
            }
        } catch (error) {
            toast.error("Failed to delete blog");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/blog/create"
                        className="px-6 py-3 rounded-2xl bg-black text-white font-black hover:bg-[var(--muted)] transition-all flex items-center gap-2 shadow-xl shadow-black/10 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create Insight
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Posts", val: blogs.length, icon: FileText, color: "blue" },
                    { label: "Published", val: blogs.filter(b => b.status === 'published').length, icon: Globe, color: "emerald" },
                    { label: "Drafts", val: blogs.filter(b => b.status === 'draft').length, icon: Edit3, color: "amber" },
                    { label: "Weekly Growth", val: "12%", icon: TrendingUp, color: "pink" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)]/70 mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-[var(--foreground)] leading-none">{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls Bar */}
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]/50 group-focus-within:text-black transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-[var(--muted)]/50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-black/5 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2 p-1.5 bg-[var(--muted)]/50 rounded-[20px]">
                    {['all', 'published', 'draft', 'scheduled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-[var(--card)] text-black shadow-sm' : 'text-[var(--muted-foreground)]/70 hover:bg-[var(--card)]/50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Table */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest text-[10px]">Loading Wisdom...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-10">
                        <div className="w-20 h-20 bg-[var(--muted)]/50 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-10 h-10 text-[var(--muted-foreground)]/50" />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No blogs found</h3>
                        <p className="text-[var(--muted-foreground)] font-medium mb-8">Time to share some corporate-breaking strategies.</p>
                        <Link href="/dashboard/blog/create" className="px-8 py-4 bg-black text-white font-black rounded-2xl">Create Your First Post</Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border)]">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70">Article</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70">Category</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70">Status</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70">Published</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {blogs.map((blog) => (
                                    <tr key={blog.id} className="group hover:bg-[var(--muted)]/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-10 rounded-xl bg-[var(--muted)]/50 overflow-hidden shrink-0 border border-[var(--border)]">
                                                    {blog.featured_image ? (
                                                        <img src={blog.featured_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center"><FileText className="w-4 h-4 text-[var(--muted-foreground)]/50" /></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[15px] font-bold text-[var(--foreground)] truncate max-w-[200px] md:max-w-[300px]">{blog.title}</span>
                                                        {blog.featured && (
                                                            <div className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">Featured</div>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest">{blog.author_name} • {blog.reading_time}m read</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-[var(--muted)]/50 text-[var(--muted-foreground)] rounded-lg text-xs font-bold">{blog.category?.name || 'Uncategorized'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${blog.status === 'published' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                    blog.status === 'scheduled' ? 'bg-blue-500' : 'bg-[var(--muted)]'
                                                    }`} />
                                                <span className="text-xs font-black uppercase tracking-widest text-[var(--foreground)]">{blog.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-[var(--muted-foreground)]">{blog.status === 'draft' ? '—' : new Date(blog.published_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleFeatured(blog.id)}
                                                    className={`p-2 rounded-xl transition-all ${blog.featured ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[var(--muted-foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60'}`}
                                                    title="Toggle Featured"
                                                >
                                                    <TrendingUp className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    href={`/dashboard/blog/edit/${blog.id}`}
                                                    className="p-2 rounded-xl text-[var(--muted-foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--muted)]/60 transition-all"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => deleteBlog(blog.id)}
                                                    className="p-2 rounded-xl text-[var(--muted-foreground)]/70 hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
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
