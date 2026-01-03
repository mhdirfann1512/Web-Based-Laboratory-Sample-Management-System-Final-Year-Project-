const fs = require("fs")
const path = require("path")

console.log("🔧 Creating direct admin dashboard fix...")

const simpleAdminHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - Sample Storage System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f7fa;
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

        .container {
            display: flex;
            height: calc(100vh - 60px);
            padding: 1rem;
            gap: 1rem;
        }

        .sidebar {
            width: 280px;
            background: white;
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .user-profile {
            text-align: center;
        }

        .profile-avatar {
            width: 80px;
            height: 80px;
            background: #667eea;
            border-radius: 50%;
            margin: 0 auto 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
        }

        .profile-info h3 {
            color: #333;
            margin-bottom: 0.5rem;
        }

        .profile-info p {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .system-stats h4 {
            color: #333;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }

        .stat-item:last-child {
            border-bottom: none;
        }

        .stat-value {
            font-weight: bold;
            color: #667eea;
        }

        .page-header {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .page-header h1 {
            color: #333;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .content-grid {
            display: flex;
            gap: 1rem;
            flex: 1;
        }

        .left-section {
            flex: 2;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .right-section {
            flex: 1;
        }

        .action-card {
            background: white;
            border-radius: 10px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            cursor: pointer;
        }

        .action-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .card-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
        }

        .card-title {
            color: #333;
            font-size: 1.2rem;
            font-weight: 600;
        }

        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s;
            text-align: center;
            font-weight: 500;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .activity-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: #333;
        }

        .activity-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .activity-item {
            padding: 0.75rem 0;
            border-bottom: 1px solid #eee;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-text {
            color: #333;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }

        .activity-time {
            color: #999;
            font-size: 0.8rem;
        }

        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
            }
            
            .content-grid {
                flex-direction: column;
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
                    <span>System Administrator</span>
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

    <main class="container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="user-profile">
                <div class="profile-avatar">
                    <i class="fas fa-user-shield"></i>
                </div>
                <div class="profile-info">
                    <h3>System Administrator</h3>
                    <p>Administrator</p>
                    <p>ID: ADMIN001</p>
                    <p>Department: IT</p>
                </div>
            </div>

            <div class="system-stats">
                <h4><i class="fas fa-chart-bar"></i> System Overview</h4>
                <div class="stat-item">
                    <span>Total Users:</span>
                    <span class="stat-value">25</span>
                </div>
                <div class="stat-item">
                    <span>Active Samples:</span>
                    <span class="stat-value">156</span>
                </div>
                <div class="stat-item">
                    <span>Storage Capacity:</span>
                    <span class="stat-value">78%</span>
                </div>
                <div class="stat-item">
                    <span>System Status:</span>
                    <span class="stat-value" style="color: #28a745;">Online</span>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="main-content">
            <div class="page-header">
                <h1><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h1>
            </div>

            <div class="content-grid">
                <div class="left-section">
                    <!-- User Management -->
                    <div class="action-card" onclick="window.location.href='/manage-users'">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="card-title">Manage Users</div>
                        </div>
                        <a href="/manage-users" class="btn">
                            <i class="fas fa-user-cog"></i> Manage Users
                        </a>
                    </div>

                    <!-- Sample Management -->
                    <div class="action-card" onclick="window.location.href='/admin-samples'">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="fas fa-vials"></i>
                            </div>
                            <div class="card-title">Sample Management</div>
                        </div>
                        <a href="/admin-samples" class="btn">
                            <i class="fas fa-flask"></i> View Samples
                        </a>
                    </div>

                    <!-- Reports & Analytics -->
                    <div class="action-card" onclick="window.location.href='/admin-reports'">
                        <div class="card-header">
                            <div class="card-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="card-title">Reports & Analytics</div>
                        </div>
                        <a href="/admin-reports" class="btn">
                            <i class="fas fa-file-alt"></i> View Reports
                        </a>
                    </div>
                </div>

                <div class="right-section">
                    <!-- System Activity -->
                    <div class="card">
                        <div class="activity-header">
                            <i class="fas fa-activity"></i>
                            <h3>System Activity</h3>
                        </div>
                        <div class="activity-list">
                            <div class="activity-item">
                                <div class="activity-text">New sample registered by Dr. Smith</div>
                                <div class="activity-time">2 minutes ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-text">User login: john.doe@hospital.com</div>
                                <div class="activity-time">5 minutes ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-text">Sample disposal completed</div>
                                <div class="activity-time">10 minutes ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-text">System backup completed</div>
                                <div class="activity-time">1 hour ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-text">New user registered: jane.smith@lab.com</div>
                                <div class="activity-time">2 hours ago</div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-text">Storage capacity check completed</div>
                                <div class="activity-time">3 hours ago</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        console.log('Admin Dashboard loaded successfully');
        
        // Simple click handlers
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.tagName !== 'A') {
                    const link = this.querySelector('a');
                    if (link) {
                        window.location.href = link.href;
                    }
                }
            });
        });
    </script>
</body>
</html>`

// Write the file
const filePath = path.join(__dirname, "..", "public", "html", "admin-dashboard.html")
fs.writeFileSync(filePath, simpleAdminHTML)

console.log("✅ Direct admin dashboard fix applied!")
console.log("📁 File saved to:", filePath)
console.log("🔄 Please hard refresh your browser (Ctrl+F5)")
console.log("📋 Layout: User Management → Sample Management → Reports (left), System Activity (right)")
