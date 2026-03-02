import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

// --- Types ---
export interface GeneralSettings {
    brandName?: string;
    whiteLabelDomain?: string;
    timezone?: string;
    locale?: string;
    twoFactorAuth?: boolean;
    emailVerification?: boolean;
    smsVerification?: boolean;
    rtlEnabled?: boolean;
    landingPageEnabled?: boolean;
    registerEnabled?: boolean;
    theme?: {
        primaryColor: string;
        sidebarTransparent: boolean;
        darkLayout: boolean;
    };
    defaultLanguage?: string;
    defaultTimezone?: string;
    dateFormat?: string;
    timeFormat?: string;
    logo?: string;
    favicon?: string;
}

export interface EmailProfile {
    _id: string;
    profileName: string;
    provider: string;
    senderEmail: string;
    senderName: string;
    isDefault: boolean;
    smtpConfig?: any;
    mailgunConfig?: any;
    postmarkConfig?: any;
    sesConfig?: any;
    mandrillConfig?: any;
}

export interface FacebookSettings {
    appName?: string;
    appVersion?: string;
    appId?: string;
    socialLoginEnabled?: boolean;
    appDomain?: string;
    siteUrl?: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    webhookVerifyToken?: string;
}

export interface AISettings {
    provider?: string;
    secretKey?: string; // will only be visible on write/placeholder
    promptModel?: string;
    instructionToAi?: string;
    forceUserToUseOwnApiKey?: boolean;
    isInherited?: boolean;
    canEdit?: boolean;
}

interface SettingsState {
    general: GeneralSettings | null;
    emailProfiles: EmailProfile[];
    facebook: FacebookSettings | null;
    ai: AISettings | null;

    isLoadingGeneral: boolean;
    isLoadingEmail: boolean;
    isLoadingFacebook: boolean;
    isLoadingAi: boolean;

    error: string | null;
}

const initialState: SettingsState = {
    general: null,
    emailProfiles: [],
    facebook: null,
    ai: null,
    isLoadingGeneral: false,
    isLoadingEmail: false,
    isLoadingFacebook: false,
    isLoadingAi: false,
    error: null,
};

// --- Thunks ---

// General Settings
export const fetchGeneralSettings = createAsyncThunk(
    'settings/fetchGeneral',
    async (params: { scopeType: string; scopeId?: string }, { rejectWithValue }) => {
        try {
            const { scopeType, scopeId } = params;
            const res = await api.get('/settings/general', { params: { scopeType, scopeId } });
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateGeneralSettings = createAsyncThunk(
    'settings/updateGeneral',
    async (payload: FormData | { scopeType: string; scopeId?: string | null; data: GeneralSettings }, { rejectWithValue }) => {
        try {
            const res = await api.post('/settings/general/update', payload);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Email Profiles
export const fetchEmailProfiles = createAsyncThunk(
    'settings/fetchEmailProfiles',
    async (params: { scopeType: string }, { rejectWithValue }) => {
        try {
            const res = await api.get('/settings/email/profiles', { params });
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// We will add createEmailProfile assuming we might need it for dynamic creations, but for now we focus on fetching
// Facebook Settings
export const fetchFacebookSettings = createAsyncThunk(
    'settings/fetchFacebook',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/settings/facebook');
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateFacebookSettings = createAsyncThunk(
    'settings/updateFacebook',
    async (payload: any, { rejectWithValue }) => {
        try {
            const res = await api.post('/settings/facebook', payload);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// AI Settings
export const fetchAiSettings = createAsyncThunk(
    'settings/fetchAi',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/settings/ai');
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateAiSettings = createAsyncThunk(
    'settings/updateAi',
    async (payload: AISettings, { rejectWithValue }) => {
        try {
            const res = await api.post('/settings/ai', payload);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Asset Upload
export const uploadFile = createAsyncThunk(
    'settings/uploadFile',
    async (file: File, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearSettingsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // General
        builder.addCase(fetchGeneralSettings.pending, (state) => { state.isLoadingGeneral = true; })
            .addCase(fetchGeneralSettings.fulfilled, (state, action) => {
                state.isLoadingGeneral = false;
                state.general = action.payload;
            })
            .addCase(fetchGeneralSettings.rejected, (state, action) => {
                state.isLoadingGeneral = false;
                state.error = action.payload as string;
            });

        builder.addCase(updateGeneralSettings.fulfilled, (state, action) => {
            state.general = action.payload;
        });

        // Email Modules
        builder.addCase(fetchEmailProfiles.pending, (state) => { state.isLoadingEmail = true; })
            .addCase(fetchEmailProfiles.fulfilled, (state, action) => {
                state.isLoadingEmail = false;
                state.emailProfiles = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchEmailProfiles.rejected, (state, action) => {
                state.isLoadingEmail = false;
                state.error = action.payload as string;
            });

        // Facebook
        builder.addCase(fetchFacebookSettings.pending, (state) => { state.isLoadingFacebook = true; })
            .addCase(fetchFacebookSettings.fulfilled, (state, action) => {
                state.isLoadingFacebook = false;
                state.facebook = action.payload;
            })
            .addCase(fetchFacebookSettings.rejected, (state, action) => {
                state.isLoadingFacebook = false;
                state.error = action.payload as string;
            });

        builder.addCase(updateFacebookSettings.fulfilled, (state, action) => {
            state.facebook = action.payload;
        });

        // AI
        builder.addCase(fetchAiSettings.pending, (state) => { state.isLoadingAi = true; })
            .addCase(fetchAiSettings.fulfilled, (state, action) => {
                state.isLoadingAi = false;
                state.ai = action.payload;
            })
            .addCase(fetchAiSettings.rejected, (state, action) => {
                state.isLoadingAi = false;
                state.error = action.payload as string;
            });

        builder.addCase(updateAiSettings.fulfilled, (state, action) => {
            state.ai = action.payload;
        });
    }
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
