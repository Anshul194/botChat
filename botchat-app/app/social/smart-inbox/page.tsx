"use client";

import { useEffect, useRef, useState } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { useRealtimeInbox } from "@/hooks/useRealtimeInbox";
import Sidebar from "@/components/smartInbox/Sidebar";
import ChatWindow from "@/components/smartInbox/ChatWindow";
import ContactSidebar from "@/components/smartInbox/ContactSidebar";
import ConnectedAccounts from "@/components/smartInbox/ConnectedAccounts";
import QuickFind from "@/components/smartInbox/QuickFind";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

    const [showContactSidebar, setShowContactSidebar] = useState(false);

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
        <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
            {/* Top Header: Connected Accounts & Quick Actions */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-2 border-b border-border bg-card shadow-sm z-50">
                <div className="flex flex-1 items-center gap-6 overflow-hidden">
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest hidden lg:block border-r border-border pr-6">Connected Channels</h2>
                    <div className="flex-1 overflow-hidden">
                        <ConnectedAccounts />
                    </div>
                </div>
                
                <div className="flex items-center gap-4 pl-6 border-l border-border ml-6">
                    {/* Quick Find Dropdown Component */}
                    <QuickFind />
                    
                    <button className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-lg shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                        <UserCircle2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Column 1: Conversations List Pane */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-border ${
                        selectedConversation ? "hidden md:flex" : "flex"
                    } flex-col h-full bg-card`}
                >
                    <Sidebar onOpenFilters={() => {}} />
                </motion.div>

                {/* Column 2: Active Chat Timeline */}
                <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex-1 flex flex-col h-full min-w-0 ${
                        !selectedConversation ? "hidden md:flex" : "flex"
                    } relative bg-background`}
                >
                    {/* Mobile Back Header */}
                    {selectedConversation && (
                        <div className="flex items-center justify-between p-4 bg-background border-b border-border md:hidden">
                            <button
                                onClick={() => selectConversation(null)}
                                className="flex items-center gap-2 text-sm font-semibold text-primary"
                            >
                                <ArrowLeft className="w-5 h-5" /> Conversations
                            </button>
                            <button
                                onClick={() => setShowContactSidebar(!showContactSidebar)}
                                className="p-2 text-muted-foreground"
                            >
                                <UserCircle2 className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                    <div className="flex-1 h-full min-h-0">
                        <ChatWindow onProfileClick={() => setShowContactSidebar(!showContactSidebar)} />
                    </div>

                    {/* Overlay Contact Sidebar (Slide-in from right) */}
                    <AnimatePresence>
                        {selectedConversation && showContactSidebar && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowContactSidebar(false)}
                                    className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
                                />
                                <motion.div 
                                    initial={{ opacity: 0, x: 380 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 380 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="absolute inset-y-0 right-0 z-50 w-full md:w-[380px] bg-card border-l border-border shadow-2xl flex flex-col"
                                >
                                    <div className="p-4 flex items-center justify-between border-b border-border bg-muted/30">
                                        <h3 className="text-sm font-bold uppercase tracking-wider">Contact Info</h3>
                                        <button 
                                            onClick={() => setShowContactSidebar(false)}
                                            className="p-2 hover:bg-muted rounded-full transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5 rotate-180" />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <ContactSidebar />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}




