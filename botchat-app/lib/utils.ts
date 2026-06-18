import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const settingsFieldMap: Record<string, string> = {
  brandName: 'brand_name',
  whiteLabelDomain: 'white_label_domain',
  timezone: 'timezone',
  locale: 'locale',
  twoFactorAuth: 'two_factor_auth',
  emailVerification: 'email_verification',
  smsVerification: 'sms_verification',
  rtlEnabled: 'rtl_setting',
  landingPageEnabled: 'landing_page_status',
  registerEnabled: 'register_setting',
  defaultLanguage: 'default_language',
  defaultTimezone: 'default_timezone',
  dateFormat: 'date_format',
  timeFormat: 'time_format',
  logo: 'app_logo',
  favicon: 'favicon_logo',
  gtag: 'gtag',
  databasePermission: 'database_permission',
  roles: 'roles',
  appName: 'app_name',
}

const themeFieldMap: Record<string, string> = {
  primaryColor: 'color',
  sidebarTransparent: 'transparent_layout',
  darkLayout: 'dark_mode',
}

export function mapSettingsToApi(payload: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}

  for (const [key, value] of Object.entries(payload)) {
    if (key === 'theme' && typeof value === 'object' && value !== null) {
      for (const [tk, tv] of Object.entries(value)) {
        const mapped = themeFieldMap[tk] || tk
        result[mapped] = tv
      }
    } else {
      const mapped = settingsFieldMap[key] || key
      result[mapped] = value
    }
  }

  return result
}
