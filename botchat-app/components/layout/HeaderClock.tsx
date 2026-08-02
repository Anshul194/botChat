'use client'

import React, { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useAppSettings } from '@/lib/useAppSettings'
import dayjs from 'dayjs'

export function HeaderClock() {
  const { timezone, dateFormat, timeFormat, gmtOffset } = useAppSettings()
  const [now, setNow] = useState<dayjs.Dayjs | null>(null)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setNow(dayjs().tz(timezone))
      setBlink(true)
    }, 0)
    const timer = setInterval(() => {
      setNow(dayjs().tz(timezone))
      setBlink(b => !b)
    }, 1000)

    return () => { clearTimeout(t); clearInterval(timer) }
  }, [timezone])

  if (!now) return null

  const dayOfWeek = now.format('ddd')
  const dateStr = now.format(dateFormat.replace('MMM DD, YYYY', 'MMM DD'))
  const timeFormatString = timeFormat.includes('hh') || timeFormat.includes('g') ? 'hh:mm' : 'HH:mm'
  const timeStr = now.format(timeFormatString)
  const secStr = now.format('ss')
  const meridiem = timeFormat.includes('hh') || timeFormat.includes('g') ? now.format('A') : ''

  return (
    <div
      className="hidden xl:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 group"
      style={{
        background: 'var(--topbar-item-bg)',
        border: '1px solid var(--topbar-item-border)',
        color: 'var(--foreground)',
      }}
      title={`Live Clock (${timezone} ${gmtOffset})`}
    >
      {/* Live pulse + time */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
        </span>
        <span className="font-mono font-bold tracking-tight text-[12px] tabular-nums">
          {timeStr}
          <span style={{ opacity: blink ? 1 : 0.25 }} className="transition-opacity duration-200">:</span>
          {secStr}
        </span>
        {meridiem && <span className="text-[9px] font-black opacity-70">{meridiem}</span>}
      </div>

      <div className="w-px h-3 bg-muted-foreground/20" />

      {/* Date */}
      <div className="flex items-center gap-1 opacity-80 text-[11px] whitespace-nowrap">
        <span className="font-bold">{dayOfWeek}</span>
        <span>{dateStr}</span>
      </div>

      <div className="w-px h-3 bg-muted-foreground/20" />

      {/* Timezone badge */}
      <div className="flex items-center gap-1 opacity-80 text-[10px]">
        <Globe className="w-3 h-3 text-purple-400" />
        <span className="font-mono font-semibold text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400">{gmtOffset}</span>
      </div>
    </div>
  )
}
