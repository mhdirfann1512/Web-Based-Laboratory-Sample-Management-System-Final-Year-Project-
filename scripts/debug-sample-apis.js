const mysql = require("mysql2")
require("dotenv").config()

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function debugSampleAPIs() {
  try {
    console.log("🔍 Debugging sample data APIs...")

    // Check sample_types table
    console.log("\n📋 Checking sample_types table:")
    const [sampleTypes] = await db.promise().query("SELECT * FROM sample_types ORDER BY type_name")
    if (sampleTypes.length > 0) {
      console.log("✅ Sample types found:")
      sampleTypes.forEach((type, index) => {
        console.log(`   ${index + 1}. ${type.type_name} (ID: ${type.type_id})`)
      })
    } else {
      console.log("❌ No sample types found! Creating sample data...")
      await createSampleData()
    }

    // Check sample_tests table
    console.log("\n🧪 Checking sample_tests table:")
    const [sampleTests] = await db.promise().query("SELECT * FROM sample_tests ORDER BY test_name")
    if (sampleTests.length > 0) {
      console.log("✅ Sample tests found:")
      sampleTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test.test_name} (ID: ${test.test_id}, Type: ${test.type_id})`)
      })
    } else {
      console.log("❌ No sample tests found!")
    }

    // Check sample_storage table
    console.log("\n🏠 Checking sample_storage table:")
    const [sampleStorage] = await db.promise().query("SELECT * FROM sample_storage ORDER BY storage_name")
    if (sampleStorage.length > 0) {
      console.log("✅ Sample storage locations found:")
      sampleStorage.forEach((storage, index) => {
        console.log(`   ${index + 1}. ${storage.storage_name} (ID: ${storage.storage_id}, Type: ${storage.type_id})`)
      })
    } else {
      console.log("❌ No sample storage locations found!")
    }

    // Test API endpoints
    console.log("\n🌐 Testing API endpoints...")
    await testAPIEndpoints()
  } catch (error) {
    console.error("❌ Error debugging sample APIs:", error)
  } finally {
    db.end()
  }
}

async function createSampleData() {
  try {
    console.log("📝 Creating sample data...")

    // Create sample types
    const sampleTypesData = [
      { type_name: "Blood", description: "Whole blood samples" },
      { type_name: "Tissue", description: "Tissue biopsy samples" },
      { type_name: "Urine", description: "Urine specimens" },
      { type_name: "Serum", description: "Blood serum samples" },
      { type_name: "Plasma", description: "Blood plasma samples" },
      { type_name: "Saliva", description: "Saliva specimens" },
      { type_name: "CSF", description: "Cerebrospinal fluid" },
      { type_name: "Biopsy", description: "Tissue biopsy samples" },
    ]

    for (const sampleType of sampleTypesData) {
      await db
        .promise()
        .query("INSERT IGNORE INTO sample_types (type_name, description) VALUES (?, ?)", [
          sampleType.type_name,
          sampleType.description,
        ])
    }

    // Get sample type IDs
    const [types] = await db.promise().query("SELECT * FROM sample_types")

    // Create sample tests for each type
    const testsData = [
      { type_name: "Blood", tests: ["Complete Blood Count", "Blood Chemistry", "PCR Analysis", "Serology"] },
      { type_name: "Tissue", tests: ["Histopathology", "Immunohistochemistry", "Molecular Analysis"] },
      { type_name: "Urine", tests: ["Urinalysis", "Urine Culture", "Drug Screening"] },
      { type_name: "Serum", tests: ["Biochemistry", "Immunoassay", "Protein Analysis"] },
      { type_name: "Plasma", tests: ["Coagulation Studies", "Protein Analysis", "Metabolomics"] },
      { type_name: "Saliva", tests: ["DNA Extraction", "Hormone Analysis", "Drug Testing"] },
      { type_name: "CSF", tests: ["Cell Count", "Protein Analysis", "Microbiology"] },
      { type_name: "Biopsy", tests: ["Histopathology", "Immunostaining", "Genetic Analysis"] },
    ]

    for (const testGroup of testsData) {
      const type = types.find((t) => t.type_name === testGroup.type_name)
      if (type) {
        for (const testName of testGroup.tests) {
          await db
            .promise()
            .query("INSERT IGNORE INTO sample_tests (type_id, test_name) VALUES (?, ?)", [type.type_id, testName])
        }
      }
    }

    // Create storage locations for each type
    const storageData = [
      {
        type_name: "Blood",
        storages: [
          { name: "Blood Bank Refrigerator", temp: "2-8°C" },
          { name: "Blood Freezer", temp: "-20°C" },
        ],
      },
      {
        type_name: "Tissue",
        storages: [
          { name: "Tissue Freezer", temp: "-80°C" },
          { name: "Pathology Refrigerator", temp: "2-8°C" },
        ],
      },
      { type_name: "Urine", storages: [{ name: "Urine Refrigerator", temp: "2-8°C" }] },
      {
        type_name: "Serum",
        storages: [
          { name: "Serum Freezer", temp: "-20°C" },
          { name: "Serum Refrigerator", temp: "2-8°C" },
        ],
      },
      {
        type_name: "Plasma",
        storages: [
          { name: "Plasma Freezer", temp: "-80°C" },
          { name: "Plasma Refrigerator", temp: "2-8°C" },
        ],
      },
      { type_name: "Saliva", storages: [{ name: "Saliva Freezer", temp: "-20°C" }] },
      { type_name: "CSF", storages: [{ name: "CSF Refrigerator", temp: "2-8°C" }] },
      {
        type_name: "Biopsy",
        storages: [
          { name: "Biopsy Freezer", temp: "-80°C" },
          { name: "Formalin Storage", temp: "Room Temperature" },
        ],
      },
    ]

    for (const storageGroup of storageData) {
      const type = types.find((t) => t.type_name === storageGroup.type_name)
      if (type) {
        for (const storage of storageGroup.storages) {
          await db
            .promise()
            .query("INSERT IGNORE INTO sample_storage (type_id, storage_name, temperature_range) VALUES (?, ?, ?)", [
              type.type_id,
              storage.name,
              storage.temp,
            ])
        }
      }
    }

    console.log("✅ Sample data created successfully!")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  }
}

async function testAPIEndpoints() {
  const express = require("express")
  const app = express()

  // Test sample types endpoint
  try {
    const [sampleTypes] = await db.promise().query("SELECT * FROM sample_types ORDER BY type_name")
    console.log(`✅ /api/sample-types would return ${sampleTypes.length} items`)
  } catch (error) {
    console.log("❌ /api/sample-types would fail:", error.message)
  }

  // Test sample tests endpoint for first type
  try {
    const [types] = await db.promise().query("SELECT * FROM sample_types LIMIT 1")
    if (types.length > 0) {
      const [tests] = await db.promise().query("SELECT * FROM sample_tests WHERE type_id = ?", [types[0].type_id])
      console.log(`✅ /api/sample-tests/${types[0].type_id} would return ${tests.length} items`)
    }
  } catch (error) {
    console.log("❌ /api/sample-tests/:typeId would fail:", error.message)
  }

  // Test sample storage endpoint for first type
  try {
    const [types] = await db.promise().query("SELECT * FROM sample_types LIMIT 1")
    if (types.length > 0) {
      const [storage] = await db.promise().query("SELECT * FROM sample_storage WHERE type_id = ?", [types[0].type_id])
      console.log(`✅ /api/sample-storage/${types[0].type_id} would return ${storage.length} items`)
    }
  } catch (error) {
    console.log("❌ /api/sample-storage/:typeId would fail:", error.message)
  }
}

debugSampleAPIs()
