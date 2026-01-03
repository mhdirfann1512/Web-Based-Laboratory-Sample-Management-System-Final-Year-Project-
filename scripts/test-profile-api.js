const mysql = require("mysql2")
require("dotenv").config()

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function testProfileAPI() {
  console.log("🧪 Testing Profile API Logic...\n")

  try {
    // Test the exact query used in the API
    const staffId = 1 // Your staff ID

    console.log(`Testing for staff_id: ${staffId}`)

    const [sampleStats] = await db.promise().query(
      `
      SELECT 
        COUNT(*) as total_samples,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_samples,
        SUM(CASE WHEN status = 'disposed' THEN 1 ELSE 0 END) as disposed_samples
      FROM samples 
      WHERE staff_id = ?
    `,
      [staffId],
    )

    console.log("📊 Sample Statistics Query Result:")
    console.table(sampleStats)

    const stats = sampleStats[0] || { total_samples: 0, active_samples: 0, disposed_samples: 0 }

    console.log("\n📈 Processed Statistics:")
    console.log(`- Total Samples: ${stats.total_samples}`)
    console.log(`- Active Samples: ${stats.active_samples}`)
    console.log(`- Disposed Samples: ${stats.disposed_samples}`)

    // Test recent activity query
    console.log("\n🕒 Testing Recent Activity Query...")

    const [activities] = await db.promise().query(
      `
      SELECT 
        sample_id,
        status,
        registration_date,
        disposal_date,
        patient_name,
        disposal_reason
      FROM samples 
      WHERE staff_id = ? 
      ORDER BY 
        CASE 
          WHEN disposal_date IS NOT NULL THEN disposal_date 
          ELSE registration_date 
        END DESC 
      LIMIT 10
    `,
      [staffId],
    )

    console.log("📋 Recent Activities:")
    console.table(activities)

    // Test staff profile query
    console.log("\n👤 Testing Staff Profile Query...")

    const [userData] = await db.promise().query(`SELECT * FROM staff WHERE staff_id = ?`, [staffId])

    if (userData.length > 0) {
      const user = userData[0]
      console.log("✅ Staff Profile Found:")
      console.log(`- Name: ${user.full_name}`)
      console.log(`- Username: ${user.username}`)
      console.log(`- Email: ${user.email}`)
      console.log(`- Department: ${user.department || "N/A"}`)
    } else {
      console.log("❌ No staff profile found")
    }
  } catch (error) {
    console.error("❌ Error testing profile API:", error)
  } finally {
    db.end()
  }
}

testProfileAPI()
