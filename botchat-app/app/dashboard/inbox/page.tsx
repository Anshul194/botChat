"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
    Search, Instagram, Facebook, Send, Bot, MoreVertical,
    Tag, Clock, User, Zap, ChevronRight, ArrowLeft,
} from "lucide-react";
import { InlineEmojiButton } from "@/components/ui/EmojiPicker";
import api from "@/lib/api";
import { getTenantDomain } from "@/lib/config";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

interface SmartInboxConversation {
    id: number;
    platform: "instagram" | "facebook";
    platform_account_id: number;
    customer_id: string;
    customer_name: string;
    customer_avatar: string | null;
    status: string;
    unread_count: number;
    last_message: string | null;
    last_message_at: string | null;
    is_online: boolean;
    last_seen_at: string | null;
}

interface SmartInboxMessage {
    id: number;
    conversation_id: number;
    sender_type: "customer" | "agent" | "bot";
    direction: "inbound" | "outbound";
    message_type: "text" | "image" | "video" | "file";
    message: string | null;
    media_json: string | any[] | null;
    status: "sending" | "sent" | "delivered" | "seen" | "failed";
    sent_at: string | null;
    delivered_at: string | null;
    seen_at: string | null;
}

export default function InboxPage() {
    const [conversations, setConversations] = useState<SmartInboxConversation[]>([]);
    const [active, setActive] = useState<SmartInboxConversation | null>(null);
    const [messages, setMessages] = useState<SmartInboxMessage[]>([]);
    const [input, setInput] = useState("");
    const [filter, setFilter] = useState<"all" | "instagram" | "facebook">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const [typingText, setTypingText] = useState<string | null>(null);
    const [quickReplies, setQuickReplies] = useState<string[]>([
        "Hi! How can I help?",
        "Thanks for reaching out!",
        "We offer 30-day returns.",
        "Shipping takes 5–7 days."
    ]);

    const echoRef = useRef<Echo | null>(null);
    const channelRef = useRef<any>(null);
    const inboxChannelRef = useRef<any>(null);
    const agentTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isAgentTypingRef = useRef(false);
    const tenantIdRef = useRef<string | null>(null);

    const addRecent = useCallback(
        (e: string) => setRecentEmojis((p) => [e, ...p.filter((x) => x !== e)].slice(0, 32)),
        []
    );

    // ── 1. Fetch Conversations ──
    const fetchConversations = useCallback(async () => {
        try {
            const domain = getTenantDomain();
            tenantIdRef.current = domain;
            const res = await api.get(`/social/inbox/conversations`, {
                params: {
                    platform: filter !== "all" ? filter : undefined,
                    search: searchQuery || undefined
                }
            });
            if (res.data && res.data.data) {
                setConversations(res.data.data);
                // Set first conversation as active if none selected
                if (!active && res.data.data.length > 0) {
                    setActive(res.data.data[0]);
                }
            }
        } catch (err) {
            console.error("Failed to load conversations:", err);
        }
    }, [filter, searchQuery, active]);

    // Fetch conversations on load / filter change
    useEffect(() => {
        fetchConversations();
    }, [filter, searchQuery]);

    // ── 2. Fetch Messages & Quick Replies ──
    useEffect(() => {
        if (!active) return;

        const loadMessages = async () => {
            try {
                const res = await api.get(`/social/inbox/conversations/${active.id}/messages`);
                if (res.data && res.data.data) {
                    setMessages(res.data.data);
                }
                
                // Mark the latest incoming messages as read
                const customerMsgs = (res.data.data as SmartInboxMessage[]).filter(
                    (m) => m.sender_type === "customer" && m.status !== "seen"
                );
                if (customerMsgs.length > 0) {
                    const lastMsg = customerMsgs[customerMsgs.length - 1];
                    await api.patch(`/social/inbox/messages/${lastMsg.id}/seen`);
                }
            } catch (err) {
                console.error("Failed to load messages:", err);
            }
        };

        const loadQuickReplies = async () => {
            try {
                const res = await api.get(`/social/inbox/quick-replies`);
                if (Array.isArray(res.data)) {
                    setQuickReplies(res.data);
                }
            } catch (err) {
                console.warn("Could not load dynamic quick replies, using defaults.", err);
            }
        };

        loadMessages();
        loadQuickReplies();
        setTypingText(null); // Reset typing indicator on conversation switch
    }, [active]);

    // ── 3. Configure Laravel Echo / Reverb Client ──
    useEffect(() => {
        if (typeof window === "undefined") return;

        const tenantDomain = getTenantDomain();
        if (!tenantDomain) return;

        // Initialize Echo
        const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
        const cleanToken = token ? token.replace(/^"(.*)"$/, '$1') : "";
        const bearer = cleanToken ? (cleanToken.startsWith("Bearer ") ? cleanToken : `Bearer ${cleanToken}`) : "";

        // Make sure Pusher is global
        window.Pusher = Pusher;

        const echoInstance = new Echo({
            broadcaster: "reverb",
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || "smart_inbox_key",
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "127.0.0.1",
            wsPort: 8080,
            wssPort: 8080,
            forceTLS: false,
            enabledTransports: ["ws", "wss"],
            authEndpoint: `https://${tenantDomain}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: bearer,
                    "x-host": tenantDomain,
                    Accept: "application/json",
                }
            }
        });

        echoRef.current = echoInstance;

        // Global inbox channel subscription for sidebar updates
        const inboxChannel = echoInstance.private(`tenant.${tenantDomain}.inbox`);
        inboxChannelRef.current = inboxChannel;

        inboxChannel.listen(".App.Events.SmartInbox.ConversationUpdated", (e: any) => {
            console.log("Global Reverb: ConversationUpdated", e);
            setConversations((prev) => {
                const updated = prev.map((c) => (c.id === e.conversation.id ? { ...c, ...e.conversation } : c));
                if (!updated.some((c) => c.id === e.conversation.id)) {
                    updated.unshift(e.conversation);
                }
                return updated.sort((a, b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());
            });
        });

        inboxChannel.listen(".App.Events.SmartInbox.ContactStatusUpdated", (e: any) => {
            console.log("Global Reverb: ContactStatusUpdated", e);
            setConversations((prev) =>
                prev.map((c) => (c.id === e.conversation_id ? { ...c, is_online: e.is_online, last_seen_at: e.last_seen_at } : c))
            );
        });

        inboxChannel.listen(".App.Events.SmartInbox.PresenceUpdated", (e: any) => {
            console.log("Global Reverb: PresenceUpdated", e);
            setConversations((prev) =>
                prev.map((c) => (c.id === e.conversation_id ? { ...c, is_online: e.is_online, last_seen_at: e.last_seen } : c))
            );
        });

        return () => {
            inboxChannel.stopListening(".App.Events.SmartInbox.ConversationUpdated");
            inboxChannel.stopListening(".App.Events.SmartInbox.ContactStatusUpdated");
            inboxChannel.stopListening(".App.Events.SmartInbox.PresenceUpdated");
            echoInstance.disconnect();
        };
    }, []);

    // ── 4. Subscribe to Active Thread ──
    useEffect(() => {
        const echoInstance = echoRef.current;
        const tenantDomain = getTenantDomain();
        if (!echoInstance || !active || !tenantDomain) return;

        // Subscribe to thread channel
        const channel = echoInstance.private(`tenant.${tenantDomain}.conversation.${active.id}`);
        channelRef.current = channel;

        channel.listen(".App.Events.SmartInbox.MessageReceived", (e: any) => {
            console.log("Reverb: MessageReceived", e);
            if (e.message.conversation_id === active.id) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === e.message.id)) return prev;
                    return [...prev, e.message];
                });
                // Send seen API
                api.patch(`/social/inbox/messages/${e.message.id}/seen`).catch(console.error);
            }
        });

        channel.listen(".App.Events.SmartInbox.MessageSent", (e: any) => {
            console.log("Reverb: MessageSent", e);
            if (e.message.conversation_id === active.id) {
                setMessages((prev) => {
                    if (prev.some((m) => m.id === e.message.id)) {
                        return prev.map((m) => (m.id === e.message.id ? e.message : m));
                    }
                    return [...prev, e.message];
                });
            }
        });

        channel.listen(".App.Events.SmartInbox.TypingStarted", (e: any) => {
            console.log("Reverb: TypingStarted", e);
            setTypingText(`${e.customer_name} is typing...`);
        });

        channel.listen(".App.Events.SmartInbox.TypingStopped", (e: any) => {
            console.log("Reverb: TypingStopped", e);
            setTypingText(null);
        });

        channel.listen(".App.Events.SmartInbox.ContactStatusUpdated", (e: any) => {
            console.log("Reverb: ContactStatusUpdated", e);
            setActive((prev) => (prev && prev.id === e.conversation_id ? { ...prev, is_online: e.is_online, last_seen_at: e.last_seen_at } : prev));
        });

        channel.listen(".App.Events.SmartInbox.PresenceUpdated", (e: any) => {
            console.log("Reverb: PresenceUpdated", e);
            setActive((prev) => (prev && prev.id === e.conversation_id ? { ...prev, is_online: e.is_online, last_seen_at: e.last_seen } : prev));
        });

        channel.listen(".App.Events.SmartInbox.MessageSeen", (e: any) => {
            console.log("Reverb: MessageSeen", e);
            setMessages((prev) =>
                prev.map((m) => (m.id === e.message_id ? { ...m, status: "seen", seen_at: e.seen_at } : m))
            );
        });

        channel.listen(".App.Events.SmartInbox.DeliveryStatusUpdated", (e: any) => {
            console.log("Reverb: DeliveryStatusUpdated", e);
            setMessages((prev) =>
                prev.map((m) => (m.id === e.message_id ? { ...m, status: e.status, delivered_at: e.delivered_at } : m))
            );
        });

        return () => {
            channel.stopListening(".App.Events.SmartInbox.MessageReceived");
            channel.stopListening(".App.Events.SmartInbox.MessageSent");
            channel.stopListening(".App.Events.SmartInbox.TypingStarted");
            channel.stopListening(".App.Events.SmartInbox.TypingStopped");
            channel.stopListening(".App.Events.SmartInbox.ContactStatusUpdated");
            channel.stopListening(".App.Events.SmartInbox.PresenceUpdated");
            channel.stopListening(".App.Events.SmartInbox.MessageSeen");
            channel.stopListening(".App.Events.SmartInbox.DeliveryStatusUpdated");
        };
    }, [active]);

    // ── 5. Agent Typing Keystrokes ──
    const handleInputChange = (val: string) => {
        setInput(val);

        if (!active) return;

        if (!isAgentTypingRef.current) {
            isAgentTypingRef.current = true;
            api.post(`/social/inbox/typing/start`, { conversation_id: active.id }).catch(console.error);
        }

        if (agentTypingTimeoutRef.current) {
            clearTimeout(agentTypingTimeoutRef.current);
        }

        agentTypingTimeoutRef.current = setTimeout(() => {
            isAgentTypingRef.current = false;
            if (active) {
                api.post(`/social/inbox/typing/stop`, { conversation_id: active.id }).catch(console.error);
            }
        }, 3000);
    };

    // ── 6. Send Message ──
    const handleSend = async () => {
        if (!input.trim() || !active) return;

        const originalText = input;
        setInput(""); // Optimistic reset

        // Optimistically prepend sending bubble
        const tempId = Date.now();
        const tempMsg: SmartInboxMessage = {
            id: tempId,
            conversation_id: active.id,
            sender_type: "agent",
            direction: "outbound",
            message_type: "text",
            message: originalText,
            media_json: null,
            status: "sending",
            sent_at: new Date().toISOString(),
            delivered_at: null,
            seen_at: null,
        };

        setMessages((prev) => [...prev, tempMsg]);

        try {
            const res = await api.post(`/social/inbox/send`, {
                conversation_id: active.id,
                message: originalText,
                message_type: "text"
            });
            if (res.data && res.data.is_success) {
                // Update with server persisted message info
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempId ? { ...m, ...res.data.data, status: "sent" } : m))
                );
            }
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
            );
        }
    };

    const handleSelectConv = (c: SmartInboxConversation) => {
        setActive(c);
        setMobileView("chat");
    };

    return (
        <div
            className="flex h-full gap-0 rounded-2xl overflow-hidden"
            style={{ height: "calc(100vh - 128px)", border: "1px solid var(--glass-border)" }}
        >
            {/* ── Conversation List ── */}
            <div
                className={[
                    "flex flex-col flex-shrink-0 border-r",
                    "w-full md:w-[300px]",
                    mobileView === "chat" ? "hidden md:flex" : "flex",
                ].join(" ")}
                style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}
            >
                <div className="p-4 border-b" style={{ borderColor: "var(--glass-border)" }}>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Inbox</h2>
                    {/* Platform filter */}
                    <div className="flex gap-1 p-1 rounded-xl mb-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        {(["all", "instagram", "facebook"] as const).map((f) => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="flex-1 py-1 rounded-lg text-[11px] font-medium capitalize transition-all"
                                style={filter === f ? { background: "var(--brand-gradient)", color: "white" } : { color: "var(--muted-foreground)" }}>
                                {f === "instagram" ? "IG" : f === "facebook" ? "FB" : "All"}
                            </button>
                        ))}
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                        <input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none transition-all"
                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((c) => (
                        <div key={c.id} onClick={() => handleSelectConv(c)}
                            className="flex items-start gap-3 px-3 py-3 cursor-pointer border-b transition-all"
                            style={{
                                background: active?.id === c.id ? "var(--nav-active-bg)" : "transparent",
                                borderColor: "var(--glass-border)",
                                borderLeft: active?.id === c.id ? "3px solid var(--brand-purple)" : "3px solid transparent",
                            }}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ background: c.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                                    {c.customer_name[0]}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                                    style={{ background: c.platform === "instagram" ? "#ec4899" : "#3b82f6", boxShadow: "0 0 0 2px var(--card)" }}>
                                    {c.platform === "instagram" ? <Instagram className="w-2 h-2 text-white" /> : <Facebook className="w-2 h-2 text-white" />}
                                </div>
                                <div
                                    className={`absolute top-0 start-0 w-2.5 h-2.5 rounded-full border border-white translate-x-[-25%] translate-y-[-25%] ${c.is_online ? "bg-success" : "bg-secondary"}`}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{c.customer_name}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                                            {c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </span>
                                        {c.unread_count > 0 && (
                                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-red-500">
                                                {c.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>{c.last_message}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 md:hidden" style={{ color: "var(--muted-foreground)" }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Chat Area ── */}
            <div
                className={[
                    "flex-1 flex flex-col min-w-0",
                    mobileView === "list" ? "hidden md:flex" : "flex",
                ].join(" ")}
                style={{ background: "var(--background)" }}
            >
                {active ? (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-1.5 rounded-lg mr-1 hover:opacity-70 transition-opacity"
                                    style={{ background: "var(--glass-bg)" }}
                                    onClick={() => setMobileView("list")}
                                >
                                    <ArrowLeft className="w-4 h-4" style={{ color: "var(--foreground)" }} />
                                </button>
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                    style={{ background: active.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                                    {active.customer_name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{active.customer_name}</p>
                                    <div className="flex items-center gap-1.5">
                                        {active.platform === "instagram"
                                            ? <Instagram className="w-3 h-3" style={{ color: "#ec4899" }} />
                                            : <Facebook className="w-3 h-3" style={{ color: "#3b82f6" }} />}
                                        <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{active.customer_id}</span>
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: active.is_online ? "#10b981" : "#6b7280" }} />
                                        <span className="text-[11px]" style={{ color: active.is_online ? "#10b981" : "#6b7280" }}>
                                            {active.is_online ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg hover:opacity-70" style={{ background: "var(--glass-bg)" }}>
                                    <MoreVertical className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                            {messages.map((m) => (
                                <div key={m.id} className={`flex ${m.sender_type !== "agent" ? "justify-start" : "justify-end"}`}>
                                    {m.sender_type !== "agent" && (
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-auto"
                                            style={{ background: "var(--brand-gradient)" }}>
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                    <div className="max-w-[80%] sm:max-w-[70%]">
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.sender_type !== "agent" ? "bg-gray-100 text-black" : "bg-purple-600 text-white"}`}>
                                            {m.message}
                                        </div>
                                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${m.sender_type !== "agent" ? "justify-start ml-1" : "justify-end mr-1"}`}
                                            style={{ color: "var(--muted-foreground)" }}>
                                            {m.sent_at ? new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            {m.sender_type === "agent" && (
                                                <span className="ml-1">
                                                    {m.status === "seen" ? (
                                                        <span className="text-purple-400">✓✓ Seen</span>
                                                    ) : m.status === "delivered" ? (
                                                        <span className="text-gray-400">✓✓ Delivered</span>
                                                    ) : (
                                                        <span className="text-gray-400">✓ Sent</span>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {typingText && (
                                <div className="text-xs text-purple-600 italic px-4 py-2 bg-purple-50 rounded-xl max-w-[200px] border border-purple-100 animate-pulse">
                                    {typingText}
                                </div>
                            )}
                        </div>

                        {/* Quick Replies */}
                        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                            {quickReplies.map((q) => (
                                <button key={q} onClick={() => setInput(q)}
                                    className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity flex-shrink-0"
                                    style={{ background: "rgba(124,58,237,0.1)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.2)" }}>
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="px-4 pb-4">
                            <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                                <InlineEmojiButton
                                    value={input}
                                    onChange={handleInputChange}
                                    recent={recentEmojis}
                                    onAddRecent={addRecent}
                                />
                                <input value={input} onChange={(e) => handleInputChange(e.target.value)} placeholder="Type a message..."
                                    className="flex-1 text-sm outline-none bg-transparent" style={{ color: "var(--foreground)" }}
                                    onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) handleSend(); }}
                                />
                                <button disabled={!input} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                                    style={{ background: "var(--brand-gradient)", color: "white" }}
                                    onClick={handleSend}>
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <Bot className="w-12 h-12 text-purple-300 mb-3" />
                        <p className="text-sm text-gray-500">No conversation selected</p>
                    </div>
                )}
            </div>

            {/* ── Contact Info Panel — desktop xl only ── */}
            {active && (
                <div className="w-[220px] flex-shrink-0 border-l p-4 hidden xl:flex flex-col gap-4 overflow-y-auto"
                    style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
                    <div className="text-center pt-2">
                        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-sm font-bold text-white mb-2"
                            style={{ background: active.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                            {active.customer_name[0]}
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{active.customer_name}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{active.customer_id}</p>
                    </div>

                    <div className="space-y-2">
                        {[
                            { icon: Clock, label: "Last Active", value: active.last_seen_at ? new Date(active.last_seen_at).toLocaleDateString() : "Just now" },
                            { icon: User, label: "Platform", value: active.platform.toUpperCase() },
                        ].map((r) => (
                            <div key={r.label} className="flex items-center gap-2 p-2 rounded-xl"
                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <r.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
                                <div className="min-w-0">
                                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{r.label}</p>
                                    <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{r.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
