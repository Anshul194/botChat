"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, Edit3, X, Sparkles,
  ChevronLeft, Hash, Loader2, Check, RefreshCw,
  Clock, Smile, Settings, Eye, EyeOff, MessageCircle,
  LayoutGrid, Image as ImageIcon, Video, Filter, Info, Send, ShieldAlert
} from "lucide-react";
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

interface ReplyTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingTemplate: any | null;
  platform: "facebook" | "instagram";
}

// ── Reusable Field Components ──────────────────────────────────────────────────

function Field({ label, required, children, icon: Icon }: { label: string; required?: boolean; children: React.ReactNode; icon?: any }) {
  return (
    <div className="space-y-1.5 flex-1 min-w-0">
      <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" />}
        {label} {required && <span className="text-rose-400">*</span>}
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
          "w-10 h-5 rounded-full relative transition-all duration-200",
          active ? "bg-[var(--primary)]" : "bg-[var(--muted)]/70"
        )}>
          <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] shadow transition-all", active ? "left-5.5" : "left-0.5")} />
        </button>
        <span className="text-xs font-medium text-[var(--muted-foreground)]/70 w-6">{active ? "On" : "Off"}</span>
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
      <label className="text-[11px] font-bold text-[var(--muted-foreground)]  px-1 flex items-center gap-2">
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
          className="bg-[var(--primary)] text-white px-5 h-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:bg-[var(--primary)]/90"
        >
          <Plus className="w-4 h-4" /> Upload
        </div>
        <input type="text" placeholder={`Put your ${isVideo ? 'video' : 'image'} URL here or click upload`} value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-[var(--foreground)] px-4 placeholder:text-[var(--muted-foreground)]/50"
        />
      </div>
    </div>
  );
}

function CapsuleSwitch({ active }: { active: boolean }) {
  return (
    <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-[var(--primary)]" : "bg-[var(--muted)] shadow-inner")}>
      <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] transition-all", active ? "left-6.5" : "left-0.5")} />
    </div>
  );
}

// ── MAIN MODAL COMPONENT ─────────────────────────────────────────────────────

export function ReplyTemplateModal({ isOpen, onClose, onSaved, editingTemplate, platform }: ReplyTemplateModalProps) {
  const [form, setForm] = useState<ReplyTemplate>({
    id: 0,
    name: "",
    reply_type: "generic",
    message_type: "generic",
    message: "",
    image: "",
    video: "",
    multiple_reply_enabled: false,
    comment_reply_enabled: false,
    hide_after_reply: false,
    private_template_id: "",
    page_id: "",
    hide_comment: false,
    delete_comment: false,
    offensive_keywords: "",
    offensive_template_id: "",
    fallback_message: "",
    fallback_image: "",
    fallback_video: "",
    fallback_template_id: ""
  });

  const [filterRules, setFilterRules] = useState<FilterRule[]>([
    { id: Math.random().toString(), name: "Rule 1", match_type: "contains", keywords: "", message: "", image: "", video: "", template_id: "" }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [dropdownTemplates, setDropdownTemplates] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoadingDropdown, setIsLoadingDropdown] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const addRecent = (e: string) => setRecentEmojis(p => [e, ...p.filter(x => x !== e)].slice(0, 32));

  useEffect(() => {
    if (isOpen) {
      if (editingTemplate) {
        setForm({
          id: editingTemplate?.id ?? 0,
          name: editingTemplate?.name ?? "",
          reply_type: editingTemplate?.reply_type ?? "generic",
          message_type: (editingTemplate?.reply_type ?? editingTemplate?.message_type ?? "generic") as "generic" | "filtered" | "filter",
          message: editingTemplate?.message ?? "",
          image: editingTemplate?.image ?? "",
          video: editingTemplate?.video ?? "",
          multiple_reply_enabled: editingTemplate?.multiple_reply_enabled === "1" || editingTemplate?.multiple_reply_enabled === true || editingTemplate?.multiple_reply_enabled === 1,
          comment_reply_enabled: editingTemplate?.comment_reply_enabled === "1" || editingTemplate?.comment_reply_enabled === true || editingTemplate?.comment_reply_enabled === 1,
          hide_after_reply: editingTemplate?.hide_after_reply === "1" || editingTemplate?.hide_after_reply === true || editingTemplate?.hide_after_reply === 1,
          private_template_id: editingTemplate?.private_template_id ? String(editingTemplate.private_template_id) : "",
          page_id: editingTemplate?.page_id ?? editingTemplate?.instagram_id ?? "",

          hide_comment: editingTemplate?.offensive?.hide_comment === "1" || editingTemplate?.offensive?.hide_comment === 1 || !!editingTemplate?.hide_comment,
          delete_comment: editingTemplate?.offensive?.delete_comment === "1" || editingTemplate?.offensive?.delete_comment === 1 || !!editingTemplate?.delete_comment,
          offensive_keywords: editingTemplate?.offensive?.offensive_keywords ?? editingTemplate?.offensive_keywords ?? "",
          offensive_template_id: editingTemplate?.offensive?.private_reply_template_id ? String(editingTemplate.offensive.private_reply_template_id) : (editingTemplate?.offensive_template_id ? String(editingTemplate.offensive_template_id) : ""),

          fallback_message: "",
          fallback_image: "",
          fallback_video: "",
          fallback_template_id: ""
        });

        if (editingTemplate.rules?.length) {
          setFilterRules(editingTemplate.rules.map((r: any) => ({
            id: r.id?.toString() ?? Math.random().toString(),
            name: r.name ?? "",
            match_type: r.match_type ?? "contains",
            keywords: r.keyword ?? r.keywords ?? "",
            message: r.message ?? "",
            image: r.image ?? "",
            video: r.video ?? "",
            template_id: r.private_template_id ? String(r.private_template_id) : (r.template_id ? String(r.template_id) : ""),
          })));
        } else if (editingTemplate.filter_rules?.length) {
          setFilterRules(editingTemplate.filter_rules);
        } else {
          setFilterRules([{ id: Math.random().toString(), name: "Rule 1", match_type: "contains", keywords: "", message: "", image: "", video: "", template_id: "" }]);
        }
      } else {
        setForm({
          id: 0,
          name: "",
          reply_type: "generic",
          message_type: "generic",
          message: "",
          image: "",
          video: "",
          multiple_reply_enabled: false,
          comment_reply_enabled: false,
          hide_after_reply: false,
          private_template_id: "",
          page_id: "",
          hide_comment: false,
          delete_comment: false,
          offensive_keywords: "",
          offensive_template_id: "",
          fallback_message: "",
          fallback_image: "",
          fallback_video: "",
          fallback_template_id: ""
        });
        setFilterRules([{ id: Math.random().toString(), name: "Rule 1", match_type: "contains", keywords: "", message: "", image: "", video: "", template_id: "" }]);
      }
      fetchPages();
    }
  }, [isOpen, editingTemplate]);

  const fetchDropdown = async (pageId?: string) => {
    const targetPageId = pageId || form.page_id;
    if (!targetPageId) {
      setDropdownTemplates([]);
      return;
    }
    setIsLoadingDropdown(true);
    try {
      const endpoint = platform === "facebook" ? `/facebook/bot-replies?page_id=${targetPageId}` : `/instagram/bot-replies?page_id=${targetPageId}&platform=instagram`;
      const res = await api.get(endpoint);
      setDropdownTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data);
    } catch { toast.error("Failed to load list"); }
    finally { setIsLoadingDropdown(false); }
  };

  const fetchPages = async () => {
    setIsLoadingPages(true);
    try {
      if (platform === "facebook") {
        const response = await api.get("/social/facebook-connect");
        if (response.data.success || response.data.is_success) {
          const fetchedAccounts = response.data.data.facebook_accounts || [];
          const fetchedPages = fetchedAccounts.flatMap((acc: any) => acc.pages || []);
          setPages(fetchedPages.map((p: any) => ({ id: p.page_id, name: p.page_name })));
        }
      } else {
        const response = await api.get("/social/instagram-connect?platform=instagram");
        if (response.data.success || response.data.is_success) {
          const fetchedAccounts = response.data.data.instagram_accounts || [];
          setPages(fetchedAccounts.map((acc: any) => ({ id: acc.instagram_id, name: acc.username })));
        }
      }
    } catch { toast.error("Failed to load accounts"); }
    finally { setIsLoadingPages(false); }
  };

  useEffect(() => {
    if (form.page_id) {
      fetchDropdown();
    } else {
      setDropdownTemplates([]);
    }
  }, [form.page_id]);

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
      fd.append("platform", platform);
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
      const endpoint = platform === "facebook" ? "/facebook/auto-reply-template" : "/instagram/auto-reply-template";

      if (!form.id || form.id === 0) {
        await api.post(endpoint, fd, config);
      } else {
        fd.append("_method", platform === "instagram" ? "PATCH" : "PUT");
        await api.post(`${endpoint}/${form.id}`, fd, config);
      }

      toast.success("Saved successfully!");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save template");
    } finally { setIsSaving(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
            className="relative z-10 w-full max-w-[980px] bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
              <h2 className="text-[13px] font-semibold text-[var(--foreground)]">{editingTemplate ? 'Edit' : 'Create'} Auto Reply Template ({platform === 'instagram' ? 'Instagram' : 'Facebook'})</h2>
              <button onClick={onClose} className="text-[var(--muted-foreground)]/50 hover:text-rose-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--card)]">

              {/* SECTION 1: BASICS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs">
                <Field label="Auto Reply Campaign Name" required>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px]"
                    placeholder="Write your auto reply campaign name here"
                  />
                </Field>
                <Field label={platform === 'instagram' ? "Please select an account" : "Please select a page"} required>
                  <div className="relative">
                    <select
                      value={form.page_id}
                      onChange={e => setForm({ ...form, page_id: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--card)]"
                    >
                      <option value="">{isLoadingPages ? "Syncing..." : "Select..."}</option>
                      {pages.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]/70" />
                  </div>
                </Field>
              </div>

              {/* SECTION 2: OFFENSIVE */}
              <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Offensive Comments Settings</h3>
                </div>
                <div className="flex gap-8">
                  <Toggle label="Hide Comment" active={form.hide_comment!!} onClick={() => setForm({ ...form, hide_comment: !form.hide_comment })} />
                  <Toggle label="Delete Comment" active={form.delete_comment!!} onClick={() => setForm({ ...form, delete_comment: !form.delete_comment })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Offensive keywords <span className="text-[var(--muted-foreground)]/70 font-normal">(comma separated)</span></label>
                    <div className="relative">
                      <textarea rows={4} value={form.offensive_keywords} onChange={e => setForm({ ...form, offensive_keywords: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] resize-none"
                        placeholder="keyword1, keyword2..."
                      />
                      <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-[var(--muted-foreground)]/50" />
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-sm font-medium text-[var(--muted-foreground)]">Private reply template</label>
                      <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                        <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                          <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                        </button>
                        <button onClick={() => window.location.href = `/dashboard/${platform}/bot-replies`} className="hover:underline">+ Add Template</button>
                      </div>
                    </div>
                    <div className="relative">
                      <select
                        value={form.offensive_template_id}
                        onChange={e => setForm({ ...form, offensive_template_id: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--card)]"
                      >
                        <option value="">Please select a message template</option>
                        {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]/70" />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: REPLAY TOGGLES */}
              <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-xs grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between py-1 px-1">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                    <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Do you want to send reply message to a user multiple times?</span>
                  </div>
                  <Toggle label="" active={!!form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                </div>
                <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                    <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Do you want to enable comment reply?</span>
                  </div>
                  <Toggle label="" active={!!form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                </div>
                <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <EyeOff className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                    <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Do you want to hide comments after comment reply?</span>
                  </div>
                  <Toggle label="" active={!!form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                </div>
              </div>

              {/* SECTION 4: LOGIC SELECTION */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, message_type: "generic" })}>
                  <CapsuleSwitch active={form.message_type === "generic"} />
                  <span className={cn("text-sm font-medium", form.message_type === "generic" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]/70")}>Generic message for all comments</span>
                </div>
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, message_type: "filter" })}>
                  <CapsuleSwitch active={form.message_type === "filter"} />
                  <span className={cn("text-sm font-medium", form.message_type === "filter" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]/70")}>Send different messages by keyword filter</span>
                </div>
              </div>

              {/* SECTION 5: EDITOR */}
              <div className="space-y-8">
                {form.message_type === "generic" ? (
                  <div className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-8 animate-in fade-in duration-300">
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
                          <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" /> Private reply template
                        </label>
                        <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                          <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                          </button>
                          <button onClick={() => window.location.href = `/dashboard/${platform}/bot-replies`} className="hover:underline">+ Add Template</button>
                        </div>
                      </div>
                      <div className="relative">
                        <select value={form.private_template_id} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--card)]"
                        >
                          <option value="">Please select a message template</option>
                          {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]/70" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    {filterRules.map((rule, idx) => (
                      <div key={rule.id} className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-8 relative group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "exact" } : r))}>
                              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]/70")}>
                                {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)]" />}
                              </div>
                              <span className={cn("text-xs font-medium", rule.match_type === "exact" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]/70")}>Exact match</span>
                            </div>
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "contains" } : r))}>
                              <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]/70")}>
                                {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)]" />}
                              </div>
                              <span className={cn("text-xs font-medium", rule.match_type === "contains" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]/70")}>Contains word</span>
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
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px]"
                            placeholder="Write your filter word here"
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
                              <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" /> Private reply template
                            </label>
                            <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                              <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                                <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                              </button>
                              <button onClick={() => window.location.href = `/dashboard/${platform}/bot-replies`} className="hover:underline">+ Add Template</button>
                            </div>
                          </div>
                          <div className="relative">
                            <select value={rule.template_id} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, template_id: e.target.value } : r))}
                              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--card)]"
                            >
                              <option value="">Please select a message template</option>
                              {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]/70" />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      <button onClick={handleAddRule} className="px-6 py-2.5 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-[11px]  hover:bg-[var(--primary)]/10 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-[var(--primary)]/10/20">
                        <Plus className="w-4 h-4" /> Add another filter rule
                      </button>
                    </div>

                    {/* Fallback */}
                    <div className="bg-[var(--muted)]/50 p-8 rounded-2xl border border-[var(--border)] border-dashed space-y-8">
                      <div className="flex items-center gap-3">
                        <Info className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                        <span className="text-sm font-medium text-[var(--muted-foreground)]">Fallback reply (when no filter matches)</span>
                      </div>
                      <Field label="Message for Comment Reply" icon={MessageCircle}>
                        <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--card)]">
                          <TextareaWithEmoji
                            value={form.message}
                            onChange={v => setForm({ ...form, message: v })}
                            placeholder="Type your message here..."
                            rows={4}
                            minHeight="100px"
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
                            <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" /> Private reply template (Fallback)
                          </label>
                          <div className="flex gap-3 text-xs font-medium text-[var(--primary)]">
                            <button onClick={() => fetchDropdown()} className="hover:underline flex items-center gap-1">
                              <RefreshCw className={cn("w-2.5 h-2.5", isLoadingDropdown && "animate-spin")} /> Refresh List
                            </button>
                            <button onClick={() => window.location.href = `/dashboard/${platform}/bot-replies`} className="hover:underline">+ Add Template</button>
                          </div>
                        </div>
                        <div className="relative">
                          <select value={form.private_template_id} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--card)]"
                          >
                            <option value="">Please select a message template</option>
                            {dropdownTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <ChevronLeft className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 -rotate-90 pointer-events-none text-[var(--muted-foreground)]/70" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 p-8 bg-[var(--card)] border-t border-[var(--border)] flex-shrink-0">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[13px] hover:bg-[var(--muted)]/50 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-[14px] shadow-xl shadow-[var(--primary)]/10 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                <span>{editingTemplate ? 'UPDATE' : 'SAVE'} CHANGES</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
