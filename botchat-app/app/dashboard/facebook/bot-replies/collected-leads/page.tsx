"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users, TrendingUp, CheckCircle2, AlertCircle, Loader2, Clock,
  Search, Filter, Download, Trash2, Tag, ChevronDown, ArrowUpDown,
  Facebook, Instagram, RotateCcw, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import leadsService, { Lead, LeadStats, LeadStatus } from "@/services/leadsService";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import api from "@/lib/api";

const STATUS_OPTIONS: { value: LeadStatus | ""; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "abandoned", label: "Abandoned" },
];

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  completed:   { label: "Completed",   color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  in_progress: { label: "In Progress", color: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
  abandoned:   { label: "Abandoned",   color: "bg-rose-500/15 text-rose-400 border-rose-500/25" },
};

const PRESET_TAGS = ["Interested", "Hot Lead", "Cold Lead", "Customer", "Support"];

export default function FacebookCollectedLeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [selectedPage, setSelectedPage] = useState<string>(searchParams.get("page_id") ?? "");
  const [selectedFlow, setSelectedFlow] = useState<string>(searchParams.get("bot_reply_id") ?? "");
  const [selectedTag, setSelectedTag] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [pages, setPages] = useState<{ id: number; page_id: string; page_name: string }[]>([]);
  const [flows, setFlows] = useState<{ id: number; name: string }[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Selection & Drawer
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSubscriberId, setDrawerSubscriberId] = useState<number | null>(null);
  const [drawerBotReplyId, setDrawerBotReplyId] = useState<number | null>(null);

  // Bulk
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkTagMenu, setShowBulkTagMenu] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout>();

  const buildParams = useCallback(() => ({
    channel: "facebook",
    ...(selectedPage ? { page_id: selectedPage } : {}),
    ...(selectedFlow ? { bot_reply_id: Number(selectedFlow) } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(selectedTag ? { tag: selectedTag } : {}),
    ...(search ? { search } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    page: currentPage,
    per_page: 20,
  }), [selectedPage, selectedFlow, statusFilter, selectedTag, search, dateFrom, dateTo, currentPage]);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await leadsService.getLeads(buildParams());
      setLeads(res.data || []);
      setTotalLeads(res.meta?.total || 0);
      setLastPage(res.meta?.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const data = await leadsService.getStats({
        channel: "facebook",
        ...(selectedPage ? { page_id: selectedPage } : {}),
        ...(selectedFlow ? { bot_reply_id: Number(selectedFlow) } : {}),
      });
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsStatsLoading(false);
    }
  }, [selectedPage, selectedFlow]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const res = await leadsService.getFilterOptions({
        channel: "facebook",
        ...(selectedPage ? { page_id: selectedPage } : {}),
      });
      setFlows(res.flows || []);
      setAvailableTags(res.tags || []);
    } catch (err) {
      console.error(err);
    }
  }, [selectedPage]);

  const loadPages = useCallback(async () => {
    try {
      const res = await api.get("/facebook/pages");
      setPages(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);
  useEffect(() => { loadFilterOptions(); }, [loadFilterOptions]);
  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(loadLeads, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [loadLeads]);

  const openLeadDrawer = (lead: Lead) => {
    setDrawerSubscriberId(lead.subscriber_id);
    setDrawerBotReplyId(lead.bot_reply_id);
    setDrawerOpen(true);
  };

  const toggleSelect = (key: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => `${l.subscriber_id}_${l.bot_reply_id}`)));
    }
  };

  const getSelectedLeadsArray = () =>
    leads
      .filter(l => selectedLeads.has(`${l.subscriber_id}_${l.bot_reply_id}`))
      .map(l => ({ subscriber_id: l.subscriber_id, bot_reply_id: l.bot_reply_id }));

  const handleBulkDelete = async () => {
    if (!selectedLeads.size) return;
    setBulkLoading(true);
    await leadsService.bulkAction("delete", getSelectedLeadsArray());
    setSelectedLeads(new Set());
    loadLeads();
    setBulkLoading(false);
  };

  const handleBulkTag = async (tag: string) => {
    if (!selectedLeads.size) return;
    setBulkLoading(true);
    await leadsService.bulkAction("tag", getSelectedLeadsArray(), tag);
    setSelectedLeads(new Set());
    setShowBulkTagMenu(false);
    loadLeads();
    setBulkLoading(false);
  };

  const handleExport = async (format: "csv" | "excel") => {
    try {
      await leadsService.downloadExport({
        channel: "facebook",
        ...(selectedPage ? { page_id: selectedPage } : {}),
        ...(selectedFlow ? { bot_reply_id: Number(selectedFlow) } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        format,
      });
    } catch (err) {
      console.error("Export download failed", err);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSelectedPage("");
    setSelectedFlow("");
    setSelectedTag("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const statCards = [
    { label: "Total Leads", value: stats?.total_leads ?? 0, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Today's Leads", value: stats?.today_leads ?? 0, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Completed", value: stats?.completed ?? 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Abandoned", value: stats?.abandoned ?? 0, icon: AlertCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Conversion", value: `${stats?.conversion_rate ?? 0}%`, icon: BarChart3, color: "text-amber-400", bg: "bg-amber-500/10" },
    {
      label: "Last Submission",
      value: stats?.last_submission ? formatDistanceToNow(new Date(stats.last_submission), { addSuffix: true }) : "—",
      icon: Clock,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Collected Leads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All subscriber answers collected by Facebook bot reply flows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")} className="gap-2">
            <Download className="h-3.5 w-3.5" />CSV
          </Button>
          <Button size="sm" onClick={() => handleExport("excel")} className="gap-2">
            <Download className="h-3.5 w-3.5" />Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]"
          >
            <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div className={cn("text-xl font-black", isStatsLoading ? "animate-pulse text-muted" : "text-[var(--foreground)]")}>
              {isStatsLoading ? "—" : value}
            </div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search subscribers, flow, email…"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Page filter */}
        <select
          value={selectedPage}
          onChange={e => { setSelectedPage(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Pages</option>
          {pages.map(p => <option key={p.page_id} value={p.page_id}>{p.page_name}</option>)}
        </select>

        {/* Flow filter */}
        <select
          value={selectedFlow}
          onChange={e => { setSelectedFlow(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Flows</option>
          {flows.map(f => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as LeadStatus | ""); setCurrentPage(1); }}
          className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Tag filter */}
        {availableTags.length > 0 && (
          <select
            value={selectedTag}
            onChange={e => { setSelectedTag(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Tags</option>
            {availableTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}

        {/* Date range */}
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
          className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <button onClick={resetFilters} className="p-2 rounded-xl border border-[var(--border)] hover:bg-muted/40 transition-colors" title="Reset filters">
          <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
        >
          <span className="text-xs font-semibold text-primary">{selectedLeads.size} selected</span>
          <div className="relative">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowBulkTagMenu(v => !v)}>
              <Tag className="h-3.5 w-3.5" />Tag<ChevronDown className="h-3 w-3" />
            </Button>
            {showBulkTagMenu && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl p-2 min-w-36">
                {PRESET_TAGS.map(t => (
                  <button key={t} onClick={() => handleBulkTag(t)}
                    className="w-full text-left text-xs px-3 py-2 hover:bg-muted/40 rounded-lg">{t}</button>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => handleExport("excel")} className="gap-2">
            <Download className="h-3.5 w-3.5" />Export Selected
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkLoading} className="gap-2">
            {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </Button>
        </motion.div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-muted/20">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === leads.length && leads.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                {["Subscriber", "Flow", "Platform / Page", "Progress", "Status", "Last Activity", ""].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted/40 rounded animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-muted-foreground">No leads found</p>
                    <p className="text-xs text-muted-foreground mt-1">Subscribers will appear here once they interact with flows containing User Input steps.</p>
                  </td>
                </tr>
              ) : (
                leads.map(lead => {
                  const key = `${lead.subscriber_id}_${lead.bot_reply_id}`;
                  const statusCfg = STATUS_CONFIG[lead.status];
                  return (
                    <tr
                      key={key}
                      className="border-b border-[var(--border)] hover:bg-muted/20 transition-colors cursor-pointer group"
                      onClick={() => openLeadDrawer(lead)}
                    >
                      <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleSelect(key); }}>
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(key)}
                          onChange={() => toggleSelect(key)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[var(--border)]">
                            <AvatarImage src={lead.profile_pic ?? ""} />
                            <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                              {(lead.subscriber_name || "?")[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold text-[var(--foreground)] group-hover:text-primary transition-colors truncate max-w-[140px]">
                              {lead.subscriber_name || "Unknown"}
                            </p>
                            {lead.email && <p className="text-[10px] text-muted-foreground truncate">{lead.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold truncate max-w-[160px]">{lead.flow_name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Facebook className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                            {lead.page_name || lead.facebook_page_id || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: lead.total_steps > 0 ? `${(lead.completed_answers / lead.total_steps) * 100}%` : "0%" }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {lead.completed_answers}/{lead.total_steps}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={cn("border text-[10px] font-semibold", statusCfg.color)}>
                          {statusCfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {lead.last_interaction
                            ? formatDistanceToNow(new Date(lead.last_interaction), { addSuffix: true })
                            : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              {tag}
                            </span>
                          ))}
                          {lead.tags.length > 2 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                              +{lead.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)]">
            <p className="text-xs text-muted-foreground">
              Showing {leads.length} of {totalLeads} leads
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">{currentPage} / {lastPage}</span>
              <Button
                variant="outline" size="sm"
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage(p => Math.min(lastPage, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Drawer */}
      <LeadDetailDrawer
        open={drawerOpen}
        subscriberId={drawerSubscriberId}
        botReplyId={drawerBotReplyId}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
