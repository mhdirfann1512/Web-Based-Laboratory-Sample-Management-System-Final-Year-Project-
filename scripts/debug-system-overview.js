// Debug script to test the system overview queries
require("dotenv").config()
const mysql = require("mysql2/promise")

async function debugSystemOverview() {
  try {
    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    console.log("✅ Connected to database successfully")

    // Test each query individually
    console.log("\n🔍 Testing individual queries:")

    // 1. Test staff count
    try {
      const [staffResult] = await connection.execute("SELECT COUNT(*) as total FROM staff")
      console.log("✅ Staff count:", staffResult[0].total)
    } catch (error) {
      console.log("❌ Staff query error:", error.message)
    }

    // 2. Test sample tests count (since samples table might not exist)
    try {
      const [testsResult] = await connection.execute("SELECT COUNT(*) as total FROM sample_tests")
      console.log("✅ Sample tests count:", testsResult[0].total)
    } catch (error) {
      console.log("❌ Sample tests query error:", error.message)
    }

    // 3. Test freezer count
    try {
      const [freezerResult] = await connection.execute("SELECT COUNT(*) as total FROM freezer")
      console.log("✅ Freezer count:", freezerResult[0].total)
    } catch (error) {
      console.log("❌ Freezer query error:", error.message)
    }

    // 4. Test sample types count
    try {
      const [typesResult] = await connection.execute("SELECT COUNT(*) as total FROM sample_types")
      console.log("✅ Sample types count:", typesResult[0].total)
    } catch (error) {
      console.log("❌ Sample types query error:", error.message)
    }

    // 5. Test storage locations count
    try {
      const [storageResult] = await connection.execute("SELECT COUNT(*) as total FROM sample_storage")
      console.log("✅ Storage locations count:", storageResult[0].total)
    } catch (error) {
      console.log("❌ Storage locations query error:", error.message)
    }

    // 6. Show all tables in database
    console.log("\n📋 Available tables in database:")
    const [tables] = await connection.execute("SHOW TABLES")
    tables.forEach((table) => {
      console.log("  -", Object.values(table)[0])
    })

    await connection.end()
    console.log("\n✅ Debug completed successfully")
  } catch (error) {
    console.error("❌ Database connection error:", error.message)
    console.error("Full error:", error)
  }
}

// Execute the debug function
debugSystemOverview()
