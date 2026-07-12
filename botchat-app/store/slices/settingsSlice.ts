import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';
import { mapSettingsToApi } from '../../lib/utils';

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
    gtag?: string;
    databasePermission?: boolean;
    roles?: string;
    appName?: string;
}

export interface FacebookPlatformSettings {
    appName?: string;
    appVersion?: string;
    appId?: string;
    appDomain?: string;
    siteUrl?: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
    webhookVerifyToken?: string;
}

export interface AISettings {
    provider?: string;
    secretKey?: string;
    promptModel?: string;
    instructionToAi?: string;
    forceUserToUseOwnApiKey?: boolean;
    isInherited?: boolean;
    canEdit?: boolean;
}

export interface SocialLoginProviderSettings {
    fb_login_client_id?: string;
    fb_login_client_secret?: string;
    global_facebook_login_enable?: 'on' | 'off';
    google_login_client_id?: string;
    google_login_client_secret?: string;
    global_google_login_enable?: 'on' | 'off';
    fb_login_redirect_uri?: string;
    google_login_redirect_uri?: string;
    tenant_domain?: string;
}

export interface TenantSocialLoginSettings {
    facebook_enabled: boolean;
    google_enabled: boolean;
}

interface SettingsState {
    general: GeneralSettings | null;
    facebookPlatform: FacebookPlatformSettings | null;
    ai: AISettings | null;
    socialLogin: SocialLoginProviderSettings | null;
    tenantSocialLogin: TenantSocialLoginSettings | null;

    isLoading: boolean;
    isLoadingGeneral: boolean;
    isLoadingFacebook: boolean;
    isLoadingAi: boolean;

    error: string | null;
}

const initialState: SettingsState = {
    general: null,
    facebookPlatform: null,
    ai: null,
    socialLogin: null,
    tenantSocialLogin: null,
    isLoading: false,
    isLoadingGeneral: false,
    isLoadingFacebook: false,
    isLoadingAi: false,
    error: null,
};

// --- Thunks ---

// General Settings
export const fetchGeneralSettings = createAsyncThunk(
    'settings/fetchGeneral',
    async (_: any, { rejectWithValue }) => {
        try {
            const res = await api.get('/settings');
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateGeneralSettings = createAsyncThunk(
    'settings/updateGeneral',
    async (payload: GeneralSettings, { rejectWithValue }) => {
        try {
            const mapped = mapSettingsToApi(payload as any);
            const res = await api.patch('/settings', mapped);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Facebook Platform Settings
export const fetchFacebookSettings = createAsyncThunk(
    'settings/fetchFacebook',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/settings/facebook-platform');
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
            const res = await api.patch('/settings/facebook-platform', payload);
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

// Email Settings
export const updateEmailSettings = createAsyncThunk(
    'settings/updateEmail',
    async (payload: Record<string, any>, { rejectWithValue }) => {
        try {
            const res = await api.patch('/settings/email', payload);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// SMS Settings
export const updateSmsSettings = createAsyncThunk(
    'settings/updateSms',
    async (payload: Record<string, any>, { rejectWithValue }) => {
        try {
            const res = await api.patch('/settings/sms', payload);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Payment Settings
export const updatePaymentSettings = createAsyncThunk(
    'settings/updatePayment',
    async (payload: Record<string, any>, { rejectWithValue }) => {
        try {
            const res = await api.patch('/settings/payment', payload);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Storage Settings
export const updateStorageSettings = createAsyncThunk(
    'settings/updateStorage',
    async (payload: Record<string, any>, { rejectWithValue }) => {
        try {
            const res = await api.patch('/settings/storage', payload);
            return res.data?.data || res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// App Settings (logo & favicon upload)
export const updateAppSettings = createAsyncThunk(
    'settings/updateApp',
    async (payload: { app_name?: string; app_logo?: File | null; app_dark_logo?: File | null; favicon_logo?: File | null }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            if (payload.app_name) formData.append('app_name', payload.app_name);
            if (payload.app_logo) formData.append('app_logo', payload.app_logo);
            if (payload.app_dark_logo) formData.append('app_dark_logo', payload.app_dark_logo);
            if (payload.favicon_logo) formData.append('favicon_logo', payload.favicon_logo);
            const res = await api.post('/settings/app', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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

export const fetchSocialLoginSettings = createAsyncThunk(
    'settings/fetchSocialLoginSettings',
    async () => {
        const response = await api.get('/settings/social-login');
        return response.data.data;
    }
);

export const updateSocialLoginSettings = createAsyncThunk(
    'settings/updateSocialLoginSettings',
    async (payload: any) => {
        const response = await api.patch('/settings/social-login', payload);
        return response.data;
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

        // Facebook Platform
        builder.addCase(fetchFacebookSettings.pending, (state) => { state.isLoadingFacebook = true; })
            .addCase(fetchFacebookSettings.fulfilled, (state, action) => {
                state.isLoadingFacebook = false;
                state.facebookPlatform = action.payload;
            })
            .addCase(fetchFacebookSettings.rejected, (state, action) => {
                state.isLoadingFacebook = false;
                state.error = action.payload as string;
            });

        builder.addCase(updateFacebookSettings.fulfilled, (state, action) => {
            state.facebookPlatform = action.payload;
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
            })
            .addCase(updateAiSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to update AI Settings';
            })
            // Social Login Settings
            .addCase(fetchSocialLoginSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSocialLoginSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                // Determine if this is the tenant response or central response
                if ('facebook_enabled' in action.payload) {
                    state.tenantSocialLogin = action.payload;
                } else {
                    state.socialLogin = action.payload;
                }
            })
            .addCase(fetchSocialLoginSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to load Social Login Settings';
            })
            .addCase(updateSocialLoginSettings.fulfilled, (state, action) => {
                if (action.payload?.data) {
                    if ('facebook_enabled' in action.payload.data) {
                        state.tenantSocialLogin = action.payload.data;
                    } else {
                        state.socialLogin = action.payload.data;
                    }
                }
            });

        builder.addCase(updateAiSettings.fulfilled, (state, action) => {
            state.ai = action.payload;
        });
    }
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
