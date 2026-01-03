const mysql = require("mysql2/promise")
require("dotenv").config()

async function checkDatabaseStructure() {
  console.log("🔍 Checking database structure for view-samples page...\n")

  let connection
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    console.log("✅ Connected to database\n")

    // Check if samples table exists and its structure
    console.log("📋 SAMPLES TABLE STRUCTURE:")
    try {
      const [samplesStructure] = await connection.execute("DESCRIBE samples")
      console.table(samplesStructure)

      // Check sample count
      const [sampleCount] = await connection.execute("SELECT COUNT(*) as count FROM samples")
      console.log(`📊 Total samples in database: ${sampleCount[0].count}\n`)

      // Show sample data if any exists
      if (sampleCount[0].count > 0) {
        console.log("📝 Sample data (first 3 records):")
        const [sampleData] = await connection.execute("SELECT * FROM samples LIMIT 3")
        console.table(sampleData)
      }
    } catch (error) {
      console.log("❌ Samples table does not exist or has issues:", error.message)
    }

    // Check related tables
    const tablesToCheck = ["sample_types", "sample_tests", "sample_storage", "freezer", "staff", "admin"]

    for (const table of tablesToCheck) {
      console.log(`\n📋 ${table.toUpperCase()} TABLE:`)
      try {
        const [structure] = await connection.execute(`DESCRIBE ${table}`)
        console.table(structure)

        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`)
        console.log(`📊 Records: ${count[0].count}`)

        // Show sample data for reference tables
        if (count[0].count > 0 && count[0].count <= 10) {
          const [data] = await connection.execute(`SELECT * FROM ${table} LIMIT 5`)
          console.table(data)
        }
      } catch (error) {
        console.log(`❌ ${table} table issue:`, error.message)
      }
    }

    // Check for any existing sample-related data with JOINs
    console.log("\n🔗 TESTING JOIN QUERIES:")
    try {
      const [joinTest] = await connection.execute(`
                SELECT 
                    s.sample_id,
                    s.patient_name,
                    s.status,
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
                LIMIT 3
            `)

      if (joinTest.length > 0) {
        console.log("✅ JOIN query successful:")
        console.table(joinTest)
      } else {
        console.log("⚠️ JOIN query returned no results (no sample data)")
      }
    } catch (error) {
      console.log("❌ JOIN query failed:", error.message)
      console.log("This indicates missing tables or incorrect column names")
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    console.log("\n💡 Make sure your .env file has correct database credentials:")
    console.log("DB_HOST=localhost")
    console.log("DB_USER=your_username")
    console.log("DB_PASSWORD=your_password")
    console.log("DB_NAME=your_database_name")
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

checkDatabaseStructure()
