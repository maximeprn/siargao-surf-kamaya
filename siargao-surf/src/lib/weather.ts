export interface WeatherData {
  current: {
    temp: number
    feels_like: number
    humidity: number
    wind_speed: number
    wind_deg: number
    weather: {
      main: string
      description: string
      icon: string
    }[]
  }
  daily: Array<{
    dt: number
    temp: {
      min: number
      max: number
    }
    weather: {
      main: string
      description: string
      icon: string
    }[]
    wind_speed: number
    wind_deg: number
  }>
}

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching weather data:', error)
    return null
  }
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}