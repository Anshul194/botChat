"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    fetchVcards,
    deleteVcard,
    createVcard,
    toggleVcard,
    duplicateVcard,
    resetVcardClicks
} from "@/store/slices/vcardsSlice";
import { fetchDomains } from "@/store/slices/domainsSlice";
import { useRouter } from "next/navigation";
import { usePlanFeature } from "@/hooks/usePlanFeature";
import {
    Plus,
    Copy,
    Contact,
    Pencil,
    Search,
    Trash2,
    Check,
    MoreVertical,
    BarChart3,
    QrCode,
    RefreshCcw,
    X,
    Globe,
    Layout,
    Grid,
    CheckCircle2,
    ArrowRight,
    Loader2,
    Info,
    MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
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
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 60 }}
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl sm:min-h-0 overflow-hidden flex flex-col max-h-[92vh] shadow-2xl", maxWidthClassName)}>
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-4 px-5 sm:px-8 pt-4 sm:pt-8 pb-4 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</div>}
                        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white flex-1 tracking-tight">{title}</h2>
                        <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scroll">{children}</div>
                    {footer && <div className="px-5 sm:px-8 py-4 sm:py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-1.5 sm:space-y-2">
        <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm focus:shadow-inner"
            />
        </div>
    </div>
);

export default function VcardLinksPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { canAccess } = usePlanFeature();
    const { vcards, isLoading } = useAppSelector((state) => state.vcards);
    const { domains } = useAppSelector((state) => state.domains);
    const { showModal, showConfirm } = useModal();

    const [query, setQuery] = useState("");
    const [view, setView] = useState<'row' | 'card'>('row');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [draft, setDraft] = useState({ slug: "", domain_id: 0 });
    const [isCreating, setIsCreating] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchVcards());
        dispatch(fetchDomains());
    }, [dispatch]);

    const vcardLinks = useMemo(() => {
        if (!Array.isArray(vcards)) return [];
        return vcards.map((item: any) => ({
            id: item.id ?? item.link_id ?? 0,
            url: item.url ?? '',
            slug: item.slug ?? item.url ?? '',
            full_url: item.full_url ?? '',
            clicks: item.clicks ?? 0,
            active: item.is_enabled !== false,
            name: item.vcard_name || (item.vcard?.first_name ? `${item.vcard?.first_name || ""} ${item.vcard?.last_name || ""}`.trim() : (item.url || item.slug || "Untitled")),
        }));
    }, [vcards]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return vcardLinks;
        return vcardLinks.filter((item) =>
            (item.name || "").toLowerCase().includes(q) ||
            (item.slug || "").toLowerCase().includes(q)
        );
    }, [vcardLinks, query]);

    const onCreate = async () => {
        if (isCreating || !draft.slug.trim()) return;
        setIsCreating(true);
        try {
            const payload: any = { url: draft.slug.trim() };
            if (draft.domain_id) payload.domain_id = draft.domain_id;
            const result = await dispatch(createVcard(payload)).unwrap();
            showModal("success", "Vcard Created", "Your new Vcard has been created successfully!");
            setShowCreateModal(false);
            setDraft({ slug: "", domain_id: 0 });
            router.push(`/dashboard/vcard-links/${result.data.id}`);
        } catch (err: any) {
            showModal("error", "Error", err?.message || "Failed to create Vcard. Slug might be taken.");
        } finally {
            setIsCreating(false);
        }
    };

    const onCopy = async (fullUrl: string, slug: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(null), 1800);
        }
    };

    const handleDelete = (item: any) => {
        showConfirm({
            title: "Delete Vcard?",
            message: "Are you sure you want to delete this vcard? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            onConfirm: () => dispatch(deleteVcard(item.id)),
        });
    };

    const handleReset = (item: any) => {
        showConfirm({
            title: "Reset Clicks?",
            message: "Are you sure you want to reset the clicks counter for this vcard?",
            type: "warning",
            confirmText: "Reset",
            onConfirm: () => dispatch(resetVcardClicks(item.id)),
        });
    };

    const handleDuplicate = (item: any) => {
        showConfirm({
            title: "Duplicate Vcard?",
            message: "Are you sure you want to duplicate this vcard?",
            confirmText: "Duplicate",
            onConfirm: async () => {
                try {
                    await dispatch(duplicateVcard(item.id)).unwrap();
                    showModal("success", "Duplicated", "Vcard duplicated successfully!");
                    dispatch(fetchVcards());
                } catch (err: any) {
                    showModal("error", "Error", err?.message || "Failed to duplicate.");
                }
            }
        });
    };

    const handleToggle = (item: any) => {
        dispatch(toggleVcard(item.id));
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden pb-12">
            <div className="fixed top-[-15%] right-[-15%] w-[60%] h-[60%] md:w-[45%] md:h-[45%] bg-primary/8 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="fixed bottom-[-20%] left-[-20%] w-[55%] h-[55%] md:w-[40%] md:h-[40%] bg-accent/5 rounded-full blur-[130px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 lg:gap-8"
                >
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10 shrink-0">
                                <Contact size={20} className="sm:size-6" />
                            </div>
                            <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                                Vcard Studio
                            </div>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Vcard Links</h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-md lg:max-w-xl text-xs sm:text-sm md:text-base">
                                Manage your professional digital business cards and track their performance.
                            </p>
                        </div>
                    </div>

                    {canAccess("vcard") && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="h-12 sm:h-14 w-full lg:w-auto px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white text-[11px] sm:text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-2.5 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.97] transition-all group"
                        >
                            <Plus size={16} className="sm:size-[18px] group-hover:rotate-90 transition-transform duration-500" />
                            Create New Vcard
                        </button>
                    )}
                </motion.div>

                {/* Search & View Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-2 sm:p-1.5 shadow-sm"
                >
                    <div className="relative flex-1 max-w-full sm:max-w-md group">
                        <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search by name or slug..."
                            className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 h-11 sm:h-11 bg-transparent text-xs sm:text-sm font-medium focus:outline-none rounded-xl sm:rounded-[22px]"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-xl sm:rounded-2xl p-0.5 sm:p-1 h-10 sm:h-10 w-full sm:w-auto">
                        <button
                            onClick={() => setView('row')}
                            className={cn(
                                "flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2",
                                view === 'row' ? "bg-primary text-primary-foreground shadow" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted-foreground)]"
                            )}
                        >
                            <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="font-semibold text-[10px] sm:text-xs tracking-wider hidden sm:inline">List</span>
                        </button>
                        <button
                            onClick={() => setView('card')}
                            className={cn(
                                "flex-1 sm:flex-none px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2",
                                view === 'card' ? "bg-primary text-primary-foreground shadow" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted-foreground)]"
                            )}
                        >
                            <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="font-semibold text-[10px] sm:text-xs tracking-wider hidden sm:inline">Cards</span>
                        </button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="min-h-[420px]">
                    {isLoading && vcardLinks.length === 0 ? (
                        <div className="h-[300px] sm:h-[420px] flex flex-col items-center justify-center gap-4 sm:gap-5 text-[var(--muted-foreground)]">
                            <Loader2 className="w-7 h-7 sm:w-9 sm:h-9 animate-spin text-primary" />
                            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.125em]">Loading your Vcards...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[300px] sm:h-[420px] flex flex-col items-center justify-center text-center px-6 rounded-2xl sm:rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                                <Contact className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                            </div>
                            <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 tracking-tight">No Vcards Yet</h3>
                            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xs mx-auto mb-6 sm:mb-8 text-balance">
                                {query ? "No matches found. Try different keywords." : "Create your first digital business card to get started."}
                            </p>
                            {!query && canAccess("vcard") && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="h-10 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white font-semibold flex items-center gap-2 sm:gap-3 hover:bg-primary/90 transition-colors text-xs sm:text-sm"
                                >
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Create Your First Vcard
                                </button>
                            )}
                        </motion.div>
                    ) : view === 'card' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {filtered.map((item) => (
                                <VcardLinkCard
                                    key={item.id}
                                    item={item}
                                    onEdit={(it: any) => router.push(`/dashboard/vcard-links/${it.id}`)}
                                    onCopy={onCopy}
                                    copied={copiedSlug === item.slug}
                                    onToggle={handleToggle}
                                    onAction={(type: string) => {
                                        if (type === 'delete') handleDelete(item);
                                        if (type === 'duplicate') handleDuplicate(item);
                                        if (type === 'reset') handleReset(item);
                                        if (type === 'analytics') router.push(`/dashboard/vcard-links/analytics?page=${item.id}`);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
                            {/* Desktop table */}
                            <div className="hidden sm:block">
                                <table className="w-full text-left border-collapse min-w-full">
                                    <thead className="border-b border-[var(--border)] bg-[var(--background)]/70">
                                        <tr>
                                            <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] text-left">Identity</th>
                                            <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] text-center">Clicks</th>
                                            <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] text-right pr-8">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {filtered.map((item) => (
                                            <VcardLinkRow
                                                key={item.id}
                                                item={item}
                                                onEdit={(it: any) => router.push(`/dashboard/vcard-links/${it.id}`)}
                                                onCopy={onCopy}
                                                copied={copiedSlug === item.slug}
                                                onToggle={handleToggle}
                                                onAction={(type: string) => {
                                                    if (type === 'delete') handleDelete(item);
                                                    if (type === 'duplicate') handleDuplicate(item);
                                                    if (type === 'reset') handleReset(item);
                                                    if (type === 'analytics') router.push(`/dashboard/vcard-links/analytics?page=${item.id}`);
                                                }}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile cards */}
                            <div className="sm:hidden flex flex-col gap-3 p-3">
                                {filtered.map((item) => (
                                    <VcardMobileCard
                                        key={item.id}
                                        item={item}
                                        onEdit={(it: any) => router.push(`/dashboard/vcard-links/${it.id}`)}
                                        onCopy={onCopy}
                                        copied={copiedSlug === item.slug}
                                        onToggle={handleToggle}
                                        onAction={(type: string) => {
                                            if (type === 'delete') handleDelete(item);
                                            if (type === 'duplicate') handleDuplicate(item);
                                            if (type === 'reset') handleReset(item);
                                            if (type === 'analytics') router.push(`/dashboard/vcard-links/analytics?page=${item.id}`);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <ModalShell
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setDraft({ slug: "", domain_id: 0 });
                }}
                title="Create New Digital Vcard"
                icon={<Contact size={20} className="sm:size-[22px]" />}
                maxWidthClassName="max-w-lg"
                footer={
                    <div className="flex gap-3">
                        <button onClick={() => setShowCreateModal(false)} className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[var(--border)] font-semibold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={onCreate}
                            disabled={isCreating || !draft.slug.trim()}
                            className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-primary text-white font-semibold text-xs sm:text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
                        >
                            {isCreating ? (
                                <><Loader2 size={16} className="sm:size-[18px] animate-spin" /> Creating...</>
                            ) : (
                                <><Plus size={16} className="sm:size-[18px]" /> Create Vcard</>
                            )}
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 sm:space-y-8 py-1">
                    <InputField
                        label="SLUG / CUSTOM PATH"
                        value={draft.slug}
                        onChange={(e: any) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="john-doe-business"
                    />

                    {domains.length > 0 && (
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">CUSTOM DOMAIN (OPTIONAL)</label>
                            <select
                                value={draft.domain_id}
                                onChange={(e: any) => setDraft((prev) => ({ ...prev, domain_id: parseInt(e.target.value) }))}
                                className="w-full h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold outline-none transition-all appearance-none"
                            >
                                <option value={0}>Use default domain</option>
                                {domains.map((d: any) => (
                                    <option key={d.id || d.domain_id} value={d.id || d.domain_id}>{d.domain}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex gap-3 sm:gap-4">
                        <Info size={18} className="sm:size-[22px] text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                        <div className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            Choose a memorable slug. This will be part of your public Vcard URL. You can edit everything later.
                        </div>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
}

function VcardLinkCard({ item, onEdit, onCopy, copied, onToggle, onAction }: any) {
    const publicUrl = item.full_url || `biolink.divyangtechlabs.com/${item.slug}`;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            onClick={() => onEdit(item)}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col cursor-pointer relative overflow-hidden h-full"
        >
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Contact className="w-24 h-24 sm:w-32 sm:h-32" />
            </div>

            <div className="flex justify-between items-start mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="text-2xl sm:text-3xl font-black tracking-tighter">{(item.name?.[0] || '?').toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-[var(--background)] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[var(--border)] text-[9px] sm:text-[10px] font-mono uppercase tracking-widest">
                    <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", item.active ? "bg-emerald-500 ring-1 ring-emerald-400/50" : "bg-slate-400")} />
                    {item.active ? "LIVE" : "OFF"}
                </div>
            </div>

            <div className="flex-1 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-base sm:text-xl tracking-tight line-clamp-2 group-hover:text-primary transition-colors">{item.name || "Untitled Vcard"}</h3>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[var(--muted-foreground)] font-mono break-all">
                    <Globe size={11} className="sm:size-[13px] text-primary/70 shrink-0" />
                    <span className="line-clamp-1">{publicUrl}</span>
                </div>
            </div>

            <div className="pt-4 sm:pt-6 mt-auto border-t border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onToggle(item)}
                        className={cn(
                            "relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full border-2 border-transparent transition-all duration-200",
                            item.active ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <span className={cn("block h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-white shadow transition-transform", item.active ? "translate-x-[18px] sm:translate-x-5" : "translate-x-0.5")} />
                    </button>
                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-1">
                        <MousePointer2 size={12} className="sm:size-[13px]" /> {item.clicks}
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCopy(publicUrl, item.slug); }}
                        className={cn("h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all", copied ? "bg-emerald-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
                    >
                        {copied ? <CheckCircle2 size={15} className="sm:size-[17px]" /> : <Copy size={15} className="sm:size-[17px]" />}
                    </button>
                    <ActionDropdown item={item} onEdit={onEdit} onAction={onAction} />
                </div>
            </div>
        </motion.div>
    );
}

function VcardLinkRow({ item, onEdit, onCopy, copied, onToggle, onAction }: any) {
    const publicUrl = item.full_url || `biolink.divyangtechlabs.com/${item.slug}`;

    return (
        <tr
            onClick={() => onEdit(item)}
            className="group hover:bg-[var(--card)]/70 transition-colors cursor-pointer border-b border-[var(--border)] last:border-none"
        >
            <td className="p-5 sm:p-6 lg:p-7">
                <div className="flex items-start gap-3 sm:gap-5">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Contact size={20} className="sm:size-[26px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm sm:text-base tracking-tight truncate">{item.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[var(--muted-foreground)] font-mono mt-0.5 sm:mt-1">
                            <Globe size={10} className="sm:size-3" />
                            <span className="truncate">{publicUrl}</span>
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-5 sm:px-6 lg:px-7 py-4 sm:py-7 text-center align-middle">
                <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[var(--background)] border border-[var(--border)] text-[11px] sm:text-xs font-medium">
                    <MousePointer2 size={12} className="sm:size-[14px] text-primary" />
                    {item.clicks} clicks
                </div>
            </td>

            <td className="p-5 sm:p-6 lg:p-7">
                <div className="flex items-center justify-end gap-2 sm:gap-4" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onToggle(item)}
                        className={cn(
                            "relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full border transition-all shrink-0",
                            item.active ? "bg-primary border-primary" : "bg-slate-200 dark:bg-slate-700 border-slate-300"
                        )}
                    >
                        <span className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-white shadow-md transition-all", item.active ? "translate-x-[18px] sm:translate-x-[22px]" : "translate-x-0.5")} />
                    </button>

                    <button
                        onClick={() => onCopy(publicUrl, item.slug)}
                        className={cn("p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-colors", copied ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
                    >
                        {copied ? <CheckCircle2 size={15} className="sm:size-[18px]" /> : <Copy size={15} className="sm:size-[18px]" />}
                    </button>

                    <ActionDropdown item={item} onEdit={onEdit} onAction={onAction} />
                </div>
            </td>
        </tr>
    );
}

function VcardMobileCard({ item, onEdit, onCopy, copied, onToggle, onAction }: any) {
    const publicUrl = item.full_url || `biolink.divyangtechlabs.com/${item.slug}`;

    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <button
                onClick={() => onEdit(item)}
                className="w-full text-left px-4 pt-4 pb-3"
            >
                <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="text-sm font-black">{(item.name?.[0] || '?').toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-snug">{item.name || "Untitled Vcard"}</h4>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-mono truncate flex items-center gap-1">
                            <Globe size={9} className="shrink-0" /> {publicUrl}
                        </p>
                    </div>
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider flex-shrink-0 border",
                        item.active
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", item.active ? "bg-emerald-500" : "bg-slate-400")} />
                        {item.active ? "Live" : "Off"}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onToggle(item)}
                            className={cn(
                                "relative inline-flex h-4 w-8 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-300",
                                item.active ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                            )}
                        >
                            <span className={cn("pointer-events-none block h-2.5 w-2.5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300", item.active ? "translate-x-[14px]" : "translate-x-0.5")} />
                        </button>
                        <span className="text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                            <MousePointer2 size={9} /> {item.clicks}
                        </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">Tap to edit →</span>
                </div>
            </button>

            <div className="border-t border-[var(--border)] grid grid-cols-4 divide-x divide-[var(--border)]">
                <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-primary hover:bg-primary/5 transition-colors group/btn">
                    <Pencil className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Edit</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onCopy(publicUrl, item.slug); }} className={cn("py-2.5 flex flex-col items-center justify-center gap-0.5 transition-colors group/btn", copied ? "text-primary" : "text-slate-400 hover:text-primary hover:bg-primary/5")}>
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">{copied ? "Copied" : "Copy"}</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onAction('analytics'); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors group/btn">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Stats</span>
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group/btn">
                            <MoreVertical className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">More</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                        <DropdownMenuItem onClick={() => onAction('duplicate')} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                            <Copy size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                            <QrCode size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">QR Code</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction('reset')} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                            <RefreshCcw size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Reset Stats</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/5" />
                        <DropdownMenuItem onClick={() => onAction('delete')} className="h-11 rounded-xl gap-3 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                            <Trash2 size={16} className="text-red-500" /> <span className="font-bold text-xs uppercase tracking-wider">Delete Vcard</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function ActionDropdown({ item, onEdit, onAction }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-foreground transition-all active:scale-95">
                    <MoreVertical size={16} className="sm:size-[18px]" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 sm:w-56 rounded-2xl p-1.5 shadow-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-xs sm:text-sm">
                    <Pencil size={15} className="sm:size-4" /> Edit Vcard
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-xs sm:text-sm opacity-70">
                    <QrCode size={15} className="sm:size-4" /> Generate QR Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('duplicate')} className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-xs sm:text-sm">
                    <Copy size={15} className="sm:size-4" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('analytics')} className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-xs sm:text-sm">
                    <BarChart3 size={15} className="sm:size-4" /> Deep Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('reset')} className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-xs sm:text-sm">
                    <RefreshCcw size={15} className="sm:size-4" /> Reset Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={() => onAction('delete')} className="cursor-pointer text-red-600 dark:text-red-500 rounded-xl py-2.5 px-3 flex items-center gap-3 text-xs sm:text-sm focus:bg-red-50 dark:focus:bg-red-950">
                    <Trash2 size={15} className="sm:size-4" /> Delete Vcard
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
