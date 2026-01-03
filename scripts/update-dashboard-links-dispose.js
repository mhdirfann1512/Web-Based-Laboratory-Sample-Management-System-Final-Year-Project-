const fs = require("fs")
const path = require("path")

console.log('🔧 Adding "Dispose Sample" links to dashboards...')

// Update staff dashboard
const staffDashboardPath = path.join(__dirname, "../public/html/staff-dashboard.html")
if (fs.existsSync(staffDashboardPath)) {
  let staffContent = fs.readFileSync(staffDashboardPath, "utf8")

  // Add dispose sample link to navigation if not already present
  if (!staffContent.includes("/dispose-sample")) {
    // Find the view samples link and add dispose sample link after it
    staffContent = staffContent.replace(
      /<a href="\/view-samples"[^>]*>[\s\S]*?<\/a>/,
      `$&
                        <a href="/dispose-sample" class="nav-link">
                            <i class="fas fa-trash-alt"></i> Dispose Sample
                        </a>`,
    )

    // Also add to quick actions if exists
    if (staffContent.includes("quick-actions")) {
      staffContent = staffContent.replace(/<div class="quick-actions"[\s\S]*?<\/div>/, (match) => {
        if (!match.includes("/dispose-sample")) {
          return match.replace(
            /<\/div>$/,
            `                    <a href="/dispose-sample" class="action-card dispose">
                                <i class="fas fa-trash-alt"></i>
                                <h3>Dispose Sample</h3>
                                <p>Search and dispose samples safely</p>
                            </a>
                        </div>`,
          )
        }
        return match
      })
    }

    fs.writeFileSync(staffDashboardPath, staffContent)
    console.log("✅ Updated staff dashboard")
  } else {
    console.log("ℹ️ Staff dashboard already has dispose sample link")
  }
} else {
  console.log("⚠️ Staff dashboard not found")
}

// Update admin dashboard
const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")
if (fs.existsSync(adminDashboardPath)) {
  let adminContent = fs.readFileSync(adminDashboardPath, "utf8")

  // Add dispose sample link to navigation if not already present
  if (!adminContent.includes("/dispose-sample")) {
    // Find the view samples link and add dispose sample link after it
    adminContent = adminContent.replace(
      /<a href="\/view-samples"[^>]*>[\s\S]*?<\/a>/,
      `$&
                        <a href="/dispose-sample" class="nav-link">
                            <i class="fas fa-trash-alt"></i> Dispose Sample
                        </a>`,
    )

    // Also add to quick actions if exists
    if (adminContent.includes("quick-actions")) {
      adminContent = adminContent.replace(/<div class="quick-actions"[\s\S]*?<\/div>/, (match) => {
        if (!match.includes("/dispose-sample")) {
          return match.replace(
            /<\/div>$/,
            `                    <a href="/dispose-sample" class="action-card dispose">
                                <i class="fas fa-trash-alt"></i>
                                <h3>Dispose Sample</h3>
                                <p>Search and dispose samples safely</p>
                            </a>
                        </div>`,
          )
        }
        return match
      })
    }

    fs.writeFileSync(adminDashboardPath, adminContent)
    console.log("✅ Updated admin dashboard")
  } else {
    console.log("ℹ️ Admin dashboard already has dispose sample link")
  }
} else {
  console.log("⚠️ Admin dashboard not found")
}

// Add CSS for dispose action card if needed
const cssPath = path.join(__dirname, "../public/css/dashboard.css")
if (fs.existsSync(cssPath)) {
  let cssContent = fs.readFileSync(cssPath, "utf8")

  if (!cssContent.includes(".action-card.dispose")) {
    cssContent += `

/* Dispose Sample Action Card */
.action-card.dispose {
    border-left-color: var(--danger-color);
}

.action-card.dispose:hover {
    border-left-color: #dc2626;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
}

.action-card.dispose i {
    color: var(--danger-color);
}
`

    fs.writeFileSync(cssPath, cssContent)
    console.log("✅ Added dispose sample CSS styles")
  } else {
    console.log("ℹ️ Dispose sample CSS already exists")
  }
} else {
  console.log("⚠️ Dashboard CSS not found")
}

console.log("🎉 Dashboard updates completed!")
