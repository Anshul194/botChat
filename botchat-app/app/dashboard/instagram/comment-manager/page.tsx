"use client";

import { motion } from "framer-motion";
import { Instagram, LayoutGrid, MessageSquare, Zap, Target } from "lucide-react";

export default function InstagramCommentManager() {
    return (
        <div className="min-h-[85vh] p-8 space-y-8">
            {/* Header placeholder */}
            <div className="flex items-center justify-between border-b pb-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">Comment Hub</h1>
                        <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mt-1">Asset Directory</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="w-32 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                    <div className="w-32 h-12 rounded-xl bg-neutral-900 dark:bg-white animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-40 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 animate-pulse" />
                ))}
            </div>

            {/* Central Informational Layer */}
            <div className="relative overflow-hidden h-96 rounded-[3rem] bg-gradient-to-tr from-rose-50 to-indigo-50 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-center p-12">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-pink-500 blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-indigo-500 blur-3xl animate-pulse delay-700" />
                </div>
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl space-y-6 relative"
                >
                    <div className="w-20 h-20 rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl shadow-indigo-500/10 flex items-center justify-center mx-auto mb-8 border border-neutral-100 dark:border-neutral-800 transition-transform hover:rotate-6">
                        <Instagram className="w-10 h-10 text-pink-500" />
                    </div>
                    
                    <h2 className="text-4xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">
                        Refining <span className="text-pink-500 italic underline decoration-indigo-500/30">IG Hub</span>
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-lg leading-relaxed">
                        We're finalizing the integration with metabolic layers to provide seamless Instagram engagement. Hang tight, this will be worth it.
                    </p>
                    
                    <div className="flex items-center justify-center gap-6 pt-10 border-t border-neutral-200/50 dark:border-neutral-800/50">
                        <div className="flex items-center gap-2 group cursor-help transition-all hover:scale-105">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Auto Reply</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-help transition-all hover:scale-105">
                            <Target className="w-5 h-5 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Analytics</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-help transition-all hover:scale-105">
                            <LayoutGrid className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Assets</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
