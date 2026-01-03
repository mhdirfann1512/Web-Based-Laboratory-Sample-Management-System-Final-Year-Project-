const fs = require("fs")
const path = require("path")

console.log("🔍 Checking admin dashboard file...")

const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
const dashboardContent = fs.readFileSync(adminDashboardPath, "utf8")

// Check if loadSystemActivity function exists
const hasLoadSystemActivity = dashboardContent.includes("loadSystemActivity")
console.log("Has loadSystemActivity function:", hasLoadSystemActivity)

// Check if there's a script section
const hasScriptSection = dashboardContent.includes("<script>")
console.log("Has script section:", hasScriptSection)

// Find where the script section is
const scriptStart = dashboardContent.indexOf("<script>")
const scriptEnd = dashboardContent.lastIndexOf("</script>")

if (scriptStart !== -1 && scriptEnd !== -1) {
  console.log("Script section found at positions:", scriptStart, "to", scriptEnd)

  // Extract the script content
  const scriptContent = dashboardContent.slice(scriptStart, scriptEnd + 9)
  console.log("Current script section length:", scriptContent.length)

  // Check what functions are already there
  const functions = []
  if (scriptContent.includes("loadAdminProfile")) functions.push("loadAdminProfile")
  if (scriptContent.includes("loadSystemStats")) functions.push("loadSystemStats")
  if (scriptContent.includes("loadSystemActivity")) functions.push("loadSystemActivity")
  if (scriptContent.includes("showMessage")) functions.push("showMessage")

  console.log("Existing functions:", functions)

  // Now let's completely rewrite the script section with all functions
  const completeScript = `    <script>
        // Check authentication
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                await loadAdminProfile();
                await loadSystemStats();
                await loadSystemActivity();
            } catch (error) {
                console.error('Error loading dashboard:', error);
                window.location.href = '/login';
            }
        });

        async function loadAdminProfile() {
            try {
                const response = await fetch('/api/profile');
                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }
                
                const profile = await response.json();
                
                // Update profile information
                document.getElementById('adminName').textContent = profile.full_name || 'Administrator';
                document.getElementById('adminNameSidebar').textContent = profile.full_name || 'Administrator';
                document.getElementById('adminPosition').textContent = 'System Administrator';
                document.getElementById('adminId').textContent = \`ID: \${profile.admin_id || 'N/A'}\`;
                document.getElementById('adminDepartment').textContent = 'Administration';
                
                // Update profile picture if available
                const adminAvatar = document.getElementById('adminAvatar');
                if (profile.profile_picture) {
                    adminAvatar.src = profile.profile_picture;
                } else {
                    adminAvatar.src = '/images/admin-avatar.png';
                }
                
            } catch (error) {
                console.error('Error loading profile:', error);
                showMessage('Error loading profile information', true);
            }
        }

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
                document.getElementById('totalFreezers').textContent = stats.totalFreezers || '0';
                document.getElementById('sampleTypes').textContent = stats.sampleTypes || '0';
                
                // Add visual indicator for system health
                const systemHealthElement = document.getElementById('systemHealth');
                if (stats.systemHealth === 'Good' || stats.systemHealth === 'Excellent') {
                    systemHealthElement.style.color = '#10b981'; // Green color
                } else if (stats.systemHealth === 'Attention Required') {
                    systemHealthElement.style.color = '#f59e0b'; // Warning color
                } else {
                    systemHealthElement.style.color = '#ef4444'; // Error color
                }
                
            } catch (error) {
                console.error('Error loading system stats:', error);
                
                // Show more helpful error messages
                const errorMsg = error.message.includes('Failed to fetch') 
                    ? 'Connection Error' 
                    : 'Data Error';
                    
                document.getElementById('totalStaff').textContent = errorMsg;
                document.getElementById('activeSamples').textContent = errorMsg;
                document.getElementById('systemHealth').textContent = errorMsg;
                document.getElementById('totalFreezers').textContent = errorMsg;
                document.getElementById('sampleTypes').textContent = errorMsg;
                
                // Show error message to user
                showMessage('Failed to load system statistics. Please check your database connection.', true);
            }
        }

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

        function showMessage(message, isError = true) {
            const messageDiv = document.getElementById('message');
            if (!messageDiv) return;

            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.className = isError ? 'alert alert-error' : 'alert alert-success';

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    </script>`

  // Replace the entire script section
  const beforeScript = dashboardContent.slice(0, scriptStart)
  const afterScript = dashboardContent.slice(scriptEnd + 9)

  const newContent = beforeScript + completeScript + afterScript

  fs.writeFileSync(adminDashboardPath, newContent)
  console.log("✅ Completely rewrote the script section with all functions")
} else {
  console.log("❌ Could not find script section boundaries")
}

console.log("✅ Admin dashboard script section updated!")
