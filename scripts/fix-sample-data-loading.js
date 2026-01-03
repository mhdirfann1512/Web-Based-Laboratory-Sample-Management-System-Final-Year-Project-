const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing sample data loading from database...")

// Fix the register-sample.html file
const registerSamplePath = path.join(__dirname, "..", "public", "html", "register-sample.html")
let htmlContent = fs.readFileSync(registerSamplePath, "utf8")

// Replace the hardcoded sample types with dynamic loading
const oldSampleTypeOptions = `<option value="">Select sample type...</option>
                        <option value="Blood">Blood</option>
                        <option value="Tissue">Tissue</option>
                        <option value="Urine">Urine</option>
                        <option value="Saliva">Saliva</option>
                        <option value="Serum">Serum</option>
                        <option value="Plasma">Plasma</option>
                        <option value="CSF">CSF</option>
                        <option value="Biopsy">Biopsy</option>
                        <option value="Other">Other</option>`

const newSampleTypeOptions = `<option value="">Select sample type...</option>`

// Replace hardcoded options with dynamic placeholder
htmlContent = htmlContent.replace(oldSampleTypeOptions, newSampleTypeOptions)

// Update the JavaScript section to properly load from database
const oldJavaScript = htmlContent.substring(htmlContent.indexOf("<script>"), htmlContent.lastIndexOf("</script>") + 9)

const newJavaScript = `<script>
        let sampleTypes = [];
        let allTests = [];
        let allStorageLocations = [];

        document.addEventListener('DOMContentLoaded', async function() {
            console.log('🚀 Initializing register sample page...');
            await loadStaffProfile();
            await loadSampleTypes();
            
            // Set today's date as default
            document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];
            
            // Setup event listeners
            setupEventListeners();
        });

        async function loadStaffProfile() {
            try {
                console.log('👤 Loading staff profile...');
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const profile = await response.json();
                    document.getElementById('staffName').textContent = profile.full_name || 'Staff Member';
                    console.log('✅ Staff profile loaded:', profile.full_name);
                } else {
                    console.warn('⚠️ Could not load staff profile');
                }
            } catch (error) {
                console.error('❌ Error loading profile:', error);
            }
        }

        async function loadSampleTypes() {
            try {
                console.log('📡 Fetching sample types from database...');
                const response = await fetch('/api/sample-types');
                
                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }
                
                sampleTypes = await response.json();
                console.log('✅ Sample types loaded from database:', sampleTypes);
                
                const sampleTypeSelect = document.getElementById('sampleType');
                
                // Clear existing options
                sampleTypeSelect.innerHTML = '<option value="">Select sample type...</option>';
                
                // Add sample types from database
                if (sampleTypes && sampleTypes.length > 0) {
                    sampleTypes.forEach(type => {
                        const option = document.createElement('option');
                        option.value = type.type_id;
                        option.textContent = type.type_name;
                        sampleTypeSelect.appendChild(option);
                        console.log(\`   Added: \${type.type_name} (ID: \${type.type_id})\`);
                    });
                    console.log(\`✅ Populated \${sampleTypes.length} sample types\`);
                } else {
                    console.warn('⚠️ No sample types found in database');
                    sampleTypeSelect.innerHTML = '<option value="">No sample types available</option>';
                }
                
            } catch (error) {
                console.error('❌ Error loading sample types:', error);
                showMessage('Error loading sample types: ' + error.message, true);
                
                // Fallback to show error in dropdown
                const sampleTypeSelect = document.getElementById('sampleType');
                sampleTypeSelect.innerHTML = '<option value="">Error loading sample types</option>';
            }
        }

        function setupEventListeners() {
            // Sample type change handler
            document.getElementById('sampleType').addEventListener('change', handleSampleTypeChange);
            
            // Storage location change handler
            document.getElementById('storageLocation').addEventListener('change', handleStorageLocationChange);
            
            // Form submission handler
            document.getElementById('sampleRegistrationForm').addEventListener('submit', handleFormSubmission);
        }

        async function handleSampleTypeChange(e) {
            const typeId = e.target.value;
            const testSelect = document.getElementById('testType');
            const storageSelect = document.getElementById('storageLocation');
            
            console.log('🔄 Sample type changed to ID:', typeId);
            
            // Reset dependent fields
            testSelect.innerHTML = '<option value="">Loading tests...</option>';
            storageSelect.innerHTML = '<option value="">Loading storage locations...</option>';
            testSelect.disabled = true;
            storageSelect.disabled = true;
            
            // Clear auto-generated fields
            clearAutoGeneratedFields();
            
            if (!typeId) {
                testSelect.innerHTML = '<option value="">Select sample type first...</option>';
                storageSelect.innerHTML = '<option value="">Select sample type first...</option>';
                return;
            }
            
            try {
                // Load tests for this sample type
                console.log('📡 Loading tests for sample type ID:', typeId);
                const testsResponse = await fetch(\`/api/sample-tests/\${typeId}\`);
                
                if (testsResponse.ok) {
                    allTests = await testsResponse.json();
                    console.log('✅ Tests loaded:', allTests);
                    
                    testSelect.innerHTML = '<option value="">Select test type...</option>';
                    if (allTests && allTests.length > 0) {
                        allTests.forEach(test => {
                            const option = document.createElement('option');
                            option.value = test.test_id;
                            option.textContent = test.test_name;
                            testSelect.appendChild(option);
                        });
                        testSelect.disabled = false;
                        console.log(\`✅ Populated \${allTests.length} test types\`);
                    } else {
                        testSelect.innerHTML = '<option value="">No tests available for this sample type</option>';
                        console.warn('⚠️ No tests found for sample type:', typeId);
                    }
                } else {
                    throw new Error(\`Failed to load tests: \${testsResponse.status}\`);
                }
                
                // Load storage locations for this sample type
                console.log('📡 Loading storage locations for sample type ID:', typeId);
                const storageResponse = await fetch(\`/api/sample-storage/\${typeId}\`);
                
                if (storageResponse.ok) {
                    allStorageLocations = await storageResponse.json();
                    console.log('✅ Storage locations loaded:', allStorageLocations);
                    
                    storageSelect.innerHTML = '<option value="">Select storage location...</option>';
                    if (allStorageLocations && allStorageLocations.length > 0) {
                        allStorageLocations.forEach(storage => {
                            const option = document.createElement('option');
                            option.value = storage.storage_id;
                            const displayText = storage.storage_name + 
                                (storage.temperature_range ? \` (\${storage.temperature_range})\` : '');
                            option.textContent = displayText;
                            storageSelect.appendChild(option);
                        });
                        storageSelect.disabled = false;
                        console.log(\`✅ Populated \${allStorageLocations.length} storage locations\`);
                    } else {
                        storageSelect.innerHTML = '<option value="">No storage locations available for this sample type</option>';
                        console.warn('⚠️ No storage locations found for sample type:', typeId);
                    }
                } else {
                    throw new Error(\`Failed to load storage locations: \${storageResponse.status}\`);
                }
                
            } catch (error) {
                console.error('❌ Error loading dependent data:', error);
                showMessage('Error loading test types and storage locations: ' + error.message, true);
                
                testSelect.innerHTML = '<option value="">Error loading tests</option>';
                storageSelect.innerHTML = '<option value="">Error loading storage locations</option>';
            }
        }

        async function handleStorageLocationChange(e) {
            const storageId = e.target.value;
            
            if (!storageId) {
                clearAutoGeneratedFields();
                return;
            }
            
            try {
                console.log('🏠 Assigning freezer for storage ID:', storageId);
                
                // Get freezer assignment
                const freezerResponse = await fetch(\`/api/assign-freezer/\${storageId}\`);
                if (freezerResponse.ok) {
                    const freezerData = await freezerResponse.json();
                    console.log('✅ Freezer assigned:', freezerData);
                    
                    // Update assigned freezer field
                    document.getElementById('assignedFreezer').textContent = 
                        freezerData.freezer_name || 'No suitable freezer found';
                    
                    // Generate sample ID preview
                    await generateSampleIdPreview();
                    
                    // Get AI expiry prediction
                    await predictExpiry();
                } else {
                    throw new Error(\`Freezer assignment failed: \${freezerResponse.status}\`);
                }
            } catch (error) {
                console.error('❌ Error assigning freezer:', error);
                showMessage('Error assigning freezer: ' + error.message, true);
            }
        }

        async function generateSampleIdPreview() {
            try {
                console.log('🆔 Generating sample ID preview...');
                const response = await fetch('/api/generate-sample-id');
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Generated sample ID:', data.sample_id);
                    document.getElementById('sampleId').textContent = data.sample_id;
                } else {
                    throw new Error(\`Sample ID generation failed: \${response.status}\`);
                }
            } catch (error) {
                console.error('❌ Error generating sample ID:', error);
                document.getElementById('sampleId').textContent = 'Error generating ID';
            }
        }

        async function predictExpiry() {
            const sampleType = document.getElementById('sampleType').value;
            const testType = document.getElementById('testType').value;
            const storageLocation = document.getElementById('storageLocation').value;
            
            if (!sampleType || !testType || !storageLocation) {
                console.log('⏳ Waiting for all selections before AI prediction...');
                return;
            }
            
            try {
                console.log('🤖 Requesting AI expiry prediction...');
                const response = await fetch('/api/predict-expiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sampleType, testType, storageLocation })
                });
                
                if (response.ok) {
                    const prediction = await response.json();
                    console.log('✅ AI prediction received:', prediction);
                    
                    if (prediction.success) {
                        // Update AI prediction display
                        updateAIPredictionDisplay(prediction);
                    } else {
                        throw new Error(prediction.message || 'AI prediction failed');
                    }
                } else {
                    throw new Error(\`AI prediction API error: \${response.status}\`);
                }
            } catch (error) {
                console.error('❌ AI prediction error:', error);
                showAIPredictionError(error.message);
            }
        }

        function updateAIPredictionDisplay(prediction) {
            // This function will be implemented when we add the AI display section
            console.log('🎯 AI Prediction:', prediction);
            // For now, just log the prediction
        }

        function showAIPredictionError(message) {
            console.warn('⚠️ AI Prediction Error:', message);
            // Show error in AI section when implemented
        }

        function clearAutoGeneratedFields() {
            document.getElementById('sampleId').textContent = 'Will be generated automatically';
            document.getElementById('assignedFreezer').textContent = 'Will be assigned based on storage location';
        }

        async function handleFormSubmission(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const form = e.target;
            
            console.log('📝 Submitting sample registration form...');
            
            // Disable form during submission
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering Sample...';
            form.classList.add('loading');
            
            try {
                const formData = new FormData(form);
                const sampleData = {
                    sampleType: formData.get('sampleType'),
                    testType: formData.get('testType'),
                    storageLocation: formData.get('storageLocation'),
                    patientName: formData.get('patientName'),
                    patientId: formData.get('patientId'),
                    collectionDate: formData.get('collectionDate'),
                    notes: formData.get('notes')
                };
                
                console.log('📤 Sending sample data:', sampleData);
                
                const response = await fetch('/api/register-sample', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sampleData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    console.log('✅ Sample registered successfully:', result);
                    showSuccess(result);
                } else {
                    throw new Error(result.message || 'Failed to register sample');
                }
            } catch (error) {
                console.error('❌ Error registering sample:', error);
                showMessage('Error registering sample: ' + error.message, true);
            } finally {
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Register Sample';
                form.classList.remove('loading');
            }
        }

        function showSuccess(result) {
            // Simple alert for now
            alert(\`Sample registered successfully! Sample ID: \${result.sample_id}\`);
            
            // Reset the form
            document.getElementById('sampleRegistrationForm').reset();
            clearAutoGeneratedFields();
            document.getElementById('testType').disabled = true;
            document.getElementById('storageLocation').disabled = true;
            document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];
        }

        function showMessage(message, isError = true) {
            const messageDiv = document.getElementById('message');
            if (!messageDiv) return;

            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.className = isError ? 'alert alert-error' : 'alert alert-success';

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    </script>`

// Replace the JavaScript section
htmlContent = htmlContent.replace(oldJavaScript, newJavaScript)

// Write the updated file
fs.writeFileSync(registerSamplePath, htmlContent)

console.log("✅ Fixed register-sample.html to load data from database")
