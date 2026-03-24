"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Instagram, MessageSquare, Zap, Target, MoreHorizontal, Search,
    Plus, RefreshCw, Layers, Sparkles, ChevronRight, ChevronDown,
    Trash2, Pause, Play, X, SlidersHorizontal, ArrowRight,
    Edit3, Save, Copy, Check, Loader2, Megaphone, Activity,
    Eye, Settings, Tag, MessageCircle, Image as ImageIcon,
    FileText, PieChart, Info, AlertCircle, Box, Heart, Bell, User,
    ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CommentTemplateModal } from "../../components/modals/CommentTemplateModal";
import { ReplyTemplateModal } from "../../components/modals/ReplyTemplateModal";
import { PostAutoCommentModal } from "../../components/modals/PostAutoCommentModal";
import { PostCommentModal } from "../../components/modals/PostCommentModal";

// ── Types ──────────────────────────────────────────────────────────────────────
interface InstagramAccount {
    id: number;
    instagram_id: string;
    username: string;
    profile_picture?: string;
    page?: {
        page_name: string;
        page_id: string;
    }
}

interface InstagramPost {
    id: string;
    text: string;
    thumbnail: string;
    created_at: string;
    stats?: {
        likes: number;
        comments: number;
    };
    status?: {
        reply?: string | null;
        comment?: string | null;
    };
}

interface CommentTemplate {
    id: number;
    name: string;
    messages: string[];
    platform: string;
}

interface ReplyTemplate {
    id: number;
    name: string;
    message: string;
    reply_type: string;
    platform: string;
}

export default function InstagramCommentManagerPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null);
    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [pageStats, setPageStats] = useState({
        auto_reply_count: 0,
        auto_comment_count: 0,
        has_full_page_reply: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isPostsLoading, setIsPostsLoading] = useState(false);

    // Manage Templates popup
    const [showTemplateMenu, setShowTemplateMenu] = useState(false);
    const [activeView, setActiveView] = useState<"dashboard" | "comment-templates" | "reply-templates">("dashboard");
    const templateMenuRef = useRef<HTMLDivElement>(null);

    // Template states
    const [commentTemplates, setCommentTemplates] = useState<CommentTemplate[]>([]);
    const [replyTemplates, setReplyTemplates] = useState<ReplyTemplate[]>([]);
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);

    // Modal states
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const [editingComment, setEditingComment] = useState<Partial<CommentTemplate> | null>(null);
    const [editingReply, setEditingReply] = useState<Partial<ReplyTemplate> | null>(null);

    // Post Auto Comment specific
    const [showAutoCommentModal, setShowAutoCommentModal] = useState(false);
    const [selectedPostForAuto, setSelectedPostForAuto] = useState<InstagramPost | null>(null);

    // Interaction Dropdown
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Leave a Comment Now Modal
    const [showCommentNowModal, setShowCommentNowModal] = useState(false);
    const [selectedPostForComment, setSelectedPostForComment] = useState<InstagramPost | null>(null);

    // Outside click for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Outside click for template menu
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
                setShowTemplateMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Data Fetching ────────────────────────────────────────────────────────
    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/social/instagram-connect");
            if (response.data.success || response.data.is_success) {
                const fetchedAccounts = response.data.data.instagram_accounts || [];
                setAccounts(fetchedAccounts);
                if (fetchedAccounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(fetchedAccounts[0]);
                }
            }
        } catch (error) {
            console.error("Fetch Accounts Error:", error);
            toast.error("Failed to load Instagram accounts");
        } finally {
            setIsLoading(false);
        }
    }, [selectedAccount]);

    const fetchPosts = useCallback(async () => {
        if (!selectedAccount) return;
        setIsPostsLoading(true);
        try {
            const id = selectedAccount.instagram_id;
            const response = await api.get(`/instagram/comment-manager/posts/${id}`);
            if (response.data.success || response.data.is_success) {
                setPosts(response.data.data?.posts || []);
                if (response.data.data?.stats) {
                    setPageStats(response.data.data.stats);
                }
            }
        } catch (error) {
            console.error("Fetch Posts Error:", error);
        } finally {
            setIsPostsLoading(false);
        }
    }, [selectedAccount]);

    const fetchTemplates = useCallback(async () => {
        setIsTemplatesLoading(true);
        try {
            const [commentsRes, repliesRes] = await Promise.all([
                api.get("/instagram/comment-template"),
                api.get("/instagram/auto-reply-template")
            ]);
            if (commentsRes.data.success || commentsRes.data.is_success) setCommentTemplates(commentsRes.data.data || []);
            if (repliesRes.data.success || repliesRes.data.is_success) setReplyTemplates(repliesRes.data.data || []);
        } catch (error) { } finally { setIsTemplatesLoading(false); }
    }, []);

    useEffect(() => {
        fetchAccounts();
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (selectedAccount) fetchPosts();
    }, [selectedAccount, fetchPosts]);

    const handleSaveCommentTemplate = async () => {
        // Now handled by CommentTemplateModal
    };

    const handleSaveReplyTemplate = async () => {
        // Now handled by ReplyTemplateModal
    };

    // ── MAIN DASHBOARD VIEW ──────────────────────────────────────────────────
    const DashboardView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── SIDEBAR COLUMN (1/3): STRATEGY LAB ── */}
            <aside className="lg:col-span-4 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-md font-bold text-slate-900 dark:text-white uppercase tracking-tight">Strategy Lab</h2>

                        <div className="relative" ref={templateMenuRef}>
                            <button
                                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                                className="flex items-center gap-1.5 text-[12px] font-bold text-primary hover:text-pink-700 transition-colors group"
                            >
                                Manage Templates
                                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showTemplateMenu && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                                {showTemplateMenu && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
                                        {[
                                            { id: "comment", label: "Comment Template", icon: MessageSquare, desc: "Preset comment sets", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10", view: "comment-templates" },
                                            { id: "reply", label: "Reply Template", icon: FileText, desc: "Auto-reply messages", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", view: "reply-templates" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setShowTemplateMenu(false); setActiveView(opt.view as any); }}
                                                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group border-b border-slate-50 dark:border-slate-800 last:border-0"
                                            >
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", opt.bg)}><opt.icon className={cn("w-4 h-4", opt.color)} /></div>
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                            <p className="text-3xl font-bold text-primary">{pageStats.auto_reply_count}</p>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1 tracking-wider">Auto Replies</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                            <p className="text-3xl font-bold text-blue-500">{pageStats.auto_comment_count}</p>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1 tracking-wider">Auto Comments</p>
                        </div>
                    </div>

                    {/* Automation List Hub (Screenshot Box Content) */}
                    <div className="p-1 rounded-2xl bg-neutral-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 shadow-inner">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-[12px] font-black text-indigo-600 uppercase tracking-widest leading-none">@{selectedAccount?.username}</h3>
                        </div>
                        {[
                            { id: 'comment', label: 'Auto Comment', desc: 'Enabled : 0 . Comment : 0 . Not replied yet', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                            { id: 'reply', label: 'Auto Comment Reply', desc: 'Enabled : 0 . Response : 0 . Not replied yet', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
                            { id: 'full', label: 'Full Account Comment Reply', desc: 'Manage Full Account Reply . Not Enabled', icon: Layers, color: 'text-sky-500', bg: 'bg-sky-50/50', isAction: true },
                            { id: 'mention', label: 'Mention Reply', desc: 'Manage Mention Reply . Not Enabled', icon: User, color: 'text-orange-500', bg: 'bg-orange-50/50', isAction: true },
                            { id: 'tagged', label: 'Tagged Media', desc: 'Get the media objects in which Business has been tagged.', icon: Tag, color: 'text-rose-500', bg: 'bg-rose-50/50' }
                        ].map((item, idx) => (
                            <div key={item.id} className={cn(
                                "group p-4 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0",
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.bg, item.color)}>
                                        <item.icon size={18} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-200 tracking-tight leading-none">{item.label}</h4>
                                        <p className="text-[10px] font-medium text-slate-400 truncate max-w-[200px] leading-tight mt-1">{item.desc}</p>
                                    </div>
                                </div>
                                <button className={cn(
                                    "p-2 rounded-xl transition-all shadow-sm border",
                                    item.isAction ? "border-sky-100 text-sky-500 hover:bg-sky-50" : "border-slate-100 text-slate-300 hover:text-primary",
                                    item.id === 'mention' && "border-orange-100 text-orange-500 hover:bg-orange-50",
                                    item.id === 'tagged' && "border-rose-100 text-rose-500 hover:bg-rose-50"
                                )}>
                                    {item.isAction ? <RefreshCw size={14} /> : <Eye size={16} />}
                                </button>
                            </div>
                        ))}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <button className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                                <FileText size={16} /> See Auto Reply Report
                            </button>
                        </div>
                    </div>

                    <button className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                        <PieChart className="w-4 h-4" /> View Detailed Reports
                    </button>
                </div>
            </aside>

            {/* ── MAIN FEED (2/3): LATEST INTERACTIONS ── */}
            <main className="lg:col-span-8 flex flex-col gap-6">
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex-1 flex flex-col min-h-[700px]">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-50 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                            Latest Interactions
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="relative group md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search interactions..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[13px] outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                            <button className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-sm">
                                ID Lookup
                            </button>
                        </div>
                    </header>

                    <div className="space-y-4">
                        {isPostsLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />)
                        ) : posts.length > 0 ? (
                            posts.map(post => (
                                <div key={post.id} className="group bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 transition-all hover:border-primary/30">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-100">
                                        <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-slate-800 dark:text-white truncate uppercase tracking-tight">{selectedAccount?.username}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] text-slate-400 font-semibold">{post.created_at || 'RECENTLY'}</p>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">ID: {post.id}</span>
                                                            <Copy size={10} className="hover:text-indigo-900 cursor-pointer transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {post.status?.reply && (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600">Reply Active</span>
                                                    )}

                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                                                            className={cn(
                                                                "p-2 rounded-xl transition-all duration-300",
                                                                activeDropdown === post.id
                                                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                                                    : "text-slate-400 hover:text-primary hover:bg-primary/5 active:scale-90"
                                                            )}
                                                        >
                                                            <div className="transition-transform duration-300" style={{ transform: activeDropdown === post.id ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                                                                <MoreHorizontal size={18} />
                                                            </div>
                                                        </button>

                                                        <AnimatePresence>
                                                            {activeDropdown === post.id && (
                                                                <div ref={dropdownRef}>
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="absolute right-0 top-full mt-2 w-[240px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[60] py-2 overflow-hidden flex flex-col"
                                                                    >
                                                                        <button
                                                                            onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }}
                                                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                                                                        >
                                                                            <Settings className="w-4 h-4 text-primary" />
                                                                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">Auto Comment</span>
                                                                        </button>

                                                                        <div className="h-px bg-slate-50 dark:bg-slate-800 my-1 mx-4" />

                                                                        <button
                                                                            onClick={() => { setSelectedPostForComment(post); setShowCommentNowModal(true); setActiveDropdown(null); }}
                                                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                                                                        >
                                                                            <MessageSquare className="w-4 h-4 text-slate-400" />
                                                                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Latest comments</span>
                                                                        </button>

                                                                        <button
                                                                            onClick={() => { setSelectedPostForComment(post); setShowCommentNowModal(true); setActiveDropdown(null); }}
                                                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                                                                        >
                                                                            <Edit3 className="w-4 h-4 text-slate-400" />
                                                                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Leave a comment now</span>
                                                                        </button>
                                                                    </motion.div>
                                                                </div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-1 italic font-medium p-2 bg-white dark:bg-slate-900/50 rounded-lg inline-block px-3 border border-slate-100 dark:border-slate-800/50 mt-1">"{post.text}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">No Interaction Active</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );

    const TemplateListView = ({ type }: { type: "comment" | "reply" }) => {
        const templates = type === "comment" ? commentTemplates : replyTemplates;
        return (
            <div className="space-y-6 pb-20">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setActiveView("dashboard")} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 text-slate-400 hover:text-primary transition-all active:scale-95 border border-slate-100 dark:border-slate-700"><ChevronRight size={18} className="rotate-180" /></button>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">{type === 'comment' ? 'Comment Sets' : 'Reply Templates'}</h2>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asset Inventory</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (type === 'comment') { setEditingComment({ name: "", messages: [""] }); setShowCommentModal(true); }
                            else { setEditingReply({ name: "", message: "", reply_type: "generic" }); setShowReplyModal(true); }
                        }}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={14} /> New Asset
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((t) => (
                        <div key={t.id} className="group bg-white dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", type === 'comment' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600')}>
                                    {type === 'comment' ? <MessageSquare size={16} /> : <Zap size={16} />}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { if (type === 'comment') { setEditingComment(t as CommentTemplate); setShowCommentModal(true); } else { setEditingReply(t as ReplyTemplate); setShowReplyModal(true); } }} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 text-slate-400 hover:text-primary"><Edit3 size={14} /></button>
                                    <button onClick={async () => { if (confirm("Delete Asset?")) { await api.delete(type === 'comment' ? `/instagram/comment-template/${t.id}` : `/instagram/auto-reply-template/${t.id}`); fetchTemplates(); } }} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <h4 className="text-[14px] font-bold text-slate-800 dark:text-white uppercase tracking-tight truncate">{t.name}</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-2 line-clamp-2 italic leading-relaxed">"{type === 'comment' ? (t as CommentTemplate).messages[0] : (t as ReplyTemplate).message}"</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a] font-sans">
            <div className="max-w-[1500px] mx-auto p-4 lg:p-10 space-y-10">

                {/* ── CONTEXT BAR ── */}
                <header className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5 md:border-r border-slate-100 dark:border-slate-800 pr-6">
                        <div className="w-12 h-12 rounded-[18px] bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Comment Hub</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Asset Directory IG</p>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-4">
                        {isLoading ? (
                            [1, 2].map(i => <div key={i} className="w-32 h-10 bg-slate-100 rounded-xl animate-pulse" />)
                        ) : accounts.map(acc => (
                            <button
                                key={acc.id}
                                onClick={() => setSelectedAccount(acc)}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap flex items-center gap-3 border transition-all duration-300 group",
                                    selectedAccount?.id === acc.id
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                        : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/30"
                                )}
                            >
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 shadow-sm flex-shrink-0">
                                    <img src={acc.profile_picture} className="w-full h-full object-cover" />
                                </div>
                                <span className="uppercase tracking-widest leading-none">@{acc.username}</span>
                                {selectedAccount?.id === acc.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pl-6 md:border-l border-slate-100 dark:border-slate-800">
                        <button onClick={fetchAccounts} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-all border border-slate-100 dark:border-slate-700 active:scale-95">
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[11px] uppercase tracking-widest shadow-xl active:scale-95 hover:bg-slate-800">
                            Sync New
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeView === 'dashboard' ? (
                        <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <DashboardView />
                        </motion.div>
                    ) : (
                        <TemplateListView type={activeView === 'comment-templates' ? 'comment' : 'reply'} />
                    )}
                </AnimatePresence>

                {/* REUSABLE MODALS (Shared with Facebook) */}
                <CommentTemplateModal
                    isOpen={showCommentModal}
                    onClose={() => setShowCommentModal(false)}
                    onSaved={fetchTemplates}
                    editingTemplate={editingComment}
                    platform="instagram"
                />

                <ReplyTemplateModal
                    isOpen={showReplyModal}
                    onClose={() => setShowReplyModal(false)}
                    onSaved={fetchTemplates}
                    editingTemplate={editingReply}
                    platform="instagram"
                />

                <PostAutoCommentModal
                    isOpen={showAutoCommentModal}
                    onClose={() => setShowAutoCommentModal(false)}
                    onSaved={fetchPosts}
                    platform="instagram"
                    postId={selectedPostForAuto?.id || ""}
                    pageId={selectedAccount?.instagram_id || ""}
                />

                <PostCommentModal
                    isOpen={showCommentNowModal}
                    onClose={() => setShowCommentNowModal(false)}
                    platform="instagram"
                    postId={selectedPostForComment?.id || ""}
                    pageId={selectedAccount?.instagram_id || ""}
                />
            </div>
        </div>
    );
}
