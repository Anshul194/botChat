"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Facebook, MessageSquare, MessageCircle, Zap, Target,
    MoreHorizontal, Search, CheckCircle2,
    Clock, BarChart3, ChevronRight, ChevronLeft, ListFilter,
    Settings2, Filter, LayoutGrid, List,
    Activity, Globe, ArrowUpRight, Plus,
    MousePointer2, Layers, Sparkles, Command,
    FileText, PieChart, Users, Settings,
    MoreVertical, Info, RefreshCw, Box,
    Trash2, Pause, Play, FileJson, Megaphone,
    ArrowRight, X, AlertCircle, ChevronDown, Tag, SlidersHorizontal, Menu,
    ShieldAlert, EyeOff, Scissors, Edit3, Image as ImageIcon, Video, Upload,
    Save, Ban, Copy, Check, Loader2, ClipboardList, Send, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { CommentTemplateModal } from "../../components/modals/CommentTemplateModal";
import { ReplyTemplateModal } from "../../components/modals/ReplyTemplateModal";
import { PostAutoCommentModal } from "../../components/modals/PostAutoCommentModal";
import { PostAutoReplyModal } from "../../components/modals/PostAutoReplyModal";
import { CommentReportModal } from "../../components/modals/CommentReportModal";
import { CampaignReportModal } from "../../components/modals/CampaignReportModal";
import { PostCommentModal } from "../../components/modals/PostCommentModal";
import { PostReplyReportModal } from "../../components/modals/PostReplyReportModal";

// ── Types ──────────────────────────────────────────────────────────────────────
interface FacebookPage {
    id: number;
    page_id: string;
    page_name: string;
    is_enabled: boolean;
    image?: string;
    picture?: string;
}

interface FacebookPost {
    id: string;
    url?: string;
    user?: string;
    time?: string;
    text: string;
    thumbnail: string;
    stats?: {
        reply: number;
        comment: number;
    };
    status?: {
        reply?: string | null;
        comment?: string | null;
    };
}

export default function CommentManager() {
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const [pages, setPages] = useState<FacebookPage[]>([]);
    const [selectedPage, setSelectedPage] = useState<FacebookPage | null>(null);
    const [posts, setPosts] = useState<FacebookPost[]>([]);
    const [pageStats, setPageStats] = useState({
        auto_reply_count: 0,
        auto_comment_count: 0,
        has_full_page_reply: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isPostsLoading, setIsPostsLoading] = useState(false);
    const [isMoreLoading, setIsMoreLoading] = useState(false);
    const [isIdModalOpen, setIsIdModalOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [manualPostId, setManualPostId] = useState("");
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [checkData, setCheckData] = useState<any>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [quickFindSearch, setQuickFindSearch] = useState("");

    // Popup states for directly editing comment/reply campaigns
    const [isReplyPopupOpen, setIsReplyPopupOpen] = useState(false);
    const [isCommentPopupOpen, setIsCommentPopupOpen] = useState(false);

    // Auto Comment Modal
    const [showAutoCommentModal, setShowAutoCommentModal] = useState(false);
    const [selectedPostForAuto, setSelectedPostForAuto] = useState<FacebookPost | null>(null);

    // Auto Reply Modal
    const [showAutoReplyModal, setShowAutoReplyModal] = useState(false);
    const [selectedPostForReply, setSelectedPostForReply] = useState<FacebookPost | null>(null);

    // Report Modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedPostForReport, setSelectedPostForReport] = useState<FacebookPost | null>(null);

    // Global Reporting Modal
    const [showCampaignReportModal, setShowCampaignReportModal] = useState(false);
    const [activeReportType, setActiveReportType] = useState<"auto-reply" | "auto-comment" | "full-page-reply">("auto-reply");

    // Status Toggle Confirmation
    const [statusConfirm, setStatusConfirm] = useState<{
        isOpen: boolean;
        post: FacebookPost | null;
        type: "comment" | "reply";
        action: "active" | "paused";
    }>({ isOpen: false, post: null, type: "comment", action: "paused" });
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Deletion Modal
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        post: FacebookPost | null;
        type: "comment" | "reply";
    }>({ isOpen: false, post: null, type: "comment" });
    const [isDeleting, setIsDeleting] = useState(false);

    // Leave a Comment Now Modal
    const [showCommentNowModal, setShowCommentNowModal] = useState(false);
    const [selectedPostForComment, setSelectedPostForComment] = useState<FacebookPost | null>(null);

    const [showReplyReportModal, setShowReplyReportModal] = useState(false);
    const [selectedPostForReportReply, setSelectedPostForReportReply] = useState<FacebookPost | null>(null);

    // Reporting Dropdown
    const [showReportDropdown, setShowReportDropdown] = useState(false);
    const reportDropdownRef = useRef<HTMLDivElement>(null);

    const loaderRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showPageDropdown, setShowPageDropdown] = useState(false);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const amount = 200;
            scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const [hasMore, setHasMore] = useState(true);

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
            if (reportDropdownRef.current && !reportDropdownRef.current.contains(e.target as Node)) {
                setShowReportDropdown(false);
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
    const handleToggleStatus = async () => {
        const { post, type, action } = statusConfirm;
        if (!post) return;

        setIsUpdatingStatus(true);
        try {
            const endpoint = `/facebook/post-auto-${type}/${post.id}/status`;

            const res = await api.patch(endpoint, { status: action });
            if (res.data.success || res.data.is_success) {
                toast.success(`Campaign ${action === 'active' ? 'resumed' : 'paused'} successfully!`);
                setStatusConfirm({ ...statusConfirm, isOpen: false });
                fetchPosts();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Status update failed");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleDeleteCampaign = async () => {
        const { post, type } = deleteConfirm;
        if (!post) return;

        setIsDeleting(true);
        try {
            const endpoint = `/facebook/post-auto-${type}/${post.id}`;
            const res = await api.delete(endpoint);
            if (res.data.success || res.data.is_success) {
                toast.success(`Automated ${type} lifecycle deleted!`);
                setDeleteConfirm({ ...deleteConfirm, isOpen: false });
                fetchPosts();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Deletion failed");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFetchReport = async (type: "auto-reply" | "auto-comment" | "full-page-reply") => {
        setShowReportDropdown(false);
        setActiveReportType(type);
        setShowCampaignReportModal(true);
    };

    const fetchPosts = async (isAppend = false) => {
        if (!selectedPage) return;

        if (isAppend) setIsMoreLoading(true);
        else setIsPostsLoading(true);

        try {
            const pageIdForApi = selectedPage.page_id || String(selectedPage.id);
            const response = await api.get(`/facebook/comment-manager/posts/${pageIdForApi}`);

            const data = response.data || {};
            const fetchedPosts = Array.isArray(data.posts) ? data.posts : [];

            if (data.stats) {
                setPageStats(data.stats);
            }

            const mapped = fetchedPosts.map((p: any, idx: number) => {
                const fullId = p.id ? String(p.id) : `post-${idx}`;
                const [pid, postid] = fullId.split('_');
                const fbUrl = postid ? `https://facebook.com/${pid}/posts/${postid}` : `https://facebook.com/${fullId}`;

                return {
                    id: fullId,
                    url: fbUrl,
                    user: p.user || selectedPage.page_name,
                    time: p.created_time ? new Date(p.created_time).toLocaleString() : new Date().toLocaleString(),
                    text: p.message || p.message_short || "View Post Interaction",
                    thumbnail: p.full_picture || "https://picsum.photos/seed/" + p.id + "/200/200",
                    stats: {
                        reply: p.auto_reply_enabled ? 1 : 0,
                        comment: p.auto_comment_enabled ? 1 : 0
                    },
                    status: {
                        reply: p.post_auto_reply_status,
                        comment: p.post_auto_comment_status
                    }
                };
            });

            if (isAppend) {
                setPosts(prev => [...prev, ...mapped]);
                // In a real scenario, check if pagination has more
                if (mapped.length === 0) setHasMore(false);
            } else {
                setPosts(mapped);
                setHasMore(mapped.length > 0);
            }

        } catch (error) {
            console.error("Fetch Posts Error:", error);
        } finally {
            setIsPostsLoading(false);
            setIsMoreLoading(false);
        }
    };

    const handleCheckPostId = async () => {
        if (!manualPostId.trim()) {
            toast.error("Please enter a Post ID");
            return;
        }
        setIsCheckingId(true);
        try {
            const response = await api.post("/facebook/check-post-campaign", {
                post_id: manualPostId.trim()
            });

            if (response.data.success || response.data.is_success) {
                toast.success("Post ID checked successfully!");
                setCheckData(response.data.data);
                fetchPosts(); // Refresh background grid
            } else {
                toast.error(response.data.message || "Failed to sync Post ID");
            }
        } catch (err: any) {
            console.error("Check Post ID Error:", err);
            toast.error(err.response?.data?.message || "Error validating Post ID");
        } finally {
            setIsCheckingId(false);
        }
    };

    // ── Effects ──
    useEffect(() => {
        fetchPages();
    }, []);

    useEffect(() => {
        if (selectedPage) {
            fetchPosts();
        }
    }, [selectedPage]);

    return (
        <div className="w-full overflow-x-hidden bg-[var(--background)] text-[var(--foreground)] transition-all duration-300 pb-32">
            {/* ── UNIFIED PAGE HEADER ─────────────────────────────────────────── */}
            <div className="sticky top-0 z-[50] flex flex-col bg-[var(--card)] border-b border-[var(--border)] shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                <div className="flex items-center justify-between px-4 md:px-8 pt-3 pb-3 md:pt-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/dashboard/facebook')}
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-90 bg-[var(--muted)] text-[var(--muted-foreground)]"
                        >
                            <ArrowLeft className="w-[15px] h-[15px]" strokeWidth={2.5} />
                        </button>
                        {/* Brand dot + text */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-[#0866FF]">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-medium tracking-widest uppercase leading-none text-[#0866FF]">Facebook</span>
                                <h1 className="text-[14px] md:text-[16px] font-semibold leading-tight truncate text-[var(--foreground)]">
                                    Comment Manager
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)]/55 rounded-full border border-[var(--border)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Neural Live</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cn("max-w-[1400px] mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 lg:py-8 space-y-0 sm:space-y-4 md:space-y-6")}>

                {/* ── TOP SECTION: PAGE SELECTION (Pill Style) ── */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 sm:px-0 py-3 sm:py-0 border-b border-[var(--border)] sm:border-none">
                    {pages.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPage(p)}
                            className={cn(
                                "px-3.5 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-all shrink-0 border flex items-center gap-1.5",
                                selectedPage?.id === p.id
                                    ? "bg-[#0866FF] border-[#0866FF] text-white shadow-sm"
                                    : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--card)]"
                            )}
                        >
                            <div className={cn("w-4 h-4 rounded-[4px] overflow-hidden border border-white/20", selectedPage?.id === p.id ? "opacity-100" : "opacity-60")}>
                                <img src={p.image || p.picture || `https://ui-avatars.com/api/?name=${p.page_name}&background=fbcfe8&color=db2777`} className="w-full h-full object-cover" />
                            </div>
                            {p.page_name}
                        </button>
                    ))}
                </div>

                {/* 3. MAIN GRID (1/3 LEFT, 2/3 RIGHT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6 items-start">

                    {/* ── LEFT COLUMN (1/3): STRATEGY & ACTIONS ── */}
                    <aside className="lg:col-span-4 space-y-4 sm:space-y-6 order-2 lg:order-1 px-4 sm:px-0 pt-4 sm:pt-0">
                        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 sm:p-6 shadow-sm space-y-4 sm:space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm sm:text-md font-bold text-[var(--foreground)] uppercase tracking-tight">Strategy Lab</h2>

                                {/* ── Manage Templates button + dropdown ─────── */}
                                <div className="relative" ref={templateMenuRef}>
                                    <button
                                        onClick={() => setShowTemplateMenu(v => !v)}
                                        className="flex items-center gap-1.5 text-[11px] sm:text-[12px] font-bold text-[var(--primary)] hover:opacity-85 transition-colors group"
                                    >
                                        Manage Templates
                                        <ChevronDown className={cn(
                                            "w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200",
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
                                                className="absolute right-0 sm:left-0 top-full mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50"
                                            >
                                                {[
                                                    {
                                                        id: "comment",
                                                        label: "Comment Template",
                                                        icon: MessageSquare,
                                                        desc: "Preset comment sets",
                                                        color: "text-[var(--primary)]",
                                                        bg: "bg-[var(--primary)]/10",
                                                    },
                                                    {
                                                        id: "reply",
                                                        label: "Reply Template",
                                                        icon: FileText,
                                                        desc: "Auto-reply messages",
                                                        color: "text-[var(--primary)]",
                                                        bg: "bg-[var(--primary)]/10",
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
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)]/50 transition-colors text-left group border-b border-[var(--border)] last:border-0"
                                                    >
                                                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", opt.bg)}>
                                                            <opt.icon className={cn("w-4 h-4", opt.color)} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[13px] font-bold text-[var(--foreground)] truncate">{opt.label}</p>
                                                            <p className="text-[10px] text-[var(--muted-foreground)] font-medium">{opt.desc}</p>
                                                        </div>
                                                        <ChevronRight className="w-3.5 h-3.5 text-slate-350 group-hover:text-[var(--muted-foreground)] ml-auto flex-shrink-0" />
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Enabled Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-center">
                                    <p className="text-3xl font-bold text-[var(--primary)]">{pageStats.auto_reply_count}</p>
                                    <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase mt-1">Auto Replies</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)] text-center">
                                    <p className="text-3xl font-bold text-[var(--primary)]">{pageStats.auto_comment_count}</p>
                                    <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase mt-1">Auto Comments</p>
                                </div>
                            </div>

                            {/* Full Page CTA */}
                            <div className="p-3 sm:p-6 rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/20 space-y-3 sm:space-y-4 text-center">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto">
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase">Bot Reply Setup</h3>
                                    <p className="text-[11px] font-medium text-[var(--foreground)] opacity-90">Configure automated bot replies for all incoming comments</p>
                                </div>
                                <button
                                    onClick={() => setIsCampaignModalOpen(true)}
                                    className="w-full py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[13px] shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {pageStats.has_full_page_reply ? "Edit Bot Reply Rules" : "Enable Bot Reply"}
                                </button>
                            </div>


                            <div className="relative" ref={reportDropdownRef}>
                                <button
                                    onClick={() => setShowReportDropdown(!showReportDropdown)}
                                    className="w-full py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] border border-[var(--border)] font-bold text-[12px] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm uppercase tracking-wider"
                                >
                                    <ClipboardList className="w-4 h-4" />
                                    See Campaign Reports
                                    <ChevronDown className={cn("w-4 h-4 transition-transform", showReportDropdown && "rotate-180")} />
                                </button>

                                <AnimatePresence>
                                    {showReportDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-full left-0 right-0 mb-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-[60] py-2"
                                        >
                                            {[
                                                { id: "auto-reply", label: "Auto Reply Report", icon: Megaphone, color: "text-[var(--primary)]" },
                                                { id: "auto-comment", label: "Auto Comment Report", icon: MessageSquare, color: "text-[var(--primary)]" },
                                                { id: "full-page-reply", label: "Full Page Reply Report", icon: Layers, color: "text-[var(--primary)]" }
                                            ].map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => handleFetchReport(report.id as any)}
                                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)]/50 transition-all text-left group"
                                                >
                                                    <div className={cn("w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center group-hover:bg-[var(--card)] shadow-xs transition-all", report.color)}>
                                                        <report.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-[var(--foreground)]">{report.label}</p>
                                                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-tight">Sync latest analytics</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </aside>

                    {/* ── RIGHT COLUMN (2/3): POST FEED ── */}
                    <main className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2">
                        <section className="bg-[var(--card)] border-0 border-t border-b sm:border border-[var(--border)] rounded-none sm:rounded-2xl p-4 sm:p-6 shadow-none sm:shadow-sm flex-1 flex flex-col">
                            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border)]">
                                <section>
                                    <h2 className="text-sm sm:text-base lg:text-lg font-bold text-[var(--foreground)] flex items-center gap-2 uppercase tracking-tight">
                                        Latest Interactions
                                    </h2>
                                    <p className="text-[10px] font-semibold text-[var(--muted-foreground)] mt-0.5 tracking-wider uppercase">Live Activity Feed</p>
                                </section>
                                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
                                    <div className="relative flex-1 min-w-0">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                                        <input
                                            type="text"
                                            placeholder="Search interactions..."
                                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[13px] text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--primary)]/30"
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsIdModalOpen(true)}
                                        className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[11px] uppercase tracking-wide hover:opacity-90 transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        ID Lookup
                                    </button>
                                </div>
                            </header>

                            <div className="space-y-4">
                                {isPostsLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-[var(--muted)]/30 border border-[var(--border)] rounded-2xl animate-pulse" />
                                    ))
                                ) : posts.length > 0 ? (
                                    posts.map((post, idx) => (
                                        <div key={post.id || `post-${idx}`} className="group bg-[var(--muted)]/20 border border-[var(--border)] rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 transition-all hover:border-[var(--primary)]/30 relative">
                                            <div
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-[var(--muted)]/80 dark:bg-[var(--muted)] block group/thumb relative"
                                            >
                                                <img src={post.thumbnail} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-[13px] sm:text-[14px] font-bold text-[var(--foreground)] truncate transition-colors flex items-center gap-2 group/title">
                                                                {post.user}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                                                <p className="text-[10px] text-[var(--muted-foreground)] font-semibold whitespace-nowrap">{post.time}</p>
                                                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 max-w-full w-fit">
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[100px] sm:max-w-[160px]">ID: {post.id}</span>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(post.id); toast.success("Post ID Copied!"); }}
                                                                        className="hover:opacity-80 transition-colors active:scale-95 flex-shrink-0"
                                                                        title="Copy ID"
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-shrink-0 justify-end">
                                                            {/* Reply Status Tag */}
                                                            {post.status?.reply && (
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                                                                    post.status.reply === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                                                )}>
                                                                    Reply {post.status.reply}
                                                                </span>
                                                            )}
                                                            {/* Comment Status Tag */}
                                                            {post.status?.comment && (
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                                                                    post.status.comment === "active" ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                                                                )}>
                                                                    Comment {post.status.comment}
                                                                </span>
                                                            )}
                                                            <div className="relative" ref={dropdownRef}>
                                                                <button
                                                                    onClick={() => setActiveDropdown(activeDropdown === post.id ? null : post.id)}
                                                                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all border border-transparent hover:border-[var(--primary)]/20 group/btn"
                                                                >
                                                                    <Settings2 size={16} className={cn("transition-transform duration-300", activeDropdown === post.id && "rotate-90 text-[var(--primary)]")} />
                                                                </button>

                                                                <AnimatePresence>
                                                                    {activeDropdown === post.id && (
                                                                        <motion.div
                                                                            ref={dropdownRef}
                                                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                            transition={{ duration: 0.15 }}
                                                                            className="absolute right-0 top-full mt-2 w-[260px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl z-50 py-2 overflow-hidden flex flex-col"
                                                                        >
                                                                            {/* Auto Reply Section */}
                                                                            {post.status?.reply ? (
                                                                                <>
                                                                                    <button onClick={() => { setSelectedPostForReply(post); setShowAutoReplyModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors">
                                                                                        <Edit3 className="w-4 h-4 text-[var(--primary)]" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)]">Edit auto reply</span>
                                                                                    </button>
                                                                                    <button onClick={() => { setSelectedPostForReportReply(post); setShowReplyReportModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors">
                                                                                        <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)]">View auto reply report</span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setStatusConfirm({
                                                                                                isOpen: true,
                                                                                                post: post,
                                                                                                type: "reply",
                                                                                                action: (post.status?.reply === "paused") ? "active" : "paused"
                                                                                            });
                                                                                            setActiveDropdown(null);
                                                                                        }}
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors"
                                                                                    >
                                                                                        {post.status.reply === "paused" ? <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)]">
                                                                                            {post.status.reply === "paused" ? "Resume Campaign" : "Pause Campaign"}
                                                                                        </span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setDeleteConfirm({
                                                                                                isOpen: true,
                                                                                                post: post,
                                                                                                type: "reply"
                                                                                            });
                                                                                            setActiveDropdown(null);
                                                                                        }}
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors pb-3 border-b border-[var(--border)]"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                                                                        <span className="text-[12px] font-bold text-rose-600 dark:text-rose-400">Delete auto reply</span>
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <button onClick={() => { setSelectedPostForReply(post); setShowAutoReplyModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors border-b border-[var(--border)]">
                                                                                    <Megaphone className="w-4 h-4 text-[var(--primary)]" />
                                                                                    <span className="text-[12px] font-bold text-[var(--foreground)]">Enable Auto Reply Campaign</span>
                                                                                </button>
                                                                            )}

                                                                            {/* Auto Comment Section */}
                                                                            {post.status?.comment ? (
                                                                                <>
                                                                                    <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors mt-1">
                                                                                        <Edit3 className="w-4 h-4 text-[var(--primary)]" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)]">Edit auto comment</span>
                                                                                    </button>
                                                                                    <button onClick={() => { setSelectedPostForReport(post); setShowReportModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors">
                                                                                        <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)]">View auto comment report</span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setStatusConfirm({
                                                                                                isOpen: true,
                                                                                                post: post,
                                                                                                type: "comment",
                                                                                                action: (post.status?.comment === "paused") ? "active" : "paused"
                                                                                            });
                                                                                            setActiveDropdown(null);
                                                                                        }}
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors"
                                                                                    >
                                                                                        {post.status.comment === "paused" ? <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                                                                        <span className="text-[12px] font-bold text-[var(--foreground)]">
                                                                                            {post.status.comment === "paused" ? "Resume Campaign" : "Pause Campaign"}
                                                                                        </span>
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setDeleteConfirm({
                                                                                                isOpen: true,
                                                                                                post: post,
                                                                                                type: "comment"
                                                                                            });
                                                                                            setActiveDropdown(null);
                                                                                        }}
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors pb-3 border-b border-[var(--border)]"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                                                                        <span className="text-[12px] font-bold text-rose-600 dark:text-rose-400">Delete auto comment</span>
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors border-b border-[var(--border)] mt-1">
                                                                                    <MessageSquare className="w-4 h-4 text-[var(--primary)]" />
                                                                                    <span className="text-[12px] font-bold text-[var(--foreground)]">Enable auto comment</span>
                                                                                </button>
                                                                            )}

                                                                            {/* Default Actions */}
                                                                            <button
                                                                                onClick={() => {
                                                                                    setManualPostId(post.id);
                                                                                    setIsIdModalOpen(true);
                                                                                    handleCheckPostId();
                                                                                    setActiveDropdown(null);
                                                                                }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors mt-1"
                                                                            >
                                                                                <Target className="w-4 h-4 text-emerald-500" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)]">Quick Sync Identity</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setSelectedPostForComment(post); setShowCommentNowModal(true); setActiveDropdown(null); }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors"
                                                                            >
                                                                                <MessageSquare className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)]">Latest comments</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { setSelectedPostForComment(post); setShowCommentNowModal(true); setActiveDropdown(null); }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors"
                                                                            >
                                                                                <Edit3 className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)]">Leave a comment now</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => { window.open(post.url, "_blank"); setActiveDropdown(null); }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--muted)]/50 text-left transition-colors border-t border-[var(--border)] mt-1"
                                                                            >
                                                                                <ArrowUpRight className="w-4 h-4 text-[#0866FF]" />
                                                                                <span className="text-[12px] font-bold text-[var(--foreground)]">View Post on Facebook</span>
                                                                            </button>
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] text-[var(--muted-foreground)] line-clamp-1 italic">"{post.text}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-[var(--muted)]/20 rounded-2xl border-2 border-dashed border-[var(--border)]">
                                        <Box className="w-12 h-12 text-[var(--muted-foreground)]/50 mx-auto mb-4" />
                                        <p className="text-[12px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">No Interaction Active</p>
                                    </div>
                                )}

                                {/* Infinite Scroll Trigger */}
                                <div ref={loaderRef} className={cn(
                                    "w-full h-24 flex items-center justify-center transition-opacity duration-300",
                                    (isMoreLoading || (hasMore && posts.length > 0)) ? "opacity-100" : "opacity-0 pointer-events-none"
                                )}>
                                    {isMoreLoading && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                                            <p className="text-[10px] font-medium text-[var(--muted-foreground)] ml-2">Syncing History...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>

            {/* ── MOBILE BOTTOM NAV (Matches bot-replies) ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60]"
                style={{
                    background: "var(--card)",
                    borderTop: "1px solid var(--border)",
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.10)",
                    paddingBottom: "env(safe-area-inset-bottom, 0px)"
                }}>
                <div className="flex items-stretch px-1 pt-1.5 pb-1">
                    <button onClick={() => router.push("/dashboard/facebook/comment-templates")} className="flex flex-col items-center gap-0.5 py-1.5 transition-all min-w-0 flex-1 relative" style={{ color: "var(--muted-foreground)" }}>
                        <div className="w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200 bg-transparent">
                            <MessageSquare className="w-[17px] h-[17px]" strokeWidth={1.8} />
                        </div>
                        <span className="text-[9.5px] font-medium leading-none text-center" style={{ opacity: 0.7 }}>Comment<br />Templates</span>
                    </button>

                    <button onClick={() => router.push("/dashboard/facebook/reply-templates")} className="flex flex-col items-center gap-0.5 py-1.5 transition-all min-w-0 flex-1 relative" style={{ color: "var(--muted-foreground)" }}>
                        <div className="w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200 bg-transparent">
                            <FileText className="w-[17px] h-[17px]" strokeWidth={1.8} />
                        </div>
                        <span className="text-[9.5px] font-medium leading-none text-center" style={{ opacity: 0.7 }}>Reply<br />Templates</span>
                    </button>

                    <button onClick={() => router.push("/dashboard/facebook/custom-fields")} className="flex flex-col items-center gap-0.5 py-1.5 transition-all min-w-0 flex-1 relative" style={{ color: "var(--muted-foreground)" }}>
                        <div className="w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200 bg-transparent">
                            <SlidersHorizontal className="w-[17px] h-[17px]" strokeWidth={1.8} />
                        </div>
                        <span className="text-[9.5px] font-medium leading-none text-center" style={{ opacity: 0.7 }}>Custom<br />Fields</span>
                    </button>

                    <button onClick={() => setIsCampaignModalOpen(true)} className="flex flex-col items-center gap-0.5 py-1.5 transition-all min-w-0 flex-1 relative" style={{ color: "#0866FF" }}>
                        <span className="absolute top-0 left-3 right-3 h-[2.5px] rounded-full bg-[#0866FF]" />
                        <div className="w-9 h-8 rounded-xl flex items-center justify-center transition-all duration-200" style={{ background: "rgba(8,102,255,0.09)" }}>
                            <Sparkles className="w-[17px] h-[17px]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[9.5px] font-medium leading-none text-center" style={{ opacity: 1 }}>Bot Reply<br />Setup</span>
                    </button>
                </div>
            </nav>

            {/* ── ID Modal ── */}
            <AnimatePresence>
                {isIdModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-none sm:rounded-2xl w-full max-w-none sm:max-w-lg h-full max-h-full sm:h-auto sm:min-h-0 overflow-hidden shadow-2xl relative z-10"
                        >
                            {/* Mobile drag handle */}
                            <div className="sm:hidden flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-[var(--foreground)] uppercase tracking-tight">Post ID Reconciliation</h3>
                                    <button onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); }} className="text-[var(--muted-foreground)] hover:text-rose-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-[12px] font-medium leading-relaxed">
                                            If you have edited your Facebook Ads post after creation, ID lookup may fail due to Facebook API limitations.
                                        </p>
                                    </div>
                                </div>

                                {checkData ? (
                                    <div className="space-y-4">
                                        {/* Auto Reply Box */}
                                        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                                                    <Megaphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-[var(--foreground)]">Auto Reply Campaign</h4>
                                                    <p className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                                                        {checkData.reply_exists ? "Currently Active or Configured" : "No campaign attached"}
                                                    </p>
                                                </div>
                                            </div>
                                            {checkData.reply_exists ? (
                                                <button
                                                    onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); setSelectedPostForReply({ id: manualPostId } as any); setShowAutoReplyModal(true); }}
                                                    className="px-4 py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] rounded-xl text-xs font-bold transition-colors border border-[var(--border)]"
                                                >
                                                    Edit Reply
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); setSelectedPostForReply({ id: manualPostId } as any); setShowAutoReplyModal(true); }}
                                                    className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs font-bold shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all"
                                                >
                                                    Enable Auto Reply
                                                </button>
                                            )}
                                        </div>

                                        {/* Auto Comment Box */}
                                        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/20 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-[var(--foreground)]">Auto Comment Campaign</h4>
                                                    <p className="text-[10px] font-semibold text-[var(--muted-foreground)]">
                                                        {checkData.comment_exists ? "Currently Active or Configured" : "No campaign attached"}
                                                    </p>
                                                </div>
                                            </div>
                                            {checkData.comment_exists ? (
                                                <button
                                                    onClick={() => {
                                                        setIsIdModalOpen(false);
                                                        setTimeout(() => setCheckData(null), 200);
                                                        setSelectedPostForAuto({ id: manualPostId } as any);
                                                        setShowAutoCommentModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] rounded-xl text-xs font-bold transition-all border border-[var(--border)]"
                                                >
                                                    Edit Comment
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setIsIdModalOpen(false);
                                                        setTimeout(() => setCheckData(null), 200);
                                                        setSelectedPostForAuto({ id: manualPostId } as any);
                                                        setShowAutoCommentModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl text-xs font-bold shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all"
                                                >
                                                    Enable Auto Comment
                                                </button>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={() => setCheckData(null)}
                                                className="w-full py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] border border-[var(--border)] font-bold text-[13px] transition-all"
                                            >
                                                Check Another Post ID
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Manual Post ID</label>
                                            <input
                                                type="text"
                                                value={manualPostId}
                                                onChange={(e) => setManualPostId(e.target.value)}
                                                placeholder="Example: 15692151032057..."
                                                className="w-full px-4 py-3 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-sm text-[var(--foreground)] outline-none focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); }}
                                                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] font-bold text-[13px] transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCheckPostId}
                                                disabled={isCheckingId}
                                                className="flex-[1.5] flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[13px] shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100"
                                            >
                                                {isCheckingId ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                                                {isCheckingId ? "Syncing..." : "Sync Interaction ID"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCampaignModalOpen && (
                    <FullPageCampaignModal
                        page={selectedPage!}
                        hasCampaign={pageStats.has_full_page_reply}
                        onClose={() => setIsCampaignModalOpen(false)}
                        onSaved={() => {
                            setIsCampaignModalOpen(false);
                            fetchPosts(); // Refresh stats
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isReplyPopupOpen && (
                    <ReplyTemplateModal
                        isOpen={isReplyPopupOpen}
                        onClose={() => setIsReplyPopupOpen(false)}
                        onSaved={fetchPosts}
                        editingTemplate={null}
                        platform="facebook"
                    />
                )}
            </AnimatePresence>

            {/* Auto Comment Modal */}
            <PostAutoCommentModal
                isOpen={showAutoCommentModal}
                onClose={() => setShowAutoCommentModal(false)}
                onSaved={fetchPosts}
                platform="facebook"
                postId={selectedPostForAuto?.id || ""}
                pageId={selectedPage?.page_id || ""}
            />

            {/* Auto Reply Modal */}
            <PostAutoReplyModal
                isOpen={showAutoReplyModal}
                onClose={() => setShowAutoReplyModal(false)}
                onSaved={fetchPosts}
                platform="facebook"
                postId={selectedPostForReply?.id || ""}
                pageId={selectedPage?.page_id || ""}
            />

            {/* Comment Report Modal */}
            <CommentReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                platform="facebook"
                postId={selectedPostForReport?.id || ""}
                pageId={selectedPage?.page_id || ""}
            />

            {/* Campaign Report Modal */}
            <CampaignReportModal
                isOpen={showCampaignReportModal}
                onClose={() => setShowCampaignReportModal(false)}
                reportType={activeReportType}
                platform="facebook"
                pageId={selectedPage?.page_id || ""}
            />

            <PostReplyReportModal
                isOpen={showReplyReportModal}
                onClose={() => setShowReplyReportModal(false)}
                platform="facebook"
                postId={selectedPostForReportReply?.id || ""}
                instagramId={selectedPage?.page_id || ""}
            />

            {/* Post Comment Modal */}
            <PostCommentModal
                isOpen={showCommentNowModal}
                onClose={() => setShowCommentNowModal(false)}
                platform="facebook"
                postId={selectedPostForComment?.id || ""}
                pageId={selectedPage?.page_id || ""}
            />

            {/* Status Toggle Modal */}
            <AnimatePresence>
                {statusConfirm.isOpen && (
                    <div key="status-confirm-modal" className="fixed inset-0 z-[1100] flex items-center justify-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatusConfirm({ ...statusConfirm, isOpen: false })} className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="bg-[var(--card)] dark:bg-neutral-900 rounded-none sm:rounded-2xl w-full max-w-none sm:max-w-md shadow-2xl relative z-10 overflow-hidden border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="sm:hidden flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            </div>
                            <div className="p-6 sm:p-8 text-center space-y-5 sm:space-y-6">
                                <div className={cn(
                                    "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg",
                                    statusConfirm.action === "paused" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                                )}>
                                    {statusConfirm.action === "paused" ? <Pause size={28} /> : <Play size={28} />}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tight">
                                        {statusConfirm.action === "paused" ? "Pause Campaign?" : "Resume Campaign?"}
                                    </h3>
                                    <p className="text-[13px] font-medium text-neutral-500 leading-relaxed px-2 sm:px-4">
                                        Are you sure you want to {statusConfirm.action} this automated {statusConfirm.type} lifecycle?
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2 sm:pt-4">
                                    <button
                                        onClick={() => setStatusConfirm({ ...statusConfirm, isOpen: false })}
                                        className="flex-1 py-3 sm:py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-all active:scale-95"
                                    >
                                        No, Cancel
                                    </button>
                                    <button
                                        onClick={handleToggleStatus}
                                        disabled={isUpdatingStatus}
                                        className={cn(
                                            "flex-[2] py-3 sm:py-4 rounded-2xl text-[11px] font-semibold uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 disabled:opacity-50",
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
                    <div key="delete-confirm-modal" className="fixed inset-0 z-[1100] flex items-center justify-center p-0 sm:p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })} className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="bg-[var(--card)] dark:bg-neutral-900 rounded-none sm:rounded-2xl w-full max-w-none sm:max-w-md shadow-2xl relative z-10 overflow-hidden border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="sm:hidden flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                            </div>
                            <div className="p-6 sm:p-8 text-center space-y-5 sm:space-y-6">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg bg-rose-100 text-rose-600">
                                    <Trash2 size={28} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tight">
                                        Delete Campaign?
                                    </h3>
                                    <p className="text-[13px] font-medium text-neutral-500 leading-relaxed px-2 sm:px-4">
                                        Are you absolutely sure you want to delete this automated {deleteConfirm.type} lifecycle? This action is irreversible.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2 sm:pt-4">
                                    <button
                                        onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                                        className="flex-1 py-3 sm:py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-all active:scale-95"
                                    >
                                        No, Keep it
                                    </button>
                                    <button
                                        onClick={handleDeleteCampaign}
                                        disabled={isDeleting}
                                        className="flex-[2] py-3 sm:py-4 rounded-2xl text-[11px] font-semibold uppercase tracking-widest text-white shadow-xl bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isDeleting ? "Deleting..." : "Yes, Delete Lifecycle"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Assigned Campaign Wrapper Modals ───────────────────────────────────────

function ReplyCampaignAssignWrapper({ onClose, fetchPosts }: { onClose: () => void; fetchPosts: () => void }) {
    const [useSaved, setUseSaved] = useState(true);
    const [dropdownTemplates, setDropdownTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.get("/facebook/auto-reply-template").then(res => {
            setDropdownTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
        }).finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async () => {
        if (!selectedTemplateId) { toast.error("Please select a template"); return; }
        setIsSaving(true);
        try {
            // TODO: Wire up to the post auto reply save API
            toast.success("Template assigned successfully (Mock)");
            fetchPosts();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to assign template");
        } finally {
            setIsSaving(false);
        }
    };

    if (!useSaved) {
        return (
            <ReplyTemplateModal
                isOpen={true}
                onClose={() => setUseSaved(true)}
                onSaved={() => { onClose(); fetchPosts(); }}
                editingTemplate={null}
                platform="facebook"
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-[var(--background-overlay)] backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] rounded-none sm:rounded-2xl shadow-2xl w-full max-w-none sm:max-w-2xl min-h-screen sm:min-h-0 overflow-hidden border border-[var(--border)]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
                    <div className="flex items-center gap-3 text-[var(--primary)]">
                        <Megaphone className="w-5 h-5" />
                        <h2 className="text-[14px] font-bold text-[var(--foreground)]">Please give the following information for post auto reply</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-50/10 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4 bg-[var(--muted)]/20">
                    <div className="flex items-center justify-between p-4 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="text-[13px] font-bold text-[var(--foreground)]">Do you want to use saved template?</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setUseSaved(!useSaved)}>
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] mr-1">{useSaved ? "YES" : "NO"}</span>
                            <div className={cn("w-11 h-5 rounded-full relative transition-all shadow-inner", useSaved ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] transition-all shadow-sm", useSaved ? "left-6.5" : "left-0.5")} />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm space-y-3">
                        <label className="text-[13px] font-bold text-[var(--foreground)] flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[var(--primary)]" /> Auto Reply Template
                        </label>
                        <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--muted)]/50 text-[var(--foreground)] disabled:opacity-50">
                            <option value="">{isLoading ? "Loading templates..." : "Please select a template"}</option>
                            {dropdownTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--card)]">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] font-bold text-[13px] hover:bg-[var(--muted)]/80 transition-all flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[13px] shadow-lg shadow-[var(--primary)]/10 flex items-center gap-2 hover:opacity-90 transition-all">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Submit
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function CommentCampaignAssignWrapper({ onClose, fetchPosts }: { onClose: () => void; fetchPosts: () => void }) {
    const [useSaved, setUseSaved] = useState(true);
    const [dropdownTemplates, setDropdownTemplates] = useState<any[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.get("/facebook/comment-template").then(res => {
            let data = res.data;
            if (data?.data) data = data.data;
            setDropdownTemplates(Array.isArray(data) ? data : []);
        }).finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async () => {
        if (!selectedTemplateId) { toast.error("Please select a template"); return; }
        setIsSaving(true);
        try {
            // TODO: Wire up to the post auto comment save API
            toast.success("Comment template assigned successfully (Mock)");
            fetchPosts();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to assign template");
        } finally {
            setIsSaving(false);
        }
    };

    if (!useSaved) {
        return (
            <CommentTemplateModal
                isOpen={true}
                onClose={() => setUseSaved(true)}
                onSaved={() => { onClose(); fetchPosts(); }}
                editingTemplate={null}
                platform="facebook"
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-[var(--background-overlay)] backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[var(--card)] rounded-none sm:rounded-2xl shadow-2xl w-full max-w-none sm:max-w-2xl min-h-screen sm:min-h-0 overflow-hidden border border-[var(--border)]">
                <div className="flex items-center justify-between px-6 py-4 bg-[var(--card)] border-b border-[var(--border)]">
                    <div className="flex items-center gap-3 text-[var(--primary)]">
                        <MessageSquare className="w-5 h-5" />
                        <h2 className="text-[14px] font-bold text-[var(--foreground)]">Please give the following information for post auto comment</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-50/10 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4 bg-[var(--muted)]/20">
                    <div className="flex items-center justify-between p-4 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[var(--muted-foreground)]" />
                            <span className="text-[13px] font-bold text-[var(--foreground)]">Do you want to use saved template?</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setUseSaved(!useSaved)}>
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] mr-1">{useSaved ? "YES" : "NO"}</span>
                            <div className={cn("w-11 h-5 rounded-full relative transition-all shadow-inner", useSaved ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] transition-all shadow-sm", useSaved ? "left-6.5" : "left-0.5")} />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm space-y-3">
                        <label className="text-[13px] font-bold text-[var(--foreground)] flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[var(--primary)]" /> Auto Comment Template
                        </label>
                        <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--muted)]/50 text-[var(--foreground)] disabled:opacity-50">
                            <option value="">{isLoading ? "Loading templates..." : "Please select a template"}</option>
                            {dropdownTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-[var(--card)] border-t border-[var(--border)]">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] font-bold text-[13px] hover:bg-[var(--muted)]/80 transition-all flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[13px] shadow-lg shadow-[var(--primary)]/10 flex items-center gap-2 hover:opacity-90 transition-all">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Submit
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Full Page Campaign Modal ──────────────────────────────────────────────────
function FPC_Field({ label, required, children, icon: Icon }: { label: string; required?: boolean; children: React.ReactNode; icon?: any }) {
    return (
        <div className="space-y-1.5 flex-1 min-w-0">
            <label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function FPC_Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onClick}>
            {label && <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--foreground)]/80 transition-colors">{label}</span>}
            <div className="flex items-center gap-2">
                <div className={"w-10 h-5 rounded-full relative transition-all duration-200 " + (active ? "bg-[var(--primary)]" : "bg-[var(--border)]")}>
                    <div className={"absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] shadow transition-all " + (active ? "left-5.5" : "left-0.5")} />
                </div>
                <span className="text-xs font-medium text-[var(--muted-foreground)] w-6">{active ? "On" : "Off"}</span>
            </div>
        </div>
    );
}

function FPC_UploadBox({ label, value, onChange, icon: Icon }: { label: string; value: string | null; onChange: (v: string | null) => void; icon: any }) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { onChange(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };
    const isVideo = label.toLowerCase().includes("video");

    return (
        <div className="space-y-2 flex-1">
            <label className="text-[11px] font-bold text-[var(--muted-foreground)] px-1 flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" /> {label}
            </label>
            <div className="flex items-center gap-0 rounded-xl border border-[var(--border)] bg-[var(--card)] group focus-within:border-[var(--primary)] overflow-hidden transition-all shadow-xs h-[44px]">
                <input type="file" ref={fileInputRef} className="hidden" accept={isVideo ? "video/*" : "image/*"} onChange={handleFileChange} />
                <div onClick={() => fileInputRef.current?.click()} className="bg-[var(--primary)] text-[var(--primary-foreground)] px-5 h-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:opacity-90">
                    <Plus className="w-4 h-4" /> Upload
                </div>
                <input type="text" placeholder={"Put your " + (isVideo ? 'video' : 'image') + " URL here or click upload"} value={value || ""} onChange={e => onChange(e.target.value || null)} className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-[var(--foreground)] px-4 placeholder:text-[var(--muted-foreground)]/50" />
            </div>
        </div>
    );
}

function FPC_CapsuleSwitch({ active }: { active: boolean }) {
    return (
        <div className={"w-11 h-5 rounded-full relative transition-all " + (active ? "bg-[var(--primary)]" : "bg-[var(--border)] shadow-inner")}>
            <div className={"absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] transition-all " + (active ? "left-6.5" : "left-0.5")} />
        </div>
    );
}

export function FullPageCampaignModal({ page, hasCampaign, onClose, onSaved }: { page: any; hasCampaign?: boolean; onClose: () => void; onSaved: () => void }) {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [campaignId, setCampaignId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: "",
        reply_type: "generic" as "generic" | "filter",
        multiple_reply_enabled: false,
        comment_reply_enabled: true,
        hide_after_reply: false,
        message: "",
        image: "",
        video: "",
        private_template_id: "" as string | number | null,
        offensive: {
            hide_comment: false,
            delete_comment: false,
            offensive_keywords: "",
            private_reply_template_id: "" as string | number | null
        }
    });

    const [filterRules, setFilterRules] = useState<any[]>([]);

    useEffect(() => {
        if (page) {
            fetchTemplates();
            fetchCampaign();
        }
    }, [page]);

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const pageId = page?.page_id || page?.id;
            const res = await api.get("/facebook/bot-replies?page_id=" + pageId);
            setTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const fetchCampaign = async () => {
        setIsLoadingData(true);
        try {
            const currentId = String(page?.page_id || page?.id);
            if (!currentId) return;
            const res = await api.get(`/facebook/full-page-reply/${currentId}`);
            const data = res.data?.data;
            const c = data?.template || (Array.isArray(data) ? (data.find((x: any) => String(x.page_id || x.instagram_id) === currentId) || data[0]) : data);

            if (c) {
                const off = data?.offensive || c?.offensive;
                const rulesArr = data?.rules || c?.rules || c?.filters || [];

                setCampaignId(c.id);
                setForm({
                    name: c.name || "",
                    reply_type: c.reply_type === "filter" ? "filter" : "generic",
                    multiple_reply_enabled: c.multiple_reply_enabled === "1" || c.multiple_reply_enabled === 1 || c.multiple_reply_enabled === true,
                    comment_reply_enabled: c.comment_reply_enabled === "1" || c.comment_reply_enabled === 1 || c.comment_reply_enabled === true || (c.comment_reply_enabled !== "0" && c.comment_reply_enabled !== 0 && c.comment_reply_enabled !== false),
                    hide_after_reply: c.hide_after_reply === "1" || c.hide_after_reply === 1 || c.hide_after_reply === true,
                    message: c.message || "",
                    image: c.image || "",
                    video: c.video || "",
                    private_template_id: c.private_template_id ? String(c.private_template_id) : "",
                    offensive: {
                        hide_comment: off?.hide_comment === "1" || off?.hide_comment === 1 || off?.hide_comment === true,
                        delete_comment: off?.delete_comment === "1" || off?.delete_comment === 1 || off?.delete_comment === true,
                        offensive_keywords: off?.offensive_keywords || "",
                        private_reply_template_id: off?.private_reply_template_id ? String(off.private_reply_template_id) : "",
                    }
                });

                const rules = rulesArr.map((r: any) => ({
                    id: r.id?.toString() || Math.random().toString(),
                    keyword: r.keyword || r.keywords || "",
                    match_type: r.match_type || "contains",
                    message: r.message || "",
                    image: r.image || "",
                    video: r.video || "",
                    private_template_id: r.private_template_id ? String(r.private_template_id) : ""
                }));
                if (rules.length === 0) rules.push({ id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" });
                setFilterRules(rules);
            } else {
                setFilterRules([{ id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" }]);
            }
        } catch (err) {
            console.error("Global campaign sync error");
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error("Campaign name is required");
        if (!page) return toast.error("No page selected");
        setIsSaving(true);
        try {
            const fd = new FormData();
            fd.append("page_id", page?.page_id || page?.id);
            fd.append("instagram_id", page?.page_id || page?.id);
            fd.append("name", form.name);
            fd.append("reply_type", form.reply_type);
            fd.append("multiple_reply_enabled", form.multiple_reply_enabled ? "1" : "0");
            fd.append("comment_reply_enabled", form.comment_reply_enabled ? "1" : "0");
            fd.append("hide_after_reply", form.hide_after_reply ? "1" : "0");

            fd.append("message", form.message || "");
            fd.append("image", form.image || "");
            fd.append("video", form.video || "");
            fd.append("private_template_id", String(form.private_template_id || ""));

            fd.append("offensive[hide_comment]", form.offensive.hide_comment ? "1" : "0");
            fd.append("offensive[delete_comment]", form.offensive.delete_comment ? "1" : "0");
            fd.append("offensive[offensive_keywords]", form.offensive.offensive_keywords || "");
            fd.append("offensive[private_reply_template_id]", String(form.offensive.private_reply_template_id || ""));

            if (form.reply_type === "filter") {
                filterRules.forEach((rule, i) => {
                    fd.append("rules[" + i + "][keyword]", rule.keyword || "");
                    fd.append("rules[" + i + "][match_type]", rule.match_type || "contains");
                    fd.append("rules[" + i + "][message]", rule.message || "");
                    fd.append("rules[" + i + "][image]", rule.image || "");
                    fd.append("rules[" + i + "][video]", rule.video || "");
                    fd.append("rules[" + i + "][private_template_id]", rule.private_template_id || "");
                });
            }

            const config = { headers: { "Content-Type": "multipart/form-data" } };
            if (campaignId) {
                fd.append("_method", "PUT");
                await api.post("/facebook/full-page-reply/" + campaignId, fd, config);
            } else {
                await api.post("/facebook/full-page-reply", fd, config);
            }
            toast.success("Campaign synced successfully!");
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Operation failed");
        } finally { setIsSaving(false); }
    };

    const handleAddRule = () => {
        setFilterRules([
            ...filterRules,
            { id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" }
        ]);
    };

    if (!page) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
                className={cn(
                    "relative z-10 w-full bg-[var(--card)] border border-[var(--border)] rounded-none sm:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-full h-full sm:h-auto sm:max-h-[94vh] transition-all sm:min-h-0",
                    "max-w-none sm:max-w-[980px]"
                )}
            >
                <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-[13px] font-bold text-[var(--foreground)]">
                                {campaignId ? "Edit Full Page Campaign" : "Create Full Page Campaign"}
                            </h2>
                            <p className="text-[10px] font-bold text-[var(--primary)] uppercase leading-none mt-1">Page: {page.page_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-rose-500 transition-colors ml-4">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-[var(--muted)]/10">
                    {isLoadingData ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                                <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs">
                                    <FPC_Field label="Auto Reply Campaign Name" required>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none bg-[var(--muted)]/50 text-[var(--foreground)] transition-all font-medium text-[14px]"
                                            placeholder="Write your auto reply campaign name here"
                                        />
                                    </FPC_Field>
                                </div>

                                <div className="bg-[var(--card)] p-4 sm:p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                                        <h3 className="text-sm font-semibold text-[var(--foreground)]">Offensive Comments Settings</h3>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                                        <FPC_Toggle label="Hide Comment" active={form.offensive.hide_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, hide_comment: !form.offensive.hide_comment } })} />
                                        <FPC_Toggle label="Delete Comment" active={form.offensive.delete_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, delete_comment: !form.offensive.delete_comment } })} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[var(--foreground)]">Offensive keywords <span className="text-[var(--muted-foreground)] font-normal">(comma separated)</span></label>
                                            <div className="relative">
                                                <textarea rows={4} value={form.offensive.offensive_keywords} onChange={e => setForm({ ...form, offensive: { ...form.offensive, offensive_keywords: e.target.value } })}
                                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none bg-[var(--muted)]/50 text-[var(--foreground)] transition-all font-medium text-[14px] resize-none"
                                                    placeholder="keyword1, keyword2..."
                                                />
                                                <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-[var(--muted-foreground)]/50" />
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-sm font-medium text-[var(--foreground)]">Private reply template</label>
                                                <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                                                    <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                        <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={form.offensive.private_reply_template_id ?? ""}
                                                    onChange={e => setForm({ ...form, offensive: { ...form.offensive, private_reply_template_id: e.target.value } })}
                                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none bg-[var(--muted)]/50 text-[var(--foreground)] transition-all font-medium text-[14px] appearance-none cursor-pointer"
                                                >
                                                    <option value="">Please select a message template</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between py-1 px-1">
                                        <div className="flex items-center gap-3">
                                            <RefreshCw className="w-4 h-4 text-[var(--muted-foreground)]" />
                                            <span className="text-[13px] font-medium text-[var(--foreground)]">Do you want to send reply message to a user multiple times?</span>
                                        </div>
                                        <FPC_Toggle label="" active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]">
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-4 h-4 text-[var(--muted-foreground)]" />
                                            <span className="text-[13px] font-medium text-[var(--foreground)]">Do you want to enable comment reply?</span>
                                        </div>
                                        <FPC_Toggle label="" active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]">
                                        <div className="flex items-center gap-3">
                                            <EyeOff className="w-4 h-4 text-[var(--muted-foreground)]" />
                                            <span className="text-[13px] font-medium text-[var(--foreground)]">Do you want to hide comments after comment reply?</span>
                                        </div>
                                        <FPC_Toggle label="" active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                                    </div>
                                </div>

                                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "generic" })}>
                                        <FPC_CapsuleSwitch active={form.reply_type === "generic"} />
                                        <span className={cn("text-sm font-medium", form.reply_type === "generic" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>Generic message for all comments</span>
                                    </div>
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "filter" })}>
                                        <FPC_CapsuleSwitch active={form.reply_type === "filter"} />
                                        <span className={cn("text-sm font-medium", form.reply_type === "filter" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>Send different messages by keyword filter</span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {form.reply_type === "generic" ? (
                                        <div className="bg-[var(--card)] p-4 sm:p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                                            <FPC_Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--muted)]/50">
                                                    <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                        className="w-full outline-none font-medium text-[14px] text-[var(--foreground)] bg-transparent resize-none h-[120px]" placeholder="Type your message here..."
                                                    />
                                                    <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-[var(--muted-foreground)]/50" />
                                                </div>
                                            </FPC_Field>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                                <FPC_UploadBox label="Image for Comment Reply" value={form.image} onChange={v => setForm({ ...form, image: v || "" })} icon={ImageIcon} />
                                                <FPC_UploadBox label="Video for Comment Reply" value={form.video} onChange={v => setForm({ ...form, video: v || "" })} icon={Video} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                                                        <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50" /> Private reply template
                                                    </label>
                                                    <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                                                        <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none bg-[var(--muted)]/50 text-[var(--foreground)] transition-all font-medium text-[14px] appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Please select a message template</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in duration-300">
                                            {filterRules.map((rule, idx) => (
                                                <div key={rule.id} className="bg-[var(--card)] p-4 sm:p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-6 sm:space-y-8 relative group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "exact" } : r))}>
                                                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]")}>
                                                                    {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)]" />}
                                                                </div>
                                                                <span className={cn("text-xs font-medium", rule.match_type === "exact" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>Exact match</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "contains" } : r))}>
                                                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]")}>
                                                                    {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)]" />}
                                                                </div>
                                                                <span className={cn("text-xs font-medium", rule.match_type === "contains" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>Contains word</span>
                                                            </div>
                                                        </div>
                                                        {filterRules.length > 1 && (
                                                            <button onClick={() => setFilterRules(filterRules.filter(r => r.id !== rule.id))} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <FPC_Field label="Filter Word/Sentence" required>
                                                        <input type="text" value={rule.keyword} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, keyword: e.target.value } : r))}
                                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none bg-[var(--muted)]/50 text-[var(--foreground)] transition-all font-medium text-[14px] placeholder:text-[var(--muted-foreground)]/50"
                                                            placeholder="Write your filter word here"
                                                        />
                                                    </FPC_Field>

                                                    <FPC_Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                        <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--muted)]/50">
                                                            <textarea rows={4} value={rule.message} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, message: e.target.value } : r))}
                                                                className="w-full outline-none font-medium text-[14px] text-[var(--foreground)] bg-transparent resize-none h-[100px]" placeholder="Type your message here..."
                                                            />
                                                            <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-[var(--muted-foreground)]/50" />
                                                        </div>
                                                    </FPC_Field>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                                        <FPC_UploadBox label="Image for Comment Reply" value={rule.image} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, image: v } : r))} icon={ImageIcon} />
                                                        <FPC_UploadBox label="Video for Comment Reply" value={rule.video} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, video: v } : r))} icon={Video} />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                                                                <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50" /> Private reply template
                                                            </label>
                                                            <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                                                                <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                                    <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <select value={rule.private_template_id ?? ""} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, private_template_id: e.target.value } : r))}
                                                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none bg-[var(--muted)]/50 text-[var(--foreground)] transition-all font-medium text-[14px] appearance-none cursor-pointer"
                                                            >
                                                                <option value="">Please select a message template</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-end">
                                                <button onClick={handleAddRule} className="px-6 py-2.5 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-[11px] hover:bg-[var(--primary)]/5 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-[var(--primary)]/10">
                                                    <Plus className="w-4 h-4" /> Add another filter rule
                                                </button>
                                            </div>

                                            {/* Fallback */}
                                            <div className="bg-[var(--muted)]/20 p-4 sm:p-8 rounded-2xl border border-[var(--border)] border-dashed space-y-6 sm:space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <Info className="w-4 h-4 text-[var(--muted-foreground)]/50" />
                                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Fallback reply (when no filter matches)</span>
                                                </div>
                                                <FPC_Field label="Message for Comment Reply" icon={MessageCircle}>
                                                    <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--muted)]/50">
                                                        <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                            className="w-[100%] outline-none font-medium text-[14px] text-[var(--foreground)] bg-transparent resize-none h-[100px]" placeholder="Type your message here..."
                                                        />
                                                        <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-[var(--muted-foreground)]/50" />
                                                    </div>
                                                </FPC_Field>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                                    <FPC_UploadBox label="Image for Comment Reply" value={form.image} onChange={v => setForm({ ...form, image: v || "" })} icon={ImageIcon} />
                                                    <FPC_UploadBox label="Video for Comment Reply" value={form.video} onChange={v => setForm({ ...form, video: v || "" })} icon={Video} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between px-1">
                                                        <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                                                            <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50" /> Private reply template (Fallback)
                                                        </label>
                                                        <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                                                            <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                                <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none bg-[var(--muted)]/50 text-[var(--foreground)] transition-all font-medium text-[14px] appearance-none cursor-pointer"
                                                        >
                                                            <option value="">Please select a message template</option>
                                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                <div className="flex gap-4 p-4 sm:p-8 bg-[var(--card)] border-t border-[var(--border)] flex-shrink-0">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[13px] hover:bg-[var(--muted)]/50 transition-all bg-[var(--card)]">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving || isLoadingData} className="flex-[2] py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-[14px] shadow-xl shadow-[var(--primary)]/10 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                        <span>{campaignId ? "UPDATE CAMPAIGN" : "SAVE CHANGES"}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
