"use client";

import { useState } from "react";
import SearchBox from "./SearchBox";
import ConversationItem from "./ConversationItem";
import { useSmartInbox } from "@/hooks/useSmartInbox";

interface ConversationListProps {
    onOpenFilters: () => void;
}

export default function ConversationList({ onOpenFilters }: ConversationListProps) {
    const { conversations, loading } = useSmartInbox();
    const [activeTab, setActiveTab] = useState<"all" | "unread" | "starred" | "archived">("all");

    // Filter conversations dynamically
    const filteredConversations = conversations.filter((c) => {
        // Tab-specific filters
        if (activeTab === "archived") {
            if (!c.is_archived) return false;
        } else {
            if (c.is_archived) return false;
            if (activeTab === "unread" && c.unread_count === 0) return false;
            if (activeTab === "starred" && !c.is_starred) return false;
        }
        return true;
    });

    // Sort: is_pinned first, then last_message_at desc
    const sortedConversations = [...filteredConversations].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        const getTimestamp = (dateStr: string | null) => {
            if (!dateStr) return 0;
            const parsed = Date.parse(dateStr);
            if (!isNaN(parsed)) return parsed;
            const cleaned = dateStr.replace(/-/g, "/");
            const parsedCleaned = Date.parse(cleaned);
            return !isNaN(parsedCleaned) ? parsedCleaned : 0;
        };

        return getTimestamp(b.last_message_at) - getTimestamp(a.last_message_at);
    });

    return (
        <div className="flex flex-col h-full space-y-4">
            <SearchBox
                onOpenFilters={onOpenFilters}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 scrollbar-thin pr-0.5">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                <div className="w-11 h-11 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                                    <div className="h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedConversations.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground font-medium">
                        No conversations found
                    </div>
                ) : (
                    sortedConversations.map((c) => (
                        <ConversationItem key={c.id} conversation={c} />
                    ))
                )}
            </div>
        </div>
    );
}
