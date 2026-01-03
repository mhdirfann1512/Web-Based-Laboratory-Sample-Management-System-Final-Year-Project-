const fs = require("fs")
const path = require("path")

function checkFrontendJS() {
  console.log("🔍 Checking view-samples.html JavaScript...\n")

  const filePath = path.join(__dirname, "../public/html/view-samples.html")

  if (!fs.existsSync(filePath)) {
    console.log("❌ view-samples.html not found!")
    return
  }

  const content = fs.readFileSync(filePath, "utf8")

  // Check for key JavaScript functions
  const checks = [
    { name: "loadSamples function", pattern: /function loadSamples$$$$/ },
    { name: "API fetch call", pattern: /fetch$$['"`]\/api\/samples['"`]$$/ },
    { name: "displaySamples function", pattern: /function displaySamples$$$$/ },
    { name: "DOMContentLoaded listener", pattern: /addEventListener\(['"`]DOMContentLoaded['"`]/ },
    { name: "loadUserProfile function", pattern: /function loadUserProfile$$$$/ },
    { name: "Error handling", pattern: /catch\s*$$\s*error\s*$$/ },
  ]

  console.log("📋 JavaScript function checks:")
  checks.forEach((check) => {
    if (check.pattern.test(content)) {
      console.log(`✅ ${check.name} - Found`)
    } else {
      console.log(`❌ ${check.name} - Missing`)
    }
  })

  // Check for common issues
  console.log("\n🔍 Checking for common issues:")

  if (content.includes("console.log")) {
    console.log("✅ Console logging present (good for debugging)")
  } else {
    console.log("⚠️  No console logging found")
  }

  if (content.includes("showMessage")) {
    console.log("✅ Error message function present")
  } else {
    console.log("❌ Error message function missing")
  }

  if (content.includes("/api/samples")) {
    console.log("✅ API endpoint reference found")
  } else {
    console.log("❌ API endpoint reference missing")
  }

  // Extract and show the loadSamples function
  const loadSamplesMatch = content.match(/async function loadSamples$$$$[^}]*\{[^}]*\}/s)
  if (loadSamplesMatch) {
    console.log("\n📄 loadSamples function:")
    console.log(loadSamplesMatch[0].substring(0, 300) + "...")
  }
}

checkFrontendJS()
