const mysql = require("mysql2")
require("dotenv").config()

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function addMissingDisposalColumns() {
  try {
    console.log("🔧 Adding missing disposal columns...\n")

    // Check existing columns first
    const [columns] = await db.promise().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'samples' 
      AND TABLE_SCHEMA = DATABASE()
    `)

    const existingColumns = columns.map((col) => col.COLUMN_NAME)
    console.log("Existing columns:", existingColumns)

    // Add disposal tracking columns if they don't exist
    const columnsToAdd = [
      {
        name: "disposal_reason",
        definition: "VARCHAR(255) DEFAULT NULL",
      },
      {
        name: "disposal_notes",
        definition: "TEXT DEFAULT NULL",
      },
      {
        name: "disposed_by",
        definition: "INT DEFAULT NULL",
      },
      {
        name: "disposal_date",
        definition: "DATETIME DEFAULT NULL",
      },
      {
        name: "updated_at",
        definition: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      },
    ]

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        try {
          await db.promise().query(`ALTER TABLE samples ADD COLUMN ${column.name} ${column.definition}`)
          console.log(`✅ Added column: ${column.name}`)
        } catch (error) {
          console.error(`❌ Error adding column ${column.name}:`, error.message)
        }
      } else {
        console.log(`⚠️ Column ${column.name} already exists`)
      }
    }

    // Add foreign key constraint for disposed_by if it doesn't exist
    try {
      await db.promise().query(`
        ALTER TABLE samples 
        ADD CONSTRAINT fk_samples_disposed_by 
        FOREIGN KEY (disposed_by) REFERENCES staff(staff_id) 
        ON DELETE SET NULL
      `)
      console.log("✅ Added foreign key constraint for disposed_by")
    } catch (error) {
      if (error.code === "ER_DUP_KEYNAME") {
        console.log("⚠️ Foreign key constraint already exists")
      } else {
        console.error("❌ Error adding foreign key constraint:", error.message)
      }
    }

    console.log("\n🎉 Disposal columns setup complete!")
  } catch (error) {
    console.error("❌ Error adding disposal columns:", error)
  } finally {
    db.end()
  }
}

addMissingDisposalColumns()
