"use client";

import { useState, useRef, useEffect } from "react";
import {
    Facebook, MessageSquare, Zap, Target,
    MoreHorizontal, Search, CheckCircle2,
    Clock, BarChart3, ChevronRight,
    Settings2, Filter, LayoutGrid, List,
    Activity, Globe, ArrowUpRight, Plus,
    MousePointer2, Layers, Sparkles, Command,
    FileText, PieChart, Users, Settings,
    MoreVertical, Info, RefreshCw, Box,
    Trash2, Pause, Play, FileJson, Megaphone,
    ArrowRight, X, AlertCircle, ChevronDown,
    Tag, SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FacebookPage {
    id: number;
    page_id: string;
    page_name: string;
    is_enabled: boolean;
    image?: string;
    picture?: string;
}

const POSTS = [
    { id: "1569215103205765_12345678", user: "duny post", time: "3/18/2025 11:23 PM", text: "New campaign launch! Check out our latest features.", stats: { reply: 12, comment: 84 }, thumbnail: "https://picsum.photos/seed/d1/100/100" },
    { id: "1569215103205765_87654321", user: "@ek_saro_vidhar", time: "1/22/2025 10:22 AM", text: "Follow our daily automation success stories #realestate #success", stats: { reply: 4, comment: 22 }, thumbnail: "https://picsum.photos/seed/d2/100/100" },
    { id: "1569215103205765_11223344", user: "@ek_saro_vidhar", time: "1/22/2025 10:22 AM", text: "Daily thought: Automation is the key to scaling your business.", stats: { reply: 45, comment: 310 }, thumbnail: "https://picsum.photos/seed/d3/100/100" },
];

export default function CommentManager() {
    const router = useRouter();
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);

    // ── Manage Templates popup ────────────────────────────────────────────────
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [activeTemplateView, setActiveTemplateView] = useState<
        "comment" | "reply" | "custom" | null
    >(null);
    const templateMenuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
                setShowTemplateMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const fetchPages = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/social/facebook-connect");
            if (response.data.success || response.data.is_success) {
                const fetchedAccounts = response.data.data.facebook_accounts || [];
                const fetchedPages = fetchedAccounts.flatMap((acc: any) => acc.pages || []).map((p: any) => ({
                    ...p,
                    image: p.picture || "https://github.com/shadcn.png"
                }));
                setPages(fetchedPages);
                if (fetchedPages.length > 0 && !selectedPage) {
                    setSelectedPage(fetchedPages[0]);
                }
            }
        } catch (error) {
            console.error("Fetch Pages Error:", error);
            toast.error("Failed to load pages");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    return (
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a] p-4 lg:p-8 font-sans transition-all duration-300">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* 1. PROFESSIONAL CONTEXT BAR */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
                    <div className="flex items-center gap-5 border-r border-slate-100 dark:border-slate-800 pr-6">
                        <div className="w-12 h-12 rounded-[18px] bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Comment Hub</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Asset Directory</p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                        {isLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="w-32 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)
                        ) : pages.length > 0 ? (
                            pages.map(page => (
                                <button
                                    key={page.id}
                                    onClick={() => setSelectedPage(page)}
                                    className={cn(
                                        "px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap flex items-center gap-3 border transition-all duration-300 group",
                                        selectedPage?.id === page.id
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                            : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/30"
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-sm flex-shrink-0">
                                        <img src={page.image} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="truncate max-w-[150px]">{page.page_name}</span>
                                    {selectedPage?.id === page.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Connect Assets to Begin</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pl-6 border-l border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={fetchPages} 
                            disabled={isLoading}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all border border-slate-100 dark:border-slate-700 active:scale-95"
                        >
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 hover:bg-slate-800">
                            Sync New
                        </button>
                    </div>
                </div>


                {/* 3. MAIN GRID (1/3 LEFT, 2/3 RIGHT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* ── LEFT COLUMN (1/3): STRATEGY & ACTIONS ── */}
                    <aside className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-tight">Strategy Lab</h2>

                                {/* ── Manage Templates button + dropdown ─────── */}
                                <div className="relative" ref={templateMenuRef}>
                                    <button
                                        onClick={() => setShowTemplateMenu(v => !v)}
                                        className="flex items-center gap-1.5 text-[12px] font-bold text-primary hover:text-purple-700 dark:hover:text-purple-300 transition-colors group"
                                    >
                                        Manage Templates
                                        <ChevronDown className={cn(
                                            "w-3.5 h-3.5 transition-transform duration-200",
                                            showTemplateMenu && "rotate-180"
                                        )} />
                                    </button>

                                    <AnimatePresence>
                                        {showTemplateMenu && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50"
                                            >
                                                {[
                                                    {
                                                        id: "comment",
                                                        label: "Comment Template",
                                                        icon: MessageSquare,
                                                        desc: "Preset comment sets",
                                                        color: "text-purple-600",
                                                        bg: "bg-purple-50 dark:bg-purple-500/10",
                                                    },
                                                    {
                                                        id: "reply",
                                                        label: "Reply Template",
                                                        icon: FileText,
                                                        desc: "Auto-reply messages",
                                                        color: "text-blue-600",
                                                        bg: "bg-blue-50 dark:bg-blue-500/10",
                                                    },
                                                    {
                                                        id: "custom",
                                                        label: "Custom Fields",
                                                        icon: SlidersHorizontal,
                                                        desc: "Dynamic variables",
                                                        color: "text-emerald-600",
                                                        bg: "bg-emerald-50 dark:bg-emerald-500/10",
                                                    },
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => {
                                                            setShowTemplateMenu(false);
                                                            if (opt.id === "comment") {
                                                                router.push("/dashboard/facebook/comment-templates");
                                                            } else if (opt.id === "reply") {
                                                                router.push("/dashboard/facebook/reply-templates");
                                                            } else if (opt.id === "custom") {
                                                                router.push("/dashboard/facebook/custom-fields");
                                                            } else {
                                                                setActiveTemplateView(opt.id as "custom");
                                                            }
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group border-b border-slate-50 dark:border-slate-800 last:border-0"
                                                    >
                                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", opt.bg)}>
                                                            <opt.icon className={cn("w-4 h-4", opt.color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{opt.label}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{opt.desc}</p>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 ml-auto flex-shrink-0" />
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Enabled Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                                    <p className="text-3xl font-bold text-primary">1</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Auto Replies</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                                    <p className="text-3xl font-bold text-blue-500">1</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Auto Comments</p>
                                </div>
                            </div>

                            {/* Full Page CTA */}
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4 text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Full Page Campaign</h3>
                                    <p className="text-[11px] text-slate-500">Configure global override logic for entire page activity</p>
                                </div>
                                <button className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Edit Global Reply
                                </button>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                                <PieChart className="w-4 h-4" /> View Detailed Reports
                            </button>
                        </div>
                    </aside>

                    {/* ── RIGHT COLUMN (2/3): POST FEED ── */}
                    <main className="lg:col-span-8 flex flex-col gap-6">
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-1 flex flex-col">
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-50 dark:border-slate-800">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    Latest Interactions
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="relative group flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search interactions..."
                                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[13px] outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsIdModalOpen(true)}
                                        className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-sm"
                                    >
                                        ID Lookup
                                    </button>
                                </div>
                            </header>

                            <div className="space-y-4">
                                {POSTS.map(post => (
                                    <div key={post.id} className="group bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 transition-all hover:border-primary/30">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 animate-pulse bg-slate-200 dark:bg-slate-800">
                                            <img src={post.thumbnail} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-[14px] font-bold text-slate-800 dark:text-white">{post.user}</h4>
                                                        <p className="text-[10px] text-slate-400 font-semibold">{post.time}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase">Reply ON</span>
                                                        <button className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 transition-colors">
                                                            <Settings className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-1 italic">"{post.text}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center group hover:bg-slate-50 transition-all">
                                    <Plus className="w-6 h-6 text-slate-300 group-hover:text-primary mx-auto mb-1" />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Load More Interaction History</p>
                                </button>
                            </div>
                        </section>
                    </main>

                </div>
            </div>

            {/* ── ID Modal ── */}
            <AnimatePresence>
                {isIdModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsIdModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Post ID Reconciliation</h3>
                                    <button onClick={() => setIsIdModalOpen(false)} className="text-slate-400 hover:text-rose-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-500/80">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-[12px] font-medium leading-relaxed">
                                            If you have edited your Facebook Ads post after creation, ID lookup may fail due to Facebook API limitations.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manual Post ID</label>
                                        <input
                                            type="text"
                                            placeholder="Example: 15692151032057..."
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setIsIdModalOpen(false)}
                                            className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[13px] hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button className="flex-[1.5] py-3 rounded-xl bg-primary text-white font-bold text-[13px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                            Sync Interaction ID
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Reply Template Coming Soon popup ── */}
            <AnimatePresence>
                {activeTemplateView === "reply" && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setActiveTemplateView(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                            className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 w-full max-w-sm shadow-2xl text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-7 h-7 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Reply Templates</h3>
                            <p className="text-sm text-slate-400 mt-2 mb-6">Coming soon — auto-reply message presets.</p>
                            <button onClick={() => setActiveTemplateView(null)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm">Close</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Custom Fields Coming Soon popup ── */}
            <AnimatePresence>
                {activeTemplateView === "custom" && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setActiveTemplateView(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                            className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 w-full max-w-sm shadow-2xl text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                                <SlidersHorizontal className="w-7 h-7 text-emerald-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Custom Fields</h3>
                            <p className="text-sm text-slate-400 mt-2 mb-6">Coming soon — dynamic variable management.</p>
                            <button onClick={() => setActiveTemplateView(null)} className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm">Close</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
