import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

export interface BioPage {
    link_id: string;
    user_id: string;
    url: string;
    type: string;
    is_enabled: string;
    datetime: string;
    last_datetime: string | null;
    settings: any;
    title: string;
    description: string;
}

interface BioState {
    pages: BioPage[];
    currentPage: BioPage | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: BioState = {
    pages: [],
    currentPage: null,
    isLoading: false,
    error: null,
};

export const fetchBioPages = createAsyncThunk(
    'bio/fetchBioPages',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/bio/pages');
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to fetch bio pages');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch bio pages');
        }
    }
);

export const createBioPage = createAsyncThunk(
    'bio/createBioPage',
    async (data: { url: string; name: string; description: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/bio/pages', data);
            if (response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data.message || 'Failed to create bio page');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create bio page');
        }
    }
);

export const deleteBioPage = createAsyncThunk(
    'bio/deleteBioPage',
    async (link_id: string, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/bio-builder/profile/${link_id}`);
            if (response.data.success) {
                return link_id;
            }
            return rejectWithValue(response.data.message || 'Failed to delete bio page');
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete bio page');
        }
    }
);

const bioSlice = createSlice({
    name: 'bio',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<BioPage | null>) => {
            state.currentPage = action.payload;
        },
        clearBioError: (state) => {
            state.error = null;
        },
        resetBioState: (state) => {
            state.pages = [];
            state.currentPage = null;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBioPages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchBioPages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pages = action.payload;
            })
            .addCase(fetchBioPages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteBioPage.fulfilled, (state, action) => {
                state.pages = state.pages.filter(p => p.link_id !== action.payload);
            })
            .addCase(createBioPage.fulfilled, (state, action) => {
                state.pages.unshift(action.payload);
            })
            .addCase(createBioPage.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { setCurrentPage, clearBioError, resetBioState } = bioSlice.actions;
export default bioSlice.reducer;
