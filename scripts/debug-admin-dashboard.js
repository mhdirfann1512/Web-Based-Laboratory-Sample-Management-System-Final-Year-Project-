const fs = require("fs")
const path = require("path")

console.log("🔍 Debugging Admin Dashboard Display Issues...\n")

// Check if admin dashboard file exists and has content
const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  if (fs.existsSync(adminDashboardPath)) {
    const content = fs.readFileSync(adminDashboardPath, "utf8")

    console.log("✅ Admin dashboard file exists")
    console.log(`📄 File size: ${content.length} characters`)

    // Check for key elements
    const checks = [
      { name: "Sidebar content", pattern: /class="sidebar"/ },
      { name: "Action cards", pattern: /class="action-grid"/ },
      { name: "System stats", pattern: /class="quick-stats"/ },
      { name: "CSS styles", pattern: /<style>/ },
      { name: "JavaScript", pattern: /<script>/ },
      { name: "Profile loading", pattern: /loadAdminProfile/ },
      { name: "System stats loading", pattern: /loadSystemStats/ },
    ]

    console.log("\n🔍 Content Analysis:")
    checks.forEach((check) => {
      const found = check.pattern.test(content)
      console.log(`${found ? "✅" : "❌"} ${check.name}: ${found ? "Found" : "Missing"}`)
    })

    // Check CSS file references
    console.log("\n📋 CSS References:")
    const cssRefs = content.match(/href="[^"]*\.css[^"]*"/g) || []
    cssRefs.forEach((ref) => {
      console.log(`   ${ref}`)
    })

    // Check if the file is properly formatted
    if (content.length < 1000) {
      console.log("\n⚠️  WARNING: File seems too small, might be corrupted or incomplete")
    }
  } else {
    console.log("❌ Admin dashboard file not found!")
  }

  // Check CSS files
  console.log("\n🎨 Checking CSS Files:")
  const cssFiles = ["public/css/style.css", "public/css/dashboard.css", "public/css/admin.css"]

  cssFiles.forEach((cssFile) => {
    const cssPath = path.join(__dirname, "..", cssFile)
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, "utf8")
      console.log(`✅ ${cssFile} exists (${cssContent.length} chars)`)
    } else {
      console.log(`❌ ${cssFile} missing`)
    }
  })

  console.log("\n🔧 Recommendations:")
  console.log("1. Check browser console for JavaScript errors")
  console.log("2. Verify CSS files are loading properly")
  console.log("3. Check if /api/profile endpoint is working")
  console.log("4. Ensure database connection is active")
  console.log("5. Try hard refresh (Ctrl+F5) to clear cache")
} catch (error) {
  console.error("❌ Error checking admin dashboard:", error.message)
}
