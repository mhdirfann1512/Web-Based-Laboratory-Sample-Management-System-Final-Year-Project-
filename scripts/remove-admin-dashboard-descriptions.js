const fs = require("fs")
const path = require("path")

console.log("🔧 Removing descriptions from Admin Dashboard...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  // Read the current admin dashboard file
  let content = fs.readFileSync(adminDashboardPath, "utf8")

  // Remove the specific descriptions
  content = content.replace("System administration and management portal", "")
  content = content.replace("Add, edit, and manage user accounts, roles, and permissions across the system.", "")
  content = content.replace("Oversee all sample operations, storage locations, and disposal processes.", "")
  content = content.replace("Generate comprehensive reports and analyze system performance metrics.", "")

  // Also remove any similar variations
  content = content.replace(
    "Create, edit, and manage system users and their permissions. Control access levels and monitor user activity.",
    "",
  )
  content = content.replace(
    "Oversee all sample operations, manage disposal schedules, and monitor compliance status.",
    "",
  )
  content = content.replace(
    "Generate comprehensive reports on system usage, sample tracking, and performance metrics.",
    "",
  )

  // Clean up any empty <p> tags that might be left
  content = content.replace(/<p>\s*<\/p>/g, "")
  content = content.replace(/<p><\/p>/g, "")

  // Write the updated content back to the file
  fs.writeFileSync(adminDashboardPath, content)

  console.log("✅ Successfully removed descriptions from admin dashboard")
  console.log("📄 Updated file:", adminDashboardPath)
  console.log("🔄 Please refresh your browser to see the changes")
} catch (error) {
  console.error("❌ Error updating admin dashboard:", error.message)
}
