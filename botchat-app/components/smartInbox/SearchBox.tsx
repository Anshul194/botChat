"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { motion } from "framer-motion";

interface SearchBoxProps {
    onOpenFilters: () => void;
    activeTab: "all" | "unread" | "starred" | "archived";
    setActiveTab: (tab: "all" | "unread" | "starred" | "archived") => void;
}

export default function SearchBox({ onOpenFilters, activeTab, setActiveTab }: SearchBoxProps) {
    const { search, setSearchQuery } = useSmartInbox();

    const tabs = [
        { id: "all", label: "All" },
        { id: "unread", label: "Unread" },
        { id: "starred", label: "Starred" },
        { id: "archived", label: "Archived" }
    ] as const;

    return (
        <div className="space-y-4">
            {/* Filter Tabs - Pill Style */}
            <div className="bg-neutral-100/50 dark:bg-black/20 p-1 rounded-2xl flex items-center border border-black/5 dark:border-white/5 shadow-inner">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-[14px] transition-all relative ${
                                isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeFilterTab"
                                    className="absolute inset-0 bg-primary rounded-[14px] shadow-lg shadow-primary/20 z-0"
                                />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Search Input Bar */}
            <div className="relative flex items-center gap-3 px-1">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search chats..."
                        className="w-full pl-10 pr-4 h-11 bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-black/5 dark:border-white/5 rounded-2xl text-[13px] font-medium outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-foreground placeholder:text-muted-foreground/50 shadow-sm"
                    />
                </div>
                <button
                    onClick={onOpenFilters}
                    className="w-11 h-11 flex items-center justify-center border border-black/5 dark:border-white/5 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-sm shadow-sm text-muted-foreground hover:text-primary transition-all hover:scale-105 active:scale-95"
                >
                    <SlidersHorizontal className="w-4.5 h-4.5" />
                </button>
            </div>
        </div>
    );
}

