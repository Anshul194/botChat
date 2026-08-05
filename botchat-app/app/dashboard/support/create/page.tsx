"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { ArrowLeft, Send, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

interface Category {
    id: number;
    name: string;
}

export default function CreateSupportTicketPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [subject, setSubject] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/support-categories").then((res) => {
            if (res.data?.success) {
                setCategories(res.data.data);
                if (res.data.data.length > 0) {
                    setCategoryId(String(res.data.data[0].id));
                }
            }
        }).catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!subject.trim()) { setError("Subject is required."); return; }
        if (!categoryId) { setError("Category is required."); return; }
        if (!message.trim()) { setError("Message is required."); return; }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("category_id", categoryId);
            formData.append("priority", priority);
            formData.append("message", message);
            files.forEach((f) => formData.append("attachments[]", f));

            const res = await api.post("/support-tickets", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data?.success) {
                router.push(`/dashboard/support/${res.data.data.id}`);
            } else {
                setError(res.data?.message || "Failed to create ticket.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Error submitting ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
            <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Support Tickets
            </Link>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <h1 className="text-xl font-extrabold text-[var(--foreground)]">Submit a Support Ticket</h1>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Please provide detailed information so our team can assist you effectively.</p>
                </div>

                {error && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                            Subject *
                        </label>
                        <input
                            type="text"
                            placeholder="Brief summary of your issue"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                                Category *
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                                Priority *
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                            Message *
                        </label>
                        <textarea
                            rows={6}
                            placeholder="Describe your issue in detail..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary resize-y"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
                            Attachments (Optional - jpg, png, pdf, txt, zip)
                        </label>
                        <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf,.txt,.zip"
                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                            className="w-full text-xs text-[var(--muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </div>

                    <div className="pt-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider shadow-sm hover:opacity-95 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
