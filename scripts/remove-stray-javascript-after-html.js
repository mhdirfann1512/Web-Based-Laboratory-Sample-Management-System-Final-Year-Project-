const fs = require("fs")
const path = require("path")

console.log("🔧 Removing stray JavaScript from register-sample.html...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  // Read the current file
  const content = fs.readFileSync(filePath, "utf8")

  console.log("📖 Current file size:", content.length, "characters")

  // Find the closing </html> tag
  const htmlEndIndex = content.lastIndexOf("</html>")

  if (htmlEndIndex === -1) {
    console.log("❌ Could not find closing </html> tag")
    // Early return if closing tag not found
    return;
  }

  // Get everything up to and including </html>
  const cleanContent = content.substring(0, htmlEndIndex + 7) // 7 is length of '</html>'

  console.log("✂️ Removing", content.length - cleanContent.length, "characters after </html>")

  // Write the cleaned content back to the file
  fs.writeFileSync(filePath, cleanContent, "utf8")

  console.log("✅ Successfully cleaned register-sample.html")
  console.log("📝 New file size:", cleanContent.length, "characters")
  console.log("🎉 The visible JavaScript at the bottom should now be gone!")
} catch (error) {
  console.error("❌ Error cleaning file:", error.message)
}
