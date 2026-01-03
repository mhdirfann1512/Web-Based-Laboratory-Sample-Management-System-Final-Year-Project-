// routes/predictExpiry.js
/**const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/predict-expiry', async (req, res) => {
  const { sampleType, testType, storageLocation } = req.body;

  try {
    const prompt = `
You are a helpful lab AI. Based on the sample type, test type, and storage condition, estimate how many days this sample remains usable before it expires.

Sample Type: ${sampleType}
Test Type: ${testType}
Storage Condition: ${storageLocation}

Respond in this JSON format:
{
  "expiry_date": "YYYY-MM-DD",
  "days_from_now": X,
  "confidence": "High/Medium/Low",
  "reasoning": ["point 1", "point 2"]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Or use "gpt-3.5-turbo" for cheaper access
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const aiMessage = response.choices[0].message.content;
    const result = JSON.parse(aiMessage);
    res.json({ success: true, result });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ success: false, message: 'Prediction failed' });
  }
});

module.exports = router;**/
