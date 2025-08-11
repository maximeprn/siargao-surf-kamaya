"use client"

import { useEffect, useRef, useState } from 'react'
import type { MarineWeatherData } from '@/lib/marine-weather'
// no directional labels needed here; we render arrows only

function dayLabel(dateStr: string, index: number): string {
  const d = new Date(dateStr)
  const today = new Date()
  const dayDiff = Math.floor(
    (+new Date(d.toDateString()) - +new Date(today.toDateString())) / 86400000
  )
  if (index === 0 && dayDiff === 0) return 'Today'
  if (index === 0 && dayDiff === 1) return 'Tomorrow'
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  })
}

function DirArrow({ deg }: { deg: number }) {
  // Inputs are FROM-bearings (0°=N). We render arrows pointing TO (add 180°).
  const toBearing = (deg + 180) % 360
  return (
    <svg
      width="14"
      height="14"
      className="text-theme-primary opacity-90"
      style={{ transform: `rotate(${toBearing}deg)` }}
    >
      <path d="M7 1 L12 13 L7 10 L2 13 Z" fill="currentColor" />
    </svg>
  )
}

// simple clamp util used by other helpers
// (no-op for now) reserved utility removed to avoid linter warning

// Energy in kJ as used elsewhere: E_kJ = 50 * H^2 * T
function energyKJ(h: number, p: number) {
  return Math.round(50 * (h ?? 0) * (h ?? 0) * (p ?? 0))
}

function MiniGaugeVertical({ colors, total = 5, label }: { colors: string[]; total?: number; label?: string }) {
  return (
    <div className="flex flex-col-reverse gap-[2px] items-center" title={label} aria-label={label}>
      {Array.from({ length: total }).map((_, i) => {
        const colorClass = colors[i] ?? 'bg-white/16'
        return <div key={i} className={`w-[3px] h-[4px] rounded-sm ${colorClass}`} />
      })}
    </div>
  )
}

function segmentsFromKJ(kj: number): string[] | 'black' {
  if (kj >= 4000) return 'black'
  if (kj < 100) return ['bg-red-500']
  if (kj < 200) return ['bg-red-500', 'bg-orange-400']
  if (kj < 500) return ['bg-red-500', 'bg-orange-400', 'bg-yellow-300']
  if (kj < 1000) return ['bg-red-500', 'bg-orange-400', 'bg-yellow-300', 'bg-green-400']
  return ['bg-red-500', 'bg-orange-400', 'bg-yellow-300', 'bg-green-400', 'bg-green-500']
}

// kept for legacy reference (not used after switching to text quality cell)
// function MiniQualityGauge(...) removed after switching to text rating

// Softer mapping so typical 50–80 kJ does not collapse to all-POOR
function qualityLevelFromKJ(kj: number): number {
  if (kj >= 520) return 6 // excellent-ish
  if (kj >= 360) return 5
  if (kj >= 240) return 4
  if (kj >= 160) return 3
  if (kj >= 100) return 2
  if (kj >= 60)  return 1
  return 0
}

function qualityLabelFromLevel(level:number): {label:string;color:string}{
  // 0..6 mapping from poor (red) to excellent (green)
  const map = [
    {label:'POOR', color:'text-red-400'},
    {label:'POOR-FAIR', color:'text-orange-400'},
    {label:'FAIR', color:'text-yellow-300'},
    {label:'FAIR-GOOD', color:'text-lime-300'},
    {label:'GOOD', color:'text-green-400'},
    {label:'VERY GOOD', color:'text-green-500'},
    {label:'EXCELLENT', color:'text-emerald-500'},
  ]
  return map[Math.max(0, Math.min(level, map.length-1))]
}

function QualityCell({h,p}:{h:number;p:number}){
  const level = qualityLevelFromKJ(energyKJ(h,p))
  const q = qualityLabelFromLevel(level)
  return <div className={`text-xs font-medium ${q.color}`}>{q.label}</div>
}

// dot mapping removed (we reverted to segmented mini-gauge)

// legacy helper removed (replaced by kJ segment mapping)

export default function SevenDayPrimarySwell({ weather }: { weather: MarineWeatherData | null }) {
  // Use safe fallbacks so hooks are not called conditionally
  const time: string[] = weather?.hourly.time ?? []
  const swell_wave_height: number[] = weather?.hourly.swell_wave_height ?? []
  const swell_wave_period: number[] = weather?.hourly.swell_wave_period ?? []
  const swell_wave_direction: number[] = weather?.hourly.swell_wave_direction ?? []
  const wave_height: number[] = weather?.hourly.wave_height ?? []
  const wTime: string[] = weather?.weather.hourly.time ?? []
  const windspeed_10m: number[] = weather?.weather.hourly.windspeed_10m ?? []
  const winddirection_10m: number[] = weather?.weather.hourly.winddirection_10m ?? []

  // Keep only 06:00, 12:00, 18:00 entries per day
  const wanted = new Set(['06:00', '12:00', '18:00'])
  const byDay = new Map<string, { t: '6am' | 'Noon' | '6pm'; h: number; p: number; d: number; ws: number; wd: number; surf: number }[]>()

  // Map wind by timestamp to ensure alignment with marine hourly
  const windByIso: Record<string, { ws: number; wd: number }> = {}
  for (let j = 0; j < wTime.length; j++) {
    windByIso[wTime[j]] = { ws: windspeed_10m[j], wd: winddirection_10m[j] }
  }

  for (let i = 0; i < time.length; i++) {
    const dt = new Date(time[i])
    const hhmm = dt.toTimeString().slice(0, 5)
    if (!wanted.has(hhmm)) continue

    const dayKey = dt.toISOString().slice(0, 10)
    const label: '6am' | 'Noon' | '6pm' = hhmm === '06:00' ? '6am' : hhmm === '12:00' ? 'Noon' : '6pm'
    const arr = byDay.get(dayKey) || []
    const wind = windByIso[time[i]] || { ws: 0, wd: 0 }
    arr.push({
      t: label,
      h: swell_wave_height[i],
      p: swell_wave_period[i],
      d: swell_wave_direction[i],
      ws: wind.ws,
      wd: wind.wd,
      surf: wave_height[i] ?? 0,
    })
    byDay.set(dayKey, arr)
  }

  const days = Array.from(byDay.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(0, 7)
    .map(([day, rows]) => {
      const order = { '6am': 0, Noon: 1, '6pm': 2 } as const
      return [day, rows.sort((a, b) => order[a.t] - order[b.t])] as const
    })

  const [mode, setMode] = useState<'today' | '7'>('7')
  const [windUnit, setWindUnit] = useState<'kmh' | 'ms' | 'kn'>('kmh')
  const [heightUnit, setHeightUnit] = useState<'m' | 'ft'>('m')
  const [unitsOpen, setUnitsOpen] = useState(false)
  const unitsBtnRef = useRef<HTMLButtonElement|null>(null)
  const unitsPanelRef = useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    const onClick = (e: MouseEvent)=>{
      const t = e.target as Node
      if (!unitsPanelRef.current || !unitsBtnRef.current) return
      if (!unitsPanelRef.current.contains(t) && !unitsBtnRef.current.contains(t)) setUnitsOpen(false)
    }
    const onKey = (e: KeyboardEvent)=>{ if (e.key === 'Escape') setUnitsOpen(false) }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return ()=>{ document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey) }
  },[])

  // We no longer need per-day expanded state in the simplified 7-day view (always expanded)

  if (days.length === 0) return null

  const colsDays = 'grid grid-cols-[180px_1fr_1fr_1fr_1fr_1fr] items-center gap-6 text-center'
  const colsToday = 'grid grid-cols-[72px_1fr_1fr_1fr_1fr_1fr] items-center gap-6 text-center'

  const formatHeight = (meters:number)=> heightUnit === 'm' 
    ? `${meters.toFixed(1)} m` 
    : `${(meters*3.28084).toFixed(1)} ft`

  const formatWind = (kmh:number)=> {
    if (windUnit === 'kmh') return `${Math.round(kmh)} km/h`
    if (windUnit === 'ms') return `${Math.round(kmh/3.6)} m/s`
    return `${Math.round(kmh*0.539957)} kn`
  }

  // Build today's rows (00:00 → 21:00 every 3 hours)
  const todayWanted = new Set(['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00'])
  type Row = { t: string; h: number; p: number; d: number; ws: number; wd: number; surf: number }
  const todayRows: Row[] = []
  const todayDateStr = new Date().toDateString()
  for (let i = 0; i < time.length; i++) {
    const dt = new Date(time[i])
    const hhmm = dt.toTimeString().slice(0, 5)
    if (dt.toDateString() !== todayDateStr) continue
    if (!todayWanted.has(hhmm)) continue
    const label = hhmm === '00:00' ? '12am'
      : hhmm === '03:00' ? '3am'
      : hhmm === '06:00' ? '6am'
      : hhmm === '09:00' ? '9am'
      : hhmm === '12:00' ? 'Noon'
      : hhmm === '15:00' ? '3pm'
      : hhmm === '18:00' ? '6pm' : '9pm'
    const wind = windByIso[time[i]] || { ws: 0, wd: 0 }
    todayRows.push({ t: label, h: swell_wave_height[i], p: swell_wave_period[i], d: swell_wave_direction[i], ws: wind.ws, wd: wind.wd, surf: wave_height[i] ?? 0 })
  }
  // Sort today rows by time label order
  const orderToday: Record<string, number> = { '12am': 0, '3am': 1, '6am': 2, '9am': 3, 'Noon': 4, '3pm': 5, '6pm': 6, '9pm': 7 }
  todayRows.sort((a,b)=> orderToday[a.t]-orderToday[b.t])

  // For rating colors we now use absolute energy thresholds (no normalization)

  return (
    <div>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="eyebrow">Primary swell</div>
          <div className="text-theme-muted text-xs flex items-center gap-2">
            <button onClick={()=>setMode('today')} className={`${mode==='today'?'text-theme-primary font-medium':'hover:text-theme-primary'} transition-colors`}>Today</button>
            <span className="opacity-40">/</span>
            <button onClick={()=>setMode('7')} className={`${mode==='7'?'text-theme-primary font-medium':'hover:text-theme-primary'} transition-colors`}>7 days</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button ref={unitsBtnRef} onClick={()=>setUnitsOpen(v=>!v)} aria-haspopup="true" aria-expanded={unitsOpen} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="Units">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-theme-primary">
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 4l-2.1-.7a7.9 7.9 0 00-.7-1.7l1.2-1.9-1.4-1.4-1.9 1.2c-.5-.3-1.1-.6-1.7-.7L12 2l-1.4.3-.6 2.2c-.6.1-1.2.4-1.7.7L6.4 4.8 5 6.2l1.2 1.9c-.3.5-.6 1.1-.7 1.7L3 12l.5 1.4 2.2.6c.1.6.4 1.2.7 1.7L5 17.6l1.4 1.4 1.9-1.2c.5.3 1.1.6 1.7.7l.6 2.2L12 22l1.4-.3.6-2.2c.6-.1 1.2-.4 1.7-.7l1.9 1.2 1.4-1.4-1.2-1.9c.3-.5.6-1.1.7-1.7l2.2-.6L21 12z"/>
            </svg>
          </button>
          {unitsOpen && (
            <div ref={unitsPanelRef} className="absolute right-0 top-full mt-2 z-40 bg-white/5 ring-1 ring-white/10 rounded-md px-3 py-2 backdrop-blur-sm">
              <div className="text-[11px] uppercase text-theme-muted mb-2">Units</div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-theme-muted">Height</span>
                  <div className="flex overflow-hidden rounded ring-1 ring-white/10">
                    <button onClick={()=>setHeightUnit('m')} className={`px-2 py-1 text-xs ${heightUnit==='m'?'bg-white/10 text-theme-primary':'hover:bg-white/10'}`}>m</button>
                    <button onClick={()=>setHeightUnit('ft')} className={`px-2 py-1 text-xs ${heightUnit==='ft'?'bg-white/10 text-theme-primary':'hover:bg-white/10'}`}>ft</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-theme-muted">Wind</span>
                  <div className="flex overflow-hidden rounded ring-1 ring-white/10">
                    <button onClick={()=>setWindUnit('kmh')} className={`px-2 py-1 text-xs ${windUnit==='kmh'?'bg-white/10 text-theme-primary':'hover:bg-white/10'}`}>km/h</button>
                    <button onClick={()=>setWindUnit('ms')} className={`px-2 py-1 text-xs ${windUnit==='ms'?'bg-white/10 text-theme-primary':'hover:bg-white/10'}`}>m/s</button>
                    <button onClick={()=>setWindUnit('kn')} className={`px-2 py-1 text-xs ${windUnit==='kn'?'bg-white/10 text-theme-primary':'hover:bg-white/10'}`}>kn</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="rule mt-4" />
      <div className="mt-6">
        {mode === 'today' ? (
          <div className="space-y-2">
            <div className={`${colsToday} py-1 hidden sm:grid`}>
              <div className="text-theme-muted text-[11px] uppercase tracking-wider">Time</div>
              <div className="text-theme-muted text-[11px] uppercase tracking-wider">Surf</div>
              <div className="text-theme-muted text-[11px] uppercase tracking-wider">Swell</div>
              <div className="text-theme-muted text-[11px] uppercase tracking-wider">Wind</div>
              <div className="text-theme-muted text-[11px] uppercase tracking-wider">Quality</div>
              <div className="text-theme-muted text-[11px] uppercase tracking-wider">Energy</div>
            </div>
            <div className="rule" />
            {todayRows.map((r, idx)=> (
              <div key={r.t}>
                {/* Mobile card-like row */}
                <div className="sm:hidden py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <div className="text-theme-muted text-[10px] uppercase tracking-wider">{r.t}</div>
                      <div className="text-theme-primary text-base font-semibold">{Number.isFinite((r as unknown as {surf:number}).surf) ? (r as unknown as {surf:number}).surf.toFixed(1) : '—'} m</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-theme-primary font-medium">{formatHeight(r.h)}</span>
                        <span className="text-theme-primary font-medium">{r.p?.toFixed(0)} s</span>
                        <DirArrow deg={r.d} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-theme-primary">
                        <span>{formatWind(Math.round(r.ws))}</span>
                        <DirArrow deg={r.wd} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px]"><QualityCell h={r.h} p={r.p} /></div>
                </div>

                {/* Desktop grid row */}
                <div className={`${colsToday} py-2 items-center hidden sm:grid`}>
                  <div className="text-theme-muted text-xs">{r.t}</div>
                  <div className="flex items-center justify-center"><div className="text-theme-primary text-sm font-medium">{Number.isFinite((r as unknown as {surf:number}).surf) ? (r as unknown as {surf:number}).surf.toFixed(1) : '—'} m</div></div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-theme-primary text-sm font-medium">{formatHeight(r.h)}</div>
                    <div className="text-theme-primary text-sm font-medium">{r.p?.toFixed(0)} s</div>
                    <DirArrow deg={r.d} />
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-theme-primary text-sm">
                    <span className="text-theme-primary">{formatWind(Math.round(r.ws))}</span>
                    <DirArrow deg={r.wd} />
                  </div>
                  <QualityCell h={r.h} p={r.p} />
                  <div className="flex items-center justify-center space-x-3 text-theme-muted text-sm">
                    {(() => {
                      const kj = energyKJ(r.h, r.p)
                      const seg = segmentsFromKJ(kj)
                      return (
                        <>
                          <span className="text-theme-primary font-medium">{kj} kJ</span>
                          {seg === 'black' ? (
                            <div className="w-[4px] h-[28px] bg-black rounded-sm" title={`${kj} kJ`} />
                          ) : (
                            <MiniGaugeVertical colors={seg} label={`${kj} kJ`} />
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div className="rule sm:hidden" />
                {idx < todayRows.length - 1 && <div className="rule hidden sm:block" />}
              </div>
            ))}
          </div>
        ) : (
        days.map(([day, rows], dayIdx) => {
          return (
            <div key={day} className="py-3">
              {/* Day header row (static for 7 days) */}
              <div className={`${colsDays} w-full text-left px-0 py-2`}>
                <div className="text-theme-primary text-xs uppercase tracking-wider truncate font-medium">
                  {dayLabel(day, dayIdx)}
                </div>
                <div />
                <div />
                <div />
              </div>

              {/* Separator line below header */}
              <div className="rule mt-2" />

              {/* Detail rows (animated height) */}
              <div className={`mt-2`}>
                  {/* Column labels */}
                  <div className={`${colsDays} py-1`}>
                    <div className="text-theme-muted text-[11px] uppercase tracking-wider">Time</div>
                    <div className="text-theme-muted text-[11px] uppercase tracking-wider">Surf</div>
                    <div className="text-theme-muted text-[11px] uppercase tracking-wider">Swell</div>
                    <div className="text-theme-muted text-[11px] uppercase tracking-wider">Wind</div>
                    <div className="text-theme-muted text-[11px] uppercase tracking-wider">Quality</div>
                    <div className="text-theme-muted text-[11px] uppercase tracking-wider">Energy</div>
                  </div>
                  <div className="rule" />
                  {rows.map((r, idx) => (
                    <div key={r.t}>
                      <div className={`${colsDays} py-2 items-center`}>
                        <div className="text-theme-muted text-xs">{r.t}</div>
                        <div className="flex items-center justify-center"><div className="text-theme-primary text-sm font-medium">{Number.isFinite((r as unknown as {surf:number}).surf) ? (r as unknown as {surf:number}).surf.toFixed(1) : '—'} m</div></div>
                        <div className="flex items-center justify-center space-x-4">
                          <div className="text-theme-primary text-sm font-medium">{formatHeight(r.h)}</div>
                          <div className="text-theme-primary text-sm font-medium">{r.p?.toFixed(0)} s</div>
                          <DirArrow deg={r.d} />
                        </div>
                        <div className="flex items-center justify-center space-x-4 text-theme-primary text-sm">
                          <span className="text-theme-primary">{formatWind(Math.round(r.ws))}</span>
                          <DirArrow deg={r.wd} />
                        </div>
                        <QualityCell h={r.h} p={r.p} />
                        <div className="flex items-center justify-center space-x-3 text-theme-muted text-sm">
                          {(() => {
                            const kj = energyKJ(r.h, r.p)
                            const seg = segmentsFromKJ(kj)
                            return (
                              <>
                                <span className="text-theme-primary font-medium">{kj} kJ</span>
                                {seg === 'black' ? (
                                  <div className="w-[4px] h-[28px] bg-black rounded-sm" title={`${kj} kJ`} />
                                ) : (
                                  <MiniGaugeVertical colors={seg} label={`${kj} kJ`} />
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                      {idx < rows.length - 1 && <div className="rule" />}
                    </div>
                  ))}
              </div>
            </div>
          )
        }))}
      </div>
    </div>
  )
}


