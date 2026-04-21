"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLinks, createLink } from "@/store/slices/linksSlice";
import { useRouter } from "next/navigation";
import {
    CirclePlus,
    Copy,
    Filter,
    Link2,
    List,
    Pencil,
    Search,
    SlidersHorizontal,
    Trash2,
    Check,
} from "lucide-react";
import { cn } from "@/lib/utils";




const getHost = (raw: string) => {
    try {
        return new URL(raw).host;
    } catch {
        return raw;
    }
};

const isValidUrl = (s: string) => {
    try {
        const u = new URL(s);
        return !!u.protocol && (u.protocol === "http:" || u.protocol === "https:");
    } catch {
        return false;
    }
};

const slugify = (s: string) => {
    return s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const ensureUniqueSlug = (slug: string, items: ShortLinkItem[]) => {
    let base = slug;
    let attempt = 0;
    let candidate = base;
    const exists = (s: string) => items.some((it) => it.slug === s);
    while (exists(candidate)) {
        attempt += 1;
        candidate = `${base}-${attempt}`;
    }
    return candidate;
};

export default function ShortenedLinksPage() {
    const router = useRouter();

    const dispatch = useAppDispatch();
    const { links, isLoading, error } = useAppSelector((state) => state.links);
    const [query, setQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [draft, setDraft] = useState({ title: "", destinationUrl: "", slug: "" });
    const [createdShortUrl, setCreatedShortUrl] = useState<string | null>(null);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchLinks({ sort_by: 'link_id', sort_dir: 'desc', per_page: 15, page: 1 }));
    }, [dispatch]);

    // Map API links to UI fields, always show location_url
    const mappedLinks = useMemo(() => {
        return links.map((item: any) => ({
            id: item.link_id ?? item.id ?? 0,
            url: item.url ?? '',
            slug: item.slug ?? item.url ?? '',
            full_url: item.full_url ?? '',
            location_url: item.location_url ?? '',
            clicks: item.clicks ?? 0,
            category: item.category ?? '',
            active: item.active ?? item.status === 1 ?? true,
        }));
    }, [links]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return mappedLinks;
        return mappedLinks.filter((item) => {
            return (
                (item.url?.toLowerCase() || '').includes(q) ||
                (item.slug?.toLowerCase() || '').includes(q) ||
                (item.location_url?.toLowerCase() || '').includes(q)
            );
        });
    }, [mappedLinks, query]);

    // Removed shortBase; always use API response for short URL

    const onCreate = async () => {
        const url = draft.destinationUrl.trim();
        let rawSlug = draft.slug.trim();
        if (!url) return;
        if (!isValidUrl(url)) return;

        // If slug is empty, let backend generate it
        rawSlug = rawSlug ? slugify(rawSlug) : '';

        const resultAction = await dispatch(createLink({
            location_url: url,
            url: rawSlug,
        }));
        if (createLink.fulfilled.match(resultAction)) {
            const shortUrl = resultAction.payload.data.full_url;
            setCreatedShortUrl(shortUrl);
        }
        setDraft({ title: '', destinationUrl: '', slug: '' });
        setShowCreateModal(false);
    };

    // TODO: Implement onToggle, onDelete, onDuplicate with API if needed
    // TODO: Implement onToggle, onDelete, onDuplicate with API if needed
    const onToggle = (_id: number) => {};
    const onDelete = (_id: number) => {};
    const onDuplicate = (_item: ShortLinkItem) => {};

    const onCopy = async (fullUrl: string, slug: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(slug);
            window.setTimeout(() => setCopiedSlug((s) => (s === slug ? null : s)), 2000);
        }
    };

    return (
        <div
            className="min-h-screen px-4 sm:px-6 py-6"
            style={{
                background:
                    "radial-gradient(900px 450px at 90% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 62%), radial-gradient(680px 300px at 0% 10%, color-mix(in oklab, var(--primary) 7%, transparent), transparent 60%), var(--app-surface-bg, var(--background))",
            }}
        >
            <div className="max-w-6xl mx-auto space-y-5">
                <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 backdrop-blur p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <Link2 size={18} className="text-primary" />
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Shortened links</h1>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Manage, edit, and track all compact links from one workspace.</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <CirclePlus size={14} /> Shortened URL
                            </button>
                            <button className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center">
                                <SlidersHorizontal size={14} />
                            </button>
                            <button className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center">
                                <Filter size={14} />
                            </button>
                            <button className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center">
                                <List size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search short links"
                            className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                        />
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 backdrop-blur overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200/70 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Link List</p>
                    </div>

                    <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
                        {filtered.map((item) => (
                            <div key={item.id} className="px-5 py-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0">
                                    <Link2 size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    {/* Show the short URL or slug as the main label */}
                                    <p className="font-bold text-slate-900 dark:text-white truncate">{item.url || item.slug || item.full_url}</p>
                                    {/* Show location_url as the subtitle/destination */}
                                    <p className="text-xs text-slate-500 truncate">{item.location_url}</p>
                                    {item.full_url && (
                                        <a
                                            href={item.full_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs text-primary mt-1 block truncate"
                                            title={item.full_url}
                                        >
                                            <span className="font-mono">{item.full_url}</span>
                                        </a>
                                    )}
                                </div>

                                <div className="hidden md:flex items-center gap-2">
                                    {item.category && (
                                        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {item.category}
                                        </span>
                                    )}
                                    <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                                        {item.clicks} Clicks
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => onToggle(item.id)}
                                        className={cn(
                                            "w-8 h-5 rounded-full transition-colors relative",
                                            item.active ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                                        )}
                                        title="Toggle active"
                                    >
                                        <span
                                            className={cn(
                                                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                                                item.active ? "left-[14px]" : "left-[2px]"
                                            )}
                                        />
                                    </button>
                                    <button
                                        onClick={() => onCopy(item.full_url, item.slug)}
                                        className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center"
                                        title="Copy shortened URL"
                                    >
                                        {copiedSlug === item.slug ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                                    </button>
                                    <button
                                        onClick={() => onDuplicate(item)}
                                        className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center"
                                        title="Duplicate"
                                    >
                                        <List size={13} />
                                    </button>
                                    <button
                                        onClick={() => router.push(`/dashboard/shortened-links/${item.slug}`)}
                                        className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 grid place-items-center"
                                        title="Edit"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="h-8 w-8 rounded-lg border border-red-200 dark:border-red-500/30 text-red-500 grid place-items-center"
                                        title="Delete"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="px-5 py-16 text-center text-sm text-slate-500">No links found for your search.</div>
                        )}
                    </div>
                </section>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm p-4 grid place-items-center">
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 space-y-4">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Create shortened URL</h2>
                        <input
                            value={draft.destinationUrl}
                            onChange={(e) => setDraft((prev) => ({ ...prev, destinationUrl: e.target.value }))}
                            placeholder="Destination URL"
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                        />
                        <input
                            value={draft.slug}
                            onChange={(e) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
                            placeholder="Short slug (example: launch2026)"
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                        />

                        <div className="pt-2 flex items-center justify-end gap-2">
                            <button onClick={() => setShowCreateModal(false)} className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold">
                                Cancel
                            </button>
                            <button onClick={onCreate} className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-black">
                                Add Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {createdShortUrl && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-center">
                    <strong>Short URL:</strong> <a href={createdShortUrl} target="_blank" rel="noopener">{createdShortUrl}</a>
                </div>
            )}
        </div>
    );
}
