-- Add disposal tracking columns to samples table
ALTER TABLE samples 
ADD COLUMN disposal_reason VARCHAR(100) NULL,
ADD COLUMN disposal_notes TEXT NULL,
ADD COLUMN disposed_by INT NULL,
ADD COLUMN disposal_date TIMESTAMP NULL,
ADD INDEX idx_disposed_by (disposed_by),
ADD INDEX idx_disposal_date (disposal_date);

-- Add foreign key constraint for disposed_by
ALTER TABLE samples 
ADD CONSTRAINT fk_samples_disposed_by 
FOREIGN KEY (disposed_by) REFERENCES staff(staff_id) 
ON DELETE SET NULL;

SELECT 'Disposal tracking columns added successfully' as result;
