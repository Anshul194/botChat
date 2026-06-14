"use client";

import { useEffect, useRef, useState } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { useRealtimeInbox } from "@/hooks/useRealtimeInbox";
import Sidebar from "@/components/smartInbox/Sidebar";
import ChatWindow from "@/components/smartInbox/ChatWindow";
import ContactSidebar from "@/components/smartInbox/ContactSidebar";
import ConnectedAccounts from "@/components/smartInbox/ConnectedAccounts";
import QuickFind from "@/components/smartInbox/QuickFind";
import { ArrowLeft, MessagesSquare, Search, UserCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SmartInboxPage() {
    useRealtimeInbox();

    const {
        selectedConversation,
        selectConversation,
        loadAccounts,
        loadConversations,
    } = useSmartInbox();

    const [showContactSidebar, setShowContactSidebar] = useState(false);
    const [showQuickFind, setShowQuickFind] = useState(false);

    const loadAccountsRef = useRef(loadAccounts);
    const loadConversationsRef = useRef(loadConversations);
    useEffect(() => {
        loadAccountsRef.current = loadAccounts;
        loadConversationsRef.current = loadConversations;
    });

    useEffect(() => {
        loadAccountsRef.current();
        loadConversationsRef.current({ is_archived: false });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden" style={{ background: "var(--background)" }}>

            {/* ══════════════════════════════════════
                TOP HEADER — Platform filter bar
            ══════════════════════════════════════ */}
            <header
                className="flex-shrink-0 flex items-center gap-4 px-4 sm:px-6 border-b"
                style={{
                    background: "var(--card)",
                    borderColor: "var(--glass-border)",
                    minHeight: 56,
                }}
            >
                {/* Left: page identity */}
                <div className="flex items-center gap-2.5 flex-shrink-0 pr-4 border-r" style={{ borderColor: "var(--glass-border)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--nav-active-bg)" }}>
                        <MessagesSquare className="w-4 h-4" style={{ color: "var(--primary)" }} />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-[11px] font-black uppercase tracking-widest leading-none" style={{ color: "var(--muted-foreground)" }}>
                            Smart Inbox
                        </p>
                    </div>
                </div>

                {/* Centre: platform account filter — scrollable */}
                <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin">
                    <ConnectedAccounts />
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-shrink-0 pl-4 border-l" style={{ borderColor: "var(--glass-border)" }}>
                    <div className="hidden md:block">
                        <QuickFind />
                    </div>
                    <button
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
                        onClick={() => setShowQuickFind(v => !v)}
                        aria-label="Search"
                    >
                        <Search className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    </button>
                </div>
            </header>

            {/* ══════════════════════════════════════
                MAIN LAYOUT
            ══════════════════════════════════════ */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── Conversations sidebar ── */}
                <div
                    className={[
                        "flex-shrink-0 border-r flex flex-col h-full transition-all duration-300",
                        // Mobile: full-width when no conversation, hidden when one is open
                        selectedConversation
                            ? "hidden md:flex"
                            : "flex w-full",
                        // Desktop widths
                        "md:w-[300px] lg:w-[320px] xl:w-[360px]",
                    ].join(" ")}
                    style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}
                >
                    <Sidebar onOpenFilters={() => { }} />
                </div>

                {/* ── Chat area ── */}
                <div
                    className={[
                        "flex-1 flex flex-col h-full min-w-0 relative",
                        !selectedConversation ? "hidden md:flex" : "flex",
                    ].join(" ")}
                    style={{ background: "var(--background)" }}
                >
                    {/* Mobile back bar */}
                    {selectedConversation && (
                        <div
                            className="md:hidden flex-shrink-0 flex items-center justify-between px-4 py-3 border-b"
                            style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}
                        >
                            <button
                                onClick={() => selectConversation(null)}
                                className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
                                style={{ color: "var(--primary)" }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Conversations
                            </button>
                            <button
                                onClick={() => setShowContactSidebar(v => !v)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:opacity-80"
                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
                            >
                                <UserCircle2 className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} />
                            </button>
                        </div>
                    )}

                    {/* Empty state (desktop) */}
                    {!selectedConversation && (
                        <div className="hidden md:flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{ background: "var(--nav-active-bg)" }}
                            >
                                <MessagesSquare className="w-7 h-7" style={{ color: "var(--primary)", opacity: 0.6 }} />
                            </div>
                            <div>
                                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Select a conversation</p>
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                                    Choose from the list on the left to start chatting
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={`flex-1 min-h-0 ${!selectedConversation ? "hidden md:block" : "block"}`}>
                        <ChatWindow onProfileClick={() => setShowContactSidebar(v => !v)} />
                    </div>

                    {/* ── Contact Info slide-in panel ── */}
                    <AnimatePresence>
                        {selectedConversation && showContactSidebar && (
                            <>
                                <motion.div
                                    key="cb"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowContactSidebar(false)}
                                    className="absolute inset-0 z-40"
                                    style={{ background: "rgba(0,0,0,0.18)", backdropFilter: "blur(2px)" }}
                                />
                                <motion.div
                                    key="cp"
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "spring", damping: 26, stiffness: 220 }}
                                    className="absolute inset-y-0 right-0 z-50 w-full sm:w-[340px] md:w-[360px] flex flex-col shadow-2xl"
                                    style={{ background: "var(--card)", borderLeft: "1px solid var(--glass-border)" }}
                                >
                                    <div
                                        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 border-b"
                                        style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)" }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <UserCircle2 className="w-4 h-4" style={{ color: "var(--primary)" }} />
                                            <h3 className="text-sm font-bold tracking-wide" style={{ color: "var(--foreground)" }}>
                                                Contact Info
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setShowContactSidebar(false)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:opacity-70"
                                            style={{ background: "var(--glass-border)" }}
                                        >
                                            <X className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <ContactSidebar />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
