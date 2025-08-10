'use client'

import { useState } from 'react'

interface TideCurveProps {
  tideData?: {
    current: number
    hourly: {
      time: string[]
      sea_level_height_msl: number[]
    }
  }
}

export default function TideCurve({ tideData }: TideCurveProps){
  const [hoverPoint, setHoverPoint] = useState<{x: number, y: number, height: number, time: string} | null>(null)
  
  const VIEW_W = 462
  const X0 = 40
  const RIGHT = 10
  const XW = VIEW_W - X0 - RIGHT
  const Y_TOP = 40, Y_BOT = 180
  
  // Use real tide data or fallback to mock data
  let tidePoints: { time: string, height: number }[] = []
  let H_MIN = -0.1, H_MAX = 1.8
  
  if (tideData?.hourly && tideData.hourly.time.length > 0) {
    console.log('Using real tide data', tideData.hourly.time.length, 'points')
    // Get next 24 hours of tide data
    const now = new Date()
    const currentHour = now.getHours()
    
    // Take 24 data points (every hour for next 24h)
    // API data is already in Asia/Manila timezone, so no need for timezone conversion
    tidePoints = tideData.hourly.time.slice(0, 24).map((timeStr, i) => ({
      time: new Date(timeStr).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false
      }),
      height: tideData.hourly.sea_level_height_msl[i]
    }))
    
    // Calculate dynamic range based on real data
    const heights = tidePoints.map(p => p.height)
    H_MIN = Math.min(...heights) - 0.1
    H_MAX = Math.max(...heights) + 0.1
    console.log('Tide range:', H_MIN, 'to', H_MAX)
  } else {
    console.log('Using fallback tide data - no real data available')
    // Fallback mock data with more realistic values
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
  
  // Find high and low tide points
  const findExtremes = (pts: typeof points) => {
    const extremes: Array<{x: number, y: number, height: number, time: string, type: 'high' | 'low'}> = []
    
    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const next = pts[i + 1]
      
      // High tide: current point is higher than both neighbors
      if (curr.height > prev.height && curr.height > next.height) {
        extremes.push({...curr, type: 'high'})
      }
      // Low tide: current point is lower than both neighbors
      else if (curr.height < prev.height && curr.height < next.height) {
        extremes.push({...curr, type: 'low'})
      }
    }
    
    return extremes
  }
  
  const extremePoints = findExtremes(points)
  
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
  
  // Get current time in Philippines timezone (GMT+8)
  const nowPhilippines = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
  const nowDate = new Date(nowPhilippines)
  const nowMin = nowDate.getHours() * 60 + nowDate.getMinutes()
  const xNow = X0 + XW * (nowMin/1440)

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
      className="w-full h-auto mt-6" 
      preserveAspectRatio="xMinYMid meet"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <g stroke="rgba(255,255,255,0.35)" strokeWidth="1">
        <line x1={X0} y1={Y_BOT} x2={X0+XW} y2={Y_BOT} />
        <line x1={X0} y1={Y_TOP} x2={X0} y2={Y_BOT} />
      </g>
      {[0,6,12,18,24].map((t,i)=>{
        const x = X0 + XW * (t/24)
        return (
          <g key={i} stroke="rgba(255,255,255,0.25)">
            <line x1={x} y1={Y_BOT-4} x2={x} y2={Y_BOT+4} />
            <text className="svg-label" x={x} y={Y_BOT+20} textAnchor="middle">{t}h</text>
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
            <g key={i} stroke="rgba(255,255,255,0.25)">
              <line x1={X0-4} y1={y} x2={X0+4} y2={y} />
              <text className="svg-label" x={X0-8} y={y+4} textAnchor="end">{t.toFixed(1)}m</text>
            </g>
          )
        })
      })()}
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F8CB9E" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F8CB9E" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#g)" strokeWidth="3" />
      
      {/* High and low tide labels */}
      {extremePoints.map((point, i) => {
        const isHigh = point.type === 'high'
        const labelColor = isHigh ? "#F8CB9E" : "#8CC8FF"
        // Always position labels above the curve with 25px padding
        const labelY = point.y - 25
        
        return (
          <g key={i}>
            {/* Dot at the extreme point */}
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="4" 
              fill={labelColor} 
              stroke="rgba(255,255,255,0.8)" 
              strokeWidth="1"
            />
            {/* Label with height and time */}
            <text 
              x={point.x} 
              y={labelY} 
              textAnchor="middle" 
              className="svg-label" 
              fill={labelColor}
              fontSize="11"
            >
              <tspan x={point.x} dy="0">{point.height.toFixed(1)}m</tspan>
              <tspan x={point.x} dy="12" fontSize="9" fill="rgba(255,255,255,0.7)">{point.time}</tspan>
            </text>
          </g>
        )
      })}
      
      {/* Current tide level indicator */}
      {tideData?.current && (
        <g>
          <circle 
            cx={xNow} 
            cy={yFromHeight(tideData.current)} 
            r="6" 
            fill="#F8CB9E" 
            stroke="rgba(255,255,255,0.8)" 
            strokeWidth="2"
          />
          {/* Current height label - larger font */}
          <text 
            x={xNow} 
            y={yFromHeight(tideData.current) - 18} 
            textAnchor="middle" 
            className="svg-label" 
            fill="#F8CB9E"
            fontSize="13"
            fontWeight="600"
          >
            {tideData.current.toFixed(1)}m
          </text>
        </g>
      )}

      {/* Hover point indicator */}
      {hoverPoint && (
        <g>
          {/* Vertical line at hover point */}
          <line 
            x1={hoverPoint.x} 
            y1={Y_TOP} 
            x2={hoverPoint.x} 
            y2={Y_BOT} 
            stroke="rgba(255,255,255,0.5)" 
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          
          {/* Hover point circle */}
          <circle 
            cx={hoverPoint.x} 
            cy={hoverPoint.y} 
            r="5" 
            fill="#F8CB9E" 
            stroke="rgba(255,255,255,0.9)" 
            strokeWidth="2"
          />
          
          {/* Tooltip */}
          <g>
            <rect 
              x={hoverPoint.x - 35} 
              y={hoverPoint.y - 45} 
              width="70" 
              height="30" 
              rx="4" 
              fill="rgba(0,0,0,0.8)" 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="1"
            />
            <text 
              x={hoverPoint.x} 
              y={hoverPoint.y - 30} 
              textAnchor="middle" 
              className="svg-label" 
              fill="white"
              fontSize="11"
              fontWeight="600"
            >
              {hoverPoint.height.toFixed(1)}m
            </text>
            <text 
              x={hoverPoint.x} 
              y={hoverPoint.y - 18} 
              textAnchor="middle" 
              className="svg-label" 
              fill="rgba(255,255,255,0.8)"
              fontSize="9"
            >
              {hoverPoint.time}
            </text>
          </g>
        </g>
      )}

      <line x1={xNow} y1={Y_TOP} x2={xNow} y2={Y_BOT} stroke="rgba(255,255,255,.28)" strokeDasharray="2 4" />
    </svg>
  )
}



