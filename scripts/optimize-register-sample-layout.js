const fs = require("fs")
const path = require("path")

console.log("🎯 Optimizing Register Sample Layout - Fit on One Page...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

// Read the current file
const content = fs.readFileSync(filePath, "utf8")

// Replace the existing HTML with optimized layout version
const optimizedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Sample - Sample Storage System</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Layout Optimization - Fit on One Page */
        html, body {
            height: 100vh;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        body {
            display: flex;
            flex-direction: column;
        }

        header {
            flex-shrink: 0;
            height: 60px;
            padding: 0;
        }

        .navbar {
            height: 60px;
            padding: 0 1rem;
        }

        main {
            flex: 1;
            overflow-y: auto;
            padding: 0;
        }

        .registration-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem;
            height: calc(100vh - 60px);
            overflow-y: auto;
        }

        .page-header {
            margin-bottom: 1rem;
        }

        .page-header h1 {
            font-size: 1.8rem;
            margin: 0 0 0.5rem 0;
        }

        .page-header p {
            margin: 0;
            font-size: 0.9rem;
        }

        .card {
            padding: 1.5rem !important;
            margin-bottom: 0;
        }

        .form-section {
            margin-bottom: 1.5rem;
        }

        .form-section h3 {
            color: var(--primary-color);
            margin-bottom: 0.8rem;
            padding-bottom: 0.3rem;
            border-bottom: 2px solid var(--border-color);
            font-size: 1.1rem;
        }

        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.4rem;
            font-weight: 500;
            color: var(--text-primary);
            font-size: 0.9rem;
        }

        .form-control {
            width: 100%;
            padding: 0.6rem 0.8rem;
            border: 2px solid var(--border-color);
            border-radius: 6px;
            font-size: 0.9rem;
            transition: border-color 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }

        .auto-generated {
            background-color: var(--background-light);
            border-style: dashed;
            color: var(--text-secondary);
            cursor: not-allowed;
        }

        .info-box {
            background: var(--background-light);
            border-left: 4px solid var(--primary-color);
            padding: 0.8rem;
            margin: 0.8rem 0;
            border-radius: 0 6px 6px 0;
        }

        .info-box h4 {
            margin: 0 0 0.4rem 0;
            color: var(--primary-color);
            font-size: 1rem;
        }

        .info-box p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.85rem;
        }

        .temperature-info {
            background: var(--accent-color);
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 500;
            display: inline-block;
            margin-top: 0.4rem;
        }

        .btn-register {
            background: var(--success-color);
            color: white;
            padding: 0.8rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }

        .btn-register:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-register:disabled {
            background: var(--text-secondary);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        textarea.form-control {
            rows: 2;
            min-height: 60px;
        }

        /* Compact grid for smaller sections */
        .form-section:nth-child(1) .form-grid,
        .form-section:nth-child(2) .form-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }

        /* Patient info in 3 columns */
        .form-section:nth-child(3) .form-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .registration-container {
                padding: 0.5rem;
            }
        }

        /* Alert styling */
        .alert {
            padding: 0.6rem 1rem;
            margin-bottom: 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
        }

        .alert-success {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }

        .alert-error {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
    </style>
</head>
<body>
    <header>
        <nav class="navbar container">
            <a href="/" class="logo">SampleStorage</a>
            <div class="nav-links">
                <span class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <span id="staffName">Loading...</span>
                </span>
                <a href="/staff-dashboard" class="nav-link">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="/profile" class="nav-link">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="/logout" class="nav-link logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        </nav>
    </header>

    <main class="container">
        <div class="registration-container">
            <div class="page-header">
                <h1><i class="fas fa-vial"></i> Register New Sample</h1>
                <p>Enter sample details to register a new specimen in the system</p>
            </div>

            <div id="message" class="alert" style="display: none;"></div>

            <form id="sampleRegistrationForm" class="card">
                <!-- Sample Information Section -->
                <div class="form-section">
                    <h3><i class="fas fa-flask"></i> Sample Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="sampleType">Sample Type *</label>
                            <select id="sampleType" name="sampleType" class="form-control" required>
                                <option value="">Select sample type...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="testType">Test Type *</label>
                            <select id="testType" name="testType" class="form-control" required disabled>
                                <option value="">Select sample type first...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="storageLocation">Storage Location *</label>
                            <select id="storageLocation" name="storageLocation" class="form-control" required disabled>
                                <option value="">Select sample type first...</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Auto-Generated Information -->
                <div class="form-section">
                    <h3><i class="fas fa-cog"></i> Auto-Generated Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="sampleId">Sample ID</label>
                            <input type="text" id="sampleId" name="sampleId" class="form-control auto-generated" 
                                   placeholder="Will be generated automatically" readonly>
                        </div>

                        <div class="form-group">
                            <label for="assignedFreezer">Assigned Freezer</label>
                            <input type="text" id="assignedFreezer" name="assignedFreezer" class="form-control auto-generated" 
                                   placeholder="Will be assigned based on storage location" readonly>
                            <div id="temperatureInfo" style="display: none;">
                                <span class="temperature-info" id="temperatureRange"></span>
                            </div>
                        </div>
                    </div>

                    <div class="info-box" id="autoGenInfo" style="display: none;">
                        <h4>Automatic Assignment</h4>
                        <p>The system will automatically generate a unique sample ID and assign the most appropriate freezer based on your selected storage location's temperature requirements.</p>
                    </div>
                </div>

                <!-- Patient Information Section -->
                <div class="form-section">
                    <h3><i class="fas fa-user"></i> Patient Information</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="patientName">Patient Name *</label>
                            <input type="text" id="patientName" name="patientName" class="form-control" 
                                   placeholder="Enter patient full name" required>
                        </div>

                        <div class="form-group">
                            <label for="patientId">Patient ID *</label>
                            <input type="text" id="patientId" name="patientId" class="form-control" 
                                   placeholder="Enter patient ID or medical record number" required>
                        </div>

                        <div class="form-group">
                            <label for="collectionDate">Collection Date *</label>
                            <input type="date" id="collectionDate" name="collectionDate" class="form-control" required>
                        </div>
                    </div>
                </div>

                <!-- Additional Information -->
                <div class="form-section">
                    <h3><i class="fas fa-sticky-note"></i> Additional Information</h3>
                    <div class="form-group">
                        <label for="notes">Notes (Optional)</label>
                        <textarea id="notes" name="notes" class="form-control" rows="2" 
                                  placeholder="Enter any additional notes or special instructions..."></textarea>
                    </div>
                </div>

                <!-- Submit Button -->
                <div class="form-section">
                    <button type="submit" class="btn-register" id="submitBtn">
                        <i class="fas fa-plus-circle"></i> Register Sample
                    </button>
                </div>
            </form>
        </div>
    </main>

    <script>
        let sampleTypes = [];
        let allTests = [];
        let allStorageLocations = [];

        document.addEventListener('DOMContentLoaded', async () => {
            await loadStaffProfile();
            await loadSampleTypes();
            
            // Set today's date as default
            document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];
        });

        async function loadStaffProfile() {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const profile = await response.json();
                    document.getElementById('staffName').textContent = profile.full_name || 'Staff Member';
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        }

        async function loadSampleTypes() {
            try {
                const response = await fetch('/api/sample-types');
                if (!response.ok) throw new Error('Failed to load sample types');
                
                sampleTypes = await response.json();
                const sampleTypeSelect = document.getElementById('sampleType');
                
                sampleTypeSelect.innerHTML = '<option value="">Select sample type...</option>';
                sampleTypes.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.type_id;
                    option.textContent = type.type_name;
                    sampleTypeSelect.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading sample types:', error);
                showMessage('Error loading sample types', true);
            }
        }

        // Handle sample type change
        document.getElementById('sampleType').addEventListener('change', async (e) => {
            const typeId = e.target.value;
            const testSelect = document.getElementById('testType');
            const storageSelect = document.getElementById('storageLocation');
            
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
                const testsResponse = await fetch(\`/api/sample-tests/\${typeId}\`);
                if (testsResponse.ok) {
                    allTests = await testsResponse.json();
                    testSelect.innerHTML = '<option value="">Select test type...</option>';
                    allTests.forEach(test => {
                        const option = document.createElement('option');
                        option.value = test.test_id;
                        option.textContent = test.test_name;
                        testSelect.appendChild(option);
                    });
                    testSelect.disabled = false;
                }
                
                // Load storage locations for this sample type
                const storageResponse = await fetch(\`/api/sample-storage/\${typeId}\`);
                if (storageResponse.ok) {
                    allStorageLocations = await storageResponse.json();
                    storageSelect.innerHTML = '<option value="">Select storage location...</option>';
                    allStorageLocations.forEach(storage => {
                        const option = document.createElement('option');
                        option.value = storage.storage_id;
                        option.textContent = \`\${storage.storage_name} \${storage.temperature_range ? '(' + storage.temperature_range + ')' : ''}\`;
                        storageSelect.appendChild(option);
                    });
                    storageSelect.disabled = false;
                }
            } catch (error) {
                console.error('Error loading dependent data:', error);
                showMessage('Error loading test types and storage locations', true);
            }
        });

        // Handle storage location change
        document.getElementById('storageLocation').addEventListener('change', async (e) => {
            const storageId = e.target.value;
            
            if (!storageId) {
                clearAutoGeneratedFields();
                return;
            }
            
            try {
                // Get freezer assignment based on storage location
                const response = await fetch(\`/api/assign-freezer/\${storageId}\`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // Update assigned freezer field
                    document.getElementById('assignedFreezer').value = data.freezer_name || 'No suitable freezer found';
                    
                    // Show temperature info
                    if (data.temperature_range) {
                        document.getElementById('temperatureRange').textContent = data.temperature_range;
                        document.getElementById('temperatureInfo').style.display = 'block';
                    }
                    
                    // Show auto-gen info
                    document.getElementById('autoGenInfo').style.display = 'block';
                    
                    // Generate sample ID preview
                    await generateSampleIdPreview();
                }
            } catch (error) {
                console.error('Error assigning freezer:', error);
                showMessage('Error assigning freezer', true);
            }
        });

        async function generateSampleIdPreview() {
            try {
                const response = await fetch('/api/generate-sample-id');
                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('sampleId').value = data.sample_id;
                }
            } catch (error) {
                console.error('Error generating sample ID:', error);
            }
        }

        function clearAutoGeneratedFields() {
            document.getElementById('sampleId').value = '';
            document.getElementById('assignedFreezer').value = '';
            document.getElementById('temperatureInfo').style.display = 'none';
            document.getElementById('autoGenInfo').style.display = 'none';
        }

        // Handle form submission
        document.getElementById('sampleRegistrationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const form = e.target;
            
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
                
                const response = await fetch('/api/register-sample', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sampleData)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage(\`Sample registered successfully! Sample ID: \${result.sample_id}\`, false);
                    
                    // Reset form after successful registration
                    setTimeout(() => {
                        form.reset();
                        clearAutoGeneratedFields();
                        document.getElementById('testType').disabled = true;
                        document.getElementById('storageLocation').disabled = true;
                        document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];
                    }, 2000);
                } else {
                    throw new Error(result.message || 'Failed to register sample');
                }
            } catch (error) {
                console.error('Error registering sample:', error);
                showMessage('Error registering sample: ' + error.message, true);
            } finally {
                // Re-enable form
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Register Sample';
                form.classList.remove('loading');
            }
        });

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
    </script>
    <script src="/js/script.js"></script>
</body>
</html>`

// Write the optimized file
fs.writeFileSync(filePath, optimizedHTML, "utf8")

console.log("✅ Register Sample layout optimized successfully!")
console.log("📋 Changes made:")
console.log("   - Fixed viewport height layout")
console.log("   - Reduced margins and padding")
console.log("   - Optimized form grid spacing")
console.log("   - Made form scrollable within viewport")
console.log("   - Kept ALL functionality intact")
console.log("   - Maintained responsive design")
console.log("")
console.log("🚀 The register sample page now fits on one page!")
