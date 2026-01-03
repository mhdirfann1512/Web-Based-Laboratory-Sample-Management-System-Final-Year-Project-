const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing system activity function in admin dashboard...")

const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
const dashboardContent = fs.readFileSync(adminDashboardPath, "utf8")

// Find the script section and add the missing function
const scriptSectionStart = dashboardContent.indexOf("<script>")
const scriptSectionEnd = dashboardContent.indexOf("</script>")

if (scriptSectionStart !== -1 && scriptSectionEnd !== -1) {
  const beforeScript = dashboardContent.slice(0, scriptSectionEnd)
  const afterScript = dashboardContent.slice(scriptSectionEnd)

  // Add the complete system activity functions
  const systemActivityFunctions = `
        async function loadSystemActivity() {
            try {
                console.log('Fetching system activity...');
                const response = await fetch('/api/admin/system-activity');
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                const activities = await response.json();
                console.log('Received activities:', activities);
                
                const activityList = document.getElementById('systemActivity');
                
                if (activities.length === 0) {
                    activityList.innerHTML = \`
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-info-circle"></i>
                            </div>
                            <div class="activity-content">
                                <p>No recent system activity</p>
                                <small>System is ready for use</small>
                            </div>
                        </div>
                    \`;
                    return;
                }
                
                // Clear existing content
                activityList.innerHTML = '';
                
                // Add each activity
                activities.forEach(activity => {
                    const activityItem = document.createElement('div');
                    activityItem.className = 'activity-item';
                    
                    const timeAgo = getTimeAgo(new Date(activity.timestamp));
                    
                    activityItem.innerHTML = \`
                        <div class="activity-icon">
                            <i class="\${activity.icon}"></i>
                        </div>
                        <div class="activity-content">
                            <p>\${activity.description}</p>
                            <small>\${timeAgo}</small>
                        </div>
                    \`;
                    
                    activityList.appendChild(activityItem);
                });
                
            } catch (error) {
                console.error('Error loading system activity:', error);
                
                // Show error message
                const activityList = document.getElementById('systemActivity');
                activityList.innerHTML = \`
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="activity-content">
                            <p>Error loading system activity</p>
                            <small>Please check system status</small>
                        </div>
                    </div>
                \`;
            }
        }

        function getTimeAgo(date) {
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            
            if (diffInSeconds < 60) {
                return 'Just now';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return \`\${minutes} minute\${minutes > 1 ? 's' : ''} ago\`;
            } else if (diffInSeconds < 86400) {
                const hours = Math.floor(diffInSeconds / 3600);
                return \`\${hours} hour\${hours > 1 ? 's' : ''} ago\`;
            } else {
                const days = Math.floor(diffInSeconds / 86400);
                return \`\${days} day\${days > 1 ? 's' : ''} ago\`;
            }
        }

`

  // Remove any existing loadSystemActivity function first
  let scriptContent = beforeScript
  const existingFunctionStart = scriptContent.indexOf("async function loadSystemActivity()")
  if (existingFunctionStart !== -1) {
    // Find the end of the function
    let braceCount = 0
    let functionEnd = existingFunctionStart
    let inFunction = false

    for (let i = existingFunctionStart; i < scriptContent.length; i++) {
      if (scriptContent[i] === "{") {
        braceCount++
        inFunction = true
      } else if (scriptContent[i] === "}") {
        braceCount--
        if (inFunction && braceCount === 0) {
          functionEnd = i + 1
          break
        }
      }
    }

    // Remove the existing function
    scriptContent = scriptContent.slice(0, existingFunctionStart) + scriptContent.slice(functionEnd)
    console.log("✅ Removed existing loadSystemActivity function")
  }

  // Add the new functions
  const newContent = scriptContent + systemActivityFunctions + afterScript

  fs.writeFileSync(adminDashboardPath, newContent)
  console.log("✅ Added complete system activity functions to admin dashboard")
} else {
  console.log("❌ Could not find script section in admin dashboard")
}

console.log("✅ System activity function fixed!")
console.log("📋 Restart your server and refresh the admin dashboard")
