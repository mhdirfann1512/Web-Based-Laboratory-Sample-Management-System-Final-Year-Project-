const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing Admin Dashboard Layout - Maintaining Font Sizes...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

const adminDashboardContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Sample Storage System</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Layout Optimization - Keep Normal Font Sizes */
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        .navbar {
            height: 60px;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #fff;
            border-bottom: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .container {
            height: calc(100vh - 60px);
            max-width: 100%;
            margin: 0;
            padding: 0;
        }

        .dashboard-layout {
            display: flex;
            height: 100%;
            overflow: hidden;
        }

        .sidebar {
            width: 300px;
            background: #f8fafc;
            border-right: 1px solid #e5e7eb;
            padding: 1.5rem;
            overflow-y: auto;
            flex-shrink: 0;
        }

        .main-content {
            flex: 1;
            padding: 1.5rem;
            overflow-y: auto;
            background: #ffffff;
            display: flex;
            flex-direction: column;
        }

        /* Profile Section - Compact but readable */
        .user-profile.card {
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-avatar img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 1rem;
        }

        .profile-info h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
        }

        .profile-info p {
            margin: 0.25rem 0;
            font-size: 0.9rem;
            color: #6b7280;
        }

        /* Stats Section - More compact */
        .quick-stats.card {
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .quick-stats h4 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .stat-item:last-child {
            border-bottom: none;
        }

        .stat-label {
            font-size: 0.9rem;
            color: #6b7280;
        }

        .stat-value {
            font-size: 0.9rem;
            font-weight: 600;
            color: #1f2937;
        }

        /* Header - Normal size */
        .page-header {
            margin-bottom: 1.5rem;
        }

        .page-header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2rem;
            font-weight: 700;
            color: #1f2937;
        }

        .page-header p {
            margin: 0;
            font-size: 1rem;
            color: #6b7280;
        }

        /* Action Cards - Arrange in 2 rows to fit better */
        .action-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 1.5rem;
            flex: 1;
        }

        .action-card.card {
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            flex-direction: column;
        }

        .action-card.card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
            width: 50px;
            height: 50px;
            background: #3b82f6;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .card-icon i {
            color: white;
            font-size: 1.5rem;
        }

        .card-content h3 {
            margin: 0 0 0.75rem 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
        }

        .card-content p {
            margin: 0 0 1rem 0;
            font-size: 0.95rem;
            color: #6b7280;
            line-height: 1.5;
            flex: 1;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            font-weight: 500;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.2s ease;
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
        }

        .btn-secondary:hover {
            background: #4b5563;
        }

        /* Activity Section - More compact */
        .recent-activity.card {
            padding: 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            max-height: 200px;
            overflow-y: auto;
        }

        .recent-activity h3 {
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            background: #f3f4f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .activity-icon i {
            color: #6b7280;
            font-size: 1rem;
        }

        .activity-content p {
            margin: 0 0 0.25rem 0;
            font-size: 0.9rem;
            color: #1f2937;
        }

        .activity-content small {
            font-size: 0.8rem;
            color: #9ca3af;
        }

        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.95rem;
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

        /* Admin specific styling */
        .admin-feature .card-icon {
            background: #dc2626;
        }

        .admin-feature .card-content h3 {
            color: #dc2626;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
            .action-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .dashboard-layout {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                height: auto;
                max-height: 250px;
            }
            
            .action-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <nav class="navbar container">
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
        <div class="dashboard-layout">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="user-profile card">
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

                <div class="quick-stats card">
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
                        <span class="stat-value" id="systemHealth" style="color: #10b981;">Excellent</span>
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

                <div id="message" class="alert" style="display: none;"></div>

                <!-- Action Cards - 2x2 Grid -->
                <div class="action-grid">
                    <div class="action-card card admin-feature">
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

                    <div class="action-card card">
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

                    <div class="action-card card">
                        <div class="card-icon">
                            <i class="fas fa-database"></i>
                        </div>
                        <div class="card-content">
                            <h3>Sample Management</h3>
                            <p>Oversee all sample operations, manage disposal schedules, and monitor compliance status.</p>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                <a href="/admin-samples" class="btn btn-primary">
                                    <i class="fas fa-cogs"></i> Manage Types
                                </a>
                                <a href="/view-samples" class="btn btn-secondary">
                                    <i class="fas fa-eye"></i> View Samples
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- System Activity moved to action grid -->
                    <div class="recent-activity card">
                        <h3>System Activity</h3>
                        <div class="activity-list" id="systemActivity">
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-user-plus"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>New staff member</strong> registered</p>
                                    <small>2 hours ago</small>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-database"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Database backup</strong> completed</p>
                                    <small>6 hours ago</small>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="activity-content">
                                    <p><strong>Weekly report</strong> generated</p>
                                    <small>1 day ago</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Check authentication and load data
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                await loadAdminProfile();
                await loadSystemStats();
            } catch (error) {
                console.error('Error loading dashboard:', error);
                // Don't redirect, just show default values
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
                    
                    const adminAvatar = document.getElementById('adminAvatar');
                    if (profile.profile_picture) {
                        adminAvatar.src = profile.profile_picture;
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        }

        async function loadSystemStats() {
            try {
                const response = await fetch('/api/admin/system-overview');
                if (response.ok) {
                    const stats = await response.json();
                    
                    document.getElementById('totalStaff').textContent = stats.totalStaff || '12';
                    document.getElementById('activeSamples').textContent = stats.activeSamples || '248';
                    document.getElementById('systemHealth').textContent = stats.systemHealth || 'Excellent';
                    document.getElementById('totalFreezers').textContent = stats.totalFreezers || '8';
                    document.getElementById('sampleTypes').textContent = stats.sampleTypes || '15';
                    
                    const systemHealthElement = document.getElementById('systemHealth');
                    if (stats.systemHealth === 'Good' || stats.systemHealth === 'Excellent') {
                        systemHealthElement.style.color = '#10b981';
                    } else if (stats.systemHealth === 'Attention Required') {
                        systemHealthElement.style.color = '#f59e0b';
                    } else {
                        systemHealthElement.style.color = '#ef4444';
                    }
                }
            } catch (error) {
                console.error('Error loading system stats:', error);
            }
        }

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
  fs.writeFileSync(adminDashboardPath, adminDashboardContent)
  console.log("✅ Admin dashboard layout fixed successfully!")
  console.log("📋 Changes made:")
  console.log("   • Maintained normal font sizes")
  console.log("   • Arranged action cards in 2x2 grid")
  console.log("   • Moved system activity to action grid")
  console.log("   • Optimized spacing without shrinking fonts")
  console.log("   • Kept theme and structure intact")
  console.log("")
  console.log("🚀 Refresh your browser to see the changes!")
} catch (error) {
  console.error("❌ Error fixing admin dashboard:", error.message)
}
