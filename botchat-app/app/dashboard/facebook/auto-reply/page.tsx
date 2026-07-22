"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Plus, Search, Trash2, Edit3,
   ChevronLeft, Loader2, RefreshCw,
   Clock, Filter, Send,
   Target, BarChart3, Megaphone, LayoutGrid, Image as ImageIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AutoReplyPage() {
   const router = useRouter();
   const [campaigns, setCampaigns] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [search, setSearch] = useState("");
   const [deleteId, setDeleteId] = useState<number | null>(null);

   const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
         const res = await api.get("/facebook/auto-reply-template");
         setCampaigns(Array.isArray(res.data?.data) ? res.data.data : res.data);
      } catch { toast.error("Failed to load campaigns"); }
      finally { setIsLoading(false); }
   };

   useEffect(() => { fetchCampaigns(); }, []);

   const handleDelete = async (id: number) => {
      try {
         await api.delete(`/facebook/auto-reply-template/${id}`);
         toast.success("Campaign deleted successfully!");
         setCampaigns(campaigns.filter(c => c.id !== id));
         setDeleteId(null);
      } catch { toast.error("Delete failed"); }
   };

   const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

   return (
      <div className="bg-[var(--background)] pb-20">
         {/* ── Header ─────────────────────────────────────────────────── */}
         <div className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-[50] shadow-sm">
            <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3">
               <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                  <button
                     onClick={() => router.back()}
                     className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[#0866FF] hover:border-[#0866FF]/30 transition-all shrink-0"
                  >
                     <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <div className="min-w-0">
                     <p className="text-[9px] sm:text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest leading-none truncate">Facebook Automation</p>
                     <h1 className="text-base sm:text-xl lg:text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter mt-0.5 sm:mt-1 truncate">Auto Reply Campaigns</h1>
                  </div>
               </div>
               <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                     onClick={() => router.push("/dashboard/facebook/reply-templates")}
                     className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-bold text-[11px] uppercase tracking-widest transition-all"
                  >
                     <LayoutGrid className="w-4 h-4" /> Manage Templates
                  </button>
                  <button
                     onClick={() => router.push("/dashboard/facebook/reply-templates")}
                     className="flex items-center gap-2 px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-xl bg-[#0866FF] text-white font-black text-[10px] sm:text-[12px] shadow-xl shadow-[#0866FF]/20 active:scale-95 transition-all uppercase tracking-widest"
                  >
                     <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                     <span className="hidden xs:inline">New</span> Campaign
                  </button>
               </div>
            </div>
         </div>

         <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                  { label: "Total Campaigns", val: campaigns.length, icon: Target, color: "text-[#0866FF]", bg: "bg-[#0866FF]/10" },
                  { label: "Replies Sent", val: "1.2k", icon: Send, color: "text-emerald-600", bg: "bg-emerald-500/10" },
                  { label: "Avg. Response", val: "2s", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
                  { label: "Conversion Rate", val: "18%", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-500/10" },
               ].map(s => (
                  <div key={s.label} className="bg-[var(--card)] p-4 sm:p-6 rounded-2xl sm:rounded-2xl border border-[var(--border)] shadow-sm flex items-center gap-4 transition-all hover:shadow-md cursor-default group">
                     <div className={cn("w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-[20px] flex items-center justify-center transition-all group-hover:scale-110 shrink-0", s.bg, s.color)}>
                        <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                     </div>
                     <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest leading-none mb-1">{s.label}</p>
                        <p className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight leading-none">{s.val}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-3 bg-[var(--card)] p-3 sm:p-4 rounded-2xl sm:rounded-2xl border border-[var(--border)] shadow-sm">
               <div className="flex items-center gap-2 px-2 sm:px-3 shrink-0">
                  <Filter className="w-4 h-4 text-[var(--muted-foreground)]" />
                  <span className="hidden sm:block text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest">Filters</span>
               </div>
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input
                     type="text"
                     placeholder="Search campaigns…"
                     value={search}
                     onChange={e => setSearch(e.target.value)}
                     className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--muted)]/50 border border-transparent focus:border-[#0866FF]/40 focus:ring-2 focus:ring-[#0866FF]/10 outline-none text-[var(--foreground)] font-medium text-sm transition-all placeholder:text-[var(--muted-foreground)]"
                  />
               </div>
               <button
                  onClick={fetchCampaigns}
                  className="p-2.5 sm:p-3 rounded-xl text-[var(--muted-foreground)] hover:text-[#0866FF] hover:bg-[#0866FF]/10 transition-all shrink-0"
               >
                  <RefreshCw className={cn("w-4 h-4 sm:w-5 sm:h-5", isLoading && "animate-spin")} />
               </button>
            </div>

            {/* List */}
            <div className="bg-[var(--card)] rounded-[24px] sm:rounded-[36px] border border-[var(--border)] shadow-sm overflow-hidden">
               {/* Table header — hidden on mobile */}
               <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-8 px-10 py-5 bg-[var(--muted)]/30 border-b border-[var(--border)]">
                  {["Campaign Details", "Logic Type", "Engagement", "Status", "Actions"].map(h => (
                     <span key={h} className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">{h}</span>
                  ))}
               </div>

               {isLoading ? (
                  <div className="p-20 sm:p-32 text-center flex flex-col items-center gap-6">
                     <div className="w-14 h-14 rounded-full border-4 border-[#0866FF]/20 border-t-[#0866FF] animate-spin" />
                     <p className="text-[12px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Syncing with Meta…</p>
                  </div>
               ) : filtered.length === 0 ? (
                  <div className="py-24 sm:py-32 text-center px-8">
                     <div className="w-20 h-20 rounded-2xl bg-[#0866FF]/10 flex items-center justify-center mx-auto mb-6">
                        <Megaphone className="w-9 h-9 text-[#0866FF]" />
                     </div>
                     <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] uppercase tracking-tight">No Campaigns Yet</h3>
                     <p className="text-sm text-[var(--muted-foreground)] mt-3 max-w-xs mx-auto font-medium">Create your first auto reply campaign to start automating Facebook interactions.</p>
                     <button
                        onClick={() => router.push("/dashboard/facebook/reply-templates")}
                        className="mt-8 px-8 py-3 rounded-xl bg-[#0866FF] text-white font-black text-[12px] shadow-xl shadow-[#0866FF]/25 active:scale-95 transition-all uppercase tracking-widest"
                     >
                        Create First Campaign
                     </button>
                  </div>
               ) : (
                  <div className="divide-y divide-[var(--border)]">
                     {filtered.map(c => (
                        <div key={c.id} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 md:gap-8 px-5 md:px-10 py-5 md:py-8 items-start md:items-center hover:bg-[var(--muted)]/20 transition-all group border-b border-transparent last:border-0">
                           {/* Campaign name */}
                           <div className="flex items-center gap-4 w-full">
                              <div className="w-12 h-12 rounded-[20px] bg-[#0866FF]/10 flex items-center justify-center text-[#0866FF] group-hover:bg-[#0866FF] group-hover:text-white transition-all shadow-sm shrink-0">
                                 <ImageIcon className="w-5 h-5" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                 <span className="text-[15px] font-black text-[var(--foreground)] block group-hover:text-[#0866FF] transition-colors uppercase tracking-tight truncate">{c.name}</span>
                                 <span className="text-[11px] font-bold text-[var(--muted-foreground)] flex items-center gap-1 uppercase tracking-wide">
                                    <Target className="w-3 h-3 shrink-0" /> ID: {c.id}
                                 </span>
                              </div>
                           </div>

                           {/* Mobile: supplemental info row */}
                           <div className="flex md:hidden flex-wrap items-center gap-3 w-full border-t border-[var(--border)] pt-3">
                              <span className={cn(
                                 "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                 c.reply_type === "filter" ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : "bg-[#0866FF]/10 text-[#0866FF] border-[#0866FF]/20"
                              )}>
                                 {c.reply_type ?? "generic"}
                              </span>
                              <span className="flex items-center gap-1.5 text-[11px] font-black text-[var(--muted-foreground)] uppercase">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                              </span>
                              <div className="ml-auto flex items-center gap-2">
                                 <button onClick={() => router.push("/dashboard/facebook/reply-templates")} className="p-2 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[#0866FF] hover:bg-[#0866FF]/10 transition-all">
                                    <Edit3 className="w-3.5 h-3.5" />
                                 </button>
                                 <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-rose-600 hover:bg-rose-500/10 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                           </div>

                           {/* Desktop-only cells */}
                           <div className="hidden md:block">
                              <span className={cn(
                                 "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                 c.reply_type === "filter" ? "bg-purple-500/10 text-purple-600 border-purple-500/20" : "bg-[#0866FF]/10 text-[#0866FF] border-[#0866FF]/20"
                              )}>
                                 {c.reply_type ?? "generic"}
                              </span>
                           </div>
                           <div className="hidden md:flex flex-col gap-1">
                              <span className="text-[14px] font-black text-[var(--foreground)]">—<span className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase ml-1">Replies</span></span>
                              <div className="w-20 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                 <div className="w-3/4 h-full bg-[#0866FF] rounded-full" />
                              </div>
                           </div>
                           <div className="hidden md:flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                              <span className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest">Active</span>
                           </div>
                           <div className="hidden md:flex items-center gap-2">
                              <button onClick={() => router.push("/dashboard/facebook/reply-templates")} className="p-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[#0866FF] hover:bg-[#0866FF]/10 transition-all active:scale-90">
                                 <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteId(c.id)} className="p-3 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-rose-600 hover:bg-rose-500/10 transition-all active:scale-90">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Delete modal */}
         <AnimatePresence>
            {deleteId && (
               <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                     onClick={() => setDeleteId(null)}
                  />
                  <motion.div
                     initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
                     transition={{ type: "spring", damping: 28, stiffness: 320 }}
                     className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-t-[32px] sm:rounded-2xl p-8 sm:p-10 w-full max-w-sm text-center shadow-2xl"
                  >
                     <div className="w-16 h-16 rounded-[24px] bg-rose-500/10 flex items-center justify-center mx-auto mb-5">
                        <Trash2 className="w-8 h-8 text-rose-500" />
                     </div>
                     <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight leading-none">Delete Campaign?</h3>
                     <p className="text-[13px] text-[var(--muted-foreground)] mt-4 leading-relaxed font-medium">Deleting this campaign will immediately stop all automated interactions.</p>
                     <div className="flex gap-3 mt-8">
                        <button
                           onClick={() => setDeleteId(null)}
                           className="flex-1 py-3 rounded-2xl border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] transition-all bg-[var(--card)] flex items-center justify-center gap-1.5 font-bold text-[12px] uppercase tracking-widest active:scale-95 cursor-pointer"
                        >
                           <ChevronLeft className="w-4 h-4" />
                           <span>Back</span>
                        </button>
                        <button
                           onClick={() => handleDelete(deleteId!)}
                           className="flex-[1.4] py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[12px] uppercase tracking-widest shadow-xl shadow-rose-600/25 active:scale-95 transition-all"
                        >
                           Delete
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
