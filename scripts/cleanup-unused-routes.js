const fs = require("fs")
const path = require("path")

console.log("🧹 Cleaning up unused routes from app.js...")

// Read the current app.js file
const appPath = path.join(__dirname, "..", "app.js")
let appContent = fs.readFileSync(appPath, "utf8")

// Routes to remove (since they're now handled by SPA)
const routesToRemove = ['app.get("/register-sample"', 'app.get("/test-samples"']

let removedCount = 0

routesToRemove.forEach((route) => {
  const routeRegex = new RegExp(`${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^}]*}`, "g")
  const matches = appContent.match(routeRegex)

  if (matches) {
    matches.forEach((match) => {
      console.log(`❌ Removing route: ${route}`)
      appContent = appContent.replace(match, "")
      removedCount++
    })
  }
})

// Clean up extra empty lines
appContent = appContent.replace(/\n\n\n+/g, "\n\n")

// Write the cleaned content back
fs.writeFileSync(appPath, appContent)

console.log(`✅ Cleanup complete! Removed ${removedCount} unused routes.`)
console.log("📁 You can now manually delete the unused HTML files:")
console.log("   - public/html/register-sample.html")
console.log("   - public/html/view-samples.html")
console.log("   - public/html/dispose-sample.html")
console.log("   - public/html/test-samples-simple.html")
