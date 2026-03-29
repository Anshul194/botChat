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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative z-10 w-[520px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="px-10 py-7 border-b border-slate-50 flex items-center justify-between bg-white text-slate-800">
           <h2 className="text-[14px] font-black uppercase tracking-widest ">
             {mode === "create" ? "Initialize IG Variable" : "Modify Attribute"}
           </h2>
           <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 hover:text-rose-500 transition-all">
              <X className="w-6 h-6"/>
           </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto max-h-[75vh] no-scrollbar">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attribute Display Name <span className="text-pink-600">*</span></label>
              <div className="relative group">
                 <input 
                   type="text" 
                   value={form.name} 
                   onChange={e => setForm({...form, name: e.target.value})}
                   placeholder="e.g. Lead Color, User Interest"
                   className="w-full px-8 py-5 rounded-[22px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-pink-500 outline-none transition-all font-black text-[16px] placeholder:text-slate-200"
                 />
                 <Edit3 size={18} className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-100 group-focus-within:text-pink-500 transition-colors"/>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Validation Protocol <span className="text-pink-600">*</span></label>
              <div className="relative group">
                 <select 
                   value={form.type} 
                   onChange={e => setForm({...form, type: e.target.value as any})}
                   className="w-full h-[64px] px-8 rounded-[22px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-pink-500 outline-none transition-all font-black text-[15px] text-slate-800 appearance-none cursor-pointer pr-16"
                 >
                    {VALIDATION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label.toUpperCase()}</option>
                    ))}
                 </select>
                 <div className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none text-slate-200 group-hover:text-pink-500 transition-colors">
                    <SlidersHorizontal size={18}/>
                 </div>
              </div>
              <p className="text-[9px] font-black text-slate-300 ml-1 uppercase tracking-widest leading-none">
                Logic: Filter for {form.type.toUpperCase()} compliance in subscriber capture modules.
              </p>
           </div>

           <div className="flex items-center justify-between py-6 px-10 rounded-[28px] bg-slate-50/50 border border-slate-100">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className={cn("w-2.5 h-2.5 rounded-full", form.is_active ? "bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-slate-200")}/>
                 </div>
                 <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Live Sync Status</span>
              </div>
              <div className="flex items-center gap-4">
                 <div 
                   onClick={() => setForm({...form, is_active: form.is_active ? 0 : 1})}
                   className={cn("w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer shadow-inner", form.is_active ? "bg-pink-600" : "bg-slate-100")}
                 >
                    <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md", form.is_active ? "left-7" : "left-1")}/>
                 </div>
                 <span className="text-[10px] font-black text-slate-300 w-10 ">{form.is_active ? "TRUE" : "FALSE"}</span>
              </div>
           </div>
        </div>

        <div className="px-10 py-8 bg-white border-t border-slate-50 flex gap-4">
           <button onClick={onClose} className="flex-1 py-5 rounded-[22px] bg-slate-50 text-slate-400 font-black text-[12px] uppercase tracking-widest hover:bg-slate-100 transition-all">Abort</button>
           <button 
             onClick={handleSave} 
             disabled={isSaving}
             className="flex-[2] py-5 bg-pink-600 text-white font-black text-[12px] rounded-[22px] shadow-2xl shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest"
           >
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check size={18} strokeWidth={3}/>}
             Deploy Variable
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
  const [modal, setModal] = useState<{open: boolean, mode: "create"|"edit", initial: CustomField|null}>({
    open: false, mode: "create", initial: null
  });
  const [deleteId, setDeleteId] = useState<number|null>(null);

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

  const filtered = fields.filter(f => (f.name||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FDFDFF] dark:bg-[#0f172a] font-sans pb-24">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 sticky top-0 z-40">
         <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <button onClick={()=>router.back()} className="w-12 h-12 rounded-[22px] border border-slate-50 dark:border-slate-800 flex items-center justify-center text-slate-300 hover:text-pink-600 transition-all active:scale-90">
                  <ChevronLeft className="w-6 h-6"/>
               </button>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Instagram Core</p>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-1">Attribute Mapping</h1>
               </div>
            </div>
            <button 
              onClick={() => setModal({open: true, mode: "create", initial: null})}
              className="px-10 py-4 bg-pink-600 text-white font-black text-[12px] rounded-[22px] shadow-2xl shadow-pink-100 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest"
            >
              <Plus className="w-5 h-5"/> Initialize Asset
            </button>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-12 space-y-10">
        <div className="flex items-center justify-between gap-10">
           <div className="bg-white dark:bg-slate-900 px-8 py-4.5 rounded-[22px] border border-slate-50 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"/>
              <span className="text-[12px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{fields.length} Nodes Distributed</span>
           </div>
           <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-pink-500 transition-colors"/>
              <input 
                type="text" placeholder="Lookup Node Mapping..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-4.5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 focus:border-pink-500 outline-none font-black text-[14px] transition-all placeholder:text-slate-200 tracking-tight"
              />
           </div>
           <button onClick={fetchFields} className="w-14 h-14 rounded-full bg-white dark:bg-slate-950 border border-slate-50 dark:border-slate-800 text-slate-200 hover:text-pink-600 flex items-center justify-center transition-all shadow-xs active:scale-90">
              <RefreshCw className={cn("w-6 h-6", isLoading && "animate-spin")}/>
           </button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-50 dark:border-slate-800 shadow-sm overflow-hidden min-w-full">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Category</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validation Type</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-12 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Terminal</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                 {isLoading ? (
                   [1,2,3].map(i => (
                     <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="px-12 py-10"><div className="h-6 w-1/2 bg-slate-50 dark:bg-slate-800 rounded-xl"/></td>
                     </tr>
                   ))
                 ) : filtered.length === 0 ? (
                   <tr>
                      <td colSpan={4} className="py-40 text-center">
                         <div className="w-24 h-24 rounded-[40px] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <Instagram className="w-10 h-10 text-slate-100 dark:text-slate-700"/>
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">System Empty</h3>
                         <p className="text-sm text-slate-400 font-bold mt-3 uppercase tracking-widest italic italic leading-none opacity-60">Initialize your first attribute mapping above.</p>
                      </td>
                   </tr>
                 ) : (
                   filtered.map(f => (
                     <tr key={f.id} className="group hover:bg-slate-50/20 transition-all border-b border-transparent last:border-0">
                        <td className="px-12 py-9">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                                 <Hash size={24}/>
                              </div>
                              <div>
                                <span className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-tighter block">{f.name}</span>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mt-1">ID: CF-{f.id}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-12 py-9">
                           <div className="flex items-center gap-3">
                              {(() => {
                                 const item = VALIDATION_TYPES.find(t=>t.value===f.type);
                                 const Icon = item ? item.icon : Type;
                                 return <Icon size={18} className="text-slate-200"/>;
                              })()}
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{f.type}</span>
                           </div>
                        </td>
                        <td className="px-12 py-9">
                           <div className={cn("inline-flex items-center gap-2.5 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", f.is_active ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 dark:bg-slate-800 text-slate-300 border-transparent")}>
                              <div className={cn("w-2 h-2 rounded-full shadow-sm", f.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400")}/>
                              {f.is_active ? "Live" : "Idle"}
                           </div>
                        </td>
                        <td className="px-12 py-9 text-right">
                           <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button onClick={() => setModal({open: true, mode: "edit", initial: f})} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-pink-600 transition-all flex items-center justify-center shadow-sm"><Edit3 size={18}/></button>
                              <button onClick={() => setDeleteId(f.id)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-300 hover:text-rose-600 transition-all flex items-center justify-center shadow-sm"><Trash2 size={18}/></button>
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
             onClose={() => setModal({open: false, mode: "create", initial: null})}
             onSaved={() => { setModal({open: false, mode: "create", initial: null}); fetchFields(); }}
           />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={()=>setDeleteId(null)}/>
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white dark:bg-slate-900 rounded-[48px] p-12 max-w-sm w-full text-center shadow-2xl relative z-10 border border-slate-100 dark:border-slate-800">
                <Trash2 className="w-16 h-16 text-rose-500 mx-auto mb-8 bg-rose-50 rounded-[28px] p-5"/>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Scrub Asset?</h3>
                <p className="text-[13px] text-slate-400 mt-5 leading-relaxed font-bold uppercase tracking-widest mb-12">Purging this property will remove all associated subscriber data mapped to this IG node.</p>
                <div className="flex gap-4">
                   <button onClick={()=>setDeleteId(null)} className="flex-1 py-5 rounded-[22px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[12px] uppercase">Abort</button>
                   <button onClick={()=>handleDelete(deleteId!!)} className="flex-[1.5] py-5 rounded-[22px] bg-rose-600 text-white font-black text-[12px] shadow-xl shadow-rose-200 active:scale-95 transition-all">Scrub Node</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
