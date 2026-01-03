const fs = require("fs")
const path = require("path")

console.log("🔍 Finding and fixing success modal function...")

const htmlFilePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let htmlContent = fs.readFileSync(htmlFilePath, "utf8")

  // First, let's see what success-related functions exist
  const successFunctionMatches = htmlContent.match(/function\s+\w*[Ss]uccess\w*\s*$$[^)]*$$\s*\{/g)
  if (successFunctionMatches) {
    console.log("📋 Found success functions:", successFunctionMatches)
  }

  // Look for where success data is being set
  const successDataMatches = htmlContent.match(/getElementById$$['"]success\w+['"]$$\.textContent\s*=/g)
  if (successDataMatches) {
    console.log("📋 Found success data assignments:", successDataMatches)
  }

  // Find the handleFormSubmit function and fix it
  const handleFormSubmitRegex =
    /(async function handleFormSubmit$$e$$\s*\{[\s\S]*?if\s*$$\s*response\.ok\s*$$\s*\{[\s\S]*?)showSuccess$$result$$;([\s\S]*?\}[\s\S]*?\})/

  if (htmlContent.match(handleFormSubmitRegex)) {
    console.log("✅ Found handleFormSubmit function")

    // Replace the showSuccess call with proper data extraction and display
    htmlContent = htmlContent.replace(
      handleFormSubmitRegex,
      `$1
                    // Get form data before showing success
                    const patientName = document.getElementById('patientName').value;
                    const sampleType = document.getElementById('sampleType').selectedOptions[0].text;
                    const testType = document.getElementById('testType').selectedOptions[0].text;
                    
                    // Show success with proper data
                    showSuccess({
                        ...result,
                        patientName: patientName,
                        sampleType: sampleType,
                        testType: testType,
                        typeDisplay: sampleType + '/' + testType
                    });$2`,
    )

    console.log("✅ Updated handleFormSubmit function")
  }

  // Find and fix the showSuccess function
  const showSuccessRegex =
    /(function showSuccess$$result$$\s*\{[\s\S]*?)document\.getElementById$$'successPatientName'$$\.textContent\s*=\s*result\.patientName;([\s\S]*?)document\.getElementById$$'successSampleType'$$\.textContent\s*=\s*result\.sampleType;([\s\S]*?\})/

  if (htmlContent.match(showSuccessRegex)) {
    console.log("✅ Found showSuccess function")

    htmlContent = htmlContent.replace(
      showSuccessRegex,
      `$1document.getElementById('successPatientName').textContent = result.patientName || 'Unknown Patient';$2document.getElementById('successSampleType').textContent = result.typeDisplay || 'Unknown Type';$3`,
    )

    console.log("✅ Updated showSuccess function")
  } else {
    // If showSuccess function doesn't exist in expected format, let's find any function that sets success data
    const anySuccessRegex = /(document\.getElementById$$'successSampleId'$$\.textContent\s*=[\s\S]*?;)/

    if (htmlContent.match(anySuccessRegex)) {
      console.log("✅ Found success data assignment, adding patient and type")

      htmlContent = htmlContent.replace(
        anySuccessRegex,
        `$1
            
            // Set patient name and type
            const patientNameElement = document.getElementById('successPatientName');
            const sampleTypeElement = document.getElementById('successSampleType');
            
            if (patientNameElement) {
                patientNameElement.textContent = document.getElementById('patientName').value || 'Unknown Patient';
            }
            
            if (sampleTypeElement) {
                const sampleType = document.getElementById('sampleType').selectedOptions[0]?.text || 'Unknown';
                const testType = document.getElementById('testType').selectedOptions[0]?.text || 'Unknown';
                sampleTypeElement.textContent = sampleType + '/' + testType;
            }`,
      )

      console.log("✅ Added patient and type data assignment")
    }
  }

  // Write the updated content back to the file
  fs.writeFileSync(htmlFilePath, htmlContent, "utf8")

  console.log("✅ Success modal function fixed!")
  console.log("📋 Now the Patient and Type fields will show actual data")
} catch (error) {
  console.error("❌ Error fixing success function:", error.message)
}
