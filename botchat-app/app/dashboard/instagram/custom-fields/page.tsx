"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Plus, Search, Trash2, Edit3, X, Sparkles,
   ChevronLeft, Loader2, Check, RefreshCw,
   Clock, Settings, SlidersHorizontal, Hash, Mail, Phone, Globe, Type,
   Instagram
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
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

// ── Components ────────────────────────────────────────────────────────────────

function CustomFieldModal({ mode, initial, onClose, onSaved }: {
   mode: "create" | "edit"; initial: CustomField | null; onClose: () => void; onSaved: () => void;
}) {
   const [form, setForm] = useState({
      name: initial?.name ?? "",
      type: initial?.type ?? "text",
      is_active: initial?.is_active ?? 1,
      platform: "instagram"
   });
   const [isSaving, setIsSaving] = useState(false);

   const handleSave = async () => {
      if (!form.name.trim()) return toast.error("Field name is required");
      if (!form.type) return toast.error("Please select a field type");

      setIsSaving(true);
      try {
         const payload = { ...form };
         if (mode === "create") {
            await api.post("/instagram/subscriber/custom-fields", payload);
         } else {
            await api.put(`/instagram/subscriber/custom-fields/${initial?.id}`, payload);
         }
         toast.success("Field saved successfully!");
         onSaved();
      } catch (err: any) {
         toast.error(err?.response?.data?.message ?? "Execution failed");
      } finally { setIsSaving(false); }
   };

   return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4">
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm"
            onClick={onClose}
         />

         <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="relative z-10 w-full max-w-none sm:max-w-[650px] min-h-screen sm:min-h-0 bg-[var(--card)] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white dark:border-[var(--border)] max-h-[90vh] my-8"
         >
            {/* Header */}
            <div className="px-10 py-8 border-b border-[var(--border)] dark:border-[var(--border)]/50 flex items-center justify-between bg-[var(--card)] dark:bg-slate-950/20 backdrop-blur-md sticky top-0 z-10">
               <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)] dark:text-white uppercase tracking-tight">
                     {mode === "create" ? "Initialize IG Field" : "Update Attribute"}
                  </h2>
                  <p className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mt-1">Instagram Core Mapping</p>
               </div>
               <button onClick={onClose} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[var(--muted-foreground)]/50 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Form Body */}
            <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh] no-scrollbar">
               {/* Display Name Section */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                     <Type className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                     <label className="text-[12px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Attribute Display Name</label>
                  </div>
                  <div className="relative group">
                     <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Lead Color, User Interest"
                        className="w-full px-7 py-5 rounded-2xl border-2 border-[var(--border)] dark:border-[var(--border)]/50 bg-[var(--muted)]/30 dark:bg-slate-950/30 focus:bg-[var(--card)] dark:focus:bg-[var(--background)] focus:border-[var(--primary)]/50 outline-none transition-all font-bold text-[15px] dark:text-white placeholder:text-[var(--muted-foreground)]/50 dark:placeholder:text-[var(--foreground)] shadow-inner"
                     />
                     <Edit3 className="absolute right-7 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-200 dark:text-[var(--foreground)] group-focus-within:text-[var(--primary)]/80 transition-colors" />
                  </div>
               </div>

               {/* Validation Protocol Section */}
               <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                     <SlidersHorizontal className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                     <label className="text-[12px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Validation Protocol</label>
                  </div>
                  <div className="relative group">
                     <select
                        value={form.type}
                        onChange={e => setForm({ ...form, type: e.target.value as any })}
                        className="w-full h-[68px] px-8 rounded-2xl border-2 border-[var(--border)] dark:border-[var(--border)]/50 bg-[var(--muted)]/30 dark:bg-slate-950/30 focus:bg-[var(--card)] dark:focus:bg-[var(--background)] focus:border-[var(--primary)]/50 outline-none transition-all font-bold text-[14px] text-[var(--foreground)] dark:text-[var(--muted-foreground)]/50 appearance-none cursor-pointer pr-16 shadow-inner"
                     >
                        {VALIDATION_TYPES.map(t => (
                           <option key={t.value} value={t.value} className="bg-[var(--card)]">{t.label} Capture</option>
                        ))}
                     </select>
                     <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]/50 dark:text-[var(--foreground)] group-hover:text-[var(--primary)]/80 transition-colors transform rotate-180">
                        <ChevronLeft className="w-4 h-4 rotate-90" />
                     </div>
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-[var(--primary)]/10/50 dark:bg-pink-900/10 rounded-2xl border border-pink-100/50 dark:border-pink-900/20">
                     <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                     <p className="text-[11px] font-bold text-[var(--primary)]/70 dark:text-[var(--primary)]/70 uppercase tracking-wide">
                        Logic: Filter for <span className="text-[var(--primary)] dark:text-[var(--primary)]/80 font-black">{form.type}</span> compliance.
                     </p>
                  </div>
               </div>

               {/* Live Sync Status */}
               <div className="flex items-center justify-between py-6 px-8 rounded-[24px] bg-[var(--muted)]/30 dark:bg-slate-950/30 border-2 border-[var(--border)] dark:border-[var(--border)]/50 group transition-all hover:bg-[var(--card)] dark:hover:bg-[var(--background)] hover:border-pink-100 dark:hover:border-pink-900/20">
                  <div className="flex items-center gap-4">
                     <div className="relative shadow-lg rounded-full">
                        <div className={cn("w-3 h-3 rounded-full transition-all duration-500", form.is_active ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-[var(--muted)]")} />
                        {form.is_active && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25" />}
                     </div>
                     <span className="text-[13px] font-black text-[var(--foreground)] dark:text-white uppercase tracking-tight">Live Sync Status</span>
                  </div>
                  <div className="flex items-center gap-5">
                     <span className="text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-[0.2em]">{form.is_active ? "Active" : "Paused"}</span>
                     <div
                        onClick={() => setForm({ ...form, is_active: form.is_active ? 0 : 1 })}
                        className={cn(
                           "w-14 h-7 rounded-full relative transition-all duration-500 cursor-pointer overflow-hidden",
                           form.is_active ? "bg-emerald-500" : "bg-[var(--muted)]/80 dark:bg-[var(--muted)]"
                        )}
                     >
                        <div className={cn("absolute top-1 w-5 h-5 rounded-full bg-[var(--card)] transition-all duration-500 shadow-xl", form.is_active ? "left-8" : "left-1")} />
                     </div>
                  </div>
               </div>
            </div>

            {/* Footer Actions */}
            <div className="px-10 py-8 bg-transparent border-t border-[var(--border)] flex gap-4">
               <button onClick={onClose} className="flex-1 py-5 rounded-2xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-bold text-[12px] uppercase tracking-widest transition-all active:scale-95">Cancel</button>
               <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[1.8] py-5 bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-[12px] uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-[var(--primary)]/15 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                  {mode === "create" ? "Initialize Asset" : "Deploy Logic"}
               </button>
            </div>
         </motion.div>
      </div>
   );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function InstagramCustomFieldsPage() {
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
         const res = await api.get("/instagram/subscriber/custom-fields?platform=instagram");
         setFields(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
      } catch { toast.error("Failed to load custom attributes"); }
      finally { setIsLoading(false); }
   };

   useEffect(() => { fetchFields(); }, []);

   const handleDelete = async (id: number) => {
      try {
         await api.delete(`/instagram/subscriber/custom-fields/${id}`);
         toast.success("Attribute Purged");
         setFields(fields.filter(f => f.id !== id));
         setDeleteId(null);
      } catch { toast.error("Purge Error"); }
   };

   const filtered = fields.filter(f => (f.name || "").toLowerCase().includes(search.toLowerCase()));

   return (
      <div className="bg-[var(--background)] pb-24">
         <div className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-[50] shadow-sm">
            <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <button onClick={() => router.back()} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[#db2777] hover:border-[#db2777]/30 hover:bg-[#db2777]/5 transition-all active:scale-90">
                     <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div>
                     <p className="text-[9px] sm:text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest leading-none">Instagram Core</p>
                     <h1 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter mt-1">Attribute Mapping</h1>
                  </div>
               </div>
               <button
                  onClick={() => setModal({ open: true, mode: "create", initial: null })}
                  className="px-10 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-black text-[12px] rounded-xl shadow-2xl shadow-[var(--primary)]/15 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest"
               >
                  <Plus className="w-5 h-5" /> Initialize Asset
               </button>
            </div>
         </div>

         <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-10">
            <div className="flex items-center justify-between gap-10">
               <div className="bg-[var(--card)] px-8 py-3 rounded-xl border border-[var(--border)] dark:border-[var(--border)] shadow-xs flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]/100 animate-pulse" />
                  <span className="text-[12px] font-black text-[var(--foreground)] dark:text-[var(--foreground)] uppercase tracking-widest">{fields.length} Nodes Distributed</span>
               </div>
               <div className="relative flex-1 max-w-xl group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[var(--primary)] transition-colors" />
                  <input
                     type="text" placeholder="Lookup Node Mapping..." value={search} onChange={e => setSearch(e.target.value)}
                     className="w-full pl-16 pr-8 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] dark:border-[var(--border)] focus:border-[var(--primary)] outline-none font-black text-[14px] transition-all placeholder:text-slate-200 tracking-tight"
                  />
               </div>
               <button onClick={fetchFields} className="w-14 h-14 rounded-full bg-[var(--card)] dark:bg-slate-950 border border-[var(--border)] dark:border-[var(--border)] text-slate-200 hover:text-[var(--primary)] flex items-center justify-center transition-all shadow-xs active:scale-90">
                  <RefreshCw className={cn("w-6 h-6", isLoading && "animate-spin")} />
               </button>
            </div>

            <div className="bg-[var(--card)] rounded-[48px] border border-[var(--border)] dark:border-[var(--border)] shadow-sm overflow-hidden min-w-full">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-[var(--muted)]/50 dark:bg-slate-950/20">
                        <th className="px-12 py-8 text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">Asset Category</th>
                        <th className="px-12 py-8 text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">Validation Type</th>
                        <th className="px-12 py-8 text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">Status</th>
                        <th className="px-12 py-8 text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest text-right">Terminal</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                     {isLoading ? (
                        [1, 2, 3].map(i => (
                           <tr key={i} className="animate-pulse">
                              <td colSpan={4} className="px-12 py-10"><div className="h-6 w-1/2 bg-[var(--muted)]/50 dark:bg-[var(--muted)] rounded-xl" /></td>
                           </tr>
                        ))
                     ) : filtered.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="py-40 text-center">
                              <div className="w-24 h-24 rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                 <Instagram className="w-10 h-10 text-slate-100 dark:text-[var(--foreground)]" />
                              </div>
                              <h3 className="text-2xl font-black text-[var(--foreground)] dark:text-white uppercase tracking-tight">System Empty</h3>
                              <p className="text-sm text-[var(--muted-foreground)]/70 font-bold mt-3 uppercase tracking-widest italic italic leading-none opacity-60">Initialize your first attribute mapping above.</p>
                           </td>
                        </tr>
                     ) : (
                        filtered.map(f => (
                           <tr key={f.id} className="group hover:bg-[var(--muted)]/50/20 transition-all border-b border-transparent last:border-0">
                              <td className="px-12 py-9">
                                 <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]/50 group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-sm">
                                       <Hash size={24} />
                                    </div>
                                    <div>
                                       <span className="text-[17px] font-black text-[var(--foreground)] dark:text-white uppercase tracking-tighter block">{f.name}</span>
                                       <span className="text-[9px] font-black text-[var(--muted-foreground)]/50 uppercase tracking-widest block mt-1">ID: CF-{f.id}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-12 py-9">
                                 <div className="flex items-center gap-3">
                                    {(() => {
                                       const item = VALIDATION_TYPES.find(t => t.value === f.type);
                                       const Icon = item ? item.icon : Type;
                                       return <Icon size={18} className="text-slate-200" />;
                                    })()}
                                    <span className="text-[11px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">{f.type}</span>
                                 </div>
                              </td>
                              <td className="px-12 py-9">
                                 <div className={cn("inline-flex items-center gap-2.5 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", f.is_active ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-[var(--muted)]/50 dark:bg-[var(--muted)] text-[var(--muted-foreground)]/50 border-transparent")}>
                                    <div className={cn("w-2 h-2 rounded-full shadow-sm", f.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                                    {f.is_active ? "Live" : "Idle"}
                                 </div>
                              </td>
                              <td className="px-12 py-9 text-right">
                                 <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => setModal({ open: true, mode: "edit", initial: f })} className="w-12 h-12 rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] text-[var(--muted-foreground)]/50 hover:text-[var(--primary)] transition-all flex items-center justify-center shadow-sm"><Edit3 size={18} /></button>
                                    <button onClick={() => setDeleteId(f.id)} className="w-12 h-12 rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] text-[var(--muted-foreground)]/50 hover:text-rose-600 transition-all flex items-center justify-center shadow-sm"><Trash2 size={18} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
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
               <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm shadow-2xl"
                     onClick={() => setDeleteId(null)}
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="bg-[var(--card)] rounded-2xl p-12 max-w-[550px] w-full text-center shadow-3xl relative z-10 border border-white/50 dark:border-[var(--border)] max-h-[90vh] my-8"
                  >
                     <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-6 transition-transform hover:rotate-0">
                        <Trash2 className="w-10 h-10 text-rose-500" />
                     </div>
                     <h3 className="text-[28px] font-black text-[var(--foreground)] dark:text-white uppercase tracking-tighter leading-tight">Are you sure?</h3>
                     <p className="text-[14px] text-[var(--muted-foreground)]/70 dark:text-[var(--muted-foreground)] mt-6 leading-relaxed font-bold uppercase tracking-[0.1em] px-8">
                        Are you absolutely certain you want to <span className="text-rose-500 underline underline-offset-4 decoration-rose-200">Permanently Delete</span> this property?
                     </p>
                     <div className="flex flex-col sm:flex-row gap-4 mt-12">
                        <button
                           onClick={() => setDeleteId(null)}
                           className="flex-1 py-5 rounded-2xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-bold text-[11px] uppercase tracking-widest transition-all"
                        >
                           Abort Mission
                        </button>
                        <button
                           onClick={() => handleDelete(deleteId!!)}
                           className="flex-[1.5] py-5 rounded-2xl bg-rose-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 active:scale-95 transition-all hover:bg-rose-700"
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
