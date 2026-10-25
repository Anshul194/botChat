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

    const brand = settings.appName || 'MegaDM'

    if (brand) {
      // Dynamic Title: preserve page part, replace suffix
      const currentTitle = document.title
      if (!currentTitle || currentTitle === 'MegaDM' || currentTitle === 'My Application' || currentTitle === 'Laravel') {
        document.title = brand
      } else if (currentTitle.includes(' | ')) {
        const parts = currentTitle.split(' | ')
        const pagePart = parts.slice(0, -1).join(' | ').trim()
        document.title = `${pagePart} | ${brand}`
      } else if (currentTitle.includes(' — ')) {
        const parts = currentTitle.split(' — ')
        const pagePart = parts.slice(0, -1).join(' — ').trim()
        document.title = `${pagePart} — ${brand}`
      }

      const ogSiteName = document.querySelector('meta[property="og:site_name"]')
      if (ogSiteName) {
        ogSiteName.setAttribute('content', brand)
      } else {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:site_name')
        meta.setAttribute('content', brand)
        document.head.appendChild(meta)
      }

      const twitterSite = document.querySelector('meta[name="application-name"]')
      if (twitterSite) twitterSite.setAttribute('content', brand)
      
      // Update JSON-LD structured data if it exists
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      scripts.forEach((script) => {
        try {
          const json = JSON.parse(script.innerHTML)
          if (json['@type'] === 'Organization' || json['@type'] === 'SoftwareApplication') {
            json.name = brand
            if (settings.logo || settings.darkLogo) json.logo = settings.logo || settings.darkLogo
            script.innerHTML = JSON.stringify(json)
          }
        } catch (e) {}
      })
    }
  }, [settings.favicon, settings.appName, settings.logo, settings.darkLogo])

  return null
}
