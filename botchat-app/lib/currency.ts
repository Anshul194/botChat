export interface TenantCurrencyConfig {
  currency: string
  currencySymbol: string
}

const DEFAULT_CONFIG: TenantCurrencyConfig = {
  currency: 'USD',
  currencySymbol: '$',
}

let currentConfig: TenantCurrencyConfig = { ...DEFAULT_CONFIG }

export function setTenantCurrencyConfig(config: Partial<TenantCurrencyConfig>) {
  currentConfig = { ...currentConfig, ...config }
}

export function getTenantCurrencyConfig(): TenantCurrencyConfig {
  return { ...currentConfig }
}

export function formatCurrency(
  amount: number | string,
  showSymbol = true,
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${showSymbol ? currentConfig.currencySymbol : ''}0.00`

  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  if (!showSymbol) return formatted
  return `${currentConfig.currencySymbol}${formatted}`
}

export function formatAmount(
  amount: number | string,
  showSymbol = true,
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${showSymbol ? currentConfig.currencySymbol : ''}0`

  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })

  if (!showSymbol) return formatted
  return `${currentConfig.currencySymbol}${formatted}`
}

export function getCurrencySymbol(): string {
  return currentConfig.currencySymbol
}

export function getCurrencyCode(): string {
  return currentConfig.currency
}
