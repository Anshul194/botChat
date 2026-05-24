import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import * as service from "@/services/smartInboxService";
import * as actions from "@/store/slices/smartInboxSlice";
import { toast } from "sonner";

export const useSmartInbox = () => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(s => s.smartInbox);

    // Keep a ref so loadConversations always reads fresh state without being in deps.
    // This prevents the useCallback recreation → useEffect re-run → double API call loop.
    const stateRef = useRef(state);
    stateRef.current = state;

    const loadAccounts = useCallback(async () => {
        try {
            const res = await service.getAccounts();
            if (res && res.data) {
                dispatch(actions.setAccounts(res.data));
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Failed to load connected accounts");
        }
    }, [dispatch]);

    // STABLE function — deps are [dispatch] only, reads state via stateRef.
    // customFilters passed in explicitly so callers control account_id, not stale state.
    const loadConversations = useCallback(async (customFilters: any = {}) => {
        dispatch(actions.setLoading(true));
        try {
            const currentState = stateRef.current;
            const finalFilters: any = {
                ...currentState.filters,
                ...customFilters,
                search: currentState.search || undefined,
            };
            if (finalFilters.platform === 'all') delete finalFilters.platform;

            console.log('[SmartInbox] loadConversations → API filters:', finalFilters);

            const res = await service.getConversations(finalFilters);
            if (res && res.data) {
                dispatch(actions.setConversations(res.data));
            }
        } catch (e: any) {
            console.error("Failed to load conversations:", e);
        } finally {
            dispatch(actions.setLoading(false));
        }
    }, [dispatch]); // stable — never changes reference

    const selectAccount = useCallback(async (account: actions.SmartInboxAccount | null) => {
        console.log('[SmartInbox] selectAccount clicked:', account?.id ?? null, account?.name ?? 'All');

        // Update Redux state
        dispatch(actions.setSelectedAccount(account));
        dispatch(actions.setSelectedConversation(null));
        dispatch(actions.setMessages([]));

        // Exactly ONE API call — account_id passed explicitly
        const filters: any = { is_archived: false };
        if (account) {
            filters.account_id = account.id;
        }
        await loadConversations(filters);
    }, [dispatch, loadConversations]);

    const selectConversation = useCallback(async (conversation: actions.SmartInboxConversation | null) => {
        console.log('[SmartInbox] selectConversation:', conversation?.id ?? null, conversation?.platform ?? null);
        dispatch(actions.setSelectedConversation(conversation));
        if (conversation) {
            // Load messages for selected conversation
            try {
                const res = await service.getMessages(conversation.id);
                if (res && res.data) {
                    console.log('[SmartInbox] messages loaded:', res.data.length);
                    dispatch(actions.setMessages(res.data));
                }
                // Mark conversation as read on backend
                await service.markRead(conversation.id);
            } catch (e: any) {
                console.error("Failed to fetch messages for conversation:", conversation.id, e);
            }
        } else {
            dispatch(actions.setMessages([]));
        }
    }, [dispatch]);

    const sendTextMessage = useCallback(async (text: string) => {
        if (!state.selectedConversation || !text.trim()) return;

        const tempId = Date.now(); // Unique temporary ID for optimistic UI

        // Optimistic message to show immediately with spinner
        const tempMsg: actions.SmartInboxMessage = {
            id: tempId,
            conversation_id: state.selectedConversation.id,
            sender_type: "agent",
            direction: "outbound",
            message_type: "text",
            message: text,
            media_json: null,
            status: "sending",
            sent_at: new Date().toISOString(),
            delivered_at: null,
            seen_at: null
        };
        dispatch(actions.addMessage(tempMsg));

        try {
            const res = await service.sendMessage({
                conversation_id: state.selectedConversation.id,
                message_type: "text",
                message: text
            });
            if (res && res.data) {
                // Use _tempId so the reducer finds the temp message by its temp ID
                // then replaces it with the real DB data (including real id, status: 'sent', etc.)
                dispatch(actions.updateMessage({
                    _tempId: tempId,        // ← find by temp id
                    ...res.data,            // ← real data from DB (id, direction, status, etc.)
                    status: res.data.status ?? "sent",
                } as any));
            }
        } catch (e: any) {
            dispatch(actions.updateMessage({
                id: tempId,   // No res.data conflict here since we're just updating status
                status: "failed"
            }));
            toast.error(e.response?.data?.message || "Failed to send message");
        }
    }, [dispatch, state.selectedConversation]);

    const sendMediaMessage = useCallback(async (file: File, type: "image" | "video" | "audio" | "file") => {
        if (!state.selectedConversation) return;

        // Auto-detect type from MIME if not set correctly
        const detectedType: "image" | "video" | "audio" | "file" =
            file.type.startsWith("image/") ? "image"
            : file.type.startsWith("video/") ? "video"
            : file.type.startsWith("audio/") ? "audio"
            : type;

        const tempId = Date.now();
        const tempObjectUrl = URL.createObjectURL(file);

        // Optimistic message — shows preview immediately
        const tempMsg: actions.SmartInboxMessage = {
            id: tempId,
            conversation_id: state.selectedConversation.id,
            sender_type: "agent",
            direction: "outbound",
            message_type: detectedType,
            message: file.name,
            media_json: JSON.stringify([{ type: detectedType, url: tempObjectUrl }]),
            message_data: { url: tempObjectUrl, type: detectedType },
            status: "sending",
            sent_at: new Date().toISOString(),
            delivered_at: null,
            seen_at: null,
        };
        dispatch(actions.addMessage(tempMsg));

        try {
            const uploadRes = await service.uploadMedia(file);
            const mediaUrl = uploadRes?.url || uploadRes?.data?.url || uploadRes?.data?.path;
            if (!mediaUrl) throw new Error("Upload failed: No file URL returned");

            const res = await service.sendMessage({
                conversation_id: state.selectedConversation.id,
                message_type: detectedType,
                media_url: mediaUrl,
                message: file.name,
            });
            if (res && res.data) {
                dispatch(actions.updateMessage({ _tempId: tempId, ...res.data, status: res.data.status ?? "sent" } as any));
                toast.success(`${detectedType} sent successfully`);
            }
        } catch (e: any) {
            dispatch(actions.updateMessage({ id: tempId, status: "failed" }));
            toast.error(e.message || `Failed to send ${detectedType}`);
        } finally {
            URL.revokeObjectURL(tempObjectUrl);
        }
    }, [dispatch, state.selectedConversation]);

    const sendVoiceMessage = useCallback(async (voiceBlob: Blob) => {
        if (!state.selectedConversation) return;

        const tempId = Date.now();
        const tempObjectUrl = URL.createObjectURL(voiceBlob);

        // Optimistic voice bubble
        const tempMsg: actions.SmartInboxMessage = {
            id: tempId,
            conversation_id: state.selectedConversation.id,
            sender_type: "agent",
            direction: "outbound",
            message_type: "audio",
            message: "Voice message",
            media_json: null,
            message_data: { url: tempObjectUrl, type: "audio" },
            status: "sending",
            sent_at: new Date().toISOString(),
            delivered_at: null,
            seen_at: null,
        };
        dispatch(actions.addMessage(tempMsg));

        try {
            const uploadRes = await service.uploadVoice(voiceBlob);
            const voiceUrl = uploadRes?.url || uploadRes?.data?.url || uploadRes?.data?.path;
            if (!voiceUrl) throw new Error("Voice note upload failed");

            const res = await service.sendMessage({
                conversation_id: state.selectedConversation.id,
                message_type: "audio",
                media_url: voiceUrl,
                message: "Voice message",
            });
            if (res && res.data) {
                dispatch(actions.updateMessage({ _tempId: tempId, ...res.data, status: res.data.status ?? "sent" } as any));
                toast.success("Voice note sent");
            }
        } catch (e: any) {
            dispatch(actions.updateMessage({ id: tempId, status: "failed" }));
            toast.error(e.message || "Failed to send voice note");
        } finally {
            URL.revokeObjectURL(tempObjectUrl);
        }
    }, [dispatch, state.selectedConversation]);

    const toggleStarChat = useCallback(async (conversationId: number, status: boolean) => {
        // Optimistic update
        dispatch(actions.updateConversation({ id: conversationId, is_starred: status }));
        try {
            await service.toggleStar(conversationId, status);
        } catch (e: any) {
            dispatch(actions.updateConversation({ id: conversationId, is_starred: !status }));
            toast.error("Failed to star/unstar conversation");
        }
    }, [dispatch]);

    const toggleArchiveChat = useCallback(async (conversationId: number, status: boolean) => {
        dispatch(actions.updateConversation({ id: conversationId, is_archived: status }));
        try {
            await service.toggleArchive(conversationId, status);
        } catch (e: any) {
            dispatch(actions.updateConversation({ id: conversationId, is_archived: !status }));
            toast.error("Failed to archive/unarchive conversation");
        }
    }, [dispatch]);

    const togglePinChat = useCallback(async (conversationId: number, status: boolean) => {
        dispatch(actions.updateConversation({ id: conversationId, is_pinned: status }));
        try {
            await service.togglePin(conversationId, status);
        } catch (e: any) {
            dispatch(actions.updateConversation({ id: conversationId, is_pinned: !status }));
            toast.error("Failed to pin/unpin conversation");
        }
    }, [dispatch]);

    const toggleMuteChat = useCallback(async (conversationId: number, status: boolean) => {
        dispatch(actions.updateConversation({ id: conversationId, is_muted: status }));
        try {
            await service.toggleMute(conversationId, status);
        } catch (e: any) {
            dispatch(actions.updateConversation({ id: conversationId, is_muted: !status }));
            toast.error("Failed to mute/unmute conversation");
        }
    }, [dispatch]);

    const reactToMessage = useCallback(async (messageId: number, emoji: string | null) => {
        try {
            // Fetch message to get current reactions
            const msg = state.messages.find(m => m.id === messageId);
            if (!msg) return;

            let currentReactions = [];
            if (msg.reaction_json) {
                try {
                    currentReactions = typeof msg.reaction_json === 'string' 
                        ? JSON.parse(msg.reaction_json) 
                        : msg.reaction_json;
                } catch {
                    currentReactions = [];
                }
            }

            // Local user id
            const userId = 1; // Default/optimistic

            // Remove previous user reaction if any
            let newReactions = currentReactions.filter((r: any) => r.user_id !== userId);
            if (emoji) {
                newReactions.push({ user_id: userId, emoji });
            }

            // Optimistic update
            dispatch(actions.updateMessage({ 
                id: messageId, 
                reaction_json: JSON.stringify(newReactions),
                reactions: newReactions.map((r: any) => r.emoji)
            }));

            await service.addReaction(messageId, emoji);
        } catch (e: any) {
            toast.error("Failed to add reaction to message");
        }
    }, [dispatch, state.messages]);

    const sendTypingStart = useCallback(async () => {
        if (!state.selectedConversation) return;
        try {
            await service.typingStart(state.selectedConversation.id);
        } catch {}
    }, [state.selectedConversation]);

    const sendTypingStop = useCallback(async () => {
        if (!state.selectedConversation) return;
        try {
            await service.typingStop(state.selectedConversation.id);
        } catch {}
    }, [state.selectedConversation]);

    const setSearchQuery = useCallback((q: string) => {
        dispatch(actions.setSearch(q));
    }, [dispatch]);

    const setFilterOption = useCallback((f: Partial<actions.SmartInboxState['filters']>) => {
        dispatch(actions.setFilters(f));
    }, [dispatch]);

    return {
        ...state,
        loadAccounts,
        loadConversations,
        selectAccount,
        selectConversation,
        sendTextMessage,
        sendMediaMessage,
        sendVoiceMessage,
        toggleStarChat,
        toggleArchiveChat,
        togglePinChat,
        toggleMuteChat,
        reactToMessage,
        sendTypingStart,
        sendTypingStop,
        setSearchQuery,
        setFilterOption
    };
};
