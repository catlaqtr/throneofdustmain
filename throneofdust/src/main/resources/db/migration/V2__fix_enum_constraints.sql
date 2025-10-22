-- Fix enum constraints to match actual enum values

-- Drop existing constraints
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_status_check;
ALTER TABLE raids DROP CONSTRAINT IF EXISTS raids_status_check;

-- Add correct constraints
ALTER TABLE characters ADD CONSTRAINT characters_status_check 
CHECK (status IN ('IDLE', 'ON_RAID', 'DEAD'));

ALTER TABLE raids ADD CONSTRAINT raids_status_check 
CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'RESOLVED'));
