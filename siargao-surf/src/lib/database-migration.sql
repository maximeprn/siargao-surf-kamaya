-- Enhanced Siargao spots table migration
-- Add new columns to existing spots table

-- Add new columns for enhanced spot data
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS label TEXT,
ADD COLUMN IF NOT EXISTS swell_window_start INTEGER, -- degrees
ADD COLUMN IF NOT EXISTS swell_window_end INTEGER,   -- degrees  
ADD COLUMN IF NOT EXISTS orientation INTEGER,        -- degrees spot faces
ADD COLUMN IF NOT EXISTS wind_sensitivity DECIMAL(3,2), -- 0.0 to 1.0
ADD COLUMN IF NOT EXISTS min_skill VARCHAR,
ADD COLUMN IF NOT EXISTS max_skill VARCHAR,
ADD COLUMN IF NOT EXISTS bottom_type TEXT,
ADD COLUMN IF NOT EXISTS swell_period_min DECIMAL(4,1),
ADD COLUMN IF NOT EXISTS swell_period_max DECIMAL(4,1),
ADD COLUMN IF NOT EXISTS best_wind_start INTEGER,    -- degrees
ADD COLUMN IF NOT EXISTS best_wind_end INTEGER,      -- degrees
ADD COLUMN IF NOT EXISTS crowd_factor DECIMAL(3,2), -- 0.0 to 1.0
ADD COLUMN IF NOT EXISTS boat_cost TEXT,
ADD COLUMN IF NOT EXISTS access_details TEXT,
ADD COLUMN IF NOT EXISTS tide_window_min DECIMAL(4,2), -- meters
ADD COLUMN IF NOT EXISTS tide_window_max DECIMAL(4,2), -- meters
ADD COLUMN IF NOT EXISTS features JSONB,
ADD COLUMN IF NOT EXISTS local_tips JSONB,
ADD COLUMN IF NOT EXISTS alternative_names TEXT[],
ADD COLUMN IF NOT EXISTS nearby_amenities TEXT[],
ADD COLUMN IF NOT EXISTS seasonality JSONB,
ADD COLUMN IF NOT EXISTS optimal_height_min DECIMAL(3,1), -- meters
ADD COLUMN IF NOT EXISTS optimal_height_max DECIMAL(3,1); -- meters

-- Update skill level constraint to include 'advanced'
ALTER TABLE spots DROP CONSTRAINT IF EXISTS spots_difficulty_level_check;
ALTER TABLE spots ADD CONSTRAINT spots_difficulty_level_check 
  CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Add constraints for new columns
ALTER TABLE spots ADD CONSTRAINT spots_wind_sensitivity_check 
  CHECK (wind_sensitivity >= 0 AND wind_sensitivity <= 1);
  
ALTER TABLE spots ADD CONSTRAINT spots_crowd_factor_check 
  CHECK (crowd_factor >= 0 AND crowd_factor <= 1);

ALTER TABLE spots ADD CONSTRAINT spots_swell_window_check 
  CHECK (swell_window_start >= 0 AND swell_window_start < 360 AND 
         swell_window_end >= 0 AND swell_window_end < 360);

ALTER TABLE spots ADD CONSTRAINT spots_orientation_check 
  CHECK (orientation >= 0 AND orientation < 360);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS spots_swell_window_idx ON spots(swell_window_start, swell_window_end);
CREATE INDEX IF NOT EXISTS spots_optimal_height_idx ON spots(optimal_height_min, optimal_height_max);
CREATE INDEX IF NOT EXISTS spots_difficulty_idx ON spots(difficulty_level);