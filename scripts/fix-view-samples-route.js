// Script to verify and fix the view-samples route
const fs = require("fs")
const path = require("path")

function fixViewSamplesRoute() {
  console.log("🔧 Fixing view-samples route...")

  const appJsPath = path.join(__dirname, "../app.js")

  if (!fs.existsSync(appJsPath)) {
    console.error("❌ app.js file not found!")
    return
  }

  let content = fs.readFileSync(appJsPath, "utf8")

  // Check if the route exists
  const routeExists = content.includes('app.get("/view-samples"')
  console.log("Route exists:", routeExists ? "✅ Yes" : "❌ No")

  if (!routeExists) {
    console.log("🔧 Adding view-samples route...")

    // Find the position after the admin-dashboard route
    const adminDashboardIndex = content.indexOf('app.get("/admin-dashboard"')

    if (adminDashboardIndex !== -1) {
      // Find the end of the admin-dashboard route
      const routeEnd = content.indexOf("})", adminDashboardIndex) + 2

      // Insert the new route
      const newRoute = `

// Route for view samples page
app.get("/view-samples", (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.redirect("/login?error=Please login to access this page")
  }
  res.sendFile(path.join(__dirname, "public/html/view-samples.html"))
})`

      content = content.slice(0, routeEnd) + newRoute + content.slice(routeEnd)

      // Write the updated content
      fs.writeFileSync(appJsPath, content)
      console.log("✅ Route added successfully!")
    } else {
      console.error("❌ Could not find admin-dashboard route to insert after")
    }
  }

  // Check if HTML file exists
  const htmlPath = path.join(__dirname, "../public/html/view-samples.html")
  const htmlExists = fs.existsSync(htmlPath)
  console.log("HTML file exists:", htmlExists ? "✅ Yes" : "❌ No")

  if (!htmlExists) {
    console.error("❌ view-samples.html file is missing!")
    console.log("💡 The HTML file should be at: public/html/view-samples.html")
  }

  console.log("\n🔄 Please restart the server after this fix:")
  console.log("1. Stop the server (Ctrl+C)")
  console.log("2. Run: npm start")
  console.log("3. Test: http://localhost:3000/view-samples")
}

fixViewSamplesRoute()
