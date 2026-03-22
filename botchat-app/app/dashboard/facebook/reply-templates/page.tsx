"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Trash2, Edit3, X, Sparkles, 
  ChevronLeft, Hash, Loader2, Check, RefreshCw, 
  Clock, Smile, Settings, Eye, EyeOff, MessageCircle, 
  LayoutGrid, Image as ImageIcon, Video, Filter, Info, Send, ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ReplyTemplate {
  id: number;
  name: string;
  reply_type: string;
  message: string;
  image?: string;
  video?: string;
  multiple_reply_enabled: boolean;
  comment_reply_enabled: boolean;
  hide_after_reply: boolean;
  private_template_id: number | null;
  page_id?: string;
  
  // Advanced Fields from Screenshot
  message_type?: "generic" | "filtered";
  hide_comment?: boolean;
  delete_comment?: boolean;
  offensive_keywords?: string;
  offensive_template_id?: string;
  filter_rules?: FilterRule[];
  fallback_message?: string;
  fallback_image?: string;
  fallback_video?: string;
  fallback_template_id?: string;
}

export interface FilterRule {
  id: string;
  name: string;
  match_type: "exact" | "any";
  keywords: string;
  message: string;
  image: string;
  video: string;
  template_id: string;
}

// ── Reusable Field Components ──────────────────────────────────────────────────

function Field({ label, required, children, icon: Icon }: { label: string; required?: boolean; children: React.ReactNode; icon?: any }) {
  return (
    <div className="space-y-2 flex-1 min-w-0">
      <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-indigo-500" />}
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, active, onClick }:{ label:string; active:boolean; onClick:()=>void }){
  return (
    <div className="flex items-center gap-4 group">
      <span className="text-[12px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-tight">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={onClick} className={cn(
          "w-11 h-5 rounded-full relative transition-all duration-200",
          active ? "bg-indigo-600" : "bg-slate-300 shadow-inner"
        )}>
          <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all", active ? "left-6.5" : "left-0.5")}/>
        </button>
        <span className="text-[10px] font-black text-slate-400 w-8 text-center uppercase tracking-widest">{active ? "YES" : "NO"}</span>
      </div>
    </div>
  );
}

function UploadBox({ label, value, onChange, icon: Icon }: { label: string; value: string; onChange: (v: string) => void; icon: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
        toast.success(`${file.name} selected!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const isVideo = label.toLowerCase().includes("video");

  return (
    <div className="space-y-2 flex-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight px-1 flex items-center gap-2">
         <Icon className="w-3.5 h-3.5"/> {label}
      </label>
      <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-white group focus-within:border-indigo-400 overflow-hidden transition-all shadow-xs h-[44px]">
         <input 
           type="file" 
           ref={fileInputRef} 
           className="hidden" 
           accept={isVideo ? "video/*" : "image/*"}
           onChange={handleFileChange}
         />
         <div 
           onClick={() => fileInputRef.current?.click()}
           className="bg-indigo-600 text-white px-5 h-full text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:bg-indigo-700"
         >
           <Plus className="w-4 h-4"/> Upload
         </div>
         <input type="text" placeholder={`Put your ${isVideo ? 'video' : 'image'} URL here or click upload`} value={value} onChange={e=>onChange(e.target.value)}
           className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 px-4 placeholder:text-slate-300"
         />
      </div>
    </div>
  );
}

function CapsuleSwitch({ active }: { active: boolean }) {
  return (
    <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-indigo-600" : "bg-slate-300 shadow-inner")}>
       <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", active ? "left-6.5" : "left-0.5")}/>
    </div>
  );
}

// ── Template Modal ─────────────────────────────────────────────────────────────

export function TemplateFormModal({ mode, initial, onClose, onSaved }:{
  mode:"create"|"edit"; initial:ReplyTemplate|null; onClose:()=>void; onSaved:()=>void;
}) {
  const [form, setForm] = useState<ReplyTemplate>({
    id: initial?.id ?? 0,
    name: initial?.name ?? "",
    reply_type: initial?.reply_type ?? "generic",
    message_type: initial?.message_type ?? "generic",
    message: initial?.message ?? "",
    image: initial?.image ?? "",
    video: initial?.video ?? "",
    multiple_reply_enabled: initial?.multiple_reply_enabled ?? false,
    comment_reply_enabled: initial?.comment_reply_enabled ?? false,
    hide_after_reply: initial?.hide_after_reply ?? true,
    private_template_id: initial?.private_template_id ?? null,
    page_id: initial?.page_id ?? "",
    
    hide_comment: initial?.hide_comment ?? false,
    delete_comment: initial?.delete_comment ?? false,
    offensive_keywords: initial?.offensive_keywords ?? "",
    offensive_template_id: initial?.offensive_template_id ?? "",
    fallback_message: initial?.fallback_message ?? "",
    fallback_image: initial?.fallback_image ?? "",
    fallback_video: initial?.fallback_video ?? "",
    fallback_template_id: initial?.fallback_template_id ?? ""
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>(
    initial?.filter_rules ?? [
      { id: Math.random().toString(), name: "Rule 1", match_type: "any", keywords: "", message: "", image: "", video: "", template_id: "" }
    ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [dropdownTemplates, setDropdownTemplates] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoadingDropdown, setIsLoadingDropdown] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  const fetchDropdown = async () => {
    setIsLoadingDropdown(true);
    try {
      const res = await api.get("/facebook/auto-reply-template");
      setDropdownTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data);
    } catch { toast.error("Failed to load list"); }
    finally { setIsLoadingDropdown(false); }
  };

  const fetchPages = async () => {
    setIsLoadingPages(true);
    try {
      const response = await api.get("/social/facebook-connect");
      if (response.data.success || response.data.is_success) {
        const fetchedAccounts = response.data.data.facebook_accounts || [];
        const fetchedPages = fetchedAccounts.flatMap((acc: any) => acc.pages || []);
        setPages(fetchedPages);
      }
    } catch { toast.error("Failed to load pages"); }
    finally { setIsLoadingPages(false); }
  };

  useEffect(() => { 
    fetchDropdown(); 
    fetchPages();
  }, []);

  const handleAddRule = () => {
    setFilterRules([...filterRules, { 
      id: Math.random().toString(), 
      name: `Rule ${filterRules.length + 1}`, 
      match_type: "any",
      keywords: "", message: "", image: "", video: "", template_id: "" 
    }]);
  };

  const handleSave = async () => {
    if(!form.name.trim()) return toast.error("Campaign name is required");
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        filter_rules: form.message_type === "filtered" ? filterRules : [],
        // Adding the token user provided in postman snippet
        _token: "xPVUKlvKC2lW1ArIjvRCKVyCmJhsoUrUaUyC6bGr"
      };

      if(mode === "create") await api.post("/facebook/auto-reply-template", payload);
      else await api.put(`/facebook/auto-reply-template/${form.id}`, payload);
      
      toast.success("Safe successfully!");
      onSaved();
    } catch(err:any) {
      toast.error(err?.response?.data?.message ?? "Failed to save template");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      
      <motion.div 
        initial={{opacity:0, scale:0.96, y:24}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.96, y:24}}
        className="relative z-10 w-full max-w-[980px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
          <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Create / Edit Auto Reply Template</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF]">
          
          {/* SECTION 1: BASICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-[24px] border border-slate-100 shadow-xs">
            <Field label="Auto Reply Campaign Name" required>
              <input type="text" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px]"
                placeholder="Write your auto reply campaign name here"
              />
            </Field>
            <Field label="Please select a page for auto-reply" required>
              <div className="relative">
                <select 
                  value={form.page_id} 
                  onChange={e => setForm({ ...form, page_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                >
                  <option value="">{isLoadingPages ? "Syncing Pages..." : "Select a page"}</option>
                  {pages.map(p => (
                    <option key={p.id} value={p.page_id}>{p.page_name}</option>
                  ))}
                </select>
                <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400"/>
              </div>
            </Field>
          </div>

          {/* SECTION 2: OFFENSIVE */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <ShieldAlert className="w-4 h-4 text-rose-500"/>
               <h3 className="text-[12px] font-black text-rose-500 uppercase tracking-tight">Offensive Comments Settings</h3>
            </div>
            <div className="flex gap-8">
              <Toggle label="Hide Comment" active={form.hide_comment!!} onClick={()=>setForm({...form, hide_comment:!form.hide_comment})} />
              <Toggle label="Delete Comment" active={form.delete_comment!!} onClick={()=>setForm({...form, delete_comment:!form.delete_comment})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Write down the offensive keywords (comma separated)</label>
                 <div className="relative">
                    <textarea rows={4} value={form.offensive_keywords} onChange={e=>setForm({...form, offensive_keywords:e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px] resize-none"
                      placeholder="keyword1, keyword2..."
                    />
                    <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-slate-300"/>
                 </div>
               </div>
               <div className="space-y-5">
                 <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Select a message template for private reply</label>
                    <div className="flex gap-3 text-[10px] font-extrabold text-indigo-600">
                      <button onClick={fetchDropdown} className="hover:underline flex items-center gap-1">
                         <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")}/> Refresh List
                      </button>
                      <button className="hover:underline">+ Add Message Template</button>
                    </div>
                 </div>
                 <div className="relative">
                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white">
                       <option>Please select a message template</option>
                       {dropdownTemplates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400"/>
                 </div>
               </div>
            </div>
          </div>

          {/* SECTION 3: REPLAY TOGGLES */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-xs grid grid-cols-1 gap-4">
             <div className="flex items-center justify-between py-1 px-1">
                <div className="flex items-center gap-3">
                   <RefreshCw className="w-4 h-4 text-slate-400"/>
                   <span className="text-[13px] font-medium text-slate-600">Do you want to send reply message to a user multiple times?</span>
                </div>
                <Toggle label="" active={form.multiple_reply_enabled} onClick={()=>setForm({...form, multiple_reply_enabled:!form.multiple_reply_enabled})}/>
             </div>
             <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <MessageCircle className="w-4 h-4 text-slate-400"/>
                   <span className="text-[13px] font-medium text-slate-600">Do you want to enable comment reply?</span>
                </div>
                <Toggle label="" active={form.comment_reply_enabled} onClick={()=>setForm({...form, comment_reply_enabled:!form.comment_reply_enabled})}/>
             </div>
             <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <EyeOff className="w-4 h-4 text-slate-400"/>
                   <span className="text-[13px] font-medium text-slate-600">Do you want to hide comments after comment reply?</span>
                </div>
                <Toggle label="" active={form.hide_after_reply} onClick={()=>setForm({...form, hide_after_reply:!form.hide_after_reply})}/>
             </div>
          </div>

          {/* SECTION 4: LOGIC SELECTION */}
          <div className="bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs space-y-5">
             <div className="flex items-center gap-4 cursor-pointer group" onClick={()=>setForm({...form, message_type:"generic"})}>
                <CapsuleSwitch active={form.message_type === "generic"}/>
                <span className={cn("text-[11px] font-black uppercase tracking-widest", form.message_type === "generic" ? "text-indigo-600":"text-slate-400")}>GENERIC MESSAGE FOR ALL</span>
             </div>
             <div className="flex items-center gap-4 cursor-pointer group" onClick={()=>setForm({...form, message_type:"filtered"})}>
                <CapsuleSwitch active={form.message_type === "filtered"}/>
                <span className={cn("text-[11px] font-black uppercase tracking-widest", form.message_type === "filtered" ? "text-indigo-600":"text-slate-400")}>SEND MESSAGE BY FILTERING WORD/SENTENCE</span>
             </div>
          </div>

          {/* SECTION 5: EDITOR */}
          <div className="space-y-8">
             {form.message_type === "generic" ? (
               <div className="bg-white p-7 rounded-[28px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-300">
                  <Field label="Message for Comment Reply" required icon={MessageCircle}>
                    <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-indigo-400 transition-all bg-white">
                       <textarea rows={5} value={form.message} onChange={e=>setForm({...form, message:e.target.value})}
                         className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[120px]" placeholder="Type your message here..."
                       />
                       <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300"/>
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <UploadBox label="Image for Comment Reply" value={form.image!!} onChange={v=>setForm({...form, image:v})} icon={ImageIcon} />
                     <UploadBox label="Video for Comment Reply" value={form.video!!} onChange={v=>setForm({...form, video:v})} icon={Video} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5"/> Select a message template for private reply
                       </label>
                       <div className="flex gap-3 text-[10px] font-extrabold text-indigo-600">
                         <button onClick={fetchDropdown} className="hover:underline flex items-center gap-1">
                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")}/> Refresh List
                         </button>
                         <button className="hover:underline">+ Add Message Template</button>
                       </div>
                    </div>
                    <div className="relative">
                       <select value={form.private_template_id??""} onChange={e=>setForm({...form, private_template_id: parseInt(e.target.value) || null})}
                         className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                       >
                          <option value="">Please select a message template</option>
                          {dropdownTemplates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                       <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400"/>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="space-y-8 animate-in fade-in duration-300">
                  {filterRules.map((rule, idx) => (
                    <div key={rule.id} className="bg-white p-7 rounded-[28px] border border-slate-200 shadow-sm space-y-8 relative group">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="flex items-center gap-3 cursor-pointer" onClick={()=>setFilterRules(filterRules.map(r=>r.id===rule.id ? {...r, match_type:"exact"}:r))}>
                               <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-indigo-600 bg-indigo-600":"border-slate-300")}>
                                  {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                               </div>
                               <span className={cn("text-[9px] font-bold uppercase tracking-widest", rule.match_type === "exact" ? "text-slate-800":"text-slate-400")}>REPLY IF THE FILTER WORD EXACTLY MATCHES</span>
                             </div>
                             <div className="flex items-center gap-3 cursor-pointer" onClick={()=>setFilterRules(filterRules.map(r=>r.id===rule.id ? {...r, match_type:"any"}:r))}>
                               <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "any" ? "border-indigo-600 bg-indigo-600":"border-slate-300")}>
                                  {rule.match_type === "any" && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                               </div>
                               <span className={cn("text-[9px] font-bold uppercase tracking-widest", rule.match_type === "any" ? "text-slate-800":"text-slate-400")}>REPLY IF ANY MATCHES OCCURS WITH FILTER WORD</span>
                             </div>
                          </div>
                          {filterRules.length > 1 && (
                            <button onClick={()=>setFilterRules(filterRules.filter(r=>r.id!==rule.id))} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                               <Trash2 className="w-4 h-4"/>
                            </button>
                          )}
                       </div>

                       <Field label="Filter Word/Sentence" required>
                          <input type="text" value={rule.keywords} onChange={e=>setFilterRules(filterRules.map(r=>r.id===rule.id ? {...r, keywords:e.target.value}:r))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px]"
                            placeholder="Write your filter word here"
                          />
                       </Field>

                       <Field label="Message for Comment Reply" required icon={MessageCircle}>
                          <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-indigo-400 transition-all bg-white">
                             <textarea rows={4} value={rule.message} onChange={e=>setFilterRules(filterRules.map(r=>r.id===rule.id ? {...r, message:e.target.value}:r))}
                               className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                             />
                             <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300"/>
                          </div>
                       </Field>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <UploadBox label="Image for Comment Reply" value={rule.image} onChange={v=>setFilterRules(filterRules.map(r=>r.id===rule.id ? {...r, image:v}:r))} icon={ImageIcon} />
                          <UploadBox label="Video for Comment Reply" value={rule.video} onChange={v=>setFilterRules(filterRules.map(r=>r.id===rule.id ? {...r, video:v}:r))} icon={Video} />
                       </div>

                       <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                           <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-2">
                              <Settings className="w-3.5 h-3.5"/> Select a message template for private reply
                           </label>
                           <div className="flex gap-3 text-[10px] font-extrabold text-indigo-600">
                             <button onClick={fetchDropdown} className="hover:underline flex items-center gap-1">
                               <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")}/> Refresh List
                             </button>
                             <button className="hover:underline">+ Add Message Template</button>
                           </div>
                        </div>
                        <div className="relative">
                          <select value={rule.template_id} onChange={e=>setFilterRules(filterRules.map(r=>r.id===rule.id ? {...r, template_id:e.target.value}:r))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                          >
                             <option value="">Please select a message template</option>
                             {dropdownTemplates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400"/>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end">
                    <button onClick={handleAddRule} className="px-6 py-2.5 rounded-xl border-2 border-indigo-600 text-indigo-600 font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-indigo-100/20">
                       <Plus className="w-4 h-4"/> Add more filtering
                    </button>
                  </div>

                  {/* Fallback */}
                  <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-200 border-dashed space-y-8">
                     <div className="flex items-center gap-3">
                        <Info className="w-4 h-4 text-slate-400"/>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">Comment Reply if no Matching Found (Fallback)</span>
                     </div>
                     <Field label="Message for Comment Reply" icon={MessageCircle}>
                        <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-indigo-400 transition-all bg-white">
                           <textarea rows={4} value={form.fallback_message} onChange={e=>setForm({...form, fallback_message:e.target.value})}
                             className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                           />
                           <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300"/>
                        </div>
                     </Field>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <UploadBox label="Image for Comment Reply" value={form.fallback_image!!} onChange={v=>setForm({...form, fallback_image:v})} icon={ImageIcon} />
                        <UploadBox label="Video for Comment Reply" value={form.fallback_video!!} onChange={v=>setForm({...form, fallback_video:v})} icon={Video} />
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                           <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-2">
                              <Settings className="w-3.5 h-3.5"/> Select a message template for private reply (Fallback)
                           </label>
                           <div className="flex gap-3 text-[10px] font-extrabold text-indigo-600">
                             <button onClick={fetchDropdown} className="hover:underline flex items-center gap-1">
                               <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")}/> Refresh List
                             </button>
                             <button className="hover:underline">+ Add Message Template</button>
                           </div>
                        </div>
                        <div className="relative">
                          <select value={form.fallback_template_id} onChange={e=>setForm({...form, fallback_template_id:e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                          >
                             <option value="">Please select a message template</option>
                             {dropdownTemplates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400"/>
                        </div>
                      </div>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="flex gap-4 p-8 bg-white border-t border-slate-100 flex-shrink-0">
           <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">Cancel</button>
           <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-indigo-600 text-white font-black text-[13px] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-5 h-5"/>}
              <span>SAVE CHANGES</span>
           </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Dashboard View ─────────────────────────────────────────────────────────────

export default function ReplyTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ReplyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState<{open:boolean; mode:"create"|"edit"; template:ReplyTemplate|null}>({
    open: false, mode: "create", template: null
  });
  const [deleteId, setDeleteId] = useState<number|null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/facebook/auto-reply-template");
      setTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data);
    } catch { toast.error("Failed to load templates"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id:number) => {
    try {
      await api.delete(`/facebook/auto-reply-template/${id}`);
      toast.success("Safe successfully!");
      setTemplates(templates.filter(t=>t.id!==id));
      setDeleteId(null);
    } catch { toast.error("Delete failed"); }
  };

  const filtered = templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f172a] font-sans pb-20">
      {/* 1. Header Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center sticky top-0 z-40 shadow-xs">
         <div className="max-w-[1400px] w-full px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-5">
               <button onClick={()=>router.back()} className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
                  <ChevronLeft className="w-5 h-5"/>
               </button>
               <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Reply Templates</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Facebook Automation Hub</p>
               </div>
            </div>
            <button onClick={()=>setFormModal({open:true, mode:"create", template:null})} className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-[12px] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2">
               <Plus className="w-5 h-5"/> NEW TEMPLATE
            </button>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-8">
        {/* Search controls */}
        <div className="flex items-center justify-between gap-6">
           <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              <span className="text-[13px] font-black text-slate-800">{templates.length} <span className="text-slate-400 ml-1">Total Active</span></span>
           </div>
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input type="text" placeholder="Search templates…" value={search} onChange={e=>setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-indigo-400 outline-none shadow-sm font-medium transition-all"
              />
           </div>
        </div>

        {/* List View */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
           <div className="grid grid-cols-[2fr_1fr_1.5fr_100px] gap-8 px-10 py-5 bg-slate-50/50 border-b border-slate-50">
              {["Template Name","Logic Type","Last Sync","Actions"].map(h=>(
                <span key={h} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
              ))}
           </div>
           
           {isLoading ? (
             <div className="p-20 text-center flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400"/>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Compiling Database...</p>
             </div>
           ) : filtered.length === 0 ? (
             <div className="p-24 text-center">
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto mb-6">
                   <Settings className="w-10 h-10 text-slate-200"/>
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Empty Inventory</h3>
                <p className="text-sm text-slate-400 italic mt-2">Initialize your first auto-reply preset using the 'New' button.</p>
             </div>
           ) : (
             <div className="divide-y divide-slate-50">
               {filtered.map(t=>(
                 <div key={t.id} className="grid grid-cols-[2fr_1fr_1.5fr_100px] gap-8 px-10 py-6 items-center hover:bg-slate-50/30 transition-all group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-[22px] bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                          <LayoutGrid className="w-6 h-6"/>
                       </div>
                       <span className="text-[16px] font-bold text-slate-900">{t.name}</span>
                    </div>
                    <span className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight w-fit", t.reply_type==="filtered"?"bg-purple-50 text-purple-600":"bg-blue-50 text-blue-600")}>
                       {t.reply_type}
                    </span>
                    <span className="text-[13px] font-medium text-slate-400 flex items-center gap-2">
                       <Clock className="w-4 h-4"/> Nov 22, 2026
                    </span>
                    <div className="flex items-center gap-2">
                       <button onClick={()=>setFormModal({open:true, mode:"edit", template:t})} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90">
                          <Edit3 className="w-4 h-4"/>
                       </button>
                       <button onClick={()=>setDeleteId(t.id)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90">
                          <Trash2 className="w-4 h-4"/>
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      <AnimatePresence>
        {formModal.open && (
           <TemplateFormModal 
             mode={formModal.mode} 
             initial={formModal.template} 
             onClose={()=>setFormModal({open:false, mode:"create", template:null})}
             onSaved={()=>{setFormModal({open:false, mode:"create", template:null}); fetchItems();}}
           />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100">
                <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6"/>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Scrub Item?</h3>
                <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">This command will permanently remove the template from the automation hub.</p>
                <div className="flex gap-4 mt-10">
                   <button onClick={()=>setDeleteId(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[13px]">ABORT</button>
                   <button onClick={()=>handleDelete(deleteId)} className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black text-[13px] shadow-xl shadow-rose-100">CONFIRM</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
