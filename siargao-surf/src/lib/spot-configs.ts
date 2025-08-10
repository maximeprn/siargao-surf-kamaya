// siargao-spots.ts
// Normalized Siargao spot dataset with tuned tide windows
// Angles are FROM-bearings (0°=N, 90°=E). Months are 1–12.

import { SpotConfig } from './marine-weather'

type Skill = 'beginner' | 'intermediate' | 'advanced';

export interface SpotMeta extends SpotConfig {
  label: string;
  bottomType?: string;
  swellPeriod?: [number, number];
  bestWind?: [number, number];
  crowdFactor?: number;
  access?: 'walk' | 'boat' | 'walk (reef lagoon)' | 'boat_or_long_paddle';
  accessDetails?: string;
  boatCost?: string;
  seasonality?: Record<string, number[]>;
  // Normalized fields:
  minSkill: Skill;
  maxSkill: Skill;
  tideWindow?: [number, number];        // meters above chart datum
  tideWindowPct?: [number, number];     // [% of today's range] 0..1
  coords?: { lat: number; lon: number }; // TODO: fill exact GPS if desired
  // Size response correction factors:
  sizeResponse?: {
    base: number;        // base multiplier for the spot (e.g., 1.10 amplifies, 0.80 attenuates)
    dirBoost?: number;   // max gain related to swell angle vs swellWindow (0..0.4 typical)
    periodRef?: number;  // period threshold above which waves get bigger (e.g., 10s)
    periodSlope?: number;// gain per second above periodRef (e.g., 0.03 => +3%/s)
    tideBoost?: number;  // bonus if tide is within tideWindow (e.g., 0.10 => +10%)
    tidePenalty?: number;// penalty if tide is outside window (default: 60% of tideBoost)
    min?: number;        // lower bound of the factor (optional)
    max?: number;        // upper bound of the factor (optional)
  };
  // Free-form:
  features?: Record<string, boolean | string | number>;
  hazards?: string[];
  localTips?: Record<string, string>;
  alternativeNames?: string[];
  nearbyAmenities?: string[];
}

export const siargaoSpotsComplete: Record<string, SpotMeta> = {
  'Cloud 9': {
    label: "Cloud 9 — World-class right/left barrels",
    optimalHeight: [1.2, 3.5],
    swellWindow: [30, 110],          // NNE→E
    orientation: 70,                  // faces ENE/E
    tidalRange: "high",
    tideWindow: [1.00, 1.80],         // tuned
    tideWindowPct: [0.65, 1.00],
    windSensitivity: 0.8,
    type: "reef",
    skill: "expert",
    minSkill: "advanced",
    maxSkill: "advanced",
    bottomType: "shallow_reef",
    swellPeriod: [10, 16],
    bestWind: [220, 260],             // SW→W offshore
    crowdFactor: 0.9,
    access: "walk",
    coords: { lat: 9.81332899, lon: 126.16679507 },
    seasonality: { peak: [9,10,11], good: [12,1,2,3], small: [5,6,7,8] },
    features: {
      barrelSection: true,
      mechanicalBarrels: true,
      competitionVenue: true,
      viewingPlatform: true,
      worldRanking: true
    },
    hazards: ["shallow_reef", "strong_current", "crowd", "sharp_coral"],
    localTips: {
      bestTime: "First light for fewer people",
      avoidLowTide: "Extremely shallow — do not surf low tide",
      localRespect: "Heavy local presence — be cool"
    },
    alternativeNames: ["Crowd 9"],
    nearbyAmenities: ["restaurants", "bars", "surf_shops", "accommodation"],
  },

  'Quicksilver': {
    label: "Quicksilver — Fast right, smaller than C9",
    optimalHeight: [1.0, 3.0],
    swellWindow: [60, 110],           // E→E/NE
    orientation: 80,
    tidalRange: "mid",
    tideWindow: [0.80, 1.60],         // tuned
    tideWindowPct: [0.50, 0.95],
    windSensitivity: 0.7,
    type: "reef",
    skill: "expert",
    minSkill: "intermediate",
    maxSkill: "advanced",
    bottomType: "reef",
    swellPeriod: [8, 14],
    bestWind: [220, 250],
    crowdFactor: 0.8,
    access: "walk",
    coords: { lat: 9.81456245, lon: 126.16547762 },
    accessDetails: "Right of Cloud 9",
    seasonality: { peak: [9,10,11], good: [12,1,2], small: [5,6,7,8] },
    features: { fastWave: true, heavyWave: true, rightHander: true },
    localTips: {
      positioning: "Just to the right of Cloud 9 boardwalk",
      characteristics: "Fast and punchy but smaller than C9"
    },
  },

  'Stimpys': {
    label: "Stimpy's — Quality left barrel (boat)",
    optimalHeight: [0.6, 3.0],
    swellWindow: [30, 100],           // NNE→E
    orientation: 85,
    tidalRange: "low",
    tideWindow: [0.40, 1.10],         // tuned
    tideWindowPct: [0.20, 0.55],
    windSensitivity: 0.6,
    type: "reef",
    skill: "expert",
    minSkill: "intermediate",
    maxSkill: "advanced",
    bottomType: "reef_with_boulders",
    swellPeriod: [10, 16],
    bestWind: [290, 320],             // WNW→NW
    crowdFactor: 0.5,
    access: "boat",
    coords: { lat: 9.84489241, lon: 126.15735699 },
    accessDetails: "10–20 min boat from Catangnan",
    boatCost: "≈500–1000 PHP per boat (share)",
    seasonality: { peak: [9,10,11], good: [12,1,2], small: [5,6,7,8] },
    features: { leftBarrel: true, consistentWinter: true, remoteFeeling: true },
    hazards: ["shallow_reef", "large_rock_low_tide", "boat_access_only"],
    localTips: {
      winterSecret: "Sheltered when GL is onshore (Dec–Mar)",
      lowTideBarrels: "Best barrels on lower tides"
    },
  },

  'Rock Island': {
    label: "Rock Island — Fast right, long rides (boat)",
    optimalHeight: [1.2, 3.5],
    swellWindow: [40, 120],           // NE→ESE
    orientation: 100,
    tidalRange: "mid",
    tideWindow: [0.70, 1.40],         // tuned
    tideWindowPct: [0.45, 0.75],
    windSensitivity: 0.7,
    type: "reef",
    skill: "expert",
    minSkill: "intermediate",
    maxSkill: "advanced",
    bottomType: "reef",
    swellPeriod: [10, 16],
    bestWind: [160, 200],             // SSE→SSW
    crowdFactor: 0.5,
    access: "boat",
    coords: { lat: 9.83928889, lon: 126.16059981 },
    accessDetails: "Near Stimpy's, ~200 yards offshore",
    boatCost: "≈500–1000 PHP per boat",
    seasonality: { peak: [9,10,11], good: [12,1,2], small: [5,6,7,8] },
    features: { rightHander: true, threeSections: true, scenicBackdrop: true, longRides: true },
    localTips: {
      sections: "Can link through ~3 sections on good days",
      photography: "Great backdrop for photos"
    },
  },

  'Cemetery': {
    label: "Cemetery/Pesangan — Versatile left/right peaks",
    optimalHeight: [0.6, 2.5],
    swellWindow: [45, 150],           // NE→SE
    orientation: 95,
    tidalRange: "mid",
    tideWindow: [0.40, 1.00],         // tuned
    tideWindowPct: [0.20, 0.50],
    windSensitivity: 0.9,
    type: "reef",
    skill: "intermediate",
    minSkill: "beginner",
    maxSkill: "advanced",
    bottomType: "relatively_deep_reef_for_GL",
    swellPeriod: [6, 12],
    bestWind: [230, 280],             // SW→W
    crowdFactor: 0.4,
    access: "boat_or_long_paddle",
    coords: { lat: 9.78483924, lon: 126.17306053 },
    accessDetails: "Walkable from General Luna cemetery area",
    seasonality: { summer_fun: [5,6,7,8], shoulder: [9,10,11,12] },
    features: { leftAndRight: true, multipleBreaks: true, walkable: true },
    localTips: {
      name: "Named for the beach cemetery",
      versatility: "Forgiving when small; options across banks"
    },
  },

  'Jacking Horse': {
    label: "Jacking Horse — Beginner-friendly right",
    optimalHeight: [0.5, 1.5],
    swellWindow: [60, 110],
    orientation: 80,
    tidalRange: "mid",
    tideWindow: [0.60, 1.80],
    tideWindowPct: [0.35, 1.00],
    windSensitivity: 0.6,
    type: "reef",
    skill: "beginner",
    minSkill: "beginner",
    maxSkill: "intermediate",
    bottomType: "reef",
    swellPeriod: [6, 12],
    bestWind: [200, 260],
    crowdFactor: 0.9,
    access: "walk",
    coords: { lat: 9.81570173, lon: 126.16473882 },
    accessDetails: "Left of Cloud 9 boardwalk",
    seasonality: { best: [9,10,11,12], small: [5,6,7,8] },
    features: { surfSchoolSpot: true, strongCurrent: true, innerBreak: "Little Pony" },
    hazards: ["strong_lateral_current", "crowd", "rocky_bottom"],
    localTips: {
      instruction: "≈500 PHP/hour with instructor",
      boardRental: "≈500 PHP/hour",
      current: "Lateral current; instructors often tow students"
    },
  },

  'Tuason': {
    label: "Tuason Point — Heavy left barrel",
    optimalHeight: [1.0, 3.0],
    swellWindow: [30, 80],
    orientation: 70,
    tidalRange: "high",
    tideWindow: [1.00, 1.70],
    tideWindowPct: [0.70, 1.00],
    windSensitivity: 0.8,
    type: "reef",
    skill: "expert",
    minSkill: "advanced",
    maxSkill: "advanced",
    bottomType: "shallow_reef",
    swellPeriod: [10, 16],
    bestWind: [220, 260],
    crowdFactor: 0.6,
    access: "walk",
    coords: { lat: 9.80928935, lon: 126.16974122 },
    accessDetails: "Next to Harana Resort",
    seasonality: { peak: [9,10,11], good: [12,1,2], small: [5,6,7,8] },
    features: { barrelSection: true, powerfulLeft: true, heavierThanCloud9: true },
    hazards: ["shallow_reef", "powerful_waves", "sharp_rocks_entry"],
    localTips: {
      entryExit: "Mind the rocks on paddle out",
      waveSelection: "Best from ~4ft+",
      comparison: "Heavier than Cloud 9, usually less crowded"
    },
  },

  'Daku Reef': {
    label: "Daku Reef — Long right, longboard heaven (boat)",
    optimalHeight: [0.8, 2.5],
    swellWindow: [90, 150],
    orientation: 110,
    tidalRange: "mid",
    tideWindow: [0.90, 1.80],
    tideWindowPct: [0.55, 1.00],
    windSensitivity: 0.6,
    type: "reef",
    skill: "beginner",
    minSkill: "beginner",
    maxSkill: "intermediate",
    bottomType: "deeper_reef",
    swellPeriod: [6, 12],
    bestWind: [220, 260],
    crowdFactor: 0.7,
    access: "boat",
    coords: { lat: 9.74766912, lon: 126.1611359 },
    accessDetails: "Off Daku Island",
    boatCost: "Often part of island-hopping tours",
    seasonality: { peak: [9,10,11], good: [3,4,5], small: [6,7,8] },
    features: { longRides: true, mellowWave: true, scenicLocation: true, longboardWave: true },
    localTips: {
      tours: "Commonly included in tours",
      depth: "Deeper reef — safer for progressing surfers"
    },
  },

  'Pacifico': {
    label: "Pacifico — Long, powerful left (north coast)",
    optimalHeight: [1.0, 4.0],
    swellWindow: [10, 80],
    orientation: 60,
    tidalRange: "mid",
    tideWindow: [0.90, 1.70],
    tideWindowPct: [0.60, 1.00],
    windSensitivity: 0.7,
    type: "reef",
    skill: "expert",
    minSkill: "advanced",
    maxSkill: "advanced",
    bottomType: "reef",
    swellPeriod: [10, 16],
    bestWind: [220, 250],
    crowdFactor: 0.3,
    access: "walk (reef lagoon)",
    coords: { lat: 9.97423477, lon: 126.09414024 },
    accessDetails: "≈30 min drive north from General Luna",
    seasonality: { peak: [9,10,11], off: [6,7,8] },
    features: { powerfulLeft: true, doubleOverhead: true, uncrowded: true, townVibe: true },
    localTips: {
      location: "Quieter surf-town vibe",
      expertise: "Genuinely heavy — not for intermediates"
    },
    hazards: ["powerful_waves", "reef", "remote_location"],
  },

  'Salvacion': {
    label: "Salvacion — Winter left/right peaks (boat)",
    optimalHeight: [1.0, 2.5],
    swellWindow: [30, 90],
    orientation: 70,
    tidalRange: "all",
    tideWindow: [0.60, 1.30],
    tideWindowPct: [0.45, 0.75],
    windSensitivity: 0.5,
    type: "reef",
    skill: "intermediate",
    minSkill: "intermediate",
    maxSkill: "advanced",
    bottomType: "reef",
    swellPeriod: [8, 14],
    bestWind: [200, 260],
    crowdFactor: 0.3,
    access: "boat",
    coords: { lat: 9.85565424, lon: 126.11296353 },
    seasonality: { peak: [12,1,2,3], good: [11,4], poor: [5,6,7,8] },
    features: { winterOption: true },
    localTips: { winterOption: "Good when Stimpy's is too big or messy" },
  },

  'Philippine Deep': {
    label: "Philippine Deep — Outer-reef long right (Santa Fe side)",
    optimalHeight: [1.0, 5.0],
    swellWindow: [30, 110],
    orientation: 95,
    tidalRange: "mid",
    tideWindow: [0.7, 1.5],
    tideWindowPct: [0.45, 0.85],
    windSensitivity: 0.6,
    type: "reef",
    skill: "expert",
    minSkill: "intermediate",
    maxSkill: "advanced",
    bottomType: "reef",
    swellPeriod: [10, 16],
    bestWind: [200, 260],
    crowdFactor: 0.2,
    access: "boat_or_long_paddle",
    coords: { lat: 9.8789, lon: 126.13296605 },
    accessDetails: "Standard by boat from GL Cabitoonan/Tourism Road or from Barangay Salvacion",
    seasonality: { peak: [9,10,11], good: [12,1,2,3] },
    features: { longRightWalls: true, holdsVeryLarge: true },
    hazards: ["reef", "currents", "exposure", "boat_traffic"],
    localTips: {
      safety: "Outer-reef distances & currents; go with a buddy/guide and carry comms.",
      paddle: "Paddle from Mahaybo only on light-wind mornings with manageable current."
    },
  },

  'Ocean 9': {
    label: "Ocean 9 (Mahaybo Beach, Santa Fe) — Beach/reef left/right",
    optimalHeight: [0.6, 1.8],
    swellWindow: [45, 120],
    orientation: 95,
    tidalRange: "mid",
    tideWindow: [0.60, 1.60],
    tideWindowPct: [0.35, 0.90],
    windSensitivity: 0.7,
    type: "reef",
    skill: "intermediate",
    minSkill: "beginner",
    maxSkill: "intermediate",
    bottomType: "reef_sand_mix",
    swellPeriod: [7, 13],
    bestWind: [200, 260],
    crowdFactor: 0.3,
    access: "walk",
    coords: { lat: 9.84396164, lon: 126.13140471 },
    accessDetails: "Mahaybo Beach access (Ocean 9 area)",
    seasonality: { peak: [9,10,11], good: [12,1,2], small: [5,6,7,8] },
    features: { areaBreaks: true, lessCrowded: true },
    hazards: ["reef", "urchins", "rip_current"],
    localTips: {
      conditions: "Switchy bank/section quality; needs pulse and favorable wind.",
      linkage: "Launch point for paddles/boats to Philippine Deep."
    },
    alternativeNames: ["Ocean Nine", "Mahaybo Beach", "Santa Fe"],
    nearbyAmenities: ["accommodation", "bar_restaurant", "surf_shop"],
  }
}

// Convert spot names to match database entries
export const spotConfigs: Record<string, SpotConfig> = {
  'Cloud 9': siargaoSpotsComplete['Cloud 9'],
  'Quicksilver': siargaoSpotsComplete['Quicksilver'], 
  'Stimpys': siargaoSpotsComplete['Stimpys'],
  'Rock Island': siargaoSpotsComplete['Rock Island'],
  'Cemetery': siargaoSpotsComplete['Cemetery'],
  'Jacking Horse': siargaoSpotsComplete['Jacking Horse'],
  'Tuason': siargaoSpotsComplete['Tuason'],
  'Daku Reef': siargaoSpotsComplete['Daku Reef'],
  'Pacifico': siargaoSpotsComplete['Pacifico'],
  'Salvacion': siargaoSpotsComplete['Salvacion'],
  'Philippine Deep': siargaoSpotsComplete['Philippine Deep'],
  'Ocean 9': siargaoSpotsComplete['Ocean 9']
}

// Size response defaults for all Siargao spots
const sizeDefaults: Record<string, SpotMeta['sizeResponse']> = {
  'Cloud 9':         { base: 1.05, dirBoost: 0.15, periodRef: 10, periodSlope: 0.03, tideBoost: 0.12, max: 1.5 },
  'Tuason':          { base: 1.10, dirBoost: 0.15, periodRef: 10, periodSlope: 0.035, tideBoost: 0.10, max: 1.6 },
  'Quicksilver':     { base: 0.95, dirBoost: 0.10, periodRef: 9, periodSlope: 0.02, tideBoost: 0.08, max: 1.3 },
  'Jacking Horse':   { base: 0.75, dirBoost: 0.05, periodRef: 8, periodSlope: 0.01, tideBoost: 0.05, max: 1.1 },
  'Stimpys':         { base: 0.90, dirBoost: 0.10, periodRef: 10, periodSlope: 0.04, tideBoost: 0.06, max: 1.6 },
  'Rock Island':     { base: 0.95, dirBoost: 0.10, periodRef: 10, periodSlope: 0.03, tideBoost: 0.06, max: 1.5 },
  'Cemetery':        { base: 0.85, dirBoost: 0.08, periodRef: 8, periodSlope: 0.015, tideBoost: 0.05, max: 1.2 },
  'Daku Reef':       { base: 0.80, dirBoost: 0.06, periodRef: 8, periodSlope: 0.015, tideBoost: 0.08, max: 1.2 },
  'Pacifico':        { base: 1.20, dirBoost: 0.15, periodRef: 10, periodSlope: 0.04, tideBoost: 0.10, max: 1.8 },
  'Salvacion':       { base: 0.90, dirBoost: 0.10, periodRef: 9, periodSlope: 0.025, tideBoost: 0.06, max: 1.4 },
  'Philippine Deep': { base: 1.25, dirBoost: 0.15, periodRef: 10, periodSlope: 0.04, tideBoost: 0.08, max: 2.0 },
  'Ocean 9':         { base: 0.85, dirBoost: 0.08, periodRef: 9, periodSlope: 0.02, tideBoost: 0.08, max: 1.3 },
}

// Apply size response defaults to all spots
for (const [spotName, defaults] of Object.entries(sizeDefaults)) {
  if (siargaoSpotsComplete[spotName]) {
    siargaoSpotsComplete[spotName].sizeResponse = defaults
  }
}

// Fallback config for unknown spots
export const defaultSpotConfig: SpotConfig = {
  optimalHeight: [0.8, 2.0],
  swellWindow: [60, 120],
  orientation: 90,
  tidalRange: 'all',
  windSensitivity: 0.7,
  type: 'reef',
  skill: 'intermediate'
}