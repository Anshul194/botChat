import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────────
export type Permission = 'M' | 'C' | 'E' | 'D' | 'S' | 'U';

export interface Module {
    id: number;
    name: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

interface ModulesState {
    modules: Module[];
    selectedModule: Module | null;
    isLoading: boolean;
    isFetching: boolean;
    error: string | null;
}

const initialState: ModulesState = {
    modules: [],
    selectedModule: null,
    isLoading: false,
    isFetching: false,
    error: null,
};

// Normalise a raw module from the API: uppercase all permission strings so
// they always match our Permission union ('M'|'C'|'E'|'D'|'S'|'U').
function normaliseModule(raw: any): Module {
    return {
        ...raw,
        permissions: Array.isArray(raw.permissions)
            ? (raw.permissions as string[]).map(p => p.toUpperCase()) as Permission[]
            : [],
    };
}

// ── Thunks ─────────────────────────────────────────────────────────────

export const fetchModules = createAsyncThunk(
    'modules/fetchModules',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/modules');
            if (res.data.success) return res.data.data;
            return rejectWithValue(res.data.message);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch modules');
        }
    }
);

export const fetchModuleById = createAsyncThunk(
    'modules/fetchModuleById',
    async (id: number, { rejectWithValue }) => {
        try {
            const res = await api.get(`/modules/${id}`);
            if (res.data.success) return res.data.data;
            return rejectWithValue(res.data.message);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch module');
        }
    }
);

export const createModule = createAsyncThunk(
    'modules/createModule',
    async (payload: { name: string; permissions: Permission[] }, { rejectWithValue }) => {
        try {
            const res = await api.post('/modules', payload);
            if (res.data.success) return res.data.data;
            return rejectWithValue(res.data.message);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create module');
        }
    }
);

export const updateModule = createAsyncThunk(
    'modules/updateModule',
    async ({ id, ...payload }: { id: number; name: string; permissions: Permission[] }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/modules/${id}`, payload);
            if (res.data.success) return res.data.data;
            return rejectWithValue(res.data.message);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update module');
        }
    }
);

export const deleteModule = createAsyncThunk(
    'modules/deleteModule',
    async (id: number, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/modules/${id}`);
            if (res.data.success) return id;
            return rejectWithValue(res.data.message);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete module');
        }
    }
);

// ── Slice ──────────────────────────────────────────────────────────────

const modulesSlice = createSlice({
    name: 'modules',
    initialState,
    reducers: {
        clearSelectedModule(state) {
            state.selectedModule = null;
        },
    },
    extraReducers: (builder) => {
        // fetchModules
        builder
            .addCase(fetchModules.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(fetchModules.fulfilled, (state, action) => {
                state.isLoading = false;
                state.modules = (action.payload as any[]).map(normaliseModule);
            })
            .addCase(fetchModules.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // fetchModuleById
        builder
            .addCase(fetchModuleById.pending, (state) => { state.isFetching = true; })
            .addCase(fetchModuleById.fulfilled, (state, action) => {
                state.isFetching = false;
                state.selectedModule = normaliseModule(action.payload);
            })
            .addCase(fetchModuleById.rejected, (state) => { state.isFetching = false; });

        // createModule
        builder
            .addCase(createModule.fulfilled, (state, action) => {
                state.modules.unshift(normaliseModule(action.payload));
            });

        // updateModule
        builder
            .addCase(updateModule.fulfilled, (state, action) => {
                const norm = normaliseModule(action.payload);
                const idx = state.modules.findIndex(m => m.id === norm.id);
                if (idx !== -1) state.modules[idx] = norm;
                if (state.selectedModule?.id === norm.id) state.selectedModule = norm;
            });

        // deleteModule
        builder
            .addCase(deleteModule.fulfilled, (state, action) => {
                state.modules = state.modules.filter(m => m.id !== action.payload);
                if (state.selectedModule?.id === action.payload) state.selectedModule = null;
            });
    },
});

export const { clearSelectedModule } = modulesSlice.actions;
export default modulesSlice.reducer;
