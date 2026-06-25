'use client'

import { useEffect } from 'react'
import { useTenantSettings } from '@/providers/TenantSettingsProvider'

export default function DynamicBranding() {
  const { settings } = useTenantSettings()

  useEffect(() => {
    if (settings.favicon) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        link.sizes = 'any'
        document.head.appendChild(link)
      }
      link.href = settings.favicon
    }

    if (settings.appName && settings.appName !== 'BotChat') {
      document.title = settings.appName
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) ogTitle.setAttribute('content', settings.appName)
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')
      if (twitterTitle) twitterTitle.setAttribute('content', settings.appName)
    }
  }, [settings.favicon, settings.appName])

  return null
}
