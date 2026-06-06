import api from "@/lib/api";

export const getBroadcastCampaigns = async (filters: any = {}) => {
    const res = await api.get("/broadcasts", { params: filters });
    return res.data;
};

export const getBroadcastCampaign = async (id: number) => {
    const res = await api.get(`/broadcasts/${id}`);
    return res.data;
};

export const createBroadcastCampaign = async (data: any) => {
    const res = await api.post("/broadcasts", data);
    return res.data;
};

export const updateBroadcastCampaign = async (id: number, data: any) => {
    const res = await api.put(`/broadcasts/${id}`, data);
    return res.data;
};

export const deleteBroadcastCampaign = async (id: number) => {
    const res = await api.delete(`/broadcasts/${id}`);
    return res.data;
};

// Phase 2: Audience Builder
export const getAudienceFilters = async () => {
    const res = await api.get("/broadcasts/audience/filters");
    return res.data;
};

export const previewAudience = async (filters: any) => {
    const res = await api.post("/broadcasts/audience/preview", filters);
    return res.data;
};

export const saveAudience = async (id: number, filters: any) => {
    const res = await api.post(`/broadcasts/${id}/audience`, filters);
    return res.data;
};

// Phase 3: Message Builder
export const getBroadcastMessage = async (id: number) => {
    const res = await api.get(`/broadcasts/${id}/message`);
    return res.data;
};

export const saveBroadcastMessage = async (id: number, data: { message_type: string, message_payload: any, content_status: string }) => {
    const res = await api.post(`/broadcasts/${id}/message`, data);
    return res.data;
};

export const previewBroadcastMessage = async (data: { message_type: string, message_payload: any }) => {
    const res = await api.post("/broadcasts/message/preview", data);
    return res.data;
};

export const validateBroadcastMessage = async (data: { message_type: string, message_payload: any }) => {
    const res = await api.post("/broadcasts/message/validate", data);
    return res.data;
};

export const getBroadcastReadiness = async (id: number) => {
    const res = await api.get(`/broadcasts/${id}/readiness`);
    return res.data;
};

// Phase 4: Review & Scheduling
export const generateRecipients = async (id: number) => {
    const res = await api.post(`/broadcasts/${id}/generate-recipients`);
    return res.data;
};

export const regenerateRecipients = async (id: number) => {
    const res = await api.post(`/broadcasts/${id}/regenerate-recipients`);
    return res.data;
};

export const getBroadcastRecipients = async (id: number, page = 1) => {
    const res = await api.get(`/broadcasts/${id}/recipients?page=${page}`);
    return res.data;
};

export const getBroadcastReview = async (id: number) => {
    const res = await api.get(`/broadcasts/${id}/review`);
    return res.data;
};

// Phase 5: Scheduling & Sending Engine

export const scheduleBroadcast = async (id: number, data: { schedule_type: 'now' | 'later', scheduled_at?: string }) => {
    const res = await api.post(`/broadcasts/${id}/schedule`, data);
    return res.data;
};

export const getBroadcastProgress = async (id: number) => {
    const res = await api.get(`/broadcasts/${id}/progress`);
    return res.data;
};

export const pauseBroadcast = async (id: number) => {
    const res = await api.post(`/broadcasts/${id}/pause`);
    return res.data;
};

export const resumeBroadcast = async (id: number) => {
    const res = await api.post(`/broadcasts/${id}/resume`);
    return res.data;
};

export const cancelBroadcast = async (id: number) => {
    const res = await api.post(`/broadcasts/${id}/cancel`);
    return res.data;
};

// ─── Phase 6: Analytics & Delivery Tracking ─────────────────────────────────

export const getBroadcastAnalytics = async (id: number) => {
    const res = await api.get(`/broadcasts/${id}/analytics`);
    return res.data;
};

export const getAnalyticsRecipients = async (
    id: number,
    params: { status?: string; search?: string; page?: number; per_page?: number } = {}
) => {
    const res = await api.get(`/broadcasts/${id}/analytics/recipients`, { params });
    return res.data;
};

export const getRecipientTimeline = async (id: number, recipientId: number) => {
    const res = await api.get(`/broadcasts/${id}/analytics/recipients/${recipientId}/timeline`);
    return res.data;
};

export const getAnalyticsLinks = async (id: number) => {
    const res = await api.get(`/broadcasts/${id}/analytics/links`);
    return res.data;
};

// ─── Phase 7: Templates & Content Library ───────────────────────────────────

export const cloneBroadcast = async (id: number, data: { name?: string; description?: string }) => {
    const res = await api.post(`/broadcasts/${id}/clone`, data);
    return res.data;
};

export const createBroadcastFromTemplate = async (templateId: number, data: any) => {
    const res = await api.post(`/broadcasts/from-template/${templateId}`, data);
    return res.data;
};

export const getBroadcastTemplates = async (params: any = {}) => {
    const res = await api.get('/broadcast-templates', { params });
    return res.data;
};

export const getBroadcastTemplate = async (id: number) => {
    const res = await api.get(`/broadcast-templates/${id}`);
    return res.data;
};

export const createBroadcastTemplate = async (data: any) => {
    const res = await api.post('/broadcast-templates', data);
    return res.data;
};

export const updateBroadcastTemplate = async (id: number, data: any) => {
    const res = await api.put(`/broadcast-templates/${id}`, data);
    return res.data;
};

export const deleteBroadcastTemplate = async (id: number) => {
    const res = await api.delete(`/broadcast-templates/${id}`);
    return res.data;
};

export const createTemplateFromCampaign = async (campaignId: number, data: any) => {
    const res = await api.post(`/broadcast-templates/from-campaign/${campaignId}`, data);
    return res.data;
};

export const getBroadcastAssets = async (params: any = {}) => {
    const res = await api.get('/broadcast-assets', { params });
    return res.data;
};

export const uploadBroadcastAsset = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const res = await api.post('/broadcast-assets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};

export const deleteBroadcastAsset = async (id: number) => {
    const res = await api.delete(`/broadcast-assets/${id}`);
    return res.data;
};
