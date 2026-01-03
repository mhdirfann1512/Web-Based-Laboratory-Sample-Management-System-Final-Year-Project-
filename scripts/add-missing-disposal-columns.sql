-- Add disposal tracking columns if they don't exist
ALTER TABLE samples 
ADD COLUMN IF NOT EXISTS disposal_reason VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS disposal_notes TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS disposed_by INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS disposal_date DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add foreign key constraint for disposed_by if it doesn't exist
-- (This will fail silently if the constraint already exists)
ALTER TABLE samples 
ADD CONSTRAINT fk_samples_disposed_by 
FOREIGN KEY (disposed_by) REFERENCES staff(staff_id) 
ON DELETE SET NULL;
