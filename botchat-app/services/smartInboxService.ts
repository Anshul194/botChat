import api from "@/lib/api";

export const getAccounts = async () => {
    const res = await api.get("/social/inbox/accounts");
    return res.data;
};

export const getConversations = async (filters: any = {}) => {
    const res = await api.get("/social/inbox/conversations", { params: filters });
    return res.data;
};

export const getConversationDetails = async (id: number) => {
    const res = await api.get(`/social/inbox/conversations/${id}`);
    return res.data;
};

export const getMessages = async (id: number) => {
    const res = await api.get(`/social/inbox/conversations/${id}/messages`);
    return res.data;
};

export const sendMessage = async (data: {
    conversation_id: number;
    message_type: "text" | "image" | "video" | "audio" | "file" | "voice";
    message?: string;
    media_url?: string;
}) => {
    const res = await api.post("/social/inbox/send", data);
    return res.data;
};

export const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/social/inbox/upload", formData);
    // Support both { url } and { data: { url } } response shapes
    return res.data;
};

export const uploadVoice = async (blob: Blob) => {
    // Detect MIME type from blob — Chrome uses audio/webm, Firefox uses audio/ogg
    const mime = blob.type || "audio/webm";
    const ext = mime.includes("ogg") ? "ogg" : mime.includes("wav") ? "wav" : "webm";
    const formData = new FormData();
    formData.append("file", blob, `voice.${ext}`);
    const res = await api.post("/social/inbox/upload-voice", formData);
    return res.data;
};

export const toggleStar = async (id: number, status: boolean) => {
    const res = await api.patch(`/social/inbox/conversations/${id}/star`, { is_starred: status });
    return res.data;
};

export const toggleArchive = async (id: number, status: boolean) => {
    const res = await api.patch(`/social/inbox/conversations/${id}/archive`, { is_archived: status });
    return res.data;
};

export const togglePin = async (id: number, status: boolean) => {
    const res = await api.patch(`/social/inbox/conversations/${id}/pin`, { is_pinned: status });
    return res.data;
};

export const toggleMute = async (id: number, status: boolean) => {
    const res = await api.patch(`/social/inbox/conversations/${id}/mute`, { is_muted: status });
    return res.data;
};

export const addReaction = async (messageId: number, reaction: string | null) => {
    const res = await api.patch(`/social/inbox/messages/${messageId}/reaction`, { reaction });
    return res.data;
};

export const typingStart = async (conversationId: number) => {
    const res = await api.post("/social/inbox/typing/start", { conversation_id: conversationId });
    return res.data;
};

export const typingStop = async (conversationId: number) => {
    const res = await api.post("/social/inbox/typing/stop", { conversation_id: conversationId });
    return res.data;
};

export const advancedSearch = async (filters: any) => {
    const res = await api.get("/social/inbox/search", { params: filters });
    return res.data;
};

export const markRead = async (conversationId: number) => {
    const res = await api.patch(`/social/inbox/conversations/${conversationId}/read`);
    return res.data;
};

export const getPresence = async () => {
    const res = await api.get("/social/inbox/presence");
    return res.data;
};

export const quickReplies = async () => {
    const res = await api.get("/social/inbox/quick-replies");
    return res.data;
};
