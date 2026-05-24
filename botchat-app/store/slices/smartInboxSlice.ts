import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SmartInboxConversation {
    id: number;
    platform: "instagram" | "facebook";
    platform_account_id: number;   // DB id of facebook_pages or instagram_accounts
    customer_id: string;
    customer_name: string | null;
    customer_username?: string | null;
    customer_avatar: string | null;
    status: string;
    unread_count: number;
    last_message: string | null;
    last_message_at: string | null;
    is_online: boolean;
    last_seen_at: string | null;
    is_starred: boolean;
    is_archived: boolean;
    is_pinned: boolean;
    is_muted: boolean;
}

export interface SmartInboxMessage {
    id: number;
    conversation_id: number;
    sender_type: "customer" | "agent" | "bot";
    direction: "inbound" | "outbound";
    message_type:
        | "text"
        | "image"
        | "video"
        | "audio"
        | "file"
        | "voice"
        | "sticker"
        | "story"
        | "reel"
        | "location"
        | "button"
        | "quick_reply"
        | "carousel"
        | "generic_template"
        | "flow_step";
    message: string | null;
    media_json: string | any[] | null;
    /** Structured payload for MessageRenderer — buttons, carousel cards, quick replies, etc. */
    message_data?: MessageData | null;
    status: "sending" | "sent" | "delivered" | "seen" | "failed";
    sent_at: string | null;
    delivered_at: string | null;
    seen_at: string | null;
    reaction_json?: string | null;
    reactions?: any;
    created_at?: string | null;
}

/** Structured message payload — shape depends on message_type */
export type MessageData = Record<string, any>;

export interface SmartInboxAccount {
    id: number;
    name: string;
    username: string;
    profile_pic: string | null;
    platform: "instagram" | "facebook";
    status: string;
}

export interface SmartInboxState {
    accounts: SmartInboxAccount[];
    selectedAccount: SmartInboxAccount | null;
    conversations: SmartInboxConversation[];
    selectedConversation: SmartInboxConversation | null;
    messages: SmartInboxMessage[];
    typingUsers: Record<number, string | null>; // conversationId -> username/typing status
    onlineUsers: Record<string, boolean>; // customer_id -> online boolean
    search: string;
    filters: {
        is_starred?: boolean;
        is_archived?: boolean;
        is_pinned?: boolean;
        is_muted?: boolean;
        platform?: "facebook" | "instagram" | "all";
        date?: string;
        media_type?: string;
    };
    loading: boolean;
}

const initialState: SmartInboxState = {
    accounts: [],
    selectedAccount: null,
    conversations: [],
    selectedConversation: null,
    messages: [],
    typingUsers: {},
    onlineUsers: {},
    search: "",
    filters: {
        is_archived: false,
        platform: "all"
    },
    loading: false,
};

const smartInboxSlice = createSlice({
    name: 'smartInbox',
    initialState,
    reducers: {
        setAccounts: (state, action: PayloadAction<SmartInboxAccount[]>) => {
            state.accounts = action.payload;
        },
        setSelectedAccount: (state, action: PayloadAction<SmartInboxAccount | null>) => {
            state.selectedAccount = action.payload;
        },
        setConversations: (state, action: PayloadAction<SmartInboxConversation[]>) => {
            const seen = new Set<string>();
            const uniquePayload = action.payload.filter(conv => {
                const customerId = conv.customer_id || (conv as any).customer_id || (conv as any).contact?.psid || (conv as any).contact?.id?.toString() || '';
                const key = `${conv.platform}:${customerId}`;
                if (!customerId || seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            state.conversations = uniquePayload.map(conv => {
                const contact = (conv as any).contact;
                return {
                    ...conv,
                    customer_name: conv.customer_name || contact?.name || null,
                    customer_username: conv.customer_username || contact?.username || null,
                    customer_avatar: conv.customer_avatar || contact?.profile_picture || null,
                    customer_id: conv.customer_id || (conv as any).customer_id || contact?.psid || contact?.id?.toString() || '',
                    last_message_at: conv.last_message_at || (conv as any).last_message_at || (conv as any).updated_at || null
                };
            });
        },
        updateConversation: (state, action: PayloadAction<Partial<SmartInboxConversation> & { id: number }>) => {
            let index = state.conversations.findIndex(c => c.id === action.payload.id);
            const contact = (action.payload as any).contact;
            const customerId = action.payload.customer_id || (action.payload as any).customer_id || contact?.psid || contact?.id?.toString();
            
            // If not found by ID, search by customer_id and platform
            if (index === -1 && customerId && action.payload.platform) {
                index = state.conversations.findIndex(c => 
                    c.customer_id === customerId && 
                    c.platform === action.payload.platform
                );
            }

            const normalizedPayload = {
                ...action.payload,
                customer_name: action.payload.customer_name || contact?.name || undefined,
                customer_username: action.payload.customer_username || contact?.username || undefined,
                customer_avatar: action.payload.customer_avatar || contact?.profile_picture || undefined,
                customer_id: customerId || undefined,
                last_message_at: action.payload.last_message_at || (action.payload as any).last_message_at || (action.payload as any).updated_at || undefined,
            };

            // Remove any keys that are undefined to avoid overwriting existing valid state with undefined
            Object.keys(normalizedPayload).forEach(key => {
                if ((normalizedPayload as any)[key] === undefined) {
                    delete (normalizedPayload as any)[key];
                }
            });

            if (index !== -1) {
                state.conversations[index] = {
                    ...state.conversations[index],
                    ...normalizedPayload
                } as any;
            } else {
                // If it's a new conversation or not in list, append it!
                state.conversations.unshift(normalizedPayload as any);
            }

            if (state.selectedConversation && (state.selectedConversation.id === action.payload.id || (customerId && state.selectedConversation.customer_id === customerId && state.selectedConversation.platform === action.payload.platform))) {
                state.selectedConversation = {
                    ...state.selectedConversation,
                    ...normalizedPayload
                } as any;
            }
        },
        setSelectedConversation: (state, action: PayloadAction<SmartInboxConversation | null>) => {
            if (action.payload) {
                const contact = (action.payload as any).contact;
                const normalized = {
                    ...action.payload,
                    customer_name: action.payload.customer_name || contact?.name || null,
                    customer_username: action.payload.customer_username || contact?.username || null,
                    customer_avatar: action.payload.customer_avatar || contact?.profile_picture || null,
                };
                state.selectedConversation = normalized;
                // Clear unread count locally when active
                const index = state.conversations.findIndex(c => c.id === action.payload!.id);
                if (index !== -1) {
                    state.conversations[index].unread_count = 0;
                }
            } else {
                state.selectedConversation = null;
            }
        },
        setMessages: (state, action: PayloadAction<SmartInboxMessage[]>) => {
            state.messages = action.payload;
        },
        addMessage: (state, action: PayloadAction<SmartInboxMessage>) => {
            const msg = action.payload;
            if (state.selectedConversation && state.selectedConversation.id === msg.conversation_id) {
                // Prevent duplicate message renders
                if (!state.messages.some(m => m.id === msg.id)) {
                    state.messages.push(msg);
                }
            }

            // Update last message details in conversations list
            const index = state.conversations.findIndex(c => c.id === msg.conversation_id);
            if (index !== -1) {
                state.conversations[index].last_message = msg.message;
                state.conversations[index].last_message_at = msg.sent_at;
                if (!state.selectedConversation || state.selectedConversation.id !== msg.conversation_id) {
                    state.conversations[index].unread_count += 1;
                }
            }
        },
        updateMessage: (state, action: PayloadAction<Partial<SmartInboxMessage> & { id: number, _tempId?: number }>) => {
            // Support _tempId: find the optimistic temp message by its temporary ID
            const searchId = (action.payload as any)._tempId ?? action.payload.id;
            const index = state.messages.findIndex(m => m.id === searchId);
            if (index !== -1) {
                const { _tempId, ...rest } = action.payload as any;
                state.messages[index] = {
                    ...state.messages[index],
                    ...rest
                };
            }
        },
        setTypingUser: (state, action: PayloadAction<{ conversationId: number; text: string | null }>) => {
            state.typingUsers[action.payload.conversationId] = action.payload.text;
        },
        setOnlineStatus: (state, action: PayloadAction<{ customerId: string; status: boolean }>) => {
            state.onlineUsers[action.payload.customerId] = action.payload.status;
            // Also update any matching loaded conversation
            state.conversations = state.conversations.map(c => {
                if (c.customer_id === action.payload.customerId) {
                    return { ...c, is_online: action.payload.status };
                }
                return c;
            });
            if (state.selectedConversation && state.selectedConversation.customer_id === action.payload.customerId) {
                state.selectedConversation.is_online = action.payload.status;
            }
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<SmartInboxState['filters']>>) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        }
    }
});

export const {
    setAccounts,
    setSelectedAccount,
    setConversations,
    updateConversation,
    setSelectedConversation,
    setMessages,
    addMessage,
    updateMessage,
    setTypingUser,
    setOnlineStatus,
    setSearch,
    setFilters,
    setLoading
} = smartInboxSlice.actions;

export default smartInboxSlice.reducer;
