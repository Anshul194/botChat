"use client";

import { motion } from "framer-motion";
import { Instagram, Sparkles, MessageSquare, Bot, Clock } from "lucide-react";

export default function InstagramBotReplies() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-2xl mb-8 relative"
            >
                <Instagram className="w-12 h-12 text-white" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 flex items-center justify-center shadow-lg"
                >
                    <Sparkles className="w-4 h-4 text-pink-500" />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-md space-y-4"
            >
                <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">
                    Instagram <span className="text-pink-500">Bot Logic</span>
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed">
                    We're building a powerful automation engine for your Instagram Business accounts. Coming extremely soon.
                </p>
                
                <div className="pt-8 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-pink-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Keyword Triggers</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center gap-2">
                        <Bot className="w-6 h-6 text-pink-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">AI Assistance</span>
                    </div>
                </div>

                <div className="pt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 text-sm font-bold border border-pink-100 dark:border-pink-900/30">
                        <Clock className="w-4 h-4 animate-pulse" />
                        Under Active Development
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
