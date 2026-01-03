const express = require("express")
const session = require("express-session")
const mysql = require("mysql2/promise")
require("dotenv").config()

async function testAPIWithSession() {
  console.log("🧪 Testing API endpoints with mock session...\n")

  // Create a test Express app to simulate the session
  const app = express()

  app.use(
    session({
      secret: "test-secret",
      resave: false,
      saveUninitialized: false,
    }),
  )

  // Test the exact query from your API
  let connection
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    console.log("✅ Connected to database")

    // Test the samples query
    console.log("\n🔍 Testing samples query...")
    const query = `
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

    const [samples] = await connection.execute(query)
    console.log(`✅ Query successful! Found ${samples.length} samples`)

    if (samples.length > 0) {
      console.log("\n📋 Sample data that API should return:")
      samples.forEach((sample, index) => {
        console.log(`\n${index + 1}. Sample ID: ${sample.sample_id}`)
        console.log(`   Patient: ${sample.patient_name}`)
        console.log(`   Patient ID: ${sample.patient_id}`)
        console.log(`   Type: ${sample.sample_type_name}`)
        console.log(`   Test: ${sample.test_name}`)
        console.log(`   Storage: ${sample.storage_name}`)
        console.log(`   Freezer: ${sample.freezer_name || "Not assigned"}`)
        console.log(`   Staff: ${sample.staff_name}`)
        console.log(`   Status: ${sample.status}`)
        console.log(`   Collection Date: ${sample.collection_date}`)
        console.log(`   Registration Date: ${sample.registration_date}`)
      })

      // Test JSON serialization
      console.log("\n🔄 Testing JSON serialization...")
      const jsonData = JSON.stringify(samples, null, 2)
      console.log("✅ JSON serialization successful")
      console.log(`📏 JSON size: ${jsonData.length} characters`)
    } else {
      console.log("❌ No samples found in database")
    }

    // Test sample types query
    console.log("\n🔍 Testing sample types query...")
    const [sampleTypes] = await connection.execute("SELECT * FROM sample_types ORDER BY type_name")
    console.log(`✅ Found ${sampleTypes.length} sample types`)
  } catch (error) {
    console.error("❌ Database error:", error)
  } finally {
    if (connection) await connection.end()
  }
}

testAPIWithSession()
