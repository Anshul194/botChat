"use client";

import { Search, SlidersHorizontal, Archive, BookmarkCheck, Inbox, MailOpen } from "lucide-react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
    onOpenFilters: () => void;
    activeTab: "all" | "unread" | "starred" | "archived";
    setActiveTab: (tab: "all" | "unread" | "starred" | "archived") => void;
}

const TABS: { id: "all" | "unread" | "starred" | "archived"; label: string; Icon: any }[] = [
    { id: "all", label: "All", Icon: Inbox },
    { id: "unread", label: "Unread", Icon: MailOpen },
    { id: "starred", label: "Starred", Icon: BookmarkCheck },
    { id: "archived", label: "Archive", Icon: Archive },
];

export default function SearchBox({ onOpenFilters, activeTab, setActiveTab }: SearchBoxProps) {
    const { search, setSearchQuery } = useSmartInbox();

    return (
        <div className="space-y-3">
            {/* ── Filter Tab Bar ── */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/40">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 outline-none min-w-0",
                                isActive
                                    ? "text-white"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="activeFilterTab"
                                    className="absolute inset-0 bg-primary rounded-lg shadow-md shadow-primary/25 z-0"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <tab.Icon
                                className={cn(
                                    "relative z-10 w-3 h-3 flex-shrink-0 transition-transform",
                                    isActive && "scale-110"
                                )}
                            />
                            <span className="relative z-10 hidden sm:inline truncate">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Search Bar ── */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations…"
                        className="w-full pl-9 pr-3 h-10 bg-background border border-border/50 rounded-xl text-[13px] font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground/40"
                    />
                </div>

                <button
                    onClick={onOpenFilters}
                    title="Advanced filters"
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-border/50 rounded-xl bg-background text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
