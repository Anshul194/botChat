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
                    initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl min-h-screen sm:min-h-0 overflow-hidden flex flex-col max-h-[92vh] shadow-2xl", maxWidthClassName)}>
                    <div className="flex items-center gap-4 px-6 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{icon}</div>}
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex-1 tracking-tight pr-2">{title}</h2>
                        <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scroll">{children}</div>
                    {footer && <div className="px-6 sm:px-8 py-5 sm:py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-12 sm:h-14 pl-5 sm:pl-6 pr-5 sm:pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-sm focus:shadow-inner"
            />
        </div>
    </div>
);

export default function VcardLinksPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
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
            {/* Decorative Background Glows - Responsive */}
            <div className="fixed top-[-15%] right-[-15%] w-[60%] h-[60%] md:w-[45%] md:h-[45%] bg-primary/8 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="fixed bottom-[-20%] left-[-20%] w-[55%] h-[55%] md:w-[40%] md:h-[40%] bg-accent/5 rounded-full blur-[130px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto space-y-8 relative z-10 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
                {/* Header Section - Better Mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8"
                >
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10 flex-shrink-0">
                                <Contact size={24} />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">
                                Bio Link Studio
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Vcard Links</h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-md lg:max-w-xl text-sm sm:text-base">
                                Manage your professional digital business cards and track their performance.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-primary text-white text-xs sm:text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.97] transition-all group w-full sm:w-auto"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        Create New Vcard
                    </button>
                </motion.div>

                {/* Search & View Toggle - Improved Mobile */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 sm:items-center bg-[var(--card)] border border-[var(--border)] rounded-3xl p-2 sm:p-1.5 shadow-sm"
                >
                    <div className="relative flex-1 max-w-full sm:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
                        <input
                            placeholder="Search by name or slug..."
                            className="w-full pl-12 pr-5 h-12 sm:h-11 bg-transparent text-sm font-medium focus:outline-none rounded-2xl sm:rounded-[22px]"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-2xl p-1 h-11 sm:h-10 flex-shrink-0 w-full sm:w-auto">
                        <button
                            onClick={() => setView('row')}
                            className={cn(
                                "flex-1 sm:flex-none px-5 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm",
                                view === 'row' ? "bg-primary text-primary-foreground shadow" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted-foreground)]"
                            )}
                        >
                            <Layout className="w-4 h-4" />
                            <span className="font-semibold text-xs tracking-wider hidden sm:inline">List</span>
                        </button>
                        <button
                            onClick={() => setView('card')}
                            className={cn(
                                "flex-1 sm:flex-none px-5 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm",
                                view === 'card' ? "bg-primary text-primary-foreground shadow" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted-foreground)]"
                            )}
                        >
                            <Grid className="w-4 h-4" />
                            <span className="font-semibold text-xs tracking-wider hidden sm:inline">Cards</span>
                        </button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="min-h-[420px]">
                    {isLoading && vcardLinks.length === 0 ? (
                        <div className="h-[420px] flex flex-col items-center justify-center gap-5 text-[var(--muted-foreground)]">
                            <Loader2 className="w-9 h-9 animate-spin text-primary" />
                            <p className="text-sm font-semibold uppercase tracking-[0.125em]">Loading your Vcards...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[420px] flex flex-col items-center justify-center text-center px-6 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)]"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
                                <Contact className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 tracking-tight">No Vcards Yet</h3>
                            <p className="text-[var(--muted-foreground)] max-w-xs mx-auto mb-8 text-balance">
                                {query ? "No matches found. Try different keywords." : "Create your first digital business card to get started."}
                            </p>
                            {!query && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="h-12 px-8 rounded-2xl bg-primary text-white font-semibold flex items-center gap-3 hover:bg-primary/90 transition-colors text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Create Your First Vcard
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
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-xl overflow-hidden">
                            <table className="w-full text-left border-collapse min-w-full">
                                <thead className="hidden sm:table-header-group border-b border-[var(--border)] bg-[var(--background)]/70">
                                    <tr>
                                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] text-left">Identity</th>
                                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-[var(--muted-foreground)] text-center">URL</th>
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
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal - Enhanced */}
            <ModalShell
                open={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setDraft({ slug: "", domain_id: 0 });
                }}
                title="Create New Digital Vcard"
                icon={<Contact size={22} />}
                maxWidthClassName="max-w-lg"
                footer={
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1 h-12 sm:h-14 rounded-2xl border border-[var(--border)] font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onCreate}
                            disabled={isCreating || !draft.slug.trim()}
                            className="flex-1 h-12 sm:h-14 rounded-2xl bg-primary text-white font-semibold text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
                        >
                            {isCreating ? (
                                <><Loader2 size={18} className="animate-spin" /> Creating...</>
                            ) : (
                                <><Plus size={18} /> Create Vcard</>
                            )}
                        </button>
                    </div>
                }
            >
                <div className="space-y-8 py-1">
                    <InputField
                        label="SLUG / CUSTOM PATH"
                        value={draft.slug}
                        onChange={(e: any) => setDraft((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="john-doe-business"
                    />

                    {domains.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">CUSTOM DOMAIN (OPTIONAL)</label>
                            <select
                                value={draft.domain_id}
                                onChange={(e: any) => setDraft((prev) => ({ ...prev, domain_id: parseInt(e.target.value) }))}
                                className="w-full h-12 sm:h-14 pl-5 sm:pl-6 pr-5 sm:pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold outline-none transition-all appearance-none"
                            >
                                <option value={0}>Use default domain (biolink.divyangtechlabs.com)</option>
                                {domains.map((d: any) => (
                                    <option key={d.id || d.domain_id} value={d.id || d.domain_id}>{d.domain}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6 flex gap-4">
                        <Info size={22} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            Choose a memorable slug. This will be part of your public Vcard URL. You can edit everything later.
                        </div>
                    </div>
                </div>
            </ModalShell>
        </div>
    );
}

// Card Component - Better Responsive UI
function VcardLinkCard({ item, onEdit, onCopy, copied, onToggle, onAction }: any) {
    const publicUrl = item.full_url || `biolink.divyangtechlabs.com/${item.slug}`;

    return (
        <motion.div
            whileHover={{ y: -4 }}
            onClick={() => onEdit(item)}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col cursor-pointer relative overflow-hidden h-full"
        >
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Contact className="w-32 h-32" />
            </div>

            <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="text-3xl font-black tracking-tighter">{(item.name?.[0] || '?').toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2 bg-[var(--background)] px-3 py-1 rounded-full border border-[var(--border)] text-[10px] font-mono uppercase tracking-widest">
                    <div className={cn("w-2 h-2 rounded-full", item.active ? "bg-emerald-500 ring-1 ring-emerald-400/50" : "bg-slate-400")} />
                    {item.active ? "LIVE" : "PAUSED"}
                </div>
            </div>

            <div className="flex-1 space-y-3">
                <h3 className="font-semibold text-xl tracking-tight line-clamp-2 group-hover:text-primary transition-colors min-h-[3.2em]">{item.name || "Untitled Vcard"}</h3>

                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] font-mono break-all">
                    <Globe size={13} className="text-primary/70" />
                    <span className="line-clamp-1">{publicUrl}</span>
                </div>
            </div>

            <div className="pt-6 mt-auto border-t border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onToggle(item)}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full border-2 border-transparent transition-all duration-200",
                            item.active ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                        )}
                    >
                        <span className={cn("block h-4 w-4 rounded-full bg-white shadow transition-transform", item.active ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                    <div className="text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-1">
                        <MousePointer2 size={13} /> {item.clicks}
                    </div>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onCopy(publicUrl, item.slug); }}
                        className={cn("h-9 w-9 flex items-center justify-center rounded-2xl transition-all", copied ? "bg-emerald-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
                    >
                        {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
                    </button>
                    <ActionDropdown item={item} onEdit={onEdit} onAction={onAction} />
                </div>
            </div>
        </motion.div>
    );
}

// Row Component - Responsive Table Row
function VcardLinkRow({ item, onEdit, onCopy, copied, onToggle, onAction }: any) {
    const publicUrl = item.full_url || `biolink.divyangtechlabs.com/${item.slug}`;

    return (
        <tr
            onClick={() => onEdit(item)}
            className="group hover:bg-[var(--card)]/70 transition-colors cursor-pointer border-b border-[var(--border)] last:border-none"
        >
            {/* Mobile Stacked + Desktop Table */}
            <td className="p-5 sm:p-6 lg:p-7 block sm:table-cell">
                <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Contact size={26} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="font-semibold text-[15px] sm:text-base tracking-tight truncate">{item.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] font-mono mt-1">
                            <Globe size={12} />
                            <span className="truncate">{publicUrl}</span>
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-5 sm:px-6 lg:px-7 py-4 sm:py-7 hidden sm:table-cell text-center align-middle">
                <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[var(--background)] border border-[var(--border)] text-xs font-medium">
                    <MousePointer2 size={14} className="text-primary" />
                    {item.clicks} clicks
                </div>
            </td>

            <td className="p-5 sm:p-6 lg:p-7 block sm:table-cell">
                <div className="flex items-center justify-end gap-3 sm:gap-4" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onToggle(item)}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full border transition-all",
                            item.active ? "bg-primary border-primary" : "bg-slate-200 dark:bg-slate-700 border-slate-300"
                        )}
                    >
                        <span className={cn("h-4 w-4 rounded-full bg-white shadow-md transition-all", item.active ? "translate-x-[22px]" : "translate-x-0.5")} />
                    </button>

                    <button
                        onClick={() => onCopy(publicUrl, item.slug)}
                        className={cn("p-2.5 rounded-2xl border transition-colors", copied ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "hover:bg-slate-100 dark:hover:bg-slate-800")}
                    >
                        {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    </button>

                    <ActionDropdown item={item} onEdit={onEdit} onAction={onAction} />
                </div>
            </td>
        </tr>
    );
}

function ActionDropdown({ item, onEdit, onAction }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 rounded-2xl border border-[var(--border)] hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-foreground transition-all active:scale-95">
                    <MoreVertical size={18} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-sm">
                    <Pencil size={16} /> Edit Vcard
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-sm opacity-70">
                    <QrCode size={16} /> Generate QR Code
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('duplicate')} className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-sm">
                    <Copy size={16} /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('reset')} className="cursor-pointer rounded-xl py-2.5 px-3 flex items-center gap-3 text-sm">
                    <RefreshCcw size={16} /> Reset Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={() => onAction('delete')} className="cursor-pointer text-red-600 dark:text-red-500 rounded-xl py-2.5 px-3 flex items-center gap-3 text-sm focus:bg-red-50 dark:focus:bg-red-950">
                    <Trash2 size={16} /> Delete Vcard
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
