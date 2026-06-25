'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchGeneralSettings, updateGeneralSettings } from '@/store/slices/settingsSlice'
import { setTenantDateConfig, type TenantDateConfig } from '@/lib/date'
import { setTenantCurrencyConfig, type TenantCurrencyConfig } from '@/lib/currency'

export interface TenantSettings {
  timezone: string
  dateFormat: string
  timeFormat: string
  currency: string
  currencySymbol: string
  language: string
  appName: string
  logo: string | null
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
  appName: 'BotChat',
  logo: null,
  favicon: null,
  dateConfig: { timezone: 'UTC', dateFormat: 'MMM DD, YYYY', timeFormat: 'hh:mm A' },
  currencyConfig: { currency: 'USD', currencySymbol: '$' },
}

const TenantSettingsContext = createContext<TenantSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  isLoading: true,
  refresh: () => {},
  updateSettings: async () => {},
})

export function useTenantSettings(): TenantSettingsContextValue {
  return useContext(TenantSettingsContext)
}

function extractSettings(general: Record<string, any> | null): TenantSettings {
  if (!general) return DEFAULT_SETTINGS

  const timezone = general.timezone || general.defaultTimezone || 'UTC'
  const dateFormat = general.dateFormat || 'MMM DD, YYYY'
  const timeFormat = general.timeFormat || 'hh:mm A'
  const currency = general.currency || 'USD'
  const currencySymbol = general.currencySymbol || '$'
  const language = general.defaultLanguage || 'en'
  const appName = general.appName || 'BotChat'

  const logoResolve = (path: string | null | undefined): string | null => {
    if (!path) return null
    if (path.startsWith('http')) return path
    if (path.startsWith('/')) return path
    return path
  }

  return {
    timezone,
    dateFormat,
    timeFormat,
    currency,
    currencySymbol,
    language,
    appName,
    logo: logoResolve(general.logo),
    favicon: logoResolve(general.favicon),
    dateConfig: { timezone, dateFormat, timeFormat },
    currencyConfig: { currency, currencySymbol },
  }
}

export function TenantSettingsProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { general, isLoadingGeneral } = useAppSelector((state) => state.settings)
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth)
  const [settings, setSettings] = useState<TenantSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  const applySettings = useCallback((general: Record<string, any> | null) => {
    const s = extractSettings(general)
    setSettings(s)
    setTenantDateConfig(s.dateConfig)
    setTenantCurrencyConfig(s.currencyConfig)
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated && !general) {
      dispatch(fetchGeneralSettings({}))
    }
  }, [isAuthenticated, general, dispatch])

  useEffect(() => {
    if (general && !loaded) {
      applySettings(general)
    }
  }, [general, loaded, applySettings])

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
