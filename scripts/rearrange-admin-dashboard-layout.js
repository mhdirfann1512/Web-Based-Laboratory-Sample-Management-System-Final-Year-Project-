const fs = require("fs")
const path = require("path")

console.log("🔧 Rearranging Admin Dashboard Layout...")

const adminDashboardPath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")

// Check if file exists
if (!fs.existsSync(adminDashboardPath)) {
  console.log("❌ Admin dashboard file not found!")
  process.exit(1)
}

// Read current content
const content = fs.readFileSync(adminDashboardPath, "utf8")

// Create the new HTML content with rearranged layout
const newContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Sample Storage System</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/dashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Rearranged Layout - Fit on One Page */
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
            width: 280px;
            background: #f8fafc;
            border-right: 1px solid #e5e7eb;
            padding: 1rem;
            overflow-y: auto;
            flex-shrink: 0;
        }

        .main-content {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        .content-left {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
        }

        .content-right {
            width: 300px;
            padding: 1rem;
            background: #f9fafb;
            border-left: 1px solid #e5e7eb;
            overflow-y: auto;
        }

        .user-profile.card {
            padding: 1rem;
            margin-bottom: 1rem;
            text-align: center;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .profile-avatar img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 0.5rem;
        }

        .profile-info h3 {
            margin: 0 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
        }

        .profile-info p {
            margin: 0.125rem 0;
            font-size: 0.8rem;
            color: #6b7280;
        }

        .quick-stats.card {
            padding: 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .quick-stats h4 {
            margin: 0 0 0.75rem 0;
            font-size: 0.9rem;
            font-weight: 600;
            color: #1f2937;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.375rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .stat-item:last-child {
            border-bottom: none;
        }

        .stat-label {
            font-size: 0.75rem;
            color: #6b7280;
        }

        .stat-value {
            font-size: 0.75rem;
            font-weight: 600;
            color: #1f2937;
        }

        .page-header {
            margin-bottom: 1.5rem;
        }

        .page-header h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
        }

        .action-cards {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .action-card.card {
            padding: 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .action-card.card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
            width: 48px;
            height: 48px;
            background: #3b82f6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
        }

        .card-icon i {
            color: white;
            font-size: 1.25rem;
        }

        .card-content h3 {
            margin: 0 0 1rem 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            font-weight: 500;
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.2s ease;
            margin-right: 0.5rem;
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

        .recent-activity.card {
            padding: 1.5rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            height: fit-content;
        }

        .recent-activity h3 {
            margin: 0 0 1rem 0;
            font-size: 1.125rem;
            font-weight: 600;
            color: #1f2937;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 36px;
            height: 36px;
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
            font-size: 0.875rem;
            color: #1f2937;
        }

        .activity-content small {
            font-size: 0.75rem;
            color: #9ca3af;
        }

        .alert {
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            font-size: 0.875rem;
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
            .dashboard-layout {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                height: auto;
                max-height: 200px;
            }
            
            .main-content {
                flex-direction: column;
            }
            
            .content-right {
                width: 100%;
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
                    <span id="adminName">Loading...</span>
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
                        <h3 id="adminNameSidebar">Loading...</h3>
                        <p id="adminPosition">System Administrator</p>
                        <p id="adminId">ID: Loading...</p>
                        <p id="adminDepartment">Administration</p>
                    </div>
                </div>

                <div class="quick-stats card">
                    <h4>System Overview</h4>
                    <div class="stat-item">
                        <span class="stat-label">Total Staff:</span>
                        <span class="stat-value" id="totalStaff">Loading...</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Active Samples:</span>
                        <span class="stat-value" id="activeSamples">Loading...</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">System Health:</span>
                        <span class="stat-value" id="systemHealth">Loading...</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Storage Units:</span>
                        <span class="stat-value" id="totalFreezers">Loading...</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Sample Types:</span>
                        <span class="stat-value" id="sampleTypes">Loading...</span>
                    </div>
                </div>
            </aside>

            <!-- Main Content -->
            <div class="main-content">
                <!-- Left Content -->
                <div class="content-left">
                    <div class="page-header">
                        <h1>Admin Dashboard</h1>
                    </div>

                    <div id="message" class="alert" style="display: none;"></div>

                    <!-- Action Cards -->
                    <div class="action-cards">
                        <!-- User Management -->
                        <div class="action-card card admin-feature">
                            <div class="card-icon">
                                <i class="fas fa-users-cog"></i>
                            </div>
                            <div class="card-content">
                                <h3>User Management</h3>
                                <a href="/manage-users" class="btn btn-primary">
                                    <i class="fas fa-users"></i> Manage Users
                                </a>
                            </div>
                        </div>

                        <!-- Sample Management -->
                        <div class="action-card card">
                            <div class="card-icon">
                                <i class="fas fa-database"></i>
                            </div>
                            <div class="card-content">
                                <h3>Sample Management</h3>
                                <a href="/admin-samples" class="btn btn-primary">
                                    <i class="fas fa-cogs"></i> Manage Types
                                </a>
                                <a href="/view-samples" class="btn btn-secondary">
                                    <i class="fas fa-eye"></i> View Samples
                                </a>
                            </div>
                        </div>

                        <!-- Analytics & Reports -->
                        <div class="action-card card">
                            <div class="card-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="card-content">
                                <h3>Analytics & Reports</h3>
                                <a href="/admin-reports" class="btn btn-primary">
                                    <i class="fas fa-chart-bar"></i> View Reports
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Content - System Activity -->
                <div class="content-right">
                    <div class="recent-activity card">
                        <h3>System Activity</h3>
                        <div class="activity-list" id="systemActivity">
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
            </div>
        </div>
    </main>

    <script>
        // Check authentication
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                await loadAdminProfile();
                await loadSystemStats();
                await loadSystemActivity();
            } catch (error) {
                console.error('Error loading dashboard:', error);
                window.location.href = '/login';
            }
        });

        async function loadAdminProfile() {
            try {
                const response = await fetch('/api/profile');
                if (!response.ok) {
                    throw new Error('Failed to load profile');
                }
                
                const profile = await response.json();
                
                // Update profile information
                document.getElementById('adminName').textContent = profile.full_name || 'Administrator';
                document.getElementById('adminNameSidebar').textContent = profile.full_name || 'Administrator';
                document.getElementById('adminPosition').textContent = 'System Administrator';
                document.getElementById('adminId').textContent = \`ID: \${profile.admin_id || 'N/A'}\`;
                document.getElementById('adminDepartment').textContent = 'Administration';
                
                // Update profile picture if available
                const adminAvatar = document.getElementById('adminAvatar');
                if (profile.profile_picture) {
                    adminAvatar.src = profile.profile_picture;
                } else {
                    adminAvatar.src = '/images/admin-avatar.png';
                }
                
            } catch (error) {
                console.error('Error loading profile:', error);
                showMessage('Error loading profile information', true);
            }
        }

        async function loadSystemStats() {
            try {
                console.log('Fetching system stats...');
                const response = await fetch('/api/admin/system-overview');
                
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                
                const stats = await response.json();
                console.log('Received stats:', stats);
                
                // Update system stats with real data
                document.getElementById('totalStaff').textContent = stats.totalStaff || '0';
                document.getElementById('activeSamples').textContent = stats.activeSamples || '0';
                document.getElementById('systemHealth').textContent = stats.systemHealth || 'Unknown';
                document.getElementById('totalFreezers').textContent = stats.totalFreezers || '0';
                document.getElementById('sampleTypes').textContent = stats.sampleTypes || '0';
                
                // Add visual indicator for system health
                const systemHealthElement = document.getElementById('systemHealth');
                if (stats.systemHealth === 'Good' || stats.systemHealth === 'Excellent') {
                    systemHealthElement.style.color = '#10b981'; // Green color
                } else if (stats.systemHealth === 'Attention Required') {
                    systemHealthElement.style.color = '#f59e0b'; // Warning color
                } else {
                    systemHealthElement.style.color = '#ef4444'; // Error color
                }
                
            } catch (error) {
                console.error('Error loading system stats:', error);
                
                // Show more helpful error messages
                const errorMsg = error.message.includes('Failed to fetch') 
                    ? 'Connection Error' 
                    : 'Data Error';
                    
                document.getElementById('totalStaff').textContent = errorMsg;
                document.getElementById('activeSamples').textContent = errorMsg;
                document.getElementById('systemHealth').textContent = errorMsg;
                document.getElementById('totalFreezers').textContent = errorMsg;
                document.getElementById('sampleTypes').textContent = errorMsg;
                
                // Show error message to user
                showMessage('Failed to load system statistics. Please check your database connection.', true);
            }
        }

        async function loadSystemActivity() {
            try {
                // For now, we'll keep the placeholder activity data
                // In the future, you could implement an API endpoint for real activity logs
                const activityList = document.getElementById('systemActivity');
                // Activity is already populated in HTML for now
            } catch (error) {
                console.error('Error loading system activity:', error);
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

// Write the new content
fs.writeFileSync(adminDashboardPath, newContent, "utf8")

console.log("✅ Admin dashboard layout rearranged successfully!")
console.log("📋 Changes made:")
console.log("   • Sample Management moved below User Management")
console.log("   • System Activity positioned on the right side")
console.log("   • Clean 2-column layout created")
console.log("   • Removed descriptive texts")
console.log("   • Maintained responsive design")
console.log("")
console.log("🔄 Please refresh your browser to see the changes!")
