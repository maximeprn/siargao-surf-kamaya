import { WeatherData, getWindDirection, getWeatherIconUrl } from '@/lib/weather'
import { Cloud, Wind, Droplets, Thermometer } from 'lucide-react'
import Image from 'next/image'

interface WeatherWidgetProps {
  weather: WeatherData
  spotName: string
}

export default function WeatherWidget({ weather, spotName }: WeatherWidgetProps) {
  const current = weather.current
  const today = weather.daily[0]
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Cloud className="h-5 w-5 text-blue-600" />
        Weather Conditions
      </h2>
      
      {/* Current Weather */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Current Conditions</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Image
              src={getWeatherIconUrl(current.weather[0].icon)}
              alt={current.weather[0].description}
              width={60}
              height={60}
              className="w-15 h-15"
            />
            <div>
              <div className="text-2xl font-bold">{Math.round(current.temp)}°C</div>
              <div className="text-sm text-gray-600 capitalize">{current.weather[0].description}</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span>Feels like {Math.round(current.feels_like)}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span>{current.humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span>{Math.round(current.wind_speed * 3.6)} km/h {getWindDirection(current.wind_deg)}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div>
        <h3 className="text-lg font-medium mb-3">7-Day Forecast</h3>
        <div className="space-y-2">
          {weather.daily.slice(0, 7).map((day, index) => (
            <div key={day.dt} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium w-16">
                  {index === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <Image
                  src={getWeatherIconUrl(day.weather[0].icon)}
                  alt={day.weather[0].description}
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-sm text-gray-600 capitalize">{day.weather[0].main}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3 text-gray-400" />
                  <span>{Math.round(day.wind_speed * 3.6)} km/h</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{Math.round(day.temp.max)}°</span>
                  <span className="text-gray-500">/{Math.round(day.temp.min)}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}