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
    smsVerification?: boolean;
    rtlEnabled?: boolean;
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

export interface DomainSettings {
    primary_hostname?: string;
    ipv4?: string;
    ipv6?: string;
    ttl?: number;
    txt_prefix?: string;
    ssl_provider?: string;
    verify_interval?: number;
    allow_wildcard_domains?: boolean;
    allow_root_domains?: boolean;
    reserved_domains?: string[];
    allowed_tlds?: string[];
}

export interface DomainRequest {
    id: number;
    tenant_id: string;
    domain_name: string;
    actual_domain_name: string;
    status: string; // '0' = pending, '1' = approved, '2' = rejected
    rejection_reason?: string;
    suggested_fix?: string;
    created_at: string;
    updated_at: string;
    connection_instructions?: DomainConnectionInstructions;
}

export interface DnsRecord {
    type: string;
    host: string;
    value: string | null;
    ttl: string | number;
}

export interface DomainConnectionInstructions {
    nameservers: { ns1: string; ns2: string };
    a_record: DnsRecord;
    aaaa_record: DnsRecord | null;
    cname_record: DnsRecord | null;
}

interface SettingsState {
    general: GeneralSettings | null;
    facebookPlatform: FacebookPlatformSettings | null;
    ai: AISettings | null;
    socialLogin: SocialLoginProviderSettings | null;
    tenantSocialLogin: TenantSocialLoginSettings | null;
    domainSettings: DomainSettings | null;
    domainRequests: DomainRequest[];

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
    domainSettings: null,
    domainRequests: [],
    isLoading: false,
    isLoadingGeneral: false,
    isLoadingFacebook: false,
    isLoadingAi: false,
    error: null,
};

// --- Helpers ---

/**
 * Normalize raw API settings payload:
 * Coerce '1'/'on'/1 → true, '0'/'off'/0 → false for boolean feature flags.
 */
function normalizeGeneralSettings(data: any): GeneralSettings {
    if (!data) return {};
    const asBool = (val: any, fallback: boolean): boolean => {
        if (val === undefined || val === null) return fallback;
        if (typeof val === 'boolean') return val;
        return val === '1' || val === 'on' || val === 1;
    };
    return {
        ...data,
        twoFactorAuth: asBool(data.two_factor_auth ?? data.twoFactorAuth, false),
        smsVerification: asBool(data.sms_verification ?? data.smsVerification, false),
        rtlEnabled: asBool(data.rtl_setting ?? data.rtlEnabled, false),
        registerEnabled: asBool(data.register_setting ?? data.registerEnabled, false),
        databasePermission: asBool(data.database_permission ?? data.databasePermission, false),
        // Alias snake_case keys to camelCase for form binding
        brandName: data.brand_name ?? data.brandName ?? '',
        whiteLabelDomain: data.white_label_domain ?? data.whiteLabelDomain ?? '',
        timezone: data.timezone ?? data.defaultTimezone ?? 'UTC',
        locale: data.locale ?? data.default_language ?? data.defaultLanguage ?? 'en',
        dateFormat: data.date_format ?? data.dateFormat ?? 'MMM DD, YYYY',
        timeFormat: data.time_format ?? data.timeFormat ?? 'hh:mm A',
        appName: data.app_name ?? data.appName ?? '',
        logo: data.app_logo ?? data.logo ?? '',
        favicon: data.favicon_logo ?? data.favicon ?? '',
        gtag: data.gtag ?? '',
    };
}

// Map snake_case Facebook API response → camelCase FacebookPlatformSettings
function mapFbApiToState(data: any): any {
    if (!data) return null;
    return {
        appName: data.fb_app_name || data.appName || '',
        appVersion: data.fb_app_version || data.appVersion || '',
        appId: data.fb_app_id || data.appId || '',
        appDomain: data.fb_app_domain || data.appDomain || '',
        siteUrl: data.fb_site_url || data.siteUrl || '',
        privacyPolicyUrl: data.fb_privacy_policy_url || data.privacyPolicyUrl || '',
        termsOfServiceUrl: data.fb_terms_of_service_url || data.termsOfServiceUrl || '',
        webhookVerifyToken: data.fb_webhook_verify_token || data.webhookVerifyToken || '',
        webhookCallbackUrl: data.fb_webhook_callback_url || '',
        oauthRedirectUri: data.fb_oauth_redirect_uri || '',
        loginCallbackUrl: data.fb_login_callback_url || '',
        dataDeletionCallbackUrl: data.fb_data_deletion_callback_url || '',
    };
}

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

export const updateDomainSettings = createAsyncThunk(
    'settings/updateDomainSettings',
    async (payload: Record<string, unknown>, { rejectWithValue }) => {
        try {
            const res = await api.patch('/settings/domain', payload);
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

// Domain Requests
export const fetchDomainRequests = createAsyncThunk(
    'settings/fetchDomainRequests',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/settings/domain-requests');
            const data = res.data?.data || res.data;
            // Ensure status is always a string for consistent comparisons
            if (Array.isArray(data)) {
                return data.map((item: any) => ({
                    ...item,
                    status: String(item.status),
                }));
            }
            return data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const requestDomainChange = createAsyncThunk(
    'settings/requestDomainChange',
    async (domain_name: string, { dispatch, rejectWithValue }) => {
        try {
            const res = await api.post('/settings/change-domain', { domain_name });
            // Refetch domain requests after successful submission
            dispatch(fetchDomainRequests());
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

export const testStorageSettings = createAsyncThunk(
    'settings/testStorage',
    async (payload: Record<string, any>, { rejectWithValue }) => {
        try {
            const res = await api.post('/settings/storage/test', payload);
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
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/settings/social-login');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateSocialLoginSettings = createAsyncThunk(
    'settings/updateSocialLoginSettings',
    async (payload: any, { rejectWithValue }) => {
        try {
            // Map boolean facebook_enabled/google_enabled → 'on'/'off' keys the backend expects
            const mapped: Record<string, any> = { ...payload };
            if (typeof payload.facebook_enabled === 'boolean') {
                mapped.facebook_login_enable = payload.facebook_enabled ? 'on' : 'off';
                delete mapped.facebook_enabled;
            }
            if (typeof payload.google_enabled === 'boolean') {
                mapped.google_login_enable = payload.google_enabled ? 'on' : 'off';
                delete mapped.google_enabled;
            }
            const response = await api.patch('/settings/social-login', mapped);
            return response.data;
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
                state.general = normalizeGeneralSettings(action.payload);
                state.domainSettings = action.payload?.domain_settings || null;
            })
            .addCase(fetchGeneralSettings.rejected, (state, action) => {
                state.isLoadingGeneral = false;
                state.error = action.payload as string;
            });

        builder.addCase(updateGeneralSettings.fulfilled, (state, action) => {
            state.general = normalizeGeneralSettings(action.payload);
            state.domainSettings = action.payload?.domain_settings || state.domainSettings;
        });

        builder.addCase(updateDomainSettings.fulfilled, (state, action) => {
            state.domainSettings = action.payload;
        }).addCase(updateDomainSettings.rejected, (state, action) => {
            state.error = action.payload as string;
        });

        // Facebook Platform
        builder.addCase(fetchFacebookSettings.pending, (state) => { state.isLoadingFacebook = true; })
            .addCase(fetchFacebookSettings.fulfilled, (state, action) => {
                state.isLoadingFacebook = false;
                state.facebookPlatform = mapFbApiToState(action.payload);
            })
            .addCase(fetchFacebookSettings.rejected, (state, action) => {
                state.isLoadingFacebook = false;
                state.error = action.payload as string;
            });

        builder.addCase(updateFacebookSettings.fulfilled, (state, action) => {
            state.facebookPlatform = mapFbApiToState(action.payload);
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

        // Domain Requests
        builder.addCase(fetchDomainRequests.pending, (state) => { state.isLoading = true; })
            .addCase(fetchDomainRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.domainRequests = action.payload;
            })
            .addCase(fetchDomainRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(requestDomainChange.pending, (state) => { state.isLoading = true; })
            .addCase(requestDomainChange.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(requestDomainChange.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

    }
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
