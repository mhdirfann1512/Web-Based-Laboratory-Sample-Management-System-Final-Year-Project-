const fs = require("fs")
const path = require("path")

console.log("🔧 Adding View All Samples function to admin dashboard...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(adminDashboardPath, "utf8")

  // Find the User Management section and add View All Samples above it
  const userManagementSection = `                    <!-- User Management -->
                    <div class="action-card" onclick="window.location.href='/manage-users'">`

  const viewAllSamplesSection = `                    <!-- View All Samples -->
                    <div class="action-card" onclick="window.location.href='/view-samples'">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div class="card-title">View All Samples</div>
                        </div>
                        <a href="/view-samples" class="btn">
                            <i class="fas fa-list"></i> View All Samples
                        </a>
                    </div>

                    <!-- User Management -->
                    <div class="action-card" onclick="window.location.href='/manage-users'">`

  if (content.includes(userManagementSection)) {
    content = content.replace(userManagementSection, viewAllSamplesSection)
    console.log("✅ Added View All Samples section above Manage Users")
  } else {
    console.log("❌ Could not find User Management section to replace")
  }

  fs.writeFileSync(adminDashboardPath, content)
  console.log("✅ Admin dashboard updated successfully!")
  console.log("📋 View All Samples function added above Manage Users")
} catch (error) {
  console.error("❌ Error updating admin dashboard:", error.message)
}
