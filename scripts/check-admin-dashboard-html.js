const fs = require("fs")
const path = require("path")

console.log("🔍 Checking admin dashboard HTML...")

const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
const content = fs.readFileSync(adminDashboardPath, "utf8")

// Check if the elements exist
if (content.includes('id="totalStaff"')) {
  console.log("✅ Found totalStaff element")
} else {
  console.log("❌ Missing totalStaff element")
}

if (content.includes('id="activeSamples"')) {
  console.log("✅ Found activeSamples element")
} else {
  console.log("❌ Missing activeSamples element")
}

// Check if loadSystemStats function exists
if (content.includes("loadSystemStats")) {
  console.log("✅ Found loadSystemStats function")
} else {
  console.log("❌ Missing loadSystemStats function")
}

// Check if the function is being called
if (content.includes("await loadSystemStats()")) {
  console.log("✅ loadSystemStats is being called")
} else {
  console.log("❌ loadSystemStats is not being called")
}

console.log("\n📋 Check your browser console (F12) when on admin dashboard to see any JavaScript errors")
