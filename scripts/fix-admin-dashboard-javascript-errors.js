const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing admin dashboard JavaScript errors...")

const filePath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Find and replace the broken JavaScript section
  const scriptStart = content.indexOf("<script>")
  const scriptEnd = content.indexOf("</script>") + 9

  if (scriptStart !== -1 && scriptEnd !== -1) {
    const beforeScript = content.substring(0, scriptStart)
    const afterScript = content.substring(scriptEnd)

    const newScript = `<script>
document.addEventListener('DOMContentLoaded', async () => {
    await loadSystemStats();
    setInterval(async () => {
        await loadSystemStats();
    }, 30000);
});

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
        const totalStaffElement = document.getElementById('totalStaff');
        const activeSamplesElement = document.getElementById('activeSamples');
        const systemHealthElement = document.getElementById('systemHealth');
        
        if (totalStaffElement) totalStaffElement.textContent = stats.totalStaff || '0';
        if (activeSamplesElement) activeSamplesElement.textContent = stats.activeSamples || '0';
        if (systemHealthElement) systemHealthElement.textContent = stats.systemHealth || 'Online';
        
    } catch (error) {
        console.error('Error loading system stats:', error);
        
        const totalStaffElement = document.getElementById('totalStaff');
        const activeSamplesElement = document.getElementById('activeSamples');
        const systemHealthElement = document.getElementById('systemHealth');
        
        if (totalStaffElement) totalStaffElement.textContent = 'Error';
        if (activeSamplesElement) activeSamplesElement.textContent = 'Error';
        if (systemHealthElement) systemHealthElement.textContent = 'Error';
    }
}
</script>`

    content = beforeScript + newScript + afterScript

    fs.writeFileSync(filePath, content)
    console.log("✅ JavaScript errors fixed!")
    console.log("📋 Now refresh your admin dashboard - it should show real data!")
  } else {
    console.log("❌ Could not find script section")
  }
} catch (error) {
  console.error("❌ Error:", error.message)
}
