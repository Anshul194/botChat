import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

export interface CarouselCampaign {
    id: number;
    campaign_name: string;
    message: string;
    slider_images: string[];
    schedule_type: 'now' | 'later';
    schedule_time?: string;
    repeat_times: number;
    time_interval: number;
    posting_status: string;
    created_at: string;
}

interface CarouselState {
    campaigns: CarouselCampaign[];
    isLoading: boolean;
    isPublishing: boolean;
    error: string | null;
}

const initialState: CarouselState = {
    campaigns: [],
    isLoading: false,
    isPublishing: false,
    error: null,
};

export const fetchCarouselCampaigns = createAsyncThunk(
    'carousel/fetchCampaigns',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/social-posting/carousel');
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
        }
    }
);

export const createCarouselCampaign = createAsyncThunk(
    'carousel/createCampaign',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/social-posting/carousel', data);
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
        }
    }
);

export const deleteCarouselCampaign = createAsyncThunk(
    'carousel/deleteCampaign',
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/social-posting/carousel/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete campaign');
        }
    }
);

const carouselSlice = createSlice({
    name: 'carousel',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCarouselCampaigns.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCarouselCampaigns.fulfilled, (state, action) => {
                state.isLoading = false;
                state.campaigns = action.payload;
            })
            .addCase(fetchCarouselCampaigns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createCarouselCampaign.pending, (state) => {
                state.isPublishing = true;
            })
            .addCase(createCarouselCampaign.fulfilled, (state, action) => {
                state.isPublishing = false;
                state.campaigns.unshift(action.payload);
            })
            .addCase(createCarouselCampaign.rejected, (state, action) => {
                state.isPublishing = false;
                state.error = action.payload as string;
            })
            .addCase(deleteCarouselCampaign.fulfilled, (state, action) => {
                state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
            });
    },
});

export default carouselSlice.reducer;
