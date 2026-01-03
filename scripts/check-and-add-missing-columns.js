const mysql = require("mysql2")
require("dotenv").config()

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function checkAndAddMissingColumns() {
  try {
    console.log("🔍 Checking existing columns in samples table...")

    // Get current table structure
    const [columns] = await db.promise().query("DESCRIBE samples")
    const existingColumns = columns.map((col) => col.Field)

    console.log("📋 Existing columns:", existingColumns)

    // Define required columns for AI functionality
    const requiredColumns = [
      { name: "expiry_date", definition: "DATE NULL" },
      { name: "ai_predicted_expiry", definition: "BOOLEAN DEFAULT FALSE" },
      { name: "prediction_confidence", definition: "INT DEFAULT NULL" },
      { name: "prediction_factors", definition: "TEXT NULL" },
    ]

    // Check which columns are missing
    const missingColumns = requiredColumns.filter((col) => !existingColumns.includes(col.name))

    if (missingColumns.length === 0) {
      console.log("✅ All required columns already exist!")
      return
    }

    console.log(
      "➕ Missing columns:",
      missingColumns.map((col) => col.name),
    )

    // Add missing columns one by one
    for (const column of missingColumns) {
      try {
        console.log(`📝 Adding column: ${column.name}`)
        await db.promise().query(`ALTER TABLE samples ADD COLUMN ${column.name} ${column.definition}`)
        console.log(`✅ Added column: ${column.name}`)
      } catch (error) {
        console.error(`❌ Error adding column ${column.name}:`, error.message)
      }
    }

    // Create indexes if they don't exist
    try {
      console.log("📊 Creating indexes...")
      await db.promise().query("CREATE INDEX IF NOT EXISTS idx_samples_expiry_date ON samples(expiry_date)")
      await db.promise().query("CREATE INDEX IF NOT EXISTS idx_samples_ai_predicted ON samples(ai_predicted_expiry)")
      console.log("✅ Indexes created successfully!")
    } catch (error) {
      console.log("⚠️ Index creation warning:", error.message)
    }

    // Show final table structure
    console.log("\n📋 Final table structure:")
    const [finalColumns] = await db.promise().query("DESCRIBE samples")
    finalColumns.forEach((col) => {
      const isNew = missingColumns.some((missing) => missing.name === col.Field)
      console.log(
        `   ${isNew ? "🆕" : "  "} ${col.Field} - ${col.Type} ${col.Null === "YES" ? "(NULL)" : "(NOT NULL)"}`,
      )
    })

    console.log("\n🎉 Database schema updated successfully!")
  } catch (error) {
    console.error("❌ Error updating database schema:", error)
  } finally {
    db.end()
  }
}

checkAndAddMissingColumns()
