const fs = require("fs")
const path = require("path")

console.log("🔧 Removing Staff View link from admin dashboard...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(adminDashboardPath, "utf8")

  // Remove the Staff View link from the navigation
  content = content.replace(
    /<a href="\/staff-dashboard" class="nav-link">\s*<i class="fas fa-users"><\/i> Staff View\s*<\/a>/g,
    "",
  )

  fs.writeFileSync(adminDashboardPath, content)

  console.log("✅ Staff View link removed from admin dashboard")
  console.log("📋 The admin header now only shows Profile and Logout")
} catch (error) {
  console.error("❌ Error:", error.message)
}
