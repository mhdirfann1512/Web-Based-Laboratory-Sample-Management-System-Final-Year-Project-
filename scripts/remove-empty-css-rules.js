const fs = require("fs")
const path = require("path")

console.log("🔧 Removing empty CSS rules from admin dashboard...")

const filePath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Remove empty CSS rules with /* replaced */ comments
  content = content.replace(/\s*\.[\w-]+\s*\{\s*\/\*\s*replaced\s*\*\/\s*\}/g, "")

  // Remove any remaining empty CSS rules
  content = content.replace(/\s*\.[\w-]+\s*\{\s*\}/g, "")

  // Clean up extra whitespace
  content = content.replace(/\n\s*\n\s*\n/g, "\n\n")

  fs.writeFileSync(filePath, content)

  console.log("✅ Empty CSS rules removed successfully!")
  console.log("📋 Your admin dashboard should now have no CSS validation warnings")
} catch (error) {
  console.error("❌ Error:", error.message)
}
