const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing admin dashboard layout to fit on one page...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

try {
  let content = fs.readFileSync(adminDashboardPath, "utf8")

  // Update CSS to make layout more compact and fit on one page
  const newCSS = `
        .left-section {
            flex: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            height: fit-content;
        }

        .action-card {
            background: white;
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
            height: fit-content;
        }

        .action-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }

        .card-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        }

        .card-title {
            color: #333;
            font-size: 1rem;
            font-weight: 600;
        }

        .btn {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.3s;
            text-align: center;
            font-weight: 500;
            font-size: 0.9rem;
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(102, 126, 234, 0.4);
        }

        .content-grid {
            display: flex;
            gap: 1rem;
            flex: 1;
            height: calc(100vh - 200px);
            overflow: hidden;
        }

        .right-section {
            flex: 1;
            height: fit-content;
        }

        .activity-list {
            max-height: 250px;
            overflow-y: auto;
        }

        @media (max-width: 1200px) {
            .left-section {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
            }
            
            .content-grid {
                flex-direction: column;
                height: auto;
            }
            
            .left-section {
                grid-template-columns: 1fr;
            }
        }
    `

  // Replace the existing left-section, action-card, and related CSS
  content = content.replace(/\.left-section\s*{[^}]*}/g, ".left-section { /* replaced */ }")

  content = content.replace(/\.action-card\s*{[^}]*}/g, ".action-card { /* replaced */ }")

  content = content.replace(/\.card-header\s*{[^}]*}/g, ".card-header { /* replaced */ }")

  content = content.replace(/\.card-icon\s*{[^}]*}/g, ".card-icon { /* replaced */ }")

  content = content.replace(/\.card-title\s*{[^}]*}/g, ".card-title { /* replaced */ }")

  content = content.replace(/\.btn\s*{[^}]*}/g, ".btn { /* replaced */ }")

  content = content.replace(/\.content-grid\s*{[^}]*}/g, ".content-grid { /* replaced */ }")

  content = content.replace(/\.right-section\s*{[^}]*}/g, ".right-section { /* replaced */ }")

  content = content.replace(/\.activity-list\s*{[^}]*}/g, ".activity-list { /* replaced */ }")

  // Insert the new CSS before the closing </style> tag
  content = content.replace("</style>", newCSS + "\n    </style>")

  fs.writeFileSync(adminDashboardPath, content)

  console.log("✅ Admin dashboard layout fixed!")
  console.log("📋 Now all sections will fit on one page in a 2x2 grid layout")
} catch (error) {
  console.error("❌ Error fixing admin dashboard layout:", error.message)
}
