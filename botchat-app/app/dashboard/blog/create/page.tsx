"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Send, Plus } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";

interface Category {
    id: number;
    name: string;
}

export default function CreateBlogPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [content, setContent] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState("draft");
    const [publishedAt, setPublishedAt] = useState("");
    const [featured, setFeatured] = useState(false);
    const [allowComments, setAllowComments] = useState(true);
    const [readingTime, setReadingTime] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");
    const [canonicalUrl, setCanonicalUrl] = useState("");

    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [featuredImagePrev, setFeaturedImagePrev] = useState("");
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [bannerImagePrev, setBannerImagePrev] = useState("");
    const [authorImage, setAuthorImage] = useState<File | null>(null);
    const [authorImagePrev, setAuthorImagePrev] = useState("");

    useEffect(() => {
        api.get("/blog-categories").then((res) => {
            if (res.data.success || res.data.is_success)
                setCategories(res.data.data || []);
        }).catch(() => { });
    }, []);

    const handleFile = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPrev: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPrev(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !categoryId) {
            toast.error("Title, Content, and Category are required.");
            return;
        }
        setLoading(true);
        const fd = new FormData();
        fd.append("title", title);
        fd.append("content", content);
        fd.append("category_id", categoryId);
        if (slug) fd.append("slug", slug);
        if (shortDescription) fd.append("short_description", shortDescription);
        fd.append("status", status);
        if (status === "scheduled" && publishedAt) fd.append("published_at", publishedAt);
        fd.append("featured", featured ? "1" : "0");
        fd.append("allow_comments", allowComments ? "1" : "0");
        if (readingTime) fd.append("reading_time", readingTime);
        if (authorName) fd.append("author_name", authorName);
        if (metaTitle) fd.append("meta_title", metaTitle);
        if (metaDescription) fd.append("meta_description", metaDescription);
        if (metaKeywords) fd.append("meta_keywords", metaKeywords);
        if (canonicalUrl) fd.append("canonical_url", canonicalUrl);
        if (featuredImage) fd.append("featured_image", featuredImage);
        if (bannerImage) fd.append("banner_image", bannerImage);
        if (authorImage) fd.append("author_image", authorImage);

        try {
            const res = await api.post("/blogs", fd);
            if (res.data.success || res.data.is_success) {
                toast.success("Blog created successfully!");
                router.push("/dashboard/blog");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create blog.");
        } finally {
            setLoading(false);
        }
    };

    const lbl = "block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5";
    const inp = "w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm text-[var(--foreground)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-black/10 transition placeholder:text-[var(--muted-foreground)]/50";

    const Toggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
            <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
            <button type="button" onClick={onToggle}
                className={`w-10 h-5 rounded-full relative transition-colors ${on ? "bg-[var(--background)]" : "bg-[var(--muted)]/70"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] shadow transition-all ${on ? "left-5" : "left-0.5"}`} />
            </button>
        </div>
    );

    const ImageUpload = ({
        label, prev, setFile, setPrev, aspect = "aspect-video"
    }: { label: string; prev: string; setFile: any; setPrev: any; aspect?: string }) => (
        <div>
            <span className={lbl}>{label}</span>
            <label className={`${aspect} w-full rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/50 flex items-center justify-center cursor-pointer hover:bg-[var(--muted)]/60 transition overflow-hidden relative`}>
                {prev ? (
                    <img src={prev} className="absolute inset-0 w-full h-full object-cover" alt="" />
                ) : (
                    <div className="flex flex-col items-center gap-1 text-[var(--muted-foreground)]/70">
                        <Plus className="w-5 h-5" />
                        <span className="text-xs font-medium">Click to upload</span>
                    </div>
                )}
                <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleFile(e, setFile, setPrev)} />
            </label>
        </div>
    );

    return (
        <div className="pb-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/blog"
                        className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/50 transition">
                        <ChevronLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-[var(--foreground)]">Create Blog Post</h1>
                        <p className="text-xs text-[var(--muted-foreground)]/70">Fill in the details and publish</p>
                    </div>
                </div>
                <button onClick={handleSubmit} disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--background)] text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition disabled:opacity-50">
                    {loading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Send className="w-4 h-4" />}
                    Publish Post
                </button>
            </div>

            {/* Two-column layout */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">

                {/* ── LEFT: Main Content ── */}
                <div className="space-y-5">

                    {/* Title */}
                    <div>
                        <label className={lbl}>Title <span className="text-red-400">*</span></label>
                        <input type="text" className={`${inp} text-xl font-semibold`}
                            placeholder="Enter blog title..." value={title}
                            onChange={e => setTitle(e.target.value)} />
                    </div>

                    {/* Slug & Reading Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={lbl}>URL Slug</label>
                            <input type="text" className={inp}
                                placeholder="auto-generated" value={slug}
                                onChange={e => setSlug(e.target.value)} />
                        </div>
                        <div>
                            <label className={lbl}>Reading Time (min)</label>
                            <input type="number" className={inp}
                                placeholder="e.g. 5" value={readingTime}
                                onChange={e => setReadingTime(e.target.value)} />
                        </div>
                    </div>

                    {/* Short Description */}
                    <div>
                        <label className={lbl}>Short Description</label>
                        <textarea className={`${inp} resize-none h-24`}
                            placeholder="Brief summary shown on blog listing pages..."
                            value={shortDescription}
                            onChange={e => setShortDescription(e.target.value)} />
                    </div>

                    {/* Content Editor */}
                    <div>
                        <label className={lbl}>Content <span className="text-red-400">*</span></label>
                        <BlogEditor content={content} onChange={setContent} />
                    </div>

                    {/* Images */}
                    <div className="grid grid-cols-3 gap-4">
                        <ImageUpload label="Featured Image"
                            prev={featuredImagePrev}
                            setFile={setFeaturedImage}
                            setPrev={setFeaturedImagePrev} />
                        <ImageUpload label="Banner Image"
                            prev={bannerImagePrev}
                            setFile={setBannerImage}
                            setPrev={setBannerImagePrev} />
                        <ImageUpload label="Author Avatar"
                            prev={authorImagePrev}
                            setFile={setAuthorImage}
                            setPrev={setAuthorImagePrev}
                            aspect="aspect-square" />
                    </div>

                    {/* SEO Section */}
                    <div className="border border-[var(--border)] rounded-xl p-5 space-y-4">
                        <p className="text-xs font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest">SEO & Meta (Optional)</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={lbl}>Meta Title</label>
                                <input type="text" className={inp}
                                    placeholder="Max 60 characters" value={metaTitle}
                                    onChange={e => setMetaTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className={lbl}>Meta Keywords</label>
                                <input type="text" className={inp}
                                    placeholder="AI, Automation, Bots" value={metaKeywords}
                                    onChange={e => setMetaKeywords(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className={lbl}>Meta Description</label>
                            <textarea className={`${inp} resize-none h-20`}
                                placeholder="Max 160 characters" value={metaDescription}
                                onChange={e => setMetaDescription(e.target.value)} />
                        </div>
                        <div>
                            <label className={lbl}>Canonical URL</label>
                            <input type="url" className={inp}
                                placeholder="https://example.com/original-post" value={canonicalUrl}
                                onChange={e => setCanonicalUrl(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Settings Panel ── */}
                <div className="space-y-5">

                    {/* Publish Config */}
                    <div className="border border-[var(--border)] rounded-xl p-5 space-y-4">
                        <p className="text-xs font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest">Publish Settings</p>

                        <div>
                            <label className={lbl}>Status</label>
                            <select className={inp} value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>

                        {status === "scheduled" && (
                            <div>
                                <label className={lbl}>Publish Date & Time</label>
                                <input type="datetime-local" className={inp}
                                    value={publishedAt}
                                    onChange={e => setPublishedAt(e.target.value)} />
                            </div>
                        )}

                        <div>
                            <label className={lbl}>Category <span className="text-red-400">*</span></label>
                            <select className={inp} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                                <option value="">Select category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={lbl}>Author Name</label>
                            <input type="text" className={inp}
                                placeholder="e.g. John Doe" value={authorName}
                                onChange={e => setAuthorName(e.target.value)} />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="border border-[var(--border)] rounded-xl p-5">
                        <p className="text-xs font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest mb-3">Options</p>
                        <Toggle on={featured} onToggle={() => setFeatured(!featured)} label="Featured Post" />
                        <Toggle on={allowComments} onToggle={() => setAllowComments(!allowComments)} label="Allow Comments" />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--background)] text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition disabled:opacity-50">
                        {loading
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Send className="w-4 h-4" />}
                        Publish Blog Post
                    </button>
                </div>
            </form>
        </div>
    );
}
