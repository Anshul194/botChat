"use client";

import { useEffect, useRef } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";
import { Star, Pin, Archive, VolumeX, MoreVertical, ShieldAlert } from "lucide-react";
import { isSameDay, parseISO, format } from "date-fns";

export default function ChatWindow() {
    const {
        selectedConversation,
        messages,
        typingUsers,
        onlineUsers,
        toggleStarChat,
        togglePinChat,
        toggleArchiveChat,
        toggleMuteChat
    } = useSmartInbox();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat when messages update or typing starts
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, typingUsers]);

    if (!selectedConversation) {
        return <EmptyState type="no-conversation" />;
    }

    const isOnline = onlineUsers[selectedConversation.customer_id] ?? selectedConversation.is_online;
    const isTyping = typingUsers[selectedConversation.id] !== null && typingUsers[selectedConversation.id] !== undefined;

    // Helper to group messages by date
    const renderMessagesWithDividers = () => {
        const elements: React.ReactNode[] = [];
        let lastDate: Date | null = null;

        messages.forEach((msg) => {
            // Fallback: use created_at if sent_at is missing
            const rawDate = (msg as any).sent_at || (msg as any).created_at;

            let msgDate: Date | null = null;
            try {
                if (rawDate) {
                    // Handle both ISO ("2026-05-20T...") and MySQL ("2026-05-20 05:40:26")
                    const normalized = typeof rawDate === 'string'
                        ? rawDate.replace(' ', 'T').replace(/(\.\d+)?$/, '')
                        : String(rawDate);
                    msgDate = parseISO(normalized);
                    if (isNaN(msgDate.getTime())) msgDate = new Date(rawDate);
                    if (isNaN(msgDate.getTime())) msgDate = null;
                }
            } catch {
                msgDate = null;
            }

            // Date divider
            if (msgDate) {
                try {
                    if (!lastDate || !isSameDay(lastDate, msgDate)) {
                        elements.push(
                            <div key={`date-${msg.id}`} className="flex justify-center my-6">
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-3 py-1 bg-neutral-50 dark:bg-neutral-900 border border-border/20 rounded-full">
                                    {format(msgDate, "eeee, MMMM d, yyyy")}
                                </span>
                            </div>
                        );
                        lastDate = msgDate;
                    }
                } catch {
                    // date format failed — skip divider but still render message
                }
            }

            elements.push(<MessageBubble key={msg.id} message={msg} />);
        });

        return elements;
    };

    return (
        <div className="flex flex-col h-full bg-card rounded-[2.25rem] border border-border/40 overflow-hidden shadow-sm">
            {/* Active Customer Profile Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {selectedConversation.customer_avatar ? (
                            <img
                                src={selectedConversation.customer_avatar}
                                alt={selectedConversation.customer_name ?? 'User'}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                {(selectedConversation.customer_name ?? '?')[0]?.toUpperCase()}
                            </div>
                        )}
                        {isOnline && (
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full border border-card bg-emerald-500 shadow-sm" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-foreground flex items-center gap-1.5">
                            {selectedConversation.customer_name}
                            <span className={`text-[10px] font-black ${isOnline ? "text-emerald-500" : "text-muted-foreground"}`}>
                                • {isOnline ? "Online" : "Offline"}
                            </span>
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                            {selectedConversation.platform === "instagram" ? "Instagram DM" : "Facebook Messenger"}
                        </p>
                    </div>
                </div>

                {/* Conversation flags control */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => togglePinChat(selectedConversation.id, !selectedConversation.is_pinned)}
                        className={`p-2 rounded-xl transition-all border ${
                            selectedConversation.is_pinned
                                ? "bg-amber-50 border-amber-200 text-amber-500 dark:bg-amber-950/20"
                                : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground"
                        }`}
                        title={selectedConversation.is_pinned ? "Unpin Conversation" : "Pin Conversation"}
                    >
                        <Pin className="w-4 h-4 rotate-45" />
                    </button>
                    <button
                        onClick={() => toggleStarChat(selectedConversation.id, !selectedConversation.is_starred)}
                        className={`p-2 rounded-xl transition-all border ${
                            selectedConversation.is_starred
                                ? "bg-yellow-50 border-yellow-200 text-yellow-500 dark:bg-yellow-950/20"
                                : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground"
                        }`}
                        title={selectedConversation.is_starred ? "Unstar Conversation" : "Star Conversation"}
                    >
                        <Star className={`w-4 h-4 ${selectedConversation.is_starred ? "fill-current" : ""}`} />
                    </button>
                    <button
                        onClick={() => toggleArchiveChat(selectedConversation.id, !selectedConversation.is_archived)}
                        className={`p-2 rounded-xl transition-all border ${
                            selectedConversation.is_archived
                                ? "bg-purple-50 border-purple-200 text-purple-500 dark:bg-purple-950/20"
                                : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground"
                        }`}
                        title={selectedConversation.is_archived ? "Unarchive Conversation" : "Archive Conversation"}
                    >
                        <Archive className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => toggleMuteChat(selectedConversation.id, !selectedConversation.is_muted)}
                        className={`p-2 rounded-xl transition-all border ${
                            selectedConversation.is_muted
                                ? "bg-neutral-100 border-neutral-300 text-neutral-500 dark:bg-neutral-800"
                                : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground"
                        }`}
                        title={selectedConversation.is_muted ? "Unmute Conversation" : "Mute Conversation"}
                    >
                        <VolumeX className="w-4 h-4" />
                    </button>
                    <hr className="w-px h-6 bg-border/40 mx-1" />
                    <button className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl text-muted-foreground transition-all">
                        <MoreVertical className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Chat message timeline thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-320px)] scrollbar-thin">
                {messages.length === 0 ? (
                    <EmptyState type="no-messages" />
                ) : (
                    renderMessagesWithDividers()
                )}
                {/* Dynamically render typing indicator */}
                {isTyping && (
                    <div className="flex flex-col items-start gap-1">
                        <TypingIndicator />
                        <span className="text-[9px] text-muted-foreground px-1">Typing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Editor Input card */}
            <div className="p-4 border-t border-border/40">
                <MessageInput />
            </div>
        </div>
    );
}
