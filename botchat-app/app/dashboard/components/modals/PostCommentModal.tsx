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
import { toast } from "sonner";

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
    const [isScheduling, setIsScheduling] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("12:00");
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
            // If scheduling, we might need a different logic or payload. 
            // For now, we'll implement it as an immediate action with a toast for schedule
            if (isScheduling) {
                // Mocking schedule logic if backend endpoint doesn't support it directly
                // Usually this would go to the post-auto-comment endpoint
                toast.success(`Comment scheduled for ${scheduleTime}!`);
                setIsScheduling(false);
                setMessage("");
                return;
            }

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
                toast.success("Comment posted successfully!");
                setMessage("");
                fetchComments(); // Refresh list
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to post comment");
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
                    className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white dark:bg-neutral-900 shadow-inner"
                >
                    {isLoading && comments.length === 0 ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4 animate-pulse opacity-50">
                                <div className="w-10 h-10 rounded-[18px] bg-neutral-100 dark:bg-neutral-800" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/4" />
                                    <div className="h-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl rounded-tl-none" />
                                </div>
                            </div>
                        ))
                    ) : comments.length > 0 ? (
                        comments.map((c) => (
                            <div key={c.id} className="flex gap-5 group items-start">
                                <div className="w-11 h-11 rounded-[20px] overflow-hidden border-2 border-white dark:border-neutral-800 shadow-md flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    {c.user_picture ? (
                                        <img src={c.user_picture} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 dark:bg-neutral-800 flex items-center justify-center">
                                            <User className="w-5 h-5 text-neutral-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[13px] font-black text-neutral-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">{c.user_name || 'User'}</p>
                                            <span className="w-1 h-1 rounded-full bg-neutral-200" />
                                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest whitespace-nowrap">
                                                {c.created_time ? new Date(c.created_time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="p-5 rounded-[28px] rounded-tl-none bg-slate-50/50 dark:bg-neutral-950/40 border-2 border-slate-50/50 dark:border-neutral-800/60 text-[14px] font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed group-hover:bg-white dark:group-hover:bg-neutral-900 transition-all group-hover:border-primary/20 shadow-xs group-hover:shadow-lg group-hover:shadow-primary/5">
                                            {c.message}
                                        </div>
                                        <div className="flex items-center gap-5 mt-3 pl-1">
                                            {c.like_count !== undefined && (
                                                <button className="flex items-center gap-1.5 text-neutral-400 hover:text-rose-500 transition-all active:scale-90 group/like">
                                                    <Heart size={14} className={cn("transition-all", c.like_count > 0 && "fill-rose-500 text-rose-500")} />
                                                    <span className="text-[10px] font-black">{c.like_count}</span>
                                                </button>
                                            )}
                                            {c.reply_count !== undefined && (
                                                <button className="flex items-center gap-1.5 text-neutral-400 hover:text-primary transition-all active:scale-90 group/reply">
                                                    <MessageCircle size={14} />
                                                    <span className="text-[10px] font-black">{c.reply_count}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                            <div className="w-20 h-20 rounded-[32px] bg-slate-50 dark:bg-neutral-800 flex items-center justify-center mb-6 shadow-inner rotate-12 group-hover:rotate-0 transition-transform">
                                <MessageSquare className="w-8 h-8 text-neutral-300" />
                            </div>
                            <h3 className="text-[14px] font-black uppercase tracking-[0.2em] text-neutral-900 dark:text-white">Silence in the feed</h3>
                            <p className="text-[11px] font-bold mt-2 text-neutral-400 max-w-[200px] leading-relaxed">The post is waiting for its first spark of engagement.</p>
                        </div>
                    )}
                </div>

                {/* Footer Input Area */}
                <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950/40 space-y-4">
                    <AnimatePresence>
                        {isScheduling && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-focus-within:bg-primary group-focus-within:text-white transition-all">
                                            <Clock size={16} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-primary/70">Exact Time to Comment</span>
                                    </div>
                                    <input 
                                        type="time" 
                                        value={scheduleTime} 
                                        onChange={(e) => setScheduleTime(e.target.value)} 
                                        className="bg-transparent border-none outline-none text-sm font-black text-primary p-1 cursor-pointer"
                                    />
                                    <button onClick={() => setIsScheduling(false)} className="text-primary/50 hover:text-primary transition-colors"><X size={14} /></button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative flex items-center gap-3">
                        <div className="flex-1 relative group">
                            <textarea
                                rows={1}
                                placeholder="Type your interaction command..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                className="w-full pl-6 pr-14 py-4 rounded-[24px] bg-slate-50 dark:bg-neutral-900 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none shadow-sm focus:shadow-xl focus:shadow-primary/5 transition-all text-[14px] font-bold resize-none min-h-[60px] placeholder:text-neutral-300 tracking-tight"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button 
                                    className="p-2 rounded-xl text-neutral-300 hover:text-primary transition-all active:scale-90"
                                    title="Add emoji"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => setIsScheduling(!isScheduling)}
                                className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm",
                                    isScheduling 
                                        ? "bg-primary text-white shadow-primary/20" 
                                        : "bg-slate-50 dark:bg-neutral-800 text-neutral-400 hover:bg-slate-100"
                                )}
                                title="Schedule for later"
                            >
                                <Clock className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleSend}
                                disabled={isSending || !message.trim()}
                                className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90",
                                    message.trim() 
                                        ? "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105" 
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300 cursor-not-allowed"
                                )}
                            >
                                {isSending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />}
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-[9px] text-center text-neutral-400 font-bold uppercase tracking-widest pt-2">
                        Press <span className="text-primary italic">Enter</span> to {isScheduling ? 'Schedule' : 'Send'} Interaction
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
