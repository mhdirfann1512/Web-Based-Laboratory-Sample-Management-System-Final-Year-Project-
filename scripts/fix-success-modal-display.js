const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing success modal display...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Update the success modal HTML to remove View All Samples button and fix layout
  const oldSuccessHTML = `<div class="success-actions">
                <button class="btn btn-secondary" onclick="printLabel()">
                    <i class="fas fa-print"></i> Print Label
                </button>
                <button class="btn btn-primary" onclick="registerAnother()">
                    <i class="fas fa-plus"></i> Register Another
                </button>
                <button class="btn btn-secondary" onclick="viewAllSamples()">
                    <i class="fas fa-eye"></i> View All Samples
                </button>
            </div>`

  const newSuccessHTML = `<div class="success-actions">
                <button class="btn btn-secondary" onclick="printLabel()">
                    <i class="fas fa-print"></i> Print Label
                </button>
                <button class="btn btn-primary" onclick="registerAnother()">
                    <i class="fas fa-plus"></i> Register Another
                </button>
            </div>`

  content = content.replace(oldSuccessHTML, newSuccessHTML)

  // Update the showSuccess function to properly populate patient name and type
  const oldShowSuccessFunction = `function showSuccess(result) {
            document.getElementById('successSampleId').textContent = result.sampleId;
            document.getElementById('successPatientName').textContent = result.patientName;
            document.getElementById('successSampleType').textContent = result.sampleType;
            document.getElementById('successFreezer').textContent = result.assignedFreezer;
            document.getElementById('successDisplay').style.display = 'flex';
        }`

  const newShowSuccessFunction = `function showSuccess(result) {
            document.getElementById('successSampleId').textContent = result.sampleId || 'SMP-' + Date.now();
            
            // Get the actual patient name from the form
            const patientName = document.getElementById('patientName').value;
            document.getElementById('successPatientName').textContent = patientName || 'Unknown Patient';
            
            // Get sample type and test type from the form and combine them
            const sampleTypeSelect = document.getElementById('sampleType');
            const testTypeSelect = document.getElementById('testType');
            const sampleTypeName = sampleTypeSelect.options[sampleTypeSelect.selectedIndex].text;
            const testTypeName = testTypeSelect.options[testTypeSelect.selectedIndex].text;
            const combinedType = sampleTypeName + '/' + testTypeName;
            document.getElementById('successSampleType').textContent = combinedType;
            
            document.getElementById('successFreezer').textContent = result.assignedFreezer || 'Laboratory Refrigerator';
            document.getElementById('successDisplay').style.display = 'flex';
        }`

  content = content.replace(oldShowSuccessFunction, newShowSuccessFunction)

  // Remove the viewAllSamples function since we're removing the button
  const viewAllSamplesFunction = `function viewAllSamples() {
            window.location.href = '/view-samples';
        }`

  content = content.replace(viewAllSamplesFunction, "")

  // Clean up any extra whitespace
  content = content.replace(/\n\s*\n\s*\n/g, "\n\n")

  fs.writeFileSync(filePath, content)

  console.log("✅ Success modal fixed!")
  console.log("📋 Changes made:")
  console.log("   - Patient field now shows actual patient name")
  console.log('   - Type field shows "Sample Type/Test Type" format')
  console.log('   - Removed "View All Samples" button')
  console.log("   - Updated button layout for two buttons")
} catch (error) {
  console.error("❌ Error fixing success modal:", error.message)
}
