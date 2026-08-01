import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

export interface SuperAdminDomainRequest {
    id: number;
    tenant_id: string;
    domain_name: string;
    actual_domain_name: string;
    status: string; // "0" = pending, "1" = approved, "2" = rejected
    verification_token: string;
    dns_verified: boolean;
    reason: string | null;
    rejection_reason: string | null;
    suggested_fix: string | null;
    created_at: string;
    server_ip?: string;
}

interface SuperAdminDomainsState {
    requests: SuperAdminDomainRequest[];
    isLoading: boolean;
    error: string | null;
}

const initialState: SuperAdminDomainsState = {
    requests: [],
    isLoading: false,
    error: null,
};

export const fetchSuperAdminDomainRequests = createAsyncThunk(
    "superadminDomains/fetchRequests",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/v1/superadmin/domains");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch domain requests");
        }
    }
);

export const approveDomainRequest = createAsyncThunk(
    "superadminDomains/approveRequest",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/api/v1/superadmin/domains/${id}/approve`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to approve domain request");
        }
    }
);

export const rejectDomainRequest = createAsyncThunk(
    "superadminDomains/rejectRequest",
    async (payload: { id: number; reason: string; suggested_fix?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/api/v1/superadmin/domains/${payload.id}/reject`, {
                reason: payload.reason,
                suggested_fix: payload.suggested_fix,
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to reject domain request");
        }
    }
);

const superadminDomainsSlice = createSlice({
    name: "superadminDomains",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchSuperAdminDomainRequests.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSuperAdminDomainRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.requests = action.payload;
            })
            .addCase(fetchSuperAdminDomainRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // approve
            .addCase(approveDomainRequest.fulfilled, (state, action) => {
                const index = state.requests.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.requests[index] = action.payload;
                }
            })
            // reject
            .addCase(rejectDomainRequest.fulfilled, (state, action) => {
                const index = state.requests.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.requests[index] = action.payload;
                }
            });
    },
});

export default superadminDomainsSlice.reducer;
