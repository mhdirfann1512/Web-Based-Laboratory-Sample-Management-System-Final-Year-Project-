const fs = require("fs")
const path = require("path")

console.log("🔧 Adding simple export routes without external dependencies...")

const appPath = path.join(__dirname, "..", "app.js")

if (!fs.existsSync(appPath)) {
  console.log("❌ app.js not found")
  process.exit(1)
}

let content = fs.readFileSync(appPath, "utf8")

// Add simple export routes that don't require external packages
const exportRoutes = `
// Simple export routes without external dependencies
app.get("/api/admin/export/:type/:format", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const { type, format } = req.params

    if (type === "samples") {
      const [samples] = await db.promise().query(\`
        SELECT 
          s.sample_id,
          s.patient_name,
          s.patient_id,
          s.collection_date,
          s.registration_date,
          s.status,
          st.type_name as sample_type,
          test.test_name,
          storage.storage_name,
          staff.full_name as staff_name
        FROM samples s
        LEFT JOIN sample_types st ON s.sample_type_id = st.type_id
        LEFT JOIN sample_tests test ON s.test_id = test.test_id
        LEFT JOIN sample_storage storage ON s.storage_id = storage.storage_id
        LEFT JOIN staff ON s.staff_id = staff.staff_id
        ORDER BY s.registration_date DESC
      \`)

      if (format === "csv") {
        let csv = "Sample ID,Patient Name,Patient ID,Collection Date,Registration Date,Status,Sample Type,Test Type,Storage Location,Staff Name\\n"
        samples.forEach(sample => {
          csv += \`"\${sample.sample_id}","\${sample.patient_name}","\${sample.patient_id}","\${sample.collection_date}","\${sample.registration_date}","\${sample.status}","\${sample.sample_type || 'N/A'}","\${sample.test_name || 'N/A'}","\${sample.storage_name || 'N/A'}","\${sample.staff_name || 'N/A'}"\\n\`
        })
        
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="samples_report.csv"')
        return res.send(csv)
      } else if (format === "json") {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', 'attachment; filename="samples_report.json"')
        return res.json(samples)
      }
    } else if (type === "staff") {
      const [staff] = await db.promise().query(\`
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
          COALESCE(sample_stats.active_samples, 0) as active_samples
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
      \`)

      if (format === "csv") {
        let csv = "Staff ID,Full Name,Username,Email,Department,Phone,Join Date,Samples Registered,Samples Disposed,Active Samples\\n"
        staff.forEach(member => {
          csv += \`"\${member.staff_id}","\${member.full_name}","\${member.username}","\${member.email}","\${member.department || 'N/A'}","\${member.phone_number || 'N/A'}","\${member.created_at}","\${member.samples_registered}","\${member.samples_disposed}","\${member.active_samples}"\\n\`
        })
        
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename="staff_report.csv"')
        return res.send(csv)
      } else if (format === "json") {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', 'attachment; filename="staff_report.json"')
        return res.json(staff)
      } else if (format === "pdf") {
        // Simple HTML that can be printed as PDF
        let html = \`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Staff Performance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>Staff Performance Report</h1>
          <p>Generated on: \${new Date().toLocaleDateString()}</p>
          <table>
            <tr>
              <th>Full Name</th>
              <th>Department</th>
              <th>Email</th>
              <th>Samples Registered</th>
              <th>Samples Disposed</th>
              <th>Active Samples</th>
            </tr>
        \`
        
        staff.forEach(member => {
          html += \`
            <tr>
              <td>\${member.full_name}</td>
              <td>\${member.department || 'N/A'}</td>
              <td>\${member.email}</td>
              <td>\${member.samples_registered}</td>
              <td>\${member.samples_disposed}</td>
              <td>\${member.active_samples}</td>
            </tr>
          \`
        })
        
        html += \`
          </table>
        </body>
        </html>
        \`
        
        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Content-Disposition', 'attachment; filename="staff_report.html"')
        return res.send(html)
      }
    }

    res.status(400).json({ message: "Invalid export type or format" })

  } catch (error) {
    console.error("Export error:", error)
    res.status(500).json({ message: "Export failed: " + error.message })
  }
})

`

// Add the export routes before the error handlers
const errorHandlerIndex = content.indexOf("app.use((err, req, res, next) => {")
if (errorHandlerIndex !== -1) {
  content = content.slice(0, errorHandlerIndex) + exportRoutes + content.slice(errorHandlerIndex)
} else {
  // Add before the last app.listen
  const listenIndex = content.lastIndexOf("const server = app.listen")
  content = content.slice(0, listenIndex) + exportRoutes + content.slice(listenIndex)
}

fs.writeFileSync(appPath, content)

console.log("✅ Added simple export routes without external dependencies!")
console.log("📋 Now restart your server: node app.js")
console.log("🚀 Export buttons will now download real CSV, JSON, and HTML files!")
