"use client";

import { useEffect, useRef } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";
import { Star, Pin, Archive, VolumeX, MoreVertical, ShieldAlert, Instagram, Facebook } from "lucide-react";
import { isSameDay, parseISO, format } from "date-fns";
import { motion } from "framer-motion";

export default function ChatWindow({ onProfileClick }: { onProfileClick?: () => void }) {
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
        const groups: JSX.Element[] = [];
        let lastDateStr = "";

        messages.forEach((msg, idx) => {
            const rawDate = msg.created_at || msg.sent_at || new Date().toISOString();
            const dateStr = format(parseISO(rawDate), "eeee, MMMM d, yyyy");
            if (dateStr !== lastDateStr) {
                groups.push(
                    <div key={`date-${dateStr}`} className="flex items-center justify-center my-6 gap-3">
                        <div className="h-px flex-1 bg-border/60" />
                        <span className="text-[10px] font-medium text-muted-foreground/70 px-3 whitespace-nowrap">
                            {dateStr}
                        </span>
                        <div className="h-px flex-1 bg-border/60" />
                    </div>
                );
                lastDateStr = dateStr;
            }
            groups.push(<MessageBubble key={msg.id || `msg-${idx}`} message={msg} />);
        });

        return groups;
    };


    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Active Customer Profile Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card">
                <button 
                    onClick={onProfileClick}
                    className="flex items-center gap-3 group hover:opacity-80 transition-all text-left"
                >
                    <div className="relative">
                        {selectedConversation.customer_avatar ? (
                            <img
                                src={selectedConversation.customer_avatar}
                                alt={selectedConversation.customer_name ?? 'User'}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-background shadow-sm"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                                {(selectedConversation.customer_name ?? '?')[0]?.toUpperCase()}
                            </div>
                        )}
                        {isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-emerald-500 shadow-sm" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-foreground leading-none">
                                {selectedConversation.customer_name}
                            </h3>
                            {isOnline && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
                            )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5 flex items-center gap-1.5">
                            {selectedConversation.platform === "instagram" ? (
                                <>
                                    <Instagram className="w-3 h-3" />
                                    Instagram
                                </>
                            ) : (
                                <>
                                    <Facebook className="w-3 h-3" />
                                    Messenger
                                </>
                            )}
                        </p>
                    </div>
                </button>

                {/* Conversation flags control */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-border">
                        <button
                            onClick={() => togglePinChat(selectedConversation.id, !selectedConversation.is_pinned)}
                            className={`p-2 rounded-md transition-all ${
                                selectedConversation.is_pinned
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-background"
                            }`}
                        >
                            <Pin className="w-4 h-4 rotate-45" />
                        </button>
                        <button
                            onClick={() => toggleStarChat(selectedConversation.id, !selectedConversation.is_starred)}
                            className={`p-2 rounded-md transition-all ${
                                selectedConversation.is_starred
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-background"
                            }`}
                        >
                            <Star className={`w-4 h-4 ${selectedConversation.is_starred ? "fill-current" : ""}`} />
                        </button>
                        <button
                            onClick={() => toggleArchiveChat(selectedConversation.id, !selectedConversation.is_archived)}
                            className={`p-2 rounded-md transition-all ${
                                selectedConversation.is_archived
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-background"
                            }`}
                        >
                            <Archive className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <EmptyState type="no-messages" />
                    </div>
                ) : (
                    renderMessagesWithDividers()
                )}
                {isTyping && (
                    <div className="flex justify-start pt-2">
                        <TypingIndicator />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="border-t border-border bg-card p-2 px-4 shadow-inner">
                <MessageInput />
            </div>
        </div>
    );
}
