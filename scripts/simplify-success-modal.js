const fs = require("fs")
const path = require("path")

console.log("🔧 Simplifying success modal...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Find and replace the success modal content
  const successModalRegex = /<div id="successDisplay" class="success-overlay">[\s\S]*?<\/div>\s*<\/div>/

  const newSuccessModal = `<div id="successDisplay" class="success-overlay">
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Sample Registered Successfully!</h2>
            <div class="success-actions">
                <button class="btn btn-secondary" onclick="printLabel()">
                    <i class="fas fa-print"></i> Print Label
                </button>
                <button class="btn btn-primary" onclick="registerAnother()">
                    <i class="fas fa-plus"></i> Register Another
                </button>
            </div>
        </div>
    </div>`

  if (successModalRegex.test(content)) {
    content = content.replace(successModalRegex, newSuccessModal)
    console.log("✅ Success modal simplified")
  } else {
    console.log("❌ Could not find success modal to replace")
  }

  // Also remove any references to success details in JavaScript
  content = content.replace(/document\.getElementById$$'successSampleId'$$\.textContent = .*?;/g, "")
  content = content.replace(/document\.getElementById$$'successPatientName'$$\.textContent = .*?;/g, "")
  content = content.replace(/document\.getElementById$$'successSampleType'$$\.textContent = .*?;/g, "")
  content = content.replace(/document\.getElementById$$'successFreezer'$$\.textContent = .*?;/g, "")

  // Update the showSuccess function to be simpler
  const showSuccessRegex = /function showSuccess$$result$$ \{[\s\S]*?\}/
  const newShowSuccess = `function showSuccess(result) {
            document.getElementById('successDisplay').style.display = 'flex';
        }`

  if (showSuccessRegex.test(content)) {
    content = content.replace(showSuccessRegex, newShowSuccess)
    console.log("✅ showSuccess function simplified")
  }

  fs.writeFileSync(filePath, content)
  console.log("✅ Success modal simplified!")
  console.log("📋 Now the modal will only show:")
  console.log("   ✓ Green checkmark")
  console.log('   ✓ "Sample Registered Successfully!" text')
  console.log("   ✓ Print Label button")
  console.log("   ✓ Register Another button")
  console.log("   ✓ No details (Sample ID, Patient, Type, Freezer removed)")
} catch (error) {
  console.error("❌ Error:", error.message)
}
