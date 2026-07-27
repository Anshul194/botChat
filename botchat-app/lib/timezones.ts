import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export interface TimezoneOption {
  value: string
  label: string
  region: string
  city: string
  offset: string
  offsetMinutes: number
}

// Major IANA Timezone list grouped by region
const TIMEZONE_LIST: string[] = [
  'UTC',
  // Africa
  'Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Cairo',
  'Africa/Casablanca', 'Africa/Dakar', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Tunis',
  // America
  'America/Anchorage', 'America/Argentina/Buenos_Aires', 'America/Bogota', 'America/Caracas',
  'America/Chicago', 'America/Denver', 'America/Guatemala', 'America/Halifax', 'America/Havana',
  'America/Los_Angeles', 'America/Mexico_City', 'America/New_York', 'America/Phoenix',
  'America/Santiago', 'America/Sao_Paulo', 'America/Toronto', 'America/Vancouver',
  // Asia
  'Asia/Almaty', 'Asia/Amman', 'Asia/Baghdad', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Beirut',
  'Asia/Colombo', 'Asia/Dhaka', 'Asia/Dubai', 'Asia/Hong_Kong', 'Asia/Istanbul', 'Asia/Jakarta',
  'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Kolkata', 'Asia/Kuala_Lumpur',
  'Asia/Kuwait', 'Asia/Manila', 'Asia/Muscat', 'Asia/Riyadh', 'Asia/Seoul', 'Asia/Shanghai',
  'Asia/Singapore', 'Asia/Tashkent', 'Asia/Tehran', 'Asia/Tokyo', 'Asia/Yangon',
  // Atlantic
  'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde',
  // Australia
  'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Darwin', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney',
  // Europe
  'Europe/Amsterdam', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Brussels',
  'Europe/Bucharest', 'Europe/Budapest', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Helsinki',
  'Europe/Istanbul', 'Europe/Kiev', 'Europe/Lisbon', 'Europe/London', 'Europe/Madrid',
  'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Prague', 'Europe/Rome',
  'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw', 'Europe/Zurich',
  // Indian
  'Indian/Maldives', 'Indian/Mauritius',
  // Pacific
  'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Midway', 'Pacific/Port_Moresby', 'Pacific/Tahiti',
]

/**
 * Format GMT offset string (e.g. GMT+05:30, GMT-05:00)
 */
export function getGmtOffsetString(tzName: string, date: Date = new Date()): string {
  try {
    const d = dayjs(date).tz(tzName)
    const offsetMin = d.utcOffset()
    const sign = offsetMin >= 0 ? '+' : '-'
    const absMin = Math.abs(offsetMin)
    const hours = String(Math.floor(absMin / 60)).padStart(2, '0')
    const mins = String(absMin % 60).padStart(2, '0')
    return `GMT${sign}${hours}:${mins}`
  } catch {
    return 'GMT+00:00'
  }
}

/**
 * Build rich timezone options for dropdown display and search.
 */
export function getAllTimezones(date: Date = new Date()): TimezoneOption[] {
  return TIMEZONE_LIST.map((tz) => {
    const parts = tz.split('/')
    const region = parts.length > 1 ? parts[0] : 'Global'
    const city = parts.length > 1 ? parts.slice(1).join('/').replace(/_/g, ' ') : tz
    const offset = getGmtOffsetString(tz, date)

    // Compute offset minutes for sorting
    let offsetMinutes = 0
    try {
      offsetMinutes = dayjs(date).tz(tz).utcOffset()
    } catch {
      offsetMinutes = 0
    }

    return {
      value: tz,
      label: `${tz} (${offset})`,
      region,
      city,
      offset,
      offsetMinutes,
    }
  })
}

/**
 * Group timezones by region
 */
export function getTimezonesByRegion(date: Date = new Date()): Record<string, TimezoneOption[]> {
  const all = getAllTimezones(date)
  const grouped: Record<string, TimezoneOption[]> = {}

  all.forEach((item) => {
    if (!grouped[item.region]) {
      grouped[item.region] = []
    }
    grouped[item.region].push(item)
  })

  return grouped
}
