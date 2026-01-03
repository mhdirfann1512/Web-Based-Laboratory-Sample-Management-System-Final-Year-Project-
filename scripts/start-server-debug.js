// Script to start server with detailed debugging
require("dotenv").config()

console.log("🚀 Starting server with debug information...")
console.log("📋 Configuration:")
console.log("- Port:", process.env.PORT || 3000)
console.log("- Database:", process.env.DB_NAME || "fyp2")
console.log("- Host:", process.env.DB_HOST || "localhost")

// Import and start the server
try {
  console.log("📦 Loading app.js...")
  require("../app.js")
  console.log("✅ Server should be starting...")
} catch (error) {
  console.error("❌ Error starting server:", error.message)
  console.log("\n🔧 Possible solutions:")
  console.log("1. Make sure all dependencies are installed: npm install")
  console.log("2. Check that app.js exists and is valid")
  console.log("3. Verify database connection settings")
  console.log("4. Check for syntax errors in app.js")
}
