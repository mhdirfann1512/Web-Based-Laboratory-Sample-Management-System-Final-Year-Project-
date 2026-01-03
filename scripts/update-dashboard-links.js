const fs = require("fs")
const path = require("path")

function updateDashboardLinks() {
  console.log("🔧 Updating dashboard links to include view-samples...\n")

  // Update staff dashboard
  const staffDashboardPath = path.join(__dirname, "../public/html/staff-dashboard.html")
  const adminDashboardPath = path.join(__dirname, "../public/html/admin-dashboard.html")

  try {
    // Update staff dashboard
    if (fs.existsSync(staffDashboardPath)) {
      let staffContent = fs.readFileSync(staffDashboardPath, "utf8")

      // Check if view-samples link already exists
      if (!staffContent.includes("/view-samples")) {
        // Add view-samples link to staff dashboard
        const staffLinkToAdd = `
                    <a href="/view-samples" class="quick-action-card">
                        <i class="fas fa-list"></i>
                        <h3>View Samples</h3>
                        <p>View and manage your registered samples</p>
                    </a>`

        // Find the register sample link and add after it
        const registerSamplePattern = /<a href="\/register-sample"[^>]*>[\s\S]*?<\/a>/
        if (registerSamplePattern.test(staffContent)) {
          staffContent = staffContent.replace(registerSamplePattern, (match) => {
            return match + staffLinkToAdd
          })

          fs.writeFileSync(staffDashboardPath, staffContent)
          console.log("✅ Updated staff dashboard with view-samples link")
        } else {
          console.log("⚠️ Could not find register-sample link in staff dashboard")
        }
      } else {
        console.log("✅ Staff dashboard already has view-samples link")
      }
    } else {
      console.log("⚠️ Staff dashboard file not found")
    }

    // Update admin dashboard
    if (fs.existsSync(adminDashboardPath)) {
      let adminContent = fs.readFileSync(adminDashboardPath, "utf8")

      // Check if view-samples link already exists
      if (!adminContent.includes("/view-samples")) {
        // Add view-samples link to admin dashboard
        const adminLinkToAdd = `
                    <a href="/view-samples" class="quick-action-card">
                        <i class="fas fa-list"></i>
                        <h3>View All Samples</h3>
                        <p>View and manage all samples in the system</p>
                    </a>`

        // Find the admin-samples link and add after it
        const adminSamplesPattern = /<a href="\/admin-samples"[^>]*>[\s\S]*?<\/a>/
        if (adminSamplesPattern.test(adminContent)) {
          adminContent = adminContent.replace(adminSamplesPattern, (match) => {
            return match + adminLinkToAdd
          })

          fs.writeFileSync(adminDashboardPath, adminContent)
          console.log("✅ Updated admin dashboard with view-samples link")
        } else {
          console.log("⚠️ Could not find admin-samples link in admin dashboard")
        }
      } else {
        console.log("✅ Admin dashboard already has view-samples link")
      }
    } else {
      console.log("⚠️ Admin dashboard file not found")
    }

    console.log("\n✅ Dashboard updates completed!")
  } catch (error) {
    console.error("❌ Error updating dashboards:", error.message)
  }
}

updateDashboardLinks()
