-- Add the remaining Siargao spots: Philippine Deep and Ocean 9

-- Philippine Deep
INSERT INTO spots (
  name, label, description, latitude, longitude, 
  difficulty_level, wave_type, best_swell_direction, best_wind_direction, best_tide,
  access_info, optimal_height_min, optimal_height_max,
  swell_window_start, swell_window_end, orientation, wind_sensitivity,
  min_skill, max_skill, bottom_type, swell_period_min, swell_period_max,
  best_wind_start, best_wind_end, crowd_factor, access_details,
  tide_window_min, tide_window_max,
  features, hazards, local_tips, seasonality
) VALUES (
  'Philippine Deep',
  'Philippine Deep — Outer-reef long right (Santa Fe side)',
  'Serious outer-reef wave that holds very large swells, long right walls for experienced surfers only.',
  9.8789, 126.1445,
  'expert', 'reef', 'E', 'W', 'mid',
  'Standard by boat from GL or paddle from Mahaybo (Santa Fe) in calm conditions.',
  1.0, 5.0,
  30, 110, 95, 0.6,
  'intermediate', 'advanced', 'reef', 10.0, 16.0,
  200, 260, 0.2, 'Boat from GL Cabitoonan/Tourism Road or from Barangay Salvacion',
  0.70, 1.50,
  '{"longRightWalls": true, "holdsVeryLarge": true}',
  ARRAY['reef', 'currents', 'exposure', 'boat_traffic'],
  '{"safety": "Outer-reef distances & currents; go with a buddy/guide and carry comms.", "paddle": "Paddle from Mahaybo only on light-wind mornings with manageable current."}',
  '{"peak": [9,10,11], "good": [12,1,2,3]}'
),

-- Ocean 9 / Mahaybo Beach
(
  'Ocean 9',
  'Ocean 9 (Mahaybo Beach, Santa Fe) — Beach/reef area',
  'Beach/reef area in Santa Fe, quieter alternative to General Luna spots with area breaks.',
  9.8934, 126.1234,
  'intermediate', 'reef', 'E', 'W', 'mid',
  'Walk access from Mahaybo Beach, Santa Fe. Launch point for Philippine Deep.',
  0.6, 1.8,
  45, 120, 95, 0.7,
  'beginner', 'intermediate', 'reef_sand_mix', 7.0, 13.0,
  200, 260, 0.3, 'Mahaybo Beach access (Ocean 9 area)',
  0.60, 1.60,
  '{"areaBreaks": true, "lessCrowded": true}',
  ARRAY['reef', 'urchins', 'rip_current'],
  '{"conditions": "Switchy bank/section quality; needs pulse and favorable wind.", "linkage": "Launch point for paddles/boats to Philippine Deep."}',
  '{"peak": [9,10,11], "good": [12,1,2], "small": [5,6,7,8]}'
);