"use client";

import { useState, useEffect, useRef } from "react";
import { 
    X, Send, Smile, User, Clock, 
    RefreshCw, MessageSquare, 
    MoreHorizontal, Search, Trash2,
    Heart, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface Comment {
    id: string;
    user_name: string;
    user_picture: string;
    message: string;
    created_time: string;
    like_count?: number;
    reply_count?: number;
}

interface PostCommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    platform: "facebook" | "instagram";
    postId: string;
    pageId: string;
}

export function PostCommentModal({ 
    isOpen, 
    onClose, 
    platform,
    postId,
    pageId
}: PostCommentModalProps) {
    const { showModal } = useModal();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [message, setMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && postId) {
            fetchComments();
        }
    }, [isOpen, postId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const endpoint = platform === "facebook" 
                ? `/facebook/post-comments/${postId}` 
                : `/instagram/post-comments/${postId}`;
            
            const params = platform === "facebook" 
                ? { facebook_page_id: pageId } 
                : { instagram_id: pageId };

            const res = await api.get(endpoint, { params });
            // The API structure is data.comments
            const fetched = res.data?.data?.comments || res.data?.data || [];
            setComments(Array.isArray(fetched) ? fetched : []);
        } catch (error) {
            console.error("Fetch Comments Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        try {
            const endpoint = platform === "facebook" 
                ? "/facebook/post-comment" 
                : "/instagram/post-comment";
            
            const payload = platform === "facebook" ? {
                post_id: postId,
                facebook_page_id: pageId,
                message: message.trim()
            } : {
                post_id: postId,
                instagram_id: pageId,
                message: message.trim()
            };

            const res = await api.post(endpoint, payload);
            if (res.data.success || res.data.is_success) {
                showModal("success", "Success", "Comment posted!");
                setMessage("");
                fetchComments(); // Refresh list
            }
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to post comment");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[32px] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden flex flex-col h-[600px] max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-tight">Post Interactions</h2>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Real-time engagement module</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchComments} className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-neutral-400">
                            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-neutral-400 hover:text-rose-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Comment List */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-neutral-900"
                >
                    {isLoading && comments.length === 0 ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/4" />
                                    <div className="h-10 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl" />
                                </div>
                            </div>
                        ))
                    ) : comments.length > 0 ? (
                        comments.map((c) => (
                            <div key={c.id} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-[18px] overflow-hidden border-2 border-white dark:border-neutral-800 shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform">
                                    {c.user_picture ? (
                                        <img src={c.user_picture} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                            <User className="w-4 h-4 text-neutral-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1.5 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[12px] font-black text-neutral-900 dark:text-white uppercase tracking-tight truncate pr-4">{c.user_name || 'User'}</p>
                                        <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest whitespace-nowrap">
                                            {c.created_time ? new Date(c.created_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                        </p>
                                    </div>
                                    <div className="relative">
                                        <div className="p-4 rounded-[24px] rounded-tl-none bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-100 dark:border-neutral-800/60 text-[13px] font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed group-hover:bg-white dark:group-hover:bg-neutral-900 transition-all group-hover:border-primary/30 shadow-xs group-hover:shadow-lg group-hover:shadow-primary/5">
                                            {c.message}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 pl-1">
                                            {c.like_count !== undefined && (
                                                <div className="flex items-center gap-1 text-neutral-400 group-hover:text-rose-500 transition-colors">
                                                    <Heart size={10} className={cn(c.like_count > 0 && "fill-rose-500 text-rose-500")} />
                                                    <span className="text-[10px] font-black">{c.like_count}</span>
                                                </div>
                                            )}
                                            {c.reply_count !== undefined && (
                                                <div className="flex items-center gap-1 text-neutral-400 group-hover:text-primary transition-colors">
                                                    <MessageCircle size={10} />
                                                    <span className="text-[10px] font-black">{c.reply_count}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em]">Silence in the feed</p>
                            <p className="text-[10px] font-bold mt-1 text-neutral-400">Be the first to speak!</p>
                        </div>
                    )}
                </div>

                {/* Footer Input */}
                <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
                    <div className="relative group">
                        <textarea
                            rows={1}
                            placeholder="Write your comment..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="w-full pl-6 pr-24 py-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary shadow-sm focus:shadow-xl focus:shadow-primary/5 transition-all text-[13px] font-bold resize-none min-h-[56px] placeholder:text-neutral-400 tracking-tight"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button 
                                className="p-2 rounded-xl text-neutral-400 hover:text-primary transition-colors active:scale-95"
                                title="Add emoji"
                            >
                                <Smile className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleSend}
                                disabled={isSending || !message.trim()}
                                className={cn(
                                    "p-2.5 rounded-xl transition-all active:scale-90",
                                    message.trim() 
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105" 
                                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                                )}
                            >
                                {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
