const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing Register Sample Layout...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

const fixedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register Sample - Sample Storage System</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100vh;
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .navbar {
            height: 50px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        }

        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4f46e5;
            text-decoration: none;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .nav-link {
            color: #374151;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            transition: all 0.3s ease;
        }

        .nav-link:hover {
            background: #f3f4f6;
            color: #4f46e5;
        }

        .user-info {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .main-container {
            height: calc(100vh - 50px);
            display: flex;
            flex-direction: column;
            padding: 1rem;
            overflow: hidden;
        }

        .page-header {
            text-align: center;
            color: white;
            margin-bottom: 1rem;
        }

        .page-header h1 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .page-header p {
            font-size: 1rem;
            opacity: 0.9;
        }

        .form-container {
            flex: 1;
            background: white;
            border-radius: 20px;
            padding: 1.5rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow-y: auto;
            max-height: calc(100vh - 180px);
        }

        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
            height: 100%;
        }

        .form-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1rem;
            border-left: 4px solid #4f46e5;
        }

        .form-section h3 {
            color: #4f46e5;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.3rem;
            font-weight: 500;
            color: #374151;
            font-size: 0.9rem;
        }

        .form-control {
            width: 100%;
            padding: 0.6rem;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .auto-generated {
            background-color: #f3f4f6;
            border-style: dashed;
            color: #6b7280;
            cursor: not-allowed;
        }

        .temperature-info {
            background: #10b981;
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 500;
            display: inline-block;
            margin-top: 0.3rem;
        }

        .info-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 0.8rem;
            margin: 0.8rem 0;
            border-radius: 0 8px 8px 0;
        }

        .info-box h4 {
            margin: 0 0 0.3rem 0;
            color: #3b82f6;
            font-size: 0.9rem;
        }

        .info-box p {
            margin: 0;
            color: #6b7280;
            font-size: 0.8rem;
        }

        .btn-register {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 0.8rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            margin-top: 1rem;
        }

        .btn-register:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
        }

        .btn-register:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .alert {
            padding: 0.8rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-weight: 500;
        }

        .alert-success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        .alert-error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
        }

        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        /* Compact layout for smaller sections */
        .compact-section {
            padding: 0.8rem;
        }

        .compact-section .form-group {
            margin-bottom: 0.8rem;
        }

        /* Progress indicator */
        .progress-indicator {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }

        .progress-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
        }

        .progress-dot.active {
            background: white;
        }

        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .main-container {
                padding: 0.5rem;
            }
            
            .form-container {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="navbar">
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

    <main class="main-container">
        <div class="page-header">
            <h1><i class="fas fa-vial"></i> Register New Sample</h1>
            <p>Enter sample details to register a new specimen in the system</p>
            <div class="progress-indicator">
                <div class="progress-dot active"></div>
                <div class="progress-dot"></div>
                <div class="progress-dot"></div>
                <div class="progress-dot"></div>
            </div>
        </div>

        <div id="message" class="alert" style="display: none;"></div>

        <div class="form-container">
            <form id="sampleRegistrationForm">
                <div class="form-grid">
                    <!-- Left Column -->
                    <div>
                        <!-- Sample Information Section -->
                        <div class="form-section">
                            <h3><i class="fas fa-flask"></i> Sample Information</h3>
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

                        <!-- Patient Information Section -->
                        <div class="form-section compact-section">
                            <h3><i class="fas fa-user"></i> Patient Information</h3>
                            <div class="form-group">
                                <label for="patientName">Patient Name *</label>
                                <input type="text" id="patientName" name="patientName" class="form-control" 
                                       placeholder="Enter patient full name" required>
                            </div>

                            <div class="form-group">
                                <label for="patientId">Patient ID *</label>
                                <input type="text" id="patientId" name="patientId" class="form-control" 
                                       placeholder="Enter patient ID" required>
                            </div>

                            <div class="form-group">
                                <label for="collectionDate">Collection Date *</label>
                                <input type="date" id="collectionDate" name="collectionDate" class="form-control" required>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column -->
                    <div>
                        <!-- Auto-Generated Information -->
                        <div class="form-section">
                            <h3><i class="fas fa-cog"></i> Auto-Generated Information</h3>
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

                            <div class="info-box" id="autoGenInfo" style="display: none;">
                                <h4>Automatic Assignment</h4>
                                <p>The system will automatically generate a unique sample ID and assign the most appropriate freezer based on your selected storage location's temperature requirements.</p>
                            </div>
                        </div>

                        <!-- Additional Information -->
                        <div class="form-section compact-section">
                            <h3><i class="fas fa-sticky-note"></i> Additional Information</h3>
                            <div class="form-group">
                                <label for="notes">Notes (Optional)</label>
                                <textarea id="notes" name="notes" class="form-control" rows="3" 
                                          placeholder="Enter any additional notes..."></textarea>
                            </div>

                            <!-- Submit Button -->
                            <button type="submit" class="btn-register" id="submitBtn">
                                <i class="fas fa-plus-circle"></i> Register Sample
                            </button>
                        </div>
                    </div>
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

try {
  fs.writeFileSync(filePath, fixedHTML, "utf8")
  console.log("✅ Register sample layout fixed successfully!")
  console.log("📋 Changes made:")
  console.log("   - Fixed viewport height to prevent scrolling")
  console.log("   - Optimized form sections to fit on one page")
  console.log("   - Maintained beautiful visual design")
  console.log("   - Preserved ALL functionality")
  console.log("   - Added progress indicator")
  console.log("   - Improved responsive layout")
} catch (error) {
  console.error("❌ Error fixing layout:", error.message)
}
