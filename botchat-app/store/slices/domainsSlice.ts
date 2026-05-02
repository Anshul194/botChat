import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface Domain {
    domain_id: number;
    domain: string;
    custom_index_url: string | null;
    custom_not_found_url: string | null;
    is_enabled: number;
    // Add other fields as needed
}

interface DomainsState {
    domains: Domain[];
    total: number;
    isLoading: boolean;
    error: string | null;
    currentDomain: Domain | null;
}

const initialState: DomainsState = {
    domains: [],
    total: 0,
    isLoading: false,
    error: null,
    currentDomain: null,
};

export const fetchDomains = createAsyncThunk(
    'domains/fetchDomains',
    async (params: Record<string, any> | undefined, { rejectWithValue }) => {
        try {
            const response = await api.get('/domains', { params });
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to fetch domains');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch domains');
        }
    }
);

export const createDomain = createAsyncThunk(
    'domains/createDomain',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post('/domains', data);
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to create domain');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create domain');
        }
    }
);

export const deleteDomain = createAsyncThunk(
    'domains/deleteDomain',
    async (domainId: number | string, { rejectWithValue }) => {
        try {
            await api.delete(`/domains/${domainId}`);
            return domainId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete domain');
        }
    }
);

export const fetchDomainById = createAsyncThunk(
    'domains/fetchDomainById',
    async (domainId: number | string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/domains/${domainId}`);
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to fetch domain details');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch domain details');
        }
    }
);

export const updateDomain = createAsyncThunk(
    'domains/updateDomain',
    async ({ domainId, data }: { domainId: number | string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/domains/${domainId}`, data);
            if (response.data) {
                return response.data;
            }
            return rejectWithValue('Failed to update domain');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update domain');
        }
    }
);

const domainsSlice = createSlice({
    name: 'domains',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDomains.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDomains.fulfilled, (state, action) => {
                state.isLoading = false;
                state.domains = action.payload.data || [];
                state.total = action.payload.meta?.total || action.payload.data?.length || 0;
            })
            .addCase(fetchDomains.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createDomain.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createDomain.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.data) {
                    state.domains.unshift(action.payload.data);
                    state.total += 1;
                }
            })
            .addCase(createDomain.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchDomainById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentDomain = null;
            })
            .addCase(fetchDomainById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentDomain = action.payload.data;
            })
            .addCase(fetchDomainById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateDomain.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateDomain.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentDomain = action.payload.data;
                const index = state.domains.findIndex(d => (d.domain_id || (d as any).id) === (action.payload.data.domain_id || action.payload.data.id));
                if (index !== -1) {
                    state.domains[index] = action.payload.data;
                }
            })
            .addCase(updateDomain.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteDomain.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteDomain.fulfilled, (state, action) => {
                state.isLoading = false;
                state.domains = state.domains.filter(d => (d.domain_id || (d as any).id) !== action.payload);
                state.total -= 1;
            })
            .addCase(deleteDomain.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export default domainsSlice.reducer;
export type { DomainsState };
