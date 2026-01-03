// Script to test the view-samples route specifically
require("dotenv").config()

async function testViewSamplesRoute() {
  console.log("🧪 Testing view-samples route...")

  const baseUrl = `http://localhost:${process.env.PORT || 3000}`
  const testUrl = `${baseUrl}/view-samples`

  console.log(`Testing URL: ${testUrl}`)

  try {
    const response = await fetch(testUrl)
    console.log(`Status: ${response.status}`)
    console.log(`Status Text: ${response.statusText}`)

    if (response.status === 200) {
      console.log("✅ Route is working correctly!")
    } else if (response.status === 302 || response.status === 301) {
      const location = response.headers.get("location")
      console.log(`🔄 Redirected to: ${location}`)
      console.log("💡 This is expected if you're not logged in")
    } else if (response.status === 404) {
      console.log("❌ Route not found - need to fix the route definition")
    } else {
      console.log(`⚠️ Unexpected status: ${response.status}`)
    }

    // Check response headers
    console.log("\n📋 Response headers:")
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
  } catch (error) {
    console.error("❌ Error testing route:", error.message)
    console.log("💡 Make sure the server is running: npm start")
  }
}

// Only run if fetch is available
if (typeof fetch !== "undefined") {
  testViewSamplesRoute()
} else {
  console.log("❌ This script requires Node.js 18+ with fetch support")
}
