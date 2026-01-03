const fs = require("fs")
const path = require("path")

console.log("🔍 Diagnosing Admin Dashboard Issue...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  // Check if file exists
  if (!fs.existsSync(adminDashboardPath)) {
    console.log("❌ Admin dashboard file does not exist!")
    return;
  }

  // Read the file
  const content = fs.readFileSync(adminDashboardPath, "utf8")

  console.log("✅ File exists")
  console.log(`📄 File size: ${content.length} characters`)

  // Check for key elements
  const checks = [
    { name: "HTML structure", pattern: /<html.*?>.*<\/html>/s },
    { name: "Head section", pattern: /<head>.*<\/head>/s },
    { name: "Body section", pattern: /<body>.*<\/body>/s },
    { name: "Sidebar", pattern: /class="sidebar"/ },
    { name: "Main content", pattern: /class="main-content"/ },
    { name: "Action grid", pattern: /class="action-grid"/ },
    { name: "CSS styles", pattern: /<style>.*<\/style>/s },
    { name: "JavaScript", pattern: /<script>.*<\/script>/s },
  ]

  console.log("\n🔍 Content Analysis:")
  checks.forEach((check) => {
    const found = check.pattern.test(content)
    console.log(`${found ? "✅" : "❌"} ${check.name}: ${found ? "Found" : "Missing"}`)
  })

  // Check for specific content
  const hasUserProfile = content.includes('class="user-profile')
  const hasActionCards = content.includes('class="action-card')
  const hasSystemStats = content.includes("System Overview")

  console.log("\n📋 Specific Elements:")
  console.log(`${hasUserProfile ? "✅" : "❌"} User profile section`)
  console.log(`${hasActionCards ? "✅" : "❌"} Action cards`)
  console.log(`${hasSystemStats ? "✅" : "❌"} System stats`)

  // Show first 500 characters to see what's actually in the file
  console.log("\n📄 File Preview (first 500 chars):")
  console.log(content.substring(0, 500))
  console.log("...")

  // Check if it's the old version
  if (content.includes("Loading...") && !content.includes("System Administrator")) {
    console.log("\n⚠️  File appears to be the old version with loading placeholders")
    console.log("🔧 Recommendation: The file needs to be updated with the new content")
  }
} catch (error) {
  console.error("❌ Error reading file:", error.message)
}

console.log("\n🔧 Troubleshooting Steps:")
console.log("1. Try hard refresh (Ctrl+F5) to clear browser cache")
console.log("2. Check browser console for JavaScript errors")
console.log("3. Verify the file was saved correctly")
console.log("4. Check if CSS files are loading properly")
