const mysql = require("mysql2/promise")
const fetch = require("node-fetch")
require("dotenv").config()

async function debugViewSamplesPage() {
  console.log("🔍 Debugging view-samples page...\n")

  // Test 1: Check database connection and data
  console.log("1️⃣ Testing database connection and sample data...")
  let connection
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    const [samples] = await connection.execute("SELECT * FROM samples")
    console.log(`✅ Database connected. Found ${samples.length} samples in database`)

    if (samples.length > 0) {
      console.log("📋 Sample data:")
      samples.forEach((sample, index) => {
        console.log(`   ${index + 1}. ${sample.sample_id} - ${sample.patient_name} (${sample.status})`)
      })
    }
  } catch (error) {
    console.error("❌ Database error:", error.message)
    return
  } finally {
    if (connection) await connection.end()
  }

  // Test 2: Check if server is running
  console.log("\n2️⃣ Testing server connection...")
  try {
    const response = await fetch("http://localhost:3000/")
    if (response.ok) {
      console.log("✅ Server is running on port 3000")
    } else {
      console.log(`❌ Server responded with status: ${response.status}`)
    }
  } catch (error) {
    console.error("❌ Cannot connect to server:", error.message)
    console.log("💡 Make sure to run 'npm start' first")
    return
  }

  // Test 3: Check view-samples route
  console.log("\n3️⃣ Testing view-samples route...")
  try {
    const response = await fetch("http://localhost:3000/view-samples")
    console.log(`📄 /view-samples status: ${response.status}`)

    if (response.status === 302) {
      const location = response.headers.get("location")
      console.log(`🔄 Redirected to: ${location}`)
      console.log("💡 This means you need to login first")
    } else if (response.ok) {
      console.log("✅ View-samples page accessible")
    }
  } catch (error) {
    console.error("❌ Error accessing view-samples:", error.message)
  }

  // Test 4: Test API endpoints (this will fail without login, but we can check the structure)
  console.log("\n4️⃣ Testing API endpoint structure...")
  try {
    const response = await fetch("http://localhost:3000/api/samples")
    console.log(`🔌 /api/samples status: ${response.status}`)

    if (response.status === 401) {
      console.log("🔒 API requires authentication (this is expected)")
    } else if (response.ok) {
      const data = await response.json()
      console.log(`✅ API returned ${data.length} samples`)
    }
  } catch (error) {
    console.error("❌ API error:", error.message)
  }

  console.log("\n📋 Next steps:")
  console.log("1. Make sure your server is running: npm start")
  console.log("2. Login to your application first")
  console.log("3. Then try accessing /view-samples")
  console.log("4. Check browser console for JavaScript errors")
}

debugViewSamplesPage()
