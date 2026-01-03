const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing admin dashboard to use real data...")

const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
let content = fs.readFileSync(adminDashboardPath, "utf8")

// Find and replace the loadSystemStats function
const newLoadSystemStats = `
        async function loadSystemStats() {
            try {
                console.log('Fetching system stats...');
                const response = await fetch('/api/admin/system-overview');
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                const stats = await response.json();
                console.log('Received stats:', stats);
                
                // Update system stats with real data
                document.getElementById('totalStaff').textContent = stats.totalStaff || '0';
                document.getElementById('activeSamples').textContent = stats.activeSamples || '0';
                document.getElementById('systemHealth').textContent = stats.systemHealth || 'Unknown';
                
                // Remove storage capacity references
                const storageElement = document.getElementById('storageCapacity');
                if (storageElement) {
                    storageElement.parentElement.style.display = 'none';
                }
                
            } catch (error) {
                console.error('Error loading system stats:', error);
                
                // Show error in console but keep trying
                document.getElementById('totalStaff').textContent = 'Error';
                document.getElementById('activeSamples').textContent = 'Error';
                document.getElementById('systemHealth').textContent = 'Error';
            }
        }`

// Replace the existing function
const functionStart = content.indexOf("async function loadSystemStats()")
if (functionStart !== -1) {
  const functionEnd = content.indexOf("        }", functionStart) + 9
  content = content.slice(0, functionStart) + newLoadSystemStats + content.slice(functionEnd)
  console.log("✅ Updated loadSystemStats function")
} else {
  console.log("❌ Could not find loadSystemStats function")
}

// Remove storage capacity HTML elements
content = content.replace(
  /<div class="stat-item">\s*<span class="stat-label">Storage Units:<\/span>[\s\S]*?<\/div>/g,
  "",
)
content = content.replace(
  /<div class="stat-item">\s*<span class="stat-label">Sample Types:<\/span>[\s\S]*?<\/div>/g,
  "",
)

fs.writeFileSync(adminDashboardPath, content)

console.log("✅ Admin dashboard updated to use real data")
console.log("📋 Now restart your server and refresh the admin dashboard")
