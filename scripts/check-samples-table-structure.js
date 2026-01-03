const mysql = require("mysql2")
require("dotenv").config()

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function checkSamplesTableStructure() {
  try {
    console.log("🔍 Checking samples table structure...\n")

    // Check the current structure of the samples table
    console.log("1. Table structure:")
    const [structure] = await db.promise().query("DESCRIBE samples")
    console.table(structure)

    // Check if we have any sample data
    console.log("\n2. Sample data count:")
    const [count] = await db.promise().query("SELECT COUNT(*) as total_samples FROM samples")
    console.log("Total samples:", count[0].total_samples)

    // Check what columns exist
    console.log("\n3. All columns in samples table:")
    const [columns] = await db.promise().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'samples' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `)

    columns.forEach((col) => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === "YES" ? "nullable" : "not null"})`)
    })

    // Check for disposal-related columns
    console.log("\n4. Checking for disposal columns:")
    const disposalColumns = ["disposal_reason", "disposal_notes", "disposed_by", "disposal_date", "updated_at"]
    const existingColumns = columns.map((col) => col.COLUMN_NAME)

    disposalColumns.forEach((col) => {
      const exists = existingColumns.includes(col)
      console.log(`  - ${col}: ${exists ? "✅ EXISTS" : "❌ MISSING"}`)
    })

    console.log("\n✅ Structure check complete!")
  } catch (error) {
    console.error("❌ Error checking table structure:", error)
  } finally {
    db.end()
  }
}

checkSamplesTableStructure()
