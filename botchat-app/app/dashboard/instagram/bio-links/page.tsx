"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit3, Loader2, Link as LinkIcon, CheckCircle2, X, Globe, Info, Copy, Sparkles, Crown, MoreVertical, BarChart2, RefreshCw, Search, Layout, Grid, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/providers/ModalProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBioPages, deleteBioPage, createBioPage, duplicateBioPage, resetBioPage, toggleBioPageStatus } from "@/store/slices/bioSlice";
import { fetchDomains } from "@/store/slices/domainsSlice";

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 60 }}
                    transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    className={cn("relative z-10 w-full bg-[var(--card)] dark:bg-slate-950 rounded-none sm:rounded-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="sm:hidden flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1 rounded-full bg-[var(--muted)]/70 dark:bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-4 px-5 sm:px-8 pt-4 sm:pt-8 pb-4 sm:pb-6 border-b border-[var(--border)] dark:border-[var(--border)] shrink-0">
                        {icon && <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</div>}
                        <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] dark:text-white flex-1 tracking-tight truncate">{title}</h2>
                        <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80 transition-colors shrink-0">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 sm:p-8">{children}</div>
                    {footer && <div className="px-5 sm:px-8 py-4 sm:py-6 border-t border-[var(--border)] dark:border-[var(--border)] bg-[var(--muted)]/50 dark:bg-[var(--background)]">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-1.5 sm:space-y-2">
        <label className="text-[10px] sm:text-[11px] font-black text-[var(--muted-foreground)]/70 dark:text-[var(--muted-foreground)] uppercase tracking-[0.2em] ml-2">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--background)] border-2 border-transparent focus:border-[var(--border)]/70 dark:focus:border-[var(--border)] text-sm font-semibold text-[var(--foreground)] dark:text-white outline-none transition-all placeholder:text-[var(--muted-foreground)]/50 dark:placeholder:text-[var(--muted-foreground)]"
            />
        </div>
    </div>
);

type InstagramAccount = {
    id: number | string;
    username?: string;
    name?: string;
};

type BioLinkRow = {
    pageId: string;
    username: string;
    profileId: string | number;
    slug?: string;
    title?: string;
    is_enabled?: boolean;
};

export default function InstagramBioLinksPage() {
    const router = useRouter();
    const { showModal } = useModal();
    const dispatch = useAppDispatch();
    const { pages, isLoading: isPagesLoading } = useAppSelector(s => s.bio);
    const { domains } = useAppSelector((state) => state.domains);

    const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'delete' | 'duplicate' | 'reset' | 'toggle'; row: BioLinkRow | null }>({ isOpen: false, type: 'delete', row: null });
    const [newBio, setNewBio] = useState({ url: "", name: "", description: "", domain_id: 0 });
    const [search, setSearch] = useState("");
    const [view, setView] = useState<'row' | 'card'>('row');

    const handleCreate = async () => {
        if (!newBio.url || !newBio.name) {
            showModal("error", "Error", "URL and Name are required.");
            return;
        }
        setIsCreating(true);
        try {
            const payload: any = { url: newBio.url, name: newBio.name, description: newBio.description };
            if (newBio.domain_id) payload.domain_id = newBio.domain_id;
            await dispatch(createBioPage(payload)).unwrap();
            setShowAddModal(false);
            setNewBio({ url: "", name: "", description: "", domain_id: 0 });
            showModal("success", "Success", "Bio link created successfully.");
        } catch (err: any) {
            showModal("error", "Error", err || "Failed to create bio link.");
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        dispatch(fetchBioPages());
        dispatch(fetchDomains());
    }, [dispatch]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            setIsLoadingAccounts(true);
            try {
                const accRes = await api.get("/social/instagram-connect");
                const accs = accRes.data?.data?.instagram_accounts || [];
                if (!active) return;
                setAccounts(accs);
            } catch {
                if (active) showModal("error", "Error", "Failed to load instagram accounts.");
            } finally {
                if (active) setIsLoadingAccounts(false);
            }
        };
        load();
        return () => { active = false; };
    }, [showModal]);

    const rows = useMemo(() => {
        return pages.map(page => ({
            pageId: page.link_id,
            profileId: page.link_id as any,
            username: page.url,
            slug: page.url,
            title: page.title,
            is_enabled: page.is_enabled === "1" || page.is_enabled === true || page.is_enabled === "true"
        } as BioLinkRow));
    }, [pages]);

    const filteredRows = useMemo(() => {
        return rows.filter(r =>
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.username?.toLowerCase().includes(search.toLowerCase())
        );
    }, [rows, search]);

    const rowsMap = useMemo(() => {
        const map = new Map<string, BioLinkRow>();
        rows.forEach((row) => map.set(row.pageId, row));
        return map;
    }, [rows]);

    const isLoading = isPagesLoading || isLoadingAccounts;

    const handleCopy = (row: BioLinkRow) => {
        const url = typeof window !== "undefined"
            ? `${window.location.origin}/p?u=${row.username}&id=${row.pageId}`
            : `/p?u=${row.username}&id=${row.pageId}`;
        navigator.clipboard.writeText(url);
        setCopiedId(row.pageId);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleEdit = (row: BioLinkRow) => {
        router.push(`/dashboard/instagram/bio-link?page=${row.pageId}`);
    };

    const confirmAction = async () => {
        if (!actionModal.row) return;
        const linkId = actionModal.row.profileId as string;

        try {
            if (actionModal.type === 'delete') {
                await dispatch(deleteBioPage(linkId)).unwrap();
                showModal("success", "Deleted", "Bio link deleted successfully.");
            } else if (actionModal.type === 'duplicate') {
                await dispatch(duplicateBioPage(linkId)).unwrap();
                showModal("success", "Duplicated", "Bio link duplicated successfully.");
            } else if (actionModal.type === 'reset') {
                await dispatch(resetBioPage(linkId)).unwrap();
                showModal("success", "Reset", "Bio link reset successfully.");
            } else if (actionModal.type === 'toggle') {
                await dispatch(toggleBioPageStatus(linkId)).unwrap();
                showModal("success", "Updated", "Bio link status updated.");
            }
        } catch (err: any) {
            showModal("error", "Error", err || `Failed to ${actionModal.type} bio link.`);
        } finally {
            setActionModal({ isOpen: false, type: 'delete', row: null });
        }
    };

    const availableAccounts = accounts.filter((acc) => !rowsMap.has(String(acc.id)));

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 relative">
            {/* Decorative Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-full space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6"
                >
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <Sparkles size={20} className="sm:size-6" />
                            </div>
                            <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                                Bio Link Studio
                            </div>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                            <h1 data-tour="page-heading" className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[var(--foreground)] dark:text-white">
                                Bio Link Manager
                            </h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-xl text-xs sm:text-sm md:text-base">
                                Create and maintain your high-conversion bio links in one professional dashboard.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="h-12 sm:h-14 w-full lg:w-auto px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white text-[11px] sm:text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <Plus size={16} className="sm:size-[18px] group-hover:rotate-90 transition-transform duration-500" />
                        Add New Bio
                    </button>
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
                                placeholder="Search your bio links..."
                                className="w-full pl-9 sm:pl-10 h-9 sm:h-10 bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
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
                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">Synchronizing Studio...</p>
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-[var(--border)]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                                <LinkIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">No Bio Links Found</h3>
                            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xs mx-auto mb-6 sm:mb-8">
                                {search ? "Try adjusting your search query to find what you're looking for." : "Start your journey by creating your first professional bio link."}
                            </p>
                            {!search && (
                                <Button onClick={() => setShowAddModal(true)} className="rounded-xl sm:rounded-2xl h-10 sm:h-12 px-6 sm:px-8 text-[11px] sm:text-[13px] font-black uppercase tracking-widest">
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" /> Create First Bio
                                </Button>
                            )}
                        </motion.div>
                    ) : view === 'card' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {filteredRows.map((row) => (
                                <BioLinkCard
                                    key={row.pageId}
                                    row={row}
                                    onEdit={handleEdit}
                                    onCopy={handleCopy}
                                    onAction={(type) => setActionModal({ isOpen: true, type, row })}
                                    copied={copiedId === row.pageId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Portfolio & URL</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-center">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-right">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.map((row) => (
                                            <BioLinkTableRow
                                                key={row.pageId}
                                                row={row}
                                                onEdit={handleEdit}
                                                onCopy={handleCopy}
                                                onAction={(type) => setActionModal({ isOpen: true, type, row })}
                                                copied={copiedId === row.pageId}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Mobile cards */}
                            <div className="md:hidden flex flex-col gap-3 p-3 sm:p-4">
                                {filteredRows.map((row) => (
                                    <BioLinkMobileCard
                                        key={row.pageId}
                                        row={row}
                                        onEdit={handleEdit}
                                        onCopy={handleCopy}
                                        onAction={(type) => setActionModal({ isOpen: true, type, row })}
                                        copied={copiedId === row.pageId}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Available Accounts Footer */}
                {availableAccounts.length > 0 && !search && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-primary/5 dark:bg-[var(--card)]/5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Crown size={16} className="sm:size-5" />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/70">Unused Connections</p>
                                <p className="text-xs sm:text-sm font-medium text-[var(--muted-foreground)]">You have connected accounts waiting for a bio link.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {availableAccounts.map((acc) => (
                                <button
                                    key={String(acc.id)}
                                    onClick={() => {
                                        setNewBio({ ...newBio, url: acc.username || "", name: acc.name || acc.username || "" });
                                        setShowAddModal(true);
                                    }}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border border-primary/20 text-primary bg-[var(--card)] dark:bg-[var(--background)] flex items-center gap-1.5 sm:gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    <Plus size={12} className="sm:size-3.5" /> @{acc.username || acc.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modals */}
            <ModalShell
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Create Bio Page"
                icon={<Globe size={20} />}
                footer={
                    <div className="flex gap-3 sm:gap-4">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[var(--border)] text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[10px] sm:text-[11px] hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--card)]/5 transition-colors">Cancel</button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="flex-[1.5] h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] sm:text-[11px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50"
                        >
                            {isCreating ? <Loader2 size={16} className="sm:size-[18px] animate-spin" /> : <Plus size={16} className="sm:size-[18px]" />}
                            {isCreating ? "Creating Studio..." : "Create Now"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-5 sm:space-y-8 py-1 sm:py-2">
                    <InputField
                        label="Unique Username (Slug)"
                        value={newBio.url}
                        onChange={(e: any) => setNewBio({ ...newBio, url: e.target.value })}
                        placeholder="e.g. myportfolio"
                    />
                    <InputField
                        label="Portfolio Title"
                        value={newBio.name}
                        onChange={(e: any) => setNewBio({ ...newBio, name: e.target.value })}
                        placeholder="e.g. John Doe - Designer"
                    />
                    <div className="space-y-1.5 sm:space-y-2">
                        <label className="text-[10px] sm:text-[11px] font-black text-[var(--muted-foreground)]/70 dark:text-[var(--muted-foreground)] uppercase tracking-[0.2em] ml-2">Bio Description</label>
                        <textarea
                            value={newBio.description}
                            onChange={(e: any) => setNewBio({ ...newBio, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--background)] border-2 border-transparent focus:border-primary/50 text-sm font-semibold text-[var(--foreground)] dark:text-white outline-none resize-none transition-all placeholder:text-[var(--muted-foreground)]/50 dark:placeholder:text-[var(--muted-foreground)] shadow-inner"
                            placeholder="A professional intro for your bio..."
                        />
                    </div>
                    {domains.length > 0 && (
                        <div className="space-y-1.5 sm:space-y-2">
                            <label className="text-[10px] sm:text-[11px] font-black text-[var(--muted-foreground)]/70 dark:text-[var(--muted-foreground)] uppercase tracking-[0.2em] ml-2">Custom Domain</label>
                            <select
                                value={newBio.domain_id}
                                onChange={(e: any) => setNewBio({ ...newBio, domain_id: parseInt(e.target.value) })}
                                className="w-full h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--background)] border-2 border-transparent focus:border-[var(--border)]/70 dark:focus:border-[var(--border)] text-sm font-semibold text-[var(--foreground)] dark:text-white outline-none transition-all"
                            >
                                <option value={0}>Default domain</option>
                                {domains.map((d: any) => (
                                    <option key={d.domain_id || d.id} value={d.domain_id || d.id}>{d.domain}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-3 sm:gap-4">
                        <Info size={16} className="sm:size-[18px] text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[10px] sm:text-[11px] text-amber-700/80 dark:text-amber-500/80 font-bold uppercase tracking-tight leading-relaxed">
                            Your slug will be your public link. Choose something memorable as it cannot be changed easily after the studio is launched.
                        </p>
                    </div>
                </div>
            </ModalShell>

            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                onConfirm={confirmAction}
                title={actionModal.type === 'delete' ? 'Delete Bio Page?' : actionModal.type === 'duplicate' ? 'Duplicate Studio?' : actionModal.type === 'toggle' ? 'Update Status?' : 'Reset Studio?'}
                message={
                    actionModal.type === 'delete' ? 'This action is permanent and will destroy all content blocks in this studio.' :
                        actionModal.type === 'duplicate' ? 'This will create an exact replica of your blocks and theme settings.' :
                            actionModal.type === 'toggle' ? `Are you sure you want to ${actionModal.row?.is_enabled ? 'take this studio offline' : 'publish this studio to the web'}?` :
                                'This will restore your bio link back to its initial system default state.'
                }
                type={actionModal.type === 'delete' ? 'danger' : 'warning'}
                confirmText={actionModal.type === 'delete' ? 'Delete' : actionModal.type === 'duplicate' ? 'Duplicate' : actionModal.type === 'toggle' ? 'Confirm' : 'Reset'}
            />
        </div>
    );
}

function BioLinkCard({ row, onEdit, onCopy, onAction, copied }: any) {
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${row.username}&id=${row.pageId}`
        : `/p?u=${row.username}&id=${row.pageId}`;

    return (
        <div
            onClick={() => onEdit(row)}
            className="group bg-[var(--card)] border border-[var(--border)] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-500 flex flex-col gap-4 sm:gap-5 relative overflow-hidden cursor-pointer"
        >
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Globe className="w-20 h-20 sm:w-24 sm:h-24" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <span className="text-base sm:text-xl font-black">{(row.username?.[0] || "B").toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-sm">
                    <span className={cn("w-1.5 h-1.5 rounded-full", row.is_enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        {row.is_enabled ? "Active" : "Draft"}
                    </span>
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="font-bold text-base sm:text-lg group-hover:text-primary transition-colors truncate">{row.title || `@${row.username}`}</h3>
                <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] font-medium truncate opacity-60 group-hover:opacity-100 transition-opacity">{publicUrl}</p>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[var(--border)] relative z-10">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => onAction('toggle')}
                        className={cn(
                            "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300",
                            row.is_enabled ? "bg-primary" : "bg-[var(--muted)]/70 dark:bg-[var(--muted)]"
                        )}
                    >
                        <span className={cn("pointer-events-none block h-3.5 w-3.5 rounded-full bg-[var(--card)] shadow-lg ring-0 transition-transform duration-300", row.is_enabled ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] text-[var(--muted-foreground)]/70">Status</span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onCopy(row)} title="Copy link" className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all border", copied ? "bg-primary text-white border-primary" : "bg-[var(--muted)]/50 dark:bg-[var(--card)]/5 border-transparent hover:border-[var(--border)] text-[var(--muted-foreground)]")}>
                        {copied ? <CheckCircle2 size={14} className="sm:size-4" /> : <Copy size={14} className="sm:size-4" />}
                    </button>
                    <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View live page"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all border border-transparent hover:border-violet-200 dark:hover:border-violet-800 text-[var(--muted-foreground)]/70 hover:text-violet-600 bg-[var(--muted)]/50 dark:bg-[var(--card)]/5"
                    >
                        <ExternalLink size={14} className="sm:size-4" />
                    </a>
                    <ActionDropdown row={row} onAction={onAction} onEdit={onEdit} />
                </div>
            </div>
        </div>
    );
}

function BioLinkTableRow({ row, onEdit, onCopy, onAction, copied }: any) {
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${row.username}&id=${row.pageId}`
        : `/p?u=${row.username}&id=${row.pageId}`;

    return (
        <tr
            onClick={() => onEdit(row)}
            className="group hover:bg-primary/[0.02] transition-colors border-b border-[var(--border)]/50 last:border-none cursor-pointer"
        >
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <span className="text-lg font-black">{(row.username?.[0] || "B").toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-base truncate group-hover:text-primary transition-colors leading-tight">{row.title || `@${row.username}`}</p>
                        <p className="text-[11px] text-[var(--muted-foreground)] font-bold flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Globe size={10} className="text-primary" /> {publicUrl}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tighter bg-[var(--background)]">
                    <div className={cn("w-1.5 h-1.5 rounded-full", row.is_enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                    {row.is_enabled ? 'Live' : 'Draft'}
                </div>
            </td>
            <td className="px-6 py-5 text-right">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onCopy(row)} title="Copy link" className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all border shadow-sm", copied ? "bg-primary text-white border-primary" : "bg-[var(--card)] dark:bg-[var(--card)]/5 border-[var(--border)] text-[var(--muted-foreground)] hover:text-primary hover:border-primary/30")}>
                        {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                    </button>
                    <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="View live page"
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border shadow-sm bg-[var(--card)] dark:bg-[var(--card)]/5 border-[var(--border)] text-[var(--muted-foreground)] hover:text-violet-600 hover:border-violet-300 dark:hover:border-violet-700"
                    >
                        <ExternalLink size={15} />
                    </a>
                    <ActionDropdown row={row} onAction={onAction} onEdit={onEdit} />
                </div>
            </td>
        </tr>
    );
}

function BioLinkMobileCard({ row, onEdit, onCopy, onAction, copied }: any) {
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${row.username}&id=${row.pageId}`
        : `/p?u=${row.username}&id=${row.pageId}`;


    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <button
                onClick={() => onEdit(row)}
                className="w-full text-left px-4 pt-4 pb-3"
            >
                <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="text-sm font-black">{(row.username?.[0] || "B").toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[var(--foreground)] dark:text-white truncate leading-snug">{row.title || `@${row.username}`}</h4>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium truncate flex items-center gap-1">
                            <Globe size={9} className="shrink-0" /> {publicUrl}
                        </p>
                    </div>
                    <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 border",
                        row.is_enabled
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-[var(--muted)]/50 text-[var(--muted-foreground)] border-[var(--border)]"
                    )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", row.is_enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                        {row.is_enabled ? "Live" : "Draft"}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]/70" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onAction('toggle')}
                            className={cn(
                                "relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300",
                                row.is_enabled ? "bg-primary" : "bg-[var(--muted)]/70 dark:bg-[var(--muted)]"
                            )}
                        >
                            <span className={cn("pointer-events-none block h-2.5 w-2.5 rounded-full bg-[var(--card)] shadow-lg ring-0 transition-transform duration-300", row.is_enabled ? "translate-x-[14px]" : "translate-x-0.5")} />
                        </button>
                        <span className="text-[8px] font-black uppercase tracking-wider">Status</span>
                    </div>
                    <span className="text-[9px] text-[var(--muted-foreground)]/70 font-medium">Tap to manage →</span>
                </div>
            </button>

            <div className="border-t border-[var(--border)] grid grid-cols-4 divide-x divide-[var(--border)]">
                <button onClick={(e) => { e.stopPropagation(); onEdit(row); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-primary hover:bg-primary/5 transition-colors group/btn">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Edit</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onCopy(row); }} className={cn("py-2.5 flex flex-col items-center justify-center gap-0.5 transition-colors group/btn", copied ? "text-primary" : "text-[var(--muted-foreground)]/70 hover:text-primary hover:bg-primary/5")}>
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">{copied ? "Copied" : "Copy"}</span>
                </button>
                <a onClick={(e) => e.stopPropagation()} href={publicUrl} target="_blank" rel="noopener noreferrer" className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-[var(--muted-foreground)]/70 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors group/btn">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">View</span>
                </a>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-[var(--muted-foreground)]/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group/btn">
                            <MoreVertical className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">More</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-[var(--border)] dark:border-white/10 bg-[var(--card)]/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                        <DropdownMenuItem onClick={() => onAction('duplicate')} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                            <Copy size={16} className="text-[var(--muted-foreground)]" /> <span className="font-bold text-xs uppercase tracking-wider">Duplicate</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction('reset')} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                            <RefreshCw size={16} className="text-[var(--muted-foreground)]" /> <span className="font-bold text-xs uppercase tracking-wider">Reset Base</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-[var(--muted)]/50 dark:bg-[var(--card)]/5" />
                        <DropdownMenuItem onClick={() => onAction('delete')} className="h-11 rounded-xl gap-3 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                            <Trash2 size={16} className="text-red-500" /> <span className="font-bold text-xs uppercase tracking-wider">Destroy Page</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function ActionDropdown({ row, onAction, onEdit }: any) {
    const router = useRouter();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)]/60 dark:hover:bg-[var(--card)]/10 transition-all text-[var(--muted-foreground)]/70 hover:text-[var(--muted-foreground)]">
                    <MoreVertical size={16} className="sm:size-[18px]" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 sm:w-60 p-2 rounded-2xl border-[var(--border)] dark:border-white/10 bg-[var(--card)]/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuItem onClick={() => onEdit(row)} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                    <Edit3 size={16} className="text-[var(--muted-foreground)]" /> <span className="font-bold text-xs uppercase tracking-wider">Edit Studio</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => router.push(`/dashboard/instagram/bio-links/analytics?page=${row.pageId}`)}>
                    <BarChart2 size={16} className="text-[var(--muted-foreground)]" /> <span className="font-bold text-xs uppercase tracking-wider">Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => onAction('duplicate')}>
                    <Copy size={16} className="text-[var(--muted-foreground)]" /> <span className="font-bold text-xs uppercase tracking-wider">Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => onAction('reset')}>
                    <RefreshCw size={16} className="text-[var(--muted-foreground)]" /> <span className="font-bold text-xs uppercase tracking-wider">Reset Base</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-[var(--muted)]/50 dark:bg-[var(--card)]/5" />
                <DropdownMenuItem onClick={() => onAction('delete')} className="h-11 rounded-xl gap-3 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                    <Trash2 size={16} className="text-red-500" /> <span className="font-bold text-xs uppercase tracking-wider">Destroy Page</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
