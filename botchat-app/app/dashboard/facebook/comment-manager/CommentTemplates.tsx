"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Plus, Trash2, Edit2, Save, Loader2,
    MessageSquare, ChevronRight, AlertCircle, Check
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CommentTemplates({ onClose }: Props) {
    // list
    const [templates, setTemplates] = useState<CommentTemplate[]>([]);
    const [isListLoading, setIsListLoading] = useState(true);

    // view / edit / create state
    type View = "list" | "create" | "edit";
    const [view, setView] = useState<View>("list");
    const [selected, setSelected] = useState<CommentTemplate | null>(null);

    // form
    const [formName, setFormName] = useState("");
    const [formComments, setFormComments] = useState<string[]>([""]);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // ── Fetch list ────────────────────────────────────────────────────────────
    const fetchTemplates = async () => {
        setIsListLoading(true);
        try {
            /**
             * GET /api/v1/facebook/comment-template
             * Authorization: Bearer {{TENANT_TOKEN}}
             */
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
            console.error("Fetch templates error:", err);
            toast.error("Failed to load comment templates");
        } finally {
            setIsListLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    // ── Open create ───────────────────────────────────────────────────────────
    const openCreate = () => {
        setFormName("");
        setFormComments([""]);
        setSelected(null);
        setView("create");
    };

    // ── Open edit ─────────────────────────────────────────────────────────────
    const openEdit = async (tpl: CommentTemplate) => {
        try {
            /**
             * GET /api/v1/facebook/comment-template/{id}
             */
            const res = await api.get(`/facebook/comment-template/${tpl.id}`, {
                headers: { Accept: "application/json", "Content-Type": "application/json" },
            });
            const data = res.data;
            const detail: CommentTemplate =
                data?.data ?? (data?.success || data?.is_success ? data.data : tpl);
            setSelected(detail);
            setFormName(detail.name ?? tpl.name);
            setFormComments(Array.isArray(detail.comments) && detail.comments.length > 0 ? detail.comments : [""]);
        } catch {
            // fall back to list data
            setSelected(tpl);
            setFormName(tpl.name);
            setFormComments(tpl.comments?.length ? tpl.comments : [""]);
        }
        setView("edit");
    };

    // ── Save (create or update) ───────────────────────────────────────────────
    const handleSave = async () => {
        const trimmedName = formName.trim();
        const trimmedComments = formComments.map(c => c.trim()).filter(Boolean);
        if (!trimmedName) { toast.error("Template name is required"); return; }
        if (trimmedComments.length === 0) { toast.error("Add at least one comment"); return; }

        setIsSaving(true);
        try {
            if (view === "create") {
                /**
                 * POST /api/v1/facebook/comment-template
                 * Body: { name, comments: string[] }
                 */
                await api.post("/facebook/comment-template", {
                    name: trimmedName,
                    comments: trimmedComments,
                }, { headers: { Accept: "application/json", "Content-Type": "application/json" } });
                toast.success("Template created!");
            } else {
                /**
                 * PATCH /api/v1/facebook/comment-template/{id}
                 * Body: { name, comments: string[] }
                 */
                await api.patch(`/facebook/comment-template/${selected!.id}`, {
                    name: trimmedName,
                    comments: trimmedComments,
                }, { headers: { Accept: "application/json", "Content-Type": "application/json" } });
                toast.success("Template updated!");
            }
            await fetchTemplates();
            setView("list");
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? "Failed to save template";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id: number) => {
        if (!confirm("Delete this template? This cannot be undone.")) return;
        setDeletingId(id);
        try {
            /**
             * DELETE /api/v1/facebook/comment-template/{id}
             */
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

    // ── Comment rows helpers ──────────────────────────────────────────────────
    const addCommentRow = () => setFormComments(prev => [...prev, ""]);
    const updateComment = (idx: number, val: string) =>
        setFormComments(prev => prev.map((c, i) => i === idx ? val : c));
    const removeComment = (idx: number) =>
        setFormComments(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {view !== "list" && (
                            <button
                                onClick={() => setView("list")}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                            </button>
                        )}
                        <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {view === "list" ? "Comment Templates" : view === "create" ? "New Template" : "Edit Template"}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
                                {view === "list" ? `${templates.length} saved` : "Fill in the details"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
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
                                className="p-6 space-y-3"
                            >
                                {isListLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                    ))
                                ) : templates.length === 0 ? (
                                    <div className="flex flex-col items-center py-12 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-3">
                                            <MessageSquare className="w-6 h-6 text-purple-300" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">No templates yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Create your first comment template to get started.</p>
                                    </div>
                                ) : (
                                    templates.map(tpl => (
                                        <div
                                            key={tpl.id}
                                            className="group bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                                                <MessageSquare className="w-4 h-4 text-purple-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{tpl.name}</p>
                                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                    {tpl.comments?.length ?? 0} comment{tpl.comments?.length !== 1 ? "s" : ""}
                                                    {tpl.comments?.[0] && <span className="italic"> · "{tpl.comments[0]}"</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(tpl)}
                                                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-purple-600 hover:border-purple-300 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tpl.id)}
                                                    disabled={deletingId === tpl.id}
                                                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 transition-all disabled:opacity-40"
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
                                className="p-6 space-y-5"
                            >
                                {/* Name field */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        Template Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='e.g. "Positive Comments"'
                                        value={formName}
                                        onChange={e => setFormName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-medium outline-none focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Comments */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                            Comments ({formComments.filter(c => c.trim()).length})
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addCommentRow}
                                            className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 uppercase tracking-widest transition-colors"
                                        >
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {formComments.map((comment, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-400">
                                                    {idx + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={comment}
                                                    onChange={e => updateComment(idx, e.target.value)}
                                                    placeholder={`Comment ${idx + 1}`}
                                                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:border-purple-400 dark:focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-slate-300"
                                                />
                                                {formComments.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeComment(idx)}
                                                        className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Preview hint */}
                                    {formComments.filter(c => c.trim()).length > 0 && (
                                        <div className="mt-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/10">
                                            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1.5">Preview</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {formComments.filter(c => c.trim()).map((c, i) => (
                                                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-500/20 text-slate-600 dark:text-slate-300 font-medium">
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
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                    {view === "list" ? (
                        <button
                            onClick={openCreate}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-[13px] shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Template
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setView("list")}
                                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[13px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-[1.5] py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-[13px] shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
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
