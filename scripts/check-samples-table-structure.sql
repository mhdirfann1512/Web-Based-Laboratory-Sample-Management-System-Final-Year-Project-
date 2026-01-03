-- Check the current structure of the samples table
DESCRIBE samples;

-- Also check if we have any sample data
SELECT COUNT(*) as total_samples FROM samples;

-- Check what columns exist
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'samples' 
AND TABLE_SCHEMA = DATABASE();
