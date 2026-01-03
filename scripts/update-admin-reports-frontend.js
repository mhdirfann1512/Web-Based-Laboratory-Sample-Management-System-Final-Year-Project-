const fs = require("fs")
const path = require("path")

console.log("🔧 Updating admin reports frontend for real exports...")

const adminReportsPath = path.join(process.cwd(), "public/html/admin-reports.html")
let htmlContent = fs.readFileSync(adminReportsPath, "utf8")

// Replace the export function with real functionality
const newExportFunction = `
        // Export report function - NOW WITH REAL DOWNLOADS!
        async function exportReport(type, format) {
            showMessage(\`Preparing \${type} report for export as \${format.toUpperCase()}...\`, 'info');
            
            try {
                const response = await fetch(\`/api/admin/export/\${type}/\${format}\`);
                
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                
                // Get the filename from the response headers
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = \`\${type}_report.\${format}\`;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }
                
                // Create blob and download
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                showMessage(\`\${type} report exported as \${format.toUpperCase()} successfully!\`, 'success');
                
            } catch (error) {
                console.error('Export error:', error);
                showMessage(\`Failed to export \${type} report. Please try again.\`, 'error');
            }
        }`

// Replace the existing exportReport function
const exportFunctionRegex = /\/\/ Export report function[\s\S]*?}\s*}/
if (exportFunctionRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(exportFunctionRegex, newExportFunction)
  console.log("✅ Updated export function")
} else {
  console.log("❌ Could not find export function to replace")
}

// Add error alert style
const errorAlertStyle = `
        .alert-error {
            color: #721c24;
            background-color: #f8d7da;
            border-color: #f5c6cb;
        }

        .alert-success {
            color: #155724;
            background-color: #d4edda;
            border-color: #c3e6cb;
        }`

// Add the error alert styles before the closing </style> tag
htmlContent = htmlContent.replace("</style>", errorAlertStyle + "\n    </style>")

// Add a download progress indicator
const progressIndicator = `
        <!-- Download Progress Indicator -->
        <div id="downloadProgress" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999;">
            <div style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #667eea; margin-bottom: 10px;"></i>
                <p>Preparing your download...</p>
            </div>
        </div>`

// Add progress indicator before closing body tag
htmlContent = htmlContent.replace("</body>", progressIndicator + "\n</body>")

// Update the generate report function to handle different report types
const newGenerateFunction = `
        // Generate report function - NOW WITH REAL DATA!
        async function generateReport(reportType) {
            showMessage(\`Generating \${reportType.replace('-', ' ')} report...\`, 'info');
            
            try {
                let endpoint = '';
                switch(reportType) {
                    case 'samples-summary':
                    case 'samples-detailed':
                        endpoint = '/api/samples';
                        break;
                    case 'staff-performance':
                    case 'staff-rankings':
                        endpoint = '/api/staff-rankings';
                        break;
                    case 'trends':
                        endpoint = '/api/admin/reports-stats';
                        break;
                    default:
                        endpoint = '/api/admin/reports-stats';
                }
                
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error('Failed to generate report');
                }
                
                const data = await response.json();
                
                // Show success message with data count
                let message = \`\${reportType.replace('-', ' ')} report generated successfully!\`;
                if (Array.isArray(data)) {
                    message += \` (\${data.length} records)\`;
                }
                
                showMessage(message, 'success');
                
            } catch (error) {
                console.error('Generate report error:', error);
                showMessage(\`Failed to generate \${reportType.replace('-', ' ')} report. Please try again.\`, 'error');
            }
        }`

// Replace the existing generateReport function
const generateFunctionRegex = /\/\/ Generate report function[\s\S]*?}, 2000\);\s*}/
if (generateFunctionRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(generateFunctionRegex, newGenerateFunction)
  console.log("✅ Updated generate report function")
} else {
  console.log("❌ Could not find generate report function to replace")
}

fs.writeFileSync(adminReportsPath, htmlContent)
console.log("✅ Updated admin reports frontend with real export functionality!")
console.log("📋 Now your export buttons will download actual files with real data!")
