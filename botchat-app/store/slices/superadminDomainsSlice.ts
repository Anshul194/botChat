import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/api";

export interface DomainDnsRecord {
    type: string;
    host: string;
    value: string | null;
    ttl: number;
}

export interface DomainDnsInstructions {
    ttl: number;
    txt: DomainDnsRecord;
    a: DomainDnsRecord;
    aaaa?: DomainDnsRecord;
    cname?: DomainDnsRecord;
}

export interface SuperAdminDomainRequest {
    id: number;
    tenant_id: string;
    user_id?: number;
    domain_name: string;
    actual_domain_name: string;
    status: string; // "0" = pending, "1" = approved, "2" = rejected
    reason: string | null;
    rejection_reason: string | null;
    suggested_fix: string | null;
    created_at: string;
    updated_at?: string;
    server_ip?: string;
    dns_instructions?: DomainDnsInstructions;
}

interface SuperAdminDomainsState {
    requests: SuperAdminDomainRequest[];
    isLoading: boolean;
    isApproving: number | null; // ID of request being approved
    isRejecting: number | null; // ID of request being rejected
    error: string | null;
}

const initialState: SuperAdminDomainsState = {
    requests: [],
    isLoading: false,
    isApproving: null,
    isRejecting: null,
    error: null,
};

export const fetchSuperAdminDomainRequests = createAsyncThunk(
    "superadminDomains/fetchRequests",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/superadmin/domains");
            const data = response.data.data;
            // Ensure status is always a string for consistent comparisons
            if (Array.isArray(data)) {
                return data.map((item: any) => ({
                    ...item,
                    status: String(item.status),
                }));
            }
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch domain requests");
        }
    }
);

export const approveDomainRequest = createAsyncThunk(
    "superadminDomains/approveRequest",
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await api.post(`/superadmin/domains/${id}/approve`);
            const data = response.data.data;
            return { ...data, status: String(data.status) };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to approve domain request");
        }
    }
);

export const rejectDomainRequest = createAsyncThunk(
    "superadminDomains/rejectRequest",
    async (payload: { id: number; reason: string; suggested_fix?: string }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/superadmin/domains/${payload.id}/reject`, {
                reason: payload.reason,
                suggested_fix: payload.suggested_fix,
            });
            const data = response.data.data;
            return { ...data, status: String(data.status) };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to reject domain request");
        }
    }
);

const superadminDomainsSlice = createSlice({
    name: "superadminDomains",
    initialState,
    reducers: {
        clearSuperAdminDomainsError: (state) => {
            state.error = null;
        },
    },
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
            .addCase(approveDomainRequest.pending, (state, action) => {
                state.isApproving = action.meta.arg;
                state.error = null;
            })
            .addCase(approveDomainRequest.fulfilled, (state, action) => {
                state.isApproving = null;
                const index = state.requests.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.requests[index] = action.payload;
                }
            })
            .addCase(approveDomainRequest.rejected, (state, action) => {
                state.isApproving = null;
                state.error = action.payload as string;
            })
            // reject
            .addCase(rejectDomainRequest.pending, (state, action) => {
                state.isRejecting = action.meta.arg.id;
                state.error = null;
            })
            .addCase(rejectDomainRequest.fulfilled, (state, action) => {
                state.isRejecting = null;
                const index = state.requests.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.requests[index] = action.payload;
                }
            })
            .addCase(rejectDomainRequest.rejected, (state, action) => {
                state.isRejecting = null;
                state.error = action.payload as string;
            });
    },
});

export const { clearSuperAdminDomainsError } = superadminDomainsSlice.actions;
export default superadminDomainsSlice.reducer;
