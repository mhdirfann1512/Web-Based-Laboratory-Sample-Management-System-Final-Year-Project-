const fs = require("fs")
const path = require("path")

console.log("🔧 Removing subtitle and progress dots from register sample page...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Remove the subtitle text
  content = content.replace(/<p>Enter sample details to register a new specimen in the system<\/p>/g, "")

  // Remove the progress dots
  content = content.replace(/<div class="progress-dots">[\s\S]*?<\/div>/g, "")

  // Also remove any standalone progress dots
  content = content.replace(/<div[^>]*class="[^"]*progress[^"]*"[^>]*>[\s\S]*?<\/div>/g, "")

  // Remove the dots CSS and any related styling
  content = content.replace(/\.progress-dots[\s\S]*?}/g, "")

  // Clean up any extra spacing
  content = content.replace(/\n\s*\n\s*\n/g, "\n\n")

  fs.writeFileSync(filePath, content)

  console.log("✅ Successfully removed subtitle and progress dots!")
  console.log("📄 Updated register-sample.html")
} catch (error) {
  console.error("❌ Error:", error.message)
}
