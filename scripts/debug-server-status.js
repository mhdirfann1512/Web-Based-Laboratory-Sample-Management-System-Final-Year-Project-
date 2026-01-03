// Debug script to check server status and common issues
require("dotenv").config()
const mysql = require("mysql2")
const fs = require("fs")
const path = require("path")

async function debugServerStatus() {
  console.log("🔍 Debugging server status and configuration...")

  // 1. Check environment variables
  console.log("\n📋 Environment Variables:")
  console.log("- DB_HOST:", process.env.DB_HOST || "localhost")
  console.log("- DB_USER:", process.env.DB_USER || "root")
  console.log("- DB_NAME:", process.env.DB_NAME || "fyp2")
  console.log("- PORT:", process.env.PORT || "3000")
  console.log("- SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Set" : "❌ Not set")

  // 2. Check if app.js exists
  console.log("\n📁 File Check:")
  const appJsExists = fs.existsSync(path.join(__dirname, "../app.js"))
  console.log("- app.js exists:", appJsExists ? "✅ Yes" : "❌ No")

  const packageJsonExists = fs.existsSync(path.join(__dirname, "../package.json"))
  console.log("- package.json exists:", packageJsonExists ? "✅ Yes" : "❌ No")

  // 3. Check HTML files
  const htmlFiles = [
    "public/html/view-samples.html",
    "public/html/staff-dashboard.html",
    "public/html/admin-dashboard.html",
    "public/html/register-sample.html",
  ]

  console.log("\n🌐 HTML Files:")
  htmlFiles.forEach((file) => {
    const exists = fs.existsSync(path.join(__dirname, "..", file))
    console.log(`- ${file}:`, exists ? "✅ Exists" : "❌ Missing")
  })

  // 4. Test database connection
  console.log("\n🗄️ Database Connection:")
  try {
    const db = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "fyp2",
    })

    await new Promise((resolve, reject) => {
      db.connect((err) => {
        if (err) {
          console.log("❌ Database connection failed:", err.message)
          reject(err)
        } else {
          console.log("✅ Database connection successful")
          resolve()
        }
        db.end()
      })
    })
  } catch (error) {
    console.log("❌ Database error:", error.message)
  }

  // 5. Check if server process is running
  console.log("\n🚀 Server Process:")
  const { exec } = require("child_process")

  exec(`lsof -ti:${process.env.PORT || 3000}`, (error, stdout, stderr) => {
    if (stdout.trim()) {
      console.log(`✅ Server is running on port ${process.env.PORT || 3000} (PID: ${stdout.trim()})`)
    } else {
      console.log(`❌ No server running on port ${process.env.PORT || 3000}`)
      console.log("💡 Start the server with: npm start")
    }
  })

  // 6. Provide troubleshooting steps
  console.log("\n🔧 Troubleshooting Steps:")
  console.log("1. Start the server: npm start")
  console.log("2. Check the console for any error messages")
  console.log("3. Verify the URL: http://localhost:3000/view-samples")
  console.log("4. Make sure you're logged in first")
  console.log("5. Check browser developer tools for network errors")

  setTimeout(() => {
    console.log("\n✅ Debug completed")
  }, 1000)
}

debugServerStatus()
