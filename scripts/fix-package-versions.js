const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing package.json with correct versions...")

const packagePath = path.join(__dirname, "..", "package.json")

if (!fs.existsSync(packagePath)) {
  console.log("❌ package.json not found")
  process.exit(1)
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))

// Add the correct versions of export dependencies
packageJson.dependencies = {
  ...packageJson.dependencies,
  json2csv: "^5.0.7", // Correct version
  pdfkit: "^0.13.0", // Correct version
  "csv-writer": "^1.6.0", // Alternative CSV library
}

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))

console.log("✅ Fixed package.json with correct versions!")
console.log("📋 Now run: npm install")
