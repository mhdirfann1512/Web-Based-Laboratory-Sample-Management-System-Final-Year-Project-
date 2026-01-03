require("dotenv").config()
const mysql = require("mysql2/promise")

async function testSampleTypesAPI() {
  console.log("🔍 Testing sample types database and API...")

  try {
    // Use environment variables from .env file
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2", // Fixed to use fyp2
    })

    console.log("✅ Database connection successful")
    console.log(`📊 Connected to database: ${process.env.DB_NAME || "fyp2"}`)

    // Check if sample_types table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'sample_types'")
    if (tables.length === 0) {
      console.log("❌ sample_types table does not exist")
      console.log("📝 Creating sample_types table...")

      await connection.execute(`
                CREATE TABLE sample_types (
                    type_id INT AUTO_INCREMENT PRIMARY KEY,
                    type_name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `)

      console.log("✅ sample_types table created")

      // Insert sample data
      const sampleTypes = ["Blood", "Tissue", "Urine", "Saliva", "Serum", "Plasma", "CSF", "Biopsy", "Stool", "Other"]

      for (const type of sampleTypes) {
        await connection.execute("INSERT INTO sample_types (type_name, description) VALUES (?, ?)", [
          type,
          `${type} sample for laboratory testing`,
        ])
      }

      console.log("✅ Sample data inserted")
    } else {
      console.log("✅ sample_types table exists")
    }

    // Check sample types data
    const [rows] = await connection.execute("SELECT * FROM sample_types")
    console.log(`📊 Found ${rows.length} sample types in database:`)
    rows.forEach((row) => {
      console.log(`   - ID: ${row.type_id}, Name: ${row.type_name}`)
    })

    // Check if sample_tests table exists
    const [testTables] = await connection.execute("SHOW TABLES LIKE 'sample_tests'")
    if (testTables.length === 0) {
      console.log("📝 Creating sample_tests table...")

      await connection.execute(`
                CREATE TABLE sample_tests (
                    test_id INT AUTO_INCREMENT PRIMARY KEY,
                    type_id INT,
                    test_name VARCHAR(100) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (type_id) REFERENCES sample_types(type_id)
                )
            `)

      console.log("✅ sample_tests table created")

      // Add some test data
      const testData = [
        { type: "Blood", tests: ["Complete Blood Count", "Blood Chemistry", "Blood Gas Analysis"] },
        { type: "Tissue", tests: ["Histopathology", "Immunohistochemistry", "Molecular Analysis"] },
        { type: "Urine", tests: ["Urinalysis", "Urine Culture", "Drug Screening"] },
        { type: "Other", tests: ["General Analysis", "Special Testing", "Research Use"] },
      ]

      for (const data of testData) {
        const [typeRows] = await connection.execute("SELECT type_id FROM sample_types WHERE type_name = ?", [data.type])
        if (typeRows.length > 0) {
          const typeId = typeRows[0].type_id
          for (const test of data.tests) {
            await connection.execute("INSERT INTO sample_tests (type_id, test_name, description) VALUES (?, ?, ?)", [
              typeId,
              test,
              `${test} for ${data.type} samples`,
            ])
          }
        }
      }

      console.log("✅ Sample test data inserted")
    }

    // Check if sample_storage table exists
    const [storageTables] = await connection.execute("SHOW TABLES LIKE 'sample_storage'")
    if (storageTables.length === 0) {
      console.log("📝 Creating sample_storage table...")

      await connection.execute(`
                CREATE TABLE sample_storage (
                    storage_id INT AUTO_INCREMENT PRIMARY KEY,
                    type_id INT,
                    storage_name VARCHAR(100) NOT NULL,
                    location_details TEXT,
                    temperature_range VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (type_id) REFERENCES sample_types(type_id)
                )
            `)

      console.log("✅ sample_storage table created")

      // Add storage data
      const storageData = [
        { type: "Blood", storages: ["Freezer A (-20°C)", "Freezer B (-80°C)", "Refrigerator (4°C)"] },
        { type: "Tissue", storages: ["Freezer C (-80°C)", "Liquid Nitrogen (-196°C)"] },
        { type: "Urine", storages: ["Freezer A (-20°C)", "Refrigerator (4°C)"] },
        { type: "Other", storages: ["General Storage", "Freezer A (-20°C)"] },
      ]

      for (const data of storageData) {
        const [typeRows] = await connection.execute("SELECT type_id FROM sample_types WHERE type_name = ?", [data.type])
        if (typeRows.length > 0) {
          const typeId = typeRows[0].type_id
          for (const storage of data.storages) {
            await connection.execute(
              "INSERT INTO sample_storage (type_id, storage_name, location_details, temperature_range) VALUES (?, ?, ?, ?)",
              [
                typeId,
                storage,
                `Storage location for ${data.type}`,
                storage.includes("°C") ? storage.match(/$$([^)]+)$$/)?.[1] : "Room temperature",
              ],
            )
          }
        }
      }

      console.log("✅ Sample storage data inserted")
    }

    await connection.end()

    console.log("\n🎉 Database setup complete!")
    console.log("📋 Now try refreshing your register sample page - the dropdowns should be populated!")
  } catch (error) {
    console.error("❌ Error:", error.message)
    console.log("\n💡 Make sure your .env file has the correct database credentials:")
    console.log("DB_HOST=localhost")
    console.log("DB_USER=root")
    console.log("DB_PASSWORD=your_password")
    console.log("DB_NAME=fyp2")
  }
}

testSampleTypesAPI()
