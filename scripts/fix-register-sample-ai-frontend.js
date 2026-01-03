const fs = require("fs")
const path = require("path")

// Read the current register-sample.html file
const htmlPath = path.join(__dirname, "..", "public", "html", "register-sample.html")
let htmlContent = fs.readFileSync(htmlPath, "utf8")

// Check if AI section already exists
if (htmlContent.includes("AI Predicted Expiry Date")) {
  console.log("AI section already exists, updating it...")
} else {
  console.log("Adding AI section to register sample page...")
}

// Remove existing AI section if it exists
const aiSectionStart = htmlContent.indexOf("🤖 AI Predicted Expiry Date")
const aiSectionEnd = htmlContent.indexOf('<div class="submit-section">')

if (aiSectionStart !== -1 && aiSectionEnd !== -1) {
  // Find the start of the form-group containing the AI section
  const formGroupStart = htmlContent.lastIndexOf('<div class="form-group">', aiSectionStart)
  htmlContent = htmlContent.slice(0, formGroupStart) + htmlContent.slice(aiSectionEnd)
}

// Add the fixed AI section
const fixedAiSection = `
                <div class="form-group">
                    <label>🤖 AI Predicted Expiry Date</label>
                    <div id="aiExpiryDate" class="auto-field">
                        <i class="fas fa-brain"></i> AI will predict expiry date based on your selections
                    </div>
                    <div id="aiConfidence" style="display: none; margin-top: 0.5rem; font-size: 0.9rem; color: #28a745;">
                        <i class="fas fa-chart-line"></i> <span id="confidenceText"></span>
                    </div>
                    <div id="aiReasoning" style="display: none; margin-top: 0.5rem; padding: 0.75rem; background: #f8f9fa; border-radius: 4px; font-size: 0.85rem; color: #495057;">
                        <strong><i class="fas fa-lightbulb"></i> AI Analysis:</strong>
                        <ul id="reasoningList" style="margin: 0.5rem 0 0 1rem; padding: 0;"></ul>
                    </div>
                </div>

                `

// Insert the AI section before the submit section
htmlContent = htmlContent.replace('<div class="submit-section">', fixedAiSection + '<div class="submit-section">')

// Add/Update the AI JavaScript functions
const aiJavaScriptFunctions = `
        let currentExpiryPrediction = null;

        // AI Expiry Prediction Function
        async function predictExpiryDate() {
            const sampleType = document.getElementById('sampleType').value;
            const testType = document.getElementById('testType').value;
            const storageLocation = document.getElementById('storageLocation').value;
            
            console.log('🤖 AI Prediction Request:', { sampleType, testType, storageLocation });
            
            if (!sampleType || !testType || !storageLocation) {
                clearAIExpiryPrediction();
                return;
            }
            
            try {
                document.getElementById('aiExpiryDate').innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI is analyzing sample characteristics...';
                
                const response = await fetch('/api/predict-expiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sampleType: sampleType,
                        testType: testType,
                        storageLocation: storageLocation
                    })
                });
                
                console.log('📡 AI Response status:', response.status);
                const prediction = await response.json();
                console.log('📊 AI Response data:', prediction);
                
                if (response.ok && prediction.success) {
                    currentExpiryPrediction = prediction;
                    displayAIExpiryPrediction(prediction);
                } else {
                    throw new Error(prediction.message || 'AI prediction failed');
                }
            } catch (error) {
                console.error('❌ AI Expiry Prediction error:', error);
                document.getElementById('aiExpiryDate').innerHTML = 
                    '<i class="fas fa-exclamation-triangle" style="color: #dc3545;"></i> AI prediction error: ' + error.message;
                document.getElementById('aiConfidence').style.display = 'none';
                document.getElementById('aiReasoning').style.display = 'none';
            }
        }

        function displayAIExpiryPrediction(prediction) {
            console.log('🎯 Displaying AI prediction:', prediction);
            
            // Format the expiry date nicely
            const expiryDate = new Date(prediction.expiry_date);
            const formattedDate = expiryDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Calculate days from now
            const today = new Date();
            const timeDiff = expiryDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            // Update expiry date display
            document.getElementById('aiExpiryDate').innerHTML = 
                '<i class="fas fa-calendar-alt" style="color: #28a745;"></i> <strong>' + formattedDate + '</strong> <span style="color: #6c757d;">(' + daysDiff + ' days from now)</span>';
            
            // Show confidence
            const confidenceColor = prediction.prediction_confidence >= 85 ? '#28a745' : 
                                   prediction.prediction_confidence >= 70 ? '#ffc107' : '#dc3545';
            document.getElementById('confidenceText').innerHTML = 
                '<strong style="color: ' + confidenceColor + ';">' + prediction.prediction_confidence + '% confidence</strong>';
            document.getElementById('aiConfidence').style.display = 'block';
            
            // Show AI reasoning
            const reasoningList = document.getElementById('reasoningList');
            reasoningList.innerHTML = '';
            if (prediction.factors_considered && prediction.factors_considered.length > 0) {
                prediction.factors_considered.forEach(factor => {
                    const li = document.createElement('li');
                    li.textContent = factor;
                    li.style.marginBottom = '0.25rem';
                    reasoningList.appendChild(li);
                });
                document.getElementById('aiReasoning').style.display = 'block';
            }
        }

        function clearAIExpiryPrediction() {
            document.getElementById('aiExpiryDate').innerHTML = '<i class="fas fa-brain"></i> AI will predict expiry date based on your selections';
            document.getElementById('aiConfidence').style.display = 'none';
            document.getElementById('aiReasoning').style.display = 'none';
            currentExpiryPrediction = null;
        }
`

// Remove existing AI functions if they exist
const existingAIStart = htmlContent.indexOf("let currentExpiryPrediction = null;")
const existingAIEnd = htmlContent.indexOf("function clearAIExpiryPrediction() {")
if (existingAIStart !== -1 && existingAIEnd !== -1) {
  const endOfFunction = htmlContent.indexOf("}", existingAIEnd + htmlContent.slice(existingAIEnd).indexOf("}")) + 1
  htmlContent = htmlContent.slice(0, existingAIStart) + htmlContent.slice(endOfFunction)
}

// Add the AI functions before the form submission handler
const formSubmissionStart = htmlContent.indexOf(
  "document.getElementById('sampleRegistrationForm').addEventListener('submit'",
)
if (formSubmissionStart !== -1) {
  htmlContent =
    htmlContent.slice(0, formSubmissionStart) +
    aiJavaScriptFunctions +
    "\n\n        // " +
    htmlContent.slice(formSubmissionStart)
}

// Update the storage location change handler to trigger AI prediction
if (!htmlContent.includes("await predictExpiryDate();")) {
  htmlContent = htmlContent.replace(
    "await generateSampleIdPreview();",
    `await generateSampleIdPreview();
                        
                        // 🤖 Trigger AI expiry prediction
                        await predictExpiryDate();`,
  )
}

// Update form submission to include AI predicted expiry date
if (!htmlContent.includes("expiryDate: currentExpiryPrediction")) {
  htmlContent = htmlContent.replace(
    "const sampleData = {",
    `const sampleData = {
                        expiryDate: currentExpiryPrediction ? currentExpiryPrediction.expiry_date : null,
                        predictionConfidence: currentExpiryPrediction ? currentExpiryPrediction.prediction_confidence : null,`,
  )
}

// Write the updated HTML file
fs.writeFileSync(htmlPath, htmlContent)

console.log("✅ Register Sample page AI frontend fixed!")
console.log("🤖 Fixed issues:")
console.log("   - Improved error handling")
console.log("   - Added detailed logging")
console.log("   - Fixed API response handling")
console.log("   - Enhanced user feedback")
console.log("   - Fixed form integration")
