const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing admin dashboard HTML IDs...")

const filePath = path.join(__dirname, "../public/html/admin-dashboard.html")
let content = fs.readFileSync(filePath, "utf8")

// Add IDs to the stat values so JavaScript can update them
content = content.replace(
  '<div class="stat-item">\n                    <span>Total Users:</span>\n                    <span class="stat-value">25</span>',
  '<div class="stat-item">\n                    <span>Total Users:</span>\n                    <span class="stat-value" id="totalStaff">25</span>',
)

content = content.replace(
  '<div class="stat-item">\n                    <span>Active Samples:</span>\n                    <span class="stat-value">156</span>',
  '<div class="stat-item">\n                    <span>Active Samples:</span>\n                    <span class="stat-value" id="activeSamples">156</span>',
)

// Remove the empty stat item with 78%
content = content.replace(
  '<div class="stat-item">\n                    <span></span>\n                    <span class="stat-value">78%</span>\n                </div>',
  "",
)

// Add ID to system status
content = content.replace(
  '<span class="stat-value" style="color: #28a745;">Online</span>',
  '<span class="stat-value" id="systemHealth" style="color: #28a745;">Online</span>',
)

fs.writeFileSync(filePath, content)

console.log("✅ Fixed admin dashboard HTML:")
console.log('   - Added id="totalStaff" to Total Users value')
console.log('   - Added id="activeSamples" to Active Samples value')
console.log('   - Added id="systemHealth" to System Status value')
console.log("   - Removed the 78% storage capacity item")
console.log("📋 Now refresh your admin dashboard - it should show real data!")
