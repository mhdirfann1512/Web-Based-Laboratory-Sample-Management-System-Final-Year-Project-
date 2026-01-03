const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing nodemailer error in app.js...")

const appPath = path.join(__dirname, "..", "app.js")

try {
  // Read the current app.js file
  let appContent = fs.readFileSync(appPath, "utf8")

  // Fix the nodemailer error
  const originalLine = "const transporter = nodemailer.createTransporter({"
  const fixedLine = "const transporter = nodemailer.createTransport({"

  if (appContent.includes(originalLine)) {
    appContent = appContent.replace(originalLine, fixedLine)
    console.log("✅ Fixed: createTransporter → createTransport")
  } else if (appContent.includes(fixedLine)) {
    console.log("✅ Already fixed: createTransport is correct")
  } else {
    console.log("⚠️  Could not find nodemailer configuration line")
  }

  // Write the fixed content back
  fs.writeFileSync(appPath, appContent)
  console.log("✅ app.js has been fixed!")
  console.log("🚀 Now run: npm start")
} catch (error) {
  console.error("❌ Error fixing app.js:", error.message)
}
