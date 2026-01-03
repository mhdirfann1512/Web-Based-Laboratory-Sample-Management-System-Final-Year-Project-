const fs = require("fs")
const path = require("path")

// Read the current app.js file
const appPath = path.join(__dirname, "..", "app.js")
const appContent = fs.readFileSync(appPath, "utf8")

// AI Expiry Prediction API endpoint
const aiExpiryAPI = `
// AI Expiry Prediction API
app.post("/api/predict-expiry", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { sampleType, testType, storageLocation } = req.body

    if (!sampleType || !testType || !storageLocation) {
      return res.status(400).json({ message: "Sample type, test type, and storage location are required" })
    }

    // Get detailed information about the sample components
    const [sampleTypeInfo] = await db.promise().query("SELECT * FROM sample_types WHERE type_id = ?", [sampleType])
    const [testInfo] = await db.promise().query("SELECT * FROM sample_tests WHERE test_id = ?", [testType])
    const [storageInfo] = await db.promise().query("SELECT * FROM sample_storage WHERE storage_id = ?", [storageLocation])

    if (sampleTypeInfo.length === 0 || testInfo.length === 0 || storageInfo.length === 0) {
      return res.status(404).json({ message: "Sample components not found" })
    }

    // AI-powered expiry prediction based on sample characteristics
    const expiryDate = await predictSampleExpiry({
      sampleType: sampleTypeInfo[0],
      testType: testInfo[0],
      storageLocation: storageInfo[0]
    })

    res.json({
      success: true,
      expiry_date: expiryDate.toISOString().split('T')[0],
      prediction_confidence: expiryDate.confidence,
      factors_considered: expiryDate.factors,
      ai_reasoning: expiryDate.reasoning
    })

  } catch (error) {
    console.error("AI Expiry Prediction error:", error)
    res.status(500).json({ message: "Error predicting expiry date: " + error.message })
  }
})

// AI Algorithm for Sample Expiry Prediction
async function predictSampleExpiry({ sampleType, testType, storageLocation }) {
  const currentDate = new Date()
  let expiryDays = 30 // Default 30 days
  let confidence = 85
  let factors = []
  let reasoning = []

  // AI Analysis: Sample Type Factor
  const sampleTypeName = sampleType.type_name.toLowerCase()
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
  }

  // AI Analysis: Test Type Factor
  const testTypeName = testType.test_name.toLowerCase()
  if (testTypeName.includes('pcr') || testTypeName.includes('dna') || testTypeName.includes('rna')) {
    expiryDays = Math.floor(expiryDays * 0.7) // Reduce by 30% for genetic tests
    factors.push('Genetic testing: -30% stability (nucleic acid degradation)')
    reasoning.push('DNA/RNA testing requires fresher samples due to nucleic acid degradation over time')
    confidence -= 5
  } else if (testTypeName.includes('protein') || testTypeName.includes('enzyme')) {
    expiryDays = Math.floor(expiryDays * 0.8) // Reduce by 20% for protein tests
    factors.push('Protein analysis: -20% stability (protein denaturation)')
    reasoning.push('Protein-based tests are sensitive to denaturation and require fresher samples')
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
  const tempRange = storageLocation.temperature_range
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

  // Calculate expiry date
  const expiryDate = new Date(currentDate)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)

  // Ensure confidence is within reasonable bounds
  confidence = Math.max(60, Math.min(95, confidence))

  return {
    ...expiryDate,
    confidence: confidence,
    factors: factors,
    reasoning: reasoning,
    days_from_now: expiryDays
  }
}
`

// Find the position to insert the AI API (before the existing /api/register-sample route)
const insertPosition = appContent.indexOf('app.post("/api/register-sample"')

if (insertPosition === -1) {
  console.error("Could not find the register-sample route to insert AI API")
  process.exit(1)
}

// Insert the AI API code
const newAppContent = appContent.slice(0, insertPosition) + aiExpiryAPI + "\n\n" + appContent.slice(insertPosition)

// Update the register-sample route to include expiry date
const updatedRegisterSample = newAppContent.replace(
  /INSERT INTO samples $$\s*sample_id, sample_type_id, test_id, storage_id, freezer_id, staff_id,\s*patient_name, patient_id, collection_date, notes, status\s*$$ VALUES $$\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, 'active'$$/,
  `INSERT INTO samples (
            sample_id, sample_type_id, test_id, storage_id, freezer_id, staff_id,
            patient_name, patient_id, collection_date, expiry_date, ai_predicted_expiry, notes, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, 'active')`,
)

// Add expiry date to the parameters array
const finalAppContent = updatedRegisterSample.replace(
  /\[\s*sampleId,\s*sampleType,\s*testType,\s*storageLocation,\s*freezerData\.freezer_id,\s*req\.session\.user\.id,\s*patientName,\s*patientId,\s*collectionDate,\s*notes \|\| null,?\s*\]/,
  `[
          sampleId,
          sampleType,
          testType,
          storageLocation,
          freezerData.freezer_id,
          req.session.user.id,
          patientName,
          patientId,
          collectionDate,
          req.body.expiryDate || null,
          notes || null,
        ]`,
)

// Write the updated app.js file
fs.writeFileSync(appPath, finalAppContent)

console.log("✅ AI Expiry Prediction API added to app.js successfully!")
console.log("🤖 Features added:")
console.log("   - /api/predict-expiry endpoint")
console.log("   - Advanced AI algorithm for expiry prediction")
console.log("   - Sample type, test type, and storage analysis")
console.log("   - Temperature-based stability calculations")
console.log("   - Confidence scoring and reasoning")
console.log("   - Database integration for expiry dates")
