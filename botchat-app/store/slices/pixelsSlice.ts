import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../lib/api";

interface Pixel {
    id?: number;
    pixel_id?: number;
    name: string;
    type: string;
    pixel_id_value: string;
    created_at?: string;
    updated_at?: string;
}

interface PixelsState {
    pixels: Pixel[];
    isLoading: boolean;
    error: string | null;
}

const initialState: PixelsState = {
    pixels: [],
    isLoading: false,
    error: null,
};

export const fetchPixels = createAsyncThunk(
    "pixels/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/pixels");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch pixels");
        }
    }
);

export const createPixel = createAsyncThunk(
    "pixels/create",
    async (data: Pixel, { rejectWithValue }) => {
        try {
            const response = await api.post("/pixels", data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create pixel");
        }
    }
);

export const updatePixel = createAsyncThunk(
    "pixels/update",
    async ({ id, data }: { id: number; data: Pixel }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/pixels/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update pixel");
        }
    }
);

export const deletePixel = createAsyncThunk(
    "pixels/delete",
    async (id: number, { rejectWithValue }) => {
        try {
            await api.delete(`/pixels/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete pixel");
        }
    }
);

const pixelsSlice = createSlice({
    name: "pixels",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPixels.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPixels.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pixels = action.payload.data || action.payload;
            })
            .addCase(fetchPixels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(createPixel.fulfilled, (state, action) => {
                state.pixels.unshift(action.payload.data || action.payload);
            })
            .addCase(updatePixel.fulfilled, (state, action) => {
                const index = state.pixels.findIndex(p => (p.id || p.pixel_id) === (action.payload.data?.id || action.payload.data?.pixel_id));
                if (index !== -1) {
                    state.pixels[index] = action.payload.data || action.payload;
                }
            })
            .addCase(deletePixel.fulfilled, (state, action) => {
                state.pixels = state.pixels.filter(p => (p.id || p.pixel_id) !== action.payload);
            });
    },
});

export default pixelsSlice.reducer;
