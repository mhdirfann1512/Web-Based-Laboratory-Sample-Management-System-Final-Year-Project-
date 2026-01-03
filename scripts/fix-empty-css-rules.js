const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing empty CSS rules in admin dashboard...")

const filePath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Remove empty CSS rulesets - these are the problematic lines
  content = content.replace(/\.left-section\s*{\s*}/g, "")
  content = content.replace(/\.right-section\s*{\s*}/g, "")
  content = content.replace(/\.action-cards\s*{\s*}/g, "")
  content = content.replace(/\.card-grid\s*{\s*}/g, "")
  content = content.replace(/\.card-row\s*{\s*}/g, "")
  content = content.replace(/\.card-col\s*{\s*}/g, "")
  content = content.replace(/\.col\s*{\s*}/g, "")
  content = content.replace(/\.row\s*{\s*}/g, "")
  content = content.replace(/\.action-cards\s*{\s*}/g, "")
  content = content.replace(/\.sidebar-right\s*{\s*}/g, "")

  // Remove any other empty rulesets
  content = content.replace(/\.[a-zA-Z0-9_-]+\s*{\s*}/g, "")

  // Clean up extra whitespace
  content = content.replace(/\n\s*\n\s*\n/g, "\n\n")

  fs.writeFileSync(filePath, content)

  console.log("✅ Empty CSS rules removed successfully!")
  console.log("📋 Admin dashboard CSS is now clean")
} catch (error) {
  console.error("❌ Error:", error.message)
}
