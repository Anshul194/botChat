"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Send, Paperclip, Loader2, User, Shield, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";


interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    file_url: string;
}

interface Message {
    id: number;
    message: string;
    is_admin_reply: boolean;
    created_at: string;
    user?: { id: number; name: string; email: string };
    attachments?: Attachment[];
}

interface TicketDetail {
    id: number;
    ticket_number: string;
    subject: string;
    priority: string;
    status: string;
    created_at: string;
    category?: { id: number; name: string };
    user?: { id: number; name: string; email: string };
    messages?: Message[];
}

export default function TenantTicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchTicket = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await api.get(`/support-tickets/${id}`);
            if (res.data?.success) {
                setTicket(res.data.data);
            }
        } catch (err: any) {
            setError("Failed to load ticket details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("message", replyText);
            files.forEach((f) => formData.append("attachments[]", f));

            const res = await api.post(`/support-tickets/${id}/reply`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data?.success) {
                setReplyText("");
                setFiles([]);
                toast.success("Reply posted successfully!");
                fetchTicket(); // reload conversation
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to post reply.");
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="p-12 flex justify-center items-center text-[var(--muted-foreground)]">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading ticket details...
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-8 text-center text-red-500">
                Ticket not found or access denied.
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Tickets
            </Link>

            {/* Ticket Header Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--border)] pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-primary">{ticket.ticket_number}</span>
                            <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-500/10 border border-slate-500/20 text-slate-600">
                                {ticket.category?.name || "General"}
                            </span>
                        </div>
                        <h1 className="text-xl font-extrabold text-[var(--foreground)] mt-1">{ticket.subject}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600">
                            {ticket.priority} Priority
                        </span>
                        <span className={cn("text-xs px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider border", ticket.status === "Open" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20")}>
                            {ticket.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-4">
                {ticket.messages?.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "rounded-2xl p-5 border shadow-sm space-y-3",
                            msg.is_admin_reply
                                ? "bg-primary/5 border-primary/20 ml-4 sm:ml-8"
                                : "bg-[var(--card)] border-[var(--border)] mr-4 sm:mr-8"
                        )}
                    >
                        <div className="flex items-center justify-between text-xs border-b border-[var(--border)]/50 pb-2">
                            <div className="flex items-center gap-2 font-bold">
                                {msg.is_admin_reply ? (
                                    <>
                                        <Shield className="w-4 h-4 text-primary" />
                                        <span className="text-primary">Support Team</span>
                                    </>
                                ) : (
                                    <>
                                        <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                                        <span className="text-[var(--foreground)]">{msg.user?.name || "You"}</span>
                                    </>
                                )}
                            </div>
                            <span className="text-[var(--muted-foreground)] text-[11px]">
                                {new Date(msg.created_at).toLocaleString()}
                            </span>
                        </div>

                        <div className="text-xs sm:text-sm whitespace-pre-wrap text-[var(--foreground)] leading-relaxed">
                            {msg.message}
                        </div>

                        {msg.attachments && msg.attachments.length > 0 && (
                            <div className="pt-2 border-t border-[var(--border)]/50 flex flex-wrap gap-2">
                                {msg.attachments.map((att) => (
                                    <a
                                        key={att.id}
                                        href={att.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-medium hover:border-primary transition-colors"
                                    >
                                        <Paperclip className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                                        <span className="truncate max-w-[150px]">{att.file_name}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Reply Box */}
            {ticket.status !== "Closed" && (
                <form onSubmit={handleReply} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--foreground)]">Reply to Ticket</h3>
                    <textarea
                        rows={4}
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary resize-y"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf,.txt,.zip"
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                            className="text-xs text-[var(--muted-foreground)] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary"
                        />

                        <button
                            type="submit"
                            disabled={submitting || !replyText.trim()}
                            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send Reply
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
