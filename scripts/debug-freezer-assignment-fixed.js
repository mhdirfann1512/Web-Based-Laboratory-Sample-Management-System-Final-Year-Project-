// Fixed debug script to test freezer assignment logic
require("dotenv").config()
const mysql = require("mysql2/promise")

async function debugFreezerAssignmentFixed() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    console.log("✅ Connected to database")

    // 1. Check if freezer table has data
    console.log("\n🔍 Checking freezer table:")
    const [freezers] = await connection.execute("SELECT * FROM freezer")
    console.table(freezers)

    // 2. Check sample_storage table
    console.log("\n🔍 Checking sample_storage table:")
    const [storageLocations] = await connection.execute("SELECT * FROM sample_storage")
    console.table(storageLocations)

    // 3. Test freezer assignment logic for each storage location
    console.log("\n🔍 Testing freezer assignment logic:")

    for (const storage of storageLocations) {
      console.log(`\n--- Testing storage: ${storage.storage_name} ---`)
      console.log(`Temperature range: ${storage.temperature_range}`)

      // Simulate the FIXED freezer assignment logic
      let freezerQuery = "SELECT * FROM freezer"
      const freezerParams = []

      if (storage.temperature_range) {
        const tempRange = storage.temperature_range.toLowerCase()
        console.log(`Looking for freezer matching: ${tempRange}`)

        if (tempRange.includes("2") && tempRange.includes("8")) {
          freezerQuery += " WHERE freezer_name LIKE '%refrigerator%'"
          console.log("  → Looking for refrigerator")
        } else if (tempRange.includes("-20")) {
          freezerQuery += " WHERE freezer_name LIKE '%standard%'"
          console.log("  → Looking for standard freezer")
        } else if (tempRange.includes("-30") || tempRange.includes("-40")) {
          freezerQuery += " WHERE freezer_name LIKE '%low%'"
          console.log("  → Looking for low temperature freezer")
        } else if (tempRange.includes("-70") || tempRange.includes("-86")) {
          freezerQuery += " WHERE freezer_name LIKE '%ultra%'"
          console.log("  → Looking for ultra-low temperature freezer")
        } else if (tempRange.includes("-150") || tempRange.includes("-196")) {
          freezerQuery += " WHERE freezer_name LIKE '%cryogenic%'"
          console.log("  → Looking for cryogenic freezer")
        }
      }

      freezerQuery += " ORDER BY freezer_id LIMIT 1"
      console.log(`Query: ${freezerQuery}`)

      const [matchedFreezers] = await connection.execute(freezerQuery, freezerParams)

      if (matchedFreezers.length > 0) {
        console.log(`✅ Found freezer: ${matchedFreezers[0].freezer_name} (ID: ${matchedFreezers[0].freezer_id})`)
      } else {
        console.log("❌ No matching freezer found, trying fallback...")

        // Try fallback
        const [fallbackFreezers] = await connection.execute("SELECT * FROM freezer ORDER BY freezer_id LIMIT 1")

        if (fallbackFreezers.length > 0) {
          console.log(
            `⚠️  Fallback freezer: ${fallbackFreezers[0].freezer_name} (ID: ${fallbackFreezers[0].freezer_id})`,
          )
        } else {
          console.log("❌ No fallback freezer available")
        }
      }
    }

    // 4. Check recent samples to see what freezer_id values are being stored
    console.log("\n🔍 Checking recent samples:")
    try {
      const [samples] = await connection.execute(
        "SELECT sample_id, freezer_id, storage_id, created_at FROM samples ORDER BY created_at DESC LIMIT 5",
      )
      console.table(samples)
    } catch (error) {
      console.log("No samples found or samples table doesn't exist yet")
    }

    await connection.end()
    console.log("\n✅ Debug completed")
  } catch (error) {
    console.error("❌ Debug error:", error)
  }
}

// Execute the debug function
debugFreezerAssignmentFixed()
