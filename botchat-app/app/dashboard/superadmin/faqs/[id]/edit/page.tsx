"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Save, Loader2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import BlogEditor from "@/components/blog/BlogEditor";

interface FaqCategory {
    id: number;
    name: string;
}

export default function SuperAdminEditFaqPage() {
    const { id } = useParams();
    const router = useRouter();
    const [categories, setCategories] = useState<FaqCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const [question, setQuestion] = useState("");
    const [slug, setSlug] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [answer, setAnswer] = useState("");
    const [displayLocation, setDisplayLocation] = useState<"landing" | "tenant" | "both">("both");
    const [status, setStatus] = useState<"Draft" | "Published">("Published");
    const [isFeatured, setIsFeatured] = useState(false);
    const [sortOrder, setSortOrder] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [catRes, faqRes] = await Promise.all([
                api.get("/faq-categories", { params: { paginate: false } }),
                api.get(`/faqs/${id}`),
            ]);

            if (catRes.data?.success) setCategories(catRes.data.data);

            if (faqRes.data?.success) {
                const faq = faqRes.data.data;
                setQuestion(faq.question);
                setSlug(faq.slug);
                setCategoryId(String(faq.category_id));
                setAnswer(faq.answer || "");
                setDisplayLocation(faq.display_location || "both");
                setStatus(faq.status || "Published");
                setIsFeatured(faq.is_featured || false);
                setSortOrder(faq.sort_order || 0);
            }
        } catch {
            toast.error("Failed to load FAQ details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) { toast.error("Question is required."); return; }
        if (!categoryId) { toast.error("Category is required."); return; }
        if (!answer.trim() || answer === "<p></p>") { toast.error("Answer content is required."); return; }

        setSubmitting(true);
        try {
            const res = await api.put(`/faqs/${id}`, {
                question,
                slug: slug.trim() || undefined,
                category_id: parseInt(categoryId),
                answer,
                display_location: displayLocation,
                status,
                is_featured: isFeatured,
                sort_order: sortOrder,
            });

            if (res.data?.success) {
                toast.success("FAQ updated successfully!");
                router.push("/dashboard/superadmin/faqs");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update FAQ.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center items-center text-[var(--muted-foreground)]">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading FAQ details...
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <Link
                href="/dashboard/superadmin/faqs"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to FAQs
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-primary" /> Edit FAQ
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
                        Update question, category, location, or TipTap formatted answer.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">General Information</h3>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                            Question *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. How do I setup my custom domain?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                                Slug
                            </label>
                            <input
                                type="text"
                                placeholder="how-do-i-setup-custom-domain"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary font-mono text-xs"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                                Category *
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-primary"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Rich TipTap Answer Editor */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-1">
                        Answer * (TipTap Rich Text)
                    </label>
                    <div className="border border-[var(--border)] rounded-xl overflow-hidden min-h-[250px]">
                        <BlogEditor content={answer} onChange={setAnswer} />
                    </div>
                </div>

                {/* Display Location & Status Options */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-primary">Publishing Settings</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                                Display Location *
                            </label>
                            <select
                                value={displayLocation}
                                onChange={(e) => setDisplayLocation(e.target.value as any)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-primary"
                            >
                                <option value="both">Both (Landing + Tenant)</option>
                                <option value="landing">Landing Website Only</option>
                                <option value="tenant">Tenant Dashboard Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                                Status *
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as any)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-primary"
                            >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div className="flex items-center pt-5">
                            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                Featured FAQ
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href="/dashboard/superadmin/faqs"
                        className="px-5 py-2.5 rounded-xl border border-[var(--border)] font-bold text-xs uppercase tracking-wider hover:bg-[var(--muted)]/50 transition-all"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update FAQ
                    </button>
                </div>
            </form>
        </div>
    );
}
