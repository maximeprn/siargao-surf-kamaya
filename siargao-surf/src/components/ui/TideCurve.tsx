'use client'

import { useState, useEffect } from 'react'
import { getSimpleTideData, type SimpleTideData } from '@/lib/tide-direct'

interface TideCurveProps {
  tideData?: {
    current: number
    hourly: {
      time: string[]
      sea_level_height_msl: number[]
    }
    extremes?: {
      time: string
      height: number
      type: 'High' | 'Low'
      timestamp: number
    }[]
  }
}

export default function TideCurve({ tideData }: TideCurveProps){
  const [hoverPoint, setHoverPoint] = useState<{x: number, y: number, height: number, time: string} | null>(null)
  const [simpleTideData, setSimpleTideData] = useState<SimpleTideData | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Load tide data from Supabase cache
  useEffect(() => {
    console.log('[TideCurve] Loading tide data from Supabase...')
    getSimpleTideData().then(data => {
      console.log('[TideCurve] ⭐ LOADED SIMPLE TIDE DATA ⭐')
      console.log('Current:', data?.current)
      console.log('Hourly length:', data?.hourly?.time?.length)
      console.log('Heights length:', data?.hourly?.height?.length)
      console.log('Extremes length:', data?.extremes?.length)
      console.log('First 3 hourly:', data?.hourly?.height?.slice(0, 3))
      console.log('Last 3 hourly:', data?.hourly?.height?.slice(-3))
      setSimpleTideData(data)
    }).catch(err => {
      console.error('[TideCurve] ERROR loading data:', err)
    })
  }, [])
  
  const VIEW_W = 462
  const X0 = 40
  const RIGHT = 10
  const XW = VIEW_W - X0 - RIGHT
  const Y_TOP = 40, Y_BOT = 180
  
  // Use Supabase cached data or fallback to mock data
  let H_MIN = -0.1, H_MAX = 1.8
  let tidePoints: { time: string, height: number }[] = []
  
  if (simpleTideData) {
    console.log('=== USING SUPABASE CACHED DATA ===')
    console.log('Hourly points:', simpleTideData.hourly.time.length)
    console.log('Extreme points:', simpleTideData.extremes.length)
    
    // Use ONLY hourly data for the smooth curve (24 points)
    tidePoints = simpleTideData.hourly.time.map((time, i) => ({
      time,
      height: simpleTideData.hourly.height[i]
    }))
    
    // Extremes are displayed separately as markers, not part of the curve
    
    console.log('[TideCurve] === DONNÉES SUPABASE POUR LA COURBE ===')
    console.log('24 points horaires:')
    tidePoints.forEach((point, i) => {
      console.log(`  ${i}: ${point.time} → ${point.height}m`)
    })
    
    console.log('Points d\'extrêmes (marqueurs séparés):')
    simpleTideData.extremes.forEach((extreme, i) => {
      console.log(`  ${i}: ${extreme.time} → ${extreme.height}m (${extreme.type})`)
    })
    
    // Calculate range
    const heights = tidePoints.map(p => p.height)
    H_MIN = Math.min(...heights) - 0.1
    H_MAX = Math.max(...heights) + 0.1
    
    console.log('Range de marée:', H_MIN, 'to', H_MAX)
  } else {
    console.log('Using fallback tide data - no Supabase data available')
    // Fallback mock data
    tidePoints = [
      { time: '00:00', height: 0.8 },
      { time: '03:12', height: -0.05 },
      { time: '06:00', height: 0.9 },
      { time: '09:37', height: 1.61 },
      { time: '12:00', height: 1.2 },
      { time: '15:51', height: 0.1 },
      { time: '18:00', height: 1.0 },
      { time: '22:18', height: 1.55 },
    ]
    H_MIN = -0.1
    H_MAX = 1.8
  }
  
  console.log('Final tide data:', { points: tidePoints.length, H_MIN, H_MAX })
  const minutes = (hhmm:string)=>{ const [h,m] = hhmm.split(':').map(Number); return h*60+m }
  const xFromTime = (hhmm:string)=> X0 + XW * (minutes(hhmm)/1440)
  const yFromHeight = (m:number)=> Y_BOT - (Y_BOT - Y_TOP) * ((m - H_MIN) / (H_MAX - H_MIN))
  
  const points = tidePoints.map((p, i) => ({
    x: xFromTime(p.time),
    y: yFromHeight(p.height),
    height: p.height,
    time: p.time,
    index: i
  })).sort((a,b)=>a.x-b.x)
  
  const pathThrough = (pts:{x:number;y:number}[])=>{
    if(pts.length<2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for(let i=0;i<pts.length-1;i++){
      const p0 = i>0 ? pts[i-1] : pts[i]
      const p1 = pts[i]
      const p2 = pts[i+1]
      const p3 = i!==pts.length-2 ? pts[i+2] : p2
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
    }
    return d
  }
  const d = pathThrough(points)
  
  // Get current time in Philippines timezone (GMT+8) using more robust method
  const now = new Date()
  const philippinesTimeString = now.toLocaleString('en-US', { 
    timeZone: 'Asia/Manila',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // Extract hour and minute from HH:MM format
  const [hourStr, minuteStr] = philippinesTimeString.split(':')
  const currentHour = parseInt(hourStr, 10)
  const currentMinutes = parseInt(minuteStr, 10)
  const currentTimeInMinutes = currentHour * 60 + currentMinutes
  const xNow = X0 + XW * (currentTimeInMinutes / 1440)
  
  
  // Find the exact point on the curve at current time
  const findCurrentPointOnCurve = () => {
    if (points.length === 0) return null
    
    // Find the closest point by X position (time)
    let closestPoint = points[0]
    let minDistance = Math.abs(xNow - points[0].x)
    
    for (const point of points) {
      const distance = Math.abs(xNow - point.x)
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = point
      }
    }
    
    return closestPoint
  }
  
  const currentPointOnCurve = findCurrentPointOnCurve()

  // Function to find closest point on curve
  const findClosestPoint = (mouseX: number) => {
    if (points.length === 0) return null
    
    let closestPoint = points[0]
    let minDistance = Math.abs(mouseX - points[0].x)
    
    for (const point of points) {
      const distance = Math.abs(mouseX - point.x)
      if (distance < minDistance) {
        minDistance = distance
        closestPoint = point
      }
    }
    
    return closestPoint
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * VIEW_W
    
    if (mouseX >= X0 && mouseX <= X0 + XW) {
      const closest = findClosestPoint(mouseX)
      if (closest) {
        setHoverPoint(closest)
      }
    } else {
      setHoverPoint(null)
    }
  }

  const handleMouseLeave = () => {
    setHoverPoint(null)
  }

  return (
    <svg 
      viewBox={`0 0 ${VIEW_W} 220`} 
      className="w-full h-auto" 
      preserveAspectRatio="xMinYMax meet"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <g stroke="var(--tide-axes)" strokeWidth="0.3">
        <line x1={X0} y1={Y_BOT} x2={X0+XW} y2={Y_BOT} />
        <line x1={X0} y1={Y_TOP} x2={X0} y2={Y_BOT} />
      </g>
      {[0,6,12,18,24].map((t,i)=>{
        const x = X0 + XW * (t/24)
        return (
          <g key={i} stroke="var(--tide-labels)" strokeWidth="0.3">
            <line x1={x} y1={Y_BOT-4} x2={x} y2={Y_BOT+4} />
            <text className="svg-label" x={x} y={Y_BOT+20} textAnchor="middle" fill="var(--tide-labels)">{t}h</text>
          </g>
        )
      })}
      {(() => {
        // Create 4 evenly spaced labels
        const numLabels = 4
        const labels = []
        for (let i = 0; i < numLabels; i++) {
          const value = H_MIN + (H_MAX - H_MIN) * (i / (numLabels - 1))
          labels.push(value)
        }
        return labels.map((t,i)=>{
          const y = yFromHeight(t)
          return (
            <g key={i} stroke="var(--tide-labels)" strokeWidth="0.3">
              <line x1={X0-4} y1={y} x2={X0+4} y2={y} />
              <text className="svg-label" x={X0-8} y={y+4} textAnchor="end" fill="var(--tide-labels)">{(t !== null && t !== undefined) ? t.toFixed(1) : '0.0'}m</text>
            </g>
          )
        })
      })()}
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--tide-curve)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--tide-curve)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#g)" strokeWidth="3" />
      
      {/* Extreme points markers - from Supabase cache */}
      {simpleTideData?.extremes.map((extreme, i) => {
        const x = xFromTime(extreme.time)
        const y = yFromHeight(extreme.height)
        const isHigh = extreme.type === 'High'
        
        return (
          <g key={`extreme-${i}`}>
            {/* Extreme point circle */}
            <circle 
              cx={x} 
              cy={y} 
              r="4" 
              fill={isHigh ? '#AEBDAF' : '#C8585E'}
              stroke="var(--text-primary)" 
              strokeWidth="1.5"
              strokeOpacity="0.8"
            />
            
            {/* Extreme height label */}
            <text 
              x={x} 
              y={y - 12} 
              textAnchor="middle" 
              className="svg-label" 
              fill={isHigh ? '#AEBDAF' : '#C8585E'}
              fontSize={isMobile ? "14" : "11"}
              fontWeight="600"
            >
              {extreme.height.toFixed(1)}m
            </text>
            
            {/* Time label */}
            <text 
              x={x} 
              y={y + 18} 
              textAnchor="middle" 
              className="svg-label" 
              fill="var(--text-muted)"
              fontSize={isMobile ? "12" : "9"}
            >
              {extreme.time}
            </text>
          </g>
        )
      }) || []}
      
      {/* Current tide level indicator */}
      {currentPointOnCurve && (() => {
        // Check if current height matches any extreme height to 1 decimal place
        const currentHeightRounded = currentPointOnCurve.height.toFixed(1)
        const shouldHideCurrentLabel = simpleTideData?.extremes?.some(extreme => 
          extreme.height.toFixed(1) === currentHeightRounded
        ) || false
        
        // Check for nearby extreme points to avoid label overlap
        const DISTANCE_THRESHOLD = 60 // pixels
        let labelYOffset = -18 // default offset above the point
        
        if (simpleTideData?.extremes) {
          for (const extreme of simpleTideData.extremes) {
            const extremeX = xFromTime(extreme.time)
            const extremeY = yFromHeight(extreme.height)
            
            // Calculate distance between current point and extreme point
            const distance = Math.sqrt(
              Math.pow(currentPointOnCurve.x - extremeX, 2) + 
              Math.pow(currentPointOnCurve.y - extremeY, 2)
            )
            
            // If too close to an extreme point, move current label further up
            if (distance < DISTANCE_THRESHOLD) {
              labelYOffset = -35 // Move label further up to avoid overlap
              break
            }
          }
        }
        
        return (
          <g>
            <circle 
              cx={currentPointOnCurve.x} 
              cy={currentPointOnCurve.y} 
              r="6" 
              fill="var(--tide-curve)" 
              stroke="var(--tide-labels)" 
              strokeOpacity="0.8"
              strokeWidth="2"
            />
            {/* Current height label - only show if not matching extreme height */}
            {!shouldHideCurrentLabel && (
              <text 
                x={currentPointOnCurve.x} 
                y={currentPointOnCurve.y + labelYOffset} 
                textAnchor="middle" 
                className="svg-label" 
                fill="var(--tide-curve)"
                fontSize={isMobile ? "16" : "13"}
                fontWeight="600"
              >
                {(currentPointOnCurve.height !== null && currentPointOnCurve.height !== undefined) ? currentPointOnCurve.height.toFixed(1) : '0.0'}m
              </text>
            )}
          </g>
        )
      })()}

      {/* Hover point indicator */}
      {hoverPoint && (() => {
        // Check if too close to current point
        const DISTANCE_THRESHOLD = isMobile ? 70 : 50 // pixels
        const isTooCloseToCurrent = currentPointOnCurve && 
          Math.sqrt(
            Math.pow(hoverPoint.x - currentPointOnCurve.x, 2) + 
            Math.pow(hoverPoint.y - currentPointOnCurve.y, 2)
          ) < DISTANCE_THRESHOLD
        
        // Don't show tooltip if too close to current point
        const showTooltip = !isTooCloseToCurrent
        
        return (
          <g>
            {/* Vertical line at hover point */}
            <line 
              x1={hoverPoint.x} 
              y1={Y_TOP} 
              x2={hoverPoint.x} 
              y2={Y_BOT} 
              stroke="var(--tide-labels)"
              strokeOpacity="0.5" 
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            
            {/* Hover point circle */}
            <circle 
              cx={hoverPoint.x} 
              cy={hoverPoint.y} 
              r="5" 
              fill="var(--tide-curve)" 
              stroke="var(--tide-labels)" 
              strokeOpacity="0.9"
              strokeWidth="2"
            />
            
            {/* Tooltip - only show if not too close to existing labels */}
            {showTooltip && (
              <g>
                <rect 
                  x={hoverPoint.x - 35} 
                  y={hoverPoint.y - 45} 
                  width="70" 
                  height="30" 
                  rx="4" 
                  fill="rgba(0,0,0,0.8)" 
                  stroke="var(--text-primary)" 
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
                <text 
                  x={hoverPoint.x} 
                  y={hoverPoint.y - 33} 
                  textAnchor="middle" 
                  className="tooltip-text" 
                  fontSize={isMobile ? "14" : "11"}
                  fontWeight="600"
                >
                  {(hoverPoint.height !== null && hoverPoint.height !== undefined) ? hoverPoint.height.toFixed(1) : '0.0'}m
                </text>
                <text 
                  x={hoverPoint.x} 
                  y={hoverPoint.y - 21} 
                  textAnchor="middle" 
                  className="tooltip-text" 
                  fontSize={isMobile ? "12" : "9"}
                >
                  {hoverPoint.time}
                </text>
              </g>
            )}
          </g>
        )
      })()}

      <line x1={xNow} y1={Y_TOP} x2={xNow} y2={Y_BOT} stroke="var(--tide-labels)" strokeOpacity="0.47" strokeDasharray="2 4" />
    </svg>
  )
}



