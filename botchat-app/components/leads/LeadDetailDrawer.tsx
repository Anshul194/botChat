"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, MessageSquare, Instagram, Facebook, Clock, CheckCircle2,
  AlertCircle, Loader2, Plus, Tag, Trash2, Send, ChevronDown, ChevronUp,
  ArrowUpRight, ArrowDownLeft, StickyNote, Activity
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import leadsService, { LeadDetail, LeadStatus } from "@/services/leadsService";
import { format, formatDistanceToNow } from "date-fns";

const PRESET_TAGS = ["Interested", "Hot Lead", "Cold Lead", "Customer", "Support"];

const statusConfig: Record<LeadStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  completed:   { label: "Completed",   color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", icon: CheckCircle2 },
  in_progress: { label: "In Progress", color: "bg-blue-500/15 text-blue-400 border-blue-500/25",         icon: Loader2 },
  abandoned:   { label: "Abandoned",   color: "bg-rose-500/15 text-rose-400 border-rose-500/25",         icon: AlertCircle },
};

interface Props {
  open: boolean;
  subscriberId: number | null;
  botReplyId: number | null;
  onClose: () => void;
}

export function LeadDetailDrawer({ open, subscriberId, botReplyId, onClose }: Props) {
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"answers" | "timeline" | "notes">("answers");
  const [newNote, setNewNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!subscriberId || !botReplyId) return;
    setLoading(true);
    setDetail(null);
    try {
      const data = await leadsService.getLeadDetail(subscriberId, botReplyId);
      setDetail(data);
    } catch (err) {
      console.error("Failed to load lead detail", err);
    } finally {
      setLoading(false);
    }
  }, [subscriberId, botReplyId]);

  useEffect(() => {
    if (open && subscriberId && botReplyId) {
      loadDetail();
      setActiveTab("answers");
    }
  }, [open, subscriberId, botReplyId, loadDetail]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !detail) return;
    setNoteLoading(true);
    try {
      const res = await leadsService.addNote(detail.subscriber.id, detail.flow.id, newNote.trim());
      if (res.is_success) {
        setDetail(prev => prev ? { ...prev, notes: [res.data, ...prev.notes] } : prev);
        setNewNote("");
      }
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!detail) return;
    await leadsService.deleteNote(noteId);
    setDetail(prev => prev ? { ...prev, notes: prev.notes.filter(n => n.id !== noteId) } : prev);
  };

  const handleAddTag = async (tag: string) => {
    if (!detail || !tag.trim()) return;
    await leadsService.addTag(detail.subscriber.id, detail.flow.id, tag.trim());
    if (!detail.tags.includes(tag.trim())) {
      setDetail(prev => prev ? { ...prev, tags: [...prev.tags, tag.trim()] } : prev);
    }
    setNewTag("");
    setShowTagInput(false);
  };

  const handleRemoveTag = async (tag: string) => {
    if (!detail) return;
    await leadsService.removeTag(detail.subscriber.id, detail.flow.id, tag);
    setDetail(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : prev);
  };

  const status = detail ? statusConfig[detail.status] : null;
  const StatusIcon = status?.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[49] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-[50] w-full max-w-[600px] bg-[var(--card)] border-l border-[var(--border)] flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-[var(--foreground)]">Lead Detail</span>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading lead details…</span>
                </div>
              ) : detail ? (
                <div className="p-6 space-y-6">
                  {/* Subscriber Info */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 border border-[var(--border)]">
                    <Avatar className="h-16 w-16 border-2 border-[var(--border)] shadow">
                      <AvatarImage src={detail.subscriber.profile_pic ?? ""} />
                      <AvatarFallback className="text-lg font-black bg-primary/10 text-primary">
                        {(detail.subscriber.name || detail.subscriber.first_name || "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-black text-[var(--foreground)] truncate">
                          {detail.subscriber.name || `${detail.subscriber.first_name ?? ""} ${detail.subscriber.last_name ?? ""}`.trim() || "Unknown"}
                        </h2>
                        {detail.subscriber.channel_type === "instagram" ? (
                          <Instagram className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                        ) : (
                          <Facebook className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{detail.subscriber.psid}</p>
                      {detail.subscriber.email && (
                        <p className="text-xs text-muted-foreground">{detail.subscriber.email}</p>
                      )}
                      {detail.subscriber.phone && (
                        <p className="text-xs text-muted-foreground">{detail.subscriber.phone}</p>
                      )}
                    </div>

                    {status && StatusIcon && (
                      <Badge className={cn("border text-xs font-semibold shrink-0", status.color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    )}
                  </div>

                  {/* Flow Meta */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Flow", value: detail.flow.name },
                      { label: "Channel", value: detail.flow.channel_type === "instagram" ? "Instagram" : "Facebook" },
                      { label: "Page / Account", value: detail.flow.page_name || detail.flow.ig_username || "—" },
                      { label: "Answers", value: `${detail.completed_answers} / ${detail.total_steps}` },
                      { label: "Started", value: detail.started_at ? format(new Date(detail.started_at), "MMM d, yyyy HH:mm") : "—" },
                      {
                        label: "Last Activity",
                        value: detail.last_interaction
                          ? formatDistanceToNow(new Date(detail.last_interaction), { addSuffix: true })
                          : "—"
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-xl bg-muted/20 border border-[var(--border)]">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
                        <p className="text-xs font-semibold text-[var(--foreground)] truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</p>
                      <button
                        onClick={() => setShowTagInput(v => !v)}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {detail.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-rose-400 transition-colors">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                      {detail.tags.length === 0 && !showTagInput && (
                        <span className="text-xs text-muted-foreground italic">No tags</span>
                      )}
                    </div>

                    {showTagInput && (
                      <div className="mt-2 flex gap-2">
                        <div className="flex gap-1 flex-wrap flex-1">
                          {PRESET_TAGS.filter(t => !detail.tags.includes(t)).map(pt => (
                            <button
                              key={pt}
                              onClick={() => handleAddTag(pt)}
                              className="text-xs px-2 py-1 rounded-full border border-[var(--border)] hover:bg-primary/10 hover:border-primary/30 transition-colors"
                            >
                              {pt}
                            </button>
                          ))}
                        </div>
                        <input
                          className="flex-shrink-0 text-xs px-2 py-1 rounded-lg border border-[var(--border)] bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary w-28"
                          placeholder="Custom…"
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddTag(newTag)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-[var(--border)]">
                    <div className="flex gap-1">
                      {(["answers", "timeline", "notes"] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "px-4 py-2 text-xs font-semibold capitalize transition-all border-b-2 -mb-px",
                            activeTab === tab
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-[var(--foreground)]"
                          )}
                        >
                          {tab === "answers" ? "Collected Answers" : tab === "timeline" ? "Timeline" : "Notes"}
                          {tab === "notes" && detail.notes.length > 0 && (
                            <span className="ml-1.5 bg-primary/15 text-primary text-[10px] px-1.5 py-0.5 rounded-full">
                              {detail.notes.length}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "answers" && (
                    <div className="space-y-3">
                      {detail.collected_answers.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8 italic">No user input steps in this flow.</p>
                      ) : (
                        detail.collected_answers.map((ans) => (
                          <div
                            key={ans.step_id}
                            className={cn(
                              "p-4 rounded-xl border",
                              ans.answered
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : "bg-muted/20 border-[var(--border)] opacity-60"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Step {ans.step_order} · {ans.field_name.replace(/_/g, " ")}
                              </p>
                              {ans.answered ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mb-2 italic">"{ans.question}"</p>
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {ans.value ?? <span className="text-muted-foreground italic">No answer yet</span>}
                            </p>
                            {ans.answered_at && (
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(ans.answered_at), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "timeline" && (
                    <div className="space-y-2">
                      {detail.timeline.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8 italic">No conversation history available.</p>
                      ) : (
                        detail.timeline.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex gap-3 items-start",
                              msg.direction === "outgoing" ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            <div className={cn(
                              "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                              msg.direction === "outgoing" ? "bg-primary/15" : "bg-muted/50"
                            )}>
                              {msg.direction === "outgoing"
                                ? <ArrowUpRight className="h-3 w-3 text-primary" />
                                : <ArrowDownLeft className="h-3 w-3 text-muted-foreground" />}
                            </div>
                            <div className={cn(
                              "max-w-[80%] px-3 py-2 rounded-2xl text-xs",
                              msg.direction === "outgoing"
                                ? "bg-primary/10 text-primary rounded-tr-sm"
                                : "bg-muted/40 text-[var(--foreground)] rounded-tl-sm"
                            )}>
                              <p>{msg.text || <em className="opacity-50">[{msg.type}]</em>}</p>
                              <p className={cn(
                                "text-[10px] mt-1 opacity-60",
                                msg.direction === "outgoing" ? "text-right" : "text-left"
                              )}>
                                {format(new Date(msg.time), "MMM d HH:mm")}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "notes" && (
                    <div className="space-y-4">
                      {/* Add note */}
                      <div className="space-y-2">
                        <Textarea
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Add an internal note…"
                          rows={3}
                          className="text-sm resize-none"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || noteLoading}
                          className="gap-2"
                        >
                          {noteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Add Note
                        </Button>
                      </div>

                      {/* Notes list */}
                      <div className="space-y-3">
                        {detail.notes.length === 0 ? (
                          <div className="text-center py-8">
                            <StickyNote className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground italic">No notes yet.</p>
                          </div>
                        ) : (
                          detail.notes.map(note => (
                            <div key={note.id} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 group relative">
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <StickyNote className="h-3 w-3 text-amber-400" />
                                  <span className="text-[10px] font-semibold text-amber-400">{note.created_by}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-all"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-[var(--foreground)]">{note.note}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                  Failed to load lead details.
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
