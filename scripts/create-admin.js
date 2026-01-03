// Script to create an admin user
require("dotenv").config()
const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

async function createAdminUser() {
  try {
    // Admin user details - customize these as needed
    const adminUser = {
      username: "admin",
      email: "admin@samplestorage.com",
      password: "admin123", // This will be hashed before storing
      full_name: "System Administrator",
      phone_number: "+60123456789",
    }

    // Create database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    })

    console.log("Connected to database")

    // Check if admin already exists
    const [existingAdmins] = await connection.execute("SELECT * FROM admin WHERE username = ? OR email = ?", [
      adminUser.username,
      adminUser.email,
    ])

    if (existingAdmins.length > 0) {
      console.log("Admin user already exists:")
      console.table(
        existingAdmins.map((admin) => ({
          admin_id: admin.admin_id,
          username: admin.username,
          email: admin.email,
          full_name: admin.full_name,
        })),
      )
      await connection.end()
      return
    }

    // Hash the password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(adminUser.password, saltRounds)

    // Insert the admin user
    const [result] = await connection.execute(
      "INSERT INTO admin (username, email, password, full_name, phone_number, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [adminUser.username, adminUser.email, hashedPassword, adminUser.full_name, adminUser.phone_number],
    )

    console.log(`Admin user created successfully with ID: ${result.insertId}`)
    console.log("Login credentials:")
    console.log(`Username: ${adminUser.username}`)
    console.log(`Password: ${adminUser.password}`)
    console.log("\nIMPORTANT: Please change this password after first login!")

    // Close the connection
    await connection.end()
  } catch (error) {
    console.error("Error creating admin user:", error)
    process.exit(1)
  }
}

// Execute the function
createAdminUser()
