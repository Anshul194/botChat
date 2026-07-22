"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, Edit3, X, Sparkles,
  ChevronLeft, Loader2, Check, RefreshCw,
  SlidersHorizontal, Hash, Mail, Phone, Globe, Type
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { SwipeHint } from "@/components/ui/swipe-hint";

interface CustomField {
  id: number;
  name: string;
  type: "email" | "phone" | "text" | "number" | "url";
  is_active: number;
  created_at?: string;
}

const VALIDATION_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "number", label: "Number", icon: Hash },
  { value: "url", label: "URL", icon: Globe },
];

const fieldTypeIcon = (type: string) => {
  const item = VALIDATION_TYPES.find(t => t.value === type);
  return item ? item.icon : Type;
};

function CustomFieldModal({ mode, initial, onClose, onSaved }: {
  mode: "create" | "edit"; initial: CustomField | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    type: initial?.type ?? "text",
    is_active: initial?.is_active ?? 1
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Field name is required");
    if (!form.type) return toast.error("Please select a field type");

    setIsSaving(true);
    try {
      const payload = { ...form };
      if (mode === "create") {
        await api.post("/facebook/subscriber/custom-fields", payload);
      } else {
        await api.put(`/facebook/subscriber/custom-fields/${initial?.id}`, payload);
      }
      toast.success("Field saved successfully!");
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Execution failed");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="relative z-10 w-full sm:max-w-[520px] bg-[var(--card)] sm:border border-[var(--border)] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] sm:mx-4"
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6 border-b border-[var(--border)] sticky top-0 z-10 bg-[var(--card)]">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-[var(--foreground)] truncate">
              {mode === "create" ? "Initialize Field" : "Update Variable"}
            </h2>
            <p className="text-[9px] sm:text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider mt-0.5">Meta Subscriber Identity</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-all active:scale-90 shrink-0 -mr-1">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-8 sm:py-6 space-y-5 sm:space-y-7 overflow-y-auto flex-1">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Type className="w-3 h-3 text-[var(--muted-foreground)]" />
              <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Field Display Name</label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Favorite Hub, Birth Month"
                className="w-full px-4 py-3 sm:py-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 focus:bg-[var(--card)] focus:border-[var(--primary)]/50 outline-none transition-all font-medium text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/60"
              />
              <Edit3 className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]/30 group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-[var(--muted-foreground)]" />
              <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Format Validation Type</label>
            </div>
            <div className="relative">
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="w-full h-[48px] sm:h-[52px] px-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 focus:bg-[var(--card)] focus:border-[var(--primary)]/50 outline-none transition-all font-medium text-sm text-[var(--foreground)] appearance-none cursor-pointer pr-10"
              >
                {VALIDATION_TYPES.map(t => (
                  <option key={t.value} value={t.value} className="bg-[var(--card)] text-[var(--foreground)]">{t.label}</option>
                ))}
              </select>
              <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--muted-foreground)]/50 pointer-events-none -rotate-90" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/10">
              <Sparkles className="w-3 h-3 text-[var(--primary)] shrink-0" />
              <p className="text-[10px] font-medium text-[var(--primary)]/70">
                Only <span className="font-bold text-[var(--primary)]">{form.type}</span> inputs will be stored.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className={cn("w-2 h-2 rounded-full transition-all duration-500", form.is_active ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-[var(--muted-foreground)]/40")} />
                {form.is_active && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25" />}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Lifecycle Status</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={cn("text-[9px] font-bold uppercase tracking-wider transition-colors", form.is_active ? "text-emerald-500" : "text-[var(--muted-foreground)]")}>
                {form.is_active ? "Active" : "Paused"}
              </span>
              <div
                onClick={() => setForm({ ...form, is_active: form.is_active ? 0 : 1 })}
                className={cn(
                  "w-11 h-5 sm:w-12 sm:h-6 rounded-full relative transition-all duration-300 cursor-pointer overflow-hidden",
                  form.is_active ? "bg-emerald-500" : "bg-[var(--muted)]"
                )}
              >
                <div className={cn("absolute top-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[var(--card)] transition-all duration-300 shadow-md", form.is_active ? "left-[25px] sm:left-[26px]" : "left-0.5")} />
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-8 sm:py-5 border-t border-[var(--border)] bg-[var(--muted)]/10 flex gap-2.5 sm:gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all active:scale-95">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[1.5] py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
            {mode === "create" ? "Initialize Variable" : "Apply Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CustomFieldsPage() {
  const router = useRouter();
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean, mode: "create" | "edit", initial: CustomField | null }>({
    open: false, mode: "create", initial: null
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchFields = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/facebook/subscriber/custom-fields");
      setFields(Array.isArray(res.data?.data) ? res.data.data : (res.data || []));
    } catch { toast.error("Failed to load custom fields"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFields(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/facebook/subscriber/custom-fields/${id}`);
      toast.success("Field purged successfully");
      setFields(fields.filter(f => f.id !== id));
      setDeleteId(null);
    } catch { toast.error("Deletion failed"); }
  };

  const filtered = fields.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-[50] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <button onClick={() => router.back()} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all active:scale-90 shrink-0">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-[var(--foreground)] truncate">Custom Fields</h1>
              <p className="text-[9px] sm:text-[10px] font-semibold text-[var(--muted-foreground)] mt-0 hidden sm:flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3" /> Meta Identity Variables
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal({ open: true, mode: "create", initial: null })}
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Initialize Property</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-[var(--border)] bg-[var(--card)] shrink-0 self-start">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-[13px] font-semibold text-[var(--foreground)]">
              {fields.length}
              <span className="text-[var(--muted-foreground)] ml-1 text-[10px] sm:text-xs">Properties</span>
            </span>
          </div>
          <div className="flex items-center gap-2 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]/50" />
              <input
                type="text"
                placeholder="Search property..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3.5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10 outline-none font-medium text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 transition-all"
              />
            </div>
            <button
              onClick={fetchFields}
              className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all shrink-0"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="divide-y divide-[var(--border)]/50">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse p-4 sm:px-6 sm:py-5">
                  <div className="h-5 w-2/3 bg-[var(--muted)] rounded-lg" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 sm:py-24 text-center px-4">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[var(--muted)] flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-[var(--muted-foreground)]/40" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                {search ? "No results found" : "No Variables Defined"}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 sm:mt-2 max-w-xs mx-auto">
                {search ? "No properties match your search query." : "Create your first custom field to start tracking subscriber data."}
              </p>
              {!search && (
                <button
                  onClick={() => setModal({ open: true, mode: "create", initial: null })}
                  className="mt-5 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-xs sm:text-sm shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Create Field
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden sm:block relative">
                <SwipeHint containerRef={tableScrollRef} storageKey="fb-custom-fields" align="right" className="absolute -top-6 right-2" />
                <div ref={tableScrollRef} className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                        <th className="px-6 lg:px-8 py-4 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Variable Property</th>
                        <th className="px-6 lg:px-8 py-4 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Validator Type</th>
                        <th className="px-6 lg:px-8 py-4 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                        <th className="px-6 lg:px-8 py-4 text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {filtered.map((f, idx) => (
                          <motion.tr
                            key={f.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: idx * 0.03 }}
                            className="group border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--muted)]/30 transition-colors"
                          >
                            <td className="px-6 lg:px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                  f.is_active
                                    ? "bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]"
                                    : "bg-[var(--muted)]/50 text-[var(--muted-foreground)]/50"
                                )}>
                                  <Hash className="w-5 h-5" />
                                </div>
                                <span className="text-[15px] font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate max-w-[200px]">
                                  {f.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 lg:px-8 py-5">
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const Icon = fieldTypeIcon(f.type);
                                  return <Icon className="w-4 h-4 text-[var(--muted-foreground)]/60" />;
                                })()}
                                <span className="text-[11px] font-medium text-[var(--muted-foreground)] capitalize">{f.type}</span>
                              </div>
                            </td>
                            <td className="px-6 lg:px-8 py-5">
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all",
                                f.is_active
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                              )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", f.is_active ? "bg-emerald-500 animate-pulse" : "bg-[var(--muted-foreground)]/40")} />
                                {f.is_active ? "ACTIVE" : "INACTIVE"}
                              </div>
                            </td>
                            <td className="px-6 lg:px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <button
                                  onClick={() => setModal({ open: true, mode: "edit", initial: f })}
                                  className="w-10 h-10 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 flex items-center justify-center transition-all active:scale-90"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteId(f.id)}
                                  className="w-10 h-10 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 flex items-center justify-center transition-all active:scale-90"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sm:hidden divide-y divide-[var(--border)]/50">
                <AnimatePresence mode="popLayout">
                  {filtered.map((f, idx) => (
                    <motion.div
                      key={f.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.03 }}
                      className="p-4 active:bg-[var(--muted)]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            f.is_active ? "bg-[var(--muted)] text-[var(--muted-foreground)]" : "bg-[var(--muted)]/50 text-[var(--muted-foreground)]/50"
                          )}>
                            <Hash className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-[var(--foreground)] truncate">{f.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {(() => {
                                  const Icon = fieldTypeIcon(f.type);
                                  return <Icon className="w-3 h-3 text-[var(--muted-foreground)]/60" />;
                                })()}
                                <span className="text-[10px] font-medium text-[var(--muted-foreground)] capitalize">{f.type}</span>
                              </div>
                              <span className="text-[var(--muted-foreground)]/30">|</span>
                              <div className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold",
                                f.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                              )}>
                                <div className={cn("w-1 h-1 rounded-full", f.is_active ? "bg-emerald-500" : "bg-[var(--muted-foreground)]/40")} />
                                {f.is_active ? "ACTIVE" : "INACTIVE"}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setModal({ open: true, mode: "edit", initial: f })}
                            className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 flex items-center justify-center transition-all active:scale-90"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(f.id)}
                            className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-rose-500 hover:border-rose-500/30 flex items-center justify-center transition-all active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal.open && (
          <CustomFieldModal
            mode={modal.mode}
            initial={modal.initial}
            onClose={() => setModal({ open: false, mode: "create", initial: null })}
            onSaved={() => { setModal({ open: false, mode: "create", initial: null }); fetchFields(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative z-10 w-full sm:max-w-[400px] bg-[var(--card)] sm:border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-2xl sm:mx-4"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 bg-rose-500/10">
                <Trash2 className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">Are you sure?</h3>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                This will permanently delete this property.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 rounded-xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-semibold text-[10px] uppercase tracking-wider transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId!!)}
                  className="flex-[1.2] py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
