"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon, Image as ImageIcon, CheckCircle2, X, Globe, ArrowRight, Info, Copy, Sparkles, Crown, MoreVertical, BarChart2, QrCode, RefreshCw, Search, Layout, Grid } from "lucide-react";
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
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl min-h-screen sm:min-h-0 overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex-1 tracking-tight">{title}</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">{children}</div>
                    {footer && <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-14 pl-6 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
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
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 relative overflow-hidden">
            {/* Decorative Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-full space-y-8 relative z-10 p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <Sparkles size={24} />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                Bio Link Studio
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 data-tour="page-heading" className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                Bio Link Manager
                            </h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-xl text-sm sm:text-base">
                                Create and maintain your high-conversion bio links in one professional dashboard.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="h-14 w-full lg:w-auto px-8 rounded-2xl bg-primary text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" /> 
                        Add New Bio
                    </button>
                </motion.div>

                {/* Search & View Toggle Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:h-16 rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl px-6 py-4 sm:py-0 shadow-sm"
                >
                    <div className="flex items-center gap-4 w-full sm:flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search your bio links..."
                                className="w-full pl-10 h-10 bg-transparent text-sm font-medium focus:outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-xl p-1 h-10">
                            <button
                                onClick={() => setView('row')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg transition-all flex items-center gap-2",
                                    view === 'row' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                )}
                            >
                                <Layout className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider">List</span>
                            </button>
                            <button
                                onClick={() => setView('card')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg transition-all flex items-center gap-2",
                                    view === 'card' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                )}
                            >
                                <Grid className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Cards</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest">Synchronizing Studio...</p>
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-[3rem] border-2 border-dashed border-[var(--border)]"
                        >
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                <LinkIcon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Bio Links Found</h3>
                            <p className="text-[var(--muted-foreground)] max-w-xs mx-auto mb-8">
                                {search ? "Try adjusting your search query to find what you're looking for." : "Start your journey by creating your first professional bio link."}
                            </p>
                            {!search && (
                                <Button onClick={() => setShowAddModal(true)} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest">
                                    <Plus className="w-4 h-4 mr-2" /> Create First Bio
                                </Button>
                            )}
                        </motion.div>
                    ) : view === 'card' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Portfolio & URL</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-center">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)] text-right">Management</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.map((row) => (
                                            <BioLinkRow 
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
                        </div>
                    )}
                </div>

                {/* Available Accounts Footer */}
                {availableAccounts.length > 0 && !search && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="p-8 rounded-[2.5rem] border border-[var(--border)] bg-primary/5 dark:bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Crown size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-primary/70">Unused Connections</p>
                                <p className="text-sm font-medium text-[var(--muted-foreground)]">You have connected accounts waiting for a bio link.</p>
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
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-primary/20 text-primary bg-white dark:bg-slate-900 flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    <Plus size={14} /> @{acc.username || acc.name}
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
                    <div className="flex gap-4">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl border border-[var(--border)] text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="flex-[1.5] h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            {isCreating ? "Creating Studio..." : "Create Now"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-8 py-2">
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
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Bio Description</label>
                        <textarea
                            value={newBio.description}
                            onChange={(e: any) => setNewBio({ ...newBio, description: e.target.value })}
                            rows={3}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/50 text-sm font-semibold text-slate-900 dark:text-white outline-none resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner"
                            placeholder="A professional intro for your bio..."
                        />
                    </div>
                    {domains.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Custom Domain</label>
                            <select
                                value={newBio.domain_id}
                                onChange={(e: any) => setNewBio({ ...newBio, domain_id: parseInt(e.target.value) })}
                                className="w-full h-14 pl-6 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                            >
                                <option value={0}>Default domain</option>
                                {domains.map((d: any) => (
                                    <option key={d.domain_id || d.id} value={d.domain_id || d.id}>{d.domain}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="p-5 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                        <Info size={18} className="text-amber-600 mt-1 shrink-0" />
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 font-bold uppercase tracking-tight leading-relaxed">
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
            className="group bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-500 flex flex-col gap-5 relative overflow-hidden cursor-pointer"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Globe className="w-24 h-24" />
            </div>

            <div className="flex items-start justify-between relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <span className="text-xl font-black">{(row.username?.[0] || "B").toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background)] border border-[var(--border)] shadow-sm">
                    <span className={cn("w-1.5 h-1.5 rounded-full", row.is_enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">
                        {row.is_enabled ? "Active" : "Draft"}
                    </span>
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">{row.title || `@${row.username}`}</h3>
                <p className="text-xs text-[var(--muted-foreground)] font-medium truncate opacity-60 group-hover:opacity-100 transition-opacity">{publicUrl}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] relative z-10">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => onAction('toggle')}
                        className={cn(
                            "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300",
                            row.is_enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                        )}
                    >
                        <span className={cn("pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300", row.is_enabled ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">Status</span>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onCopy(row)} className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all border", copied ? "bg-primary text-white border-primary" : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 text-slate-500")}>
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    <ActionDropdown row={row} onAction={onAction} onEdit={onEdit} />
                </div>
            </div>
        </div>
    );
}

function BioLinkRow({ row, onEdit, onCopy, onAction, copied }: any) {
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
            <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onCopy(row)} className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm", copied ? "bg-primary text-white border-primary" : "bg-white dark:bg-white/5 border-[var(--border)] text-slate-500 hover:text-primary hover:border-primary/30")}>
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    <ActionDropdown row={row} onAction={onAction} onEdit={onEdit} />
                </div>
            </td>
        </tr>
    );
}

function ActionDropdown({ row, onAction, onEdit }: any) {
    const router = useRouter();
    const { showModal } = useModal();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuItem onClick={() => onEdit(row)} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                    <Edit3 size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Edit Studio</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => router.push(`/dashboard/instagram/bio-links/analytics?page=${row.pageId}`)}>
                    <BarChart2 size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => onAction('duplicate')}>
                    <Copy size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Duplicate</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => onAction('reset')}>
                    <RefreshCw size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Reset Base</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/5" />
                <DropdownMenuItem onClick={() => onAction('delete')} className="h-11 rounded-xl gap-3 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                    <Trash2 size={16} className="text-red-500" /> <span className="font-bold text-xs uppercase tracking-wider">Destroy Page</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

