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
}

const initialState: LinksState = {
    links: [],
    total: 0,
    isLoading: false,
    error: null,
};

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
    async (data: Partial<Link>, { rejectWithValue }) => {
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

const linksSlice = createSlice({
    name: 'links',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
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
            });
    },
});

export default linksSlice.reducer;
export type { LinksState };