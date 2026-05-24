"use client";

import ConnectedAccounts from "./ConnectedAccounts";
import ConversationList from "./ConversationList";

interface SidebarProps {
    onOpenFilters: () => void;
}

export default function Sidebar({ onOpenFilters }: SidebarProps) {
    return (
        <div className="flex flex-col h-full bg-card overflow-hidden">
            {/* Conversations Section */}
            <div className="flex-1 min-h-0 flex flex-col p-4">
                <ConversationList onOpenFilters={onOpenFilters} />
            </div>

        </div>
    );
}


