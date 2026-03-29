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
  multiple_reply_enabled: boolean | string | number;
  comment_reply_enabled: boolean | string | number;
  hide_after_reply: boolean | string | number;
  private_template_id: string;
  page_id?: string;

  // Advanced Fields
  message_type?: "generic" | "filtered" | "filter";
  hide_comment?: boolean;
  delete_comment?: boolean;
  offensive_keywords?: string;
  offensive_template_id?: string;
  filter_rules?: FilterRule[];
  fallback_message?: string;
  fallback_image?: string;
  fallback_video?: string;
  fallback_template_id?: string;

  // Nested offensive object returned by GET API
  offensive?: {
    id?: number;
    hide_comment?: string | number | boolean;
    delete_comment?: string | number | boolean;
    offensive_keywords?: string;
    private_reply_template_id?: string | null;
  };
}

export interface FilterRule {
  id: string;
  name: string;
  match_type: "exact" | "contains";
  keywords: string;
  message: string;
  image: string;
  video: string;
  template_id: string;
}

// ── Reusable Field Components ──────────────────────────────────────────────────

function Field({ label, required, children, icon: Icon }: { label: string; required?: boolean; children: React.ReactNode; icon?: any }) {
  return (
    <div className="space-y-1.5 flex-1 min-w-0">
      <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 group">
      {label && <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>}
      <div className="flex items-center gap-2">
        <button onClick={onClick} className={cn(
          "w-10 h-5 rounded-full relative transition-all duration-200",
          active ? "bg-pink-500" : "bg-slate-200"
        )}>
          <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", active ? "left-5.5" : "left-0.5")} />
        </button>
        <span className="text-xs font-medium text-slate-400 w-6">{active ? "On" : "Off"}</span>
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
      <label className="text-[11px] font-bold text-slate-500  px-1 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-white group focus-within:border-pink-400 overflow-hidden transition-all shadow-xs h-[44px]">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={isVideo ? "video/*" : "image/*"}
          onChange={handleFileChange}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-pink-600 text-white px-5 h-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:bg-pink-700"
        >
          <Plus className="w-4 h-4" /> Upload
        </div>
        <input type="text" placeholder={`Put your ${isVideo ? 'video' : 'image'} URL here or click upload`} value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 px-4 placeholder:text-slate-300"
        />
      </div>
    </div>
  );
}

function CapsuleSwitch({ active }: { active: boolean }) {
  return (
    <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-pink-600" : "bg-slate-300 shadow-inner")}>
      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", active ? "left-6.5" : "left-0.5")} />
    </div>
  );
}

// ── Template Modal ─────────────────────────────────────────────────────────────

export function TemplateFormModal({ mode, initial, onClose, onSaved }: {
  mode: "create" | "edit"; initial: ReplyTemplate | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<ReplyTemplate>({
    id: initial?.id ?? 0,
    name: initial?.name ?? "",
    reply_type: initial?.reply_type ?? "generic",
    // reply_type from API is the message_type
    message_type: (initial?.reply_type ?? initial?.message_type ?? "generic") as "generic" | "filtered" | "filter",
    message: initial?.message ?? "",
    image: initial?.image ?? "",
    video: initial?.video ?? "",
    // API returns these as strings "0"/"1"
    multiple_reply_enabled: (initial as any)?.multiple_reply_enabled === "1" || (initial as any)?.multiple_reply_enabled === true || (initial as any)?.multiple_reply_enabled === 1,
    comment_reply_enabled: (initial as any)?.comment_reply_enabled === "1" || (initial as any)?.comment_reply_enabled === true || (initial as any)?.comment_reply_enabled === 1,
    hide_after_reply: (initial as any)?.hide_after_reply === "1" || (initial as any)?.hide_after_reply === true || (initial as any)?.hide_after_reply === 1,
    private_template_id: initial?.private_template_id ? String(initial.private_template_id) : "",
    page_id: initial?.page_id ?? "",

    // Offensive - reads from nested `offensive` object returned by GET
    hide_comment: initial?.offensive?.hide_comment === "1" || initial?.offensive?.hide_comment === 1 || !!initial?.hide_comment,
    delete_comment: initial?.offensive?.delete_comment === "1" || initial?.offensive?.delete_comment === 1 || !!initial?.delete_comment,
    offensive_keywords: initial?.offensive?.offensive_keywords ?? initial?.offensive_keywords ?? "",
    offensive_template_id: initial?.offensive?.private_reply_template_id ? String(initial.offensive.private_reply_template_id) : (initial?.offensive_template_id ? String(initial.offensive_template_id) : ""),

    fallback_message: "",
    fallback_image: "",
    fallback_video: "",
    fallback_template_id: ""
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>(
    // API returns filter rules under "rules" key
    (initial as any)?.rules?.length
      ? (initial as any).rules.map((r: any) => ({
        id: r.id?.toString() ?? Math.random().toString(),
        name: r.name ?? "",
        match_type: r.match_type ?? "contains",
        keywords: r.keyword ?? r.keywords ?? "",
        message: r.message ?? "",
        image: r.image ?? "",
        video: r.video ?? "",
        template_id: r.private_template_id ? String(r.private_template_id) : (r.template_id ? String(r.template_id) : ""),
      }))
      : initial?.filter_rules?.length
        ? initial.filter_rules
        : [{ id: Math.random().toString(), name: "Rule 1", match_type: "contains", keywords: "", message: "", image: "", video: "", template_id: "" }]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [dropdownTemplates, setDropdownTemplates] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoadingDropdown, setIsLoadingDropdown] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  const fetchDropdown = async (pageId?: string) => {
    const targetPageId = pageId || form.page_id;
    if (!targetPageId) {
      setDropdownTemplates([]);
      return;
    }
    setIsLoadingDropdown(true);
    try {
      const res = await api.get(`/facebook/bot-replies?page_id=${targetPageId}`);
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
    if (form.page_id) {
      fetchDropdown();
    } else {
      setDropdownTemplates([]);
    }
  }, [form.page_id]);

  useEffect(() => {
    fetchPages();
  }, []);

  const handleAddRule = () => {
    setFilterRules([...filterRules, {
      id: Math.random().toString(),
      name: `Rule ${filterRules.length + 1}`,
      match_type: "contains",
      keywords: "", message: "", image: "", video: "", template_id: ""
    }]);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Campaign name is required");
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("platform", "facebook");
      fd.append("name", form.name);
      fd.append("page_id", form.page_id ?? "");
      
      // Standardize reply_type to 'filter' for keyword logic as per CURL
      const apiReplyType = form.message_type === "filter" ? "filter" : "generic";
      fd.append("reply_type", apiReplyType);
      
      fd.append("comment_reply_enabled", form.comment_reply_enabled ? "1" : "0");
      fd.append("hide_after_reply", form.hide_after_reply ? "1" : "0");
      fd.append("multiple_reply_enabled", form.multiple_reply_enabled ? "1" : "0");

      // Main message / Fallback message (unified)
      fd.append("message", form.message || "");
      fd.append("image", form.image || "");
      fd.append("video", form.video || "");
      fd.append("private_template_id", form.private_template_id || "");

      // Offensive block with bracket notation (As per CURL)
      fd.append("offensive[hide_comment]", form.hide_comment ? "1" : "0");
      fd.append("offensive[delete_comment]", form.delete_comment ? "1" : "0");
      fd.append("offensive[offensive_keywords]", form.offensive_keywords ?? "");
      fd.append("offensive[private_reply_template_id]", form.offensive_template_id ?? "");

      // Filter rules using exact CURL structure: rules[i][key]
      if (form.message_type === "filter") {
        filterRules.forEach((rule, i) => {
          fd.append(`rules[${i}][keyword]`, rule.keywords || "");
          fd.append(`rules[${i}][match_type]`, rule.match_type || "contains");
          fd.append(`rules[${i}][message]`, rule.message || "");
          fd.append(`rules[${i}][image]`, rule.image || "");
          fd.append(`rules[${i}][video]`, rule.video || "");
          fd.append(`rules[${i}][private_template_id]`, rule.template_id || "");
        });
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (mode === "create") {
        await api.post("/facebook/auto-reply-template", fd, config);
      } else {
        // Laravel doesn't support PUT with multipart/form-data — spoof via _method
        fd.append("_method", "PUT");
        await api.post(`/facebook/auto-reply-template/${form.id}`, fd, config);
      }

      toast.success("Saved successfully!");
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save template");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
        className="relative z-10 w-full max-w-[980px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
          <h2 className="text-[13px] font-semibold text-slate-800">Create / Edit Auto Reply Template</h2>
          <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF]">

          {/* SECTION 1: BASICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <Field label="Auto Reply Campaign Name" required>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                placeholder="Write your auto reply campaign name here"
              />
            </Field>
            <Field label="Please select a page for auto-reply" required>
              <div className="relative">
                <select
                  value={form.page_id}
                  onChange={e => setForm({ ...form, page_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                >
                  <option value="">{isLoadingPages ? "Syncing Pages..." : "Select a page"}</option>
                  {pages.map(p => (
                    <option key={p.id} value={p.page_id}>{p.page_name}</option>
                  ))}
                </select>
                <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400" />
              </div>
            </Field>
          </div>

          {/* SECTION 2: OFFENSIVE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-slate-700">Offensive Comments Settings</h3>
            </div>
            <div className="flex gap-8">
              <Toggle label="Hide Comment" active={form.hide_comment!!} onClick={() => setForm({ ...form, hide_comment: !form.hide_comment })} />
              <Toggle label="Delete Comment" active={form.delete_comment!!} onClick={() => setForm({ ...form, delete_comment: !form.delete_comment })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Offensive keywords <span className="text-slate-400 font-normal">(comma separated)</span></label>
                <div className="relative">
                  <textarea rows={4} value={form.offensive_keywords} onChange={e => setForm({ ...form, offensive_keywords: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] resize-none"
                    placeholder="keyword1, keyword2..."
                  />
                  <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-slate-300" />
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-medium text-slate-600">Private reply template</label>
                  <div className="flex gap-3 text-xs font-medium text-pink-500">
                    <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                      <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                    </button>
                    <button onClick={() => window.location.href = "/dashboard/facebook/bot-replies"} className="hover:underline">+ Add Message Template</button>
                  </div>
                </div>
                <div className="relative">
                  <select 
                    value={form.offensive_template_id}
                    onChange={e => setForm({ ...form, offensive_template_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                  >
                    <option value="">Please select a message template</option>
                    {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: REPLAY TOGGLES */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span className="text-[13px] font-medium text-slate-600">Do you want to send reply message to a user multiple times?</span>
              </div>
              <Toggle label="" active={!!form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
            </div>
            <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-slate-400" />
                <span className="text-[13px] font-medium text-slate-600">Do you want to enable comment reply?</span>
              </div>
              <Toggle label="" active={!!form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
            </div>
            <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span className="text-[13px] font-medium text-slate-600">Do you want to hide comments after comment reply?</span>
              </div>
              <Toggle label="" active={!!form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
            </div>
          </div>

          {/* SECTION 4: LOGIC SELECTION */}
          <div className="bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, message_type: "generic" })}>
              <CapsuleSwitch active={form.message_type === "generic"} />
              <span className={cn("text-sm font-medium", form.message_type === "generic" ? "text-pink-600" : "text-slate-400")}>Generic message for all comments</span>
            </div>
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, message_type: "filter" })}>
              <CapsuleSwitch active={form.message_type === "filter"} />
              <span className={cn("text-sm font-medium", form.message_type === "filter" ? "text-pink-600" : "text-slate-400")}>Send different messages by keyword filter</span>
            </div>
          </div>

          {/* SECTION 5: EDITOR */}
          <div className="space-y-8">
            {form.message_type === "generic" ? (
              <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-300">
                <Field label="Message for Comment Reply" required icon={MessageCircle}>
                  <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                    <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[120px]" placeholder="Type your message here..."
                    />
                    <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                  </div>
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <UploadBox label="Image for Comment Reply" value={form.image!!} onChange={v => setForm({ ...form, image: v })} icon={ImageIcon} />
                  <UploadBox label="Video for Comment Reply" value={form.video!!} onChange={v => setForm({ ...form, video: v })} icon={Video} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template
                    </label>
                    <div className="flex gap-3 text-xs font-medium text-pink-500">
                      <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                        <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                      </button>
                      <button onClick={() => window.location.href = "/dashboard/facebook/bot-replies"} className="hover:underline">+ Add Message Template</button>
                    </div>
                  </div>
                  <div className="relative">
                    <select value={form.private_template_id} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Please select a message template</option>
                      {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                {filterRules.map((rule, idx) => (
                  <div key={rule.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-8 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "exact" } : r))}>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                            {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={cn("text-xs font-medium", rule.match_type === "exact" ? "text-slate-700" : "text-slate-400")}>Exact match</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "contains" } : r))}>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                            {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={cn("text-xs font-medium", rule.match_type === "contains" ? "text-slate-700" : "text-slate-400")}>Contains word</span>
                        </div>
                      </div>
                      {filterRules.length > 1 && (
                        <button onClick={() => setFilterRules(filterRules.filter(r => r.id !== rule.id))} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <Field label="Filter Word/Sentence" required>
                      <input type="text" value={rule.keywords} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, keywords: e.target.value } : r))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                        placeholder="Write your filter word here"
                      />
                    </Field>

                    <Field label="Message for Comment Reply" required icon={MessageCircle}>
                      <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                        <textarea rows={4} value={rule.message} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, message: e.target.value } : r))}
                          className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                        />
                        <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <UploadBox label="Image for Comment Reply" value={rule.image} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, image: v } : r))} icon={ImageIcon} />
                      <UploadBox label="Video for Comment Reply" value={rule.video} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, video: v } : r))} icon={Video} />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template
                        </label>
                        <div className="flex gap-3 text-xs font-medium text-pink-500">
                          <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                          </button>
                          <button onClick={() => window.location.href = "/dashboard/facebook/bot-replies"} className="hover:underline">+ Add Message Template</button>
                        </div>
                      </div>
                      <div className="relative">
                        <select value={rule.template_id} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, template_id: e.target.value } : r))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                        >
                          <option value="">Please select a message template</option>
                          {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400" />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button onClick={handleAddRule} className="px-6 py-2.5 rounded-xl border-2 border-pink-600 text-pink-600 font-semibold text-[11px]  hover:bg-pink-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-pink-100/20">
                    <Plus className="w-4 h-4" /> Add another filter rule
                  </button>
                </div>

                {/* Fallback */}
                <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200 border-dashed space-y-8">
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-500">Fallback reply (when no filter matches)</span>
                  </div>
                  <Field label="Message for Comment Reply" icon={MessageCircle}>
                    <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                      <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                        className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                      />
                      <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <UploadBox label="Image for Comment Reply" value={form.image!!} onChange={v => setForm({ ...form, image: v })} icon={ImageIcon} />
                    <UploadBox label="Video for Comment Reply" value={form.video!!} onChange={v => setForm({ ...form, video: v })} icon={Video} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template (Fallback)
                      </label>
                      <div className="flex gap-3 text-xs font-medium text-pink-500">
                        <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                          <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                        </button>
                        <button onClick={() => window.location.href = "/dashboard/facebook/bot-replies"} className="hover:underline">+ Add Message Template</button>
                      </div>
                    </div>
                    <div className="relative">
                      <select value={form.private_template_id} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                      >
                        <option value="">Please select a message template</option>
                        {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 p-8 bg-white border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-pink-600 text-white font-semibold text-[14px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
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
  const [formModal, setFormModal] = useState<{ open: boolean; mode: "create" | "edit"; template: ReplyTemplate | null }>({
    open: false, mode: "create", template: null
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/facebook/auto-reply-template");
      setTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data);
    } catch { toast.error("Failed to load templates"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/facebook/auto-reply-template/${id}`);
      toast.success("Safe successfully!");
      setTemplates(templates.filter(t => t.id !== id));
      setDeleteId(null);
    } catch { toast.error("Delete failed"); }
  };

  const handleEdit = async (t: ReplyTemplate) => {
    const toastId = toast.loading("Loading template details...");
    try {
      const res = await api.get(`/facebook/auto-reply-template/${t.id}`);
      const fullTemplate = res.data?.data || res.data;
      setFormModal({ open: true, mode: "edit", template: fullTemplate });
      toast.dismiss(toastId);
    } catch {
      toast.error("Failed to fetch full template details", { id: toastId });
      // Fallback
      setFormModal({ open: true, mode: "edit", template: t });
    }
  };

  const filtered = templates
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f172a] font-sans pb-20">
      {/* 1. Header Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1400px] w-full px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-pink-600 hover:border-pink-100 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Reply Templates</h1>
              <p className="text-[10px] font-bold text-slate-400  mt-1">Facebook Automation Hub</p>
            </div>
          </div>
          <button onClick={() => setFormModal({ open: true, mode: "create", template: null })} className="px-8 py-3.5 rounded-2xl bg-pink-600 text-white font-semibold text-[13px] shadow-xl shadow-pink-100 active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" /> NEW TEMPLATE
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-8">
        {/* Search controls */}
        <div className="flex items-center justify-between gap-6">
          <div className="px-5 py-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[13px] font-semibold text-slate-800">{templates.length} <span className="text-slate-400 ml-1">Total Active</span></span>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-pink-400 outline-none shadow-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* List View */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1.5fr_100px] gap-8 px-10 py-5 bg-slate-50/50 border-b border-slate-50">
            {["Template Name", "Logic Type", "Last Sync", "Actions"].map(h => (
              <span key={h} className="text-[10px] font-medium text-slate-500">{h}</span>
            ))}
          </div>

          {isLoading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-pink-400" />
              <p className="text-[12px] font-bold text-slate-400 ">Compiling Database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6">
                <Settings className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Empty Inventory</h3>
              <p className="text-sm text-slate-400 italic mt-2">Initialize your first auto-reply preset using the 'New' button.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(t => (
                <div key={t.id} className="grid grid-cols-[2fr_1fr_1.5fr_100px] gap-8 px-10 py-6 items-center hover:bg-slate-50/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[22px] bg-pink-50 flex items-center justify-center text-pink-500 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-xs">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <span className="text-[16px] font-bold text-slate-900">{t.name}</span>
                  </div>
                  <span className={cn("px-4 py-1.5 rounded-xl text-[10px] font-semibold w-fit", t.reply_type === "filtered" ? "bg-purple-50 text-purple-600" : "bg-pink-50 text-pink-600")}>
                    {t.reply_type}
                  </span>
                  <span className="text-[13px] font-medium text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Nov 22, 2026
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(t)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all active:scale-90">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90">
                      <Trash2 className="w-4 h-4" />
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
            onClose={() => setFormModal({ open: false, mode: "create", template: null })}
            onSaved={() => { setFormModal({ open: false, mode: "create", template: null }); fetchItems(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100">
              <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-900 leading-none">Scrub Item?</h3>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">This command will permanently remove the template from the automation hub.</p>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[13px]">ABORT</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-semibold text-[14px] shadow-xl shadow-rose-100">CONFIRM</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
