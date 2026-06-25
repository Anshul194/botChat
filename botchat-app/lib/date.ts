import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

export type DateFormat =
  | 'MMM DD, YYYY'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'YYYY-MM-DD'
  | 'M j, Y'
  | 'd-M-y'

export type TimeFormat =
  | 'hh:mm A'
  | 'HH:mm'
  | 'g:i A'
  | 'H:i'
  | 'H:i:s'

const DATE_FORMAT_MAP: Record<string, string> = {
  'M j, Y': 'MMM D, YYYY',
  'd-M-y': 'D-MMM-YY',
  'MMM DD, YYYY': 'MMM DD, YYYY',
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD',
}

const TIME_FORMAT_MAP: Record<string, string> = {
  'g:i A': 'h:mm A',
  'H:i:s': 'HH:mm:ss',
  'H:i': 'HH:mm',
  'hh:mm A': 'hh:mm A',
  'HH:mm': 'HH:mm',
}

function normalizeDateFormat(fmt: string): string {
  return DATE_FORMAT_MAP[fmt] || fmt
}

function normalizeTimeFormat(fmt: string): string {
  return TIME_FORMAT_MAP[fmt] || fmt
}

export interface TenantDateConfig {
  timezone: string
  dateFormat: string
  timeFormat: string
}

const DEFAULT_CONFIG: TenantDateConfig = {
  timezone: 'UTC',
  dateFormat: 'MMM DD, YYYY',
  timeFormat: 'hh:mm A',
}

let currentConfig: TenantDateConfig = { ...DEFAULT_CONFIG }

export function setTenantDateConfig(config: Partial<TenantDateConfig>) {
  currentConfig = { ...currentConfig, ...config }
}

export function getTenantDateConfig(): TenantDateConfig {
  return { ...currentConfig }
}

function ensureDayjs(date: Date | string | number | dayjs.Dayjs): dayjs.Dayjs {
  if (dayjs.isDayjs(date)) return date
  return dayjs.utc(date)
}

export function formatDate(
  date: Date | string | number | dayjs.Dayjs,
  format?: string,
  tz?: string,
): string {
  const d = ensureDayjs(date)
  const fmt = normalizeDateFormat(format || currentConfig.dateFormat)
  const timezone = tz || currentConfig.timezone
  return d.tz(timezone).format(fmt)
}

export function formatTime(
  date: Date | string | number | dayjs.Dayjs,
  format?: string,
  tz?: string,
): string {
  const d = ensureDayjs(date)
  const fmt = normalizeTimeFormat(format || currentConfig.timeFormat)
  const timezone = tz || currentConfig.timezone
  return d.tz(timezone).format(fmt)
}

export function formatDateTime(
  date: Date | string | number | dayjs.Dayjs,
  dateFormat?: string,
  timeFormat?: string,
  tz?: string,
): string {
  const d = ensureDayjs(date)
  const df = normalizeDateFormat(dateFormat || currentConfig.dateFormat)
  const tf = normalizeTimeFormat(timeFormat || currentConfig.timeFormat)
  const timezone = tz || currentConfig.timezone
  const localized = d.tz(timezone)
  return `${localized.format(df)} ${localized.format(tf)}`
}

export function formatRelativeTime(
  date: Date | string | number | dayjs.Dayjs,
  tz?: string,
): string {
  const d = ensureDayjs(date)
  const timezone = tz || currentConfig.timezone
  const localized = d.tz(timezone)
  return localized.fromNow()
}

export function convertTimezone(
  date: Date | string | number | dayjs.Dayjs,
  fromTz: string,
  toTz: string,
  format?: string,
): string {
  const d = dayjs.tz(ensureDayjs(date).format('YYYY-MM-DD HH:mm:ss'), fromTz)
  return d.tz(toTz).format(format || 'YYYY-MM-DD HH:mm:ss')
}

export function toUTC(date: Date | string | number | dayjs.Dayjs, fromTz: string): string {
  const d = dayjs.tz(ensureDayjs(date).format('YYYY-MM-DD HH:mm:ss'), fromTz)
  return d.utc().format('YYYY-MM-DD HH:mm:ss')
}

export function fromUTC(
  date: Date | string | number | dayjs.Dayjs,
  toTz: string,
  format?: string,
): string {
  const d = ensureDayjs(date)
  return d.tz(toTz).format(format || 'YYYY-MM-DD HH:mm:ss')
}

export function now(tz?: string): dayjs.Dayjs {
  const timezone = tz || currentConfig.timezone
  return dayjs().tz(timezone)
}

export { dayjs }
