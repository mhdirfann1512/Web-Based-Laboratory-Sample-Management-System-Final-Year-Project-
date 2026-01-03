// Simple script to check if the server can start
require("dotenv").config()

console.log("🔍 Checking server configuration...")

// Check environment variables
console.log("📋 Environment variables:")
console.log("- DB_HOST:", process.env.DB_HOST || "localhost")
console.log("- DB_USER:", process.env.DB_USER || "root")
console.log("- DB_NAME:", process.env.DB_NAME || "fyp2")
console.log("- PORT:", process.env.PORT || "3000")
console.log("- SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Set" : "❌ Not set")

// Check if port is available
const net = require("net")
const PORT = process.env.PORT || 3000

const server = net.createServer()

server.listen(PORT, (err) => {
  if (err) {
    console.error(`❌ Port ${PORT} is not available:`, err.message)
    if (err.code === "EADDRINUSE") {
      console.log(`💡 Port ${PORT} is already in use. Try:`)
      console.log(`   - lsof -ti:${PORT} | xargs kill -9`)
      console.log(`   - Or use a different port: PORT=3001 npm start`)
    }
  } else {
    console.log(`✅ Port ${PORT} is available`)
    server.close()
  }
})

server.on("error", (err) => {
  console.error(`❌ Port check failed:`, err.message)
})

// Test database connection
const mysql = require("mysql2")

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message)
  } else {
    console.log("✅ Database connection successful")
    db.end()
  }
})

setTimeout(() => {
  console.log("🏁 Server check completed")
  process.exit(0)
}, 2000)
