const fs = require("fs")
const path = require("path")

console.log("🔧 Making admin dashboard cards bigger...")

const filePath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Replace the action-card CSS to make cards bigger
  content = content.replace(
    /\.action-card\s*\{[^}]*\}/g,
    `.action-card {
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
        }`,
  )

  // Also update the left-section to use more space
  content = content.replace(
    /\.left-section\s*\{[^}]*\}/g,
    `.left-section {
            flex: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            height: 100%;
        }`,
  )

  fs.writeFileSync(filePath, content)
  console.log("✅ Admin dashboard cards made bigger!")
  console.log("📋 Cards now have 200px height and better spacing")
} catch (error) {
  console.error("❌ Error:", error.message)
}
