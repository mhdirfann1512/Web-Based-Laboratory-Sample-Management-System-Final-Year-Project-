// Script to check if staff ranking route is properly registered
require("dotenv").config()

async function checkStaffRankingRoute() {
  console.log("🔍 Checking staff ranking route...")

  const baseUrl = `http://localhost:${process.env.PORT || 3000}`

  try {
    // Test the staff ranking page route
    console.log(`Testing: ${baseUrl}/staff-ranking`)
    const response = await fetch(`${baseUrl}/staff-ranking`)

    if (response.status === 200) {
      console.log("✅ Staff ranking page route is working!")
    } else if (response.status === 302) {
      console.log("🔄 Staff ranking page redirected (probably need to login)")
    } else {
      console.log(`❌ Staff ranking page returned status: ${response.status}`)
    }

    // Test the API route
    console.log(`Testing: ${baseUrl}/api/staff-rankings`)
    const apiResponse = await fetch(`${baseUrl}/api/staff-rankings`)

    if (apiResponse.status === 401) {
      console.log("🔒 Staff rankings API requires authentication (expected)")
    } else if (apiResponse.status === 200) {
      console.log("✅ Staff rankings API is working!")
    } else {
      console.log(`❌ Staff rankings API returned status: ${apiResponse.status}`)
    }
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`)
    console.log("💡 Make sure the server is running: npm start")
  }

  console.log("\n📋 Next steps:")
  console.log("1. Make sure server is running")
  console.log("2. Login to the system first")
  console.log("3. Then try accessing /staff-ranking")
}

// Only run if fetch is available (Node.js 18+)
if (typeof fetch !== "undefined") {
  checkStaffRankingRoute()
} else {
  console.log("❌ This script requires Node.js 18+ with fetch support")
}
