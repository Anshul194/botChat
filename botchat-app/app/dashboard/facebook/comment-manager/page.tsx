"use client";

import { useState, useRef, useEffect } from "react";
import {
    Facebook, MessageSquare, Zap, Target,
    MoreHorizontal, Search, CheckCircle2,
    Clock, BarChart3, ChevronRight, ChevronLeft, ListFilter,
    Settings2, Filter, LayoutGrid, List,
    Activity, Globe, ArrowUpRight, Plus,
    MousePointer2, Layers, Sparkles, Command,
    FileText, PieChart, Users, Settings,
    MoreVertical, Info, RefreshCw, Box,
    Trash2, Pause, Play, FileJson, Megaphone,
    ArrowRight, X, AlertCircle, ChevronDown, Tag, SlidersHorizontal,
    ShieldAlert, EyeOff, Scissors, Edit3, Image as ImageIcon, Video, Upload,
    Save, Ban, Copy, Check, Loader2, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CommentTemplateModal } from "../../components/modals/CommentTemplateModal";
import { ReplyTemplateModal } from "../../components/modals/ReplyTemplateModal";
import { PostAutoCommentModal } from "../../components/modals/PostAutoCommentModal";
import { PostAutoReplyModal } from "../../components/modals/PostAutoReplyModal";
import { CommentReportModal } from "../../components/modals/CommentReportModal";
import { CampaignReportModal } from "../../components/modals/CampaignReportModal";
import { PostCommentModal } from "../../components/modals/PostCommentModal";

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
            setIsDeleting(true);
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

            const mapped = fetchedPosts.map((p: any, idx: number) => ({
                id: p.id ? String(p.id) : `post-${idx}`,
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
            }));

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
        <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a] p-4 lg:p-8 font-sans transition-all duration-300">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* 1. PAGES SELECTOR (Scrollable + Dropdown) */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
                    <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm flex items-center relative">
                        <button onClick={() => scroll('left')} className="p-2 flex-shrink-0 text-slate-400 hover:text-primary transition-colors z-10 bg-white dark:bg-slate-900 shadow-[10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-l-xl">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div ref={scrollRef} className="flex-1 min-w-0 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2 items-center">
                            {isLoading ? (
                                [1, 2, 3].map(i => <div key={i} className="w-32 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex-shrink-0" />)
                            ) : pages.length > 0 ? (
                                pages.map(page => (
                                    <button
                                        key={page.id}
                                        onClick={() => { setSelectedPage(page); setShowPageDropdown(false); }}
                                        className={cn(
                                            "px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-2",
                                            selectedPage?.id === page.id
                                                ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                                : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                                        )}
                                    >
                                        {page.image && <img src={page.image} className="w-5 h-5 rounded-full object-cover" />}
                                        {page.page_name}
                                    </button>
                                ))
                            ) : (
                                <div className="text-sm font-medium text-slate-400 px-2 py-2">Loading Connected Pages...</div>
                            )}
                        </div>

                        <button onClick={() => scroll('right')} className="p-2 flex-shrink-0 text-slate-400 hover:text-primary transition-colors z-10 bg-white dark:bg-slate-900 shadow-[-10px_0_10px_-5px_rgba(0,0,0,0.05)] rounded-r-xl">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative shrink-0 z-20 flex gap-2">
                        <button
                            onClick={fetchPages}
                            disabled={isLoading}
                            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-primary/50 transition-colors text-slate-500"
                        >
                            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                        </button>
                        <button 
                            onClick={() => setShowPageDropdown(!showPageDropdown)}
                            className="h-full px-5 py-3 sm:py-0 w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between sm:justify-center gap-3 text-sm font-semibold hover:border-primary/50 transition-colors text-slate-700 dark:text-slate-300"
                        >
                            <div className="flex items-center gap-2">
                                <ListFilter className="w-4 h-4 text-primary" />
                                Quick Find
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showPageDropdown && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                            {showPageDropdown && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-[calc(100%+8px)] w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden"
                                >
                                    <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {pages.map(page => (
                                            <button
                                                key={page.id}
                                                onClick={() => { setSelectedPage(page); setShowPageDropdown(false); }}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors truncate flex items-center gap-2",
                                                    selectedPage?.id === page.id ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                )}
                                            >
                                                {page.image && <img src={page.image} className="w-4 h-4 rounded-full object-cover shrink-0" />}
                                                <span className="truncate">{page.page_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                        className="flex items-center gap-1.5 text-[12px] font-bold text-primary hover:text-pink-700 dark:hover:text-pink-300 transition-colors group"
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
                                                        color: "text-pink-600",
                                                        bg: "bg-pink-50 dark:bg-pink-500/10",
                                                    },
                                                    {
                                                        id: "reply",
                                                        label: "Reply Template",
                                                        icon: FileText,
                                                        desc: "Auto-reply messages",
                                                        color: "text-pink-600",
                                                        bg: "bg-pink-50 dark:bg-pink-500/10",
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
                                    <p className="text-3xl font-bold text-primary">{pageStats.auto_reply_count}</p>
                                    <p className="text-[10px] font-semibold text-slate-500 uppercase mt-1">Auto Replies</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
                                    <p className="text-3xl font-bold text-pink-500">{pageStats.auto_comment_count}</p>
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
                                <button
                                    onClick={() => setIsCampaignModalOpen(true)}
                                    className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-[12px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {pageStats.has_full_page_reply ? "Edit Global Reply" : "Enable Full Page Reply"}
                                </button>
                            </div>


                            <div className="relative" ref={reportDropdownRef}>
                                <button 
                                    onClick={() => setShowReportDropdown(!showReportDropdown)}
                                    className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[12px] flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm uppercase tracking-wider"
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
                                            className="absolute bottom-full left-0 right-0 mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[60] py-2"
                                        >
                                            {[
                                                { id: "auto-reply", label: "Auto Reply Report", icon: Megaphone, color: "text-pink-500" },
                                                { id: "auto-comment", label: "Auto Comment Report", icon: MessageSquare, color: "text-pink-500" },
                                                { id: "full-page-reply", label: "Full Page Reply Report", icon: Layers, color: "text-primary" }
                                            ].map((report) => (
                                                <button
                                                    key={report.id}
                                                    onClick={() => handleFetchReport(report.id as any)}
                                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                                                >
                                                    <div className={cn("w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-all", report.color)}>
                                                        <report.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{report.label}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Sync latest analytics</p>
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
                                {isPostsLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-24 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse" />
                                    ))
                                ) : posts.length > 0 ? (
                                    posts.map((post, idx) => (
                                        <div key={post.id || `post-${idx}`} className="group bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex gap-4 transition-all hover:border-primary/30">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                                                <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-[14px] font-bold text-slate-800 dark:text-white truncate">{post.user}</h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <p className="text-[10px] text-slate-400 font-semibold">{post.time}</p>
                                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-500/20">
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">ID: {post.id}</span>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(post.id); toast.success("Post ID Copied!"); }}
                                                                        className="hover:text-pink-900 dark:hover:text-pink-200 transition-colors active:scale-95"
                                                                        title="Copy ID"
                                                                    >
                                                                        <Copy className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
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
                                                                            ref={dropdownRef}
                                                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                            transition={{ duration: 0.15 }}
                                                                            className="absolute right-0 top-full mt-2 w-[260px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-2 overflow-hidden flex flex-col"
                                                                        >
                                                                            {/* Auto Reply Section */}
                                                                            {post.status?.reply ? (
                                                                                <>
                                                                                    <button onClick={() => { setSelectedPostForReply(post); setShowAutoReplyModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                                                                                        <Edit3 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Edit auto reply</span>
                                                                                    </button>
                                                                                    <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                                                                                        <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">View auto reply report</span>
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
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                                                                                    >
                                                                                        {post.status.reply === "paused" ? <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
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
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors pb-3 border-b border-slate-100 dark:border-slate-800"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                                                                        <span className="text-[12px] font-bold text-rose-600 dark:text-rose-400">Delete auto reply</span>
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                    <button onClick={() => { setSelectedPostForReply(post); setShowAutoReplyModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors border-b border-slate-100 dark:border-slate-800">
                                                                                        <Megaphone className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Enable Auto Reply Campaign</span>
                                                                                    </button>
                                                                            )}

                                                                            {/* Auto Comment Section */}
                                                                            {post.status?.comment ? (
                                                                                <>
                                                                                    <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors mt-1">
                                                                                        <Edit3 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Edit auto comment</span>
                                                                                    </button>
                                                                                    <button onClick={() => { setSelectedPostForReport(post); setShowReportModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors">
                                                                                        <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">View auto comment report</span>
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
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                                                                                    >
                                                                                        {post.status.comment === "paused" ? <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
                                                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
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
                                                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors pb-3 border-b border-slate-100 dark:border-slate-800"
                                                                                    >
                                                                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                                                                        <span className="text-[12px] font-bold text-rose-600 dark:text-rose-400">Delete auto comment</span>
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <button onClick={() => { setSelectedPostForAuto(post); setShowAutoCommentModal(true); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors border-b border-slate-100 dark:border-slate-800 mt-1">
                                                                                    <MessageSquare className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                                                                                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Enable auto comment</span>
                                                                                </button>
                                                                            )}

                                                                            {/* Default Actions */}
                                                                            <button
                                                                                onClick={() => { setSelectedPostForComment(post); setShowCommentNowModal(true); setActiveDropdown(null); }}
                                                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors mt-1"
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
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-1 italic">"{post.text}"</p>
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
                                            <p className="text-[10px] font-medium text-slate-500 ml-2">Syncing History...</p>
                                        </div>
                                    )}
                                </div>
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
                            onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); }}
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
                                    <button onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); }} className="text-slate-400 hover:text-rose-500">
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

                                {checkData ? (
                                    <div className="space-y-4">
                                        {/* Auto Reply Box */}
                                        <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-500/10 text-pink-600 flex items-center justify-center">
                                                    <Megaphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">Auto Reply Campaign</h4>
                                                    <p className="text-[10px] font-semibold text-slate-400">
                                                        {checkData.reply_exists ? "Currently Active or Configured" : "No campaign attached"}
                                                    </p>
                                                </div>
                                            </div>
                                            {checkData.reply_exists ? (
                                                <button
                                                    onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); setSelectedPostForReply({ id: manualPostId } as any); setShowAutoReplyModal(true); }}
                                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
                                                >
                                                    Edit Reply
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); setSelectedPostForReply({ id: manualPostId } as any); setShowAutoReplyModal(true); }}
                                                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                                >
                                                    Enable Auto Reply
                                                </button>
                                            )}
                                        </div>

                                        {/* Auto Comment Box */}
                                        <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-500/10 text-pink-600 flex items-center justify-center">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[13px] font-bold text-slate-800 dark:text-white">Auto Comment Campaign</h4>
                                                    <p className="text-[10px] font-semibold text-slate-400">
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
                                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all"
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
                                                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                                >
                                                    Enable Auto Comment
                                                </button>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                onClick={() => setCheckData(null)}
                                                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[13px] hover:bg-slate-200 transition-all"
                                            >
                                                Check Another Post ID
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manual Post ID</label>
                                            <input
                                                type="text"
                                                value={manualPostId}
                                                onChange={(e) => setManualPostId(e.target.value)}
                                                placeholder="Example: 15692151032057..."
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => { setIsIdModalOpen(false); setTimeout(() => setCheckData(null), 200); }}
                                                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[13px] hover:bg-slate-200 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCheckPostId}
                                                disabled={isCheckingId}
                                                className="flex-[1.5] flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-bold text-[13px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100"
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
                    <div key="status-confirm-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStatusConfirm({ ...statusConfirm, isOpen: false })} className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-neutral-200 dark:border-neutral-800">
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
                                        Are you sure you want to {statusConfirm.action} this automated {statusConfirm.type} lifecycle?
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
                    <div key="delete-confirm-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })} className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden border border-neutral-200 dark:border-neutral-800">
                            <div className="p-8 text-center space-y-6">
                                <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg bg-rose-100 text-rose-600">
                                    <Trash2 size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tight">
                                        Delete Campaign?
                                    </h3>
                                    <p className="text-[13px] font-medium text-neutral-500 leading-relaxed px-4">
                                        Are you absolutely sure you want to delete this automated {deleteConfirm.type} lifecycle? This action is irreversible.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                                        className="flex-1 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-all active:scale-95"
                                    >
                                        No, Keep it
                                    </button>
                                    <button 
                                        onClick={handleDeleteCampaign}
                                        disabled={isDeleting}
                                        className="flex-[2] py-4 rounded-2xl text-[11px] font-semibold uppercase tracking-widest text-white shadow-xl bg-rose-500 shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#f1f5f9] dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-pink-600 dark:text-pink-400">
                        <Megaphone className="w-5 h-5" />
                        <h2 className="text-[14px] font-bold text-slate-800 dark:text-white">Please give the following information for post auto reply</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Do you want to use saved template?</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setUseSaved(!useSaved)}>
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 mr-1">{useSaved ? "YES" : "NO"}</span>
                            <div className={cn("w-11 h-5 rounded-full relative transition-all shadow-inner", useSaved ? "bg-pink-600" : "bg-slate-300")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", useSaved ? "left-6.5" : "left-0.5")} />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-pink-500" /> Auto Reply Template
                        </label>
                        <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-slate-50 dark:bg-slate-800 dark:text-white disabled:opacity-50">
                            <option value="">{isLoading ? "Loading templates..." : "Please select a template"}</option>
                            {dropdownTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-500 text-white font-bold text-[13px] hover:bg-slate-600 transition-all flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-[13px] shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 flex items-center gap-2 hover:bg-pink-700 transition-all">
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#f1f5f9] dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-pink-600 dark:text-pink-400">
                        <MessageSquare className="w-5 h-5" />
                        <h2 className="text-[14px] font-bold text-slate-800 dark:text-white">Please give the following information for post auto comment</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-400" />
                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Do you want to use saved template?</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setUseSaved(!useSaved)}>
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 group-hover:text-slate-700 mr-1">{useSaved ? "YES" : "NO"}</span>
                            <div className={cn("w-11 h-5 rounded-full relative transition-all shadow-inner", useSaved ? "bg-pink-600" : "bg-slate-300")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", useSaved ? "left-6.5" : "left-0.5")} />
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-pink-500" /> Auto Comment Template
                        </label>
                        <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} disabled={isLoading} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-slate-50 dark:bg-slate-800 dark:text-white disabled:opacity-50">
                            <option value="">{isLoading ? "Loading templates..." : "Please select a template"}</option>
                            {dropdownTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-slate-500 text-white font-bold text-[13px] hover:bg-slate-600 transition-all flex items-center gap-2"><X className="w-4 h-4" /> Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="px-8 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-[13px] shadow-lg shadow-blue-100 dark:shadow-blue-900/20 flex items-center gap-2 hover:bg-pink-700 transition-all">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Submit
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Full Page Campaign Modal ──────────────────────────────────────────────────
function FullPageCampaignModal({ page, hasCampaign, onClose, onSaved }: {
    page: FacebookPage,
    hasCampaign: boolean,
    onClose: () => void,
    onSaved: () => void
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [campaignId, setCampaignId] = useState<number | null>(null);
    const [form, setForm] = useState({
        name: "",
        hide_comment: false,
        delete_comment: false,
        offensive_keywords: "",
        multiple_reply_enabled: false,
        comment_reply_enabled: true,
        hide_after_reply: false,
        reply_type: "generic", // generic or filtering
        message: "",
        image: "",
        video: "",
        private_template_id: "",
        filters: [] as { keywords: string, message: string }[]
    });

    useEffect(() => {
        const fetchCampaign = async () => {
            setIsLoadingData(true);
            try {
                const res = await api.get("/facebook/report/full-page-reply");
                const currentId = String(page.page_id || page.id);

                // Find campaign for THIS specific page within the report data array
                const campaignData = (res.data?.data || []).find((c: any) => String(c.page_id) === currentId);

                if (campaignData) {
                    const c = campaignData;
                    setCampaignId(c.id);
                    setForm({
                        name: c.name || "",
                        hide_comment: c.hide_comment === "1" || !!c.hide_comment,
                        delete_comment: c.delete_comment === "1" || !!c.delete_comment,
                        offensive_keywords: c.offensive_keywords || "",
                        multiple_reply_enabled: c.multiple_reply_enabled === "1" || !!c.multiple_reply_enabled,
                        comment_reply_enabled: c.comment_reply_enabled !== "0" && c.comment_reply_enabled !== false,
                        hide_after_reply: c.hide_after_reply === "1" || !!c.hide_after_reply,
                        reply_type: c.reply_type === "filter" ? "filtering" : "generic",
                        message: c.message || "",
                        image: c.image || "",
                        video: c.video || "",
                        private_template_id: c.private_template_id || "",
                        filters: Array.isArray(c.filters) ? c.filters : []
                    });
                }
            } catch (err) {
                console.error("Global campaign sync error");
            } finally { setIsLoadingData(false); }
        };
        fetchCampaign();
    }, [page.page_id, page.id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                facebook_page_id: page.page_id || page.id,
                ...form
            };
            if (campaignId) {
                await api.put(`/facebook/full-page-reply/${campaignId}`, payload);
            } else {
                await api.post("/facebook/full-page-reply", payload);
            }
            toast.success("Campaign synced successfully!");
            onSaved();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Operation failed");
        } finally { setIsSaving(false); }
    };

    const addFilter = () => setForm({ ...form, filters: [...form.filters, { keywords: "", message: "" }] });

    const Toggle = ({ active, label, onClick }: any) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-[12px] font-bold text-slate-600 tracking-tight">{label}</span>
            <div className="flex items-center gap-3">
                <div
                    onClick={onClick}
                    className={cn(
                        "w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer",
                        active ? "bg-pink-600" : "bg-slate-200"
                    )}
                >
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md", active ? "left-5.5" : "left-0.5")} />
                </div>
                <span className="text-[9px] font-semibold text-slate-400 w-6 uppercase tracking-widest">{active ? "YES" : "NO"}</span>
            </div>
        </div>
    );

    if (isLoadingData) return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <RefreshCw className="w-10 h-10 text-white animate-spin" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                    <h2 className="text-[15px] font-semibold text-slate-800 uppercase tracking-tight">
                        Enable / Edit Full Page Reply for: <span className="text-pink-600 ml-1">{page.page_name}</span>
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-pink-500 hover:bg-slate-50 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
                    {/* Campaign Name */}
                    <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-3">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Auto Reply Campaign Name <span className="text-pink-500">*</span></label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={v => setForm({ ...form, name: v.target.value })}
                            placeholder="Write your auto reply campaign name here"
                            className="w-full px-7 py-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-600"
                        />
                    </div>

                    {/* Offensive Filtering */}
                    <div className="p-8 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-pink-500">
                            <ShieldAlert className="w-4 h-4" />
                            <h3 className="text-[12px] font-semibold uppercase tracking-widest">Offensive Comments Settings</h3>
                        </div>
                        <div className="flex gap-10 border-b border-slate-50 pb-6">
                            <Toggle label="Hide Comment" active={form.hide_comment} onClick={() => setForm({ ...form, hide_comment: !form.hide_comment })} />
                            <Toggle label="Delete Comment" active={form.delete_comment} onClick={() => setForm({ ...form, delete_comment: !form.delete_comment })} />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Offensive Keywords (comma separated)</label>
                                <textarea
                                    rows={3}
                                    value={form.offensive_keywords}
                                    onChange={e => setForm({ ...form, offensive_keywords: e.target.value })}
                                    placeholder="keyword1, keyword2..."
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-pink-300 transition-all text-[13px] font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase text-right block">Private Reply Template</label>
                                <select className="w-full h-12 px-5 rounded-xl bg-slate-50 border border-slate-100 outline-none text-[13px] font-bold text-slate-600 focus:border-pink-300">
                                    <option>Select...</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Logic Toggles */}
                    <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4">
                        <Toggle label="Do you want to send reply message to a user multiple times?" active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                        <Toggle label="Do you want to enable comment reply?" active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                        <Toggle label="Do you want to hide comments after comment reply?" active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                    </div>

                    {/* Reply Type Selection */}
                    <div className="flex gap-4 p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <button
                            onClick={() => setForm({ ...form, reply_type: "generic" })}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-widest transition-all",
                                form.reply_type === "generic" ? "bg-pink-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:text-slate-600"
                            )}>Generic Message for All</button>
                        <button
                            onClick={() => setForm({ ...form, reply_type: "filtering" })}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-widest transition-all",
                                form.reply_type === "filtering" ? "bg-pink-600 text-white shadow-lg shadow-indigo-200" : "text-slate-400 hover:text-slate-600"
                            )}>Send Message by Filtering Word/Sentence</button>
                    </div>

                    {form.reply_type === "filtering" && (
                        <div className="space-y-4">
                            {form.filters.map((f, i) => (
                                <div key={i} className="p-8 rounded-[36px] border border-slate-100 bg-white shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                        <div className="flex items-center gap-2 text-pink-600">
                                            <Filter className="w-4 h-4" />
                                            <h3 className="text-[12px] font-semibold uppercase tracking-widest">Filter Rule #{i + 1}</h3>
                                        </div>
                                        <button onClick={() => setForm({ ...form, filters: form.filters.filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-pink-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter Words (comma separated)</label>
                                            <input
                                                type="text"
                                                value={f.keywords}
                                                onChange={e => {
                                                    const newFilters = [...form.filters];
                                                    newFilters[i].keywords = e.target.value;
                                                    setForm({ ...form, filters: newFilters });
                                                }}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-pink-400 font-medium"
                                                placeholder="Example: price, cost, how much"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reply Message</label>
                                            <textarea
                                                rows={2}
                                                value={f.message}
                                                onChange={e => {
                                                    const newFilters = [...form.filters];
                                                    newFilters[i].message = e.target.value;
                                                    setForm({ ...form, filters: newFilters });
                                                }}
                                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:border-pink-400 font-medium"
                                                placeholder="Write your automated reply..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addFilter}
                                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-semibold text-[12px] uppercase tracking-widest hover:border-pink-200 hover:text-pink-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add More Filtering
                            </button>
                        </div>
                    )}

                    {/* Generic Response Builder */}
                    <div className="p-8 rounded-[36px] border border-slate-100 bg-white shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-pink-600 border-b border-slate-50 pb-4">
                            <MessageSquare className="w-4 h-4" />
                            <h3 className="text-[12px] font-semibold uppercase tracking-widest">Message for Comment Reply</h3>
                        </div>

                        <textarea
                            rows={4}
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                            placeholder="Type your message here..."
                            className="w-full p-6 rounded-3xl bg-slate-50/50 border border-slate-100 outline-none focus:bg-white focus:border-pink-400 transition-all font-medium text-[15px]"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <UploadBox label="Image for Comment Reply" icon={ImageIcon} />
                            <UploadBox label="Video for Comment Reply" icon={Video} />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-50">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ArrowRight className="w-3.5 h-3.5" /> Select Private Message Template (Fallback)
                            </label>
                            <select className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-slate-600 focus:border-pink-400 appearance-none">
                                <option>Select Template...</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4.5 rounded-[22px] bg-white border border-slate-200 text-slate-500 font-bold text-[13px] uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all">Discard</button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[1.5] py-4.5 bg-pink-600 text-white font-semibold text-[13px] rounded-[22px] shadow-2xl shadow-indigo-100 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                        {hasCampaign ? "Update Campaign" : "Enable Global Activity"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function UploadBox({ label, icon: Icon }: any) {
    return (
        <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 group">
            <span className="text-[10px] font-medium text-slate-500 block mb-3">{label}</span>
            <div className="flex items-center gap-3">
                <button className="h-11 px-5 rounded-xl bg-pink-600 text-white flex items-center gap-2 text-[11px] font-semibold shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Upload
                </button>
                <div className="flex-1 h-11 px-4 rounded-xl border border-slate-100 bg-white flex items-center">
                    <span className="text-[11px] font-bold text-slate-300 truncate italic">Put URL or click upload</span>
                </div>
            </div>
        </div>
    );
}
