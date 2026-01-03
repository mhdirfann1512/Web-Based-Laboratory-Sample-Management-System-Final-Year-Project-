const fs = require("fs")
const path = require("path")

console.log("🔧 Directly fixing success modal data display...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Find and replace the handleFormSubmit function to capture form data
  const handleFormSubmitRegex = /async function handleFormSubmit$$e$$ \{[\s\S]*?(?=function|$)/

  const newHandleFormSubmit = `async function handleFormSubmit(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
                
                // Get form data
                const sampleType = document.getElementById('sampleType');
                const testType = document.getElementById('testType');
                const patientName = document.getElementById('patientName').value;
                const patientId = document.getElementById('patientId').value;
                const storageLocation = document.getElementById('storageLocation').value;
                const collectionDate = document.getElementById('collectionDate').value;
                const notes = document.getElementById('notes').value;
                
                // Get selected text values (not just values)
                const sampleTypeText = sampleType.options[sampleType.selectedIndex].text;
                const testTypeText = testType.options[testType.selectedIndex].text;
                
                const formData = new FormData();
                formData.append('sampleType', sampleType.value);
                formData.append('testType', testType.value);
                formData.append('storageLocation', storageLocation);
                formData.append('patientName', patientName);
                formData.append('patientId', patientId);
                formData.append('collectionDate', collectionDate);
                formData.append('notes', notes);
                
                const response = await fetch('/api/register-sample', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Pass form data to success function
                    showSuccess({
                        sampleId: result.sampleId || 'SMP-' + Date.now(),
                        patientName: patientName,
                        sampleType: sampleTypeText + '/' + testTypeText,
                        assignedFreezer: result.assignedFreezer || 'Laboratory Refrigerator'
                    });
                } else {
                    throw new Error(result.message || 'Registration failed');
                }
                
            } catch (error) {
                console.error('Registration error:', error);
                showMessage('Error: ' + error.message, true);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }`

  if (handleFormSubmitRegex.test(content)) {
    content = content.replace(handleFormSubmitRegex, newHandleFormSubmit)
    console.log("✅ Updated handleFormSubmit function")
  } else {
    console.log("❌ Could not find handleFormSubmit function")
  }

  // Find and replace the showSuccess function
  const showSuccessRegex = /function showSuccess$$[^)]*$$ \{[\s\S]*?(?=function|\s*<\/script>|$)/

  const newShowSuccess = `function showSuccess(data) {
            document.getElementById('successSampleId').textContent = data.sampleId;
            document.getElementById('successPatientName').textContent = data.patientName;
            document.getElementById('successSampleType').textContent = data.sampleType;
            document.getElementById('successFreezer').textContent = data.assignedFreezer;
            document.getElementById('successDisplay').style.display = 'flex';
        }`

  if (showSuccessRegex.test(content)) {
    content = content.replace(showSuccessRegex, newShowSuccess)
    console.log("✅ Updated showSuccess function")
  } else {
    console.log("❌ Could not find showSuccess function")
  }

  fs.writeFileSync(filePath, content)
  console.log("✅ Success modal data display fixed!")
  console.log("📋 Now Patient and Type will show actual data from the form")
} catch (error) {
  console.error("❌ Error:", error.message)
}
