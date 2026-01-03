const mysql = require("mysql2/promise")
require("dotenv").config()

async function debugViewSamplesSimple() {
  console.log("🔍 Debugging view-samples page (simple version)...\n")

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

    // Test the exact query used by the API
    console.log("\n2️⃣ Testing the API query...")
    const query = `
      SELECT 
        s.sample_id,
        s.patient_name,
        s.patient_id,
        s.collection_date,
        s.registration_date,
        s.status,
        s.notes,
        st.type_name as sample_type_name,
        test.test_name,
        storage.storage_name,
        f.freezer_name,
        staff.full_name as staff_name,
        staff.department
      FROM samples s
      LEFT JOIN sample_types st ON s.sample_type_id = st.type_id
      LEFT JOIN sample_tests test ON s.test_id = test.test_id
      LEFT JOIN sample_storage storage ON s.storage_id = storage.storage_id
      LEFT JOIN freezer f ON s.freezer_id = f.freezer_id
      LEFT JOIN staff ON s.staff_id = staff.staff_id
      ORDER BY s.registration_date DESC
    `

    const [apiResults] = await connection.execute(query)
    console.log(`✅ API query successful. Found ${apiResults.length} results`)

    if (apiResults.length > 0) {
      console.log("📋 API query results:")
      apiResults.forEach((result, index) => {
        console.log(
          `   ${index + 1}. ${result.sample_id} - ${result.patient_name} - ${result.sample_type_name} - ${result.test_name}`,
        )
      })
    }
  } catch (error) {
    console.error("❌ Database error:", error.message)
    return
  } finally {
    if (connection) await connection.end()
  }

  console.log("\n📋 Next steps:")
  console.log("1. Make sure your server is running: npm start")
  console.log("2. Login to your application first")
  console.log("3. Open browser developer tools (F12)")
  console.log("4. Go to /view-samples and check Console tab for errors")
  console.log("5. Check Network tab to see if API calls are being made")
}

debugViewSamplesSimple()
