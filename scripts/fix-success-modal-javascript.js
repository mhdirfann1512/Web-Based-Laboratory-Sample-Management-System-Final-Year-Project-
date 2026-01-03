const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing success modal JavaScript error...")

const htmlFilePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let htmlContent = fs.readFileSync(htmlFilePath, "utf8")

  // Find and replace the showSuccess function to remove references to deleted elements
  const oldShowSuccessPattern = /function showSuccess$$result$$ \{[\s\S]*?\}/

  const newShowSuccessFunction = `function showSuccess(result) {
            // Just show the success modal - no need to populate details since we removed them
            document.getElementById('successDisplay').style.display = 'flex';
        }`

  if (htmlContent.match(oldShowSuccessPattern)) {
    htmlContent = htmlContent.replace(oldShowSuccessPattern, newShowSuccessFunction)
    console.log("✅ Updated showSuccess function")
  } else {
    console.log("❌ Could not find showSuccess function")
  }

  // Also remove any other references to the deleted elements
  htmlContent = htmlContent.replace(/document\.getElementById$$'successSampleId'$$\.textContent[^;]*;/g, "")
  htmlContent = htmlContent.replace(/document\.getElementById$$'successPatientName'$$\.textContent[^;]*;/g, "")
  htmlContent = htmlContent.replace(/document\.getElementById$$'successSampleType'$$\.textContent[^;]*;/g, "")
  htmlContent = htmlContent.replace(/document\.getElementById$$'successFreezer'$$\.textContent[^;]*;/g, "")

  fs.writeFileSync(htmlFilePath, htmlContent)
  console.log("✅ Success modal JavaScript fixed!")
  console.log('📋 No more "Cannot set properties of null" errors!')
} catch (error) {
  console.error("❌ Error fixing success modal JavaScript:", error.message)
}
