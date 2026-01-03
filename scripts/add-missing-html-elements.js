const fs = require("fs")
const path = require("path")

console.log("🔧 Adding missing HTML elements for real data...")

const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
let content = fs.readFileSync(adminDashboardPath, "utf8")

// Find the quick-stats section and update it
const quickStatsStart = content.indexOf('<div class="quick-stats card">')
if (quickStatsStart !== -1) {
  const quickStatsEnd = content.indexOf("</div>", quickStatsStart + 200)

  const newQuickStats = `<div class="quick-stats card">
                    <h4>System Overview</h4>
                    <div class="stat-item">
                        <span class="stat-label">Total Users:</span>
                        <span class="stat-value" id="totalStaff">Loading...</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Active Samples:</span>
                        <span class="stat-value" id="activeSamples">Loading...</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">System Health:</span>
                        <span class="stat-value" id="systemHealth">Loading...</span>
                    </div>
                </div>`

  content = content.slice(0, quickStatsStart) + newQuickStats + content.slice(quickStatsEnd + 6)
  console.log("✅ Updated quick-stats section with proper IDs")
}

fs.writeFileSync(adminDashboardPath, content)

console.log("✅ Added missing HTML elements:")
console.log("   - totalStaff element")
console.log("   - activeSamples element")
console.log("   - systemHealth element")
console.log("📋 Now refresh your admin dashboard!")
