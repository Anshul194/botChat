"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Trash2, Edit3, X, Sparkles, 
  ChevronLeft, Hash, Loader2, Check, RefreshCw, 
  Clock, Smile, Settings, Eye, EyeOff, MessageCircle, 
  LayoutGrid, Image as ImageIcon, Video, Filter, Info, Send,
  Target, BarChart3, List, MousePointer2, Megaphone
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// Note: Reusing the same builder logic as templates for consistency
import { ReplyTemplate, FilterRule } from "../reply-templates/page"; // If I could export them, but better to redefine or keep standalone

export default function AutoReplyPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number|null>(null);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // In this project, auto-reply campaigns are often handled by the same template endpoint or a specific one
      const res = await api.get("/facebook/auto-reply-template"); 
      setCampaigns(Array.isArray(res.data?.data) ? res.data.data : res.data);
    } catch { toast.error("Failed to load campaigns"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleDelete = async (id:number) => {
    try {
      await api.delete(`/facebook/auto-reply-template/${id}`);
      toast.success("Safe successfully!");
      setCampaigns(campaigns.filter(c=>c.id!==id));
      setDeleteId(null);
    } catch { toast.error("Delete failed"); }
  };

  const filtered = campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f172a] font-sans pb-20">
      {/* 1. Header Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center sticky top-0 z-40 shadow-xs">
         <div className="max-w-[1400px] w-full px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 rounded-[22px] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Megaphone className="w-6 h-6"/>
               </div>
               <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Auto Reply Campaigns</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Scale your engagement</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={()=>router.push("/dashboard/facebook/reply-templates")} className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-[12px] hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                  <LayoutGrid className="w-4 h-4"/> MANAGE TEMPLATES
               </button>
               <button onClick={()=>router.push("/dashboard/facebook/reply-templates")} className="px-8 py-3.5 rounded-2xl bg-indigo-600 text-white font-black text-[12px] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2">
                  <Plus className="w-5 h-5"/> NEW CAMPAIGN
               </button>
            </div>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10 space-y-10">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: "Total Campaigns", val: campaigns.length, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
             { label: "Replies Sent", val: "1.2k", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
             { label: "Avg. Response", val: "2s", icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
             { label: "Conversion Rate", val: "18%", icon: BarChart3, color: "text-purple-600", bg: "bg-purple-50" },
           ].map(s=>(
             <div key={s.label} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:scale-[1.02] hover:shadow-md cursor-default group">
                <div className={cn("w-14 h-14 rounded-[22px] flex items-center justify-center transition-all group-hover:rotate-6", s.bg, s.color)}>
                   <s.icon className="w-6 h-6"/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{s.val}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Search controls */}
        <div className="flex items-center justify-between gap-6 bg-white p-4 rounded-[28px] border border-slate-100 shadow-xs">
           <div className="flex items-center gap-3 px-4">
              <Filter className="w-4 h-4 text-slate-400"/>
              <span className="text-[12px] font-black text-slate-800 uppercase tracking-widest">Active Filters</span>
           </div>
           <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input type="text" placeholder="Search campaign by name or post ID…" value={search} onChange={e=>setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 outline-none font-medium transition-all"
              />
           </div>
           <div className="flex items-center gap-2 pr-2">
              <button onClick={fetchCampaigns} className="p-3.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                 <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")}/>
              </button>
           </div>
        </div>

        {/* List View */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
           <div className="grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-8 px-10 py-6 bg-slate-50/50 border-b border-slate-50">
              {["Campaign Details","Logic Type","Engagement","Status","Actions"].map(h=>(
                <span key={h} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
              ))}
           </div>
           
           {isLoading ? (
             <div className="p-32 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"/>
                <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest">Syncing with Meta Data...</p>
             </div>
           ) : filtered.length === 0 ? (
             <div className="p-32 text-center">
                <div className="w-24 h-24 rounded-[40px] bg-slate-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                   <Megaphone className="w-10 h-10 text-slate-200"/>
                </div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Zero Campaigns Detected</h3>
                <p className="text-sm text-slate-400 italic mt-3 max-w-xs mx-auto">Start capturing potential leads by creating your first comment-to-inbox workflow.</p>
                <button onClick={()=>router.push("/dashboard/facebook/reply-templates")} className="mt-8 px-10 py-4 rounded-2xl bg-indigo-600 text-white font-black text-[12px] shadow-xl shadow-indigo-100 active:scale-95 transition-all uppercase">
                   Initialize First Campaign
                </button>
             </div>
           ) : (
             <div className="divide-y divide-slate-50">
               {filtered.map(c=>(
                 <div key={c.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-8 px-10 py-8 items-center hover:bg-slate-50/30 transition-all group">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs overflow-hidden relative">
                          <ImageIcon className="w-6 h-6"/>
                          <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-all"/>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[17px] font-black text-slate-900 block group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{c.name}</span>
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                             <Target className="w-3 h-3"/> Post ID: {c.id}56789...
                          </span>
                       </div>
                    </div>
                    <div>
                       <span className={cn(
                         "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border",
                         c.reply_type === "filtered" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                       )}>
                          {c.reply_type}
                       </span>
                    </div>
                    <div className="flex flex-col gap-1">
                       <span className="text-[15px] font-black text-slate-700">124 <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Replies</span></span>
                       <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-indigo-500"/>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"/>
                       <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={()=>router.push("/dashboard/facebook/reply-templates")} className="p-3.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90">
                          <Edit3 className="w-4 h-4"/>
                       </button>
                       <button onClick={()=>setDeleteId(c.id)} className="p-3.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90">
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
        {deleteId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/5backdrop-blur-sm">
             <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-[40px] p-10 max-w-sm w-full text-center shadow-2xl border border-slate-100">
                <Trash2 className="w-14 h-14 text-rose-500 mx-auto mb-8 bg-rose-50 rounded-full p-4"/>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Terminate Campaign?</h3>
                <p className="text-[13px] text-slate-400 mt-5 leading-relaxed font-semibold italic">Deleting this campaign will immediately stop all automated interactions for the associated post.</p>
                <div className="flex gap-4 mt-12">
                   <button onClick={()=>setDeleteId(null)} className="flex-1 py-4.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[13px] hover:bg-slate-200 transition-all uppercase tracking-widest">Abort</button>
                   <button onClick={()=>handleDelete(deleteId!!)} className="flex-[1.5] py-4.5 rounded-2xl bg-rose-600 text-white font-black text-[13px] shadow-xl shadow-rose-200 active:scale-95 transition-all uppercase tracking-widest">Confirm Death</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
