const fs = require("fs")
const path = require("path")

function checkManageUsersRoute() {
  console.log("🔍 Checking manage-users route...\n")

  const appPath = path.join(__dirname, "..", "app.js")

  if (!fs.existsSync(appPath)) {
    console.error("❌ app.js file not found!")
    return
  }

  const appContent = fs.readFileSync(appPath, "utf8")

  // Check for manage-users route
  const manageUsersRoute =
    appContent.includes('app.get("/manage-users"') || appContent.includes("app.get('/manage-users'")
  console.log(`📄 /manage-users route: ${manageUsersRoute ? "✅ Found" : "❌ Missing"}`)

  // Check for API route
  const apiUsersRoute =
    appContent.includes('app.get("/api/admin/users"') || appContent.includes("app.get('/api/admin/users'")
  console.log(`🔌 /api/admin/users route: ${apiUsersRoute ? "✅ Found" : "❌ Missing"}`)

  // Check if HTML file exists
  const htmlPath = path.join(__dirname, "..", "public", "html", "manage-users.html")
  const htmlExists = fs.existsSync(htmlPath)
  console.log(`📄 manage-users.html file: ${htmlExists ? "✅ Found" : "❌ Missing"}`)

  if (!manageUsersRoute) {
    console.log("\n❌ Route is missing from app.js")
    console.log("📝 The route should be added to app.js")
  }

  if (!htmlExists) {
    console.log("\n❌ HTML file is missing")
    console.log("📝 The manage-users.html file should be in public/html/")
  }

  console.log("\n📋 Next steps:")
  console.log("1. Make sure the route is in app.js")
  console.log("2. Make sure the HTML file exists")
  console.log("3. Restart your server: npm start")
  console.log("4. Login as admin")
  console.log("5. Visit: http://localhost:3000/manage-users")
}

checkManageUsersRoute()
