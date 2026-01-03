const fs = require("fs")
const path = require("path")

console.log("🔍 Checking logout routes in app.js...")

const appPath = path.join(__dirname, "..", "app.js")

try {
  let appContent = fs.readFileSync(appPath, "utf8")

  // Check if logout routes exist
  const hasGetLogout = appContent.includes('app.get("/logout"') || appContent.includes("app.get('/logout'")
  const hasPostLogout = appContent.includes('app.post("/logout"') || appContent.includes("app.post('/logout'")

  console.log(`GET /logout route exists: ${hasGetLogout}`)
  console.log(`POST /logout route exists: ${hasPostLogout}`)

  let needsUpdate = false

  // Add GET logout route if missing
  if (!hasGetLogout) {
    console.log("➕ Adding GET /logout route...")

    const getLogoutRoute = `
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).send("Error during logout")
    }
    res.redirect("/login?message=You have been logged out")
  })
})
`

    // Find a good place to insert (before the POST /logout if it exists, or before error handlers)
    const insertPoint =
      appContent.indexOf('app.post("/logout"') !== -1
        ? appContent.indexOf('app.post("/logout"')
        : appContent.indexOf("app.use((err, req, res, next)")

    if (insertPoint !== -1) {
      appContent = appContent.slice(0, insertPoint) + getLogoutRoute + "\n" + appContent.slice(insertPoint)
      needsUpdate = true
    }
  }

  // Add POST logout route if missing
  if (!hasPostLogout) {
    console.log("➕ Adding POST /logout route...")

    const postLogoutRoute = `
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).send("Error during logout")
    }
    res.redirect("/login?message=You have been logged out")
  })
})
`

    // Insert before error handlers
    const insertPoint = appContent.indexOf("app.use((err, req, res, next)")
    if (insertPoint !== -1) {
      appContent = appContent.slice(0, insertPoint) + postLogoutRoute + "\n" + appContent.slice(insertPoint)
      needsUpdate = true
    }
  }

  if (needsUpdate) {
    fs.writeFileSync(appPath, appContent)
    console.log("✅ Logout routes added successfully!")
    console.log("📝 Updated app.js with logout functionality")
  } else {
    console.log("✅ Logout routes already exist - no changes needed")
  }

  console.log("\n🚀 Logout should now work at:")
  console.log("   - GET  http://localhost:3000/logout")
  console.log("   - POST /logout (for logout buttons)")
} catch (error) {
  console.error("❌ Error fixing logout routes:", error.message)
  process.exit(1)
}
