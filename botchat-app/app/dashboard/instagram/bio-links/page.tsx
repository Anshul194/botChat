"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Edit3, Plus, Trash2, CheckCircle2, Link as LinkIcon, Crown, Sparkles, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/providers/ModalProvider";

type InstagramAccount = {
    id: number | string;
    username?: string;
    name?: string;
};

type BioLinkRow = {
    pageId: string;
    username: string;
    profileId: number;
};

export default function InstagramBioLinksPage() {
    const router = useRouter();
    const { showModal } = useModal();

    const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
    const [rows, setRows] = useState<BioLinkRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const rowsMap = useMemo(() => {
        const map = new Map<string, BioLinkRow>();
        rows.forEach((row) => map.set(row.pageId, row));
        return map;
    }, [rows]);

    useEffect(() => {
        let active = true;

        const load = async () => {
            setIsLoading(true);
            try {
                const accRes = await api.get("/social/instagram-connect");
                const accs = accRes.data?.data?.instagram_accounts || [];
                if (!active) return;
                setAccounts(accs);

                const checks = await Promise.all(
                    accs.map(async (acc: InstagramAccount) => {
                        const pageId = String(acc.id);
                        try {
                            const res = await api.get(`/bio-builder?page=${pageId}`);
                            const payload = res.data?.data || res.data;
                            const profileId = payload?.id || payload?.profile?.id;
                            if (!profileId) return null;
                            return {
                                pageId,
                                profileId,
                                username: acc.username || acc.name || `account-${pageId}`,
                            } as BioLinkRow;
                        } catch {
                            return null;
                        }
                    })
                );

                if (!active) return;
                setRows(checks.filter(Boolean) as BioLinkRow[]);
            } catch {
                if (active) showModal("error", "Error", "Failed to load bio links.");
            } finally {
                if (active) setIsLoading(false);
            }
        };

        load();
        return () => {
            active = false;
        };
    }, [showModal]);

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
            await api.delete(`/bio-builder/profile/${row.profileId}`);
            setRows((prev) => prev.filter((r) => r.pageId !== row.pageId));
        } catch {
            showModal("error", "Error", "Failed to delete bio link.");
        }
    };

    const handleAddNew = () => {
        const firstAvailable = availableAccounts[0];
        if (firstAvailable) {
            router.push(`/dashboard/instagram/bio-link?page=${String(firstAvailable.id)}`);
            return;
        }
        const firstConnected = accounts[0];
        if (firstConnected) {
            router.push(`/dashboard/instagram/bio-link?page=${String(firstConnected.id)}`);
            return;
        }
        router.push("/dashboard/instagram/connect");
    };

    const availableAccounts = accounts.filter((acc) => !rowsMap.has(String(acc.id)));

    return (
        <div className="min-h-screen bg-white dark:bg-[#05060a] px-4 sm:px-6 py-6 relative overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-10 w-64 h-64 rounded-full bg-rose-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="max-w-5xl mx-auto space-y-5 relative">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-rose-50/50 to-cyan-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-5 sm:p-7 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
                                <Crown size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Instagram Premium</p>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Bio Link Manager</h1>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Create, edit, copy, and maintain all your bio links in one place.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
                        >
                            <Plus size={16} /> Add New
                        </button>
                    </div>
                </div>

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
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/15 to-cyan-500/15 text-slate-800 dark:text-slate-100 font-black flex items-center justify-center text-sm">
                                            {(row.username?.[0] || "B").toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">@{row.username}</p>
                                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wide">Live</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate">{publicUrl}</p>
                                        </div>
                                        <button onClick={() => handleEdit(row)} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:border-rose-300 hover:text-rose-600" title="Edit">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => handleCopy(row)} className={cn("w-9 h-9 rounded-xl border flex items-center justify-center", copiedId === row.pageId ? "border-emerald-300 text-emerald-600" : "border-slate-200 dark:border-slate-700 text-slate-600 hover:border-cyan-300 hover:text-cyan-600")} title="Copy">
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
                                    onClick={() => router.push(`/dashboard/instagram/bio-link?page=${String(acc.id)}`)}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 flex items-center gap-1.5"
                                >
                                    <Sparkles size={12} />
                                    @{acc.username || acc.name || `account-${acc.id}`}
                                    <ArrowUpRight size={12} />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
