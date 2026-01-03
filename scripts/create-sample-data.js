const mysql = require("mysql2/promise")
require("dotenv").config()

async function createSampleData() {
  console.log("🎯 Creating sample data for testing view-samples page...\n")

  let connection
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    console.log("✅ Connected to database\n")

    // Check if we have the basic tables and data needed
    const requiredData = [
      { table: "sample_types", check: "SELECT COUNT(*) as count FROM sample_types" },
      { table: "sample_tests", check: "SELECT COUNT(*) as count FROM sample_tests" },
      { table: "sample_storage", check: "SELECT COUNT(*) as count FROM sample_storage" },
      { table: "freezer", check: "SELECT COUNT(*) as count FROM freezer" },
      { table: "staff", check: "SELECT COUNT(*) as count FROM staff" },
    ]

    console.log("📊 Checking required reference data:")
    for (const item of requiredData) {
      try {
        const [result] = await connection.execute(item.check)
        console.log(`  ${item.table}: ${result[0].count} records`)

        if (result[0].count === 0) {
          console.log(`  ⚠️ ${item.table} is empty - need to populate it first`)
        }
      } catch (error) {
        console.log(`  ❌ ${item.table}: Table doesn't exist or error - ${error.message}`)
      }
    }

    // Check current samples
    console.log("\n📋 Current samples:")
    try {
      const [samples] = await connection.execute("SELECT COUNT(*) as count FROM samples")
      console.log(`Current sample count: ${samples[0].count}`)

      if (samples[0].count > 0) {
        const [sampleList] = await connection.execute(
          "SELECT sample_id, patient_name, status, registration_date FROM samples ORDER BY registration_date DESC LIMIT 5",
        )
        console.table(sampleList)
      }
    } catch (error) {
      console.log("❌ Could not check samples:", error.message)
    }

    // Get available reference data for creating samples
    console.log("\n🔍 Getting reference data for sample creation:")

    let sampleTypeId = null,
      testId = null,
      storageId = null,
      freezerId = null,
      staffId = null

    try {
      const [sampleTypes] = await connection.execute("SELECT * FROM sample_types LIMIT 1")
      if (sampleTypes.length > 0) {
        sampleTypeId = sampleTypes[0].type_id
        console.log(`✅ Found sample type: ${sampleTypes[0].type_name} (ID: ${sampleTypeId})`)
      }
    } catch (error) {
      console.log("⚠️ No sample types available")
    }

    try {
      const [tests] = await connection.execute("SELECT * FROM sample_tests LIMIT 1")
      if (tests.length > 0) {
        testId = tests[0].test_id
        console.log(`✅ Found test: ${tests[0].test_name} (ID: ${testId})`)
      }
    } catch (error) {
      console.log("⚠️ No sample tests available")
    }

    try {
      const [storage] = await connection.execute("SELECT * FROM sample_storage LIMIT 1")
      if (storage.length > 0) {
        storageId = storage[0].storage_id
        console.log(`✅ Found storage: ${storage[0].storage_name} (ID: ${storageId})`)
      }
    } catch (error) {
      console.log("⚠️ No sample storage available")
    }

    try {
      const [freezers] = await connection.execute("SELECT * FROM freezer LIMIT 1")
      if (freezers.length > 0) {
        freezerId = freezers[0].freezer_id
        console.log(`✅ Found freezer: ${freezers[0].freezer_name} (ID: ${freezerId})`)
      }
    } catch (error) {
      console.log("⚠️ No freezers available")
    }

    try {
      const [staff] = await connection.execute("SELECT * FROM staff LIMIT 1")
      if (staff.length > 0) {
        staffId = staff[0].staff_id
        console.log(`✅ Found staff: ${staff[0].full_name} (ID: ${staffId})`)
      }
    } catch (error) {
      console.log("⚠️ No staff available")
    }

    // Create sample data if we have the required references
    if (sampleTypeId && testId && storageId && staffId) {
      console.log("\n🎯 Creating test samples...")

      const testSamples = [
        {
          sample_id: "SMP-2024-0001",
          patient_name: "John Doe",
          patient_id: "P001",
          collection_date: "2024-01-15",
          status: "active",
        },
        {
          sample_id: "SMP-2024-0002",
          patient_name: "Jane Smith",
          patient_id: "P002",
          collection_date: "2024-01-16",
          status: "active",
        },
        {
          sample_id: "SMP-2024-0003",
          patient_name: "Bob Johnson",
          patient_id: "P003",
          collection_date: "2024-01-17",
          status: "disposed",
        },
      ]

      for (const sample of testSamples) {
        try {
          // Check if sample already exists
          const [existing] = await connection.execute("SELECT sample_id FROM samples WHERE sample_id = ?", [
            sample.sample_id,
          ])

          if (existing.length === 0) {
            await connection.execute(
              `
                            INSERT INTO samples (
                                sample_id, sample_type_id, test_id, storage_id, freezer_id, staff_id,
                                patient_name, patient_id, collection_date, status, registration_date
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                        `,
              [
                sample.sample_id,
                sampleTypeId,
                testId,
                storageId,
                freezerId,
                staffId,
                sample.patient_name,
                sample.patient_id,
                sample.collection_date,
                sample.status,
              ],
            )

            console.log(`✅ Created sample: ${sample.sample_id} - ${sample.patient_name}`)
          } else {
            console.log(`⚠️ Sample ${sample.sample_id} already exists`)
          }
        } catch (error) {
          console.log(`❌ Failed to create sample ${sample.sample_id}:`, error.message)
        }
      }
    } else {
      console.log("\n⚠️ Cannot create test samples - missing required reference data")
      console.log(
        "Please ensure you have data in: sample_types, sample_tests, sample_storage, freezer, and staff tables",
      )
    }

    // Final check
    console.log("\n📊 Final sample count:")
    const [finalCount] = await connection.execute("SELECT COUNT(*) as count FROM samples")
    console.log(`Total samples: ${finalCount[0].count}`)
  } catch (error) {
    console.error("❌ Error:", error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

createSampleData()
