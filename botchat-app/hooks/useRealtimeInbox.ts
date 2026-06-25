"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getTenantDomain } from "@/lib/config";
import * as actions from "@/store/slices/smartInboxSlice";

/**
 * useRealtimeInbox
 *
 * Connects to the standalone Node.js Socket.IO server.
 * Replaces the previous laravel-echo + reverb implementation.
 *
 * Room naming (must match socket-server/server.js and PHP SmartInboxSocketEmitter):
 *   Global inbox:   tenant.{tenantDomain}.inbox
 *   Conversation:   tenant.{tenantDomain}.conversation.{conversationId}
 *
 * Environment:
 *   NEXT_PUBLIC_SOCKET_URL — URL of the Node.js socket server (e.g. http://localhost:3001)
 */
export const useRealtimeInbox = () => {
    const dispatch = useAppDispatch();
    const selectedConversation = useAppSelector(s => s.smartInbox.selectedConversation);
    const socketRef = useRef<Socket | null>(null);

    // ── 1. Connect once and join global inbox room ────────────────────────────
    useEffect(() => {
        const tenantDomain = getTenantDomain();
        // TODO: Replace hardcoded fallback with dynamic tenant-based socket URL from config
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "https://socket.megadm.chat";

        const socket: Socket = io(socketUrl, {
            transports: ["polling", "websocket"],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        // ── Engine level logging for transports ──
        socket.io.on("error", (err) => {
            console.error("[Socket.IO] Engine error:", err);
        });

        socket.io.on("ping", () => console.log("[Socket.IO] Ping sent..."));
        socket.io.on("reconnect", (attempt) => console.log("[Socket.IO] Reconnected after", attempt, "attempts"));

        socket.on("connect", () => {
            const transport = socket.io.engine.transport.name; // 'polling' or 'websocket'
            console.log(`[Socket.IO] Connected! ID: ${socket.id} | Transport: ${transport}`);
            
            // Listen for background upgrade
            socket.io.engine.on("upgrade", () => {
                const upgradedTransport = socket.io.engine.transport.name;
                console.log(`[Socket.IO] Connection upgraded to: ${upgradedTransport}`);
            });

            // Join global inbox room for this tenant
            socket.emit("join", { tenantDomain });
        });

        socket.on("disconnect", (reason) => {
            console.warn("[Socket.IO] Disconnected. Reason:", reason);
            if (reason === "io server disconnect") {
                // The disconnection was initiated by the server, you need to reconnect manually
                socket.connect();
            }
        });

        socket.on("connect_error", (err) => {
            console.error("[Socket.IO] Connection error:", err.message, err);
            console.log("[Socket.IO] Will attempt to reconnect via polling...");
        });

        // ── Global inbox events ───────────────────────────────────────────────
        socket.on("ConversationUpdated", (e: any) => {
            console.log("[Socket.IO] ConversationUpdated", e);
            if (e.conversation) {
                dispatch(actions.updateConversation(e.conversation));
            }
        });

        socket.on("ContactStatusUpdated", (e: any) => {
            console.log("[Socket.IO] ContactStatusUpdated", e);
            if (e.customer_id !== undefined) {
                dispatch(actions.setOnlineStatus({
                    customerId: e.customer_id,
                    status: e.is_online
                }));
            }
        });

        return () => {
            console.log("[Socket.IO] Cleaning up global connection");
            socket.disconnect();
            socketRef.current = null;
        };
    }, [dispatch]);

    // ── 2. Join/leave conversation room when active conversation changes ───────
    useEffect(() => {
        const socket = socketRef.current;
        const tenantDomain = getTenantDomain();
        if (!socket || !tenantDomain) return;

        if (!selectedConversation) return;

        const conversationId = selectedConversation.id;

        // Join conversation-specific room
        socket.emit("join", { tenantDomain, conversationId });
        console.log(`[Socket.IO] Joined conversation room: tenant.${tenantDomain}.conversation.${conversationId}`);

        // ── Per-conversation events ───────────────────────────────────────────
        const onMessageReceived = (e: any) => {
            console.log("[Socket.IO] MessageReceived", e);
            if (e.message) {
                dispatch(actions.addMessage(e.message));
                // Auto-mark as read
                import("@/services/smartInboxService").then(s => {
                    s.markRead(conversationId).catch(() => {});
                });
            }
        };

        const onMessageSent = (e: any) => {
            console.log("[Socket.IO] MessageSent", e);
            // For outbound messages: the optimistic message is already in Redux from sendTextMessage.
            // The MessageSent socket event confirms delivery — update status if message exists by DB id.
            // Don't call addMessage here (would duplicate). Only update status via updateMessage.
            if (e.message?.id) {
                dispatch(actions.updateMessage({
                    id: e.message.id,
                    status: e.message.status ?? "sent",
                    sent_at: e.message.sent_at ?? null,
                }));
            }
        };

        const onTypingStarted = (e: any) => {
            console.log("[Socket.IO] TypingStarted", e);
            dispatch(actions.setTypingUser({
                conversationId,
                text: e.username ? `${e.username} typing...` : "Typing..."
            }));
        };

        const onTypingStopped = (_e: any) => {
            console.log("[Socket.IO] TypingStopped");
            dispatch(actions.setTypingUser({ conversationId, text: null }));
        };

        const onMessageSeen = (e: any) => {
            console.log("[Socket.IO] MessageSeen", e);
            if (e.message_id) {
                dispatch(actions.updateMessage({
                    id: e.message_id,
                    status: "seen",
                    seen_at: e.seen_at
                }));
            }
        };

        const onMessageUpdated = (e: any) => {
            console.log("[Socket.IO] MessageUpdated", e);
            if (e.message?.id) {
                dispatch(actions.updateMessage({
                    id: e.message.id,
                    ...e.message
                }));
            }
        };

        const onPresenceUpdated = (e: any) => {
            console.log("[Socket.IO] PresenceUpdated", e);
            if (e.conversation_id) {
                // Update is_online for this conversation in list
                dispatch(actions.updateConversation({
                    id: e.conversation_id,
                    is_online: e.is_online
                }));
            }
        };

        const onDeliveryStatusUpdated = (e: any) => {
            console.log("[Socket.IO] DeliveryStatusUpdated", e);
            if (e.message_id) {
                dispatch(actions.updateMessage({
                    id: e.message_id,
                    status: e.status
                }));
            }
        };

        socket.on("MessageReceived",        onMessageReceived);
        socket.on("MessageSent",            onMessageSent);
        socket.on("MessageUpdated",         onMessageUpdated);
        socket.on("TypingStarted",          onTypingStarted);
        socket.on("TypingStopped",          onTypingStopped);
        socket.on("MessageSeen",            onMessageSeen);
        socket.on("PresenceUpdated",        onPresenceUpdated);
        socket.on("DeliveryStatusUpdated",  onDeliveryStatusUpdated);

        return () => {
            // Leave conversation room and remove listeners
            socket.emit("leave", { tenantDomain, conversationId });
            socket.off("MessageReceived",       onMessageReceived);
            socket.off("MessageSent",           onMessageSent);
            socket.off("MessageUpdated",        onMessageUpdated);
            socket.off("TypingStarted",         onTypingStarted);
            socket.off("TypingStopped",         onTypingStopped);
            socket.off("MessageSeen",           onMessageSeen);
            socket.off("PresenceUpdated",       onPresenceUpdated);
            socket.off("DeliveryStatusUpdated", onDeliveryStatusUpdated);
        };
    }, [selectedConversation, dispatch]);

    return socketRef.current;
};
