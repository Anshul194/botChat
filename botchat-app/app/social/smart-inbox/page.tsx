"use client";

import { useEffect, useRef, useState } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { useRealtimeInbox } from "@/hooks/useRealtimeInbox";
import Sidebar from "@/components/smartInbox/Sidebar";
import ChatWindow from "@/components/smartInbox/ChatWindow";
import ContactSidebar from "@/components/smartInbox/ContactSidebar";
import { ArrowLeft, UserCircle2 } from "lucide-react";

export default function SmartInboxPage() {
    // 1. Initialize Realtime Listeners (Laravel Reverb)
    useRealtimeInbox();

    // 2. Initialize Smart Inbox hook state & loaders
    const {
        selectedConversation,
        selectConversation,
        loadAccounts,
        loadConversations
    } = useSmartInbox();

    const [showContactSidebar, setShowContactSidebar] = useState(true);

    // Store functions in refs so useEffect only fires ONCE on mount.
    // If we put loadConversations directly in deps, it re-fires every time
    // selectedAccount changes (because loadConversations dep array changes),
    // which was causing the second spurious API call without account_id.
    const loadAccountsRef = useRef(loadAccounts);
    const loadConversationsRef = useRef(loadConversations);
    useEffect(() => {
        loadAccountsRef.current = loadAccounts;
        loadConversationsRef.current = loadConversations;
    });

    useEffect(() => {
        loadAccountsRef.current();
        loadConversationsRef.current({ is_archived: false });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentional mount-only

    return (
        <div className="flex h-[calc(100vh-100px)] w-full gap-4 overflow-hidden">
            {/* Column 1: Conversations List Pane (Hidden on mobile when chat is active) */}
            <div className={`w-full md:w-[340px] xl:w-[380px] flex-shrink-0 ${
                selectedConversation ? "hidden md:flex" : "flex"
            } flex-col h-full`}>
                <Sidebar onOpenFilters={() => {}} />
            </div>

            {/* Column 2: Active Chat Timeline (Hidden on mobile when list is active) */}
            <div className={`flex-1 flex flex-col h-full min-w-0 ${
                !selectedConversation ? "hidden md:flex" : "flex"
            }`}>
                {/* Back button header (only on mobile screens) */}
                {selectedConversation && (
                    <div className="flex items-center justify-between p-3.5 bg-card border border-border/40 rounded-2xl mb-3 md:hidden">
                        <button
                            onClick={() => selectConversation(null)}
                            className="flex items-center gap-1.5 text-xs font-black text-primary hover:text-opacity-80 transition-all cursor-pointer"
                        >
                            <ArrowLeft className="w-4.5 h-4.5" /> Back to chats
                        </button>
                        <button
                            onClick={() => setShowContactSidebar(!showContactSidebar)}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-muted-foreground transition-all"
                            title="Toggle profile"
                        >
                            <UserCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="flex-1 h-full min-h-0">
                    <ChatWindow />
                </div>
            </div>

            {/* Column 3: Contact details sidebar (hidden on small/medium screens by default) */}
            {selectedConversation && showContactSidebar && (
                <div className="hidden lg:flex w-[300px] xl:w-[330px] flex-shrink-0 flex-col h-full">
                    <ContactSidebar />
                </div>
            )}
        </div>
    );
}
