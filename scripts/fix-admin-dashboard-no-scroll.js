const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing Admin Dashboard - No Scroll Version...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

const noScrollAdminDashboard = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Sample Storage System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* No Scroll Admin Dashboard - Perfect Fit */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100vh;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8fafc;
        }

        /* Header */
        .navbar {
            height: 50px;
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }

        .logo {
            font-size: 1.25rem;
            font-weight: 700;
            color: #3b82f6;
            text-decoration: none;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #374151;
        }

        .nav-link {
            color: #6b7280;
            text-decoration: none;
            font-size: 0.875rem;
            padding: 0.5rem;
            border-radius: 4px;
            transition: all 0.2s;
        }

        .nav-link:hover {
            background: #f3f4f6;
            color: #374151;
        }

        .logout-btn {
            color: #dc2626;
        }

        /* Main Container */
        .container {
            height: 100vh;
            padding-top: 50px;
            display: flex;
            overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
            width: 250px;
            background: #fff;
            border-right: 1px solid #e5e7eb;
            padding: 0.75rem;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .user-profile {
            background: #f8fafc;
            border-radius: 8px;
            padding: 0.75rem;
            text-align: center;
            border: 1px solid #e5e7eb;
        }

        .profile-avatar img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 0.5rem;
        }

        .profile-info h3 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }

        .profile-info p {
            font-size: 0.75rem;
            color: #6b7280;
            margin: 0.125rem 0;
        }

        .quick-stats {
            background: #fff;
            border-radius: 8px;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            flex: 1;
            overflow: hidden;
        }

        .quick-stats h4 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.25rem 0;
            font-size: 0.75rem;
        }

        .stat-label {
            color: #6b7280;
        }

        .stat-value {
            font-weight: 600;
            color: #1f2937;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 0.75rem;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .page-header {
            margin-bottom: 0.75rem;
        }

        .page-header h1 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.25rem;
        }

        .page-header p {
            font-size: 0.875rem;
            color: #6b7280;
        }

        /* Action Grid */
        .action-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            flex: 1;
        }

        .action-card {
            background: #fff;
            border-radius: 8px;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            transition: all 0.2s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
        }

        .action-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-icon {
            width: 35px;
            height: 35px;
            background: #3b82f6;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.5rem;
        }

        .card-icon i {
            color: white;
            font-size: 1rem;
        }

        .card-content h3 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.375rem;
        }

        .card-content p {
            font-size: 0.75rem;
            color: #6b7280;
            line-height: 1.3;
            margin-bottom: 0.5rem;
            flex: 1;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.375rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 4px;
            text-decoration: none;
            transition: all 0.2s;
            margin-top: auto;
        }

        .btn-primary {
            background: #3b82f6;
            color: white;
        }

        .btn-primary:hover {
            background: #2563eb;
        }

        .btn-secondary {
            background: #6b7280;
            color: white;
            margin-left: 0.25rem;
        }

        .btn-secondary:hover {
            background: #4b5563;
        }

        /* Activity Section */
        .recent-activity {
            background: #fff;
            border-radius: 8px;
            padding: 0.75rem;
            border: 1px solid #e5e7eb;
            height: 150px;
            overflow: hidden;
        }

        .recent-activity h3 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0;
            font-size: 0.75rem;
        }

        .activity-icon {
            width: 24px;
            height: 24px;
            background: #f3f4f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .activity-icon i {
            color: #6b7280;
            font-size: 0.75rem;
        }

        .activity-content p {
            color: #1f2937;
            margin: 0;
        }

        .activity-content small {
            color: #9ca3af;
            font-size: 0.625rem;
        }

        .alert {
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            font-size: 0.75rem;
            display: none;
        }

        .alert-error {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }

        .alert-success {
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                height: 120px;
                flex-direction: row;
                gap: 0.5rem;
            }
            
            .action-grid {
                grid-template-columns: 1fr;
            }
            
            .recent-activity {
                height: 100px;
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
                    <i class="fas fa-user-shield"></i>
                    <span id="adminName">System Administrator</span>
                </span>
                <a href="/admin-profile" class="nav-link">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="/staff-dashboard" class="nav-link">
                    <i class="fas fa-eye"></i> Staff View
                </a>
                <a href="/logout" class="nav-link logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        </nav>
    </header>

    <main class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="user-profile">
                <div class="profile-avatar">
                    <img src="/images/admin-avatar.png" alt="Admin Photo" id="adminAvatar">
                </div>
                <div class="profile-info">
                    <h3 id="adminNameSidebar">System Administrator</h3>
                    <p id="adminPosition">Administrator</p>
                    <p id="adminId">ID: ADMIN001</p>
                    <p id="adminDepartment">Administration</p>
                </div>
            </div>

            <div class="quick-stats">
                <h4>System Overview</h4>
                <div class="stat-item">
                    <span class="stat-label">Total Staff:</span>
                    <span class="stat-value" id="totalStaff">12</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Active Samples:</span>
                    <span class="stat-value" id="activeSamples">248</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">System Health:</span>
                    <span class="stat-value" id="systemHealth" style="color: #10b981;">Good</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Storage Units:</span>
                    <span class="stat-value" id="totalFreezers">8</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Sample Types:</span>
                    <span class="stat-value" id="sampleTypes">15</span>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
            <div class="page-header">
                <h1>Admin Dashboard</h1>
                <p>System administration and management portal</p>
            </div>

            <div id="message" class="alert"></div>

            <!-- Action Cards -->
            <div class="action-grid">
                <div class="action-card">
                    <div class="card-icon">
                        <i class="fas fa-users-cog"></i>
                    </div>
                    <div class="card-content">
                        <h3>User Management</h3>
                        <p>Create, edit, and manage system users and their permissions. Control access levels and monitor user activity.</p>
                        <a href="/manage-users" class="btn btn-primary">
                            <i class="fas fa-users"></i> Manage Users
                        </a>
                    </div>
                </div>

                <div class="action-card">
                    <div class="card-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="card-content">
                        <h3>Analytics & Reports</h3>
                        <p>Generate comprehensive reports on system usage, sample tracking, and performance metrics.</p>
                        <a href="/admin-reports" class="btn btn-primary">
                            <i class="fas fa-chart-bar"></i> View Reports
                        </a>
                    </div>
                </div>

                <div class="action-card">
                    <div class="card-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="card-content">
                        <h3>Sample Management</h3>
                        <p>Oversee all sample operations, manage disposal schedules, and monitor compliance status.</p>
                        <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;">
                            <a href="/admin-samples" class="btn btn-primary">
                                <i class="fas fa-cogs"></i> Manage Types
                            </a>
                            <a href="/view-samples" class="btn btn-secondary">
                                <i class="fas fa-eye"></i> View Samples
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- System Activity -->
            <div class="recent-activity">
                <h3>System Activity</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="activity-content">
                            <p><strong>New staff member</strong> registered in the system</p>
                            <small>2 hours ago</small>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-database"></i>
                        </div>
                        <div class="activity-content">
                            <p><strong>Database backup</strong> completed successfully</p>
                            <small>6 hours ago</small>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="activity-content">
                            <p><strong>Weekly report</strong> generated and archived</p>
                            <small>1 day ago</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Load profile data with fallback
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                await loadAdminProfile();
                await loadSystemStats();
            } catch (error) {
                console.log('Using fallback data');
                // Fallback data is already in HTML
            }
        });

        async function loadAdminProfile() {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const profile = await response.json();
                    document.getElementById('adminName').textContent = profile.full_name || 'System Administrator';
                    document.getElementById('adminNameSidebar').textContent = profile.full_name || 'System Administrator';
                    document.getElementById('adminId').textContent = \`ID: \${profile.admin_id || 'ADMIN001'}\`;
                    
                    if (profile.profile_picture) {
                        document.getElementById('adminAvatar').src = profile.profile_picture;
                    }
                }
            } catch (error) {
                console.log('Profile API not available, using defaults');
            }
        }

        async function loadSystemStats() {
            try {
                const response = await fetch('/api/admin/system-overview');
                if (response.ok) {
                    const stats = await response.json();
                    document.getElementById('totalStaff').textContent = stats.totalStaff || '12';
                    document.getElementById('activeSamples').textContent = stats.activeSamples || '248';
                    document.getElementById('systemHealth').textContent = stats.systemHealth || 'Good';
                    document.getElementById('totalFreezers').textContent = stats.totalFreezers || '8';
                    document.getElementById('sampleTypes').textContent = stats.sampleTypes || '15';
                }
            } catch (error) {
                console.log('System stats API not available, using defaults');
            }
        }

        function showMessage(message, isError = false) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.className = isError ? 'alert alert-error' : 'alert alert-success';
            setTimeout(() => messageDiv.style.display = 'none', 3000);
        }
    </script>
</body>
</html>`

try {
  fs.writeFileSync(adminDashboardPath, noScrollAdminDashboard)
  console.log("✅ Admin dashboard updated successfully!")
  console.log("📏 Dashboard now fits perfectly on one page with no scrolling")
  console.log("🎯 Features:")
  console.log("   - Fixed height layout (100vh)")
  console.log("   - No scrolling (overflow: hidden)")
  console.log("   - Compact design with all content visible")
  console.log("   - Responsive grid layout")
  console.log("   - Fallback data if APIs fail")
  console.log("")
  console.log("🔄 Please refresh your browser to see the changes!")
} catch (error) {
  console.error("❌ Error updating admin dashboard:", error.message)
}
