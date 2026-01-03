const fs = require("fs")
const path = require("path")

function checkAppRoutes() {
  console.log("🔍 Checking app.js routes...\n")

  const appPath = path.join(__dirname, "..", "app.js")

  if (!fs.existsSync(appPath)) {
    console.error("❌ app.js file not found!")
    return
  }

  const appContent = fs.readFileSync(appPath, "utf8")

  // Check for view-samples route
  const viewSamplesRoute =
    appContent.includes('app.get("/view-samples"') || appContent.includes("app.get('/view-samples'")
  console.log(`📄 /view-samples route: ${viewSamplesRoute ? "✅ Found" : "❌ Missing"}`)

  // Check for API routes
  const apiSamplesRoute = appContent.includes('app.get("/api/samples"') || appContent.includes("app.get('/api/samples'")
  console.log(`🔌 /api/samples route: ${apiSamplesRoute ? "✅ Found" : "❌ Missing"}`)

  // Check for test-samples route
  const testSamplesRoute =
    appContent.includes('app.get("/test-samples"') || appContent.includes("app.get('/test-samples'")
  console.log(`🧪 /test-samples route: ${testSamplesRoute ? "✅ Found" : "❌ Missing"}`)

  if (!testSamplesRoute) {
    console.log("\n📝 Adding test-samples route...")

    // Find a good place to insert the route (after other routes)
    const routeToAdd = `
// Test samples route for debugging
app.get("/test-samples", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "test-samples-simple.html"));
});
`

    // Insert before the error handling middleware
    const errorHandlerIndex =
      appContent.indexOf("// Error handling middleware") || appContent.indexOf("app.use((err, req, res, next)")

    if (errorHandlerIndex > -1) {
      const newContent =
        appContent.slice(0, errorHandlerIndex) + routeToAdd + "\n" + appContent.slice(errorHandlerIndex)
      fs.writeFileSync(appPath, newContent)
      console.log("✅ Added /test-samples route to app.js")
    } else {
      console.log("❌ Could not find where to insert the route")
    }
  }

  console.log("\n📋 Next steps:")
  console.log("1. Restart your server: npm start")
  console.log("2. Login to your application")
  console.log("3. Visit: http://localhost:3000/test-samples")
  console.log("4. Check browser console for detailed debug info")
}

checkAppRoutes()
