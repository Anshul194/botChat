"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon, Image as ImageIcon, CheckCircle2, X, Globe, ArrowRight, Info, Copy, Sparkles, Crown, MoreVertical, BarChart2, QrCode, RefreshCw } from "lucide-react";
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
import { useModal } from "@/components/providers/ModalProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBioPages, deleteBioPage, createBioPage, duplicateBioPage, resetBioPage, toggleBioPageStatus } from "@/store/slices/bioSlice";

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
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

    const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'delete' | 'duplicate' | 'reset' | 'toggle'; row: BioLinkRow | null }>({ isOpen: false, type: 'delete', row: null });
    const [newBio, setNewBio] = useState({ url: "", name: "", description: "" });

    const handleCreate = async () => {
        if (!newBio.url || !newBio.name) {
            showModal("error", "Error", "URL and Name are required.");
            return;
        }
        setIsCreating(true);
        try {
            await dispatch(createBioPage(newBio)).unwrap();
            setShowAddModal(false);
            setNewBio({ url: "", name: "", description: "" });
            showModal("success", "Success", "Bio link created successfully.");
        } catch (err: any) {
            showModal("error", "Error", err || "Failed to create bio link.");
        } finally {
            setIsCreating(false);
        }
    };

    useEffect(() => {
        dispatch(fetchBioPages());
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
        return pages.map(page => {
            return {
                pageId: page.link_id,
                profileId: page.link_id as any,
                username: page.url,
                slug: page.url,
                title: page.title,
                is_enabled: page.is_enabled === "1" || page.is_enabled === true || page.is_enabled === "true"
            } as BioLinkRow;
        });
    }, [pages]);

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

    const handleAddNew = () => {
        setShowAddModal(true);
    };

    const availableAccounts = accounts.filter((acc) => !rowsMap.has(String(acc.id)));

    return (
        <div className="min-h-screen bg-transparent px-2 sm:px-6 py-6 relative overflow-hidden"
            style={{ background: 'var(--app-surface-bg, var(--background))' }}>
            <div className="max-w-5xl mx-auto space-y-4 relative">
                {/* Header Card */}
                <div className="rounded-[28px] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 p-4 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
                        <div className="flex items-start gap-4 sm:gap-5">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-[22px] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 shrink-0">
                                <Sparkles size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Instagram Premium</p>
                                </div>
                                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Bio Link Manager</h1>
                                <p className="hidden sm:block text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl">Create, edit, copy, and maintain all your bio links in one place.</p>
                                <p className="sm:hidden text-[12px] text-slate-500 mt-1 font-medium italic">Manage all bio links here.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white text-[11px] sm:text-[12px] font-black uppercase tracking-[0.12em] flex items-center justify-center gap-2 sm:gap-3 shadow-[0_10px_30px_rgba(108,92,231,0.3)] hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(108,92,231,0.4)] active:scale-[0.98] transition-all"
                        >
                            <Plus size={16} className="sm:w-5 sm:h-5" /> Add New Bio
                        </button>
                    </div>
                </div>

                {/* List Card */}
                <div className="rounded-[32px] border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-2 sm:p-5">
                    {isLoading ? (
                        <div className="py-16 text-center text-sm text-slate-500">Loading bio links...</div>
                    ) : rows.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                            <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                <LinkIcon size={20} />
                            </div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">No bio links created yet</p>
                            <p className="text-sm text-slate-500">Connect an account and create your first bio link.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {rows.map((row) => {
                                const publicUrl = typeof window !== "undefined"
                                    ? `${window.location.origin}/p?u=${row.username}&id=${row.pageId}`
                                    : `/p?u=${row.username}&id=${row.pageId}`;
                                return (
                                    <div key={row.pageId} className="group rounded-[22px] border border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.03] px-2.5 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none hover:-translate-y-0.5">
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/5 dark:bg-primary/10 text-primary font-black flex items-center justify-center text-sm sm:text-lg shadow-inner shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                {(row.username?.[0] || "B").toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">{row.title || `@${row.username}`}</p>
                                                    {row.is_enabled && (
                                                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none">
                                                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" /> Live
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 break-all sm:truncate mt-0.5 font-medium leading-tight">{publicUrl}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                            <div className="flex items-center gap-2 sm:gap-4">
                                                {/* Status Toggle */}
                                                <div className="flex flex-col sm:flex-col items-center gap-1 sm:gap-1.5 px-0 sm:px-2">
                                                    <button
                                                        className={cn(
                                                            "relative inline-flex h-[18px] w-[34px] sm:h-[22px] sm:w-[42px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none",
                                                            row.is_enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                                                        )}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionModal({ isOpen: true, type: 'toggle', row });
                                                        }}
                                                    >
                                                        <span className={cn("pointer-events-none block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300", row.is_enabled ? "translate-x-4 sm:translate-x-5" : "translate-x-0.5")} />
                                                    </button>
                                                    <span className="hidden sm:block text-[8px] font-black uppercase tracking-widest text-slate-400">Status</span>
                                                </div>

                                                {/* Copy Button */}
                                                <button onClick={(e) => { e.stopPropagation(); handleCopy(row); }} className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 border", copiedId === row.pageId ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10")} title="Copy Link">
                                                    {copiedId === row.pageId ? <CheckCircle2 size={14} className="sm:w-4 sm:h-4" /> : <Copy size={14} className="sm:w-4 sm:h-4" />}
                                                </button>
                                            </div>

                                            {/* Primary Edit Button (Desktop) */}
                                            <button onClick={() => handleEdit(row)} className="hidden md:flex h-10 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest items-center gap-2 hover:opacity-90 transition-all">
                                                Edit Page <ArrowRight size={12} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button onClick={(e) => e.stopPropagation()} className="w-10 h-10 rounded-xl border border-slate-100 dark:border-white/10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                                                        <MoreVertical size={16} className="text-slate-500" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
                                                    <DropdownMenuItem onClick={() => handleEdit(row)} className="h-11 rounded-xl gap-3 px-3 cursor-pointer md:hidden">
                                                        <Edit3 size={15} className="text-slate-500" /> Edit Page
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => router.push(`/dashboard/instagram/bio-links/analytics?page=${row.pageId}`)}>
                                                        <BarChart2 size={15} className="text-slate-500" /> View Analytics
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => showModal("info", "Feature Pending", "QR Code Generation coming soon.")}>
                                                        <QrCode size={15} className="text-slate-500" /> Generate QR Code
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => setActionModal({ isOpen: true, type: 'duplicate', row })}>
                                                        <Copy size={15} className="text-slate-500" /> Duplicate Page
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => setActionModal({ isOpen: true, type: 'reset', row })}>
                                                        <RefreshCw size={15} className="text-slate-500" /> Reset to Default
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/5" />
                                                    <DropdownMenuItem onClick={() => setActionModal({ isOpen: true, type: 'delete', row })} className="h-11 rounded-xl gap-3 px-3 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                                                        <Trash2 size={15} className="text-red-500" /> Delete Page
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {availableAccounts.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/30 p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 mb-2">Available Accounts</p>
                        <div className="flex flex-wrap gap-2">
                            {availableAccounts.map((acc) => (
                                <button
                                    key={String(acc.id)}
                                    onClick={() => {
                                        setNewBio({ ...newBio, url: acc.username || "", name: acc.name || acc.username || "" });
                                        setShowAddModal(true);
                                    }}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 flex items-center gap-1.5"
                                >
                                    <Sparkles size={12} />
                                    @{acc.username || acc.name || `account-${acc.id}`}
                                    <ArrowRight size={12} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ADDS NEW MODAL */}
            <ModalShell
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Create New Bio Page"
                icon={<Globe size={20} />}
                footer={
                    <div className="flex gap-3">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[12px]">Cancel</button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="flex-2 h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[12px] shadow-xl flex items-center justify-center gap-2"
                        >
                            {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isCreating ? "Creating..." : "Create Bio Page"}
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <InputField
                        label="Unique URL (Slug)"
                        value={newBio.url}
                        onChange={(e: any) => setNewBio({ ...newBio, url: e.target.value })}
                        placeholder="my-new-bio"
                    />
                    <InputField
                        label="Account Name / Title"
                        value={newBio.name}
                        onChange={(e: any) => setNewBio({ ...newBio, name: e.target.value })}
                        placeholder="John Doe Profile"
                    />
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Description</label>
                        <textarea
                            value={newBio.description}
                            onChange={(e: any) => setNewBio({ ...newBio, description: e.target.value })}
                            rows={3}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none resize-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            placeholder="A short intro about yourself..."
                        />
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                        <Info size={16} className="text-primary mt-0.5" />
                        <p className="text-[11px] text-primary/80 font-medium leading-relaxed uppercase tracking-tight">
                            The URL must be unique and can only contain letters, numbers, and hyphens. This will be your public link address.
                        </p>
                    </div>
                </div>
            </ModalShell>

            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                onConfirm={confirmAction}
                title={actionModal.type === 'delete' ? 'Delete Bio Page?' : actionModal.type === 'duplicate' ? 'Duplicate Bio Page?' : actionModal.type === 'toggle' ? 'Change Status?' : 'Reset Bio Page?'}
                message={
                    actionModal.type === 'delete' ? 'This action is permanent and cannot be undone.' :
                        actionModal.type === 'duplicate' ? 'This will create an exact copy of this bio link page.' :
                            actionModal.type === 'toggle' ? `Are you sure you want to ${actionModal.row?.is_enabled ? 'disable' : 'enable'} this bio link?` :
                                'This will reset your bio link back to default settings.'
                }
                type={actionModal.type === 'delete' ? 'danger' : 'warning'}
                confirmText={actionModal.type === 'delete' ? 'Delete' : actionModal.type === 'duplicate' ? 'Duplicate' : actionModal.type === 'toggle' ? 'Confirm' : 'Reset'}
            />
        </div>
    );
}
