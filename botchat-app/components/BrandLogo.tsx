'use client'

import React, { useState, useEffect } from 'react'
import { useTenantSettings } from '@/providers/TenantSettingsProvider'
import { useTheme } from '@/components/ThemeProvider'

export interface BrandLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  variant?: 'light' | 'dark' | 'auto'
  forceMegaDMDefault?: boolean
}

export function BrandLogo({
  variant = 'auto',
  forceMegaDMDefault = false,
  className = 'h-10 w-auto object-contain',
  alt,
  ...rest
}: BrandLogoProps) {
  const { settings } = useTenantSettings()
  let currentTheme = 'dark'
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const themeContext = useTheme()
    currentTheme = themeContext?.theme || 'dark'
  } catch (e) {
    // fallback if outside ThemeProvider
  }

  // Light surfaces need dark text/color logo; Dark surfaces need white text logo
  const isDarkSurface =
    variant === 'dark' || (variant === 'auto' && currentTheme === 'dark')

  const appName = settings.appName || 'MegaDM'

  // Guaranteed built-in brand kit assets
  const defaultAsset = isDarkSurface ? '/logo/logo-dark.svg' : '/logo/logo-light.svg'

  // Resolve custom logo according to background
  const primaryCustom = isDarkSurface
    ? (settings.darkLogo || settings.logo)
    : (settings.logo || settings.darkLogo)

  const initialSrc = (!forceMegaDMDefault && primaryCustom) ? primaryCustom : defaultAsset

  const [imgSrc, setImgSrc] = useState<string>(initialSrc)
  const [hasFailed, setHasFailed] = useState<boolean>(false)

  useEffect(() => {
    setHasFailed(false)
    const target = (!forceMegaDMDefault && primaryCustom) ? primaryCustom : defaultAsset
    setImgSrc(target)
  }, [primaryCustom, defaultAsset, forceMegaDMDefault])

  const handleError = () => {
    if (!hasFailed) {
      setHasFailed(true)
      setImgSrc(defaultAsset)
    }
  }

  return (
    <img
      src={imgSrc}
      alt={alt || appName}
      className={className}
      onError={handleError}
      {...rest}
    />
  )
}

export default BrandLogo
