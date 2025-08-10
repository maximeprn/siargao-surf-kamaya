export default function SurfQualityGauge({ rating = 'FAIR' }: { rating?: string }) {
  const labels = ["POOR","POOR-FAIR","FAIR","GOOD","VERY GOOD","EPIC","EXCELLENT"]
  const idx = Math.max(0, labels.indexOf(rating))
  const palette = ["#808080","#A0A0A0","#F8CB9E","#F8CB9E","#AEBDAF","#AEBDAF","#FB3A3A"] as string[]
  const total = 7, pillW = 54, pillH = 10, gap = 14, width = total*pillW+(total-1)*gap, height = 22
  
  return (
    <div>
      <div className="eyebrow">Surf Quality</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto mt-3" preserveAspectRatio="xMinYMid meet">
        {/* Afficher seulement les pillules remplies */}
        {Array.from({length:total}).map((_,i)=>{
          return (i <= idx) ? (
            <rect 
              key={`f-${i}`} 
              x={i*(pillW+gap)} 
              y={(height-pillH)/2} 
              width={pillW} 
              height={pillH} 
              rx={pillH/2} 
              fill={palette[i]}
            />
          ) : null
        })}
      </svg>
      <div className="mt-2 surf-quality-label">{labels[idx]}</div>
    </div>
  )
}



