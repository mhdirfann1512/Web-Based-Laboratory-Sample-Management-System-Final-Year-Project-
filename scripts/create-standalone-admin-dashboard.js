const fs = require("fs")
const path = require("path")

console.log("🔧 Creating standalone admin dashboard...")

const adminDashboardHTML = `<!DOCTYPE html>
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
            background-color: #f5f7fa;
            height: 100vh;
            overflow: hidden;
        }

        .navbar {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0 2rem;
            height: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            text-decoration: none;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .nav-link {
            color: white;
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            transition: background-color 0.3s;
        }

        .nav-link:hover {
            background-color: rgba(255,255,255,0.2);
        }

        .dashboard-layout {
            display: flex;
            height: calc(100vh - 60px);
        }

        .sidebar {
            width: 280px;
            background: white;
            padding: 1rem;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            overflow-y: auto;
        }

        .main-content {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
        }

        .card {
            background: white;
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
        }

        .user-profile {
            text-align: center;
            margin-bottom: 1rem;
        }

        .profile-avatar img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 0.5rem;
        }

        .system-stats h4 {
            color: #333;
            margin-bottom: 1rem;
            font-size: 1rem;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }

        .stat-value {
            font-weight: bold;
            color: #667eea;
        }

        .page-header {
            margin-bottom: 1rem;
        }

        .page-header h1 {
            color: #333;
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            height: calc(100vh - 200px);
        }

        .action-card {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }

        .action-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .card-icon {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 1rem;
        }

        .card-content h3 {
            color: #333;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }

        .card-content p {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            line-height: 1.4;
        }

        .btn {
            display: inline-block;
            padding: 0.6rem 1.2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: all 0.3s;
            text-align: center;
            border: none;
            cursor: pointer;
            font-size: 0.9rem;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .system-activity {
            max-height: 200px;
            overflow-y: auto;
        }

        .activity-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
            font-size: 0.85rem;
        }

        .activity-time {
            color: #999;
            font-size: 0.75rem;
        }

        @media (max-width: 768px) {
            .dashboard-layout {
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
                <a href="/profile" class="nav-link">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="/staff-dashboard" class="nav-link">
                    <i class="fas fa-users"></i> Staff View
                </a>
                <a href="/logout" class="nav-link">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
        </nav>
    </header>

    <main>
        <div class="dashboard-layout">
            <!-- Sidebar -->
            <aside class="sidebar">
                <div class="user-profile card">
                    <div class="profile-avatar">
                        <img src="/images/admin-avatar.png" alt="Admin Photo" id="adminAvatar" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiIHg9IjIwIiB5PSIyMCI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPHN2Zz4KPHN2Zz4='">
                    </div>
                    <div class="profile-info">
                        <h3 id="adminNameSidebar">System Administrator</h3>
                        <p id="adminRole">Administrator</p>
                        <p id="adminId">ID: ADMIN001</p>
                        <p id="adminDepartment">Department: IT</p>
                    </div>
                </div>

                <div class="system-stats card">
                    <h4><i class="fas fa-chart-bar"></i> System Overview</h4>
                    <div class="stat-item">
                        <span class="stat-label">Total Users:</span>
                        <span class="stat-value" id="totalUsers">25</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Active Samples:</span>
                        <span class="stat-value" id="activeSamples">156</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Storage Capacity:</span>
                        <span class="stat-value" id="storageCapacity">78%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">System Status:</span>
                        <span class="stat-value" style="color: #28a745;">Online</span>
                    </div>
                </div>
            </aside>

            <!-- Main Content -->
            <div class="main-content">
                <div class="page-header">
                    <h1><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h1>
                    <p>System administration and management portal</p>
                </div>

                <div id="message" class="alert" style="display: none;"></div>

                <!-- Action Grid -->
                <div class="action-grid">
                    <div class="action-card card">
                        <div>
                            <div class="card-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="card-content">
                                <h3>Manage Users</h3>
                                <p>Add, edit, and manage user accounts, roles, and permissions across the system.</p>
                            </div>
                        </div>
                        <a href="/manage-users" class="btn">
                            <i class="fas fa-user-cog"></i> Manage Users
                        </a>
                    </div>

                    <div class="action-card card">
                        <div>
                            <div class="card-icon">
                                <i class="fas fa-vials"></i>
                            </div>
                            <div class="card-content">
                                <h3>Sample Management</h3>
                                <p>Oversee all sample operations, storage locations, and disposal processes.</p>
                            </div>
                        </div>
                        <a href="/admin-samples" class="btn">
                            <i class="fas fa-flask"></i> View Samples
                        </a>
                    </div>

                    <div class="action-card card">
                        <div>
                            <div class="card-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="card-content">
                                <h3>Reports & Analytics</h3>
                                <p>Generate comprehensive reports and analyze system performance metrics.</p>
                            </div>
                        </div>
                        <a href="/admin-reports" class="btn">
                            <i class="fas fa-file-alt"></i> View Reports
                        </a>
                    </div>

                    <div class="action-card card">
                        <div>
                            <div class="card-icon">
                                <i class="fas fa-activity"></i>
                            </div>
                            <div class="card-content">
                                <h3>System Activity</h3>
                                <div class="system-activity">
                                    <div class="activity-item">
                                        <div>New sample registered by Dr. Smith</div>
                                        <div class="activity-time">2 minutes ago</div>
                                    </div>
                                    <div class="activity-item">
                                        <div>User login: john.doe@hospital.com</div>
                                        <div class="activity-time">5 minutes ago</div>
                                    </div>
                                    <div class="activity-item">
                                        <div>Sample disposal completed</div>
                                        <div class="activity-time">10 minutes ago</div>
                                    </div>
                                    <div class="activity-item">
                                        <div>System backup completed</div>
                                        <div class="activity-time">1 hour ago</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button class="btn" onclick="refreshActivity()">
                            <i class="fas fa-sync"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Load admin profile and system stats
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                await loadAdminProfile();
                await loadSystemStats();
            } catch (error) {
                console.error('Error loading dashboard:', error);
                // Show default values if API fails
                showDefaultValues();
            }
        });

        async function loadAdminProfile() {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const profile = await response.json();
                    
                    document.getElementById('adminName').textContent = profile.full_name || 'System Administrator';
                    document.getElementById('adminNameSidebar').textContent = profile.full_name || 'System Administrator';
                    document.getElementById('adminRole').textContent = profile.role || 'Administrator';
                    document.getElementById('adminId').textContent = \`ID: \${profile.staff_id || 'ADMIN001'}\`;
                    document.getElementById('adminDepartment').textContent = \`Department: \${profile.department || 'IT'}\`;
                }
            } catch (error) {
                console.log('Using default admin profile');
            }
        }

        async function loadSystemStats() {
            try {
                const response = await fetch('/api/admin/system-overview');
                if (response.ok) {
                    const stats = await response.json();
                    
                    document.getElementById('totalUsers').textContent = stats.totalUsers || '25';
                    document.getElementById('activeSamples').textContent = stats.activeSamples || '156';
                    document.getElementById('storageCapacity').textContent = \`\${stats.storageCapacity || 78}%\`;
                }
            } catch (error) {
                console.log('Using default system stats');
            }
        }

        function showDefaultValues() {
            // Default values are already set in HTML
            console.log('Dashboard loaded with default values');
        }

        function refreshActivity() {
            // Simulate refresh
            const btn = event.target;
            const icon = btn.querySelector('i');
            icon.classList.add('fa-spin');
            
            setTimeout(() => {
                icon.classList.remove('fa-spin');
                showMessage('Activity refreshed successfully', false);
            }, 1000);
        }

        function showMessage(message, isError = true) {
            const messageDiv = document.getElementById('message');
            if (!messageDiv) return;

            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.className = isError ? 'alert alert-error' : 'alert alert-success';
            messageDiv.style.padding = '1rem';
            messageDiv.style.marginBottom = '1rem';
            messageDiv.style.borderRadius = '5px';
            messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
            messageDiv.style.color = isError ? '#721c24' : '#155724';
            messageDiv.style.border = isError ? '1px solid #f5c6cb' : '1px solid #c3e6cb';

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    </script>
</body>
</html>`

// Write the file
const filePath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")
fs.writeFileSync(filePath, adminDashboardHTML)

console.log("✅ Standalone admin dashboard created successfully!")
console.log("📁 File saved to:", filePath)
console.log("🔄 Please hard refresh your browser (Ctrl+F5) to see changes")
