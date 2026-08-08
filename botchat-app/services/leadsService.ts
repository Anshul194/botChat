import api from "@/lib/api";

export type LeadStatus = "completed" | "in_progress" | "abandoned";

export interface Lead {
  subscriber_id: number;
  bot_reply_id: number;
  subscriber_name: string;
  psid: string;
  email?: string;
  phone?: string;
  profile_pic?: string;
  channel_type: "facebook" | "instagram";
  flow_name: string;
  facebook_page_id?: string;
  page_name?: string;
  instagram_id?: string;
  ig_username?: string;
  total_steps: number;
  completed_answers: number;
  status: LeadStatus;
  started_at: string;
  last_interaction: string;
  tags: string[];
}

export interface LeadStats {
  total_leads: number;
  today_leads: number;
  completed: number;
  abandoned: number;
  in_progress: number;
  conversion_rate: number;
  last_submission: string | null;
}

export interface CollectedAnswer {
  step_id: number;
  step_order: number;
  field_name: string;
  question: string;
  input_type: string;
  value: string | null;
  answered: boolean;
  answered_at: string | null;
}

export interface LeadNote {
  id: number;
  note: string;
  created_by: string;
  created_at: string;
}

export interface LeadDetail {
  subscriber: {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    psid: string;
    email?: string;
    phone?: string;
    profile_pic?: string;
    channel_type: string;
  };
  flow: {
    id: number;
    name: string;
    channel_type: string;
    page_name?: string;
    page_id?: string;
    ig_username?: string;
    instagram_id?: string;
  };
  status: LeadStatus;
  started_at: string;
  last_interaction: string;
  total_steps: number;
  completed_answers: number;
  collected_answers: CollectedAnswer[];
  notes: LeadNote[];
  tags: string[];
  timeline: Array<{
    id: number;
    direction: "incoming" | "outgoing";
    text: string;
    type: string;
    time: string;
  }>;
}

export interface LeadListParams {
  channel?: string;
  page_id?: string;
  instagram_id?: string;
  bot_reply_id?: number;
  status?: LeadStatus;
  tag?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}

export interface FlowStats {
  bot_reply_id: number;
  bot_reply_name: string;
  total_leads: number;
  completed: number;
  abandoned: number;
  in_progress: number;
  conversion_rate: number;
  last_lead_at: string | null;
}

const leadsService = {
  async getLeads(params: LeadListParams) {
    const res = await api.get("/leads", { params });
    return res.data;
  },

  async getStats(params?: Partial<LeadListParams>) {
    const res = await api.get("/leads/stats", { params });
    return res.data.data as LeadStats;
  },

  async getLeadDetail(subscriberId: number, botReplyId: number) {
    const res = await api.get(`/leads/${subscriberId}/${botReplyId}`);
    return res.data.data as LeadDetail;
  },

  async getFilterOptions(params?: { channel?: string; page_id?: string; instagram_id?: string }) {
    const res = await api.get("/leads/filter-options", { params });
    return res.data.data as { flows: { id: number; name: string }[]; tags: string[] };
  },

  async getFlowStats(botReplyId: number) {
    const res = await api.get(`/leads/flow/${botReplyId}/stats`);
    return res.data.data as FlowStats;
  },

  async downloadExport(params: Partial<LeadListParams & { format: "csv" | "excel" }>) {
    const res = await api.get("/leads/export", {
      params,
      responseType: "blob",
    });

    const extension = params.format === "csv" ? "csv" : "xlsx";
    const filename = `collected_leads_${new Date().toISOString().slice(0, 10)}.${extension}`;
    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async addNote(subscriberId: number, botReplyId: number, note: string) {
    const res = await api.post(`/leads/${subscriberId}/${botReplyId}/notes`, { note });
    return res.data;
  },

  async deleteNote(noteId: number) {
    const res = await api.delete(`/leads/notes/${noteId}`);
    return res.data;
  },

  async addTag(subscriberId: number, botReplyId: number, tag: string) {
    const res = await api.post(`/leads/${subscriberId}/${botReplyId}/tags`, { tag });
    return res.data;
  },

  async removeTag(subscriberId: number, botReplyId: number, tag: string) {
    const res = await api.delete(`/leads/${subscriberId}/${botReplyId}/tags/${encodeURIComponent(tag)}`);
    return res.data;
  },

  async bulkAction(action: "delete" | "tag", leads: { subscriber_id: number; bot_reply_id: number }[], tag?: string) {
    const res = await api.post("/leads/bulk", { action, leads, tag });
    return res.data;
  },
};

export default leadsService;
