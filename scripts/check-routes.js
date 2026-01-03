// Script to check if the server is running and routes are accessible
require("dotenv").config()

async function checkRoutes() {
  console.log("🔍 Checking server routes and accessibility...")

  const routes = [
    { path: "/", description: "Home page" },
    { path: "/login", description: "Login page" },
    { path: "/register", description: "Registration page" },
    { path: "/view-samples", description: "View samples page" },
    { path: "/register-sample", description: "Register sample page" },
    { path: "/staff-dashboard", description: "Staff dashboard" },
    { path: "/admin-dashboard", description: "Admin dashboard" },
  ]

  const baseUrl = `http://localhost:${process.env.PORT || 3000}`
  console.log(`Base URL: ${baseUrl}`)

  for (const route of routes) {
    try {
      const response = await fetch(`${baseUrl}${route.path}`)
      const status = response.status

      if (status === 200) {
        console.log(`✅ ${route.path} - ${route.description} (${status})`)
      } else if (status === 302 || status === 301) {
        console.log(`🔄 ${route.path} - ${route.description} (${status} - Redirect)`)
      } else {
        console.log(`❌ ${route.path} - ${route.description} (${status})`)
      }
    } catch (error) {
      console.log(`❌ ${route.path} - ${route.description} (Connection failed: ${error.message})`)
    }
  }

  console.log("\n📋 Troubleshooting steps:")
  console.log("1. Make sure the server is running: npm start")
  console.log("2. Check if the port is correct in your browser")
  console.log("3. Verify database connection")
  console.log("4. Check for any server errors in the console")
}

// Only run if fetch is available (Node.js 18+)
if (typeof fetch !== "undefined") {
  checkRoutes()
} else {
  console.log("❌ This script requires Node.js 18+ with fetch support")
  console.log("💡 Alternative: Check manually by visiting http://localhost:3000 in your browser")
}
