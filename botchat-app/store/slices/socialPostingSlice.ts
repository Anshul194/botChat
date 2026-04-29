import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface SocialCampaign {
    id: number;
    campaign_name: string;
    media_type: 'facebook' | 'instagram';
    publisher_type: 'page' | 'account';
    post_type: 'image' | 'video' | 'text' | 'link';
    message: string;
    image_urls?: string[];
    video_url?: string;
    link?: string;
    schedule_type: 'now' | 'later';
    schedule_time?: string;
    posting_status: string;
    selected_pages: Array<{
        id: number;
        platform_id: string;
    }>;
}

export interface SocialPostingState {
    campaigns: SocialCampaign[];
    ctaCampaigns: SocialCampaign[];
    ctaTypes: string[];
    autoReplyTemplates: any[];
    currentCampaign: SocialCampaign | null;
    isLoading: boolean;
    isPublishing: boolean;
    error: string | null;
}

const initialState: SocialPostingState = {
    campaigns: [],
    ctaCampaigns: [],
    ctaTypes: [],
    autoReplyTemplates: [],
    currentCampaign: null,
    isLoading: false,
    isPublishing: false,
    error: null,
};

// Async Thunks
export const fetchCampaigns = createAsyncThunk(
    'socialPosting/fetchCampaigns',
    async (params: { per_page?: number; posting_status?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await api.get('/social-posting/multimedia', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
        }
    }
);

export const createCampaign = createAsyncThunk(
    'socialPosting/createCampaign',
    async (campaignData: Partial<SocialCampaign>, { rejectWithValue }) => {
        try {
            const response = await api.post('/social-posting/multimedia', campaignData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
        }
    }
);

export const getCampaign = createAsyncThunk(
    'socialPosting/getCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.get(`/social-posting/multimedia/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign');
        }
    }
);

export const updateCampaign = createAsyncThunk(
    'socialPosting/updateCampaign',
    async ({ id, data }: { id: number; data: Partial<SocialCampaign> }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/social-posting/multimedia/${id}`, data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update campaign');
        }
    }
);

export const deleteCampaign = createAsyncThunk(
    'socialPosting/deleteCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/social-posting/multimedia/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete campaign');
        }
    }
);

export const publishCampaign = createAsyncThunk(
    'socialPosting/publishCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/social-posting/multimedia/${id}/publish`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to publish campaign');
        }
    }
);

// CTA Thunks
export const fetchCtaTypes = createAsyncThunk(
    'socialPosting/fetchCtaTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/social-posting/cta/types');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch CTA types');
        }
    }
);

export const fetchCtaCampaigns = createAsyncThunk(
    'socialPosting/fetchCtaCampaigns',
    async (params: { per_page?: number; posting_status?: string } | undefined, { rejectWithValue }) => {
        try {
            const response = await api.get('/social-posting/cta', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch CTA campaigns');
        }
    }
);

export const createCtaCampaign = createAsyncThunk(
    'socialPosting/createCtaCampaign',
    async (campaignData: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/social-posting/cta', campaignData);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create CTA campaign');
        }
    }
);

export const updateCtaCampaign = createAsyncThunk(
    'socialPosting/updateCtaCampaign',
    async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/social-posting/cta/${id}`, data);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update CTA campaign');
        }
    }
);

export const deleteCtaCampaign = createAsyncThunk(
    'socialPosting/deleteCtaCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/social-posting/cta/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete CTA campaign');
        }
    }
);

export const publishCtaCampaign = createAsyncThunk(
    'socialPosting/publishCtaCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/social-posting/cta/${id}/publish`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to publish CTA campaign');
        }
    }
);

export const duplicateCtaCampaign = createAsyncThunk(
    'socialPosting/duplicateCtaCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/social-posting/cta/${id}/duplicate`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to duplicate CTA campaign');
        }
    }
);

export const fetchAutoReplyTemplates = createAsyncThunk(
    'socialPosting/fetchAutoReplyTemplates',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/facebook/auto-reply-template');
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch auto-reply templates');
        }
    }
);

const socialPostingSlice = createSlice({
    name: 'socialPosting',
    initialState,
    reducers: {
        clearCurrentCampaign: (state) => {
            state.currentCampaign = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Campaigns
            .addCase(fetchCampaigns.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.campaigns = action.payload;
            })
            .addCase(fetchCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Create Campaign
            .addCase(createCampaign.fulfilled, (state, action) => {
                state.campaigns.unshift(action.payload);
            })
            // Publish Campaign
            .addCase(publishCampaign.pending, (state) => {
                state.isPublishing = true;
            })
            .addCase(publishCampaign.fulfilled, (state) => {
                state.isPublishing = false;
            })
            .addCase(publishCampaign.rejected, (state, action) => {
                state.isPublishing = false;
                state.error = action.payload as string;
            })
            // CTA Cases
            .addCase(fetchCtaTypes.fulfilled, (state, action) => {
                state.ctaTypes = action.payload;
            })
            .addCase(fetchCtaCampaigns.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCtaCampaigns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.ctaCampaigns = action.payload;
            })
            .addCase(fetchCtaCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createCtaCampaign.fulfilled, (state, action) => {
                state.ctaCampaigns.unshift(action.payload);
            })
            .addCase(publishCtaCampaign.pending, (state) => {
                state.isPublishing = true;
            })
            .addCase(publishCtaCampaign.fulfilled, (state) => {
                state.isPublishing = false;
            })
            .addCase(publishCtaCampaign.rejected, (state, action) => {
                state.isPublishing = false;
                state.error = action.payload as string;
            })
            .addCase(deleteCtaCampaign.fulfilled, (state, action) => {
                state.ctaCampaigns = state.ctaCampaigns.filter(c => c.id !== action.payload);
            })
            .addCase(duplicateCtaCampaign.fulfilled, (state, action) => {
                state.ctaCampaigns.unshift(action.payload);
            })
            .addCase(fetchAutoReplyTemplates.fulfilled, (state, action) => {
                state.autoReplyTemplates = action.payload;
            });
    },
});

export const { clearCurrentCampaign, clearError } = socialPostingSlice.actions;
export default socialPostingSlice.reducer;
