const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing success modal data display...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Find and replace the showSuccess function
  const showSuccessRegex = /function showSuccess$$result$$ \{[\s\S]*?\n {8}\}/

  const newShowSuccessFunction = `function showSuccess(result) {
            // Get form data to display in success modal
            const patientName = document.getElementById('patientName').value;
            const sampleType = document.getElementById('sampleType').selectedOptions[0].text;
            const testType = document.getElementById('testType').selectedOptions[0].text;
            
            // Update success modal with actual data
            document.getElementById('successSampleId').textContent = result.sampleId || 'Generated ID';
            document.getElementById('successPatientName').textContent = patientName || 'Unknown Patient';
            document.getElementById('successSampleType').textContent = sampleType + '/' + testType;
            document.getElementById('successFreezer').textContent = result.assignedFreezer || 'Not assigned';
            
            // Show the success modal
            document.getElementById('successDisplay').style.display = 'flex';
        }`

  if (showSuccessRegex.test(content)) {
    content = content.replace(showSuccessRegex, newShowSuccessFunction)
    console.log("✅ Updated showSuccess function")
  } else {
    console.log("❌ Could not find showSuccess function to replace")
  }

  // Also update the handleFormSubmit function to pass form data
  const handleFormSubmitRegex = /if $$response\.ok$$ \{[\s\S]*?showSuccess$$result$$;[\s\S]*?\}/

  const newHandleFormSubmitSuccess = `if (response.ok) {
                    // Add form data to result for success display
                    result.patientName = document.getElementById('patientName').value;
                    result.sampleType = document.getElementById('sampleType').selectedOptions[0].text;
                    result.testType = document.getElementById('testType').selectedOptions[0].text;
                    showSuccess(result);
                }`

  if (handleFormSubmitRegex.test(content)) {
    content = content.replace(handleFormSubmitRegex, newHandleFormSubmitSuccess)
    console.log("✅ Updated form submit success handling")
  }

  fs.writeFileSync(filePath, content)
  console.log("✅ Success modal data display fixed!")
  console.log("📋 Now the Patient and Type fields will show actual data instead of N/A")
} catch (error) {
  console.error("❌ Error fixing success modal:", error.message)
}
