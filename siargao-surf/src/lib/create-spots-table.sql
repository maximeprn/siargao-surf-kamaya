-- Create complete spots table with all enhanced fields
DROP TABLE IF EXISTS spots;

CREATE TABLE spots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  label TEXT,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  difficulty_level VARCHAR CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  wave_type VARCHAR CHECK (wave_type IN ('reef', 'beach', 'point', 'rivermouth')),
  best_swell_direction VARCHAR,
  best_wind_direction VARCHAR,
  best_tide VARCHAR CHECK (best_tide IN ('low', 'mid', 'high', 'all')),
  hazards TEXT[],
  access_info TEXT,
  facilities TEXT[],
  images TEXT[],
  
  -- Enhanced fields from Siargao dataset
  optimal_height_min DECIMAL(3,1),
  optimal_height_max DECIMAL(3,1),
  swell_window_start INTEGER CHECK (swell_window_start >= 0 AND swell_window_start < 360),
  swell_window_end INTEGER CHECK (swell_window_end >= 0 AND swell_window_end < 360),
  orientation INTEGER CHECK (orientation >= 0 AND orientation < 360),
  wind_sensitivity DECIMAL(3,2) CHECK (wind_sensitivity >= 0 AND wind_sensitivity <= 1),
  min_skill VARCHAR CHECK (min_skill IN ('beginner', 'intermediate', 'advanced')),
  max_skill VARCHAR CHECK (max_skill IN ('beginner', 'intermediate', 'advanced')),
  bottom_type TEXT,
  swell_period_min DECIMAL(4,1),
  swell_period_max DECIMAL(4,1),
  best_wind_start INTEGER CHECK (best_wind_start >= 0 AND best_wind_start < 360),
  best_wind_end INTEGER CHECK (best_wind_end >= 0 AND best_wind_end < 360),
  crowd_factor DECIMAL(3,2) CHECK (crowd_factor >= 0 AND crowd_factor <= 1),
  access_details TEXT,
  boat_cost TEXT,
  tide_window_min DECIMAL(4,2),
  tide_window_max DECIMAL(4,2),
  
  -- JSON fields for complex data
  features JSONB,
  local_tips JSONB,
  alternative_names TEXT[],
  nearby_amenities TEXT[],
  seasonality JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX spots_swell_window_idx ON spots(swell_window_start, swell_window_end);
CREATE INDEX spots_optimal_height_idx ON spots(optimal_height_min, optimal_height_max);
CREATE INDEX spots_difficulty_idx ON spots(difficulty_level);
CREATE INDEX spots_location_idx ON spots(latitude, longitude);
CREATE INDEX spots_name_idx ON spots(name);