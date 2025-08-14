export interface MarineWeatherData {
  current: {
    time: string
    wave_height: number
    wave_direction: number
    wave_period: number
    wind_wave_height: number
    swell_wave_height: number
    swell_wave_direction: number
    swell_wave_period: number
  }
  hourly: {
    time: string[]
    wave_height: number[]
    wave_direction: number[]
    wave_period: number[]
    wind_wave_height: number[]
    swell_wave_height: number[]
    swell_wave_direction: number[]
    swell_wave_period: number[]
  }
  daily: {
    time: string[]
    wave_height_max: number[]
    wave_period_max: number[]
    swell_wave_height_max: number[]
    wind_wave_height_max: number[]
  }
  weather: {
    current: {
      temperature: number
      windspeed: number
      winddirection: number
      weathercode: number
    }
    daily: {
      time: string[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
      windspeed_10m_max: number[]
      weathercode: number[]
    }
    hourly: {
      time: string[]
      windspeed_10m: number[]
      winddirection_10m: number[]
    }
  }
}

export async function getMarineWeatherData(lat: number, lon: number): Promise<MarineWeatherData | null> {
  try {
    // Get wave data using ncep_gfswave016 model (better wave predictions)
    const waveResponse = await fetch(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,swell_wave_direction,swell_wave_period&daily=wave_height_max,wave_period_max,wind_wave_height_max,swell_wave_height_max&timezone=Asia%2FManila&models=ncep_gfswave016`
    )
    
    // Get weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,windspeed_10m,winddirection_10m,weathercode&hourly=windspeed_10m,winddirection_10m&daily=temperature_2m_max,temperature_2m_min,windspeed_10m_max,weathercode&timezone=Asia%2FManila`
    )
    
    if (!waveResponse.ok || !weatherResponse.ok) {
      throw new Error('Failed to fetch weather data')
    }
    
    const waveData = await waveResponse.json()
    const weatherData = await weatherResponse.json()
    
    console.log('Weather API Response at', new Date().toISOString(), ':', {
      time: weatherData.current.time,
      windspeed: weatherData.current.windspeed_10m,
      temperature: weatherData.current.temperature_2m
    })
    
    return {
      current: waveData.current,
      hourly: waveData.hourly,
      daily: waveData.daily,
      weather: {
        current: {
          temperature: weatherData.current.temperature_2m,
          windspeed: weatherData.current.windspeed_10m,
          winddirection: weatherData.current.winddirection_10m,
          weathercode: weatherData.current.weathercode
        },
        daily: weatherData.daily,
        hourly: {
          time: weatherData.hourly.time,
          windspeed_10m: weatherData.hourly.windspeed_10m,
          winddirection_10m: weatherData.hourly.winddirection_10m
        }
      }
    }
  } catch (error) {
    console.error('Error fetching marine weather data:', error)
    return null
  }
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export function getSwellDirection(degrees: number): string {
  return getWindDirection(degrees)
}

export function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  }
  return weatherCodes[code] || 'Unknown'
}

// Siargao/Generic surf spot scoring (0..100)
// Conventions:
// - Angles are FROM-bearings (0°=N, 90°=E, 180°=S, 270°=W).
// - windSpeed is assumed in m/s (convert if your source uses knots or km/h).
// - tideStage is a coarse bucket; replace with numeric tide level if available.

export interface SpotConfig {
  optimalHeight: [number, number];      // [min, max] meters
  swellWindow: [number, number];        // [start, end] deg (from-bearing), supports wrap (e.g., 320..40)
  orientation: number;                  // deg the spot faces
  tidalRange: 'all' | 'low' | 'mid' | 'high';
  windSensitivity: number;              // 0..1 (1 = very wind-sensitive)
  type: 'beach' | 'reef' | 'point' | 'rivermouth';
  skill: 'beginner' | 'intermediate' | 'expert';
}

export type Conditions = {
  waveHeight: number;        // m (combined/breaking)
  wavePeriod: number;        // s (primary period)
  waveDirection: number;     // deg (from)
  windSpeed?: number;        // m/s
  windDirection?: number;    // deg (from)
  tideStage?: 'low' | 'mid' | 'high';
};

const clamp = (x:number, a:number, b:number)=>Math.max(a, Math.min(b, x));

// Circular angular distance, returns 0..180
const angDiff = (a:number, b:number)=>{
  const d = Math.abs(a-b) % 360;
  return d > 180 ? 360 - d : d;
};

// Score [0..1] for a direction against a window [start,end] with wrap handling.
// Full score inside the arc; linear falloff to 0 by 45° outside the nearest edge.
export function swellWindowScore(dir:number, win:[number,number]){
  const [s, e] = win;
  const inside = (():boolean=>{
    if (s <= e) return dir >= s && dir <= e;
    return dir >= s || dir <= e; // wrapped arc
  })();
  if (inside) return 1;
  const d = Math.min(angDiff(dir, s), angDiff(dir, e));
  return clamp(1 - d/45, 0, 1);
}

export function getWaveQuality(
  conditions: Conditions,
  spotConfig: SpotConfig
): {
  score: number;
  rating: string;
  breakdown: Record<string, number>;
  warnings: string[];
}{
  const breakdown: Record<string, number> = {};
  const warnings: string[] = [];

  // --- 1) HEIGHT (0–25) - MORE STRICT
  const [hMin, hMax] = spotConfig.optimalHeight;
  let heightScore = 0;
  if (conditions.waveHeight < 0.5*hMin) {
    heightScore = 0;
    warnings.push('Too small for this spot');
  } else if (conditions.waveHeight > 1.5*hMax) {
    heightScore = 5;
    warnings.push('Too big / heavy for this spot');
  } else if (conditions.waveHeight >= hMin && conditions.waveHeight <= hMax) {
    heightScore = 25; // sweet spot - reduced from 30
  } else {
    const d = Math.min(Math.abs(conditions.waveHeight - hMin), Math.abs(conditions.waveHeight - hMax));
    const span = Math.max(hMax - hMin, 0.5);
    heightScore = clamp(25 - 18*(d/span), 2, 23); // more harsh dropoff
  }
  breakdown.height = heightScore;

  // --- 2) SWELL DIRECTION (0–25) via window scoring - MORE STRICT
  const dirScore01 = swellWindowScore(conditions.waveDirection, spotConfig.swellWindow);
  const directionScore = Math.round(25 * dirScore01);
  if (dirScore01 < 0.3) warnings.push('Poor swell window for this spot');
  breakdown.direction = directionScore;

  // --- 3) PERIOD / ENERGY (0–15) - MORE STRICT
  // Energy proxy ~ H^2 * T
  const energy = conditions.waveHeight*conditions.waveHeight * conditions.wavePeriod;
  // More strict heuristics: 15 => weak, 70 => powerful
  const e01 = clamp((energy - 15) / (70 - 15), 0, 1);
  let periodScore = Math.round(12 * e01); // reduced max from 15 to 12
  if (spotConfig.type === 'reef') periodScore = Math.round(periodScore * 1.05); // reduced bonus
  if (spotConfig.type === 'beach') periodScore = Math.round(periodScore * 0.85); // more penalty
  periodScore = clamp(periodScore, 0, 12);
  breakdown.period = periodScore;

  // --- 4) WIND (0–18) weighted by sensitivity - MORE STRICT
  let windScore = 18;
  if (conditions.windSpeed != null && conditions.windDirection != null) {
    const wsKmh = conditions.windSpeed * 3.6; // m/s -> km/h
    const offshoreDir = (spotConfig.orientation + 180) % 360;
    const a = angDiff(conditions.windDirection, offshoreDir); // 0..180
    const isOff = a <= 45;
    const isCross = a > 45 && a <= 90;

    if (isOff) {
      windScore = wsKmh < 12 ? 18 : wsKmh < 20 ? 14 : wsKmh < 30 ? 8 : 3;
      if (wsKmh >= 20) warnings.push('Strong offshore (gusty)');
    } else if (isCross) {
      windScore = wsKmh < 10 ? 8 : wsKmh < 20 ? 5 : 2;
      warnings.push('Cross-shore wind');
    } else { // onshore
      windScore = wsKmh < 8 ? 4 : wsKmh < 15 ? 2 : 0;
      if (wsKmh >= 8) warnings.push('Onshore wind (choppy surface)');
    }

    // Apply wind sensitivity (1 = very sensitive → larger penalty)
    const sens = clamp(spotConfig.windSensitivity, 0, 1);
    windScore = Math.round(windScore * (1 - 0.4*(1 - sens))); // sens=0 => +40% tolerance
  }
  breakdown.wind = clamp(windScore, 0, 18);

  // --- 5) TIDE (0–4) if provided - MORE STRICT
  let tideScore = 2; // neutral default reduced
  if (spotConfig.tidalRange !== 'all' && conditions.tideStage) {
    tideScore = (conditions.tideStage === spotConfig.tidalRange) ? 4 :
                (spotConfig.tidalRange === 'mid' && conditions.tideStage !== 'mid') ? 1.5 :
                0.5;
    if (tideScore < 2) warnings.push(`Tide mismatch (current: ${conditions.tideStage})`);
  }
  breakdown.tide = tideScore;

  // --- 6) SPOT BONUS (0–3) mild - MORE STRICT
  let spotBonus = 0;
  if (spotConfig.type === 'point' && directionScore >= 20) spotBonus += 1.5;
  if (spotConfig.type === 'reef' && periodScore >= 10) spotBonus += 1.5;
  breakdown.spotBonus = spotBonus;

  // --- TOTAL (0..100)
  const total = clamp(
    breakdown.height + breakdown.direction + breakdown.period + breakdown.wind + breakdown.tide + breakdown.spotBonus,
    0, 100
  );

  // --- RATINGS by skill level - MORE STRICT
  const rating = (t:number, lvl:SpotConfig['skill'])=>{
    if (lvl === 'beginner') {
      if (t < 40) return 'Not surfable';
      if (t < 60) return 'Challenging for beginners';
      if (t < 80) return 'OK to practice';
      return 'Great for learning';
    } else {
      if (t < 25) return 'Flat/Poor';
      if (t < 45) return 'Poor–Fair';
      if (t < 60) return 'Fair';
      if (t < 75) return 'Good';
      if (t < 90) return 'Very Good';
      if (t < 96) return 'Epic';
      return 'All-time';
    }
  };

  return {
    score: total,
    rating: rating(total, spotConfig.skill),
    breakdown,
    warnings
  };
}

export function feetToMeters(feet: number): number {
  return feet * 0.3048
}

export function metersToFeet(meters: number): number {
  return meters * 3.28084
}