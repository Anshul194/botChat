"use client";

import ConnectedAccounts from "./ConnectedAccounts";
import ConversationList from "./ConversationList";

interface SidebarProps {
    onOpenFilters: () => void;
}

export default function Sidebar({ onOpenFilters }: SidebarProps) {
    return (
        <div className="flex flex-col h-full gap-4 bg-card rounded-[2.25rem] p-5 border border-border/40 shadow-sm">
            {/* Connected Accounts Section */}
            <ConnectedAccounts />

            <hr className="border-border/40" />

            {/* Conversations Section */}
            <ConversationList onOpenFilters={onOpenFilters} />
        </div>
    );
}
