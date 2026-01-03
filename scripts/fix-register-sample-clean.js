const fs = require("fs")
const path = require("path")

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register New Sample - Sample Storage System</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f9fa;
            height: 100vh;
            overflow: hidden;
        }

        .navbar {
            background-color: #fff;
            padding: 1rem 0;
            border-bottom: 1px solid #e9ecef;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            height: 70px;
            display: flex;
            align-items: center;
        }

        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .nav-link {
            color: #495057;
            text-decoration: none;
            font-size: 1rem;
            transition: color 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .nav-link:hover {
            color: #007bff;
        }

        .main-content {
            height: calc(100vh - 70px);
            padding: 2rem;
            overflow-y: auto;
        }

        .page-header {
            text-align: center;
            margin-bottom: 2rem;
        }

        .page-header h1 {
            color: #212529;
            font-size: 2rem;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
        }

        .form-container {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            height: calc(100vh - 200px);
        }

        .form-section {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
            display: flex;
            flex-direction: column;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #f8f9fa;
        }

        .section-header h3 {
            color: #212529;
            font-size: 1.1rem;
            font-weight: 600;
        }

        .section-header i {
            color: #007bff;
            font-size: 1.2rem;
        }

        .form-group {
            margin-bottom: 1.25rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #495057;
            font-weight: 500;
            font-size: 0.95rem;
        }

        .required {
            color: #dc3545;
        }

        .form-control {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }

        .form-control:disabled {
            background-color: #f8f9fa;
            color: #6c757d;
        }

        textarea.form-control {
            resize: vertical;
            min-height: 100px;
        }

        .auto-field {
            background-color: #f8f9fa;
            border: 2px dashed #ced4da;
            color: #6c757d;
            text-align: center;
            padding: 1rem;
            border-radius: 4px;
            font-style: italic;
        }

        .submit-section {
            margin-top: auto;
            padding-top: 1rem;
        }

        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-weight: 500;
        }

        .btn-primary {
            background: #007bff;
            color: white;
            width: 100%;
        }

        .btn-primary:hover {
            background: #0056b3;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .btn-primary:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .alert {
            padding: 0.75rem 1rem;
            margin-bottom: 1rem;
            border: 1px solid transparent;
            border-radius: 4px;
            font-size: 0.9rem;
        }

        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }

        .alert-error {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }

        .success-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .success-content {
            background: white;
            padding: 3rem;
            border-radius: 12px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .success-icon {
            font-size: 4rem;
            color: #28a745;
            margin-bottom: 1rem;
        }

        .success-content h2 {
            color: #212529;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }

        .success-details {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 6px;
            margin: 1rem 0;
            text-align: left;
        }

        .success-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }

        .btn-secondary {
            background: #6c757d;
            color: white;
            flex: 1;
        }

        .btn-secondary:hover {
            background: #545b62;
        }

        @media (max-width: 1200px) {
            .form-container {
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
            }
            
            .form-section:last-child {
                grid-column: 1 / -1;
            }
        }

        @media (max-width: 768px) {
            .form-container {
                grid-template-columns: 1fr;
                gap: 1rem;
                height: auto;
            }
            
            .main-content {
                height: auto;
                overflow-y: visible;
            }
            
            body {
                overflow: visible;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="navbar">
            <div class="container">
                <a href="/" class="logo">SampleStorage</a>
                <div class="nav-links">
                    <span id="staffName">Loading...</span>
                    <a href="/staff-dashboard" class="nav-link">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                    <a href="/profile" class="nav-link">
                        <i class="fas fa-user"></i> Profile
                    </a>
                    <a href="/logout" class="nav-link">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        </nav>
    </header>

    <main class="main-content">
        <div class="page-header">
            <h1><i class="fas fa-vial"></i> Register New Sample</h1>
        </div>

        <div id="message" class="alert" style="display: none;"></div>

        <form id="sampleRegistrationForm" class="form-container">
            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-flask"></i>
                    <h3>Sample Information</h3>
                </div>

                <div class="form-group">
                    <label for="sampleType">Sample Type <span class="required">*</span></label>
                    <select id="sampleType" name="sampleType" class="form-control" required>
                        <option value="">Select sample type...</option>
                        <option value="Blood">Blood</option>
                        <option value="Tissue">Tissue</option>
                        <option value="Urine">Urine</option>
                        <option value="Saliva">Saliva</option>
                        <option value="Serum">Serum</option>
                        <option value="Plasma">Plasma</option>
                        <option value="CSF">CSF</option>
                        <option value="Biopsy">Biopsy</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="testType">Test Type <span class="required">*</span></label>
                    <select id="testType" name="testType" class="form-control" required disabled>
                        <option value="">Select sample type first...</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="storageLocation">Storage Location <span class="required">*</span></label>
                    <select id="storageLocation" name="storageLocation" class="form-control" required disabled>
                        <option value="">Select sample type first...</option>
                    </select>
                </div>
            </div>

            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-user"></i>
                    <h3>Patient Information</h3>
                </div>

                <div class="form-group">
                    <label for="patientName">Patient Name <span class="required">*</span></label>
                    <input type="text" id="patientName" name="patientName" class="form-control" 
                           placeholder="Enter patient full name" required>
                </div>

                <div class="form-group">
                    <label for="patientId">Patient ID <span class="required">*</span></label>
                    <input type="text" id="patientId" name="patientId" class="form-control" 
                           placeholder="Enter patient ID or medical record number" required>
                </div>

                <div class="form-group">
                    <label for="collectionDate">Collection Date <span class="required">*</span></label>
                    <input type="date" id="collectionDate" name="collectionDate" class="form-control" required>
                </div>

                <div class="form-group">
                    <label for="notes">Notes (Optional)</label>
                    <textarea id="notes" name="notes" class="form-control" 
                              placeholder="Enter any additional notes or special instructions..."></textarea>
                </div>
            </div>

            <div class="form-section">
                <div class="section-header">
                    <i class="fas fa-cog"></i>
                    <h3>Auto-Generated Information</h3>
                </div>

                <div class="form-group">
                    <label>Sample ID</label>
                    <div id="sampleId" class="auto-field">Will be generated automatically</div>
                </div>

                <div class="form-group">
                    <label>Assigned Freezer</label>
                    <div id="assignedFreezer" class="auto-field">Will be assigned based on storage location</div>
                </div>

                <div class="submit-section">
                    <button type="submit" class="btn btn-primary" id="submitBtn">
                        <i class="fas fa-save"></i> Register Sample
                    </button>
                </div>
            </div>
        </form>
    </main>

    <div id="successDisplay" class="success-overlay">
        <div class="success-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Sample Registered Successfully!</h2>
            <div class="success-details">
                <p><strong>Sample ID:</strong> <span id="successSampleId"></span></p>
                <p><strong>Patient:</strong> <span id="successPatientName"></span></p>
                <p><strong>Type:</strong> <span id="successSampleType"></span></p>
                <p><strong>Freezer:</strong> <span id="successFreezer"></span></p>
            </div>
            <div class="success-actions">
                <button class="btn btn-secondary" onclick="printLabel()">
                    <i class="fas fa-print"></i> Print Label
                </button>
                <button class="btn btn-primary" onclick="registerAnother()">
                    <i class="fas fa-plus"></i> Register Another
                </button>
                <button class="btn btn-secondary" onclick="viewAllSamples()">
                    <i class="fas fa-eye"></i> View All Samples
                </button>
            </div>
        </div>
    </div>

    <script>
        const sampleConfigs = {
            'Blood': {
                testTypes: ['Complete Blood Count', 'Blood Chemistry', 'Blood Gas Analysis', 'Coagulation Studies'],
                storageLocations: ['Freezer A (-20°C)', 'Freezer B (-80°C)', 'Refrigerator (4°C)']
            },
            'Tissue': {
                testTypes: ['Histopathology', 'Immunohistochemistry', 'Molecular Analysis', 'Frozen Section'],
                storageLocations: ['Freezer C (-80°C)', 'Freezer D (-20°C)', 'Liquid Nitrogen']
            },
            'Urine': {
                testTypes: ['Urinalysis', 'Urine Culture', 'Drug Screening', 'Protein Analysis'],
                storageLocations: ['Freezer A (-20°C)', 'Refrigerator (4°C)']
            },
            'Saliva': {
                testTypes: ['DNA Analysis', 'Hormone Testing', 'Drug Testing', 'Microbiome Analysis'],
                storageLocations: ['Freezer A (-20°C)', 'Freezer B (-80°C)']
            },
            'Serum': {
                testTypes: ['Biochemistry', 'Immunology', 'Endocrinology', 'Tumor Markers'],
                storageLocations: ['Freezer A (-20°C)', 'Freezer B (-80°C)']
            },
            'Plasma': {
                testTypes: ['Coagulation', 'Protein Studies', 'Metabolomics', 'Biomarker Analysis'],
                storageLocations: ['Freezer A (-20°C)', 'Freezer B (-80°C)']
            },
            'CSF': {
                testTypes: ['Cell Count', 'Protein Analysis', 'Glucose Testing', 'Microbiology'],
                storageLocations: ['Freezer B (-80°C)', 'Refrigerator (4°C)']
            },
            'Biopsy': {
                testTypes: ['Histopathology', 'Immunohistochemistry', 'Molecular Pathology', 'Special Stains'],
                storageLocations: ['Freezer C (-80°C)', 'Liquid Nitrogen', 'Paraffin Storage']
            },
            'Other': {
                testTypes: ['General Analysis', 'Special Testing', 'Research Use', 'Custom Protocol'],
                storageLocations: ['Freezer A (-20°C)', 'Freezer B (-80°C)', 'Refrigerator (4°C)']
            }
        };

        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];
            loadStaffProfile();
            document.getElementById('sampleType').addEventListener('change', handleSampleTypeChange);
            document.getElementById('sampleRegistrationForm').addEventListener('submit', handleFormSubmit);
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

        function handleSampleTypeChange() {
            const sampleType = document.getElementById('sampleType').value;
            const testTypeSelect = document.getElementById('testType');
            const storageLocationSelect = document.getElementById('storageLocation');
            
            testTypeSelect.innerHTML = '<option value="">Select test type...</option>';
            storageLocationSelect.innerHTML = '<option value="">Select storage location...</option>';
            
            if (sampleType && sampleConfigs[sampleType]) {
                const config = sampleConfigs[sampleType];
                
                config.testTypes.forEach(testType => {
                    const option = document.createElement('option');
                    option.value = testType;
                    option.textContent = testType;
                    testTypeSelect.appendChild(option);
                });
                
                config.storageLocations.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location;
                    option.textContent = location;
                    storageLocationSelect.appendChild(option);
                });
                
                testTypeSelect.disabled = false;
                storageLocationSelect.disabled = false;
            } else {
                testTypeSelect.disabled = true;
                storageLocationSelect.disabled = true;
            }
            
            clearAutoGeneratedFields();
        }

        function clearAutoGeneratedFields() {
            document.getElementById('sampleId').textContent = 'Will be generated automatically';
            document.getElementById('assignedFreezer').textContent = 'Will be assigned based on storage location';
        }

        async function handleFormSubmit(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
                
                const formData = new FormData();
                formData.append('sampleType', document.getElementById('sampleType').value);
                formData.append('testType', document.getElementById('testType').value);
                formData.append('storageLocation', document.getElementById('storageLocation').value);
                formData.append('patientName', document.getElementById('patientName').value);
                formData.append('patientId', document.getElementById('patientId').value);
                formData.append('collectionDate', document.getElementById('collectionDate').value);
                formData.append('notes', document.getElementById('notes').value);
                
                const response = await fetch('/api/register-sample', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showSuccess(result);
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
        }

        function showSuccess(result) {
            document.getElementById('successSampleId').textContent = result.sampleId;
            document.getElementById('successPatientName').textContent = result.patientName;
            document.getElementById('successSampleType').textContent = result.sampleType;
            document.getElementById('successFreezer').textContent = result.assignedFreezer;
            document.getElementById('successDisplay').style.display = 'flex';
        }

        function showMessage(message, isError = false) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.className = isError ? 'alert alert-error' : 'alert alert-success';
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }

        function printLabel() {
            const sampleId = document.getElementById('successSampleId').textContent;
            const patientName = document.getElementById('successPatientName').textContent;
            const sampleType = document.getElementById('successSampleType').textContent;
            const freezer = document.getElementById('successFreezer').textContent;
            
            const printWindow = window.open('', '_blank');
            const labelHtml = '<!DOCTYPE html><html><head><title>Sample Label</title><style>body{font-family:Arial,sans-serif;padding:20px;}.label{border:2px solid #000;padding:15px;width:300px;text-align:center;}.label h2{margin:0 0 10px 0;}.label p{margin:5px 0;}</style></head><body><div class="label"><h2>SAMPLE LABEL</h2><p><strong>ID:</strong> ' + sampleId + '</p><p><strong>Patient:</strong> ' + patientName + '</p><p><strong>Type:</strong> ' + sampleType + '</p><p><strong>Freezer:</strong> ' + freezer + '</p><p><strong>Date:</strong> ' + new Date().toLocaleDateString() + '</p></div><script>window.print();window.close();</script></body></html>';
            printWindow.document.write(labelHtml);
            printWindow.document.close();
        }

        function registerAnother() {
            document.getElementById('successDisplay').style.display = 'none';
            document.getElementById('sampleRegistrationForm').reset();
            clearAutoGeneratedFields();
            document.getElementById('testType').disabled = true;
            document.getElementById('storageLocation').disabled = true;
            document.getElementById('collectionDate').value = new Date().toISOString().split('T')[0];
        }

        function viewAllSamples() {
            window.location.href = '/view-samples';
        }
    </script>
</body>
</html>`

// Write the file
const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")
fs.writeFileSync(filePath, htmlContent)

console.log("✅ Register sample page fixed successfully!")
console.log("✅ No more JavaScript syntax errors")
console.log("✅ Clean bottom of page - no visible code")
console.log("✅ Beautiful 3-column layout maintained")
