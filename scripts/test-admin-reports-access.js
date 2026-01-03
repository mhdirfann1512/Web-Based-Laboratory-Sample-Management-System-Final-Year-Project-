require("dotenv").config()

async function testAdminReportsAccess() {
  console.log("🔍 Testing admin-reports page access...")

  const baseUrl = `http://localhost:${process.env.PORT || 3000}`
  const testUrl = `${baseUrl}/admin-reports`

  console.log(`Testing URL: ${testUrl}`)

  try {
    const response = await fetch(testUrl)
    const status = response.status

    if (status === 200) {
      console.log("✅ /admin-reports page is accessible (200)")
    } else if (status === 302 || status === 301) {
      console.log("🔄 /admin-reports redirects (likely to login) (302/301)")
      console.log("💡 This is expected if you're not logged in as admin")
    } else if (status === 404) {
      console.log("❌ /admin-reports page not found (404)")
      console.log("💡 The route may not be properly added to app.js")
    } else {
      console.log(`⚠️ /admin-reports returned status: ${status}`)
    }

    // Also check if the HTML file exists
    const fs = require("fs")
    const path = require("path")
    const htmlPath = path.join(__dirname, "..", "public", "html", "admin-reports.html")

    if (fs.existsSync(htmlPath)) {
      console.log("✅ admin-reports.html file exists")
    } else {
      console.log("❌ admin-reports.html file is missing")
    }
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`)
    console.log("💡 Make sure your server is running: npm start")
  }

  console.log("\n📋 Troubleshooting:")
  console.log("1. Run: node scripts/check-admin-reports-route.js")
  console.log("2. Restart server: npm start")
  console.log("3. Login as admin first")
  console.log("4. Then visit: http://localhost:3000/admin-reports")
}

// Only run if fetch is available (Node.js 18+)
if (typeof fetch !== "undefined") {
  testAdminReportsAccess()
} else {
  console.log("❌ This script requires Node.js 18+ with fetch support")
  console.log("💡 Alternative: Check manually by visiting http://localhost:3000/admin-reports in your browser")
}
