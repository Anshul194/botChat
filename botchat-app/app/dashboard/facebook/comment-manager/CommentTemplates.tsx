"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Plus, Trash2, Edit2, Loader2,
    MessageSquare, ChevronRight, Check
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentTemplate {
    id: number;
    name: string;
    comments: string[];
    created_at?: string;
    updated_at?: string;
}

interface Props {
    onClose: () => void;
    defaultView?: "list" | "create" | "edit";
    selectedTemplate?: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommentTemplates({ onClose, defaultView = "list", selectedTemplate = null }: Props) {
    const [templates, setTemplates] = useState<CommentTemplate[]>([]);
    const [isListLoading, setIsListLoading] = useState(true);

    type View = "list" | "create" | "edit";
    const [view, setView] = useState<View>(defaultView);
    const [selected, setSelected] = useState<CommentTemplate | null>(selectedTemplate);

    const [formName, setFormName] = useState("");
    const [formComments, setFormComments] = useState<string[]>([""]);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchTemplates = async () => {
        setIsListLoading(true);
        try {
            const res = await api.get("/facebook/comment-template", {
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            });
            const data = res.data;
            const payload: CommentTemplate[] =
                Array.isArray(data) ? data :
                    Array.isArray(data?.data) ? data.data :
                        (data?.success || data?.is_success)
                            ? (Array.isArray(data.data) ? data.data : data.data?.data ?? [])
                            : [];
            setTemplates(payload);
        } catch (err) {
            toast.error("Failed to load comment templates");
        } finally {
            setIsListLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const openCreate = () => {
        setFormName("");
        setFormComments([""]);
        setSelected(null);
        setView("create");
    };

    const openEdit = async (tpl: CommentTemplate) => {
        try {
            const res = await api.get(`/facebook/comment-template/${tpl.id}`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            });
            const data = res.data;
            const detail: CommentTemplate = data?.data ?? (data?.success || data?.is_success ? data.data : tpl);
            setSelected(detail);
            setFormName(detail.name ?? tpl.name);
            setFormComments(Array.isArray(detail.comments) && detail.comments.length > 0 ? detail.comments : [""]);
        } catch {
            setSelected(tpl);
            setFormName(tpl.name);
            setFormComments(tpl.comments?.length ? tpl.comments : [""]);
        }
        setView("edit");
    };

    const handleSave = async () => {
        const trimmedName = formName.trim();
        const trimmedComments = formComments.map(c => c.trim()).filter(Boolean);
        if (!trimmedName) { toast.error("Template name is required"); return; }
        if (trimmedComments.length === 0) { toast.error("Add at least one comment"); return; }

        setIsSaving(true);
        try {
            if (view === "create") {
                await api.post("/facebook/comment-template", {
                    name: trimmedName,
                    comments: trimmedComments,
                }, { headers: { Accept: "application/json", "Content-Type": "application/json" } });
                toast.success("Template created!");
            } else {
                await api.patch(`/facebook/comment-template/${selected!.id}`, {
                    name: trimmedName,
                    comments: trimmedComments,
                }, { headers: { Accept: "application/json", "Content-Type": "application/json" } });
                toast.success("Template updated!");
            }
            await fetchTemplates();
            setView("list");
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this template? This cannot be undone.")) return;
        setDeletingId(id);
        try {
            await api.delete(`/facebook/comment-template/${id}`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            });
            toast.success("Template deleted");
            setTemplates(prev => prev.filter(t => t.id !== id));
            if (view !== "list") setView("list");
        } catch {
            toast.error("Failed to delete template");
        } finally {
            setDeletingId(null);
        }
    };

    const addCommentRow = () => setFormComments(prev => [...prev, ""]);
    const updateComment = (idx: number, val: string) =>
        setFormComments(prev => prev.map((c, i) => i === idx ? val : c));
    const removeComment = (idx: number) =>
        setFormComments(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 backdrop-blur-sm"
                style={{ background: "rgba(0,0,0,0.55)" }}
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative z-10 w-full max-w-none sm:max-w-xl rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full max-h-full sm:h-auto sm:max-h-[90vh] sm:min-h-[60vh] bg-[var(--card)] border border-[var(--border)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile drag handle */}
                <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 rounded-full" style={{ background: "var(--border)" }} />
                </div>

                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <div className="flex items-center gap-3">
                        {view !== "list" && (
                            <button
                                onClick={() => setView("list")}
                                className="p-1.5 rounded-lg transition-all"
                                style={{ color: "var(--muted-foreground)" }}
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                        )}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                            <MessageSquare className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-tight" style={{ color: "var(--foreground)" }}>
                                {view === "list" ? "Comment Templates" : view === "create" ? "New Template" : "Edit Template"}
                            </h2>
                            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                {view === "list" ? `${templates.length} saved` : "Fill in the details"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl transition-all hover:text-rose-500"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">

                        {/* ── LIST VIEW ──────────────────────────────────────── */}
                        {view === "list" && (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                className="p-5 space-y-3"
                            >
                                {isListLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "var(--muted)" }} />
                                    ))
                                ) : templates.length === 0 ? (
                                    <div className="flex flex-col items-center py-12 text-center">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(139,92,246,0.1)" }}>
                                            <MessageSquare className="w-6 h-6" style={{ color: "#8b5cf6", opacity: 0.5 }} />
                                        </div>
                                        <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>No templates yet</p>
                                        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Create your first comment template to get started.</p>
                                    </div>
                                ) : (
                                    templates.map(tpl => (
                                        <div
                                            key={tpl.id}
                                            className="group rounded-2xl p-4 flex items-center gap-4 transition-all"
                                            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
                                        >
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(139,92,246,0.12)" }}>
                                                <MessageSquare className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-bold truncate" style={{ color: "var(--foreground)" }}>{tpl.name}</p>
                                                <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                                    {tpl.comments?.length ?? 0} comment{tpl.comments?.length !== 1 ? "s" : ""}
                                                    {tpl.comments?.[0] && <span className="italic"> · "{tpl.comments[0]}"</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(tpl)}
                                                    className="p-2 rounded-lg transition-all hover:text-purple-600"
                                                    style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tpl.id)}
                                                    disabled={deletingId === tpl.id}
                                                    className="p-2 rounded-lg transition-all hover:text-rose-500 disabled:opacity-40"
                                                    style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                                                    title="Delete"
                                                >
                                                    {deletingId === tpl.id
                                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        : <Trash2 className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}

                        {/* ── CREATE / EDIT FORM ─────────────────────────────── */}
                        {(view === "create" || view === "edit") && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                className="p-5 space-y-5"
                            >
                                {/* Name field */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                        Template Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='e.g. "Positive Comments"'
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                                        style={{
                                            background: "var(--muted)",
                                            border: "1px solid var(--border)",
                                            color: "var(--foreground)",
                                        }}
                                    />
                                </div>

                                {/* Comments */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-black uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                            Comments ({formComments.filter(c => c.trim()).length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addCommentRow}
                                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-colors"
                                            style={{ color: "#8b5cf6" }}
                                        >
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {formComments.map((comment, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-black"
                                                    style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                                                >
                                                    {idx + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={comment}
                                                    onChange={e => updateComment(idx, e.target.value)}
                                                    placeholder={`Comment ${idx + 1}`}
                                                    className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                                                    style={{
                                                        background: "var(--muted)",
                                                        border: "1px solid var(--border)",
                                                        color: "var(--foreground)",
                                                    }}
                                                />
                                                {formComments.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeComment(idx)}
                                                        className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:text-rose-500"
                                                        style={{ color: "var(--muted-foreground)" }}
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Preview hint */}
                                    {formComments.filter(c => c.trim()).length > 0 && (
                                        <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#8b5cf6" }}>
                                                Preview · Rotates Randomly
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {formComments.filter(c => c.trim()).map((c, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                                                        style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                                                    >
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div
                    className="px-5 py-4 flex-shrink-0"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    {view === "list" ? (
                        <button
                            onClick={openCreate}
                            className="w-full py-3 rounded-2xl text-[var(--primary-foreground)] font-bold text-[13px] shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                            style={{ background: "var(--app-button-bg)", boxShadow: "0 4px 20px rgba(255,45,120,0.15)" }}
                        >
                            <Plus className="w-4 h-4" />
                            Create New Template
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setView("list")}
                                className="flex-1 py-3 rounded-2xl font-bold text-[13px] transition-all bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-[1.5] py-3 rounded-2xl text-[var(--primary-foreground)] font-bold text-[13px] shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                                style={{ background: "var(--app-button-bg)", boxShadow: "0 4px 20px rgba(255,45,120,0.15)" }}
                            >
                                {isSaving
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                    : <><Check className="w-4 h-4" /> {view === "create" ? "Create Template" : "Save Changes"}</>
                                }
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
