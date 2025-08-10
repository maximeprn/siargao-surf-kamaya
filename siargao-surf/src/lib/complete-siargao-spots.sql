-- Add all missing Siargao spots to complete the dataset

-- Jacking Horse
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
  'Jacking Horse',
  'Jacking Horse — Beginner-friendly inside of Quicksilver',
  'Beginner-friendly spot inside Quicksilver, perfect for learning with surf schools.',
  9.8585, 126.1595,
  'beginner', 'reef', 'E', 'W', 'mid',
  'Left of Cloud 9 boardwalk, popular with surf schools.',
  0.5, 1.5,
  60, 110, 80, 0.6,
  'beginner', 'intermediate', 'reef', 6.0, 12.0,
  200, 260, 0.9, 'Left of Cloud 9 boardwalk',
  0.60, 1.80,
  '{"surfSchoolSpot": true, "strongCurrent": true, "innerBreak": "Little Pony"}',
  ARRAY['strong_lateral_current', 'crowd', 'rocky_bottom'],
  '{"instruction": "≈500 PHP/hour with instructor", "boardRental": "≈500 PHP/hour", "current": "Lateral current; instructors often tow students"}',
  '{"best": [9,10,11,12], "small": [5,6,7,8]}'
),

-- Tuason Point
(
  'Tuason',
  'Tuason Point — Heavy left barrel',
  'Heavy left barrel break next to Harana Resort, more powerful than Cloud 9.',
  9.8605, 126.1588,
  'expert', 'reef', 'E', 'W', 'high',
  'Next to Harana Resort. Mind the rocks on paddle out.',
  1.0, 3.0,
  30, 80, 70, 0.8,
  'advanced', 'advanced', 'shallow_reef', 10.0, 16.0,
  220, 260, 0.6, 'Next to Harana Resort',
  1.00, 1.70,
  '{"barrelSection": true, "powerfulLeft": true, "heavierThanCloud9": true}',
  ARRAY['shallow_reef', 'powerful_waves', 'sharp_rocks_entry'],
  '{"entryExit": "Mind the rocks on paddle out", "waveSelection": "Best from ~4ft+", "comparison": "Heavier than Cloud 9, usually less crowded"}',
  '{"peak": [9,10,11], "good": [12,1,2], "small": [5,6,7,8]}'
),

-- Daku Reef
(
  'Daku Reef',
  'Daku Reef — Long right, longboard heaven (boat)',
  'Long, mellow right-hand break off Daku Island, perfect for longboarders and beginners.',
  9.8234, 126.0876,
  'beginner', 'reef', 'E', 'W', 'mid',
  'Off Daku Island, often part of island-hopping tours.',
  0.8, 2.5,
  90, 150, 110, 0.6,
  'beginner', 'intermediate', 'deeper_reef', 6.0, 12.0,
  220, 260, 0.7, 'Off Daku Island',
  0.90, 1.80,
  '{"longRides": true, "mellowWave": true, "scenicLocation": true, "longboardWave": true}',
  ARRAY['boat_access'],
  '{"tours": "Commonly included in tours", "depth": "Deeper reef — safer for progressing surfers"}',
  '{"peak": [9,10,11], "good": [3,4,5], "small": [6,7,8]}'
),

-- Pacifico
(
  'Pacifico',
  'Pacifico — Long, powerful left (north coast)',
  'Long, powerful left-hand break on the north coast, genuinely heavy waves.',
  9.9234, 126.1234,
  'expert', 'reef', 'N', 'SW', 'mid',
  '≈30 min drive north from General Luna. Quieter surf-town vibe.',
  1.0, 4.0,
  10, 80, 60, 0.7,
  'advanced', 'advanced', 'reef', 10.0, 16.0,
  220, 250, 0.3, '≈30 min drive north from General Luna',
  0.90, 1.70,
  '{"powerfulLeft": true, "doubleOverhead": true, "uncrowded": true, "townVibe": true}',
  ARRAY['powerful_waves', 'reef', 'remote_location'],
  '{"location": "Quieter surf-town vibe", "expertise": "Genuinely heavy — not for intermediates"}',
  '{"peak": [9,10,11], "off": [6,7,8]}'
),

-- Salvacion
(
  'Salvacion',
  'Salvacion — Winter alternative (boat)',
  'Good alternative when other spots are too big or messy, especially in winter.',
  9.8456, 126.1345,
  'intermediate', 'reef', 'E', 'W', 'all',
  'Boat access required, good winter option.',
  1.0, 2.5,
  30, 90, 70, 0.5,
  'intermediate', 'advanced', 'reef', 8.0, 14.0,
  200, 260, 0.3, 'Boat access',
  0.60, 1.30,
  '{"winterOption": true}',
  ARRAY['boat_access'],
  '{"winterOption": "Good when Stimpy''s is too big or messy"}',
  '{"peak": [12,1,2,3], "good": [11,4], "poor": [5,6,7,8]}'
);