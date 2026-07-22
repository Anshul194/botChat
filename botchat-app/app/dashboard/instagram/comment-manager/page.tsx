"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Instagram, MessageSquare, Zap, Target, MoreHorizontal, Search,
    Plus, RefreshCw, Layers, Sparkles, ChevronRight, ChevronDown, ChevronLeft, ListFilter, Clock,
    Trash2, Pause, Play, X, SlidersHorizontal, ArrowRight, LayoutGrid,
    Edit3, Save, Copy, Check, Loader2, Megaphone, Activity,
    Eye, Settings, Tag, MessageCircle, Image as ImageIcon,
    FileText, PieChart, Info, AlertCircle, Box, Heart, Bell, User,
    ShieldCheck, Settings2, BarChart3, ClipboardList, Menu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { CommentTemplateModal } from "../../components/modals/CommentTemplateModal";
import { CommentReportModal } from "../../components/modals/CommentReportModal";
import { ReplyTemplateModal } from "../../components/modals/ReplyTemplateModal";
import { PostAutoCommentModal } from "../../components/modals/PostAutoCommentModal";
import { PostAutoReplyModal } from "../../components/modals/PostAutoReplyModal";
import { PostCommentModal } from "../../components/modals/PostCommentModal";
import { FullAccountReplyModal } from "../../components/modals/FullAccountReplyModal";
import { MentionReplyModal } from "../../components/modals/MentionReplyModal";
import { PostReplyReportModal } from "../../components/modals/PostReplyReportModal";
import { CampaignReportModal } from "../../components/modals/CampaignReportModal";
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
    is_comment_disabled?: boolean;
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
    const { user } = useAppSelector((state) => state.auth);
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
    const [showFullReplyModal, setShowFullReplyModal] = useState(false);
    const [showMentionReplyModal, setShowMentionReplyModal] = useState(false);

    const [showPostAutoReplyModal, setShowPostAutoReplyModal] = useState(false);
    const [selectedPostForReply, setSelectedPostForReply] = useState<InstagramPost | null>(null);

    const [showReplyReportModal, setShowReplyReportModal] = useState(false);
    const [selectedPostForReport, setSelectedPostForReport] = useState<InstagramPost | null>(null);

    const [showCampaignReportModal, setShowCampaignReportModal] = useState(false);
    const [campaignReportType, setCampaignReportType] = useState<"auto-reply" | "auto-comment">("auto-reply");

    const [showCommentReportModal, setShowCommentReportModal] = useState(false);

    const [statusConfirm, setStatusConfirm] = useState<{
        isOpen: boolean;
        post: InstagramPost | null;
        action: "active" | "paused";
        type: "reply" | "comment";
    }>({ isOpen: false, post: null, action: "active", type: "reply" });

    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        post: InstagramPost | null;
        type: "reply" | "comment";
    }>({ isOpen: false, post: null, type: "reply" });
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Success Follow-up Modal
    const [showPauseAllOthersModal, setShowPauseAllOthersModal] = useState(false);
    const [isPausingAllOthers, setIsPausingAllOthers] = useState(false);

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
                        comment: p.auto_comment_enabled || p.has_post_auto_comment ? (p.post_auto_comment_status === "paused" ? "paused" : "active") : null
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

    const handleToggleStatus = async () => {
        const { post, action, type } = statusConfirm;
        if (!post || !selectedAccount) return;

        setIsUpdatingStatus(true);
        try {
            let res;
            if (type === "reply") {
                res = await api.patch(`/instagram/comment-manager/post-auto-reply/${post.id}/status?platform=instagram`, {
                    post_id: post.id,
                    instagram_id: selectedAccount.instagram_id,
                    status: action
                });
            } else {
                // Postman request uses PATCH and status in body
                res = await api.patch(`/instagram/post-auto-comment/${post.id}/status?platform=instagram`, {
                    status: action,
                    instagram_id: selectedAccount.instagram_id,
                    platform: "instagram"
                });
            }

            if (res.data.success || res.data.is_success) {
                toast.success(`${type === 'reply' ? 'Reply' : 'Comment'} campaign ${action === 'active' ? 'resumed' : 'paused'} successfully!`);
                setStatusConfirm({ ...statusConfirm, isOpen: false });
                fetchPosts();

                // On SUCCESS of activation, ask to pause others (requested feature)
                if (action === "active") {
                    setShowPauseAllOthersModal(true);
                }
            }
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDeleteStatus = async () => {
        const { post, type } = deleteConfirm;
        if (!post || !selectedAccount) return;

        setIsDeleting(true);
        try {
            if (type === "reply") {
                await api.delete(`/instagram/comment-manager/post-auto-reply/${post.id}?platform=instagram&instagram_id=${selectedAccount.instagram_id}`);
            } else {
                await api.delete(`/instagram/post-auto-comment/${post.id}?platform=instagram&instagram_id=${selectedAccount.instagram_id}`);
            }
            toast.success(`${type === 'reply' ? 'Reply' : 'Comment'} campaign deleted!`);
            setDeleteConfirm({ ...deleteConfirm, isOpen: false });
            fetchPosts();
        } catch (error) {
            toast.error("Failed to delete campaign");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleComments = async (post: InstagramPost, enabled: boolean) => {
        if (!selectedAccount) return;
        try {
            // Using facebook_page_id as instagram_id value as requested
            const res = await api.post("/instagram/comment-manager/toggle-comments?platform=instagram", {
                post_id: post.id,
                instagram_id: selectedAccount.instagram_id,
                comment_enabled: enabled
            });
            if (res.data.success || res.data.is_success) {
                toast.success(`Comments ${enabled ? 'enabled' : 'disabled'}!`);
                fetchPosts();
            }
        } catch (error) {
            toast.error("Failed to toggle comments");
        }
    };

    const handlePauseAllOthers = async () => {
        if (!selectedAccount) return;
        setIsPausingAllOthers(true);
        try {
            await api.put(`/instagram/comment-manager/post-auto-reply/pause-all?platform=instagram&instagram_id=${selectedAccount.instagram_id}`);
            toast.success("All other active campaigns have been paused.");
            setShowPauseAllOthersModal(false);
            fetchPosts();
        } catch (error) {
            toast.error("Failed to pause other campaigns.");
        } finally {
            setIsPausingAllOthers(false);
        }
    };

    const viewReplyReport = (post: InstagramPost) => {
        setSelectedPostForReport(post);
        setShowReplyReportModal(true);
    };

    const viewCommentReport = (post: InstagramPost) => {
        setSelectedPostForReport(post);
        setShowCommentReportModal(true);
    };

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── SIDEBAR COLUMN (1/3): STRATEGY LAB ── */}
            <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
                <div className="bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-md font-bold text-[var(--foreground)] dark:text-white uppercase tracking-tight">Strategy Lab</h2>

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
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }} className="absolute right-0 top-full mt-2 w-52 bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50">
                                        {[
                                            { id: "comment", label: "Comment Template", icon: MessageSquare, desc: "Preset comment sets", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10", view: "comment-templates" },
                                            { id: "reply", label: "Reply Template", icon: FileText, desc: "Auto-reply messages", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", view: "reply-templates" }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => { setShowTemplateMenu(false); setActiveView(opt.view as any); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] transition-colors text-left group border-b border-[var(--border)] dark:border-[var(--border)] last:border-0"
                                            >
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", opt.bg)}><opt.icon className={cn("w-4 h-4", opt.color)} /></div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-bold text-[var(--foreground)] dark:text-white truncate">{opt.label}</p>
                                                    <p className="text-[10px] text-[var(--muted-foreground)]/70 font-medium">{opt.desc}</p>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50 group-hover:text-[var(--muted-foreground)] ml-auto flex-shrink-0" />
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Automation List Hub */}
                    <div className="space-y-4">

                        <div className="p-1 rounded-2xl bg-neutral-50/50 dark:bg-slate-950/20 border border-[var(--border)] dark:border-[var(--border)] shadow-inner overflow-hidden">
                            {[
                                { id: 'comment', label: 'Auto Comment', desc: `Enabled : ${pageStats.auto_comment_count} . Comment : 0 . Not replied yet`, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                                { id: 'reply', label: 'Auto Comment Reply', desc: `Enabled : ${pageStats.auto_reply_count} . Response : 0 . Not replied yet`, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50/50' },
                                { id: 'full', label: 'Full Account Comment Reply', desc: pageStats.has_full_page_reply ? 'Manage Full Account Reply Enabled' : 'Manage Full Account Reply Not Enabled', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50/50' },
                                { id: 'mention', label: 'Mention Reply', desc: 'Manage Mention Reply Not Enabled', icon: User, color: 'text-orange-500', bg: 'bg-orange-50/50' },
                                { id: 'tagged', label: 'Tagged Media', desc: 'Get the media objects in which Business has been tagged.', icon: Tag, color: 'text-rose-500', bg: 'bg-rose-50/50' }
                            ].map((item) => (
                                <div key={item.id}
                                    onClick={() => {
                                        if (item.id === 'comment') {
                                            setCampaignReportType("auto-comment");
                                            setShowCampaignReportModal(true);
                                        }
                                        if (item.id === 'reply') {
                                            setCampaignReportType("auto-reply");
                                            setShowCampaignReportModal(true);
                                        }
                                        if (item.id === 'full') setShowFullReplyModal(true);
                                        if (item.id === 'mention') setShowMentionReplyModal(true);
                                    }}
                                    className="group p-3.5 flex items-center justify-between hover:bg-[var(--card)] dark:hover:bg-[var(--muted)] transition-all border-b border-[var(--border)] dark:border-[var(--border)]/50 last:border-0 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shadow-xs", item.bg, item.color)}>
                                            <item.icon size={16} strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] tracking-tight leading-none">{item.label}</h4>
                                            <p className="text-[9px] font-medium text-[var(--muted-foreground)]/70 truncate max-w-[140px] mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)]/50 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="w-full py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/70 font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-[var(--muted)]/50 transition-all">
                        <PieChart className="w-4 h-4" /> View Detailed Reports
                    </button>
                </div>
            </aside>

            {/* ── MAIN FEED (2/3): LATEST INTERACTIONS ── */}
            <main className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
                <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 shadow-sm flex-1 flex flex-col">
                    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-5 border-b border-[var(--border)]">
                        <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2 uppercase tracking-tight">
                            Latest Interactions
                        </h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative group flex-1 sm:flex-none sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/70 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search interactions..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[13px] outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                        </div>
                    </header>

                    <div className="space-y-4">
                        {isPostsLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="h-28 bg-[var(--muted)]/50 dark:bg-[var(--background)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl animate-pulse" />)
                        ) : posts.length > 0 ? (
                            posts.map((post, idx) => (
                                <div key={post.id || `post-${idx}`} className="group bg-[var(--muted)]/50 border border-[var(--border)] rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 transition-all hover:border-primary/30 shadow-sm">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-[var(--muted)]/80 border border-[var(--border)]">
                                        <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                                        <div className="space-y-1.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-[13px] sm:text-[14px] font-bold text-[var(--foreground)] truncate">{selectedAccount?.username}</h4>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                        <p className="text-[10px] text-[var(--muted-foreground)]/70 font-semibold">{post.created_at || 'Recently'}</p>
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 max-w-full">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[100px] sm:max-w-[160px]">ID: {post.id}</span>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(post.id); toast.success("Post ID Copied!"); }}
                                                                className="hover:text-primary/70 transition-colors active:scale-95 flex-shrink-0"
                                                                title="Copy ID"
                                                            >
                                                                <Copy size={10} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
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
                                                            post.status.comment === "active" ? "bg-[var(--primary)]/100/10 text-[var(--primary)]" : "bg-[var(--muted)]/60 text-[var(--muted-foreground)]/70"
                                                        )}>
                                                            Comment {post.status.comment}
                                                        </span>
                                                    )}

                                                    <div className="relative" ref={dropdownRef}>
                                                        <button
                                                            onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                                                            className="p-1.5 rounded-lg text-[var(--muted-foreground)]/70 dark:text-[var(--muted-foreground)] hover:text-primary transition-all border border-transparent hover:border-pink-100 group/btn"
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
                                                                    className="absolute right-0 top-full mt-2 w-[240px] bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl shadow-xl z-[60] py-2 overflow-hidden flex flex-col"
                                                                >
                                                                    {post.status?.reply ? (
                                                                        <>
                                                                            <button onClick={() => { setSelectedPostForReply(post); setShowPostAutoReplyModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors">
                                                                                <Edit3 className="w-4 h-4 text-[var(--primary)] dark:text-[var(--primary)]/80" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Edit auto reply</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setStatusConfirm({
                                                                                        isOpen: true,
                                                                                        post: post,
                                                                                        action: post.status?.reply === "paused" ? "active" : "paused",
                                                                                        type: "reply"
                                                                                    });
                                                                                    setActiveDropdown(null);
                                                                                }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors"
                                                                            >
                                                                                {post.status?.reply === "paused" ? (
                                                                                    <>
                                                                                        <Play className="w-4 h-4 text-emerald-600" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">Resume Campaign</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Pause className="w-4 h-4 text-amber-600" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">Pause Campaign</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                            <button onClick={() => { viewReplyReport(post); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors">
                                                                                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">View auto reply report</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setDeleteConfirm({ isOpen: true, post: post, type: "reply" });
                                                                                    setActiveDropdown(null);
                                                                                }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                                                                <span className="text-[12px] font-bold text-rose-600 uppercase tracking-tight">Delete Auto Reply</span>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={() => { setSelectedPostForReply(post); setShowPostAutoReplyModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors border-b border-[var(--border)] dark:border-[var(--border)]/50">
                                                                            <Megaphone className="w-4 h-4 text-[var(--primary)] dark:text-[var(--primary)]/80" />
                                                                            <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Enable Auto Reply</span>
                                                                        </button>
                                                                    )}

                                                                    <div className="h-px bg-[var(--muted)]/50 dark:bg-[var(--muted)] my-1 mx-4" />

                                                                    {post.status?.comment ? (
                                                                        <>
                                                                            <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors">
                                                                                <Edit3 className="w-4 h-4 text-[var(--primary)] dark:text-[var(--primary)]/80" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">Edit auto comment</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setStatusConfirm({
                                                                                        isOpen: true,
                                                                                        post: post,
                                                                                        action: post.status?.comment === "paused" ? "active" : "paused",
                                                                                        type: "comment"
                                                                                    });
                                                                                    setActiveDropdown(null);
                                                                                }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors"
                                                                            >
                                                                                {post.status?.comment === "paused" ? (
                                                                                    <>
                                                                                        <Play className="w-4 h-4 text-emerald-600 font-bold" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)]">Resume Comment Flow</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Pause className="w-4 h-4 text-amber-600 font-bold" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">Pause Comment Flow</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                            <button onClick={() => { viewCommentReport(post); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors">
                                                                                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">View comment report</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setDeleteConfirm({ isOpen: true, post: post, type: "comment" });
                                                                                    setActiveDropdown(null);
                                                                                }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                                                                <span className="text-[12px] font-bold text-rose-600 uppercase tracking-tight">Delete Auto Comment</span>
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors">
                                                                            <Settings className="w-4 h-4 text-[var(--primary)] dark:text-[var(--primary)]/80" />
                                                                            <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">Auto Comment</span>
                                                                        </button>
                                                                    )}

                                                                    <div className="h-px bg-[var(--muted)]/50 dark:bg-[var(--muted)] my-1 mx-4" />

                                                                    <div className="px-4 py-2">
                                                                        <span className="text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest leading-none">Comments Hub</span>
                                                                    </div>

                                                                    <button
                                                                        onClick={() => { setSelectedPostForComment(post); setShowCommentNowModal(true); setActiveDropdown(null); }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors"
                                                                    >
                                                                        <MessageSquare className="w-4 h-4 text-[var(--primary)] dark:text-[var(--primary)]/80" />
                                                                        <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">View Comments & Reply</span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => { handleToggleComments(post, !post.is_comment_disabled); setActiveDropdown(null); }}
                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)] text-left transition-colors font-bold"
                                                                    >
                                                                        {post.is_comment_disabled ? (
                                                                            <>
                                                                                <Zap className="w-4 h-4 text-emerald-600" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">Enable Comments</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Pause className="w-4 h-4 text-amber-600" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-tight">Disable Comments</span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[13px] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/70 line-clamp-1 italic font-medium p-2 bg-[var(--card)]/50 rounded-lg inline-block px-3 border border-[var(--border)] dark:border-[var(--border)]/50 mt-1">"{post.text}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-[var(--muted)]/50 dark:bg-[var(--background)]/80 rounded-2xl border-2 border-dashed border-[var(--border)] dark:border-[var(--border)] shadow-inner mt-4">
                                <Box className="w-12 h-12 text-[var(--muted-foreground)]/50 mx-auto mb-4" />
                                <p className="text-[12px] font-bold text-[var(--muted-foreground)]/70 uppercase tracking-widest leading-none">No Interaction Active</p>
                                <p className="text-[10px] text-[var(--muted-foreground)]/70 mt-2 font-medium">Sync your latest Instagram activity to start automating.</p>
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
            <div className="space-y-5 pb-20">
                {/* View Header */}
                <div className="bg-[var(--card)] border border-[var(--border)] p-4 sm:p-6 rounded-2xl shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button onClick={() => setActiveView("dashboard")} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-95 flex items-center justify-center shadow-sm flex-shrink-0">
                                <ChevronLeft size={18} />
                            </button>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-2xl font-bold text-[var(--foreground)] tracking-tight truncate">{type === 'comment' ? 'Comment Sets' : 'Reply Templates'}</h2>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Asset Inventory
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/50 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2.5 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] focus:border-primary/40 text-[var(--foreground)] outline-none text-sm font-medium transition-all w-full sm:w-52 placeholder:text-[var(--muted-foreground)]/40"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    if (type === 'comment') { setEditingComment({ name: "", messages: [""] }); setShowCommentModal(true); }
                                    else { setEditingReply({ name: "", message: "", reply_type: "generic" }); setShowReplyModal(true); }
                                }}
                                className="bg-primary text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                            >
                                <Plus size={16} /> <span className="hidden xs:inline">New Asset</span><span className="xs:hidden">New</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Responsive Table / Card Layout */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
                    {/* Desktop header — hidden on mobile */}
                    <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_100px] gap-4 px-5 py-4 bg-[var(--muted)]/30 border-b border-[var(--border)]">
                        {["Asset Identity", "Type", "Updated", "Actions"].map(h => (
                            <span key={h} className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">{h}</span>
                        ))}
                    </div>

                    <div className="divide-y divide-[var(--border)]/50">
                        {isTemplatesLoading ? (
                            <div className="p-16 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary/40 mx-auto" /></div>
                        ) : filtered.length === 0 ? (
                            <div className="p-16 text-center bg-[var(--muted)]/10">
                                <Box className="w-12 h-12 text-[var(--muted-foreground)]/30 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-[var(--muted-foreground)] uppercase tracking-tight">Inventory Empty</h3>
                                <p className="text-xs text-[var(--muted-foreground)]/70 mt-1.5 font-medium italic">Create your first automation asset to get started.</p>
                            </div>
                        ) : (
                            filtered.map((t) => (
                                <div key={t.id} className="group p-4 sm:px-5 sm:py-5 sm:grid sm:grid-cols-[2fr_1fr_1fr_100px] sm:gap-4 flex flex-col gap-3 items-start sm:items-center hover:bg-[var(--muted)]/20 transition-all border-b border-transparent last:border-0">
                                    {/* Identity */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className={cn(
                                            "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xs group-hover:shadow-md flex-shrink-0",
                                            type === 'comment' ? "bg-purple-500/10 text-purple-500 group-hover:bg-purple-600 group-hover:text-white" : "bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"
                                        )}>
                                            <LayoutGrid size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[14px] font-bold text-[var(--foreground)] truncate tracking-tight">{t.name}</p>
                                            <p className="text-[11px] text-[var(--muted-foreground)] font-medium italic truncate mt-0.5">
                                                &ldquo;{type === 'comment' ? (t as CommentTemplate).messages[0] : (t as ReplyTemplate).message}&rdquo;
                                            </p>
                                        </div>
                                        {/* Mobile-only actions */}
                                        <div className="flex items-center gap-2 sm:hidden ml-auto flex-shrink-0">
                                            <button
                                                onClick={() => { if (type === 'comment') { setEditingComment(t as CommentTemplate); setShowCommentModal(true); } else { setEditingReply(t as ReplyTemplate); setShowReplyModal(true); } }}
                                                className="w-9 h-9 rounded-xl bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-primary hover:bg-[var(--card)] border border-transparent transition-all active:scale-95 flex items-center justify-center"
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                            <button
                                                onClick={() => deleteTemplate(type, t.id)}
                                                className="w-9 h-9 rounded-xl bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-rose-600 hover:bg-rose-500/10 border border-transparent transition-all active:scale-95 flex items-center justify-center"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Type badge */}
                                    <div className="hidden sm:flex">
                                        <span className={cn(
                                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                            type === 'comment' ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
                                        )}>
                                            {type === 'comment' ? 'Comment Set' : (t as ReplyTemplate).reply_type}
                                        </span>
                                    </div>

                                    {/* Updated date */}
                                    <div className="hidden sm:flex items-center gap-2 text-[var(--muted-foreground)]">
                                        <Clock size={14} className="text-[var(--muted-foreground)]/50" />
                                        <span className="text-[12px] font-bold tracking-tight">Jan 24, 2026</span>
                                    </div>

                                    {/* Desktop actions */}
                                    <div className="hidden sm:flex items-center gap-2">
                                        <button
                                            onClick={() => { if (type === 'comment') { setEditingComment(t as CommentTemplate); setShowCommentModal(true); } else { setEditingReply(t as ReplyTemplate); setShowReplyModal(true); } }}
                                            className="w-9 h-9 rounded-xl bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-primary hover:bg-[var(--card)] hover:border-primary/30 border border-transparent transition-all shadow-xs active:scale-95 flex items-center justify-center"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(type, t.id)}
                                            className="w-9 h-9 rounded-xl bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-rose-600 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all shadow-xs active:scale-95 flex items-center justify-center"
                                        >
                                            <Trash2 size={15} />
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
        <div className="bg-[var(--background)] transition-all duration-300 pb-32">
            {/* 1. STICKY MOBILE HEADER */}
            <div className="sticky top-0 z-[100] md:hidden bg-[var(--card)]/80 dark:bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)] dark:border-[var(--border)] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileSidebar'))}
                        className="w-9 h-9 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] dark:hover:text-white transition-all bg-[var(--muted)]/60 dark:bg-[var(--muted)] rounded-lg shadow-sm"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: "var(--nav-active-color)" }}>Intelligence</span>
                        <h1 className="text-sm font-bold text-[var(--foreground)] dark:text-white uppercase mt-0.5">IG Manager</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]"><Search className="w-4 h-4" /></button>
                    <div className="w-8 h-8 rounded-full bg-[var(--muted)]/60 dark:bg-[var(--muted)] border-2 border-white dark:border-[var(--border)] shadow-sm overflow-hidden flex items-center justify-center">
                        <Instagram className="w-4 h-4" style={{ color: "var(--nav-active-color)" }} />
                    </div>
                </div>
            </div>

            <div className="max-w-[1500px] mx-auto p-4 lg:p-10 space-y-10">

                {/* ── TOP SECTION: ACCOUNT SELECTION (Pill Style) ── */}
                <div className="flex flex-col sm:flex-row gap-3 w-full min-w-0">
                    <div className="flex-1 min-w-0 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-1.5 shadow-sm flex items-center relative group/slider">
                        <button onClick={() => scroll('left')} className="p-2 flex-shrink-0 text-[var(--muted-foreground)]/70 transition-colors z-10 bg-[var(--card)] shadow-[10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-l-xl opacity-0 group-hover/slider:opacity-100 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div ref={scrollRef} className="flex-1 min-w-0 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-2 items-center">
                            {accounts.map(acc => (
                                <button
                                    key={acc.id}
                                    onClick={() => setSelectedAccount(acc)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap flex items-center gap-3",
                                        selectedAccount?.id === acc.id
                                            ? "text-white"
                                            : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"
                                    )}
                                    style={selectedAccount?.id === acc.id ? { background: "var(--brand-gradient)", boxShadow: "var(--shadow-pink)" } : undefined}
                                >
                                    <div className={cn("w-6 h-6 rounded-lg overflow-hidden border border-white/20", selectedAccount?.id === acc.id ? "opacity-100" : "opacity-60")}>
                                        <img src={acc.profile_picture || `https://ui-avatars.com/api/?name=${acc.username}&background=fbcfe8&color=db2777`} className="w-full h-full object-cover" />
                                    </div>
                                    @{acc.username}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => scroll('right')} className="p-2 flex-shrink-0 text-[var(--muted-foreground)]/70 transition-colors z-10 bg-[var(--card)] shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-r-xl opacity-0 group-hover/slider:opacity-100 transition-opacity" style={{ color: "var(--muted-foreground)" }}>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative shrink-0 z-[60]">
                        <button
                            onClick={() => setShowPageDropdown(!showPageDropdown)}
                            className="h-full px-6 py-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm flex items-center justify-between gap-4 text-sm font-bold transition-colors text-[var(--foreground)] group"
                            style={{ borderColor: showPageDropdown ? "var(--nav-active-border)" : undefined }}
                        >
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" style={{ color: "var(--nav-active-color)" }} />
                                Quick Find
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-[var(--muted-foreground)]/50 transition-transform", showPageDropdown && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {showPageDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-[calc(100%+8px)] w-72 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
                                >
                                    <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]/30">
                                        <div className="relative border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden transition-all" style={{ borderColor: quickFindSearch ? "var(--nav-active-border)" : undefined }}>
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/50" />
                                            <input
                                                type="text"
                                                placeholder="Search accounts..."
                                                value={quickFindSearch}
                                                onChange={(e) => setQuickFindSearch(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 text-[13px] font-semibold outline-none bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto no-scrollbar p-2 space-y-1">
                                        {accounts.filter(acc => acc.username.toLowerCase().includes(quickFindSearch.toLowerCase())).map(acc => (
                                            <button
                                                key={acc.id}
                                                onClick={() => { setSelectedAccount(acc); setShowPageDropdown(false); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all flex items-center gap-3",
                                                    selectedAccount?.id === acc.id ? "" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"
                                                )}
                                                style={selectedAccount?.id === acc.id ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)" } : undefined}
                                            >
                                                <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                                                    <img src={acc.profile_picture || `https://ui-avatars.com/api/?name=${acc.username}&background=fbcfe8&color=db2777`} className="w-full h-full object-cover" />
                                                </div>
                                                @{acc.username}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

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
                    facebookPageId={selectedAccount?.page?.page_id || ""}
                />

                <PostAutoReplyModal
                    isOpen={showPostAutoReplyModal}
                    onClose={() => setShowPostAutoReplyModal(false)}
                    onSaved={fetchPosts}
                    platform="instagram"
                    postId={selectedPostForReply?.id || ""}
                    pageId={selectedAccount?.instagram_id || ""}
                />

                <PostCommentModal
                    isOpen={showCommentNowModal}
                    onClose={() => setShowCommentNowModal(false)}
                    platform="instagram"
                    postId={selectedPostForComment?.id || ""}
                    pageId={selectedAccount?.instagram_id || ""}
                />

                <FullAccountReplyModal
                    isOpen={showFullReplyModal}
                    onClose={() => setShowFullReplyModal(false)}
                    onSaved={() => {
                        fetchTemplates();
                    }}
                    instagramId={selectedAccount?.instagram_id || ""}
                    platform="instagram"
                />

                <MentionReplyModal
                    isOpen={showMentionReplyModal}
                    onClose={() => setShowMentionReplyModal(false)}
                    onSaved={() => {
                        fetchTemplates();
                    }}
                    instagramId={selectedAccount?.instagram_id || ""}
                    platform="instagram"
                />

                <CampaignReportModal
                    isOpen={showCampaignReportModal}
                    onClose={() => setShowCampaignReportModal(false)}
                    reportType={campaignReportType}
                    platform="instagram"
                    pageId={selectedAccount?.page?.page_id || selectedAccount?.instagram_id || ""}
                />

                <CommentReportModal
                    isOpen={showCommentReportModal}
                    onClose={() => setShowCommentReportModal(false)}
                    platform="instagram"
                    postId={selectedPostForReport?.id || ""}
                    pageId={selectedAccount?.page?.page_id || selectedAccount?.instagram_id || ""}
                />

                <PostReplyReportModal
                    isOpen={showReplyReportModal}
                    onClose={() => setShowReplyReportModal(false)}
                    platform="instagram"
                    postId={selectedPostForReport?.id || ""}
                    instagramId={selectedAccount?.instagram_id || ""}
                />

                {/* Status Toggle Modal */}
                <AnimatePresence>
                    {statusConfirm.isOpen && (
                        <div key="status-confirm-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatusConfirm({ ...statusConfirm, isOpen: false })} className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[var(--card)] dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                <div className="p-8 text-center space-y-6">
                                    <div className={cn(
                                        "w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg",
                                        statusConfirm.action === "paused" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                                    )}>
                                        {statusConfirm.action === "paused" ? <Pause size={32} /> : <Play size={32} />}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tight">
                                            {statusConfirm.action === "paused" ? "Pause Campaign?" : "Resume Campaign?"}
                                        </h3>
                                        <p className="text-[13px] font-medium text-neutral-500 leading-relaxed px-4">
                                            Are you sure you want to {statusConfirm.action} this automated lifecycle?
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setStatusConfirm({ ...statusConfirm, isOpen: false })}
                                            className="flex-1 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-all active:scale-95"
                                        >
                                            No, Cancel
                                        </button>
                                        <button
                                            onClick={handleToggleStatus}
                                            disabled={isUpdatingStatus}
                                            className={cn(
                                                "flex-[2] py-4 rounded-2xl text-[11px] font-semibold uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-50",
                                                statusConfirm.action === "paused" ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-500 shadow-emerald-500/20"
                                            )}
                                        >
                                            {isUpdatingStatus ? "Updating..." : `Yes, ${statusConfirm.action} it`}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Deletion Confirmation Modal */}
                <AnimatePresence>
                    {deleteConfirm.isOpen && (
                        <div key="delete-confirm-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })} className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[var(--card)] dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                <div className="p-8 text-center space-y-6">
                                    <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg bg-rose-100 text-rose-600">
                                        <Trash2 size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tight">
                                            Delete Campaign?
                                        </h3>
                                        <p className="text-[13px] font-medium text-neutral-500 leading-relaxed px-4">
                                            Are you absolutely sure you want to delete this automated lifecycle? This action is irreversible.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                                            className="flex-1 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-all active:scale-95"
                                        >
                                            No, Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteStatus}
                                            disabled={isDeleting}
                                            className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-[11px] uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isDeleting ? "Deleting..." : "Yes, Delete it"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Pause All Others Modal (Success Follow-up) */}
                <AnimatePresence>
                    {showPauseAllOthersModal && (
                        <div key="pause-others-modal" className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPauseAllOthersModal(false)} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-[var(--card)] dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-neutral-100 dark:border-neutral-800">
                                <div className="p-10 text-center space-y-7">
                                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[var(--primary)]/100/10 text-[var(--primary)]">
                                        <Sparkles size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">Campaign is Live!</h3>
                                        <p className="text-[13px] font-medium text-neutral-500 leading-relaxed px-2">
                                            Great! Your automation is now active. Would you like to <span className="text-[var(--primary)] font-bold">pause all other</span> active campaigns for this account to maintain focus?
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 pt-4">
                                        <button
                                            onClick={handlePauseAllOthers}
                                            disabled={isPausingAllOthers}
                                            className="w-full py-4 rounded-2xl bg-[var(--background)] dark:bg-[var(--card)] text-white dark:text-[var(--foreground)] text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                        >
                                            {isPausingAllOthers ? "Processing..." : "Yes, Pause all Others"}
                                        </button>
                                        <button
                                            onClick={() => setShowPauseAllOthersModal(false)}
                                            className="w-full py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-all active:scale-95"
                                        >
                                            No, Keep them active
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
