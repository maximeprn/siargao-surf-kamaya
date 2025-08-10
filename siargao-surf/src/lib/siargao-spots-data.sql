-- Delete existing spots and insert complete Siargao dataset
DELETE FROM spots;

-- Insert Cloud 9
INSERT INTO spots (
  name, label, description, latitude, longitude, 
  difficulty_level, wave_type, best_swell_direction, best_wind_direction, best_tide,
  access_info, optimal_height_min, optimal_height_max,
  swell_window_start, swell_window_end, orientation, wind_sensitivity,
  min_skill, max_skill, bottom_type, swell_period_min, swell_period_max,
  best_wind_start, best_wind_end, crowd_factor, access_details,
  tide_window_min, tide_window_max,
  features, hazards, local_tips, alternative_names, nearby_amenities, seasonality,
  created_at, updated_at
) VALUES (
  'Cloud 9',
  'Cloud 9 — World-class right/left barrels',
  'The most famous spot in Siargao, a powerful right-hand reef break over shallow coral. Perfect for experienced surfers only.',
  9.8598, 126.1592,
  'expert', 'reef', 'E', 'W', 'high',
  'Accessible via walking path from General Luna. Parking available.',
  1.2, 3.5,
  30, 110, 70, 0.8,
  'advanced', 'advanced', 'shallow_reef', 10.0, 16.0,
  220, 260, 0.9, 'Walk from General Luna',
  1.00, 1.80,
  '{"barrelSection": true, "mechanicalBarrels": true, "competitionVenue": true, "viewingPlatform": true, "worldRanking": true}',
  ARRAY['shallow_reef', 'strong_current', 'crowd', 'sharp_coral'],
  '{"bestTime": "First light for fewer people", "avoidLowTide": "Extremely shallow — do not surf low tide", "localRespect": "Heavy local presence — be cool"}',
  ARRAY['Crowd 9'],
  ARRAY['restaurants', 'bars', 'surf_shops', 'accommodation'],
  '{"peak": [9,10,11], "good": [12,1,2,3], "small": [5,6,7,8]}',
  NOW(), NOW()
);

-- Insert Quicksilver
INSERT INTO spots (
  name, label, description, latitude, longitude,
  difficulty_level, wave_type, best_swell_direction, best_wind_direction, best_tide,
  access_info, optimal_height_min, optimal_height_max,
  swell_window_start, swell_window_end, orientation, wind_sensitivity,
  min_skill, max_skill, bottom_type, swell_period_min, swell_period_max,
  best_wind_start, best_wind_end, crowd_factor, access_details,
  tide_window_min, tide_window_max,
  features, hazards, local_tips, seasonality,
  created_at, updated_at
) VALUES (
  'Quicksilver',
  'Quicksilver — Fast right, smaller than C9',
  'Fast and fun break, perfect for early morning surf sessions before the crowds arrive.',
  9.8589, 126.1601,
  'expert', 'reef', 'E', 'W', 'mid',
  'Easy access from General Luna beach.',
  1.0, 3.0,
  60, 110, 80, 0.7,
  'intermediate', 'advanced', 'reef', 8.0, 14.0,
  220, 250, 0.8, 'Right of Cloud 9',
  0.80, 1.60,
  '{"fastWave": true, "heavyWave": true, "rightHander": true}',
  ARRAY['shallow_reef', 'crowd'],
  '{"positioning": "Just to the right of Cloud 9 boardwalk", "characteristics": "Fast and punchy but smaller than C9"}',
  '{"peak": [9,10,11], "good": [12,1,2], "small": [5,6,7,8]}',
  NOW(), NOW()
);

-- Insert Stimpy
INSERT INTO spots (
  name, label, description, latitude, longitude,
  difficulty_level, wave_type, best_swell_direction, best_wind_direction, best_tide,
  access_info, optimal_height_min, optimal_height_max,
  swell_window_start, swell_window_end, orientation, wind_sensitivity,
  min_skill, max_skill, bottom_type, swell_period_min, swell_period_max,
  best_wind_start, best_wind_end, crowd_factor, access_details,
  tide_window_min, tide_window_max, boat_cost,
  features, hazards, local_tips, seasonality,
  created_at, updated_at
) VALUES (
  'Stimpy',
  'Stimpy''s — Quality left barrel (boat)',
  'Consistent right-hander with perfect barrels. Less crowded than Cloud 9 but equally technical and challenging.',
  9.8612, 126.1578,
  'expert', 'reef', 'E', 'W', 'low',
  'Short paddle from the beach. Watch out for sea urchins on the reef.',
  0.6, 3.0,
  30, 100, 85, 0.6,
  'intermediate', 'advanced', 'reef_with_boulders', 10.0, 16.0,
  290, 320, 0.5, '10–20 min boat from Catangnan',
  0.40, 1.10, '≈500–1000 PHP per boat (share)',
  '{"leftBarrel": true, "consistentWinter": true, "remoteFeeling": true}',
  ARRAY['shallow_reef', 'large_rock_low_tide', 'boat_access_only'],
  '{"winterSecret": "Sheltered when GL is onshore (Dec–Mar)", "lowTideBarrels": "Best barrels on lower tides"}',
  '{"peak": [9,10,11], "good": [12,1,2], "small": [5,6,7,8]}',
  NOW(), NOW()
);

-- Insert Rock Island
INSERT INTO spots (
  name, label, description, latitude, longitude,
  difficulty_level, wave_type, best_swell_direction, best_wind_direction, best_tide,
  access_info, optimal_height_min, optimal_height_max,
  swell_window_start, swell_window_end, orientation, wind_sensitivity,
  min_skill, max_skill, bottom_type, swell_period_min, swell_period_max,
  best_wind_start, best_wind_end, crowd_factor, access_details,
  tide_window_min, tide_window_max, boat_cost,
  features, hazards, local_tips, seasonality,
  created_at, updated_at
) VALUES (
  'Rock Island',
  'Rock Island — Fast right, long rides (boat)',
  'More accessible spot for intermediate surfers, offering multiple peaks and takeoff zones.',
  9.8634, 126.1567,
  'expert', 'reef', 'E', 'W', 'mid',
  'Accessible by boat or long paddle from the shore.',
  1.2, 3.5,
  40, 120, 100, 0.7,
  'intermediate', 'advanced', 'reef', 10.0, 16.0,
  160, 200, 0.5, 'Near Stimpy''s, ~200 yards offshore',
  0.70, 1.40, '≈500–1000 PHP per boat',
  '{"rightHander": true, "threeSections": true, "scenicBackdrop": true, "longRides": true}',
  ARRAY['reef', 'boat_access'],
  '{"sections": "Can link through ~3 sections on good days", "photography": "Great backdrop for photos"}',
  '{"peak": [9,10,11], "good": [12,1,2], "small": [5,6,7,8]}',
  NOW(), NOW()
);

-- Insert Cemetery
INSERT INTO spots (
  name, label, description, latitude, longitude,
  difficulty_level, wave_type, best_swell_direction, best_wind_direction, best_tide,
  access_info, optimal_height_min, optimal_height_max,
  swell_window_start, swell_window_end, orientation, wind_sensitivity,
  min_skill, max_skill, bottom_type, swell_period_min, swell_period_max,
  best_wind_start, best_wind_end, crowd_factor, access_details,
  tide_window_min, tide_window_max,
  features, hazards, local_tips, seasonality,
  created_at, updated_at
) VALUES (
  'Cemetery',
  'Cemetery/Pesangan — Versatile outer reef peaks',
  'Powerful spot reserved for experts only, featuring hollow and fast-breaking waves.',
  9.8645, 126.1534,
  'intermediate', 'reef', 'E', 'W', 'mid',
  'Difficult access, recommended to go with a local guide.',
  0.6, 2.5,
  45, 150, 95, 0.9,
  'beginner', 'advanced', 'relatively_deep_reef_for_GL', 6.0, 12.0,
  230, 280, 0.4, 'Walkable from General Luna cemetery area',
  0.40, 1.00,
  '{"leftAndRight": true, "multipleBreaks": true, "walkable": true}',
  ARRAY['remote_location', 'multiple_peaks'],
  '{"name": "Named for the beach cemetery", "versatility": "Forgiving when small; options across banks"}',
  '{"summer_fun": [5,6,7,8], "shoulder": [9,10,11,12]}',
  NOW(), NOW()
);