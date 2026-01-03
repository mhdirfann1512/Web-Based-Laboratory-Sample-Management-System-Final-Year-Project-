const mysql = require("mysql2/promise")
require("dotenv").config()

async function fixViewSamplesAPI() {
  console.log("🔧 Analyzing and fixing view-samples API endpoints...\n")

  let connection
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    console.log("✅ Connected to database\n")

    // Check what tables actually exist
    const [tables] = await connection.execute(
      `
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? 
            ORDER BY TABLE_NAME
        `,
      [process.env.DB_NAME || "fyp2"],
    )

    console.log("📋 Available tables in database:")
    tables.forEach((table) => console.log(`  - ${table.TABLE_NAME}`))
    console.log("")

    // Generate the correct API query based on available tables
    let apiQuery = "SELECT s.*"
    const fromClause = "FROM samples s"
    const joinClauses = []

    // Check each potential join table
    const potentialJoins = [
      {
        table: "sample_types",
        alias: "st",
        joinOn: "s.sample_type_id = st.type_id",
        select: "st.type_name as sample_type_name",
      },
      { table: "sample_tests", alias: "test", joinOn: "s.test_id = test.test_id", select: "test.test_name" },
      {
        table: "sample_storage",
        alias: "storage",
        joinOn: "s.storage_id = storage.storage_id",
        select: "storage.storage_name",
      },
      { table: "freezer", alias: "f", joinOn: "s.freezer_id = f.freezer_id", select: "f.freezer_name" },
      {
        table: "staff",
        alias: "staff",
        joinOn: "s.staff_id = staff.staff_id",
        select: "staff.full_name as staff_name",
      },
    ]

    const availableTableNames = tables.map((t) => t.TABLE_NAME)

    for (const join of potentialJoins) {
      if (availableTableNames.includes(join.table)) {
        apiQuery += `, ${join.select}`
        joinClauses.push(`LEFT JOIN ${join.table} ${join.alias} ON ${join.joinOn}`)
        console.log(`✅ Will include ${join.table} in query`)
      } else {
        console.log(`⚠️ ${join.table} table not found - will skip this join`)
      }
    }

    const fullQuery = `${apiQuery} ${fromClause} ${joinClauses.join(" ")} ORDER BY s.registration_date DESC`

    console.log("\n📝 Generated API query:")
    console.log(fullQuery)

    // Test the query
    console.log("\n🧪 Testing the query...")
    try {
      const [results] = await connection.execute(fullQuery + " LIMIT 1")
      console.log("✅ Query works! Sample result:")
      if (results.length > 0) {
        console.table(results)
      } else {
        console.log("No data returned (empty samples table)")
      }
    } catch (error) {
      console.log("❌ Query failed:", error.message)

      // Try a simpler query
      console.log("\n🔄 Trying simpler query...")
      try {
        const [simpleResults] = await connection.execute("SELECT * FROM samples LIMIT 1")
        console.log("✅ Simple query works:")
        if (simpleResults.length > 0) {
          console.table(simpleResults)
        } else {
          console.log("No data in samples table")
        }
      } catch (simpleError) {
        console.log("❌ Even simple query failed:", simpleError.message)
      }
    }

    // Check if samples table has the expected columns
    console.log("\n🔍 Checking samples table structure...")
    try {
      const [columns] = await connection.execute("DESCRIBE samples")
      console.log("Samples table columns:")
      columns.forEach((col) => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === "YES" ? "NULL" : "NOT NULL"}`)
      })
    } catch (error) {
      console.log("❌ Could not describe samples table:", error.message)
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

fixViewSamplesAPI()
