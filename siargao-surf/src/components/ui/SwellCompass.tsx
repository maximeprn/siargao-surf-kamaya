export default function SwellCompass({ 
  size = 240, 
  swellDirection = 0,
  windDirection = 0,
  showWind = true 
}: { 
  size?: number
  swellDirection?: number
  windDirection?: number
  showWind?: boolean
}) {
  // Normalize angles (0-360)
  const normalizedSwell = ((swellDirection % 360) + 360) % 360
  const normalizedWind = ((windDirection % 360) + 360) % 360
  
  // Calculate arrow points for swell (main arrow)
  // Add 180° because swell direction indicates where it comes FROM, not where it goes TO
  const swellAngle = (normalizedSwell + 180 - 90) * Math.PI / 180
  const arrowLength = 84
  const arrowWidth = 25
  
  // Main swell arrow points (pointing opposite to the swell origin)
  const swellTip = {
    x: 120 + arrowLength * Math.cos(swellAngle),
    y: 120 + arrowLength * Math.sin(swellAngle)
  }
  
  const swellBase1 = {
    x: 120 + arrowWidth * Math.cos(swellAngle - Math.PI/2),
    y: 120 + arrowWidth * Math.sin(swellAngle - Math.PI/2)
  }
  
  const swellBase2 = {
    x: 120 + arrowWidth * Math.cos(swellAngle + Math.PI/2),
    y: 120 + arrowWidth * Math.sin(swellAngle + Math.PI/2)
  }

  // Wind arrow (if shown) - showing where wind is GOING TO (add 180° because wind direction indicates where it comes FROM)
  const windAngle = (normalizedWind + 180 - 90) * Math.PI / 180
  const windLength = 70
  const windTip = showWind ? {
    x: 120 + windLength * Math.cos(windAngle),
    y: 120 + windLength * Math.sin(windAngle)
  } : null
  
  // Wind arrow shape (smaller triangle)
  const windBase1 = showWind ? {
    x: 120 + 15 * Math.cos(windAngle - Math.PI/2),
    y: 120 + 15 * Math.sin(windAngle - Math.PI/2)
  } : null
  
  const windBase2 = showWind ? {
    x: 120 + 15 * Math.cos(windAngle + Math.PI/2),
    y: 120 + 15 * Math.sin(windAngle + Math.PI/2)
  } : null

  return (
    <svg viewBox="0 0 240 240" className="h-auto" style={{ width: size }}>
      {/* Outer circle */}
      <circle cx="120" cy="120" r="90" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
      
      {/* Tick marks */}
      {[0,45,90,135,180,225,270,315].map((d,i)=> (
        <line key={i}
          x1={120+90*Math.cos((d-90)*Math.PI/180)} y1={120+90*Math.sin((d-90)*Math.PI/180)}
          x2={120+96*Math.cos((d-90)*Math.PI/180)} y2={120+96*Math.sin((d-90)*Math.PI/180)}
          stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      ))}
      
      {/* Direction labels */}
      {['N','NE','E','SE','S','SW','W','NW'].map((t,i)=>{ 
        const d=i*45;
        const x=120+110*Math.cos((d-90)*Math.PI/180), y=120+110*Math.sin((d-90)*Math.PI/180);
        return <text key={i} className="svg-label" x={x} y={y+4} textAnchor="middle">{t}</text>;
      })}
      
      {/* Swell arrow */}
      <path 
        d={`M${swellBase1.x},${swellBase1.y} L${swellTip.x},${swellTip.y} L${swellBase2.x},${swellBase2.y} Z`}
        fill="#F8CB9E" 
        fillOpacity=".75"
      />
      
      {/* Wind arrow (optional) */}
      {showWind && windTip && windBase1 && windBase2 && (
        <>
          {/* Wind arrow */}
          <path 
            d={`M${windBase1.x},${windBase1.y} L${windTip.x},${windTip.y} L${windBase2.x},${windBase2.y} Z`}
            fill="rgba(255,255,255,0.6)" 
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="1"
          />
        </>
      )}
      
      {/* Center dot */}
      <circle cx="120" cy="120" r="3" fill="#F8CB9E"/>
    </svg>
  )
}



