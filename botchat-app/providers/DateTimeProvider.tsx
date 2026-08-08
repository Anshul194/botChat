'use client'

import React, { createContext, useContext } from 'react'
import { useAppSettings } from '@/lib/useAppSettings'
import { store } from '@/store/store'
import {
  formatDate as dateFmt,
  formatTime as timeFmt,
  formatDateTime as dateTimeFmt,
  formatRelativeTime as relativeFmt,
} from '@/lib/date'
import { getGmtOffsetString } from '@/lib/timezones'
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

function resolveFallbackSettings() {
  const general = store.getState().settings.general
  const timezone = general?.timezone || general?.defaultTimezone || 'UTC'
  const dateFormat = general?.dateFormat || 'MMM DD, YYYY'
  const timeFormat = general?.timeFormat || 'hh:mm A'
  const locale = general?.locale || general?.defaultLanguage || 'en'
  const gmtOffset = getGmtOffsetString(timezone)
  const formatDate = (date: Date | string | number, customFmt?: string, tz?: string) =>
    date ? dateFmt(date, customFmt || dateFormat, tz || timezone) : ''
  const formatTime = (date: Date | string | number, customFmt?: string, tz?: string) =>
    date ? timeFmt(date, customFmt || timeFormat, tz || timezone) : ''
  const formatDateTime = (
    date: Date | string | number,
    customDateFormat?: string,
    customTimeFormat?: string,
    tz?: string
  ) =>
    date
      ? dateTimeFmt(date, customDateFormat || dateFormat, customTimeFormat || timeFormat, tz || timezone)
      : ''
  const formatRelative = (date: Date | string | number, tz?: string) =>
    date ? relativeFmt(date, tz || timezone) : ''
  return {
    timezone,
    dateFormat,
    timeFormat,
    locale,
    gmtOffset,
    currentTimezone: timezone,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
  }
}

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
    const settings = resolveFallbackSettings()
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
