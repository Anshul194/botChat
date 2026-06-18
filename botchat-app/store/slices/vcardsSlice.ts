import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../lib/api";

interface VcardState {
    vcards: any[];
    currentVcard: any | null;
    isLoading: boolean;
    error: string | null;
    pagination: {
        total: number;
        pages: number;
        current_page: number;
        per_page: number;
    };
    statistics: {
        data: any;
        isLoading: boolean;
        error: string | null;
    };
}

const initialState: VcardState = {
    vcards: [],
    currentVcard: null,
    isLoading: false,
    error: null,
    pagination: {
        total: 0,
        pages: 0,
        current_page: 1,
        per_page: 25,
    },
    statistics: {
        data: null,
        isLoading: false,
        error: null,
    },
};

export const fetchVcardStatistics = createAsyncThunk(
    "vcards/fetchVcardStatistics",
    async ({ vcardId, type, start_date, end_date }: any, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (type) params.append("type", type);
            if (start_date) params.append("start_date", start_date);
            if (end_date) params.append("end_date", end_date);
            
            const response = await api.get(`/vcards/${vcardId}/statistics?${params.toString()}`);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            return rejectWithValue(response.data?.message || "Failed to fetch statistics");
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch statistics");
        }
    }
);

export const fetchVcards = createAsyncThunk(
    "vcards/fetchAll",
    async (params: any = {}, { rejectWithValue }) => {
        try {
            const response = await api.get("/vcards", { params });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch vcards");
        }
    }
);

export const fetchVcardById = createAsyncThunk(
    "vcards/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await api.get(`/vcards/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch vcard");
        }
    }
);

export const createVcard = createAsyncThunk(
    "vcards/create",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await api.post("/vcards", data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create vcard");
        }
    }
);

export const updateVcard = createAsyncThunk(
    "vcards/update",
    async ({ id, data }: { id: string | number; data: any }, { rejectWithValue }) => {
        try {
            // PUT request with FormData or JSON
            const response = await api.put(`/vcards/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update vcard");
        }
    }
);

export const toggleVcard = createAsyncThunk(
    "vcards/toggle",
    async (id: string | number, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/vcards/${id}/toggle`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to toggle vcard");
        }
    }
);

export const duplicateVcard = createAsyncThunk(
    "vcards/duplicate",
    async (id: string | number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/vcards/${id}/duplicate`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to duplicate vcard");
        }
    }
);

export const resetVcardClicks = createAsyncThunk(
    "vcards/resetClicks",
    async (id: string | number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/vcards/${id}/reset`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to reset clicks");
        }
    }
);

export const deleteVcard = createAsyncThunk(
    "vcards/delete",
    async (id: string | number, { rejectWithValue }) => {
        try {
            await api.delete(`/vcards/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete vcard");
        }
    }
);

const vcardsSlice = createSlice({
    name: "vcards",
    initialState,
    reducers: {
        clearCurrentVcard: (state) => {
            state.currentVcard = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Statistics
            .addCase(fetchVcardStatistics.pending, (state) => {
                state.statistics.isLoading = true;
                state.statistics.error = null;
            })
            .addCase(fetchVcardStatistics.fulfilled, (state, action) => {
                state.statistics.isLoading = false;
                state.statistics.data = action.payload;
            })
            .addCase(fetchVcardStatistics.rejected, (state, action) => {
                state.statistics.isLoading = false;
                state.statistics.error = action.payload as string;
            })
            // Fetch All
            .addCase(fetchVcards.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchVcards.fulfilled, (state, action) => {
                state.isLoading = false;
                // Handle various response structures (data.rows, data, or array)
                const payload = action.payload;
                if (payload.data && Array.isArray(payload.data.rows)) {
                    state.vcards = payload.data.rows;
                    state.pagination = {
                        total: payload.data.total || 0,
                        pages: payload.data.last_page || 0,
                        current_page: payload.data.current_page || 1,
                        per_page: payload.data.per_page || 25,
                    };
                } else if (Array.isArray(payload.data)) {
                    state.vcards = payload.data;
                } else if (Array.isArray(payload)) {
                    state.vcards = payload;
                } else {
                    state.vcards = [];
                }
            })
            .addCase(fetchVcards.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch One
            .addCase(fetchVcardById.fulfilled, (state, action) => {
                state.currentVcard = action.payload.data;
            })
            // Update
            .addCase(updateVcard.fulfilled, (state, action) => {
                state.currentVcard = action.payload.data;
                const index = state.vcards.findIndex(v => v.id === action.payload.data.id);
                if (index !== -1) state.vcards[index] = action.payload.data;
            })
            // Toggle
            .addCase(toggleVcard.fulfilled, (state, action) => {
                const vcard = state.vcards.find(v => v.id === action.payload.data.id);
                if (vcard) vcard.is_enabled = action.payload.data.is_enabled;
                if (state.currentVcard?.id === action.payload.data.id) {
                    state.currentVcard.is_enabled = action.payload.data.is_enabled;
                }
            })
            // Delete
            .addCase(deleteVcard.fulfilled, (state, action) => {
                state.vcards = state.vcards.filter(v => v.id !== action.payload);
                if (state.currentVcard?.id === action.payload) state.currentVcard = null;
            });
    },
});

export const { clearCurrentVcard } = vcardsSlice.actions;
export default vcardsSlice.reducer;
