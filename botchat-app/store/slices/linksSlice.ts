import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface Link {
    link_id: number;
    location_url: string;
    url: string;
    domain_id: number | null;
    sensitive_content: boolean;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    clicks?: number;
    status?: number;
    title?: string;
    // Add other fields as needed
}

interface LinksState {
    links: Link[];
    total: number;
    isLoading: boolean;
    error: string | null;
    currentLink: Link | null;
    statistics: {
        data: any;
        isLoading: boolean;
        error: string | null;
    };
}

const initialState: LinksState = {
    links: [],
    total: 0,
    isLoading: false,
    error: null,
    currentLink: null,
    statistics: {
        data: null,
        isLoading: false,
        error: null,
    },
};

export const fetchLinkStatistics = createAsyncThunk(
    'links/fetchLinkStatistics',
    async ({ linkId, type, start_date, end_date }: any, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (start_date) params.append('start_date', start_date);
            if (end_date) params.append('end_date', end_date);
            
            const response = await api.get(`/links/${linkId}/statistics?${params.toString()}`);
            if (response.data && response.data.success) {
                // Return the inner data payload (not the full envelope) so the
                // frontend can read data?.totals?.pageviews directly.
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || 'Failed to fetch statistics');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch statistics');
        }
    }
);

export const fetchLinks = createAsyncThunk(
    'links/fetchLinks',
    async (params: Record<string, any>, { rejectWithValue }) => {
        try {
            const response = await api.get('/links', { params });
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to fetch links');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch links');
        }
    }
);

export const createLink = createAsyncThunk(
    'links/createLink',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/links', data);
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to create link');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create link');
        }
    }
);

export const deleteLink = createAsyncThunk(
    'links/deleteLink',
    async (linkId: number | string, { rejectWithValue }) => {
        try {
            await api.delete(`/links/${linkId}`);
            return linkId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete link');
        }
    }
);

export const fetchLinkById = createAsyncThunk(
    'links/fetchLinkById',
    async (linkId: number | string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/links/${linkId}`);
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to fetch link details');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch link details');
        }
    }
);

export const updateLink = createAsyncThunk(
    'links/updateLink',
    async ({ linkId, data }: { linkId: number | string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/links/${linkId}`, data);
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to update link');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update link');
        }
    }
);

const linksSlice = createSlice({
    name: 'links',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLinkStatistics.pending, (state) => {
                state.statistics.isLoading = true;
                state.statistics.error = null;
            })
            .addCase(fetchLinkStatistics.fulfilled, (state, action) => {
                state.statistics.isLoading = false;
                state.statistics.data = action.payload;
            })
            .addCase(fetchLinkStatistics.rejected, (state, action) => {
                state.statistics.isLoading = false;
                state.statistics.error = action.payload as string;
            })
            .addCase(fetchLinks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchLinks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.links = action.payload.data || [];
                state.total = action.payload.meta?.total || action.payload.data?.length || 0;
            })
            .addCase(fetchLinks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createLink.fulfilled, (state, action) => {
                state.links.unshift(action.payload.data);
                state.total += 1;
            })
            .addCase(createLink.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(fetchLinkById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentLink = null;
            })
            .addCase(fetchLinkById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentLink = action.payload.data;
            })
            .addCase(fetchLinkById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateLink.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateLink.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentLink = action.payload.data;
                const index = state.links.findIndex(l => l.link_id === action.payload.data.link_id || l.id === action.payload.data.id);
                if (index !== -1) {
                    state.links[index] = action.payload.data;
                }
            })
            .addCase(updateLink.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteLink.fulfilled, (state, action) => {
                state.links = state.links.filter(l => (l.link_id || (l as any).id) !== action.payload);
                state.total -= 1;
            });
    },
});

export default linksSlice.reducer;
export type { LinksState };