const fs = require("fs")
const path = require("path")

console.log("🔧 Adding real data to admin dashboard...")

const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
const appJsPath = path.join(__dirname, "../app.js")

// Add API route to app.js
let appContent = fs.readFileSync(appJsPath, "utf8")

const recentActivityRoute = `
app.get('/api/admin/recent-activity', async (req, res) => {
  if (!req.session.user || req.session.user.type !== 'admin') {
    return res.status(401).json({ message: 'Admin access required' });
  }

  try {
    const [recentSamples] = await db.promise().query(\`
      SELECT 
        s.sample_id,
        s.patient_name,
        s.registration_date,
        st.full_name as staff_name
      FROM samples s
      LEFT JOIN staff st ON s.staff_id = st.staff_id
      ORDER BY s.registration_date DESC
      LIMIT 10
    \`);

    const activities = recentSamples.map(sample => ({
      type: 'registration',
      description: \`Sample \${sample.sample_id} registered for \${sample.patient_name}\`,
      staff: sample.staff_name || 'Unknown',
      timestamp: sample.registration_date
    }));

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
`

if (!appContent.includes("/api/admin/recent-activity")) {
  const insertPosition = appContent.lastIndexOf("app.use((err, req, res, next)")
  appContent = appContent.slice(0, insertPosition) + recentActivityRoute + "\n\n" + appContent.slice(insertPosition)
  fs.writeFileSync(appJsPath, appContent)
  console.log("✅ Added API route")
}

// Update admin dashboard HTML
let content = fs.readFileSync(adminDashboardPath, "utf8")

const newScript = `
document.addEventListener('DOMContentLoaded', async () => {
    await loadSystemStats();
    await loadRecentActivity();
    setInterval(async () => {
        await loadSystemStats();
        await loadRecentActivity();
    }, 30000);
});

async function loadSystemStats() {
    try {
        const response = await fetch('/api/admin/system-overview');
        const stats = await response.json();
        
        document.getElementById('totalStaff').textContent = stats.totalStaff || '0';
        document.getElementById('activeSamples').textContent = stats.activeSamples || '0';
        document.getElementById('systemHealth').textContent = stats.systemHealth || 'Unknown';
        document.getElementById('totalFreezers').textContent = stats.totalFreezers || '0';
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentActivity() {
    try {
        const response = await fetch('/api/admin/recent-activity');
        const activities = await response.json();
        
        const activityList = document.getElementById('systemActivity');
        
        if (activities.length === 0) {
            activityList.innerHTML = '<p>No recent activity</p>';
            return;
        }
        
        let html = '';
        activities.forEach(activity => {
            const timeAgo = getTimeAgo(new Date(activity.timestamp));
            html += \`
                <div class="activity-item">
                    <div class="activity-content">
                        <p><strong>\${activity.description}</strong></p>
                        <small>by \${activity.staff} • \${timeAgo}</small>
                    </div>
                </div>
            \`;
        });
        
        activityList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' min ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' hr ago';
    return Math.floor(diffInSeconds / 86400) + ' days ago';
}
`

const scriptStart = content.indexOf("<script>")
const scriptEnd = content.indexOf("</script>") + 9

if (scriptStart !== -1) {
  content = content.slice(0, scriptStart) + "<script>" + newScript + "</script>" + content.slice(scriptEnd)
  fs.writeFileSync(adminDashboardPath, content)
  console.log("✅ Updated admin dashboard with real data")
}
