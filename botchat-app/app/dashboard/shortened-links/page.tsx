"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchLinks, createLink, fetchLinkById } from "@/store/slices/linksSlice";
import { fetchDomains } from "@/store/slices/domainsSlice";
import { useRouter } from "next/navigation";
import { usePlanFeature } from "@/hooks/usePlanFeature";
import {
    Plus,
    Copy,
    Link2,
    Layout,
    Grid,
    Search,
    Trash2,
    Check,
    Sparkles,
    Loader2,
    Globe,
    Info,
    ArrowRight,
    MoreVertical,
    BarChart2,
    RefreshCw,
    ExternalLink,
    CheckCircle2,
    History,
    Zap,
    MousePointer2,
    X,
    Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/providers/ModalProvider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 60 }}
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl sm:min-h-0 overflow-hidden flex flex-col max-h-[92vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-4 px-5 sm:px-8 pt-4 sm:pt-8 pb-4 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</div>}
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex-1 tracking-tight">{title}</h2>
                        <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 sm:p-8">{children}</div>
                    {footer && <div className="px-5 sm:px-8 py-4 sm:py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-1.5 sm:space-y-2">
        <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
            />
        </div>
    </div>
);

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

export default function ShortenedLinksPage() {
    const router = useRouter();
    const { showModal } = useModal();
    const dispatch = useAppDispatch();
    const { canAccess } = usePlanFeature();
    const { links, isLoading, error } = useAppSelector((state) => state.links);
    const { domains } = useAppSelector((state) => state.domains);
    const [query, setQuery] = useState("");
    const [view, setView] = useState<'row' | 'card'>('row');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [draft, setDraft] = useState({ title: "", destinationUrl: "", slug: "", domain_id: 0 });
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchLinks({ sort_by: 'link_id', sort_dir: 'desc', per_page: 50, page: 1 }));
        dispatch(fetchDomains());
    }, [dispatch]);

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
        return mappedLinks.filter((item) => (
            (item.url?.toLowerCase() || '').includes(q) ||
            (item.slug?.toLowerCase() || '').includes(q) ||
            (item.location_url?.toLowerCase() || '').includes(q)
        ));
    }, [mappedLinks, query]);

    const onCreate = async () => {
        const url = draft.destinationUrl.trim();
        let rawSlug = draft.slug.trim();
        if (!url || !isValidUrl(url)) {
            showModal("error", "Error", "Please provide a valid destination URL.");
            return;
        }

        setIsCreating(true);
        try {
            rawSlug = rawSlug ? slugify(rawSlug) : '';
            const payload: any = { location_url: url, url: rawSlug };
            if (draft.domain_id) payload.domain_id = draft.domain_id;
            await dispatch(createLink(payload)).unwrap();
            showModal("success", "Success", "Shortened link created successfully!");
            setShowCreateModal(false);
            setDraft({ title: '', destinationUrl: '', slug: '', domain_id: 0 });
        } catch (err: any) {
            showModal("error", "Error", err.message || "Failed to create link.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = async (fullUrl: string, slug: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(null), 2000);
        }
    };

    const handleEdit = (item: any) => {
        router.push(`/dashboard/shortened-links/${item.slug}`);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 relative overflow-hidden">
            {/* Decorative Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-full space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6"
                >
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <Zap size={20} className="sm:size-6" />
                            </div>
                            <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                                Short Link Studio
                            </div>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                Shortened Links
                            </h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-xl text-xs sm:text-sm md:text-base">
                                Manage, edit, and track all your compact high-performance links from one workspace.
                            </p>
                        </div>
                    </div>
                    {canAccess("short_links") && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="h-12 sm:h-14 w-full lg:w-auto px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white text-[11px] sm:text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                        >
                            <Plus size={16} className="sm:size-[18px] group-hover:rotate-90 transition-transform duration-500" />
                            Create Short URL
                        </button>
                    )}
                </motion.div>

                {/* Search & View Toggle Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 sm:h-16 rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-0 shadow-sm"
                >
                    <div className="flex items-center gap-3 w-full sm:flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search short links..."
                                className="w-full pl-9 sm:pl-10 h-9 sm:h-10 bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl p-0.5 sm:p-1 h-8 sm:h-10">
                            <button
                                onClick={() => setView('row')}
                                className={cn(
                                    "px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all flex items-center gap-1.5 sm:gap-2",
                                    view === 'row' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                )}
                            >
                                <Layout className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">List</span>
                            </button>
                            <button
                                onClick={() => setView('card')}
                                className={cn(
                                    "px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all flex items-center gap-1.5 sm:gap-2",
                                    view === 'card' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                )}
                            >
                                <Grid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Cards</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="min-h-[300px] sm:min-h-[400px]">
                    {isLoading ? (
                        <div className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">Scanning Links...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-[var(--border)]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                                <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">No Links Found</h3>
                            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xs mx-auto mb-6 sm:mb-8">
                                {query ? "Try adjusting your search query." : "Generate your first compact URL and start tracking clicks."}
                            </p>
                            {!query && (
                                <Button onClick={() => setShowCreateModal(true)} className="rounded-xl sm:rounded-2xl h-10 sm:h-12 px-6 sm:px-8 text-[11px] sm:text-[13px] font-black uppercase tracking-widest">
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Shorten Link
                                </Button>
                            )}
                        </motion.div>
                    ) : view === 'card' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {filtered.map((item) => (
                                <ShortLinkCard
                                    key={item.id}
                                    item={item}
                                    onEdit={handleEdit}
                                    onCopy={handleCopy}
                                    copied={copiedSlug === item.slug}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 w-full overflow-hidden">
                            {/* Desktop table */}
                            <div className="hidden md:block w-full">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Short URL & Destination</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-center">Analytics</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-right">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((item) => (
                                            <ShortLinkTableRow
                                                key={item.id}
                                                item={item}
                                                onEdit={handleEdit}
                                                onCopy={handleCopy}
                                                copied={copiedSlug === item.slug}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile cards */}
                            <div className="md:hidden flex flex-col gap-3 p-3 sm:p-4">
                                {filtered.map((item) => (
                                    <ShortLinkMobileCard
                                        key={item.id}
                                        item={item}
                                        onEdit={handleEdit}
                                        onCopy={handleCopy}
                                        copied={copiedSlug === item.slug}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Creation Modal */}
            <ModalShell
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Shortened URL"
                icon={<Link2 size={20} />}
                footer={
                    <div className="flex gap-3 sm:gap-4">
                        <button onClick={() => setShowCreateModal(false)} className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[var(--border)] text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px] sm:text-[11px] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                        <button
                            onClick={onCreate}
                            disabled={isCreating}
                            className="flex-[1.5] h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50"
                        >
                            {isCreating ? <Loader2 size={16} className="sm:size-[18px] animate-spin" /> : <Plus size={16} className="sm:size-[18px]" />}
                            {isCreating ? "Generating..." : "Add Short Link"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-5 sm:space-y-8 py-1 sm:py-2">
                    <InputField
                        label="Destination URL"
                        value={draft.destinationUrl}
                        onChange={(e: any) => setDraft((prev) => ({ ...prev, destinationUrl: e.target.value }))}
                        placeholder="https://example.com/very-long-landing-page"
                    />
                    <InputField
                        label="Short Slug (Optional)"
                        value={draft.slug}
                        onChange={(e: any) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="launch2026"
                    />
                    {domains.length > 0 && (
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Custom Domain</label>
                            <select
                                value={draft.domain_id}
                                onChange={(e: any) => setDraft((prev) => ({ ...prev, domain_id: parseInt(e.target.value) }))}
                                className="w-full h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                            >
                                <option value={0}>Default domain</option>
                                {domains.map((d: any) => (
                                    <option key={d.domain_id || d.id} value={d.domain_id || d.id}>{d.domain}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex items-start gap-3 sm:gap-4">
                        <Info size={16} className="sm:size-[18px] text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] sm:text-[11px] text-blue-700/80 dark:text-blue-400 font-bold uppercase tracking-tight leading-relaxed">
                            Custom slugs help with branding and CTR. If left empty, a secure unique ID will be generated for you automatically.
                        </p>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
}

function ShortLinkCard({ item, onEdit, onCopy, copied }: any) {
    return (
        <div
            onClick={() => onEdit(item)}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-500 flex flex-col gap-4 sm:gap-5 relative overflow-hidden cursor-pointer"
        >
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Link2 className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <Zap size={20} className="sm:size-6" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        {item.clicks} Clicks
                    </span>
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors truncate">/{item.slug}</h3>
                <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium truncate opacity-60 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <ArrowRight size={10} className="text-primary shrink-0" /> {item.location_url}
                </p>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border)] relative z-10">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <div
                        className={cn(
                            "relative inline-flex h-5 w-10 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-300",
                            item.active ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                        )}
                    >
                        <span className={cn("pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300", item.active ? "translate-x-5" : "translate-x-0.5")} />
                    </div>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Tracking</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onCopy(item.full_url, item.slug)} className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all border", copied ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 text-slate-500")}>
                        {copied ? <CheckCircle2 size={14} className="sm:size-4" /> : <Copy size={14} className="sm:size-4" />}
                    </button>
                    <ActionDropdown item={item} onEdit={onEdit} />
                </div>
            </div>
        </div>
    );
}

function ShortLinkTableRow({ item, onEdit, onCopy, copied }: any) {
    return (
        <tr
            onClick={() => onEdit(item)}
            className="group hover:bg-primary/[0.02] transition-colors border-b border-[var(--border)]/50 last:border-none cursor-pointer"
        >
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <Link2 size={24} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-base truncate group-hover:text-primary transition-colors leading-tight">/{item.slug}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)] font-bold flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <ArrowRight size={10} className="text-primary shrink-0" /> {item.location_url}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-[10px] font-black uppercase tracking-tighter bg-[var(--background)] shadow-sm">
                    <MousePointer2 size={12} className="text-primary" />
                    {item.clicks} total clicks
                </div>
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onCopy(item.full_url, item.slug)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm", copied ? "bg-primary text-white border-primary" : "bg-white dark:bg-white/5 border-[var(--border)] text-slate-500 hover:text-primary hover:border-primary/30")}>
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    <ActionDropdown item={item} onEdit={onEdit} />
                </div>
            </td>
        </tr>
    );
}

function ShortLinkMobileCard({ item, onEdit, onCopy, copied }: any) {
    const router = useRouter();
    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <button
                onClick={() => onEdit(item)}
                className="w-full text-left px-4 pt-4 pb-3"
            >
                <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Zap size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-snug">/{item.slug}</h4>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium truncate flex items-center gap-1">
                            <ArrowRight size={9} className="text-primary shrink-0" /> {item.location_url}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 border bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-100">
                        <MousePointer2 size={10} className="text-primary" />
                        {item.clicks}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <div
                            className={cn(
                                "relative inline-flex h-4 w-8 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-300",
                                item.active ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                            )}
                        >
                            <span className={cn("pointer-events-none block h-2.5 w-2.5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300", item.active ? "translate-x-[14px]" : "translate-x-0.5")} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-wider">Tracking</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">Tap to manage →</span>
                </div>
            </button>

            <div className="border-t border-[var(--border)] grid grid-cols-4 divide-x divide-[var(--border)]">
                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-primary hover:bg-primary/5 transition-colors group/btn">
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Edit</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onCopy(item.full_url, item.slug); }} className={cn("py-2.5 flex flex-col items-center justify-center gap-0.5 transition-colors group/btn", copied ? "text-primary" : "text-slate-400 hover:text-primary hover:bg-primary/5")}>
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">{copied ? "Copied" : "Copy"}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); window.open(item.full_url, '_blank'); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors group/btn">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Visit</span>
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group/btn">
                            <MoreVertical className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">More</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                        <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => router.push(`/dashboard/shortened-links/analytics?page=${item.id}`)}>
                            <BarChart2 size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Deep Analytics</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                            <History size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Change Logs</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/5" />
                        <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                            <Trash2 size={16} className="text-red-500" /> <span className="font-bold text-xs uppercase tracking-wider">Purge Link</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function ActionDropdown({ item, onEdit }: any) {
    const { showModal } = useModal();
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-600">
                    <MoreVertical size={16} className="sm:size-[18px]" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 sm:w-60 p-2 rounded-2xl border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuItem onClick={() => onEdit(item)} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                    <Pencil size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Modify Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => window.open(item.full_url, '_blank')}>
                    <ExternalLink size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Visit Live</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => router.push(`/dashboard/shortened-links/analytics?page=${item.id}`)}>
                    <BarChart2 size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Deep Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                    <History size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Change Logs</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/5" />
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                    <Trash2 size={16} className="text-red-500" /> <span className="font-bold text-xs uppercase tracking-wider">Purge Link</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
