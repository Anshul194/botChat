"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, Edit3, X, Sparkles,
  ChevronLeft, Hash, Loader2, Check, RefreshCw,
  Clock, Settings, Eye, EyeOff, MessageCircle,
  LayoutGrid, Image as ImageIcon, Video, Filter, Info, Send, ShieldAlert,
  Instagram
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { TextareaWithEmoji } from "@/components/ui/EmojiPicker";

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
      <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" />}
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div className="flex items-center gap-3 group">
      {label && <span className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">{label}</span>}
      <div className="flex items-center gap-2">
        <button onClick={onClick} className={cn(
          "w-10 h-5 rounded-full relative transition-all duration-200 cursor-pointer",
          active ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
        )}>
          <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] dark:bg-[var(--muted)]/60 shadow transition-all", active ? "left-5.5" : "left-0.5")} />
        </button>
        <span className="text-xs font-medium text-[var(--muted-foreground)] w-6">{active ? "On" : "Off"}</span>
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
      <label className="text-[11px] font-bold text-[var(--muted-foreground)] px-1 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <div className="flex items-center gap-0 rounded-xl border border-[var(--border)] bg-[var(--card)] group focus-within:border-[var(--primary)] overflow-hidden transition-all shadow-xs h-[44px]">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={isVideo ? "video/*" : "image/*"}
          onChange={handleFileChange}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-[var(--primary)] text-[var(--primary-foreground)] px-5 h-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Upload
        </div>
        <input type="text" placeholder={`Put your ${isVideo ? 'video' : 'image'} URL here or click upload`} value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-[var(--foreground)] px-4 placeholder:text-slate-350"
        />
      </div>
    </div>
  );
}

function CapsuleSwitch({ active }: { active: boolean }) {
  return (
    <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-[var(--primary)]" : "bg-[var(--muted)] shadow-inner")}>
      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] dark:bg-[var(--muted)]/60 transition-all", active ? "left-6.5" : "left-0.5")} />
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
    message_type: (initial?.reply_type ?? initial?.message_type ?? "generic") as "generic" | "filtered" | "filter",
    message: initial?.message ?? "",
    image: initial?.image ?? "",
    video: initial?.video ?? "",
    multiple_reply_enabled: (initial as any)?.multiple_reply_enabled === "1" || (initial as any)?.multiple_reply_enabled === true || (initial as any)?.multiple_reply_enabled === 1,
    comment_reply_enabled: (initial as any)?.comment_reply_enabled === "1" || (initial as any)?.comment_reply_enabled === true || (initial as any)?.comment_reply_enabled === 1,
    hide_after_reply: (initial as any)?.hide_after_reply === "1" || (initial as any)?.hide_after_reply === true || (initial as any)?.hide_after_reply === 1,
    private_template_id: initial?.private_template_id ? String(initial.private_template_id) : "",
    page_id: initial?.page_id ?? "",

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
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const addRecent = (e: string) => setRecentEmojis(p => [e, ...p.filter(x => x !== e)].slice(0, 32));

  const fetchDropdown = async (pageId?: string) => {
    const targetPageId = pageId || form.page_id;
    if (!targetPageId) {
      setDropdownTemplates([]);
      return;
    }
    setIsLoadingDropdown(true);
    try {
      const res = await api.get(`/instagram/bot-replies?page_id=${targetPageId}&platform=instagram`);
      setDropdownTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data);
    } catch { toast.error("Failed to load list"); }
    finally { setIsLoadingDropdown(false); }
  };

  const fetchPages = async () => {
    setIsLoadingPages(true);
    try {
      const response = await api.get("/social/instagram-connect?platform=instagram");
      if (response.data.success || response.data.is_success) {
        const fetchedAccounts = response.data.data.instagram_accounts || [];
        // For Instagram, sometimes it's flattened or we use the account list
        setPages(fetchedAccounts.map((acc: any) => ({
          page_id: acc.instagram_id,
          page_name: acc.username
        })));
      }
    } catch { toast.error("Failed to load Instagram accounts"); }
    finally { setIsLoadingPages(false); }
  };

  useEffect(() => {
    if (form.page_id) fetchDropdown();
    else setDropdownTemplates([]);
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
      fd.append("platform", "instagram");
      fd.append("name", form.name);
      fd.append("page_id", form.page_id ?? "");

      const apiReplyType = form.message_type === "filter" ? "filter" : "generic";
      fd.append("reply_type", apiReplyType);

      fd.append("comment_reply_enabled", form.comment_reply_enabled ? "1" : "0");
      fd.append("hide_after_reply", form.hide_after_reply ? "1" : "0");
      fd.append("multiple_reply_enabled", form.multiple_reply_enabled ? "1" : "0");

      fd.append("message", form.message || "");
      fd.append("image", form.image || "");
      fd.append("video", form.video || "");
      fd.append("private_template_id", form.private_template_id || "");

      fd.append("offensive[hide_comment]", form.hide_comment ? "1" : "0");
      fd.append("offensive[delete_comment]", form.delete_comment ? "1" : "0");
      fd.append("offensive[offensive_keywords]", form.offensive_keywords ?? "");
      fd.append("offensive[private_reply_template_id]", form.offensive_template_id ?? "");

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
        await api.post("/instagram/auto-reply-template", fd, config);
      } else {
        fd.append("_method", "PATCH");
        await api.post(`/instagram/auto-reply-template/${form.id}`, fd, config);
      }

      toast.success("Saved successfully!");
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save template");
    } finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
        className="relative z-10 w-full max-w-none sm:max-w-[980px] min-h-screen sm:min-h-0 bg-[var(--card)] border border-[var(--border)] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
          <h2 className="text-[13px] font-bold uppercase tracking-widest text-[var(--foreground)]">Instagram Auto Reply Template</h2>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-rose-500 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--muted)]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs">
            <Field label="Auto Reply Campaign Name" required>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-semibold text-[14px]"
                placeholder="Write your campaign name here"
              />
            </Field>
            <Field label="Select Instagram Account" required>
              <div className="relative">
                <select
                  value={form.page_id}
                  onChange={e => setForm({ ...form, page_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-semibold text-[14px] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[var(--card)]"> {isLoadingPages ? "Syncing Accounts..." : "Select account"} </option>
                  {pages.map(p => (
                    <option key={p.page_id} value={p.page_id} className="bg-[var(--card)] text-[var(--foreground)]">@{p.page_name}</option>
                  ))}
                </select>
                <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]" />
              </div>
            </Field>
          </div>

          <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wide">Offensive Comments Settings</h3>
            </div>
            <div className="flex gap-8">
              <Toggle label="Hide Comment" active={form.hide_comment!!} onClick={() => setForm({ ...form, hide_comment: !form.hide_comment })} />
              <Toggle label="Delete Comment" active={form.delete_comment!!} onClick={() => setForm({ ...form, delete_comment: !form.delete_comment })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--muted-foreground)]">Offensive keywords <span className="text-[var(--muted-foreground)]/60 font-normal">(comma separated)</span></label>
                <div className="relative">
                  <textarea rows={4} value={form.offensive_keywords} onChange={e => setForm({ ...form, offensive_keywords: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-medium text-[14px] resize-none"
                    placeholder="badword1, badword2..."
                  />
                  <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-[var(--muted-foreground)]/50" />
                </div>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-medium text-[var(--muted-foreground)]">Private reply template</label>
                  <div className="flex gap-3 text-xs font-semibold text-[var(--primary)]">
                    <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1 cursor-pointer">
                      <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                    </button>
                    <button onClick={() => window.location.href = "/dashboard/instagram/bot-replies"} className="hover:underline cursor-pointer">+ Add Template</button>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={form.offensive_template_id}
                    onChange={e => setForm({ ...form, offensive_template_id: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-semibold text-[14px] appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-[var(--card)]">Please select a message template</option>
                    {dropdownTemplates.map(t => <option key={t.id} value={t.id} className="bg-[var(--card)] text-[var(--foreground)]">{t.name}</option>)}
                  </select>
                  <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between py-1 px-1">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Reply user multiple times?</span>
              </div>
              <Toggle label="" active={!!form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
            </div>
            <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]/50">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Enable comment reply?</span>
              </div>
              <Toggle label="" active={!!form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
            </div>
            <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]/50">
              <div className="flex items-center gap-3">
                <EyeOff className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Hide comments after reply?</span>
              </div>
              <Toggle label="" active={!!form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
            </div>
          </div>

          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, message_type: "generic" })}>
              <CapsuleSwitch active={form.message_type === "generic"} />
              <span className={cn("text-sm font-medium transition-colors", form.message_type === "generic" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>Generic message for all comments</span>
            </div>
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, message_type: "filter" })}>
              <CapsuleSwitch active={form.message_type === "filter"} />
              <span className={cn("text-sm font-medium transition-colors", form.message_type === "filter" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>Filter by keyword</span>
            </div>
          </div>

          <div className="space-y-8">
            {form.message_type === "generic" ? (
              <div className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-8">
                <Field label="Message for Comment Reply" required icon={MessageCircle}>
                  <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--card)]">
                    <TextareaWithEmoji
                      value={form.message}
                      onChange={v => setForm({ ...form, message: v })}
                      placeholder="Type your message here..."
                      rows={5}
                      minHeight="120px"
                      recent={recentEmojis}
                      onAddRecent={addRecent}
                    />
                  </div>
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <UploadBox label="Image for Comment Reply" value={form.image!!} onChange={v => setForm({ ...form, image: v })} icon={ImageIcon} />
                  <UploadBox label="Video for Comment Reply" value={form.video!!} onChange={v => setForm({ ...form, video: v })} icon={Video} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50" /> Private reply template
                    </label>
                    <div className="flex gap-3 text-xs font-semibold text-[var(--primary)]">
                      <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1 cursor-pointer">
                        <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                      </button>
                      <button onClick={() => window.location.href = "/dashboard/instagram/bot-replies"} className="hover:underline cursor-pointer">+ Add Template</button>
                    </div>
                  </div>
                  <div className="relative">
                    <select value={form.private_template_id} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-semibold text-[14px] appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[var(--card)]">Please select a message template</option>
                      {dropdownTemplates.map(t => <option key={t.id} value={t.id} className="bg-[var(--card)] text-[var(--foreground)]">{t.name}</option>)}
                    </select>
                    <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {filterRules.map((rule, idx) => (
                  <div key={rule.id} className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-8 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "exact" } : r))}>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)] bg-transparent")}>
                            {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)] dark:bg-[var(--muted)]/60" />}
                          </div>
                          <span className={cn("text-xs font-semibold transition-colors", rule.match_type === "exact" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>Exact match</span>
                        </div>
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "contains" } : r))}>
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)] bg-transparent")}>
                            {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)] dark:bg-[var(--muted)]/60" />}
                          </div>
                          <span className={cn("text-xs font-semibold transition-colors", rule.match_type === "contains" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]")}>Contains word</span>
                        </div>
                      </div>
                      {filterRules.length > 1 && (
                        <button onClick={() => setFilterRules(filterRules.filter(r => r.id !== rule.id))} className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center hover:bg-rose-500/20 transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <Field label="Filter Word/Sentence" required>
                      <input type="text" value={rule.keywords} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, keywords: e.target.value } : r))}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-semibold text-[14px]"
                        placeholder="Filter keyword..."
                      />
                    </Field>

                    <Field label="Message for Comment Reply" required icon={MessageCircle}>
                      <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--card)]">
                        <TextareaWithEmoji
                          value={rule.message}
                          onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, message: v } : r))}
                          placeholder="Type your message here..."
                          rows={4}
                          minHeight="100px"
                          recent={recentEmojis}
                          onAddRecent={addRecent}
                        />
                      </div>
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <UploadBox label="Image for Comment Reply" value={rule.image} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, image: v } : r))} icon={ImageIcon} />
                      <UploadBox label="Video for Comment Reply" value={rule.video} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, video: v } : r))} icon={Video} />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                          <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50" /> Private reply template
                        </label>
                        <div className="flex gap-3 text-xs font-semibold text-[var(--primary)]">
                          <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1 cursor-pointer">
                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                          </button>
                          <button onClick={() => window.location.href = "/dashboard/instagram/bot-replies"} className="hover:underline cursor-pointer">+ Add Template</button>
                        </div>
                      </div>
                      <div className="relative">
                        <select value={rule.template_id} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, template_id: e.target.value } : r))}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-semibold text-[14px] appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[var(--card)]">Please select a message template</option>
                          {dropdownTemplates.map(t => <option key={t.id} value={t.id} className="bg-[var(--card)] text-[var(--foreground)]">{t.name}</option>)}
                        </select>
                        <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]" />
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={handleAddRule} className="w-full py-4 rounded-xl border-2 border-dashed border-[var(--primary)]/20 text-[var(--primary)] font-bold text-[12px] hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer">
                  <Plus className="w-4 h-4" /> Add Another Filter Rule
                </button>

                <div className="bg-[var(--muted)]/20 p-8 rounded-2xl border border-[var(--border)] border-dashed space-y-8">
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <span className="text-sm font-medium text-[var(--muted-foreground)]">Fallback reply (when no filter matches)</span>
                  </div>
                  <Field label="Message for Comment Reply" icon={MessageCircle}>
                    <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--card)]">
                      <TextareaWithEmoji
                        value={form.fallback_message ?? ""}
                        onChange={v => setForm({ ...form, fallback_message: v })}
                        placeholder="Type fallback message here..."
                        rows={4}
                        minHeight="100px"
                        recent={recentEmojis}
                        onAddRecent={addRecent}
                      />
                    </div>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <UploadBox label="Image for Comment Reply" value={form.fallback_image ?? ""} onChange={v => setForm({ ...form, fallback_image: v })} icon={ImageIcon} />
                    <UploadBox label="Video for Comment Reply" value={form.fallback_video ?? ""} onChange={v => setForm({ ...form, fallback_video: v })} icon={Video} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/50" /> Private reply template (Fallback)
                      </label>
                      <div className="flex gap-3 text-xs font-semibold text-[var(--primary)]">
                        <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1 cursor-pointer">
                          <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                        </button>
                        <button onClick={() => window.location.href = "/dashboard/instagram/bot-replies"} className="hover:underline cursor-pointer">+ Add Template</button>
                      </div>
                    </div>
                    <div className="relative">
                      <select value={form.fallback_template_id} onChange={e => setForm({ ...form, fallback_template_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] focus:border-[var(--primary)] text-[var(--foreground)] outline-none transition-all font-semibold text-[14px] appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[var(--card)]">Please select a message template</option>
                        {dropdownTemplates.map(t => <option key={t.id} value={t.id} className="bg-[var(--card)] text-[var(--foreground)]">{t.name}</option>)}
                      </select>
                      <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 p-8 bg-transparent border-t border-[var(--border)] flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-bold text-[13px] transition-all uppercase bg-transparent cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-black text-[14px] shadow-xl shadow-[var(--primary)]/10 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 tracking-widest uppercase cursor-pointer">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
            <span>DEPLOY TEMPLATE</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Dashboard View ─────────────────────────────────────────────────────────────

export default function InstagramReplyTemplatesPage() {
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
      const res = await api.get("/instagram/auto-reply-template?platform=instagram");
      setTemplates(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    } catch { toast.error("Failed to load templates"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/instagram/auto-reply-template/${id}`);
      toast.success("Purged successfully!");
      setTemplates(templates.filter(t => t.id !== id));
      setDeleteId(null);
    } catch { toast.error("Delete failed"); }
  };

  const handleEdit = async (t: ReplyTemplate) => {
    const tid = toast.loading("Syncing asset data...");
    try {
      const res = await api.get(`/instagram/auto-reply-template/${t.id}?platform=instagram`);
      const full = res.data?.data || res.data;
      setFormModal({ open: true, mode: "edit", template: full });
      toast.dismiss(tid);
    } catch {
      toast.error("Fetch failure", { id: tid });
      setFormModal({ open: true, mode: "edit", template: t });
    }
  };

  const filtered = templates
    .filter(t => (t.name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.id - a.id);

  return (
    <div className="bg-[var(--background)] pb-20">
      <div className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-[50] shadow-sm">
        <div className="max-w-[1400px] w-full px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest leading-none">Instagram Automation</p>
              <h1 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter mt-1">Reply Templates</h1>
            </div>
          </div>
          <button onClick={() => setFormModal({ open: true, mode: "create", template: null })} className="px-8 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-black text-[12px] shadow-xl shadow-[var(--primary)]/10 active:scale-95 transition-all flex items-center gap-3 uppercase tracking-widest cursor-pointer">
            <Plus className="w-5 h-5" /> NEW TEMPLATE
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-8">
        <div className="flex items-center justify-between gap-6">
          <div className="px-6 py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
            <span className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-widest">{templates.length} Active Nodes</span>
          </div>
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/50 group-focus-within:text-[var(--primary)] transition-colors" />
            <input type="text" placeholder="Lookup Templates..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-xl bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] outline-none shadow-sm font-bold text-[14px] text-[var(--foreground)] transition-all placeholder:text-[var(--muted-foreground)]/55"
            />
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1.5fr_120px] gap-8 px-10 py-6 bg-[var(--muted)]/20 border-b border-[var(--border)]">
            {["Asset Identity", "Logic Mapping", "Lifecycle Sync", "Terminal"].map(h => (
              <span key={h} className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{h}</span>
            ))}
          </div>

          {isLoading ? (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-[24px] bg-[var(--primary)]/10 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[var(--primary)]" />
              </div>
              <p className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Compiling Assets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-32 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-[var(--muted)] flex items-center justify-center mb-8">
                <Settings className="w-10 h-10 text-[var(--muted-foreground)]/40" />
              </div>
              <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight">Empty Inventory</h3>
              <p className="text-sm text-[var(--muted-foreground)] font-medium mt-3 italic uppercase tracking-wide">Register your first automation layer using the terminal above.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]/55">
              {filtered.map(t => (
                <div key={t.id} className="grid grid-cols-[2fr_1fr_1.5fr_120px] gap-8 px-10 py-8 items-center hover:bg-[var(--muted)]/10 transition-all group border-b border-transparent last:border-0">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-all shadow-xs">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[15px] font-black text-[var(--foreground)] uppercase tracking-tight truncate block max-w-[280px]">{t.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Instagram size={12} className="text-[var(--primary)]" />
                        <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">ID: {t.id}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest", t.reply_type === "filter" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]")}>
                      {t.reply_type || 'Generic'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-black text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Live Sync
                    </span>
                    <span className="text-[11px] font-bold text-[var(--muted-foreground)]/60 uppercase pl-5">March 29, 2026</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(t)} className="p-3 rounded-2xl bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all active:scale-90 cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(t.id)} className="p-3 rounded-2xl bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 transition-all active:scale-90 cursor-pointer">
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
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-[1000]" onClick={() => setDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--card)] dark:bg-[var(--background)] rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl relative z-[1001] border border-[var(--border)] dark:border-[var(--border)]">
              <Trash2 className="w-12 h-12 text-rose-500 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-[var(--foreground)] dark:text-white uppercase tracking-tight">Scrub Asset?</h3>
              <p className="text-sm text-[var(--muted-foreground)]/70 mt-4 leading-relaxed font-bold uppercase tracking-wide">Permanently purge this item from the Instagram automation hub?</p>
              <div className="flex gap-4 mt-10">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-black text-[12px] uppercase transition-all">Abort</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-black text-[12px] uppercase shadow-xl shadow-rose-600/20 active:scale-95 transition-all hover:bg-rose-700">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
