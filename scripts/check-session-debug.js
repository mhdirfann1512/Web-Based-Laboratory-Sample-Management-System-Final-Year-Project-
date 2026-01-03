const express = require("express")
const session = require("express-session")
const mysql = require("mysql2")
require("dotenv").config()

console.log("🔍 Session Debug Information...\n")

// Check environment variables
console.log("📋 Environment Variables:")
console.log(`- DB_HOST: ${process.env.DB_HOST || "localhost"}`)
console.log(`- DB_USER: ${process.env.DB_USER || "root"}`)
console.log(`- DB_NAME: ${process.env.DB_NAME || "fyp2"}`)
console.log(`- SESSION_SECRET: ${process.env.SESSION_SECRET ? "SET" : "NOT SET"}`)

// Test database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

async function checkSessionSetup() {
  try {
    console.log("\n🔐 Testing Database Connection...")

    // Test staff login query
    const username = "irfan" // Your username
    const [users] = await db.promise().query(`SELECT * FROM staff WHERE username = ?`, [username])

    if (users.length > 0) {
      const user = users[0]
      console.log("✅ User found in database:")
      console.log(`- staff_id: ${user.staff_id}`)
      console.log(`- username: ${user.username}`)
      console.log(`- full_name: ${user.full_name}`)

      // Simulate session object
      const mockSession = {
        user: {
          id: user.staff_id,
          username: user.username,
          email: user.email,
          type: "staff",
        },
      }

      console.log("\n🎭 Mock Session Object:")
      console.log(JSON.stringify(mockSession, null, 2))

      // Test the profile API query with this session
      console.log("\n🧪 Testing Profile Query with Mock Session...")

      const [sampleStats] = await db.promise().query(
        `
        SELECT 
          COUNT(*) as total_samples,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_samples,
          SUM(CASE WHEN status = 'disposed' THEN 1 ELSE 0 END) as disposed_samples
        FROM samples 
        WHERE staff_id = ?
      `,
        [mockSession.user.id],
      )

      console.log("📊 Query Result:")
      console.table(sampleStats)
    } else {
      console.log("❌ User not found in database")
    }
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    db.end()
  }
}

checkSessionSetup()
