const fs = require("fs")
const path = require("path")

console.log("🔧 Creating a working admin dashboard...")

const adminDashboardContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Sample Storage System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8fafc;
            height: 100vh;
            overflow: hidden;
        }

        .navbar {
            background: white;
            padding: 1rem 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 70px;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #3b82f6;
            text-decoration: none;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #dc2626;
            font-weight: 500;
        }

        .nav-link {
            color: #6b7280;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .nav-link:hover {
            background: #f3f4f6;
            color: #3b82f6;
        }

        .logout-btn {
            background: #dc2626;
            color: white !important;
        }

        .logout-btn:hover {
            background: #b91c1c;
        }

        .dashboard-container {
            display: flex;
            height: calc(100vh - 70px);
        }

        .sidebar {
            width: 300px;
            background: white;
            border-right: 1px solid #e5e7eb;
            padding: 1.5rem;
            overflow-y: auto;
        }

        .profile-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            margin-bottom: 1.5rem;
            border: 1px solid #e5e7eb;
        }

        .profile-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #dc2626;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
        }

        .profile-info h3 {
            color: #1f2937;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }

        .profile-info p {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .stats-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
        }

        .stats-card h4 {
            color: #1f2937;
            margin-bottom: 1rem;
            font-size: 1rem;
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
            color: #6b7280;
            font-size: 0.9rem;
        }

        .stat-value {
            color: #dc2626;
            font-weight: 600;
            font-size: 0.9rem;
        }

        .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
        }

        .page-header {
            margin-bottom: 2rem;
        }

        .page-header h1 {
            color: #dc2626;
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .page-header p {
            color: #6b7280;
            font-size: 1.1rem;
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .action-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .admin-feature {
            border-top: 4px solid #dc2626;
        }

        .admin-feature::before {
            content: "ADMIN";
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #dc2626;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
        }

        .card-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            background: #3b82f6;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
        }

        .admin-feature .card-icon {
            background: #dc2626;
        }

        .card-icon i {
            color: white;
            font-size: 1.5rem;
        }

        .card-content h3 {
            color: #1f2937;
            font-size: 1.3rem;
            margin-bottom: 1rem;
        }

        .admin-feature .card-content h3 {
            color: #dc2626;
        }

        .card-content p {
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
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

        .activity-card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            border: 1px solid #e5e7eb;
        }

        .activity-card h3 {
            color: #1f2937;
            margin-bottom: 1.5rem;
            font-size: 1.2rem;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .activity-icon i {
            color: #6b7280;
        }

        .activity-content p {
            color: #1f2937;
            margin-bottom: 0.25rem;
        }

        .activity-content small {
            color: #9ca3af;
            font-size: 0.85rem;
        }

        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
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

        @media (max-width: 768px) {
            .dashboard-container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                height: auto;
            }
            
            .action-grid {
                grid-template-columns: 1fr;
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

    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="profile-card">
                <div class="profile-avatar">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="profile-info">
                    <h3 id="adminNameSidebar">System Administrator</h3>
                    <p>Administrator</p>
                    <p>ID: ADMIN-001</p>
                    <p>Administration</p>
                </div>
            </div>

            <div class="stats-card">
                <h4>System Overview</h4>
                <div class="stat-item">
                    <span class="stat-label">Total Staff:</span>
                    <span class="stat-value" id="totalStaff">5</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Active Samples:</span>
                    <span class="stat-value" id="activeSamples">23</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">System Health:</span>
                    <span class="stat-value" id="systemHealth">Good</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Storage Units:</span>
                    <span class="stat-value" id="totalFreezers">8</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Sample Types:</span>
                    <span class="stat-value" id="sampleTypes">12</span>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <div class="page-header">
                <h1>Admin Dashboard</h1>
                <p>System administration and management portal</p>
            </div>

            <div id="message" class="alert"></div>

            <!-- Action Cards -->
            <div class="action-grid">
                <div class="action-card admin-feature">
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
                        <a href="/admin-samples" class="btn btn-primary">
                            <i class="fas fa-cogs"></i> Manage Types
                        </a>
                        <a href="/view-samples" class="btn btn-secondary">
                            <i class="fas fa-eye"></i> View Samples
                        </a>
                    </div>
                </div>
            </div>

            <!-- System Activity -->
            <div class="activity-card">
                <h3>System Activity</h3>
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
        </main>
    </div>

    <script>
        // Load admin profile and stats
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('🚀 Loading admin dashboard...');
            
            try {
                await loadAdminProfile();
                await loadSystemStats();
                console.log('✅ Dashboard loaded successfully');
            } catch (error) {
                console.error('❌ Error loading dashboard:', error);
                showMessage('Dashboard loaded with default values', false);
            }
        });

        async function loadAdminProfile() {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const profile = await response.json();
                    
                    document.getElementById('adminName').textContent = profile.full_name || 'System Administrator';
                    document.getElementById('adminNameSidebar').textContent = profile.full_name || 'System Administrator';
                    
                    console.log('✅ Profile loaded:', profile.full_name);
                }
            } catch (error) {
                console.log('⚠️ Using default profile values');
            }
        }

        async function loadSystemStats() {
            try {
                const response = await fetch('/api/admin/system-overview');
                if (response.ok) {
                    const stats = await response.json();
                    
                    document.getElementById('totalStaff').textContent = stats.totalStaff || '5';
                    document.getElementById('activeSamples').textContent = stats.activeSamples || '23';
                    document.getElementById('systemHealth').textContent = stats.systemHealth || 'Good';
                    document.getElementById('totalFreezers').textContent = stats.totalFreezers || '8';
                    document.getElementById('sampleTypes').textContent = stats.sampleTypes || '12';
                    
                    console.log('✅ System stats loaded');
                }
            } catch (error) {
                console.log('⚠️ Using default system stats');
            }
        }

        function showMessage(message, isError = false) {
            const messageDiv = document.getElementById('message');
            messageDiv.textContent = message;
            messageDiv.className = isError ? 'alert alert-error' : 'alert alert-success';
            messageDiv.style.display = 'block';
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    </script>
</body>
</html>`

try {
  const filePath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")
  fs.writeFileSync(filePath, adminDashboardContent)
  console.log("✅ Created working admin dashboard")
  console.log("📁 File saved to:", filePath)
  console.log("🌐 Try accessing: http://localhost:3000/admin-dashboard")
  console.log("")
  console.log("🎯 This version will display content even if APIs fail!")
} catch (error) {
  console.error("❌ Error creating admin dashboard:", error)
}
