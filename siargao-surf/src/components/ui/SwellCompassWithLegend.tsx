import SwellCompass from './SwellCompass'

interface SwellCompassWithLegendProps {
  size?: number
  swellDirection?: number
  windDirection?: number
  swellHeight?: number
  windSpeed?: number
}

export default function SwellCompassWithLegend({
  size = 240,
  swellDirection = 0,
  windDirection = 0,
  swellHeight = 0,
  windSpeed = 0
}: SwellCompassWithLegendProps) {
  return (
    <div className="flex items-center gap-6">
      <SwellCompass 
        size={size}
        swellDirection={swellDirection}
        windDirection={windDirection}
        showWind={true}
      />
      
      {/* Legend */}
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#F8CB9E]/75 rounded-sm border border-[#F8CB9E]/80"></div>
          <div>
            <div className="text-white/90">Swell</div>
            <div className="text-white/60 text-xs">{swellHeight?.toFixed(1) || '0.0'}m from {Math.round(swellDirection)}°</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-white/60 rounded-sm border border-white/80"></div>
          <div>
            <div className="text-white/90">Wind</div>
            <div className="text-white/60 text-xs">{Math.round(windSpeed)}km/h from {Math.round(windDirection)}°</div>
          </div>
        </div>
      </div>
    </div>
  )
}