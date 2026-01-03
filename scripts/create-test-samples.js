const mysql = require("mysql2")
require("dotenv").config()

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function createTestSamples() {
  try {
    console.log("🧪 Creating test samples...\n")

    // Get first staff member
    const [staff] = await db.promise().query("SELECT staff_id FROM staff LIMIT 1")
    if (staff.length === 0) {
      console.log("❌ No staff members found! Please register a staff member first.")
      return
    }

    const staffId = staff[0].staff_id
    console.log("Using staff ID:", staffId)

    // Get sample types, tests, storage, and freezers
    const [sampleTypes] = await db.promise().query("SELECT type_id FROM sample_types LIMIT 1")
    const [tests] = await db.promise().query("SELECT test_id FROM sample_tests LIMIT 1")
    const [storage] = await db.promise().query("SELECT storage_id FROM sample_storage LIMIT 1")
    const [freezers] = await db.promise().query("SELECT freezer_id FROM freezer LIMIT 1")

    if (sampleTypes.length === 0 || tests.length === 0 || storage.length === 0 || freezers.length === 0) {
      console.log("❌ Missing required data. Please ensure you have:")
      console.log("- Sample types:", sampleTypes.length)
      console.log("- Sample tests:", tests.length)
      console.log("- Storage locations:", storage.length)
      console.log("- Freezers:", freezers.length)
      return
    }

    // Create test samples
    const testSamples = [
      {
        sample_id: "SMP-2024-TEST001",
        patient_name: "John Doe",
        patient_id: "P001",
        status: "active",
      },
      {
        sample_id: "SMP-2024-TEST002",
        patient_name: "Jane Smith",
        patient_id: "P002",
        status: "active",
      },
      {
        sample_id: "SMP-2024-TEST003",
        patient_name: "Bob Johnson",
        patient_id: "P003",
        status: "disposed",
      },
      {
        sample_id: "SMP-2024-TEST004",
        patient_name: "Alice Brown",
        patient_id: "P004",
        status: "disposed",
      },
    ]

    for (const sample of testSamples) {
      try {
        await db.promise().query(
          `
          INSERT INTO samples (
            sample_id, sample_type_id, test_id, storage_id, freezer_id, staff_id,
            patient_name, patient_id, collection_date, status, registration_date,
            disposal_date, disposal_reason, disposed_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)
        `,
          [
            sample.sample_id,
            sampleTypes[0].type_id,
            tests[0].test_id,
            storage[0].storage_id,
            freezers[0].freezer_id,
            staffId,
            sample.patient_name,
            sample.patient_id,
            "2024-01-15",
            sample.status,
            sample.status === "disposed" ? new Date() : null,
            sample.status === "disposed" ? "Test disposal" : null,
            sample.status === "disposed" ? staffId : null,
          ],
        )

        console.log(`✅ Created sample: ${sample.sample_id} (${sample.status})`)
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⚠️ Sample ${sample.sample_id} already exists, skipping...`)
        } else {
          console.error(`❌ Error creating sample ${sample.sample_id}:`, error.message)
        }
      }
    }

    console.log("\n🎉 Test samples created successfully!")
    console.log("Now try accessing your profile page to see the statistics.")
  } catch (error) {
    console.error("❌ Error creating test samples:", error)
  } finally {
    db.end()
  }
}

createTestSamples()
