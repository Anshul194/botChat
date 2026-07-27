'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Globe } from 'lucide-react'
import { useAppSettings } from '@/lib/useAppSettings'
import dayjs from 'dayjs'

export function HeaderClock() {
  const { timezone, dateFormat, timeFormat, gmtOffset } = useAppSettings()
  const [now, setNow] = useState<dayjs.Dayjs | null>(null)

  useEffect(() => {
    // Initial set
    setNow(dayjs().tz(timezone))

    const timer = setInterval(() => {
      setNow(dayjs().tz(timezone))
    }, 1000)

    return () => clearInterval(timer)
  }, [timezone])

  if (!now) return null

  const dayOfWeek = now.format('dddd')
  const dateStr = now.format(dateFormat.replace('MMM DD, YYYY', 'MMM DD, YYYY'))
  const timeStr = now.format(timeFormat.includes('hh') || timeFormat.includes('g') ? 'hh:mm:ss A' : 'HH:mm:ss')

  return (
    <div
      className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
      style={{
        background: 'var(--topbar-item-bg)',
        border: '1px solid var(--topbar-item-border)',
        color: 'var(--foreground)',
      }}
      title={`Live Clock (${timezone} ${gmtOffset})`}
    >
      <div className="flex items-center gap-1.5 text-emerald-500">
        <Clock className="w-3.5 h-3.5 animate-pulse" />
        <span className="font-mono font-bold tracking-tight text-[12px]">{timeStr}</span>
      </div>

      <div className="w-px h-3 bg-muted-foreground/20" />

      <div className="flex items-center gap-1.5 opacity-80 text-[11px]">
        <span className="font-semibold">{dayOfWeek},</span>
        <span>{dateStr}</span>
      </div>

      <div className="w-px h-3 bg-muted-foreground/20" />

      <div className="flex items-center gap-1 opacity-70 text-[10px] font-mono">
        <Globe className="w-3 h-3 text-purple-400" />
        <span className="font-semibold truncate max-w-[110px]">{timezone}</span>
        <span className="text-[9px] px-1 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">{gmtOffset}</span>
      </div>
    </div>
  )
}
