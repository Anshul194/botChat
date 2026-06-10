"use client"

import { useEffect } from "react"

interface PageMetaProps {
  title: string
  description: string
  noindex?: boolean
}

export default function PageMeta({ title, description, noindex }: PageMetaProps) {
  useEffect(() => {
    document.title = title

    let descEl = document.querySelector('meta[name="description"]')
    if (!descEl) {
      descEl = document.createElement("meta")
      descEl.setAttribute("name", "description")
      document.head.appendChild(descEl)
    }
    descEl.setAttribute("content", description)

    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement("meta")
      ogTitle.setAttribute("property", "og:title")
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute("content", title)

    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (!ogDesc) {
      ogDesc = document.createElement("meta")
      ogDesc.setAttribute("property", "og:description")
      document.head.appendChild(ogDesc)
    }
    ogDesc.setAttribute("content", description)

    let robotsEl = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robotsEl) {
        robotsEl = document.createElement("meta")
        robotsEl.setAttribute("name", "robots")
        document.head.appendChild(robotsEl)
      }
      robotsEl.setAttribute("content", "noindex, nofollow")
    } else {
      if (robotsEl) {
        robotsEl.remove()
      }
    }
  }, [title, description, noindex])

  return null
}
