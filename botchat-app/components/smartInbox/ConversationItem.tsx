"use client";

import { Facebook, Instagram, Star, Pin, VolumeX, Archive } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { SmartInboxConversation } from "@/store/slices/smartInboxSlice";
import { useSmartInbox } from "@/hooks/useSmartInbox";

interface ConversationItemProps {
    conversation: SmartInboxConversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
    const {
        selectedConversation,
        selectConversation,
        typingUsers,
        onlineUsers
    } = useSmartInbox();

    const isSelected = selectedConversation?.id === conversation.id;
    const isOnline = onlineUsers[conversation.customer_id] ?? conversation.is_online;
    const isTyping = typingUsers[conversation.id] !== null && typingUsers[conversation.id] !== undefined;
    const typingMsg = typingUsers[conversation.id];

    const isFB = conversation.platform === "facebook";

    // Format timestamp nicely (e.g., 2m, 1h, 5d)
    const formatTime = (isoString: string | null) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return formatDistanceToNowStrict(date)
                .replace(" seconds", "s")
                .replace(" second", "s")
                .replace(" minutes", "m")
                .replace(" minute", "m")
                .replace(" hours", "h")
                .replace(" hour", "h")
                .replace(" days", "d")
                .replace(" day", "d");
        } catch {
            return "";
        }
    };

    // ── Rich last-message preview ─────────────────────────────────────────────
    const getMessagePreview = (text: string | null): string => {
        if (!text) return "No messages yet";
        // Check for emoji prefixes that the backend inserts for media types
        if (text.startsWith("📷") || text.startsWith("📎 Image")) return "📷 Image";
        if (text.startsWith("🎥") || text.startsWith("📎 Video")) return "🎥 Video";
        if (text.startsWith("🎵") || text.startsWith("📎 Audio")) return "🎵 Voice message";
        if (text.startsWith("📄") || text.startsWith("📎 File")) return "📄 File";
        if (text.startsWith("🎠 Carousel")) return "🎠 Carousel";
        if (text.startsWith("🔘") || text.toLowerCase().includes("button")) return text.length > 30 ? `🔘 ${text.slice(0, 28)}…` : `🔘 ${text}`;
        // Truncate long messages
        return text.length > 48 ? `${text.slice(0, 46)}…` : text;
    };

    return (
        <div
            onClick={() => selectConversation(conversation)}
            className={`flex gap-4 p-4 rounded-3xl cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                isSelected
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                    : "hover:bg-white/50 dark:hover:bg-white/5 border-transparent"
            }`}
        >
            {/* Selection indicator bubble background logic */}
            {!isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            {/* Avatar block */}
            <div className="relative flex-shrink-0 z-10">
                <div className={`p-0.5 rounded-full ${isSelected ? "bg-white/20" : "bg-gradient-to-tr from-primary/20 to-transparent"}`}>
                    {conversation.customer_avatar ? (
                        <img
                            src={conversation.customer_avatar}
                            alt={conversation.customer_name ?? 'User'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-transparent"
                        />
                    ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm ${
                            isSelected ? "bg-white text-primary" : "bg-primary/10 text-primary"
                        }`}>
                            {(conversation.customer_name ?? '?')[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Online indicator */}
                {isOnline && (
                    <div className={`absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isSelected ? "border-primary bg-emerald-400" : "border-white dark:border-neutral-900 bg-emerald-500"} shadow-sm`} />
                )}

                {/* Platform Badge */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg text-white border-2 ${
                    isSelected ? "border-primary" : "border-white dark:border-neutral-900"
                } ${
                    isFB ? "bg-blue-600" : "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                }`}>
                    {isFB ? (
                        <Facebook className="w-2.5 h-2.5 fill-current" />
                    ) : (
                        <Instagram className="w-2.5 h-2.5" />
                    )}
                </div>
            </div>

            {/* Meta details */}
            <div className="flex-1 min-w-0 z-10">
                <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-[13px] font-black truncate max-w-[140px] ${isSelected ? "text-white" : "text-foreground"}`}>
                        {conversation.customer_name}
                    </h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                        {formatTime(conversation.last_message_at)}
                    </span>
                </div>

                {/* Last message snippet */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {isTyping ? (
                            <p className={`text-[11px] font-black animate-pulse truncate ${isSelected ? "text-white" : "text-primary"}`}>
                                {typingMsg || "Typing..."}
                            </p>
                        ) : (
                            <p className={`text-[11px] truncate ${isSelected ? "text-white/80 font-medium" : "text-muted-foreground"}`}>
                                {getMessagePreview(conversation.last_message)}
                            </p>
                        )}
                    </div>

                    {/* Unread badge count */}
                    {!isSelected && conversation.unread_count > 0 && (
                        <div className="flex-shrink-0">
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-black bg-primary text-white shadow-lg shadow-primary/30">
                                {conversation.unread_count}
                            </span>
                        </div>
                    )}
                </div>

                {/* Indicator icons */}
                <div className="flex gap-2 mt-2 items-center">
                    {conversation.is_pinned && (
                        <Pin className={`w-3.5 h-3.5 rotate-45 ${isSelected ? "text-white/90 fill-current" : "text-amber-500 fill-current"}`} />
                    )}
                    {conversation.is_starred && (
                        <Star className={`w-3.5 h-3.5 ${isSelected ? "text-white/90 fill-current" : "text-yellow-500 fill-current"}`} />
                    )}
                    {conversation.is_muted && (
                        <VolumeX className={`w-3.5 h-3.5 ${isSelected ? "text-white/60" : "text-neutral-400"}`} />
                    )}
                </div>
            </div>
        </div>
    );
}

