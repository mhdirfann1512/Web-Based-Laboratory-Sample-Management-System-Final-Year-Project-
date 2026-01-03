const fs = require("fs")
const path = require("path")

console.log("🔧 Restoring Sample Reports and Staff Performance sections...")

const adminReportsPath = path.join(__dirname, "..", "public", "html", "admin-reports.html")

try {
  let content = fs.readFileSync(adminReportsPath, "utf8")

  // Find the reports-grid div and replace its content
  const reportsGridStart = content.indexOf('<div class="reports-grid">')
  const reportsGridEnd = content.indexOf("</div>", reportsGridStart) + 6

  if (reportsGridStart === -1) {
    console.log("❌ Could not find reports-grid section")
    return;
  }

  const newReportsGrid = `<div class="reports-grid">
            <!-- Sample Reports -->
            <div class="report-card">
                <h3><i class="fas fa-vial"></i> Sample Reports</h3>
                <p>Generate detailed reports about sample registration, disposal, and tracking activities.</p>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="generateReport('samples-summary')">
                        <i class="fas fa-file-alt"></i> Summary Report
                    </button>
                    <button class="btn btn-secondary" onclick="generateReport('samples-detailed')">
                        <i class="fas fa-list"></i> Detailed Report
                    </button>
                    <button class="btn btn-info" onclick="exportReport('samples', 'csv')">
                        <i class="fas fa-download"></i> Export CSV
                    </button>
                </div>
            </div>

            <!-- Staff Performance -->
            <div class="report-card">
                <h3><i class="fas fa-users"></i> Staff Performance</h3>
                <p>Analyze staff productivity, sample handling efficiency, and performance metrics.</p>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="generateReport('staff-performance')">
                        <i class="fas fa-chart-bar"></i> Performance Report
                    </button>
                    <button class="btn btn-success" onclick="generateReport('staff-rankings')">
                        <i class="fas fa-trophy"></i> Staff Rankings
                    </button>
                    <button class="btn btn-info" onclick="exportReport('staff', 'pdf')">
                        <i class="fas fa-file-pdf"></i> Export PDF
                    </button>
                </div>
            </div>
        </div>`

  // Replace the reports-grid section
  content = content.substring(0, reportsGridStart) + newReportsGrid + content.substring(reportsGridEnd)

  // Make sure the export functions exist in the script section
  if (!content.includes("function exportReport(")) {
    const scriptEndIndex = content.lastIndexOf("</script>")
    if (scriptEndIndex !== -1) {
      const exportFunction = `
        // Export report function
        async function exportReport(type, format) {
            showMessage(\`Exporting \${type} report as \${format.toUpperCase()}...\`, 'info');
            
            try {
                const response = await fetch(\`/api/admin/export/\${type}/\${format}\`);
                
                if (!response.ok) {
                    throw new Error('Export failed');
                }
                
                // Get filename from response headers or create default
                const contentDisposition = response.headers.get('content-disposition');
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
                
                showMessage(\`\${type} report exported successfully!\`, 'success');
            } catch (error) {
                console.error('Export error:', error);
                showMessage('Export failed. Please try again.', 'error');
            }
        }
        
        `

      content = content.substring(0, scriptEndIndex) + exportFunction + content.substring(scriptEndIndex)
    }
  }

  fs.writeFileSync(adminReportsPath, content)
  console.log("✅ Restored Sample Reports and Staff Performance sections")
  console.log("✅ Added working export functionality")
  console.log("📋 Your admin reports page now has the correct sections!")
} catch (error) {
  console.error("❌ Error:", error.message)
}
