'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Calendar, Clock, Globe, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { useAppSettings } from '@/lib/useAppSettings'
import dayjs from 'dayjs'

interface SchedulePickerProps {
  value?: string // Can be UTC string or ISO string
  onChange: (utcIsoString: string, localFormatted: string, isValid: boolean) => void
  showUtcPreview?: boolean
  className?: string
  label?: string
}

export function SchedulePicker({
  value,
  onChange,
  showUtcPreview = true,
  className = '',
  label = 'Schedule Execution Time',
}: SchedulePickerProps) {
  const { timezone, gmtOffset } = useAppSettings()

  // Initialize local date & time strings in effective timezone
  const [dateStr, setDateStr] = useState<string>('')
  const [timeStr, setTimeStr] = useState<string>('')

  useEffect(() => {
    if (value) {
      // Parse existing value in effective timezone
      const d = dayjs.utc(value).tz(timezone)
      if (d.isValid()) {
        setDateStr(d.format('YYYY-MM-DD'))
        setTimeStr(d.format('HH:mm'))
        return
      }
    }

    // Default to tomorrow 09:00 AM in effective timezone if no value provided
    const defaultLocal = dayjs().tz(timezone).add(1, 'day').hour(9).minute(0).second(0)
    setDateStr(defaultLocal.format('YYYY-MM-DD'))
    setTimeStr(defaultLocal.format('HH:mm'))
  }, [value, timezone])

  // Compute local DayJS object & UTC ISO string
  const selectedLocalDayjs = useMemo(() => {
    if (!dateStr || !timeStr) return null
    return dayjs.tz(`${dateStr} ${timeStr}`, timezone)
  }, [dateStr, timeStr, timezone])

  const utcIsoString = useMemo(() => {
    if (!selectedLocalDayjs || !selectedLocalDayjs.isValid()) return ''
    return selectedLocalDayjs.utc().format('YYYY-MM-DD HH:mm:ss')
  }, [selectedLocalDayjs])

  // Current time in effective timezone for validation
  const nowInTz = useMemo(() => dayjs().tz(timezone), [timezone])

  // Past date validation
  const isPast = useMemo(() => {
    if (!selectedLocalDayjs) return false
    return selectedLocalDayjs.isBefore(nowInTz)
  }, [selectedLocalDayjs, nowInTz])

  // Helper text: "Executes in X hours Y minutes"
  const executionCountdownText = useMemo(() => {
    if (!selectedLocalDayjs || !selectedLocalDayjs.isValid() || isPast) return ''

    const diffMinutes = selectedLocalDayjs.diff(nowInTz, 'minute')
    if (diffMinutes < 1) return 'Executes in less than a minute'

    const days = Math.floor(diffMinutes / (24 * 60))
    const hours = Math.floor((diffMinutes % (24 * 60)) / 60)
    const mins = diffMinutes % 60

    const parts = []
    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`)
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`)
    if (mins > 0) parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`)

    return `Executes in ${parts.join(' ')}`
  }, [selectedLocalDayjs, nowInTz, isPast])

  // Notify parent on change
  useEffect(() => {
    if (selectedLocalDayjs && selectedLocalDayjs.isValid()) {
      const localFormatted = selectedLocalDayjs.format('YYYY-MM-DD HH:mm:ss')
      onChange(utcIsoString, localFormatted, !isPast)
    }
  }, [utcIsoString, isPast])

  const minDateStr = nowInTz.format('YYYY-MM-DD')

  return (
    <div className={`space-y-3.5 p-4 sm:p-5 rounded-2xl border bg-[var(--card)] transition-all ${className}`} style={{ borderColor: 'var(--glass-border)' }}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--primary)]" />
          {label}
        </label>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[var(--muted)] text-[var(--muted-foreground)]">
          <Globe className="w-3 h-3 text-purple-400" />
          <span>{timezone}</span>
          <span className="opacity-60">({gmtOffset})</span>
        </div>
      </div>

      {/* Date & Time Picker inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[var(--muted-foreground)] flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date
          </span>
          <input
            type="date"
            min={minDateStr}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-medium outline-none focus:border-[var(--primary)] transition-all"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[var(--muted-foreground)] flex items-center gap-1">
            <Clock className="w-3 h-3" /> Time
          </span>
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-medium outline-none focus:border-[var(--primary)] transition-all"
          />
        </div>
      </div>

      {/* Validation & Helper Text */}
      {isPast ? (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Selected time is in the past for timezone ({timezone}). Please choose a future time.</span>
        </div>
      ) : executionCountdownText ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{executionCountdownText}</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">{selectedLocalDayjs?.format('ddd, MMM D, YYYY h:mm A')}</span>
        </div>
      ) : null}

      {/* UTC Preview for debugging/support */}
      {showUtcPreview && utcIsoString && !isPast && (
        <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-1 border-t border-[var(--border)]/50">
          <span className="flex items-center gap-1 opacity-70">
            <Info className="w-3 h-3" /> UTC Server Timestamp:
          </span>
          <span className="font-mono font-semibold text-[var(--foreground)] opacity-90">{utcIsoString} UTC</span>
        </div>
      )}
    </div>
  )
}
