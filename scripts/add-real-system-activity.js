const fs = require("fs")
const path = require("path")

console.log("🔧 Adding real system activity data to admin dashboard...")

// First, add the API route to app.js
const appPath = path.join(__dirname, "../app.js")
let appContent = fs.readFileSync(appPath, "utf8")

// Add the system activity API route before the logout route
const systemActivityRoute = `
app.get("/api/admin/system-activity", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    // Get recent staff registrations
    const [recentStaff] = await db.promise().query(\`
      SELECT full_name, created_at, 'staff_registration' as activity_type
      FROM staff 
      ORDER BY created_at DESC 
      LIMIT 3
    \`)

    // Get recent sample registrations
    const [recentSamples] = await db.promise().query(\`
      SELECT s.sample_id, s.registration_date, s.patient_name, st.full_name as staff_name, 'sample_registration' as activity_type
      FROM samples s
      LEFT JOIN staff st ON s.staff_id = st.staff_id
      ORDER BY s.registration_date DESC 
      LIMIT 3
    \`)

    // Get recent sample disposals
    const [recentDisposals] = await db.promise().query(\`
      SELECT s.sample_id, s.disposal_date, s.patient_name, st.full_name as staff_name, 'sample_disposal' as activity_type
      FROM samples s
      LEFT JOIN staff st ON s.staff_id = st.staff_id
      WHERE s.status = 'disposed' AND s.disposal_date IS NOT NULL
      ORDER BY s.disposal_date DESC 
      LIMIT 3
    \`)

    // Combine all activities
    const activities = []

    // Add staff registrations
    recentStaff.forEach(staff => {
      activities.push({
        type: 'staff_registration',
        description: \`New staff member \${staff.full_name} registered\`,
        timestamp: staff.created_at,
        icon: 'fas fa-user-plus'
      })
    })

    // Add sample registrations
    recentSamples.forEach(sample => {
      activities.push({
        type: 'sample_registration',
        description: \`Sample \${sample.sample_id} registered by \${sample.staff_name || 'Unknown'}\`,
        timestamp: sample.registration_date,
        icon: 'fas fa-vial'
      })
    })

    // Add sample disposals
    recentDisposals.forEach(disposal => {
      activities.push({
        type: 'sample_disposal',
        description: \`Sample \${disposal.sample_id} disposed by \${disposal.staff_name || 'Unknown'}\`,
        timestamp: disposal.disposal_date,
        icon: 'fas fa-trash'
      })
    })

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Return top 5 activities
    res.json(activities.slice(0, 5))

  } catch (error) {
    console.error("Error fetching system activity:", error)
    res.status(500).json({ 
      message: "Server error",
      activities: []
    })
  }
})
`

// Find the logout route and insert before it
const logoutRouteIndex = appContent.indexOf('app.post("/logout"')
if (logoutRouteIndex !== -1) {
  appContent = appContent.slice(0, logoutRouteIndex) + systemActivityRoute + "\n" + appContent.slice(logoutRouteIndex)
  console.log("✅ Added system activity API route to app.js")
} else {
  console.log("❌ Could not find logout route in app.js")
}

fs.writeFileSync(appPath, appContent)

// Now update the admin dashboard HTML
const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
let dashboardContent = fs.readFileSync(adminDashboardPath, "utf8")

// Replace the loadSystemActivity function
const newLoadSystemActivity = `
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
        }`

// Replace the existing loadSystemActivity function
const functionStart = dashboardContent.indexOf("async function loadSystemActivity()")
if (functionStart !== -1) {
  const functionEnd = dashboardContent.indexOf("        }", functionStart) + 9
  dashboardContent =
    dashboardContent.slice(0, functionStart) + newLoadSystemActivity + dashboardContent.slice(functionEnd)
  console.log("✅ Updated loadSystemActivity function")
} else {
  console.log("❌ Could not find loadSystemActivity function")
}

fs.writeFileSync(adminDashboardPath, dashboardContent)

console.log("✅ System activity now fetches real data!")
console.log("📋 Restart your server and refresh the admin dashboard to see real activity")
