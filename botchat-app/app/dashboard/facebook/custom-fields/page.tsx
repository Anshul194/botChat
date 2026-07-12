"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, Edit3, X, Sparkles,
  ChevronLeft, Loader2, Check, RefreshCw,
  Clock, Settings, SlidersHorizontal, Hash, Mail, Phone, Globe, Type,
  ToggleLeft, ToggleRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 24 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-10 w-full sm:max-w-[520px] lg:max-w-[580px] bg-[var(--card)] border border-[var(--border)] rounded-2xl sm:rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] mx-0 sm:mx-4"
      >
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)] sticky top-0 z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
              {mode === "create" ? "Initialize Field" : "Update Variable"}
            </h2>
            <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mt-1">Meta Subscriber Identity</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--muted)] transition-all active:scale-90">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto no-scrollbar flex-1">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Field Display Name</label>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Favorite Hub, Birth Month"
                className="w-full px-5 py-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 focus:bg-[var(--card)] focus:border-[var(--primary)]/50 outline-none transition-all font-medium text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              />
              <Edit3 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/40 group-focus-within:text-[var(--primary)] transition-colors" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Format Validation Type</label>
            </div>
            <div className="relative group">
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as any })}
                className="w-full h-[52px] px-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 focus:bg-[var(--card)] focus:border-[var(--primary)]/50 outline-none transition-all font-medium text-sm text-[var(--foreground)] appearance-none cursor-pointer pr-12"
              >
                {VALIDATION_TYPES.map(t => (
                  <option key={t.value} value={t.value} className="bg-[var(--card)] text-[var(--foreground)]">{t.label}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]/50 group-hover:text-[var(--primary)] transition-colors">
                <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[var(--primary)]/5 border border-[var(--primary)]/10">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <p className="text-[11px] font-medium text-[var(--primary)]/70">
                Only <span className="font-bold text-[var(--primary)]">{form.type}</span> inputs will be stored.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 hover:border-[var(--primary)]/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", form.is_active ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" : "bg-[var(--muted-foreground)]/40")} />
                {form.is_active && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25" />}
              </div>
              <span className="text-xs font-semibold text-[var(--foreground)]">Lifecycle Status</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", form.is_active ? "text-emerald-500" : "text-[var(--muted-foreground)]")}>
                {form.is_active ? "Active" : "Paused"}
              </span>
              <div
                onClick={() => setForm({ ...form, is_active: form.is_active ? 0 : 1 })}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer overflow-hidden",
                  form.is_active ? "bg-emerald-500" : "bg-[var(--muted)]"
                )}
              >
                <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md", form.is_active ? "left-[26px]" : "left-0.5")} />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-[var(--border)] bg-[var(--muted)]/10 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-semibold text-[11px] uppercase tracking-widest transition-all active:scale-95">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[1.5] py-3.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {mode === "create" ? "Initialize Variable" : "Apply Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 200 }
  }
};

export default function CustomFieldsPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-[var(--background)] font-sans pb-24">
      <div className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all active:scale-90 shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--foreground)] truncate">Custom Fields</h1>
              <p className="text-[10px] font-semibold text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3 h-3 shrink-0" /> Meta Identity Variables
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal({ open: true, mode: "create", initial: null })}
            className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Initialize Property</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-[13px] font-semibold text-[var(--foreground)]">
              {fields.length}
              <span className="text-[var(--muted-foreground)] ml-1.5 hidden sm:inline">Properties Defined</span>
              <span className="text-[var(--muted-foreground)] ml-1.5 sm:hidden">Defined</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-3 flex-1 max-w-xl w-full sm:w-auto">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/50 group-focus-within:text-[var(--primary)] transition-colors" />
              <input
                type="text"
                placeholder="Search property..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10 outline-none font-medium text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 transition-all"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={fetchFields}
              className="p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all shrink-0"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/30">
                  <th className="px-4 sm:px-6 lg:px-8 py-4 text-[10px] sm:text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Variable Property</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 text-[10px] sm:text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Validator Type</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 text-[10px] sm:text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 text-[10px] sm:text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <tr key={i} className="animate-pulse border-b border-[var(--border)]/50">
                        <td colSpan={4} className="px-4 sm:px-6 lg:px-8 py-6">
                          <div className="h-5 w-2/3 bg-[var(--muted)] rounded-lg" />
                        </td>
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <motion.div
                          variants={emptyStateVariants}
                          className="py-20 sm:py-32 text-center"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--muted)] flex items-center justify-center mx-auto mb-5">
                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--muted-foreground)]/40" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">No Variables Defined</h3>
                          <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xs mx-auto">
                            {search ? "No properties match your search." : "Create your first custom field to start tracking subscriber data."}
                          </p>
                          {!search && (
                            <button
                              onClick={() => setModal({ open: true, mode: "create", initial: null })}
                              className="mt-6 px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-sm shadow-lg shadow-[var(--primary)]/20 hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-2"
                            >
                              <Plus className="w-4 h-4" /> Create Field
                            </button>
                          )}
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((f, idx) => (
                      <motion.tr
                        key={f.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--muted)]/30 transition-colors"
                      >
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className={cn(
                              "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all",
                              f.is_active
                                ? "bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]"
                                : "bg-[var(--muted)]/50 text-[var(--muted-foreground)]/50"
                            )}>
                              <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-sm sm:text-[15px] font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate max-w-[200px] sm:max-w-none">
                              {f.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const Icon = fieldTypeIcon(f.type);
                              return <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]/60" />;
                            })()}
                            <span className="text-[11px] font-medium text-[var(--muted-foreground)] capitalize">{f.type}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold transition-all",
                            f.is_active
                              ? "bg-emerald-500/10 text-emerald-500 shadow-sm shadow-emerald-500/10"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                          )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", f.is_active ? "bg-emerald-500 animate-pulse" : "bg-[var(--muted-foreground)]/40")} />
                            {f.is_active ? "ACTIVE" : "INACTIVE"}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right">
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-2 sm:group-hover:translate-x-0">
                            <button
                              onClick={() => setModal({ open: true, mode: "edit", initial: f })}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 flex items-center justify-center transition-all active:scale-90"
                            >
                              <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(f.id)}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 flex items-center justify-center transition-all active:scale-90"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
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
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm"
              onClick={() => setDeleteId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[var(--card)] rounded-2xl sm:rounded-[32px] p-6 sm:p-8 max-w-[450px] w-full text-center shadow-2xl relative z-10 border border-[var(--border)] max-h-[90vh] my-8 mx-3 sm:mx-0"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 bg-rose-500/10">
                <Trash2 className="w-7 h-7 sm:w-9 sm:h-9 text-rose-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Are you sure?</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-3 leading-relaxed px-2 sm:px-6">
                This will permanently delete this property and all associated data.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3.5 rounded-xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-semibold text-[11px] uppercase tracking-wider transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId!!)}
                  className="flex-[1.3] py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] uppercase tracking-wider shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
                >
                  Yes, Delete Property
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
