const fs = require("fs")
const path = require("path")

// Read the current app.js file
const appPath = path.join(__dirname, "..", "app.js")
const appContent = fs.readFileSync(appPath, "utf8")

// Check if reports routes already exist
if (!appContent.includes("/api/admin/reports-stats")) {
  console.log("Adding reports API routes to app.js...")

  // Find the position to insert the new routes (before the last app.listen)
  const insertPosition = appContent.lastIndexOf("// Start server")

  const reportsRoutes = `
// Reports API Routes
app.get('/api/admin/reports-stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        // Get total samples
        const totalSamplesResult = await db.query('SELECT COUNT(*) as count FROM samples');
        const totalSamples = totalSamplesResult.rows[0].count;
        
        // Get active samples
        const activeSamplesResult = await db.query('SELECT COUNT(*) as count FROM samples WHERE status = ?', ['active']);
        const activeSamples = activeSamplesResult.rows[0].count;
        
        // Get disposed samples
        const disposedSamplesResult = await db.query('SELECT COUNT(*) as count FROM samples WHERE status = ?', ['disposed']);
        const disposedSamples = disposedSamplesResult.rows[0].count;
        
        // Get total staff
        const totalStaffResult = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['staff']);
        const totalStaff = totalStaffResult.rows[0].count;
        
        res.json({
            totalSamples: totalSamples,
            activeSamples: activeSamples,
            disposedSamples: disposedSamples,
            totalStaff: totalStaff
        });
    } catch (error) {
        console.error('Error fetching reports stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Generate Sample Reports
app.post('/api/admin/generate-report', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { reportType } = req.body;
        
        let reportData = {};
        
        switch (reportType) {
            case 'samples-summary':
                const summaryResult = await db.query(\`
                    SELECT 
                        COUNT(*) as total_samples,
                        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_samples,
                        COUNT(CASE WHEN status = 'disposed' THEN 1 END) as disposed_samples,
                        COUNT(DISTINCT registered_by) as unique_staff
                    FROM samples
                \`);
                reportData = {
                    title: 'Sample Summary Report',
                    data: summaryResult.rows[0],
                    generated_at: new Date().toISOString()
                };
                break;
                
            case 'samples-detailed':
                const detailedResult = await db.query(\`
                    SELECT s.*, u.username as registered_by_name 
                    FROM samples s 
                    LEFT JOIN users u ON s.registered_by = u.id 
                    ORDER BY s.registration_date DESC 
                    LIMIT 100
                \`);
                reportData = {
                    title: 'Detailed Sample Report',
                    data: detailedResult.rows,
                    generated_at: new Date().toISOString()
                };
                break;
                
            case 'staff-performance':
                const performanceResult = await db.query(\`
                    SELECT 
                        u.username,
                        u.full_name,
                        COUNT(s.id) as samples_registered,
                        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_samples,
                        COUNT(CASE WHEN s.status = 'disposed' THEN 1 END) as disposed_samples
                    FROM users u 
                    LEFT JOIN samples s ON u.id = s.registered_by 
                    WHERE u.role = 'staff'
                    GROUP BY u.id, u.username, u.full_name
                    ORDER BY samples_registered DESC
                \`);
                reportData = {
                    title: 'Staff Performance Report',
                    data: performanceResult.rows,
                    generated_at: new Date().toISOString()
                };
                break;
                
            case 'staff-rankings':
                const rankingsResult = await db.query(\`
                    SELECT 
                        u.username,
                        u.full_name,
                        COUNT(s.id) as total_samples,
                        RANK() OVER (ORDER BY COUNT(s.id) DESC) as rank
                    FROM users u 
                    LEFT JOIN samples s ON u.id = s.registered_by 
                    WHERE u.role = 'staff'
                    GROUP BY u.id, u.username, u.full_name
                    ORDER BY total_samples DESC
                \`);
                reportData = {
                    title: 'Staff Rankings Report',
                    data: rankingsResult.rows,
                    generated_at: new Date().toISOString()
                };
                break;
                
            case 'trends':
                const trendsResult = await db.query(\`
                    SELECT 
                        DATE(registration_date) as date,
                        COUNT(*) as samples_registered
                    FROM samples 
                    WHERE registration_date >= DATE('now', '-30 days')
                    GROUP BY DATE(registration_date)
                    ORDER BY date DESC
                \`);
                reportData = {
                    title: 'Sample Registration Trends (Last 30 Days)',
                    data: trendsResult.rows,
                    generated_at: new Date().toISOString()
                };
                break;
                
            default:
                return res.status(400).json({ error: 'Invalid report type' });
        }
        
        res.json({
            success: true,
            report: reportData
        });
        
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Export Report Data
app.post('/api/admin/export-report', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { type, format } = req.body;
        
        let query = '';
        let filename = '';
        
        switch (type) {
            case 'samples':
                query = \`
                    SELECT 
                        s.sample_id,
                        s.sample_type,
                        s.status,
                        s.registration_date,
                        s.disposal_date,
                        u.username as registered_by
                    FROM samples s 
                    LEFT JOIN users u ON s.registered_by = u.id
                    ORDER BY s.registration_date DESC
                \`;
                filename = \`samples_export_\${new Date().toISOString().split('T')[0]}\`;
                break;
                
            case 'staff':
                query = \`
                    SELECT 
                        u.username,
                        u.full_name,
                        u.email,
                        COUNT(s.id) as samples_registered
                    FROM users u 
                    LEFT JOIN samples s ON u.id = s.registered_by 
                    WHERE u.role = 'staff'
                    GROUP BY u.id, u.username, u.full_name, u.email
                    ORDER BY samples_registered DESC
                \`;
                filename = \`staff_export_\${new Date().toISOString().split('T')[0]}\`;
                break;
                
            default:
                return res.status(400).json({ error: 'Invalid export type' });
        }
        
        const result = await db.query(query);
        
        if (format === 'csv') {
            // Convert to CSV format
            const headers = Object.keys(result.rows[0] || {});
            const csvContent = [
                headers.join(','),
                ...result.rows.map(row => headers.map(header => row[header] || '').join(','))
            ].join('\\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', \`attachment; filename="\${filename}.csv"\`);
            res.send(csvContent);
        } else {
            // Return JSON for other formats (PDF, Excel will be handled client-side)
            res.json({
                success: true,
                data: result.rows,
                filename: filename,
                format: format
            });
        }
        
    } catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
});

// Get Recent Reports (placeholder for now)
app.get('/api/admin/recent-reports', requireAuth, requireAdmin, async (req, res) => {
    try {
        // For now, return empty array - in a real system, you'd store report history
        res.json({
            success: true,
            reports: []
        });
    } catch (error) {
        console.error('Error fetching recent reports:', error);
        res.status(500).json({ error: 'Failed to fetch recent reports' });
    }
});

`

  // Insert the new routes
  const newAppContent = appContent.slice(0, insertPosition) + reportsRoutes + "\n" + appContent.slice(insertPosition)

  // Write the updated content back to app.js
  fs.writeFileSync(appPath, newAppContent)
  console.log("✅ Reports API routes added successfully!")
} else {
  console.log("✅ Reports API routes already exist in app.js")
}
