"use client";

import React, { useEffect, useState } from "react";
import { Copy, Check, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface BlogAIGenerationResult {
  blog: {
    title: string;
    slug: string;
    short_description: string;
    content: string;
    reading_time: number | null;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  };
  extras: {
    tags: string[];
    faq: { question: string; answer: string }[];
    toc: { heading: string; anchor: string }[];
    image_prompt: string;
    cta: string;
  };
  usage: {
    provider: string;
    model: string;
    prompt_tokens: number | null;
    completion_tokens: number | null;
    total_tokens: number | null;
    estimated_cost: number | null;
    execution_time_ms: number | null;
  };
}

interface AIBlogStudioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: BlogAIGenerationResult) => void;
}

const TONES = [
  "Professional",
  "Casual",
  "Friendly",
  "Bold",
  "Educational",
  "Conversational",
  "Inspirational",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Arabic",
  "Portuguese",
  "Bengali",
];

const LENGTHS = [
  { label: "Short (~400 words)", value: "400" },
  { label: "Medium (~800 words)", value: "800" },
  { label: "Long (~1200 words)", value: "1200" },
  { label: "Extended (~2000 words)", value: "2000" },
];

function extractErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || "Blog generation failed. Please try again.";
  }
  return "Blog generation failed. Please try again.";
}

export default function AIBlogStudioModal({ open, onOpenChange, onApply }: AIBlogStudioModalProps) {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [language, setLanguage] = useState("");
  const [wordCount, setWordCount] = useState("");
  const [brand, setBrand] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BlogAIGenerationResult | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    if (open) {
      setResult(null);
      setError("");
      setCopiedPrompt(false);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a blog topic.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const res = await api.post("/blogs/ai/generate", {
        topic: topic.trim(),
        keywords: keywords.trim() || undefined,
        tone: tone || undefined,
        audience: audience.trim() || undefined,
        language: language || undefined,
        word_count: wordCount ? parseInt(wordCount, 10) : undefined,
        brand: brand.trim() || undefined,
      });
      setResult(res.data?.data ?? null);
      toast.success("Blog generated successfully!");
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!result?.extras.image_prompt) return;
    try {
      await navigator.clipboard.writeText(result.extras.image_prompt);
      setCopiedPrompt(true);
      toast.success("Image prompt copied.");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      toast.error("Failed to copy image prompt.");
    }
  };

  const fieldLabel = "block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]/70 text-[var(--foreground)]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <DialogTitle className="text-base">AI Blog Studio</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Describe your post and let AI draft a complete, SEO-ready blog for you.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-4 space-y-4">
          {/* ── Generate form ── */}
          {!result && (
            <div className="space-y-4">
              <div>
                <label className={fieldLabel}>
                  Blog Topic <span className="text-red-400">*</span>
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How AI Chatbots Improve Customer Support"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Keywords</label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="chatbots, customer support, AI"
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Target Audience</label>
                  <Input
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. SaaS founders"
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Tone</label>
                  <Select value={tone || undefined} onValueChange={setTone}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Professional" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={fieldLabel}>Language</label>
                  <Select value={language || undefined} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="English" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={fieldLabel}>Approx. Length</label>
                  <Select value={wordCount || undefined} onValueChange={setWordCount}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Medium (~800 words)" />
                    </SelectTrigger>
                    <SelectContent>
                      {LENGTHS.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Brand / Context (optional)</label>
                <Textarea
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Anything you want the article to reference about your product, company, or positioning..."
                  className="min-h-[72px]"
                />
              </div>
            </div>
          )}

          {/* ── Generating state ── */}
          {generating && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--muted-foreground)]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--foreground)]">Generating your blog...</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Writing a complete article with SEO meta, FAQ and image prompt. This can take up to a minute.
                </p>
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {error && !generating && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ── Result preview ── */}
          {result && !generating && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--border)] p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70 mb-1">Title</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">{result.blog.title}</p>
                </div>

                {result.blog.reading_time && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">~{result.blog.reading_time} min read</Badge>
                    <Badge variant="secondary">{result.blog.content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length} words</Badge>
                  </div>
                )}

                {result.extras.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.extras.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {result.blog.short_description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.extras.image_prompt && (
                  <div className="rounded-xl border border-[var(--border)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70">Image Prompt</p>
                      <button
                        type="button"
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                      >
                        {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedPrompt ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{result.extras.image_prompt}</p>
                  </div>
                )}

                {result.extras.cta && (
                  <div className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70 mb-2">Call to Action</p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{result.extras.cta}</p>
                  </div>
                )}

                {result.extras.faq.length > 0 && (
                  <div className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70 mb-2">
                      FAQ ({result.extras.faq.length} questions)
                    </p>
                    <ul className="space-y-1.5">
                      {result.extras.faq.slice(0, 3).map((f) => (
                        <li key={f.question} className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          <span className="text-[var(--foreground)] font-medium">{f.question}</span>
                        </li>
                      ))}
                      {result.extras.faq.length > 3 && (
                        <li className="text-xs text-[var(--muted-foreground)]/70">+{result.extras.faq.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}

                {result.extras.toc.length > 0 && (
                  <div className="rounded-xl border border-[var(--border)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70 mb-2">
                      Table of Contents ({result.extras.toc.length} sections)
                    </p>
                    <ul className="space-y-1.5">
                      {result.extras.toc.slice(0, 4).map((s) => (
                        <li key={s.anchor} className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          {s.heading}
                        </li>
                      ))}
                      {result.extras.toc.length > 4 && (
                        <li className="text-xs text-[var(--muted-foreground)]/70">+{result.extras.toc.length - 4} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap rounded-xl bg-[var(--muted)]/40 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]/70">AI Usage</p>
                <Badge variant="secondary">{result.usage.provider} · {result.usage.model}</Badge>
                {result.usage.total_tokens != null && (
                  <Badge variant="secondary">{result.usage.total_tokens} tokens</Badge>
                )}
                {result.usage.estimated_cost != null && (
                  <Badge variant="secondary">${result.usage.estimated_cost.toFixed(4)}</Badge>
                )}
                {result.usage.execution_time_ms != null && (
                  <Badge variant="secondary">{(result.usage.execution_time_ms / 1000).toFixed(1)}s</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[var(--border)]">
          {!result ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Generating..." : "Generate Blog"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setResult(null)}>
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
              <Button onClick={() => { onApply(result); onOpenChange(false); }}>
                <Sparkles className="w-4 h-4" />
                Apply to Blog Form
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
