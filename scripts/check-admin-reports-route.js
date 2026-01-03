const fs = require("fs")
const path = require("path")

function checkAdminReportsRoute() {
  console.log("🔍 Checking admin-reports route...\n")

  const appPath = path.join(__dirname, "..", "app.js")

  if (!fs.existsSync(appPath)) {
    console.error("❌ app.js file not found!")
    return
  }

  const appContent = fs.readFileSync(appPath, "utf8")

  // Check for admin-reports route
  const adminReportsRoute =
    appContent.includes('app.get("/admin-reports"') || appContent.includes("app.get('/admin-reports'")
  console.log(`📄 /admin-reports route: ${adminReportsRoute ? "✅ Found" : "❌ Missing"}`)

  // Check for admin-reports HTML file
  const htmlPath = path.join(__dirname, "..", "public", "html", "admin-reports.html")
  const htmlExists = fs.existsSync(htmlPath)
  console.log(`📄 admin-reports.html file: ${htmlExists ? "✅ Found" : "❌ Missing"}`)

  // Check for API route
  const apiReportsStatsRoute =
    appContent.includes('app.get("/api/admin/reports-stats"') ||
    appContent.includes("app.get('/api/admin/reports-stats'")
  console.log(`🔌 /api/admin/reports-stats route: ${apiReportsStatsRoute ? "✅ Found" : "❌ Missing"}`)

  if (!adminReportsRoute) {
    console.log("\n📝 Adding admin-reports route...")

    // Find a good place to insert the route (after other admin routes)
    const routeToAdd = `
// Admin Reports page
app.get("/admin-reports", (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.redirect("/login?error=Admin access required")
  }
  res.sendFile(path.join(__dirname, "public/html/admin-reports.html"))
})
`

    // Insert after manage-users route
    const manageUsersIndex = appContent.indexOf('app.get("/manage-users"')

    if (manageUsersIndex > -1) {
      // Find the end of the manage-users route
      const routeEndIndex = appContent.indexOf("})", manageUsersIndex) + 2
      const newContent = appContent.slice(0, routeEndIndex) + "\n" + routeToAdd + "\n" + appContent.slice(routeEndIndex)
      fs.writeFileSync(appPath, newContent)
      console.log("✅ Added /admin-reports route to app.js")
    } else {
      console.log("❌ Could not find where to insert the route")
    }
  }

  if (!apiReportsStatsRoute) {
    console.log("\n📝 Adding API reports-stats route...")

    const apiRouteToAdd = `
// API endpoint for reports statistics
app.get("/api/admin/reports-stats", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    console.log("Fetching reports statistics...")

    // Get total samples count
    const [totalSamplesResult] = await db.promise().query("SELECT COUNT(*) as total FROM samples")
    const totalSamples = totalSamplesResult[0].total

    // Get active samples count
    const [activeSamplesResult] = await db
      .promise()
      .query("SELECT COUNT(*) as total FROM samples WHERE status = 'active'")
    const activeSamples = activeSamplesResult[0].total

    // Get disposed samples count
    const [disposedSamplesResult] = await db
      .promise()
      .query("SELECT COUNT(*) as total FROM samples WHERE status = 'disposed'")
    const disposedSamples = disposedSamplesResult[0].total

    // Get total staff count
    const [totalStaffResult] = await db.promise().query("SELECT COUNT(*) as total FROM staff")
    const totalStaff = totalStaffResult[0].total

    const responseData = {
      totalSamples,
      activeSamples,
      disposedSamples,
      totalStaff,
    }

    console.log("Reports stats response:", responseData)
    res.json(responseData)
  } catch (error) {
    console.error("Error in reports stats endpoint:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
      totalSamples: 0,
      activeSamples: 0,
      disposedSamples: 0,
      totalStaff: 0,
    })
  }
})
`

    // Insert after system-overview API route
    const systemOverviewIndex = appContent.indexOf('app.get("/api/admin/system-overview"')

    if (systemOverviewIndex > -1) {
      // Find the end of the system-overview route
      let braceCount = 0
      let routeEndIndex = systemOverviewIndex
      let inRoute = false

      for (let i = systemOverviewIndex; i < appContent.length; i++) {
        if (appContent[i] === "{") {
          braceCount++
          inRoute = true
        } else if (appContent[i] === "}") {
          braceCount--
          if (inRoute && braceCount === 0) {
            routeEndIndex = i + 1
            break
          }
        }
      }

      // Find the next closing parenthesis and brace
      while (routeEndIndex < appContent.length && appContent[routeEndIndex] !== ")") {
        routeEndIndex++
      }
      routeEndIndex += 2 // Skip '))'

      const newContent =
        appContent.slice(0, routeEndIndex) + "\n" + apiRouteToAdd + "\n" + appContent.slice(routeEndIndex)
      fs.writeFileSync(appPath, newContent)
      console.log("✅ Added /api/admin/reports-stats route to app.js")
    } else {
      console.log("❌ Could not find where to insert the API route")
    }
  }

  console.log("\n📋 Next steps:")
  console.log("1. Restart your server: npm start")
  console.log("2. Login as admin")
  console.log("3. Visit: http://localhost:3000/admin-reports")
}

checkAdminReportsRoute()
