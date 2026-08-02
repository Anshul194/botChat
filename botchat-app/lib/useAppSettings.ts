import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store/store'
import { fetchGeneralSettings } from '../store/slices/settingsSlice'
import {
  formatDate as dateFmt,
  formatTime as timeFmt,
  formatDateTime as dateTimeFmt,
  formatRelativeTime as relativeFmt,
  setTenantDateConfig,
  getTenantDateConfig,
} from './date'
import { getGmtOffsetString } from './timezones'

export function useAppSettings() {
  const dispatch = useDispatch<AppDispatch>()
  const { general, isLoadingGeneral } = useSelector((state: RootState) => state.settings)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && !general) {
      dispatch(fetchGeneralSettings({}))
    }
  }, [isAuthenticated, general, dispatch])

  // Effective settings resolution (User / Workspace / Fallback)
  const timezone = general?.timezone || general?.defaultTimezone || 'UTC'
  const dateFormat = general?.dateFormat || 'MMM DD, YYYY'
  const timeFormat = general?.timeFormat || 'hh:mm A'
  const locale = general?.locale || general?.defaultLanguage || 'en'

  // Sync date config whenever Redux state updates
  useEffect(() => {
    setTenantDateConfig({
      timezone,
      dateFormat,
      timeFormat,
    })
  }, [timezone, dateFormat, timeFormat])

  function formatDate(date: Date | string | number, customFmt?: string, tz?: string): string {
    if (!date) return ''
    return dateFmt(date, customFmt || dateFormat, tz || timezone)
  }

  function formatTime(date: Date | string | number, customFmt?: string, tz?: string): string {
    if (!date) return ''
    return timeFmt(date, customFmt || timeFormat, tz || timezone)
  }

  function formatDateTime(
    date: Date | string | number,
    customDateFormat?: string,
    customTimeFormat?: string,
    tz?: string
  ): string {
    if (!date) return ''
    return dateTimeFmt(date, customDateFormat || dateFormat, customTimeFormat || timeFormat, tz || timezone)
  }

  function formatRelative(date: Date | string | number, tz?: string): string {
    if (!date) return ''
    return relativeFmt(date, tz || timezone)
  }

  const gmtOffset = getGmtOffsetString(timezone)

  return {
    general,
    timezone,
    dateFormat,
    timeFormat,
    locale,
    gmtOffset,
    isLoadingGeneral,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    currentTimezone: timezone,
  }
}
