const fs = require("fs")
const path = require("path")

console.log("🔧 Adding real export functionality to admin reports...")

// First, let's add the necessary npm packages for file generation
const packageJsonPath = path.join(process.cwd(), "package.json")
let packageJson = {}

try {
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
  }
} catch (error) {
  console.log("📦 Creating new package.json...")
}

// Add required dependencies
if (!packageJson.dependencies) {
  packageJson.dependencies = {}
}

packageJson.dependencies["json2csv"] = "^6.1.0"
packageJson.dependencies["pdfkit"] = "^0.13.0"
packageJson.dependencies["canvas"] = "^2.11.2"

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
console.log("✅ Added export dependencies to package.json")

// Add export API routes to app.js
const appJsPath = path.join(process.cwd(), "app.js")
let appJsContent = fs.readFileSync(appJsPath, "utf8")

// Add the export routes before the error handlers
const exportRoutes = `
// Export API Routes
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
      const { Parser } = require('json2csv');
      const fields = [
        'sample_id', 'patient_name', 'patient_id', 'sample_type', 
        'test_name', 'storage_name', 'freezer_name', 'staff_name',
        'collection_date', 'registration_date', 'status', 'disposal_date', 'disposal_reason'
      ];
      
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(samples);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="samples_report.csv"');
      res.send(csv);
      
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="samples_report.json"');
      res.json(samples);
    }
    
  } catch (error) {
    console.error('Export samples error:', error);
    res.status(500).json({ message: 'Export failed' });
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
      const { Parser } = require('json2csv');
      const fields = [
        'staff_id', 'full_name', 'username', 'email', 'department', 
        'phone_number', 'samples_registered', 'samples_disposed', 
        'active_samples', 'completion_rate', 'created_at'
      ];
      
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(staffData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="staff_report.csv"');
      res.send(csv);
      
    } else if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="staff_report.pdf"');
      
      doc.pipe(res);
      
      // PDF Header
      doc.fontSize(20).text('Staff Performance Report', 50, 50);
      doc.fontSize(12).text(\`Generated on: \${new Date().toLocaleDateString()}\`, 50, 80);
      
      let yPosition = 120;
      
      staffData.forEach((staff, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(14).text(\`\${index + 1}. \${staff.full_name}\`, 50, yPosition);
        yPosition += 20;
        doc.fontSize(10)
          .text(\`Department: \${staff.department || 'N/A'}\`, 70, yPosition)
          .text(\`Email: \${staff.email}\`, 70, yPosition + 15)
          .text(\`Samples Registered: \${staff.samples_registered}\`, 70, yPosition + 30)
          .text(\`Samples Disposed: \${staff.samples_disposed}\`, 70, yPosition + 45)
          .text(\`Completion Rate: \${staff.completion_rate}%\`, 70, yPosition + 60);
        
        yPosition += 90;
      });
      
      doc.end();
      
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="staff_report.json"');
      res.json(staffData);
    }
    
  } catch (error) {
    console.error('Export staff error:', error);
    res.status(500).json({ message: 'Export failed' });
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
      const csvData = [
        ['Metric', 'Value'],
        ['Total Samples', analyticsData.totalSamples],
        ['Active Samples', analyticsData.activeSamples],
        ['Disposed Samples', analyticsData.disposedSamples],
        ['Total Staff', analyticsData.totalStaff],
        ['Generated At', analyticsData.generatedAt]
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="analytics_report.csv"');
      res.send(csvContent);
    }
    
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
});
`

// Insert the export routes before the error handlers
const errorHandlerIndex = appJsContent.indexOf("app.use((err, req, res, next)")
if (errorHandlerIndex !== -1) {
  appJsContent =
    appJsContent.slice(0, errorHandlerIndex) + exportRoutes + "\n\n" + appJsContent.slice(errorHandlerIndex)
  fs.writeFileSync(appJsPath, appJsContent)
  console.log("✅ Added export API routes to app.js")
} else {
  console.log("❌ Could not find error handler in app.js")
}

console.log("✅ Export functionality added successfully!")
console.log('📋 Run "npm install" to install new dependencies, then restart your server')
