
ALTER TABLE samples 
ADD COLUMN expiry_date DATE NULL,
ADD COLUMN ai_predicted_expiry BOOLEAN DEFAULT FALSE,
ADD COLUMN prediction_confidence INT DEFAULT NULL,
ADD COLUMN prediction_factors TEXT NULL;


CREATE INDEX idx_samples_expiry_date ON samples(expiry_date);


CREATE INDEX idx_samples_ai_predicted ON samples(ai_predicted_expiry);

SELECT 'Expiry date columns added successfully!' as result;
