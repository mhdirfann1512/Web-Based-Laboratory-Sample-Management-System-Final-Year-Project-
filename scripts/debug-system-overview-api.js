const mysql = require("mysql2")
require("dotenv").config()

console.log("🔍 Debugging System Overview API...")

// Test database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
})

async function testSystemOverview() {
  try {
    console.log("📊 Testing database queries...")

    // Test staff count
    const [staffResult] = await db.promise().query("SELECT COUNT(*) as count FROM staff")
    console.log(`✅ Total Staff: ${staffResult[0].count}`)

    // Test samples count
    const [samplesResult] = await db
      .promise()
      .query("SELECT COUNT(*) as count FROM samples WHERE status != 'disposed' OR status IS NULL")
    console.log(`✅ Active Samples: ${samplesResult[0].count}`)

    // Test API endpoint
    console.log("🌐 Testing API endpoint...")
    const response = await fetch("http://localhost:3000/api/admin/system-overview")
    if (response.ok) {
      const data = await response.json()
      console.log("✅ API Response:", data)
    } else {
      console.log("❌ API Error:", response.status, response.statusText)
    }
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    db.end()
  }
}

testSystemOverview()
