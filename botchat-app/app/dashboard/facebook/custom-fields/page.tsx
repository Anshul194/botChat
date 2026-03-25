"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Trash2, Edit3, X, Sparkles, 
  ChevronLeft, Loader2, Check, RefreshCw, 
  Clock, Settings, SlidersHorizontal, Hash, Mail, Phone, Globe, Type
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative z-10 w-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-10 py-7 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
           <h2 className="text-[15px] font-semibold text-slate-800 ">
             {mode === "create" ? "Define Meta Variable" : "Edit Property"}
           </h2>
           <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <X className="w-5 h-5"/>
           </button>
        </div>

        <div className="p-10 space-y-12 overflow-y-auto max-h-[75vh] no-scrollbar">
           <div className="space-y-4">
              <label className="text-[11px] font-medium text-slate-500 ml-1">Field Display Name</label>
              <div className="relative group">
                 <input 
                   type="text" 
                   value={form.name} 
                   onChange={e => setForm({...form, name: e.target.value})}
                   placeholder="e.g. Birthdate, Favorite Color"
                   className="w-full px-7 py-5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all font-bold text-[16px] placeholder:text-slate-300 pr-16"
                 />
                 <Edit3 className="absolute right-7 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-200 group-focus-within:text-pink-400 transition-colors"/>
              </div>
           </div>

           <div className="space-y-4">
              <label className="text-[11px] font-medium text-slate-500 ml-1">Data Validation Type</label>
              <div className="relative group">
                 <select 
                   value={form.type} 
                   onChange={e => setForm({...form, type: e.target.value as any})}
                   className="w-full h-[64px] px-8 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all font-bold text-[15px] text-slate-700 appearance-none cursor-pointer pr-16"
                 >
                    {VALIDATION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                 </select>
                 <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-pink-400 transition-colors">
                    <SlidersHorizontal className="w-4.5 h-4.5"/>
                 </div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500  ml-1 italic opacity-60">
                Rule: Only {form.type.toUpperCase()} data formats will be accepted in subscriber inputs.
              </p>
           </div>

           <div className="flex items-center justify-between py-6 px-8 rounded-2xl bg-slate-50/50 border border-slate-100 group">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className={cn("w-2.5 h-2.5 rounded-full", form.is_active ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-slate-300")}/>
                    {form.is_active && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"/>}
                 </div>
                 <span className="text-[13px] font-semibold text-slate-800 ">Active Status</span>
              </div>
              <div className="flex items-center gap-4">
                 <div 
                   onClick={() => setForm({...form, is_active: form.is_active ? 0 : 1})}
                   className={cn(
                     "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer shadow-inner",
                     form.is_active ? "bg-pink-600" : "bg-slate-200"
                   )}
                 >
                   <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md", form.is_active ? "left-7" : "left-1")}/>
                 </div>
                 <span className="text-[11px] font-semibold text-slate-500 w-10 ">{form.is_active ? "YES" : "NO"}</span>
              </div>
           </div>
        </div>

        <div className="px-10 py-8 bg-white border-t border-slate-50 flex gap-6">
           <button onClick={onClose} className="flex-1 py-5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold text-[13px] transition-all ">Discard</button>
           <button 
             onClick={handleSave} 
             disabled={isSaving}
             className="flex-[1.5] py-5 bg-pink-600 text-white font-semibold text-[13px] rounded-xl shadow-2xl shadow-pink-100 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3  disabled:opacity-50"
           >
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-5 h-5"/>}
             Initialize Field
           </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CustomFieldsPage() {
  const router = useRouter();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{open: boolean, mode: "create"|"edit", initial: CustomField|null}>({
    open: false, mode: "create", initial: null
  });
  const [deleteId, setDeleteId] = useState<number|null>(null);

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
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#0f172a] font-sans pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 transition-all">
         <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <button onClick={()=>router.back()} className="w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:border-pink-100 transition-all active:scale-90">
                  <ChevronLeft className="w-6 h-6"/>
               </button>
               <div>
                  <h1 className="text-2xl font-semibold text-slate-900 ">Custom Fields</h1>
                  <p className="text-[10px] font-bold text-slate-400  mt-1.5 flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5"/> Meta Identity Variables
                  </p>
               </div>
            </div>
            <button 
              onClick={() => setModal({open: true, mode: "create", initial: null})}
              className="px-8 py-4 bg-pink-600 text-white font-semibold text-[13px] rounded-xl shadow-2xl shadow-pink-100 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-3 "
            >
              <Plus className="w-5 h-5"/> Define Field
            </button>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-10">
        
        {/* Search controls */}
        <div className="flex items-center justify-between gap-8">
           <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 px-8">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"/>
              <span className="text-[13px] font-semibold text-slate-800 ">{fields.length} <span className="text-slate-400 ml-1">Properties Defined</span></span>
           </div>
           <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-pink-500 transition-colors"/>
              <input 
                type="text" 
                placeholder="Lookup property by name…" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-4.5 rounded-2xl bg-white border border-slate-100 shadow-xs focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none font-medium transition-all text-sm"
              />
           </div>
           <button onClick={fetchFields} className="p-4.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-pink-600 hover:border-pink-100 transition-all shadow-xs active:scale-90">
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")}/>
           </button>
        </div>

        {/* List Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto min-w-full">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-50 bg-slate-50/30">
                    <th className="px-10 py-6 text-[11px] font-medium text-slate-500">Variable Property</th>
                    <th className="px-10 py-6 text-[11px] font-medium text-slate-500">Validator Type</th>
                    <th className="px-10 py-6 text-[11px] font-medium text-slate-500">Status</th>
                    <th className="px-10 py-6 text-[11px] font-medium text-slate-500 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 <AnimatePresence mode="popLayout">
                 {isLoading ? (
                   [1,2,3,4,5].map(i => (
                     <tr key={i} className="animate-pulse border-b border-slate-50/50">
                        <td colSpan={4} className="px-10 py-8">
                           <div className="h-6 w-1/3 bg-slate-100 rounded-lg"/>
                        </td>
                     </tr>
                   ))
                 ) : filtered.length === 0 ? (
                   <tr>
                      <td colSpan={4} className="py-40 text-center">
                         <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Sparkles className="w-8 h-8 text-slate-200"/>
                         </div>
                         <h3 className="text-[18px] font-semibold text-slate-800 ">No Variables Defined</h3>
                         <p className="text-sm text-slate-400 font-medium mt-2">Create your first custom field to start tracking subscriber data.</p>
                      </td>
                   </tr>
                 ) : (
                   filtered.map(f => (
                     <motion.tr 
                       key={f.id}
                       layout
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                     >
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-4">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:bg-pink-600 group-hover:text-white", f.is_active ? "bg-slate-50 text-slate-400" : "bg-slate-100 text-slate-300")}>
                                 <Hash className="w-5 h-5"/>
                              </div>
                              <span className="text-[15px] font-bold text-slate-700 tracking-tight group-hover:text-pink-700 transition-colors">{f.name}</span>
                           </div>
                        </td>
                        <td className="px-10 py-7">
                           <div className="flex items-center gap-2.5">
                              {(() => {
                                 const item = VALIDATION_TYPES.find(t=>t.value===f.type);
                                 const Icon = item ? item.icon : Type;
                                 return <Icon className="w-4 h-4 text-slate-300"/>;
                              })()}
                              <span className="text-[11px] font-semibold  text-slate-500">{f.type}</span>
                           </div>
                        </td>
                        <td className="px-10 py-7">
                           <div className={cn(
                             "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold  transition-all",
                             f.is_active ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100" : "bg-slate-100 text-slate-400 shadow-inner"
                           )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full", f.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300")}/>
                              {f.is_active ? "ACTIVE" : "INACTIVE"}
                           </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button 
                                onClick={() => setModal({open: true, mode: "edit", initial: f})}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-pink-600 hover:border-pink-100 flex items-center justify-center transition-all shadow-sm"
                              >
                                 <Edit3 className="w-4 h-4"/>
                              </button>
                              <button 
                                onClick={() => setDeleteId(f.id)}
                                className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 flex items-center justify-center transition-all shadow-sm"
                              >
                                 <Trash2 className="w-4 h-4"/>
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
      </div>

      <AnimatePresence>
        {modal.open && (
           <CustomFieldModal 
             mode={modal.mode} 
             initial={modal.initial} 
             onClose={() => setModal({open: false, mode: "create", initial: null})}
             onSaved={() => { setModal({open: false, mode: "create", initial: null}); fetchFields(); }}
           />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-2xl p-12 max-w-sm w-full text-center shadow-2xl border border-slate-100">
                <Trash2 className="w-16 h-16 text-rose-500 mx-auto mb-8 bg-rose-50 rounded-2xl p-4.5"/>
                <h3 className="text-2xl font-semibold text-slate-900  leading-none">Scrub Property?</h3>
                <p className="text-[13px] text-slate-400 mt-5 leading-relaxed font-semibold italic">Purging this field will remove all associated subscriber data for this property.</p>
                <div className="flex gap-4 mt-12">
                   <button onClick={()=>setDeleteId(null)} className="flex-1 py-4.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[13px] ">Abort</button>
                   <button onClick={()=>handleDelete(deleteId!!)} className="flex-[1.5] py-4.5 rounded-2xl bg-rose-600 text-white font-semibold text-[13px] shadow-xl shadow-rose-200 active:scale-95 transition-all ">Confirm</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
