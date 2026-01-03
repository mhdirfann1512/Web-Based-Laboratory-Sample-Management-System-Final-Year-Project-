const fs = require("fs")
const path = require("path")

function createSimpleTestPage() {
  console.log("🔧 Creating simple test page for debugging...\n")

  const testPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Samples API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .sample { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
        .error { color: red; }
        .success { color: green; }
        .loading { color: blue; }
    </style>
</head>
<body>
    <h1>Test Samples API</h1>
    <div id="status" class="loading">Loading...</div>
    <div id="results"></div>

    <script>
        async function testAPI() {
            const statusDiv = document.getElementById('status')
            const resultsDiv = document.getElementById('results')
            
            try {
                console.log('Testing API...')
                statusDiv.textContent = 'Testing API connection...'
                
                // Test 1: Check if we're logged in
                const profileResponse = await fetch('/api/profile')
                console.log('Profile response status:', profileResponse.status)
                
                if (!profileResponse.ok) {
                    statusDiv.innerHTML = '<span class="error">❌ Not logged in. Please <a href="/login">login</a> first.</span>'
                    return
                }
                
                const profile = await profileResponse.json()
                console.log('User profile:', profile)
                statusDiv.innerHTML = '<span class="success">✅ Logged in as: ' + profile.full_name + '</span>'
                
                // Test 2: Fetch samples
                statusDiv.innerHTML += '<br>Fetching samples...'
                const samplesResponse = await fetch('/api/samples')
                console.log('Samples response status:', samplesResponse.status)
                
                if (!samplesResponse.ok) {
                    throw new Error('Failed to fetch samples: ' + samplesResponse.status)
                }
                
                const samples = await samplesResponse.json()
                console.log('Samples data:', samples)
                
                statusDiv.innerHTML += '<br><span class="success">✅ Found ' + samples.length + ' samples</span>'
                
                // Display samples
                if (samples.length === 0) {
                    resultsDiv.innerHTML = '<p>No samples found in database.</p>'
                } else {
                    let html = '<h2>Samples:</h2>'
                    samples.forEach(sample => {
                        html += '<div class="sample">'
                        html += '<strong>ID:</strong> ' + sample.sample_id + '<br>'
                        html += '<strong>Patient:</strong> ' + sample.patient_name + '<br>'
                        html += '<strong>Type:</strong> ' + (sample.sample_type_name || 'N/A') + '<br>'
                        html += '<strong>Test:</strong> ' + (sample.test_name || 'N/A') + '<br>'
                        html += '<strong>Status:</strong> ' + sample.status + '<br>'
                        html += '<strong>Date:</strong> ' + new Date(sample.registration_date).toLocaleDateString() + '<br>'
                        html += '</div>'
                    })
                    resultsDiv.innerHTML = html
                }
                
            } catch (error) {
                console.error('Error:', error)
                statusDiv.innerHTML = '<span class="error">❌ Error: ' + error.message + '</span>'
                resultsDiv.innerHTML = '<p>Check browser console for details.</p>'
            }
        }
        
        // Run test when page loads
        document.addEventListener('DOMContentLoaded', testAPI)
    </script>
</body>
</html>`

  const testPagePath = path.join(__dirname, "../public/html/test-samples.html")
  fs.writeFileSync(testPagePath, testPageContent)

  console.log("✅ Created test page at: /test-samples")
  console.log("\n📋 To test:")
  console.log("1. Make sure your server is running: npm start")
  console.log("2. Login to your application")
  console.log("3. Visit: http://localhost:3000/test-samples")
  console.log("4. Check browser console for detailed logs")
}

createSimpleTestPage()
