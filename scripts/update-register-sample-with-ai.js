const fs = require("fs")
const path = require("path")

// Read the current register-sample.html file
const htmlPath = path.join(__dirname, "..", "public", "html", "register-sample.html")
let htmlContent = fs.readFileSync(htmlPath, "utf8")

// Add AI Expiry Prediction section to the form
const aiExpirySection = `
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
                </div>`

// Insert the AI section before the submit section
htmlContent = htmlContent.replace(
  '<div class="submit-section">',
  aiExpirySection + '\n\n                <div class="submit-section">',
)

// Add AI prediction JavaScript
const aiJavaScript = `
        let currentExpiryPrediction = null;

        // AI Expiry Prediction Function
        async function predictExpiryDate() {
            const sampleType = document.getElementById('sampleType').value;
            const testType = document.getElementById('testType').value;
            const storageLocation = document.getElementById('storageLocation').value;
            
            if (!sampleType || !testType || !storageLocation) {
                clearAIExpiryPrediction();
                return;
            }
            
            try {
                console.log('🤖 Requesting AI expiry prediction...');
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
                
                if (response.ok) {
                    const prediction = await response.json();
                    console.log('✅ AI Prediction received:', prediction);
                    
                    currentExpiryPrediction = prediction;
                    displayAIExpiryPrediction(prediction);
                } else {
                    throw new Error('AI prediction failed');
                }
            } catch (error) {
                console.error('❌ AI Expiry Prediction error:', error);
                document.getElementById('aiExpiryDate').innerHTML = '<i class="fas fa-exclamation-triangle"></i> AI prediction temporarily unavailable';
            }
        }

        function displayAIExpiryPrediction(prediction) {
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
            prediction.factors_considered.forEach(factor => {
                const li = document.createElement('li');
                li.textContent = factor;
                li.style.marginBottom = '0.25rem';
                reasoningList.appendChild(li);
            });
            document.getElementById('aiReasoning').style.display = 'block';
        }

        function clearAIExpiryPrediction() {
            document.getElementById('aiExpiryDate').innerHTML = '<i class="fas fa-brain"></i> AI will predict expiry date based on your selections';
            document.getElementById('aiConfidence').style.display = 'none';
            document.getElementById('aiReasoning').style.display = 'none';
            currentExpiryPrediction = null;
        }

        // Update the storage location change handler to trigger AI prediction
        const originalStorageHandler = document.getElementById('storageLocation').onchange;
`

// Insert AI JavaScript before the existing storage location handler
const storageHandlerPosition = htmlContent.indexOf(
  "document.getElementById('storageLocation').addEventListener('change'",
)
if (storageHandlerPosition !== -1) {
  // Add AI prediction call to storage location change handler
  htmlContent = htmlContent.replace(
    "// Generate sample ID preview\n                        await generateSampleIdPreview();",
    `// Generate sample ID preview
                        await generateSampleIdPreview();
                        
                        // 🤖 Trigger AI expiry prediction
                        await predictExpiryDate();`,
  )
}

// Add AI JavaScript functions before the closing script tag
const scriptEndPosition = htmlContent.lastIndexOf("</script>")
htmlContent =
  htmlContent.slice(0, scriptEndPosition) + "\n" + aiJavaScript + "\n" + htmlContent.slice(scriptEndPosition)

// Update form submission to include AI predicted expiry date
htmlContent = htmlContent.replace(
  "const sampleData = {",
  `const sampleData = {
                        expiryDate: currentExpiryPrediction ? currentExpiryPrediction.expiry_date : null,`,
)

// Add AI styling
const aiStyles = `
        .ai-prediction {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
        }
        
        .ai-confidence-high { color: #28a745 !important; }
        .ai-confidence-medium { color: #ffc107 !important; }
        .ai-confidence-low { color: #dc3545 !important; }
        
        .ai-reasoning {
            background: rgba(102, 126, 234, 0.1);
            border-left: 4px solid #667eea;
        }
        
        #aiExpiryDate {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
            border: 2px solid #667eea;
            color: #495057;
            font-weight: 500;
        }
`

// Insert AI styles
htmlContent = htmlContent.replace("</style>", aiStyles + "\n    </style>")

// Write the updated HTML file
fs.writeFileSync(htmlPath, htmlContent)

console.log("✅ Register Sample page updated with AI features!")
console.log("🤖 AI Features added:")
console.log("   - Real-time expiry date prediction")
console.log("   - Confidence scoring display")
console.log("   - AI reasoning explanation")
console.log("   - Visual feedback and styling")
console.log("   - Automatic prediction on selection change")
console.log("   - Integration with form submission")
