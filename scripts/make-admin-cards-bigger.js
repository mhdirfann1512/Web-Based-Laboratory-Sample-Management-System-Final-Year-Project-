const fs = require("fs")
const path = require("path")

console.log("🔧 Making admin dashboard cards bigger...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(adminDashboardPath, "utf8")

  // Find and replace the action-card CSS to make cards bigger
  const oldActionCardCSS = `.action-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }`

  const newActionCardCSS = `.action-card {
            background: white;
            border-radius: 10px;
            padding: 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
            height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }`

  content = content.replace(oldActionCardCSS, newActionCardCSS)

  // Also update the left-section grid to fill available space
  const oldLeftSectionCSS = `.left-section {
            flex: 2;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }`

  const newLeftSectionCSS = `.left-section {
            flex: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            height: 100%;
        }`

  content = content.replace(oldLeftSectionCSS, newLeftSectionCSS)

  fs.writeFileSync(adminDashboardPath, content)
  console.log("✅ Admin dashboard cards made bigger!")
  console.log("📋 Cards now fill the available space properly")
} catch (error) {
  console.error("❌ Error:", error.message)
}
