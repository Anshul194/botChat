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
import { useRouter } from "next/navigation";
import {
    CirclePlus,
    Copy,
    Filter,
    Contact,
    Pencil,
    Search,
    Trash2,
    Check,
    MoreVertical,
    BarChart3,
    QrCode,
    RefreshCcw,
    Calendar,
    History,
    X,
    Globe,
    LayoutGrid,
    Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/providers/ModalProvider";

export default function VcardLinksPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { vcards, isLoading } = useAppSelector((state) => state.vcards);
    const { showModal, showConfirm } = useModal();

    const [query, setQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [draft, setDraft] = useState({ slug: "" });
    const [isCreating, setIsCreating] = useState(false);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
    const [activeMenu, setActiveMenu] = useState<string | number | null>(null);

    useEffect(() => {
        dispatch(fetchVcards());
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
            name: item.vcard_name || item.vcard?.first_name ? `${item.vcard?.first_name || ""} ${item.vcard?.last_name || ""}` : (item.url || item.slug),
        }));
    }, [vcards]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return vcardLinks;
        return vcardLinks.filter((item) => 
            item.name.toLowerCase().includes(q) || 
            item.slug.toLowerCase().includes(q)
        );
    }, [vcardLinks, query]);

    const onCreate = async () => {
        if (isCreating) return;
        setIsCreating(true);
        const result = await dispatch(createVcard({
            url: draft.slug.trim(),
            domain_id: 0
        }));

        if (createVcard.fulfilled.match(result)) {
            showModal("success", "Vcard Created", "Your new Vcard has been created successfully!");
            setShowCreateModal(false);
            setDraft({ slug: "" });
            router.push(`/dashboard/vcard-links/${result.payload.data.id}`);
        } else {
            showModal("error", "Error", "Failed to create Vcard. Slug might be taken.");
        }
        setIsCreating(false);
    };

    const onCopy = async (fullUrl: string, slug: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(slug);
            window.setTimeout(() => setCopiedSlug(null), 2000);
        }
    };

    const handleDelete = (id: number | string) => {
        showConfirm({
            title: "Delete Vcard?",
            message: "Are you sure you want to delete this vcard? This action cannot be undone.",
            type: "danger",
            confirmText: "Delete",
            onConfirm: () => {
                dispatch(deleteVcard(id));
            }
        });
    };

    const handleReset = (id: number | string) => {
        showConfirm({
            title: "Reset Clicks?",
            message: "Are you sure you want to reset the clicks counter for this vcard?",
            type: "warning",
            confirmText: "Reset",
            onConfirm: () => {
                dispatch(resetVcardClicks(id));
            }
        });
    };

    const handleDuplicate = (id: number | string) => {
        showConfirm({
            title: "Duplicate Vcard?",
            message: "Are you sure you want to duplicate this vcard?",
            confirmText: "Duplicate",
            onConfirm: async () => {
                const result = await dispatch(duplicateVcard(id));
                if (duplicateVcard.fulfilled.match(result)) {
                    showModal("success", "Duplicated", "Vcard duplicated successfully!");
                    dispatch(fetchVcards());
                }
            }
        });
    };

    const handleToggle = (id: number | string) => {
        dispatch(toggleVcard(id));
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#020617] p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid place-items-center shadow-sm">
                            <LayoutGrid className="text-slate-600 dark:text-slate-400" size={20} />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            Vcard links
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 grid place-items-center text-[10px] text-slate-500 font-bold cursor-help">i</div>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="h-11 px-6 rounded-xl bg-[#6366F1] text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all"
                        >
                            <CirclePlus size={18} /> Vcard link
                        </button>
                        <button className="h-11 w-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid place-items-center text-slate-500 hover:bg-slate-50 transition-all">
                            <Download size={18} />
                        </button>
                        <button className="h-11 w-11 rounded-xl bg-[#1E293B] text-white grid place-items-center shadow-lg shadow-slate-900/20">
                            <Filter size={18} />
                        </button>
                        <button className="h-11 w-11 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid place-items-center text-slate-300">
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" size={18} />
                    <input 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Vcards..."
                        className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1] transition-all text-sm font-medium"
                    />
                </div>

                {/* Vcard List Container */}
                <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Vcard List</span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((item) => (
                            <div key={item.id} className="px-8 py-6 flex items-center gap-6 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                {/* Pink Icon Section */}
                                <div className="w-12 h-12 rounded-full bg-[#FFF1F2] dark:bg-pink-900/20 flex items-center justify-center shrink-0">
                                    <div className="w-9 h-9 rounded-full bg-[#FFE4E6] dark:bg-pink-500/20 grid place-items-center text-[#FF4F6D]">
                                        <Contact size={20} />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-0.5 truncate">{item.name || item.slug}</h3>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Globe size={14} className="text-slate-300" />
                                        <span className="text-[11px] font-bold truncate">{item.full_url || `biolink.divyangtechlabs.com/${item.slug}`}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 shrink-0">
                                    {/* Pink Clicks Badge */}
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FFF1F2] dark:bg-pink-900/20 text-[#FF4F6D] text-[10px] font-black uppercase">
                                        <BarChart3 size={12} />
                                        {item.clicks}
                                    </div>

                                    {/* Action Icons */}
                                    <div className="flex items-center gap-4 text-slate-300">
                                        <Calendar size={18} className="hover:text-slate-600 transition-colors cursor-pointer" />
                                        <History size={18} className="hover:text-slate-600 transition-colors cursor-pointer" />
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleToggle(item.id)}
                                            className={cn(
                                                "w-11 h-6 rounded-full relative transition-all duration-300",
                                                item.active ? "bg-[#FF4F6D]" : "bg-slate-200"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                                                item.active ? "left-6" : "left-1"
                                            )} />
                                        </button>

                                        <button 
                                            onClick={() => onCopy(item.full_url || `biolink.divyangtechlabs.com/${item.slug}`, item.slug)}
                                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 grid place-items-center text-slate-400 hover:bg-slate-50 transition-all"
                                        >
                                            {copiedSlug === item.slug ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>

                                        <div className="relative">
                                            <button 
                                                onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                                                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 grid place-items-center text-slate-400 hover:bg-slate-50 transition-all"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenu === item.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                    <div className="absolute right-0 top-12 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-3 z-20 animate-in fade-in zoom-in duration-200">
                                                        <button onClick={() => router.push(`/dashboard/vcard-links/${item.id}`)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                            <Pencil size={16} className="text-slate-400" /> Edit
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                            <BarChart3 size={16} className="text-slate-400" /> Statistics
                                                        </button>
                                                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                            <QrCode size={16} className="text-slate-400" /> Create QR
                                                        </button>
                                                        <button onClick={() => { setActiveMenu(null); handleDuplicate(item.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                            <Copy size={16} className="text-slate-400" /> Duplicate
                                                        </button>
                                                        <button onClick={() => { setActiveMenu(null); handleReset(item.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                            <RefreshCcw size={16} className="text-slate-400" /> Reset
                                                        </button>
                                                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                                                        <button onClick={() => { setActiveMenu(null); handleDelete(item.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                            <Trash2 size={16} /> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && !isLoading && (
                            <div className="py-24 text-center">
                                <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800/50 grid place-items-center mx-auto mb-4">
                                    <Contact size={40} className="text-slate-200" />
                                </div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">No Vcards Found</h3>
                                <p className="text-xs text-slate-400 mt-1">Create your first digital business card to get started.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="pt-6 space-y-4">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Your title</h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm p-4 grid place-items-center animate-in fade-in duration-300">
                    <div className="w-full max-w-lg rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center">
                                    <Contact size={28} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Create Vcard</h2>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-10 h-10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 grid place-items-center text-slate-400 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Short URL</label>
                                <div className="flex items-center h-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 group focus-within:ring-4 focus-within:ring-[#6366F1]/10 transition-all">
                                    <div className="pl-6 pr-4 text-slate-400 font-bold text-sm border-r border-slate-200 dark:border-slate-700">
                                        botchat.io/
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="your-slug"
                                        value={draft.slug}
                                        onChange={(e) => setDraft({...draft, slug: e.target.value})}
                                        className="flex-1 h-full bg-transparent px-6 outline-none font-bold text-slate-900 dark:text-white text-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 ml-1">Leave empty to generate a random URL.</p>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button 
                                    onClick={() => setShowCreateModal(false)} 
                                    className="flex-1 h-14 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={onCreate} 
                                    disabled={isCreating}
                                    className="flex-1 h-14 rounded-2xl bg-[#6366F1] text-white text-sm font-black shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isCreating ? "Creating..." : "Create Vcard"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
