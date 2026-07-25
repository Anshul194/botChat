'use client'

import React, { useState, useMemo } from 'react'
import { Check, Search, Globe } from 'lucide-react'
import { getAllTimezones, getTimezonesByRegion, TimezoneOption } from '@/lib/timezones'

interface TimezoneSelectProps {
  value: string
  onChange: (tz: string) => void
  className?: string
  placeholder?: string
}

export function TimezoneSelect({ value, onChange, className = '', placeholder = 'Search timezone...' }: TimezoneSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const allOptions = useMemo(() => getAllTimezones(), [])

  const selectedOption = useMemo(() => {
    return allOptions.find((opt) => opt.value === value) || {
      value: value || 'UTC',
      label: `${value || 'UTC'} (${getGmtOffsetFallback(value || 'UTC')})`,
      region: 'Global',
      city: value || 'UTC',
      offset: getGmtOffsetFallback(value || 'UTC'),
      offsetMinutes: 0
    }
  }, [allOptions, value])

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return allOptions
    const s = search.toLowerCase()
    return allOptions.filter((opt) =>
      opt.value.toLowerCase().includes(s) ||
      opt.label.toLowerCase().includes(s) ||
      opt.region.toLowerCase().includes(s) ||
      opt.city.toLowerCase().includes(s)
    )
  }, [allOptions, search])

  const groupedFiltered = useMemo(() => {
    const grouped: Record<string, TimezoneOption[]> = {}
    filteredOptions.forEach((opt) => {
      if (!grouped[opt.region]) grouped[opt.region] = []
      grouped[opt.region].push(opt)
    })
    return grouped
  }, [filteredOptions])

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 font-medium flex justify-between items-center cursor-pointer select-none"
        style={{
          background: 'var(--glass-bg)',
          border: `1px solid ${isOpen ? 'var(--brand-purple, #10b981)' : 'var(--glass-border)'}`,
          color: 'var(--foreground)',
          boxShadow: isOpen ? '0 0 0 3px rgba(16,185,129,0.12)' : 'none',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 truncate">
          <Globe className="w-4 h-4 shrink-0 text-muted-foreground opacity-70" />
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <span
          style={{
            fontSize: 10,
            opacity: 0.5,
            marginLeft: 8,
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSearch(''); }} />
          <div
            className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              borderColor: 'var(--glass-border)',
              background: 'var(--card-bg, #121827)',
              border: '1px solid var(--glass-border)',
              maxHeight: '360px',
              top: '100%',
              left: 0,
            }}
          >
            <div className="p-2 flex-shrink-0 border-b border-[var(--glass-border)]">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-muted-foreground opacity-60" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm outline-none rounded-lg"
                  style={{
                    background: 'var(--glass-bg)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--glass-border)',
                  }}
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-1.5 space-y-3 max-h-[300px]">
              {Object.keys(groupedFiltered).length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-muted-foreground">No timezones found</div>
              ) : (
                Object.entries(groupedFiltered).map(([region, items]) => (
                  <div key={region} className="space-y-1">
                    <div className="px-2 pt-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground opacity-60">
                      {region}
                    </div>
                    {items.map((opt) => {
                      const isSelected = value === opt.value
                      return (
                        <div
                          key={opt.value}
                          className="px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                          style={{
                            color: isSelected ? 'var(--brand-purple, #10b981)' : 'var(--foreground)',
                            background: isSelected ? 'rgba(16,185,129,0.12)' : 'transparent',
                          }}
                          onClick={() => {
                            onChange(opt.value)
                            setIsOpen(false)
                            setSearch('')
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)'
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold truncate">{opt.value}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[11px] font-mono opacity-60">{opt.offset}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function getGmtOffsetFallback(tz: string): string {
  try {
    const d = new Date()
    const str = d.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
    const match = str.match(/GMT[+-]\d{1,2}(?::\d{2})?/)
    return match ? match[0] : 'GMT+00:00'
  } catch {
    return 'GMT+00:00'
  }
}
