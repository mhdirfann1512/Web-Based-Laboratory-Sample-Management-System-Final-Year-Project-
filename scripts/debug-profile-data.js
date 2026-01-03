const mysql = require("mysql2")
require("dotenv").config()

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function debugProfileData() {
  try {
    console.log("🔍 Debugging Profile Data...\n")

    // Check if staff table exists and has data
    console.log("1. Checking staff table:")
    const [staff] = await db.promise().query("SELECT staff_id, username, full_name FROM staff LIMIT 5")
    console.log("Staff members:", staff)
    console.log("Total staff:", staff.length)

    if (staff.length === 0) {
      console.log("❌ No staff members found! You need to register some staff first.")
      return
    }

    // Check samples table structure
    console.log("\n2. Checking samples table structure:")
    const [columns] = await db.promise().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'samples' 
      AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `)
    console.log("Samples table columns:")
    columns.forEach((col) => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === "YES" ? "nullable" : "not null"})`)
    })

    // Check if samples table has data
    console.log("\n3. Checking samples data:")
    const [sampleCount] = await db.promise().query("SELECT COUNT(*) as total FROM samples")
    console.log("Total samples in database:", sampleCount[0].total)

    if (sampleCount[0].total === 0) {
      console.log("❌ No samples found! Register some samples first to see statistics.")
      return
    }

    // Check samples by staff
    console.log("\n4. Checking samples by staff:")
    const [samplesByStaff] = await db.promise().query(`
      SELECT 
        s.staff_id,
        staff.full_name,
        COUNT(*) as total_samples,
        SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END) as active_samples,
        SUM(CASE WHEN s.status = 'disposed' THEN 1 ELSE 0 END) as disposed_samples
      FROM samples s
      LEFT JOIN staff ON s.staff_id = staff.staff_id
      GROUP BY s.staff_id, staff.full_name
    `)

    console.log("Samples by staff:")
    samplesByStaff.forEach((row) => {
      console.log(
        `  - ${row.full_name} (ID: ${row.staff_id}): ${row.total_samples} total, ${row.active_samples} active, ${row.disposed_samples} disposed`,
      )
    })

    // Check recent sample activities
    console.log("\n5. Recent sample activities:")
    const [recentSamples] = await db.promise().query(`
      SELECT 
        sample_id, 
        staff_id, 
        patient_name, 
        status, 
        registration_date, 
        disposal_date
      FROM samples 
      ORDER BY registration_date DESC 
      LIMIT 5
    `)

    console.log("Recent samples:")
    recentSamples.forEach((sample) => {
      console.log(
        `  - ${sample.sample_id}: ${sample.patient_name} (${sample.status}) - registered: ${sample.registration_date}, disposed: ${sample.disposal_date || "N/A"}`,
      )
    })

    console.log("\n✅ Debug complete!")
  } catch (error) {
    console.error("❌ Error during debug:", error)
  } finally {
    db.end()
  }
}

debugProfileData()
