const fs = require("fs")
const path = require("path")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Replace the hardcoded sampleConfigs with dynamic loading
  const newScript =
    "<script>\n" +
    "        let sampleTypes = [];\n" +
    "        let testTypes = {};\n" +
    "        let storageLocations = {};\n" +
    "\n" +
    "        document.addEventListener('DOMContentLoaded', function() {\n" +
    "            document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];\n" +
    "            loadStaffProfile();\n" +
    "            loadSampleTypes();\n" +
    "            document.getElementById('sampleType').addEventListener('change', handleSampleTypeChange);\n" +
    "            document.getElementById('sampleRegistrationForm').addEventListener('submit', handleFormSubmit);\n" +
    "        });\n" +
    "\n" +
    "        async function loadStaffProfile() {\n" +
    "            try {\n" +
    "                const response = await fetch('/api/profile');\n" +
    "                if (response.ok) {\n" +
    "                    const profile = await response.json();\n" +
    "                    document.getElementById('staffName').textContent = profile.full_name || 'Staff Member';\n" +
    "                }\n" +
    "            } catch (error) {\n" +
    "                console.error('Error loading profile:', error);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        async function loadSampleTypes() {\n" +
    "            try {\n" +
    "                const response = await fetch('/api/sample-types');\n" +
    "                if (response.ok) {\n" +
    "                    sampleTypes = await response.json();\n" +
    "                    const sampleTypeSelect = document.getElementById('sampleType');\n" +
    "                    \n" +
    "                    sampleTypeSelect.innerHTML = '<option value=\"\">Select sample type...</option>';\n" +
    "                    \n" +
    "                    sampleTypes.forEach(type => {\n" +
    "                        const option = document.createElement('option');\n" +
    "                        option.value = type.id;\n" +
    "                        option.textContent = type.name;\n" +
    "                        sampleTypeSelect.appendChild(option);\n" +
    "                    });\n" +
    "                }\n" +
    "            } catch (error) {\n" +
    "                console.error('Error loading sample types:', error);\n" +
    "                showMessage('Error loading sample types', true);\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        async function handleSampleTypeChange() {\n" +
    "            const sampleTypeId = document.getElementById('sampleType').value;\n" +
    "            const testTypeSelect = document.getElementById('testType');\n" +
    "            const storageLocationSelect = document.getElementById('storageLocation');\n" +
    "            \n" +
    "            testTypeSelect.innerHTML = '<option value=\"\">Select test type...</option>';\n" +
    "            storageLocationSelect.innerHTML = '<option value=\"\">Select storage location...</option>';\n" +
    "            \n" +
    "            if (sampleTypeId) {\n" +
    "                try {\n" +
    "                    const testResponse = await fetch('/api/sample-tests/' + sampleTypeId);\n" +
    "                    if (testResponse.ok) {\n" +
    "                        const tests = await testResponse.json();\n" +
    "                        tests.forEach(test => {\n" +
    "                            const option = document.createElement('option');\n" +
    "                            option.value = test.id;\n" +
    "                            option.textContent = test.name;\n" +
    "                            testTypeSelect.appendChild(option);\n" +
    "                        });\n" +
    "                        testTypeSelect.disabled = false;\n" +
    "                    }\n" +
    "                    \n" +
    "                    const storageResponse = await fetch('/api/sample-storage/' + sampleTypeId);\n" +
    "                    if (storageResponse.ok) {\n" +
    "                        const locations = await storageResponse.json();\n" +
    "                        locations.forEach(location => {\n" +
    "                            const option = document.createElement('option');\n" +
    "                            option.value = location.id;\n" +
    "                            option.textContent = location.name;\n" +
    "                            storageLocationSelect.appendChild(option);\n" +
    "                        });\n" +
    "                        storageLocationSelect.disabled = false;\n" +
    "                    }\n" +
    "                    \n" +
    "                    const idResponse = await fetch('/api/generate-sample-id/' + sampleTypeId);\n" +
    "                    if (idResponse.ok) {\n" +
    "                        const result = await idResponse.json();\n" +
    "                        document.getElementById('sampleId').textContent = result.sampleId;\n" +
    "                    }\n" +
    "                    \n" +
    "                } catch (error) {\n" +
    "                    console.error('Error loading sample data:', error);\n" +
    "                    showMessage('Error loading sample data', true);\n" +
    "                }\n" +
    "            } else {\n" +
    "                testTypeSelect.disabled = true;\n" +
    "                storageLocationSelect.disabled = true;\n" +
    "                clearAutoGeneratedFields();\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        function clearAutoGeneratedFields() {\n" +
    "            document.getElementById('sampleId').textContent = 'Will be generated automatically';\n" +
    "            document.getElementById('assignedFreezer').textContent = 'Will be assigned based on storage location';\n" +
    "        }\n" +
    "\n" +
    "        async function handleFormSubmit(e) {\n" +
    "            e.preventDefault();\n" +
    "            \n" +
    "            const submitBtn = document.getElementById('submitBtn');\n" +
    "            const originalText = submitBtn.innerHTML;\n" +
    "            \n" +
    "            try {\n" +
    "                submitBtn.disabled = true;\n" +
    "                submitBtn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Registering...';\n" +
    "                \n" +
    "                const formData = new FormData();\n" +
    "                formData.append('sampleTypeId', document.getElementById('sampleType').value);\n" +
    "                formData.append('testTypeId', document.getElementById('testType').value);\n" +
    "                formData.append('storageLocationId', document.getElementById('storageLocation').value);\n" +
    "                formData.append('patientName', document.getElementById('patientName').value);\n" +
    "                formData.append('patientId', document.getElementById('patientId').value);\n" +
    "                formData.append('collectionDate', document.getElementById('collectionDate').value);\n" +
    "                formData.append('notes', document.getElementById('notes').value);\n" +
    "                \n" +
    "                const response = await fetch('/api/register-sample', {\n" +
    "                    method: 'POST',\n" +
    "                    body: formData\n" +
    "                });\n" +
    "                \n" +
    "                const result = await response.json();\n" +
    "                \n" +
    "                if (response.ok) {\n" +
    "                    showSuccess(result);\n" +
    "                } else {\n" +
    "                    throw new Error(result.message || 'Registration failed');\n" +
    "                }\n" +
    "                \n" +
    "            } catch (error) {\n" +
    "                console.error('Registration error:', error);\n" +
    "                showMessage('Error: ' + error.message, true);\n" +
    "            } finally {\n" +
    "                submitBtn.disabled = false;\n" +
    "                submitBtn.innerHTML = originalText;\n" +
    "            }\n" +
    "        }\n" +
    "\n" +
    "        function showSuccess(result) {\n" +
    "            document.getElementById('successSampleId').textContent = result.sampleId;\n" +
    "            document.getElementById('successPatientName').textContent = result.patientName;\n" +
    "            document.getElementById('successSampleType').textContent = result.sampleType;\n" +
    "            document.getElementById('successFreezer').textContent = result.assignedFreezer;\n" +
    "            document.getElementById('successDisplay').style.display = 'flex';\n" +
    "        }\n" +
    "\n" +
    "        function showMessage(message, isError = false) {\n" +
    "            const messageDiv = document.getElementById('message');\n" +
    "            messageDiv.textContent = message;\n" +
    "            messageDiv.className = isError ? 'alert alert-error' : 'alert alert-success';\n" +
    "            messageDiv.style.display = 'block';\n" +
    "            \n" +
    "            setTimeout(() => {\n" +
    "                messageDiv.style.display = 'none';\n" +
    "            }, 5000);\n" +
    "        }\n" +
    "\n" +
    "        function registerAnother() {\n" +
    "            document.getElementById('successDisplay').style.display = 'none';\n" +
    "            document.getElementById('sampleRegistrationForm').reset();\n" +
    "            clearAutoGeneratedFields();\n" +
    "            document.getElementById('testType').disabled = true;\n" +
    "            document.getElementById('storageLocation').disabled = true;\n" +
    "            document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];\n" +
    "        }\n" +
    "\n" +
    "        function viewAllSamples() {\n" +
    "            window.location.href = '/view-samples';\n" +
    "        }\n" +
    "    </script>"

  // Find and replace the script section
  const scriptStart = content.indexOf("<script>")
  const scriptEnd = content.indexOf("</script>") + 9

  if (scriptStart !== -1 && scriptEnd !== -1) {
    content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd)

    fs.writeFileSync(filePath, content)
    console.log("✅ Successfully updated register-sample.html to load data from database!")
    console.log("📋 The form will now use:")
    console.log("   - Real sample types from your database")
    console.log("   - Dynamic test types based on sample type")
    console.log("   - Dynamic storage locations")
    console.log("   - Auto-generated sample IDs")
    console.log("   - Proper freezer assignment")
  } else {
    console.log("❌ Could not find script section to replace")
  }
} catch (error) {
  console.error("❌ Error updating file:", error.message)
}
