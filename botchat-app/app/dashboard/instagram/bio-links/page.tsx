"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon, Image as ImageIcon, CheckCircle2, X, Globe, ArrowRight, Info, Copy, Sparkles, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/providers/ModalProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBioPages, deleteBioPage, createBioPage } from "@/store/slices/bioSlice";

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
                title: page.title
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

    const handleDelete = async (row: BioLinkRow) => {
        if (typeof window !== "undefined") {
            const ok = window.confirm("Delete this bio link?");
            if (!ok) return;
        }

        try {
            await dispatch(deleteBioPage(row.profileId)).unwrap();
        } catch {
            showModal("error", "Error", "Failed to delete bio link.");
        }
    };

    const handleAddNew = () => {
        setShowAddModal(true);
    };

    const availableAccounts = accounts.filter((acc) => !rowsMap.has(String(acc.id)));

    return (
        <div className="min-h-screen bg-transparent px-4 sm:px-6 py-6 relative overflow-hidden"
             style={{ background: 'var(--app-surface-bg, var(--background))' }}>
            <div className="max-w-5xl mx-auto space-y-5 relative">
                {/* Header Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Instagram Premium</p>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Bio Link Manager</h1>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Create, edit, copy, and maintain all your bio links in one place.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="h-11 px-5 rounded-2xl bg-primary text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-all font-bold"
                        >
                            <Plus size={16} /> Add New Bio
                        </button>
                    </div>
                </div>

                {/* List Card */}
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-5">
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
                                    <div key={row.pageId} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-sm">
                                            {(row.username?.[0] || "B").toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{row.title || `@${row.username}`}</p>
                                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wide">Live</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate">{publicUrl}</p>
                                        </div>
                                        <button onClick={() => handleEdit(row)} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors" title="Edit">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => handleCopy(row)} className={cn("w-9 h-9 rounded-xl border flex items-center justify-center transition-colors", copiedId === row.pageId ? "border-emerald-300 text-emerald-600" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary")} title="Copy">
                                            {copiedId === row.pageId ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        </button>
                                        <button onClick={() => handleDelete(row)} className="w-9 h-9 rounded-xl border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" title="Delete">
                                            <Trash2 size={14} />
                                        </button>
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
        </div>
    );
}
