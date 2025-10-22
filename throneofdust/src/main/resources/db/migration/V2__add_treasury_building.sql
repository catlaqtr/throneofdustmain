-- Add TREASURY building type to the buildings_type_check constraint
-- First, drop the existing constraint if it exists
ALTER TABLE buildings DROP CONSTRAINT IF EXISTS buildings_type_check;

-- Add the new constraint that includes TREASURY
ALTER TABLE buildings ADD CONSTRAINT buildings_type_check 
CHECK (type IN ('LUMBER_MILL', 'QUARRY', 'MINE', 'TREASURY', 'STOREHOUSE', 'TOWN_HALL', 'TRAINING_YARD', 'RADAR'));
