const fs = require("fs")
const path = require("path")

function fixApiSamplesRoute() {
  console.log("🔧 Fixing /api/samples route in app.js...\n")

  const appPath = path.join(__dirname, "..", "app.js")

  if (!fs.existsSync(appPath)) {
    console.error("❌ app.js file not found!")
    return
  }

  const appContent = fs.readFileSync(appPath, "utf8")

  // Check if the route already exists
  if (appContent.includes('app.get("/api/samples"') && !appContent.includes('app.get("/api/samples/:sampleId"')) {
    console.log("✅ /api/samples route already exists")
  } else {
    console.log("🔍 Looking for where to add the /api/samples route...")

    // Find the right place to add the route - after the register-sample route
    const registerSampleIndex = appContent.indexOf('app.post("/api/register-sample"')

    if (registerSampleIndex === -1) {
      console.log("❌ Could not find register-sample route as reference point")
      return
    }

    // Find the end of the register-sample route
    let insertIndex = registerSampleIndex
    let braceCount = 0
    let inRoute = false

    for (let i = registerSampleIndex; i < appContent.length; i++) {
      if (appContent[i] === "{") {
        braceCount++
        inRoute = true
      } else if (appContent[i] === "}") {
        braceCount--
        if (inRoute && braceCount === 0) {
          insertIndex = i + 1
          break
        }
      }
    }

    // Add the API samples routes
    const apiRoutesToAdd = `

// API endpoint to get all samples (with filtering for staff vs admin)
app.get("/api/samples", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    console.log("📊 Fetching samples for user:", req.session.user.username, "Type:", req.session.user.type)
    
    let query = \`
      SELECT 
        s.*,
        st.type_name as sample_type_name,
        test.test_name,
        storage.storage_name,
        f.freezer_name,
        staff.full_name as staff_name
      FROM samples s
      LEFT JOIN sample_types st ON s.sample_type_id = st.type_id
      LEFT JOIN sample_tests test ON s.test_id = test.test_id
      LEFT JOIN sample_storage storage ON s.storage_id = storage.storage_id
      LEFT JOIN freezer f ON s.freezer_id = f.freezer_id
      LEFT JOIN staff ON s.staff_id = staff.staff_id
    \`

    const params = []

    // If user is staff, only show their samples
    if (req.session.user.type === "staff") {
      query += " WHERE s.staff_id = ?"
      params.push(req.session.user.id)
      console.log("👤 Filtering samples for staff ID:", req.session.user.id)
    } else {
      console.log("👑 Admin user - showing all samples")
    }

    query += " ORDER BY s.registration_date DESC"

    console.log("🔍 Executing query:", query)
    console.log("📝 With params:", params)

    const [samples] = await db.promise().query(query, params)
    
    console.log("✅ Found", samples.length, "samples")
    console.log("📋 Sample data:", samples.map(s => ({ id: s.sample_id, patient: s.patient_name, type: s.sample_type_name })))
    
    res.json(samples)
  } catch (error) {
    console.error("❌ Error fetching samples:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// API endpoint to get a specific sample by ID
app.get("/api/samples/:sampleId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { sampleId } = req.params

    let query = \`
      SELECT 
        s.*,
        st.type_name as sample_type_name,
        test.test_name,
        storage.storage_name,
        f.freezer_name,
        staff.full_name as staff_name
      FROM samples s
      LEFT JOIN sample_types st ON s.sample_type_id = st.type_id
      LEFT JOIN sample_tests test ON s.test_id = test.test_id
      LEFT JOIN sample_storage storage ON s.storage_id = storage.storage_id
      LEFT JOIN freezer f ON s.freezer_id = f.freezer_id
      LEFT JOIN staff ON s.staff_id = staff.staff_id
      WHERE s.sample_id = ?
    \`

    const params = [sampleId]

    // If user is staff, only allow viewing their own samples
    if (req.session.user.type === "staff") {
      query += " AND s.staff_id = ?"
      params.push(req.session.user.id)
    }

    const [samples] = await db.promise().query(query, params)

    if (samples.length === 0) {
      return res.status(404).json({ message: "Sample not found" })
    }

    res.json(samples[0])
  } catch (error) {
    console.error("Error fetching sample:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// API endpoint to dispose a sample
app.post("/api/samples/:sampleId/dispose", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { sampleId } = req.params

    // Check if sample exists and user has permission
    let checkQuery = "SELECT * FROM samples WHERE sample_id = ?"
    const checkParams = [sampleId]

    if (req.session.user.type === "staff") {
      checkQuery += " AND staff_id = ?"
      checkParams.push(req.session.user.id)
    }

    const [existingSamples] = await db.promise().query(checkQuery, checkParams)

    if (existingSamples.length === 0) {
      return res.status(404).json({ message: "Sample not found or access denied" })
    }

    const sample = existingSamples[0]

    if (sample.status !== "active") {
      return res.status(400).json({ message: "Sample is not active and cannot be disposed" })
    }

    // Update sample status to disposed
    await db
      .promise()
      .query("UPDATE samples SET status = 'disposed', updated_at = NOW() WHERE sample_id = ?", [sampleId])

    res.json({ message: "Sample disposed successfully" })
  } catch (error) {
    console.error("Error disposing sample:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// API endpoint to get staff members (admin only)
app.get("/api/admin/staff-members", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const [staff] = await db
      .promise()
      .query("SELECT staff_id, full_name, username, email, department FROM staff ORDER BY full_name")
    res.json(staff)
  } catch (error) {
    console.error("Error fetching staff members:", error)
    res.status(500).json({ message: "Server error" })
  }
})
`

    // Insert the routes
    const newContent = appContent.slice(0, insertIndex) + apiRoutesToAdd + appContent.slice(insertIndex)

    // Remove any duplicate routes that might exist at the end
    const cleanedContent = newContent.replace(
      /\/\/ Add these API endpoints after the existing sample registration endpoints[\s\S]*?app\.get\("\/view-samples"/g,
      'app.get("/view-samples"',
    )

    fs.writeFileSync(appPath, cleanedContent)
    console.log("✅ Added /api/samples routes to app.js")
  }

  console.log("\n📋 Next steps:")
  console.log("1. Restart your server: npm start")
  console.log("2. Login to your application")
  console.log("3. Visit: http://localhost:3000/test-samples")
  console.log("4. Check server console for detailed logs")
}

fixApiSamplesRoute()
