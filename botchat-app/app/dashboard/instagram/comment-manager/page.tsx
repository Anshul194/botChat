"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Instagram, MessageSquare, Zap, Target, MoreHorizontal, Search,
    Plus, RefreshCw, Layers, Sparkles, ChevronRight, ChevronDown, ChevronLeft, ListFilter, Clock,
    Trash2, Pause, Play, X, SlidersHorizontal, ArrowRight, LayoutGrid,
    Edit3, Save, Copy, Check, Loader2, Megaphone, Activity,
    Eye, Settings, Tag, MessageCircle, Image as ImageIcon,
    FileText, PieChart, Info, AlertCircle, Box, Heart, Bell, User,
    ShieldCheck, Settings2, BarChart3, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CommentTemplateModal } from "../../components/modals/CommentTemplateModal";
import { ReplyTemplateModal } from "../../components/modals/ReplyTemplateModal";
import { PostAutoCommentModal } from "../../components/modals/PostAutoCommentModal";
import { PostCommentModal } from "../../components/modals/PostCommentModal";
import { toast } from "sonner";

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
    const { showModal } = useModal();
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

    const scrollRef = useRef<HTMLDivElement>(null);
    const [showPageDropdown, setShowPageDropdown] = useState(false);
    const [quickFindSearch, setQuickFindSearch] = useState("");

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 200;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

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
            const response = await api.get("/social/instagram-connect?platform=instagram");
            if (response.data.success || response.data.is_success) {
                const fetchedAccounts = response.data.data.instagram_accounts || [];
                setAccounts(fetchedAccounts);
                if (fetchedAccounts.length > 0 && !selectedAccount) {
                    setSelectedAccount(fetchedAccounts[0]);
                }
            }
        } catch (error) {
            console.error("Fetch Accounts Error:", error);
            showModal("error", "Error", "Failed to load Instagram accounts");
        } finally {
            setIsLoading(false);
        }
    }, [api, showModal]);

    const fetchPosts = useCallback(async () => {
        if (!selectedAccount) return;
        setIsPostsLoading(true);
        try {
            const id = selectedAccount.instagram_id;
            const response = await api.get(`/instagram/comment-manager/posts/${id}?platform=instagram`);

            // Be more robust with the data structure
            const responseData = response.data;
            const success = responseData.success || responseData.is_success || responseData.posts;

            if (success) {
                const rawPosts = responseData.data?.posts || responseData.posts || [];
                const stats = responseData.data?.stats || responseData.stats;

                // Map to unified structure for UI
                const mappedPosts = rawPosts.map((p: any) => ({
                    ...p,
                    id: p.id || p.instagram_id,
                    thumbnail: p.media_url || p.thumbnail,
                    text: p.caption || p.message_short || p.text || (p.media_type === "IMAGE" ? "Photo" : "Post"),
                    status: {
                        reply: p.auto_reply_enabled || p.has_post_auto_reply ? (p.post_auto_reply_status === "paused" ? "paused" : "active") : null,
                        comment: p.auto_comment_enabled ? "active" : null
                    }
                }));

                setPosts(mappedPosts);
                if (stats) setPageStats(stats);
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
                api.get("/instagram/comment-template?platform=instagram"),
                api.get("/instagram/auto-reply-template?platform=instagram")
            ]);
            if (commentsRes.data.success || commentsRes.data.is_success) setCommentTemplates(commentsRes.data.data || []);
            if (repliesRes.data.success || repliesRes.data.is_success) setReplyTemplates(repliesRes.data.data || []);
        } catch (error) { } finally { setIsTemplatesLoading(false); }
    }, []);

    const deleteTemplate = async (type: "comment" | "reply", id: number) => {
        if (!confirm("Are you sure you want to permanently delete this asset?")) return;
        try {
            await api.delete(type === "comment" ? `/instagram/comment-template/${id}` : `/instagram/auto-reply-template/${id}`);
            toast.success("Asset scrubbed successfully!");
            fetchTemplates();
        } catch (error) {
            toast.error("Failed to delete asset");
        }
    };

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

                    {/* Automation List Hub */}
                    <div className="space-y-4">

                        <div className="p-1 rounded-2xl bg-neutral-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 shadow-inner overflow-hidden">
                            {[
                                { id: 'comment', label: 'Auto Comment', desc: `Enabled : ${pageStats.auto_comment_count} . Comment : 0 . Not replied yet`, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                                { id: 'reply', label: 'Auto Comment Reply', desc: `Enabled : ${pageStats.auto_reply_count} . Response : 0 . Not replied yet`, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
                                { id: 'full', label: 'Full Account Comment Reply', desc: pageStats.has_full_page_reply ? 'Manage Full Account Reply Enabled' : 'Manage Full Account Reply Not Enabled', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50/50' },
                                { id: 'mention', label: 'Mention Reply', desc: 'Manage Mention Reply Not Enabled', icon: User, color: 'text-orange-500', bg: 'bg-orange-50/50' },
                                { id: 'tagged', label: 'Tagged Media', desc: 'Get the media objects in which Business has been tagged.', icon: Tag, color: 'text-rose-500', bg: 'bg-rose-50/50' }
                            ].map((item) => (
                                <div key={item.id} className="group p-3.5 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 transition-all border-b border-slate-50 dark:border-slate-800/50 last:border-0 cursor-pointer">
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-xs", item.bg, item.color)}>
                                            <item.icon size={16} strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-none">{item.label}</h4>
                                            <p className="text-[9px] font-medium text-slate-400 truncate max-w-[140px] mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="p-1.5 rounded-lg border border-slate-100 text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
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
                            posts.map((post, idx) => (
                                <div key={post.id || `post-${idx}`} className="group bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 transition-all hover:border-primary/30 shadow-sm">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-100">
                                        <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-[14px] font-bold text-slate-800 dark:text-white truncate">{selectedAccount?.username}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-[10px] text-slate-400 font-semibold">{post.created_at || 'Recently'}</p>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">ID: {post.id}</span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(post.id); toast.success("Post ID Copied!"); }}
                                                                className="hover:text-pink-900 dark:hover:text-pink-200 transition-colors active:scale-95"
                                                                title="Copy ID"
                                                            >
                                                                <Copy size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {post.status?.reply && (
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                                                            post.status.reply === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                                        )}>
                                                            Reply {post.status.reply}
                                                        </span>
                                                    )}

                                                    {post.status?.comment && (
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                                                            post.status.comment === "active" ? "bg-pink-500/10 text-pink-600" : "bg-slate-100 text-slate-400"
                                                        )}>
                                                            Comment {post.status.comment}
                                                        </span>
                                                    )}

                                                    <div className="relative" ref={dropdownRef}>
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                                                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-primary transition-all border border-transparent hover:border-pink-100 group/btn"
                                                        >
                                                            <Settings2 size={16} className={cn("transition-transform duration-300", activeDropdown === post.id && "rotate-90 text-primary")} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {activeDropdown === post.id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute right-0 top-full mt-2 w-[240px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-[60] py-2 overflow-hidden flex flex-col"
                                                                >
                                                                    {post.status?.reply ? (
                                                                        <>
                                                                            <button onClick={() => { setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                                                                                <Edit3 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Edit auto reply</span>
                                                                            </button>
                                                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                                                                                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">View auto reply report</span>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={() => { setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors border-b border-slate-50 dark:border-slate-800/50">
                                                                            <Megaphone className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Enable Auto Reply</span>
                                                                        </button>
                                                                    )}

                                                                    <div className="h-px bg-slate-50 dark:bg-slate-800 my-1 mx-4" />

                                                                    {post.status?.comment ? (
                                                                        <>
                                                                            <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                                                                                <Edit3 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Edit auto comment</span>
                                                                            </button>
                                                                            <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors text-slate-400">
                                                                                <BarChart3 className="w-4 h-4" />
                                                                                <span className="text-[12px] font-bold">View auto comment report</span>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                                                                            <Settings className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">Auto Comment</span>
                                                                        </button>
                                                                    )}

                                                                    <div className="h-px bg-slate-50 dark:bg-slate-800 my-1 mx-4" />

                                                                    <button
                                                                        onClick={() => { setSelectedPostForComment(post); setShowCommentNowModal(true); setActiveDropdown(null); }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                                                                    >
                                                                        <MessageCircle className="w-4 h-4 text-slate-400" />
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
                            <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner mt-4">
                                <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-none">No Interaction Active</p>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Sync your latest Instagram activity to start automating.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );

    const TemplateListView = ({ type }: { type: "comment" | "reply" }) => {
        const templates = (type === "comment" ? commentTemplates : replyTemplates).sort((a, b) => b.id - a.id);
        const [search, setSearch] = useState("");

        const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

        return (
            <div className="space-y-8 pb-20">
                {/* View Header */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[32px] flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setActiveView("dashboard")} className="w-12 h-12 rounded-[20px] bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 text-slate-400 hover:text-primary transition-all active:scale-95 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{type === 'comment' ? 'Comment Sets' : 'Reply Templates'}</h2>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Asset Inventory
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 pr-5 py-3 rounded-2xl bg-slate-50 border border-transparent focus:border-primary/20 focus:bg-white outline-none text-sm font-medium transition-all w-64"
                            />
                        </div>
                        <button
                            onClick={() => {
                                if (type === 'comment') { setEditingComment({ name: "", messages: [""] }); setShowCommentModal(true); }
                                else { setEditingReply({ name: "", message: "", reply_type: "generic" }); setShowReplyModal(true); }
                            }}
                            className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold text-[12px] uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center gap-3"
                        >
                            <Plus size={18} /> New Asset
                        </button>
                    </div>
                </div>

                {/* Table Layout */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_120px] gap-8 px-10 py-6 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-50 dark:border-slate-800">
                        {["Asset Identity", "Asset Type", "Last Update", "Actions"].map(h => (
                            <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</span>
                        ))}
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {isTemplatesLoading ? (
                            <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-primary/30 mx-auto" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="p-20 text-center bg-slate-50/30">
                                <Box className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-400 uppercase tracking-tight">Inventory Empty</h3>
                                <p className="text-xs text-slate-400 mt-2 font-medium italic">Create your first automation asset to get started.</p>
                            </div>
                        ) : (
                            filtered.map((t) => (
                                <div key={t.id} className="grid grid-cols-[2.5fr_1.5fr_1.5fr_120px] gap-8 px-10 py-8 items-center hover:bg-slate-50/20 transition-all group border-b border-transparent last:border-0">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-300 shadow-xs group-hover:shadow-md",
                                            type === 'comment' ? "bg-purple-50 text-purple-500 group-hover:bg-purple-600 group-hover:text-white" : "bg-pink-50 text-pink-500 group-hover:bg-pink-600 group-hover:text-white"
                                        )}>
                                            <LayoutGrid size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[15px] font-bold text-slate-800 dark:text-white truncate tracking-tight">{t.name}</p>
                                            <p className="text-[11px] text-slate-400 font-medium italic truncate mt-1">
                                                "{type === 'comment' ? (t as CommentTemplate).messages[0] : (t as ReplyTemplate).message}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                            type === 'comment' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-pink-50 text-pink-600 border-pink-100"
                                        )}>
                                            {type === 'comment' ? 'Comment Set' : (t as ReplyTemplate).reply_type}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2.5 text-slate-400">
                                        <Clock size={16} className="text-slate-300" />
                                        <span className="text-[13px] font-bold tracking-tight">Jan 24, 2026</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => { if (type === 'comment') { setEditingComment(t as CommentTemplate); setShowCommentModal(true); } else { setEditingReply(t as ReplyTemplate); setShowReplyModal(true); } }}
                                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white transition-all shadow-xs active:scale-95 border border-transparent hover:border-slate-100"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(type, t.id)}
                                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-xs active:scale-95 border border-transparent hover:border-rose-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a] font-sans">
            <div className="max-w-[1500px] mx-auto p-4 lg:p-10 space-y-10">

                <div className="pt-2" />

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
