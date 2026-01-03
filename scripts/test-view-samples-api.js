const mysql = require("mysql2/promise")
require("dotenv").config()

async function testViewSamplesAPI() {
  console.log("🧪 Testing view-samples API endpoints...\n")

  let connection
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    console.log("✅ Connected to database\n")

    // Test the exact query that the API will use
    const apiQuery = `
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
      ORDER BY s.registration_date DESC
    `

    console.log("🔍 Testing API query...")
    const [results] = await connection.execute(apiQuery)

    console.log(`✅ Query successful! Found ${results.length} samples`)
    console.log("\n📋 Sample data that will be returned by API:")

    results.forEach((sample, index) => {
      console.log(`\n${index + 1}. Sample: ${sample.sample_id}`)
      console.log(`   Patient: ${sample.patient_name} (${sample.patient_id})`)
      console.log(`   Type: ${sample.sample_type_name}`)
      console.log(`   Test: ${sample.test_name}`)
      console.log(`   Storage: ${sample.storage_name}`)
      console.log(`   Freezer: ${sample.freezer_name || "Not assigned"}`)
      console.log(`   Staff: ${sample.staff_name}`)
      console.log(`   Status: ${sample.status}`)
      console.log(`   Collection Date: ${sample.collection_date}`)
      console.log(`   Registration Date: ${sample.registration_date}`)
    })

    // Test statistics calculation
    const totalSamples = results.length
    const activeSamples = results.filter((s) => s.status === "active").length
    const disposedSamples = results.filter((s) => s.status === "disposed").length
    const expiredSamples = results.filter((s) => s.status === "expired").length

    console.log("\n📊 Statistics:")
    console.log(`   Total Samples: ${totalSamples}`)
    console.log(`   Active Samples: ${activeSamples}`)
    console.log(`   Disposed Samples: ${disposedSamples}`)
    console.log(`   Expired Samples: ${expiredSamples}`)

    // Test sample types for filter dropdown
    console.log("\n🔍 Testing sample types for filter...")
    const [sampleTypes] = await connection.execute("SELECT * FROM sample_types ORDER BY type_name")
    console.log(`✅ Found ${sampleTypes.length} sample types:`)
    sampleTypes.forEach((type) => {
      console.log(`   - ${type.type_name} (ID: ${type.type_id})`)
    })

    // Test staff members for admin filter
    console.log("\n🔍 Testing staff members for admin filter...")
    const [staffMembers] = await connection.execute("SELECT staff_id, full_name FROM staff ORDER BY full_name")
    console.log(`✅ Found ${staffMembers.length} staff members:`)
    staffMembers.forEach((staff) => {
      console.log(`   - ${staff.full_name} (ID: ${staff.staff_id})`)
    })

    console.log("\n✅ All API tests passed! The view-samples page should work correctly.")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

testViewSamplesAPI()
