const fs = require("fs")
const path = require("path")

// Read the current app.js file
const appPath = path.join(__dirname, "..", "app.js")
let appContent = fs.readFileSync(appPath, "utf8")

console.log("🔧 Fixing AI Prediction API...")

// Check if AI prediction API already exists
if (appContent.includes("/api/predict-expiry")) {
  console.log("⚠️ AI prediction API already exists, removing old version...")

  // Remove the existing AI prediction code more carefully
  const lines = appContent.split("\n")
  let startIndex = -1
  let endIndex = -1
  let braceCount = 0
  let inAISection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.includes('app.post("/api/predict-expiry"') || line.includes("// AI Expiry Prediction API")) {
      startIndex = i
      inAISection = true
      braceCount = 0
    }

    if (inAISection) {
      // Count braces to find the end of the function
      const openBraces = (line.match(/{/g) || []).length
      const closeBraces = (line.match(/}/g) || []).length
      braceCount += openBraces - closeBraces

      // If we've closed all braces and we're past the function definition
      if (braceCount <= 0 && startIndex !== -1 && i > startIndex + 5) {
        endIndex = i
        break
      }
    }
  }

  if (startIndex !== -1 && endIndex !== -1) {
    const newLines = [...lines.slice(0, startIndex), ...lines.slice(endIndex + 1)]
    appContent = newLines.join("\n")
    console.log("✅ Removed old AI prediction API")
  }
}

// Fixed AI Expiry Prediction API
const fixedAiExpiryAPI = `
// AI Expiry Prediction API
app.post("/api/predict-expiry", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { sampleType, testType, storageLocation } = req.body

    console.log('🤖 AI Prediction Request:', { sampleType, testType, storageLocation })

    if (!sampleType || !testType || !storageLocation) {
      return res.status(400).json({ 
        message: "Sample type, test type, and storage location are required",
        success: false 
      })
    }

    // Get detailed information about the sample components
    const [sampleTypeInfo] = await db.promise().query("SELECT * FROM sample_types WHERE type_id = ?", [sampleType])
    const [testInfo] = await db.promise().query("SELECT * FROM sample_tests WHERE test_id = ?", [testType])
    const [storageInfo] = await db.promise().query("SELECT * FROM sample_storage WHERE storage_id = ?", [storageLocation])

    console.log('📊 Database Info Retrieved:', {
      sampleType: sampleTypeInfo[0]?.type_name || 'Not found',
      testType: testInfo[0]?.test_name || 'Not found',
      storage: storageInfo[0]?.storage_name || 'Not found'
    })

    if (sampleTypeInfo.length === 0 || testInfo.length === 0 || storageInfo.length === 0) {
      return res.status(404).json({ 
        message: "Sample components not found in database",
        success: false 
      })
    }

    // AI-powered expiry prediction
    const prediction = predictSampleExpiry({
      sampleType: sampleTypeInfo[0],
      testType: testInfo[0],
      storageLocation: storageInfo[0]
    })

    console.log('✅ AI Prediction Generated:', prediction)

    res.json({
      success: true,
      expiry_date: prediction.expiry_date,
      prediction_confidence: prediction.confidence,
      factors_considered: prediction.factors,
      ai_reasoning: prediction.reasoning,
      days_from_now: prediction.days_from_now
    })

  } catch (error) {
    console.error("❌ AI Expiry Prediction error:", error)
    res.status(500).json({ 
      message: "AI prediction service temporarily unavailable: " + error.message,
      success: false
    })
  }
})

// AI Algorithm for Sample Expiry Prediction
function predictSampleExpiry({ sampleType, testType, storageLocation }) {
  const currentDate = new Date()
  let expiryDays = 30 // Default 30 days
  let confidence = 85
  let factors = []
  let reasoning = []

  console.log('🧠 AI Analysis Starting for:', {
    sample: sampleType.type_name,
    test: testType.test_name,
    storage: storageLocation.storage_name
  })

  // AI Analysis: Sample Type Factor
  const sampleTypeName = sampleType.type_name.toLowerCase()
  console.log('🔬 Analyzing sample type:', sampleTypeName)
  
  if (sampleTypeName.includes('blood')) {
    expiryDays = 180 // 6 months for blood
    factors.push('Blood samples: 6 months base stability')
    reasoning.push('Blood samples maintain cellular integrity for extended periods when properly stored')
  } else if (sampleTypeName.includes('tissue')) {
    expiryDays = 730 // 2 years for tissue
    factors.push('Tissue samples: 2 years base stability')
    reasoning.push('Tissue samples have excellent long-term preservation characteristics')
  } else if (sampleTypeName.includes('urine')) {
    expiryDays = 7 // 1 week for urine
    factors.push('Urine samples: 1 week base stability')
    reasoning.push('Urine samples degrade rapidly due to bacterial growth and chemical changes')
  } else if (sampleTypeName.includes('serum') || sampleTypeName.includes('plasma')) {
    expiryDays = 365 // 1 year for serum/plasma
    factors.push('Serum/Plasma: 1 year base stability')
    reasoning.push('Processed blood products have enhanced stability profiles')
  } else if (sampleTypeName.includes('saliva')) {
    expiryDays = 30 // 1 month for saliva
    factors.push('Saliva samples: 1 month base stability')
    reasoning.push('Saliva contains enzymes that can degrade samples over time')
  } else if (sampleTypeName.includes('csf')) {
    expiryDays = 90 // 3 months for CSF
    factors.push('CSF samples: 3 months base stability')
    reasoning.push('Cerebrospinal fluid requires careful preservation due to protein content')
  } else if (sampleTypeName.includes('biopsy')) {
    expiryDays = 1095 // 3 years for biopsy
    factors.push('Biopsy samples: 3 years base stability')
    reasoning.push('Fixed biopsy samples have exceptional long-term stability')
  } else {
    // Default for other sample types
    expiryDays = 90 // 3 months default
    factors.push('Standard sample: 3 months base stability')
    reasoning.push('Standard preservation protocols applied')
  }

  // AI Analysis: Test Type Factor
  const testTypeName = testType.test_name.toLowerCase()
  console.log('🧪 Analyzing test type:', testTypeName)
  
  if (testTypeName.includes('pcr') || testTypeName.includes('dna') || testTypeName.includes('rna')) {
    expiryDays = Math.floor(expiryDays * 0.7) // Reduce by 30% for genetic tests
    factors.push('Genetic testing: -30% stability (nucleic acid degradation)')
    reasoning.push('DNA/RNA testing requires fresher samples due to nucleic acid degradation')
    confidence -= 5
  } else if (testTypeName.includes('protein') || testTypeName.includes('enzyme')) {
    expiryDays = Math.floor(expiryDays * 0.8) // Reduce by 20% for protein tests
    factors.push('Protein analysis: -20% stability (protein denaturation)')
    reasoning.push('Protein-based tests are sensitive to denaturation')
    confidence -= 3
  } else if (testTypeName.includes('histology') || testTypeName.includes('pathology')) {
    expiryDays = Math.floor(expiryDays * 1.2) // Increase by 20% for histology
    factors.push('Histological analysis: +20% stability (fixed samples)')
    reasoning.push('Histological samples are typically fixed, providing enhanced stability')
    confidence += 5
  } else if (testTypeName.includes('culture') || testTypeName.includes('microbiology')) {
    expiryDays = Math.floor(expiryDays * 0.5) // Reduce by 50% for culture tests
    factors.push('Microbiology testing: -50% stability (viable organism requirement)')
    reasoning.push('Culture tests require viable organisms, significantly reducing storage time')
    confidence -= 10
  } else if (testTypeName.includes('chemistry') || testTypeName.includes('biochemistry')) {
    expiryDays = Math.floor(expiryDays * 0.9) // Reduce by 10% for chemistry
    factors.push('Chemical analysis: -10% stability (chemical degradation)')
    reasoning.push('Chemical tests may be affected by gradual compound degradation')
    confidence -= 2
  }

  // AI Analysis: Storage Temperature Factor
  const tempRange = storageLocation.temperature_range || ''
  console.log('🌡️ Analyzing storage temperature:', tempRange)
  
  if (tempRange) {
    const temp = tempRange.toLowerCase()
    if (temp.includes('-196') || temp.includes('liquid nitrogen')) {
      expiryDays = Math.floor(expiryDays * 3) // Triple for liquid nitrogen
      factors.push('Liquid nitrogen storage: +200% stability (cryogenic preservation)')
      reasoning.push('Cryogenic storage at -196°C provides exceptional long-term preservation')
      confidence += 15
    } else if (temp.includes('-80') || temp.includes('-86')) {
      expiryDays = Math.floor(expiryDays * 2) // Double for ultra-low
      factors.push('Ultra-low temperature: +100% stability (-80°C preservation)')
      reasoning.push('Ultra-low temperature storage significantly extends sample viability')
      confidence += 10
    } else if (temp.includes('-20')) {
      expiryDays = Math.floor(expiryDays * 1.5) // 50% increase for -20°C
      factors.push('Freezer storage: +50% stability (-20°C preservation)')
      reasoning.push('Standard freezer storage provides good preservation for most samples')
      confidence += 5
    } else if (temp.includes('2') && temp.includes('8')) {
      expiryDays = Math.floor(expiryDays * 0.8) // 20% decrease for refrigeration
      factors.push('Refrigerated storage: -20% stability (4°C storage)')
      reasoning.push('Refrigerated storage slows but does not stop degradation processes')
      confidence -= 5
    } else if (temp.includes('room') || temp.includes('ambient')) {
      expiryDays = Math.floor(expiryDays * 0.3) // 70% decrease for room temp
      factors.push('Room temperature: -70% stability (ambient storage)')
      reasoning.push('Room temperature storage significantly accelerates sample degradation')
      confidence -= 20
    }
  }

  // AI Safety Factor: Add buffer for safety
  expiryDays = Math.floor(expiryDays * 0.9) // 10% safety buffer
  factors.push('AI safety buffer: -10% (conservative estimate)')
  reasoning.push('AI applies conservative safety margin to ensure sample quality')

  // Ensure minimum 1 day expiry
  expiryDays = Math.max(1, expiryDays)

  // Calculate expiry date
  const expiryDate = new Date(currentDate)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)

  // Ensure confidence is within reasonable bounds
  confidence = Math.max(60, Math.min(95, confidence))

  const result = {
    expiry_date: expiryDate.toISOString().split('T')[0],
    confidence: confidence,
    factors: factors,
    reasoning: reasoning,
    days_from_now: expiryDays
  }

  console.log('🎯 AI Prediction Complete:', result)
  return result
}
`

// Find the position to insert the AI API (before the register-sample route)
const insertPosition = appContent.indexOf('app.post("/api/register-sample"')

if (insertPosition === -1) {
  console.error("❌ Could not find the register-sample route to insert AI API")
  console.log("Looking for alternative insertion points...")

  // Try alternative insertion points
  const altPositions = [
    'app.get("/api/generate-sample-id"',
    'app.get("/api/assign-freezer"',
    'app.get("/api/sample-storage"',
  ]

  let foundPosition = -1
  for (const altPos of altPositions) {
    const pos = appContent.indexOf(altPos)
    if (pos !== -1) {
      foundPosition = pos
      console.log("✅ Found alternative insertion point:", altPos)
      break
    }
  }

  if (foundPosition === -1) {
    console.error("❌ Could not find any suitable insertion point")
    process.exit(1)
  }

  // Insert before the found position
  const newAppContent = appContent.slice(0, foundPosition) + fixedAiExpiryAPI + "\n" + appContent.slice(foundPosition)
  fs.writeFileSync(appPath, newAppContent)
} else {
  // Insert the fixed AI API code
  const newAppContent = appContent.slice(0, insertPosition) + fixedAiExpiryAPI + "\n" + appContent.slice(insertPosition)
  fs.writeFileSync(appPath, newAppContent)
}

console.log("✅ AI Prediction API added successfully!")
console.log("🤖 Features added:")
console.log("   - Intelligent expiry date prediction")
console.log("   - Confidence scoring")
console.log("   - Detailed reasoning")
console.log("   - Temperature-based adjustments")
console.log("   - Test-type specific calculations")

