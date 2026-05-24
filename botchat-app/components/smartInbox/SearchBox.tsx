"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useSmartInbox } from "@/hooks/useSmartInbox";

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
        <div className="space-y-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-border/20">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? "bg-primary text-white shadow-sm"
                                : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search Input Bar */}
            <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border/40 rounded-xl text-xs outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                    />
                </div>
                <button
                    onClick={onOpenFilters}
                    className="p-2 border border-border/40 rounded-xl bg-card hover:bg-neutral-50 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground active:scale-95 transition-all flex-shrink-0"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
