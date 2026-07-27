'use client'

import React, { createContext, useContext } from 'react'
import { useAppSettings } from '@/lib/useAppSettings'
import dayjs from 'dayjs'

interface DateTimeContextType {
  timezone: string
  dateFormat: string
  timeFormat: string
  locale: string
  gmtOffset: string
  currentTimezone: string
  formatDate: (date: Date | string | number, customFmt?: string, tz?: string) => string
  formatTime: (date: Date | string | number, customFmt?: string, tz?: string) => string
  formatDateTime: (date: Date | string | number, customDateFormat?: string, customTimeFormat?: string, tz?: string) => string
  formatRelative: (date: Date | string | number, tz?: string) => string
  now: (tz?: string) => dayjs.Dayjs
}

const DateTimeContext = createContext<DateTimeContextType | null>(null)

export function DateTimeProvider({ children }: { children: React.ReactNode }) {
  const settings = useAppSettings()

  const value: DateTimeContextType = {
    timezone: settings.timezone,
    dateFormat: settings.dateFormat,
    timeFormat: settings.timeFormat,
    locale: settings.locale,
    gmtOffset: settings.gmtOffset,
    currentTimezone: settings.currentTimezone,
    formatDate: settings.formatDate,
    formatTime: settings.formatTime,
    formatDateTime: settings.formatDateTime,
    formatRelative: settings.formatRelative,
    now: (tz?: string) => dayjs().tz(tz || settings.timezone),
  }

  return <DateTimeContext.Provider value={value}>{children}</DateTimeContext.Provider>
}

export function useDateTime() {
  const context = useContext(DateTimeContext)
  if (!context) {
    // Fallback if rendered outside Provider
    const settings = useAppSettings()
    return {
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      locale: settings.locale,
      gmtOffset: settings.gmtOffset,
      currentTimezone: settings.currentTimezone,
      formatDate: settings.formatDate,
      formatTime: settings.formatTime,
      formatDateTime: settings.formatDateTime,
      formatRelative: settings.formatRelative,
      now: (tz?: string) => dayjs().tz(tz || settings.timezone),
    }
  }
  return context
}
