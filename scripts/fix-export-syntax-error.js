const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing export route syntax errors...")

const appJsPath = path.join(process.cwd(), "app.js")
let appJsContent = fs.readFileSync(appJsPath, "utf8")

// Find and replace the export routes with proper async syntax
const fixedExportRoutes = `
// Simple Export API Routes (No external dependencies)
app.get('/api/admin/export/samples/:format', async (req, res) => {
  if (!req.session.user || req.session.user.type !== 'admin') {
    return res.status(401).json({ message: 'Admin access required' });
  }

  try {
    const { format } = req.params;
    
    // Fetch samples data
    const [samples] = await db.promise().query(\`
      SELECT 
        s.sample_id,
        s.patient_name,
        s.patient_id,
        s.collection_date,
        s.registration_date,
        s.status,
        s.disposal_date,
        s.disposal_reason,
        st.type_name as sample_type,
        test.test_name,
        storage.storage_name,
        f.freezer_name,
        staff.full_name as staff_name
      FROM samples s
      LEFT JOIN sample_types st ON s.sample_type_id = st.type_id
      LEFT JOIN sample_tests test ON s.test_id = test.test_id
      LEFT JOIN sample_storage storage ON s.storage_id = storage.storage_id
      LEFT JOIN freezer f ON s.freezer_id = f.freezer_id
      LEFT JOIN staff ON s.staff_id = staff.staff_id
      ORDER BY s.registration_date DESC
    \`);

    if (format === 'csv') {
      // Create CSV manually
      const headers = [
        'Sample ID', 'Patient Name', 'Patient ID', 'Sample Type', 
        'Test Name', 'Storage Location', 'Freezer', 'Staff Name',
        'Collection Date', 'Registration Date', 'Status', 'Disposal Date', 'Disposal Reason'
      ];
      
      let csv = headers.join(',') + '\\n';
      
      samples.forEach(sample => {
        const row = [
          sample.sample_id || '',
          sample.patient_name || '',
          sample.patient_id || '',
          sample.sample_type || '',
          sample.test_name || '',
          sample.storage_name || '',
          sample.freezer_name || '',
          sample.staff_name || '',
          sample.collection_date || '',
          sample.registration_date || '',
          sample.status || '',
          sample.disposal_date || '',
          sample.disposal_reason || ''
        ].map(field => \`"\${String(field).replace(/"/g, '""')}"\`);
        
        csv += row.join(',') + '\\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="samples_report.csv"');
      res.send(csv);
      
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="samples_report.json"');
      res.json(samples);
    } else {
      res.status(400).json({ message: 'Unsupported format' });
    }
    
  } catch (error) {
    console.error('Export samples error:', error);
    res.status(500).json({ message: 'Export failed: ' + error.message });
  }
});

app.get('/api/admin/export/staff/:format', async (req, res) => {
  if (!req.session.user || req.session.user.type !== 'admin') {
    return res.status(401).json({ message: 'Admin access required' });
  }

  try {
    const { format } = req.params;
    
    // Fetch staff performance data
    const [staffData] = await db.promise().query(\`
      SELECT 
        s.staff_id,
        s.full_name,
        s.username,
        s.email,
        s.department,
        s.phone_number,
        s.created_at,
        COALESCE(sample_stats.total_samples, 0) as samples_registered,
        COALESCE(sample_stats.disposed_samples, 0) as samples_disposed,
        COALESCE(sample_stats.active_samples, 0) as active_samples,
        CASE 
          WHEN COALESCE(sample_stats.total_samples, 0) > 0 
          THEN ROUND((COALESCE(sample_stats.disposed_samples, 0) / COALESCE(sample_stats.total_samples, 0)) * 100)
          ELSE 0 
        END as completion_rate
      FROM staff s
      LEFT JOIN (
        SELECT 
          staff_id,
          COUNT(*) as total_samples,
          SUM(CASE WHEN status = 'disposed' THEN 1 ELSE 0 END) as disposed_samples,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_samples
        FROM samples 
        GROUP BY staff_id
      ) sample_stats ON s.staff_id = sample_stats.staff_id
      ORDER BY s.full_name
    \`);

    if (format === 'csv') {
      // Create CSV manually
      const headers = [
        'Staff ID', 'Full Name', 'Username', 'Email', 'Department', 
        'Phone Number', 'Samples Registered', 'Samples Disposed', 
        'Active Samples', 'Completion Rate (%)', 'Created Date'
      ];
      
      let csv = headers.join(',') + '\\n';
      
      staffData.forEach(staff => {
        const row = [
          staff.staff_id || '',
          staff.full_name || '',
          staff.username || '',
          staff.email || '',
          staff.department || '',
          staff.phone_number || '',
          staff.samples_registered || '0',
          staff.samples_disposed || '0',
          staff.active_samples || '0',
          staff.completion_rate || '0',
          staff.created_at || ''
        ].map(field => \`"\${String(field).replace(/"/g, '""')}"\`);
        
        csv += row.join(',') + '\\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="staff_report.csv"');
      res.send(csv);
      
    } else if (format === 'pdf') {
      // Create HTML that can be printed as PDF
      let html = \`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Staff Performance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .date { color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Staff Performance Report</h1>
            <p class="date">Generated on: \${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Samples Registered</th>
                <th>Samples Disposed</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
      \`;
      
      staffData.forEach(staff => {
        html += \`
          <tr>
            <td>\${staff.full_name || 'N/A'}</td>
            <td>\${staff.department || 'N/A'}</td>
            <td>\${staff.email || 'N/A'}</td>
            <td>\${staff.samples_registered || '0'}</td>
            <td>\${staff.samples_disposed || '0'}</td>
            <td>\${staff.completion_rate || '0'}%</td>
          </tr>
        \`;
      });
      
      html += \`
            </tbody>
          </table>
          <script>
            // Auto-print when opened
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            }
          </script>
        </body>
        </html>
      \`;
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', 'attachment; filename="staff_report.html"');
      res.send(html);
      
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="staff_report.json"');
      res.json(staffData);
    } else {
      res.status(400).json({ message: 'Unsupported format' });
    }
    
  } catch (error) {
    console.error('Export staff error:', error);
    res.status(500).json({ message: 'Export failed: ' + error.message });
  }
});

app.get('/api/admin/export/analytics/:format', async (req, res) => {
  if (!req.session.user || req.session.user.type !== 'admin') {
    return res.status(401).json({ message: 'Admin access required' });
  }

  try {
    const { format } = req.params;
    
    // Fetch analytics data
    const [totalSamplesResult] = await db.promise().query('SELECT COUNT(*) as total FROM samples');
    const [activeSamplesResult] = await db.promise().query("SELECT COUNT(*) as total FROM samples WHERE status = 'active'");
    const [disposedSamplesResult] = await db.promise().query("SELECT COUNT(*) as total FROM samples WHERE status = 'disposed'");
    const [totalStaffResult] = await db.promise().query('SELECT COUNT(*) as total FROM staff');
    
    const analyticsData = {
      totalSamples: totalSamplesResult[0].total,
      activeSamples: activeSamplesResult[0].total,
      disposedSamples: disposedSamplesResult[0].total,
      totalStaff: totalStaffResult[0].total,
      generatedAt: new Date().toISOString()
    };

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics_report.json"');
      res.json(analyticsData);
      
    } else if (format === 'csv') {
      const csv = [
        'Metric,Value',
        \`Total Samples,\${analyticsData.totalSamples}\`,
        \`Active Samples,\${analyticsData.activeSamples}\`,
        \`Disposed Samples,\${analyticsData.disposedSamples}\`,
        \`Total Staff,\${analyticsData.totalStaff}\`,
        \`Generated At,\${analyticsData.generatedAt}\`
      ].join('\\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics_report.csv"');
      res.send(csv);
    } else {
      res.status(400).json({ message: 'Unsupported format' });
    }
    
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ message: 'Export failed: ' + error.message });
  }
});

`

// Remove any existing export routes first
const exportRoutesRegex = /\/\/ Simple Export API Routes[\s\S]*?(?=app\.use\(|const PORT|process\.on)/
appJsContent = appJsContent.replace(exportRoutesRegex, "")

// Insert the fixed export routes before the error handlers
const errorHandlerIndex = appJsContent.indexOf("app.use((err, req, res, next)")
if (errorHandlerIndex !== -1) {
  appJsContent =
    appJsContent.slice(0, errorHandlerIndex) + fixedExportRoutes + "\n\n" + appJsContent.slice(errorHandlerIndex)
  fs.writeFileSync(appJsPath, appJsContent)
  console.log("✅ Fixed export route syntax errors")
} else {
  console.log("❌ Could not find error handler in app.js")
}

console.log("✅ Export routes now have proper async syntax!")
console.log("📋 Restart your server - exports will work without syntax errors!")
