'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchGeneralSettings, updateGeneralSettings, fetchPublicBranding } from '@/store/slices/settingsSlice'
import { setTenantDateConfig, type TenantDateConfig } from '@/lib/date'
import { setTenantCurrencyConfig, type TenantCurrencyConfig } from '@/lib/currency'
import { resolveApiBaseUrl } from '@/lib/config'

export interface TenantSettings {
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
  currencySymbol: string
  language: string
  appName: string
  logo: string | null
  darkLogo: string | null
  favicon: string | null
  dateConfig: TenantDateConfig
  currencyConfig: TenantCurrencyConfig
}

interface TenantSettingsContextValue {
  settings: TenantSettings
  isLoading: boolean
  refresh: () => void
  updateSettings: (payload: Record<string, any>) => Promise<void>
}

const DEFAULT_SETTINGS: TenantSettings = {
  timezone: 'UTC',
  dateFormat: 'MMM DD, YYYY',
  timeFormat: 'hh:mm A',
  currency: 'USD',
  currencySymbol: '$',
  language: 'en',
  appName: 'MegaDM',
  logo: null,
  darkLogo: null,
  favicon: null,
  dateConfig: { timezone: 'UTC', dateFormat: 'MMM DD, YYYY', timeFormat: 'hh:mm A' },
  currencyConfig: { currency: 'USD', currencySymbol: '$' },
}

export function resolveAssetUrl(path: string | null | undefined): string | null {
  if (!path || typeof path !== 'string') return null
  const trimmed = path.trim()
  if (!trimmed) return null

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  let apiBase = ''
  try {
    apiBase = resolveApiBaseUrl()
  } catch (e) { }

  if (!apiBase && typeof window !== 'undefined') {
    apiBase = window.location.origin
  }

  const baseHost = apiBase ? apiBase.replace(/\/api\/v1\/?$/, '') : ''

  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('/uploads/') || trimmed.startsWith('/storage/')) {
      return baseHost ? `${baseHost}${trimmed}` : trimmed
    }
    return trimmed
  }

  if (trimmed.startsWith('uploads/') || trimmed.startsWith('storage/')) {
    return baseHost ? `${baseHost}/${trimmed}` : `/${trimmed}`
  }

  return baseHost ? `${baseHost}/uploads/${trimmed}` : `/uploads/${trimmed}`
}

const GENERIC_NAMES = new Set([
  'my application',
  'myapplication',
  'my app',
  'myapp',
  'laravel',
  'full multi tenancy laravel admin saas',
  'chatpion',
  'botsocial ai',
])

export function sanitizeAppName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return 'MegaDM'
  const trimmed = name.trim()
  if (!trimmed || GENERIC_NAMES.has(trimmed.toLowerCase())) return 'MegaDM'
  return trimmed
}

const TenantSettingsContext = createContext<TenantSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refresh: () => { },
  updateSettings: async () => { },
})

export function useTenantSettings(): TenantSettingsContextValue {
  return useContext(TenantSettingsContext)
}

function extractSettings(general: Record<string, any> | null): TenantSettings {
  if (!general) {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('megadm_tenant_branding')
        if (cached) {
          const parsed = JSON.parse(cached)
          return {
            ...DEFAULT_SETTINGS,
            appName: sanitizeAppName(parsed.appName),
            logo: resolveAssetUrl(parsed.logo),
            darkLogo: resolveAssetUrl(parsed.darkLogo),
            favicon: resolveAssetUrl(parsed.favicon),
          }
        }
      } catch (e) { }
    }
    return DEFAULT_SETTINGS
  }

  const timezone = general.timezone || general.defaultTimezone || 'UTC'
  const dateFormat = general.dateFormat || 'MMM DD, YYYY'
  const timeFormat = general.timeFormat || 'hh:mm A'
  const currency = general.currency || 'USD'
  const currencySymbol = general.currencySymbol || '$'
  const language = general.defaultLanguage || 'en'
  const rawAppName = general.appName || general.app_name || general.brandName || general.brand_name || general.siteName || general.platformName || 'MegaDM'
  const appName = sanitizeAppName(rawAppName)
  const rawLogo = general.logo ?? general.app_logo ?? general.appLogo ?? general.site_logo ?? general.light_logo ?? general.lightLogo ?? null
  const rawDarkLogo = general.darkLogo ?? general.app_dark_logo ?? general.dark_logo ?? general.darkLogoUrl ?? general.dark_logo_url ?? null
  const rawFavicon = general.favicon ?? general.favicon_logo ?? general.faviconLogo ?? general.site_favicon ?? null

  const resolvedLogo = resolveAssetUrl(rawLogo)
  const resolvedDarkLogo = resolveAssetUrl(rawDarkLogo)
  const resolvedFavicon = resolveAssetUrl(rawFavicon)

  const result: TenantSettings = {
    timezone,
    dateFormat,
    timeFormat,
    currency,
    currencySymbol,
    language,
    appName,
    logo: resolvedLogo,
    darkLogo: resolvedDarkLogo,
    favicon: resolvedFavicon,
    dateConfig: { timezone, dateFormat, timeFormat },
    currencyConfig: { currency, currencySymbol },
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('megadm_tenant_branding', JSON.stringify({
        appName: result.appName,
        logo: result.logo,
        darkLogo: result.darkLogo,
        favicon: result.favicon,
      }))
    } catch (e) { }
  }

  return result
}

export function TenantSettingsProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { general, isLoadingGeneral } = useAppSelector((state) => state.settings)
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth)
  const [settings, setSettings] = useState<TenantSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('megadm_tenant_branding')
        if (cached) {
          const parsed = JSON.parse(cached)
          return {
            ...DEFAULT_SETTINGS,
            appName: sanitizeAppName(parsed.appName),
            logo: resolveAssetUrl(parsed.logo),
            darkLogo: resolveAssetUrl(parsed.darkLogo),
            favicon: resolveAssetUrl(parsed.favicon),
          }
        }
      } catch (e) { }
    }
    return DEFAULT_SETTINGS
  })
  const [loaded, setLoaded] = useState(false)

  const applySettings = useCallback((general: Record<string, any> | null) => {
    const s = extractSettings(general)
    setSettings(s)
    setTenantDateConfig(s.dateConfig)
    setTenantCurrencyConfig(s.currencyConfig)
    setLoaded(true)
  }, [])

  // Always fetch branding on mount so the landing page logo shows for unauthenticated visitors.
  // fetchPublicBranding uses a plain axios call (no auth interceptor) to avoid 401→redirect.
  useEffect(() => {
    if (!general) {
      dispatch(fetchPublicBranding({}))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // When user is authenticated, fetch full settings (overwrites public branding)
  useEffect(() => {
    if (isAuthenticated && !general) {
      dispatch(fetchGeneralSettings({}))
    }
  }, [isAuthenticated, general, dispatch])

  useEffect(() => {
    if (general) {
      applySettings(general)
    }
  }, [general, applySettings])

  useEffect(() => {
    const handleBrandingChange = () => {
      try {
        const cached = localStorage.getItem('megadm_tenant_branding')
        if (cached) {
          const parsed = JSON.parse(cached)
          setSettings((prev) => ({
            ...prev,
            appName: sanitizeAppName(parsed.appName) || prev.appName,
            logo: resolveAssetUrl(parsed.logo) ?? prev.logo,
            darkLogo: resolveAssetUrl(parsed.darkLogo) ?? prev.darkLogo,
            favicon: resolveAssetUrl(parsed.favicon) ?? prev.favicon,
          }))
        }
      } catch (e) { }
    }
    window.addEventListener('tenant-settings:updated', handleBrandingChange)
    window.addEventListener('storage', handleBrandingChange)
    return () => {
      window.removeEventListener('tenant-settings:updated', handleBrandingChange)
      window.removeEventListener('storage', handleBrandingChange)
    }
  }, [])

  const refresh = useCallback(() => {
    dispatch(fetchGeneralSettings({}))
  }, [dispatch])

  const updateSettingsFn = useCallback(async (payload: Record<string, any>) => {
    await dispatch(updateGeneralSettings(payload as any))
    dispatch(fetchGeneralSettings({}))
  }, [dispatch])

  const value: TenantSettingsContextValue = {
    settings,
    isLoading: isLoadingGeneral || (isAuthenticated && !loaded && isInitialized),
    refresh,
    updateSettings: updateSettingsFn,
  }

  return (
    <TenantSettingsContext.Provider value={value}>
      {children}
    </TenantSettingsContext.Provider>
  )
}
