require("dotenv").config();
const express = require("express")
const mysql = require("mysql2")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const session = require("express-session")
const path = require("path")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const fs = require("fs")
const cron = require("node-cron");
const PDFDocument = require("pdfkit");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: "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" // Replace with your OpenRouter key
});

const predictExpiryRoute = require('./routes/predictExpiry');
const cors = require('cors');

const ENABLE_EMAIL_CRON = false // 🔥 set to true to enable auto email, false to disable

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // <-- change this if your db has a password
  database: 'fyp2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Import upload middleware
const upload = require("./middleware/upload")

const app = express()

// Database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
})

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err)
    process.exit(1)
  }
})

// Email configuration using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

transporter.verify((error) => {
  if (error) {
    console.error("Email configuration error:", error)
  }
})

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Serve static files
app.use(express.static("public"))

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/home.html"))
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"))
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/register.html"))
})

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/forgot-password.html"))
})

app.get("/verify-otp", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/verify-otp.html"))
})

app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/reset-password.html"))
})

app.get("/view-samples", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login?error=Please login to access this page")
  }
  res.sendFile(path.join(__dirname, "public/html/view-samples.html"))
})

app.get("/dispose-samples", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login?error=Please login to access this page")
  }
  res.sendFile(path.join(__dirname, "public/html/dispose-sample.html"))
})

app.get("/test-samples", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login?error=Please login to access this page")
  }
  res.sendFile(path.join(__dirname, "public/html/test-samples-simple.html"))
})

app.post("/register", async (req, res) => {
  const { username, email, password, full_name, phone_number, department } = req.body

  try {
    if (!username || !email || !password || !full_name || !phone_number || !department) {
      return res.status(400).send("All fields are required")
    }

    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM staff WHERE email = ? OR username = ?", [email, username])

    if (existingUser.length > 0) {
      return res.status(400).send("Username or email already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db
      .promise()
      .query(
        "INSERT INTO staff (username, email, password, full_name, phone_number, department) VALUES (?, ?, ?, ?, ?, ?)",
        [username, email, hashedPassword, full_name, phone_number, department],
      )

    res.redirect("/login")
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).send("Error in registration")
  }
})

app.post("/login", async (req, res) => {
  const { username, password, userType } = req.body

  try {
    if (!username || !password || !userType) {
      return res.status(400).send("All fields are required")
    }

    const table = userType === "admin" ? "admin" : "staff"
    const idField = userType === "admin" ? "admin_id" : "staff_id"

    const [users] = await db.promise().query(`SELECT * FROM ${table} WHERE username = ?`, [username])

    if (users.length === 0) {
      return res.status(400).send("User not found")
    }

    const user = users[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).send("Invalid credentials")
    }

    req.session.user = {
      id: user[idField],
      username: user.username,
      email: user.email,
      type: userType,
    }

    res.redirect(userType === "admin" ? "/admin-dashboard" : "/staff-dashboard")
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).send("Error in login")
  }
})

app.post("/forgot-password", async (req, res) => {
  const { userType, contactMethod, contact } = req.body

  try {
    if (!userType || !contactMethod || !contact) {
      return res.status(400).send("All fields are required")
    }

    const table = userType === "admin" ? "admin" : "staff"
    const field = contactMethod === "email" ? "email" : "phone_number"

    const [users] = await db.promise().query(`SELECT * FROM ${table} WHERE ${field} = ?`, [contact])

    if (users.length === 0) {
      return res.status(400).send("User not found with this " + contactMethod)
    }

    const user = users[0]

    const otp = crypto.randomInt(100000, 999999).toString()
    const otpExpiry = new Date(Date.now() + 15 * 60000) // 15 minutes

    await db
      .promise()
      .query(`UPDATE ${table} SET reset_otp = ?, otp_expiry = ? WHERE ${field} = ?`, [otp, otpExpiry, contact])

    if (contactMethod === "email") {
      await sendOTPEmail(contact, otp, user.full_name || user.username)
    } else {
      await sendOTPSMS(contact, otp)
    }

    res.redirect(`/verify-otp?email=${encodeURIComponent(contact)}&type=${userType}`)
  } catch (err) {
    console.error("Forgot password error:", err)
    res.status(500).send("Error sending OTP")
  }
})

app.post("/verify-otp", async (req, res) => {
  const { email, otp, userType } = req.body

  try {
    if (!email || !otp || !userType) {
      return res.status(400).send("Email, OTP, and user type are required")
    }

    const table = userType === "admin" ? "admin" : "staff"

    const [users] = await db
      .promise()
      .query(`SELECT * FROM ${table} WHERE email = ? AND reset_otp = ? AND otp_expiry > NOW()`, [email, otp])

    if (users.length === 0) {
      return res.status(400).send("Invalid or expired OTP")
    }

    res.redirect(`/reset-password?email=${encodeURIComponent(email)}&type=${userType}&verified=true`)
  } catch (err) {
    console.error("OTP verification error:", err)
    res.status(500).send("Error verifying OTP")
  }
})

app.post("/reset-password", async (req, res) => {
  const { email, newPassword, userType } = req.body

  try {
    if (!email || !newPassword || !userType) {
      return res.status(400).send("Email, new password, and user type are required")
    }

    if (newPassword.length < 8) {
      return res.status(400).send("Password must be at least 8 characters long")
    }

    const table = userType === "admin" ? "admin" : "staff"

    const [users] = await db.promise().query(`SELECT * FROM ${table} WHERE email = ?`, [email])

    if (users.length === 0) {
      return res.status(400).send("User not found")
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await db
      .promise()
      .query(`UPDATE ${table} SET password = ?, reset_otp = NULL, otp_expiry = NULL WHERE email = ?`, [
        hashedPassword,
        email,
      ])

    res.redirect("/login?message=Password reset successfully")
  } catch (err) {
    console.error("Password reset error:", err)
    res.status(500).send("Error resetting password")
  }
})

app.get("/staff-dashboard", (req, res) => {
  if (!req.session.user || req.session.user.type !== "staff") {
    return res.redirect("/login?error=Please login to access the dashboard")
  }
  res.sendFile(path.join(__dirname, "public/html/staff-dashboard.html"))
})

app.get("/admin-dashboard", (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.redirect("/login?error=Please login to access the dashboard")
  }
  res.sendFile(path.join(__dirname, "public/html/admin-dashboard.html"))
})

app.get("/admin-reports", (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.redirect("/login?error=Admin access required")
  }
  res.sendFile(path.join(__dirname, "public/html/admin-reports.html"))
})

app.get("/profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login?error=Please login to access your profile")
  }
  res.sendFile(path.join(__dirname, "public/html/staff-profile.html"))
})

app.get("/staff-profile", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login?error=Please login to access your profile")
  }
  res.sendFile(path.join(__dirname, "public/html/staff-profile.html"))
})

app.get("/staff-ranking", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login?error=Please login to access staff rankings")
  }
  res.sendFile(path.join(__dirname, "public/html/staff-ranking.html"))
})

app.get("/manage-users", (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.redirect("/login?error=Admin access required")
  }
  res.sendFile(path.join(__dirname, "public/html/manage-users.html"))
})

app.post("/api/profile/image", upload.single("profileImage"), async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    const table = req.session.user.type === "admin" ? "admin" : "staff"
    const idField = req.session.user.type === "admin" ? "admin_id" : "staff_id"
    const imagePath = `/uploads/profiles/${req.file.filename}`

    const [currentUser] = await db
      .promise()
      .query(`SELECT profile_picture FROM ${table} WHERE ${idField} = ?`, [req.session.user.id])

    await db
      .promise()
      .query(`UPDATE ${table} SET profile_picture = ? WHERE ${idField} = ?`, [imagePath, req.session.user.id])

    if (currentUser[0] && currentUser[0].profile_picture) {
      const oldImagePath = path.join(__dirname, "public", currentUser[0].profile_picture)
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
    }

    res.json({
      success: true,
      imageUrl: imagePath,
      message: "Profile picture updated successfully",
    })
  } catch (error) {
    console.error("Image upload error:", error)

    if (req.file) {
      const filePath = path.join(__dirname, "public/uploads/profiles", req.file.filename)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    res.status(500).json({ message: "Error uploading image" })
  }
})

app.get("/api/profile", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized - No session" })
  }

  try {
    const table = req.session.user.type === "admin" ? "admin" : "staff"
    const idField = req.session.user.type === "admin" ? "admin_id" : "staff_id"
    const userId = req.session.user.id

    const [userData] = await db.promise().query(`SELECT * FROM ${table} WHERE ${idField} = ?`, [userId])

    if (userData.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const user = userData[0]

    const [sampleStats] = await db.promise().query(
      `
      SELECT 
        COUNT(*) as total_samples,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_samples,
        SUM(CASE WHEN status = 'disposed' THEN 1 ELSE 0 END) as disposed_samples
      FROM samples 
      WHERE staff_id = ?
    `,
      [userId],
    )

    const stats = sampleStats[0] || { total_samples: 0, active_samples: 0, disposed_samples: 0 }

    const totalSamples = Number.parseInt(stats.total_samples) || 0
    const activeSamples = Number.parseInt(stats.active_samples) || 0
    const disposedSamples = Number.parseInt(stats.disposed_samples) || 0

    const profileData = {
      staff_id: user[idField],
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      department: user.department || "N/A",
      phone_number: user.phone_number || "N/A",
      profile_picture: user.profile_picture || null,
      created_at: user.created_at,
      samples_registered: totalSamples,
      samples_disposed: disposedSamples,
      active_samples: activeSamples,
    }

    res.json(profileData)
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

app.get("/api/staff-rankings", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const [staffData] = await db.promise().query(`
      SELECT 
        s.staff_id,
        s.full_name,
        s.username,
        s.department,
        s.profile_picture,
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
    `)

    const staffWithScores = staffData.map((staff) => {
      const registered = Number.parseInt(staff.samples_registered) || 0
      const disposed = Number.parseInt(staff.samples_disposed) || 0
      const completionRate = Number.parseInt(staff.completion_rate) || 0

      const baseScore = registered * 10
      const completionBonus = disposed * 15
      const efficiencyBonus = completionRate > 80 ? 100 : 0
      const performanceScore = baseScore + completionBonus + efficiencyBonus

      return {
        ...staff,
        performance_score: performanceScore,
        samples_registered: registered,
        samples_disposed: disposed,
        active_samples: Number.parseInt(staff.active_samples) || 0,
        completion_rate: completionRate,
      }
    })

    res.json(staffWithScores)
  } catch (error) {
    console.error("Staff rankings error:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

app.get("/api/admin/users", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const [users] = await db.promise().query(`
      SELECT 
        staff_id,
        username,
        email,
        full_name,
        phone_number,
        department,
        created_at,
        profile_picture
      FROM staff 
      ORDER BY full_name ASC
    `)

    res.json(users)
  } catch (error) {
    console.error("Admin users error:", error)
    res.status(500).json({ message: "Server error: " + error.message })
  }
})

app.get("/api/admin/reports-stats", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const [totalSamplesResult] = await db.promise().query("SELECT COUNT(*) as total FROM samples")
    const totalSamples = totalSamplesResult[0].total

    const [activeSamplesResult] = await db
      .promise()
      .query("SELECT COUNT(*) as total FROM samples WHERE status = 'active'")
    const activeSamples = activeSamplesResult[0].total

    const [disposedSamplesResult] = await db
      .promise()
      .query("SELECT COUNT(*) as total FROM samples WHERE status = 'disposed'")
    const disposedSamples = disposedSamplesResult[0].total

    const [totalStaffResult] = await db.promise().query("SELECT COUNT(*) as total FROM staff")
    const totalStaff = totalStaffResult[0].total

    const responseData = {
      totalSamples,
      activeSamples,
      disposedSamples,
      totalStaff,
    }

    res.json(responseData)
  } catch (error) {
    console.error("Error in reports stats endpoint:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
      totalSamples: 0,
      activeSamples: 0,
      disposedSamples: 0,
      totalStaff: 0,
    })
  }
})

app.get("/api/recent-activity", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const [activities] = await db.promise().query(
      `
      SELECT 
        sample_id,
        status,
        registration_date,
        disposal_date,
        patient_name,
        disposal_reason
      FROM samples 
      WHERE staff_id = ? 
      ORDER BY 
        CASE 
          WHEN disposal_date IS NOT NULL THEN disposal_date 
          ELSE registration_date 
        END DESC 
      LIMIT 10
    `,
      [req.session.user.id],
    )

    const formattedActivities = activities.map((activity) => {
      if (activity.status === "disposed" && activity.disposal_date) {
        return {
          id: activity.sample_id,
          type: "dispose",
          sample_id: activity.sample_id,
          description: `disposed - ${activity.disposal_reason || "No reason specified"}`,
          created_at: activity.disposal_date,
          patient_name: activity.patient_name,
        }
      } else {
        return {
          id: activity.sample_id,
          type: "register",
          sample_id: activity.sample_id,
          description: `registered for patient ${activity.patient_name}`,
          created_at: activity.registration_date,
          patient_name: activity.patient_name,
        }
      }
    })

    res.json(formattedActivities)
  } catch (error) {
    console.error("Recent activity error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/admin/system-overview", async (req, res) => {
  // Remove authentication check for now to test
  try {
    let totalStaff = 0
    let activeSamples = 0
    let systemHealth = "Unknown"

    try {
      const [staffResult] = await db.promise().query("SELECT COUNT(*) as total FROM staff")
      totalStaff = staffResult[0].total
    } catch (error) {
      console.error("Error fetching staff count:", error.message)
    }

    try {
      const [samplesResult] = await db.promise().query("SELECT COUNT(*) as total FROM samples WHERE status != 'disposed' OR status IS NULL")
      activeSamples = samplesResult[0].total
    } catch (error) {
      console.error("Error fetching samples count:", error.message)
    }

    if (totalStaff > 0 && activeSamples >= 0) {
      systemHealth = "Online"
    } else if (totalStaff > 0) {
      systemHealth = "Good"
    } else {
      systemHealth = "Attention Required"
    }

    const responseData = {
      totalStaff,
      activeSamples,
      systemHealth
    }

    console.log("System overview response:", responseData)
    res.json(responseData)
  } catch (error) {
    console.error("Error in system overview endpoint:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
      totalStaff: 0,
      activeSamples: 0,
      systemHealth: "Error"
    })
  }
})

app.get("/admin-samples", (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.redirect("/login?error=Admin access required")
  }
  res.sendFile(path.join(__dirname, "public/html/admin-samples.html"))
})

app.get("/api/admin/sample-types", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const [sampleTypes] = await db.promise().query("SELECT * FROM sample_types ORDER BY type_name")
    res.json(sampleTypes)
  } catch (error) {
    console.error("Error fetching sample types:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/admin/sample-tests/:typeId", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const { typeId } = req.params
    const [tests] = await db
      .promise()
      .query("SELECT * FROM sample_tests WHERE type_id = ? ORDER BY test_name", [typeId])
    res.json(tests)
  } catch (error) {
    console.error("Error fetching sample tests:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/admin/sample-tests", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const { type_id, test_name, description } = req.body

    if (!type_id || !test_name) {
      return res.status(400).json({ message: "Type ID and test name are required" })
    }

    await db
      .promise()
      .query("INSERT INTO sample_tests (type_id, test_name, description) VALUES (?, ?, ?)", [
        type_id,
        test_name,
        description || null,
      ])

    res.json({ message: "Test added successfully" })
  } catch (error) {
    console.error("Error adding sample test:", error)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Test name already exists for this sample type" })
    } else {
      res.status(500).json({ message: "Server error" })
    }
  }
})

app.delete("/api/admin/sample-tests/:testId", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const { testId } = req.params
    await db.promise().query("DELETE FROM sample_tests WHERE test_id = ?", [testId])
    res.json({ message: "Test deleted successfully" })
  } catch (error) {
    console.error("Error deleting sample test:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/admin/sample-storage/:typeId", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const { typeId } = req.params
    const [storage] = await db
      .promise()
      .query("SELECT * FROM sample_storage WHERE type_id = ? ORDER BY storage_name", [typeId])
    res.json(storage)
  } catch (error) {
    console.error("Error fetching sample storage:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/admin/sample-storage", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const { type_id, storage_name, location_details, temperature_range } = req.body

    if (!type_id || !storage_name) {
      return res.status(400).json({ message: "Type ID and storage name are required" })
    }

    await db
      .promise()
      .query(
        "INSERT INTO sample_storage (type_id, storage_name, location_details, temperature_range) VALUES (?, ?, ?, ?)",
        [type_id, storage_name, location_details || null, temperature_range || null],
      )

    res.json({ message: "Storage location added successfully" })
  } catch (error) {
    console.error("Error adding sample storage:", error)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Storage name already exists for this sample type" })
    } else {
      res.status(500).json({ message: "Server error" })
    }
  }
})

app.delete("/api/admin/sample-storage/:storageId", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const { storageId } = req.params
    await db.promise().query("DELETE FROM sample_storage WHERE storage_id = ?", [storageId])
    res.json({ message: "Storage location deleted successfully" })
  } catch (error) {
    console.error("Error deleting sample storage:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/sample-types", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const [sampleTypes] = await db.promise().query("SELECT * FROM sample_types ORDER BY type_name")
    res.json(sampleTypes)
  } catch (error) {
    console.error("Error fetching sample types:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/sample-tests/:typeId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { typeId } = req.params
    const [tests] = await db
      .promise()
      .query("SELECT * FROM sample_tests WHERE type_id = ? ORDER BY test_name", [typeId])
    res.json(tests)
  } catch (error) {
    console.error("Error fetching sample tests:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/sample-storage/:typeId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { typeId } = req.params
    const [storage] = await db
      .promise()
      .query("SELECT * FROM sample_storage WHERE type_id = ? ORDER BY storage_name", [typeId])
    res.json(storage)
  } catch (error) {
    console.error("Error fetching sample storage:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/assign-freezer/:storageId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { storageId } = req.params

    const [storage] = await db.promise().query("SELECT * FROM sample_storage WHERE storage_id = ?", [storageId])

    if (storage.length === 0) {
      return res.status(404).json({ message: "Storage location not found" })
    }

    const storageLocation = storage[0]

    let freezerQuery = "SELECT * FROM freezer"
    const freezerParams = []

    if (storageLocation.temperature_range) {
      const tempRange = storageLocation.temperature_range.toLowerCase()

      if (tempRange.includes("2") && tempRange.includes("8")) {
        freezerQuery += " WHERE freezer_name LIKE '%refrigerator%'"
      } else if (tempRange.includes("-20")) {
        freezerQuery += " WHERE freezer_name LIKE '%standard%'"
      } else if (tempRange.includes("-30") || tempRange.includes("-40")) {
        freezerQuery += " WHERE freezer_name LIKE '%low%'"
      } else if (tempRange.includes("-70") || tempRange.includes("-86")) {
        freezerQuery += " WHERE freezer_name LIKE '%ultra%'"
      } else if (tempRange.includes("-150") || tempRange.includes("-196")) {
        freezerQuery += " WHERE freezer_name LIKE '%cryogenic%'"
      }
    }

    freezerQuery += " ORDER BY freezer_id LIMIT 1"

    const [freezers] = await db.promise().query(freezerQuery, freezerParams)

    if (freezers.length > 0) {
      const assignedFreezer = freezers[0]
      res.json({
        freezer_id: assignedFreezer.freezer_id,
        freezer_name: assignedFreezer.freezer_name,
        temperature_range: assignedFreezer.temperature_range,
        storage_location: storageLocation.storage_name,
      })
    } else {
      const [fallbackFreezers] = await db.promise().query("SELECT * FROM freezer ORDER BY freezer_id LIMIT 1")

      if (fallbackFreezers.length > 0) {
        const fallbackFreezer = fallbackFreezers[0]
        res.json({
          freezer_id: fallbackFreezer.freezer_id,
          freezer_name: fallbackFreezer.freezer_name + " (Auto-assigned)",
          temperature_range: fallbackFreezer.temperature_range,
          storage_location: storageLocation.storage_name,
        })
      } else {
        res.json({
          freezer_id: null,
          freezer_name: "No suitable freezer available",
          temperature_range: "N/A",
          storage_location: storageLocation.storage_name,
        })
      }
    }
  } catch (error) {
    console.error("Error assigning freezer:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/generate-sample-id", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const currentYear = new Date().getFullYear()

    await db.promise().query("INSERT IGNORE INTO sample_sequence (year, sequence_number) VALUES (?, 0)", [currentYear])

    const [sequence] = await db
      .promise()
      .query("SELECT sequence_number FROM sample_sequence WHERE year = ?", [currentYear])

    const nextSequence = sequence[0].sequence_number + 1
    const sampleId = `SMP-${currentYear}-${nextSequence.toString().padStart(4, "0")}`

    res.json({ sample_id: sampleId })
  } catch (error) {
    console.error("Error generating sample ID:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// AI Algorithm for Sample Expiry Prediction
/**function predictSampleExpiry({ sampleType, testType, storageLocation }) {
  const currentDate = new Date()
  let expiryDays = 30 // Default 30 days
  let confidence = 85
  let factors = []
  let reasoning = []

  console.log('🧠 AI Analysis Starting...')

  // AI Analysis: Sample Type Factor
  const sampleTypeName = sampleType.type_name.toLowerCase()
  console.log('🔬 Analyzing sample type:', sampleTypeName)
  
  if (sampleTypeName.includes('blood')) {
    expiryDays = 180 // 6 months for blood
    factors.push('Blood samples: 6 months base stability')
    reasoning.push('Blood samples maintain cellular integrity for extended periods when properly stored')
  } else if (sampleTypeName.includes('tissue')) {
    expiryDays = 730 // 2 years for tissue
    factors.push('Tissue samples: 2 years base stability')
    reasoning.push('Tissue samples have excellent long-term preservation characteristics')
  } else if (sampleTypeName.includes('urine')) {
    expiryDays = 7 // 1 week for urine
    factors.push('Urine samples: 1 week base stability')
    reasoning.push('Urine samples degrade rapidly due to bacterial growth and chemical changes')
  } else if (sampleTypeName.includes('serum') || sampleTypeName.includes('plasma')) {
    expiryDays = 365 // 1 year for serum/plasma
    factors.push('Serum/Plasma: 1 year base stability')
    reasoning.push('Processed blood products have enhanced stability profiles')
  } else if (sampleTypeName.includes('saliva')) {
    expiryDays = 30 // 1 month for saliva
    factors.push('Saliva samples: 1 month base stability')
    reasoning.push('Saliva contains enzymes that can degrade samples over time')
  } else if (sampleTypeName.includes('csf')) {
    expiryDays = 90 // 3 months for CSF
    factors.push('CSF samples: 3 months base stability')
    reasoning.push('Cerebrospinal fluid requires careful preservation due to protein content')
  } else if (sampleTypeName.includes('biopsy')) {
    expiryDays = 1095 // 3 years for biopsy
    factors.push('Biopsy samples: 3 years base stability')
    reasoning.push('Fixed biopsy samples have exceptional long-term stability')
  } else {
    // Default for other sample types
    expiryDays = 90 // 3 months default
    factors.push('Standard sample: 3 months base stability')
    reasoning.push('Standard preservation protocols applied for unknown sample types')
  }

  // AI Analysis: Test Type Factor
  const testTypeName = testType.test_name.toLowerCase()
  console.log('🧪 Analyzing test type:', testTypeName)
  
  if (testTypeName.includes('pcr') || testTypeName.includes('dna') || testTypeName.includes('rna')) {
    expiryDays = Math.floor(expiryDays * 0.7) // Reduce by 30% for genetic tests
    factors.push('Genetic testing: -30% stability (nucleic acid degradation)')
    reasoning.push('DNA/RNA testing requires fresher samples due to nucleic acid degradation over time')
    confidence -= 5
  } else if (testTypeName.includes('protein') || testTypeName.includes('enzyme')) {
    expiryDays = Math.floor(expiryDays * 0.8) // Reduce by 20% for protein tests
    factors.push('Protein analysis: -20% stability (protein denaturation)')
    reasoning.push('Protein-based tests are sensitive to denaturation and require fresher samples')
    confidence -= 3
  } else if (testTypeName.includes('histology') || testTypeName.includes('pathology')) {
    expiryDays = Math.floor(expiryDays * 1.2) // Increase by 20% for histology
    factors.push('Histological analysis: +20% stability (fixed samples)')
    reasoning.push('Histological samples are typically fixed, providing enhanced stability')
    confidence += 5
  } else if (testTypeName.includes('culture') || testTypeName.includes('microbiology')) {
    expiryDays = Math.floor(expiryDays * 0.5) // Reduce by 50% for culture tests
    factors.push('Microbiology testing: -50% stability (viable organism requirement)')
    reasoning.push('Culture tests require viable organisms, significantly reducing storage time')
    confidence -= 10
  } else if (testTypeName.includes('chemistry') || testTypeName.includes('biochemistry')) {
    expiryDays = Math.floor(expiryDays * 0.9) // Reduce by 10% for chemistry
    factors.push('Chemical analysis: -10% stability (chemical degradation)')
    reasoning.push('Chemical tests may be affected by gradual compound degradation')
    confidence -= 2
  }

  // AI Analysis: Storage Temperature Factor
  const tempRange = storageLocation.temperature_range
  console.log('🌡️ Analyzing storage temperature:', tempRange)
  
  if (tempRange) {
    const temp = tempRange.toLowerCase()
    if (temp.includes('-196') || temp.includes('liquid nitrogen')) {
      expiryDays = Math.floor(expiryDays * 3) // Triple for liquid nitrogen
      factors.push('Liquid nitrogen storage: +200% stability (cryogenic preservation)')
      reasoning.push('Cryogenic storage at -196°C provides exceptional long-term preservation')
      confidence += 15
    } else if (temp.includes('-80') || temp.includes('-86')) {
      expiryDays = Math.floor(expiryDays * 2) // Double for ultra-low
      factors.push('Ultra-low temperature: +100% stability (-80°C preservation)')
      reasoning.push('Ultra-low temperature storage significantly extends sample viability')
      confidence += 10
    } else if (temp.includes('-20')) {
      expiryDays = Math.floor(expiryDays * 1.5) // 50% increase for -20°C
      factors.push('Freezer storage: +50% stability (-20°C preservation)')
      reasoning.push('Standard freezer storage provides good preservation for most samples')
      confidence += 5
    } else if (temp.includes('2') && temp.includes('8')) {
      expiryDays = Math.floor(expiryDays * 0.8) // 20% decrease for refrigeration
      factors.push('Refrigerated storage: -20% stability (4°C storage)')
      reasoning.push('Refrigerated storage slows but does not stop degradation processes')
      confidence -= 5
    } else if (temp.includes('room') || temp.includes('ambient')) {
      expiryDays = Math.floor(expiryDays * 0.3) // 70% decrease for room temp
      factors.push('Room temperature: -70% stability (ambient storage)')
      reasoning.push('Room temperature storage significantly accelerates sample degradation')
      confidence -= 20
    }
  }

  // AI Safety Factor: Add buffer for safety
  expiryDays = Math.floor(expiryDays * 0.9) // 10% safety buffer
  factors.push('AI safety buffer: -10% (conservative estimate)')
  reasoning.push('AI applies conservative safety margin to ensure sample quality')

  // Calculate expiry date
  const expiryDate = new Date(currentDate)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)

  // Ensure confidence is within reasonable bounds
  confidence = Math.max(60, Math.min(95, confidence))

  const result = {
    expiry_date: expiryDate.toISOString().split('T')[0],
    confidence: confidence,
    factors: factors,
    reasoning: reasoning,
    days_from_now: expiryDays
  }

  console.log('🎯 AI Prediction Complete:', result)
  return result
} **/

// AI Expiry Prediction using OpenRouter (Mistral)
app.post("/api/predict-expiry", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { sampleId, sampleType, testType, storageLocation } = req.body;

    if (!sampleType || !testType || !storageLocation) {
      return res.status(400).json({
        message: "Missing required fields",
        success: false
      });
    }

    // Fetch full info from database
    const [sampleTypeInfo] = await db.promise().query("SELECT * FROM sample_types WHERE type_id = ?", [sampleType]);
    const [testInfo] = await db.promise().query("SELECT * FROM sample_tests WHERE test_id = ?", [testType]);
    const [storageInfo] = await db.promise().query("SELECT * FROM sample_storage WHERE storage_id = ?", [storageLocation]);

    if (sampleTypeInfo.length === 0 || testInfo.length === 0 || storageInfo.length === 0) {
      return res.status(404).json({
        message: "Sample type, test, or storage data not found",
        success: false
      });
    }

    const typeName = sampleTypeInfo[0].type_name;
    const testName = testInfo[0].test_name;
    const storageCondition = storageInfo[0].temperature_range || storageInfo[0].storage_name;

    const today = new Date().toISOString().split("T")[0];
    const prompt = `
You are a laboratory AI. Predict how many days a sample will remain viable based on:
- Sample Type: ${typeName}
- Test: ${testName}
- Storage Condition: ${storageCondition}
Today is ${today}.

Return JSON:
{
  "expiry_days": number,
  "confidence": "High" | "Medium" | "Low",
  "reasoning": ["short reason 1", "short reason 2"]
}
`;

    const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    let prediction;
    try {
      prediction = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.error("❌ Failed to parse AI response:", completion.choices[0].message.content);
      return res.status(500).json({ success: false, message: "AI response format invalid" });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + prediction.expiry_days);
    const expiryDateStr = expiryDate.toISOString().split("T")[0];

    if (sampleId) {
      await db.promise().query(
        "UPDATE samples SET expiry_date = ? WHERE sample_id = ?",
        [expiryDateStr, sampleId]
      );
    }

    res.json({
      success: true,
      expiry_date: expiryDateStr,
      days_from_now: prediction.expiry_days,
      confidence: prediction.confidence,
      reasoning: prediction.reasoning
    });

  } catch (error) {
    console.error("❌ OpenRouter AI Error:", error);
    res.status(500).json({
      message: "AI prediction failed",
      success: false
    });
  }
});

/** // AI Algorithm for Sample Expiry Prediction
function predictSampleExpiry({ sampleType, testType, storageLocation }) {
  const currentDate = new Date()
  let expiryDays = 30 // Default 30 days
  let confidence = 85
  let factors = []
  let reasoning = []

  console.log('🧠 AI Analysis Starting for:', {
    sample: sampleType.type_name,
    test: testType.test_name,
    storage: storageLocation.storage_name
  })

  // AI Analysis: Sample Type Factor
  const sampleTypeName = sampleType.type_name.toLowerCase()
  console.log('🔬 Analyzing sample type:', sampleTypeName)
  
  if (sampleTypeName.includes('blood')) {
    expiryDays = 180 // 6 months for blood
    factors.push('Blood samples: 6 months base stability')
    reasoning.push('Blood samples maintain cellular integrity for extended periods when properly stored')
  } else if (sampleTypeName.includes('tissue')) {
    expiryDays = 730 // 2 years for tissue
    factors.push('Tissue samples: 2 years base stability')
    reasoning.push('Tissue samples have excellent long-term preservation characteristics')
  } else if (sampleTypeName.includes('urine')) {
    expiryDays = 7 // 1 week for urine
    factors.push('Urine samples: 1 week base stability')
    reasoning.push('Urine samples degrade rapidly due to bacterial growth and chemical changes')
  } else if (sampleTypeName.includes('serum') || sampleTypeName.includes('plasma')) {
    expiryDays = 365 // 1 year for serum/plasma
    factors.push('Serum/Plasma: 1 year base stability')
    reasoning.push('Processed blood products have enhanced stability profiles')
  } else if (sampleTypeName.includes('saliva')) {
    expiryDays = 30 // 1 month for saliva
    factors.push('Saliva samples: 1 month base stability')
    reasoning.push('Saliva contains enzymes that can degrade samples over time')
  } else if (sampleTypeName.includes('csf')) {
    expiryDays = 90 // 3 months for CSF
    factors.push('CSF samples: 3 months base stability')
    reasoning.push('Cerebrospinal fluid requires careful preservation due to protein content')
  } else if (sampleTypeName.includes('biopsy')) {
    expiryDays = 1095 // 3 years for biopsy
    factors.push('Biopsy samples: 3 years base stability')
    reasoning.push('Fixed biopsy samples have exceptional long-term stability')
  } else {
    // Default for other sample types
    expiryDays = 90 // 3 months default
    factors.push('Standard sample: 3 months base stability')
    reasoning.push('Standard preservation protocols applied')
  }

  // AI Analysis: Test Type Factor
  const testTypeName = testType.test_name.toLowerCase()
  console.log('🧪 Analyzing test type:', testTypeName)
  
  if (testTypeName.includes('pcr') || testTypeName.includes('dna') || testTypeName.includes('rna')) {
    expiryDays = Math.floor(expiryDays * 0.7) // Reduce by 30% for genetic tests
    factors.push('Genetic testing: -30% stability (nucleic acid degradation)')
    reasoning.push('DNA/RNA testing requires fresher samples due to nucleic acid degradation')
    confidence -= 5
  } else if (testTypeName.includes('protein') || testTypeName.includes('enzyme')) {
    expiryDays = Math.floor(expiryDays * 0.8) // Reduce by 20% for protein tests
    factors.push('Protein analysis: -20% stability (protein denaturation)')
    reasoning.push('Protein-based tests are sensitive to denaturation')
    confidence -= 3
  } else if (testTypeName.includes('histology') || testTypeName.includes('pathology')) {
    expiryDays = Math.floor(expiryDays * 1.2) // Increase by 20% for histology
    factors.push('Histological analysis: +20% stability (fixed samples)')
    reasoning.push('Histological samples are typically fixed, providing enhanced stability')
    confidence += 5
  } else if (testTypeName.includes('culture') || testTypeName.includes('microbiology')) {
    expiryDays = Math.floor(expiryDays * 0.5) // Reduce by 50% for culture tests
    factors.push('Microbiology testing: -50% stability (viable organism requirement)')
    reasoning.push('Culture tests require viable organisms, significantly reducing storage time')
    confidence -= 10
  } else if (testTypeName.includes('chemistry') || testTypeName.includes('biochemistry')) {
    expiryDays = Math.floor(expiryDays * 0.9) // Reduce by 10% for chemistry
    factors.push('Chemical analysis: -10% stability (chemical degradation)')
    reasoning.push('Chemical tests may be affected by gradual compound degradation')
    confidence -= 2
  }

  // AI Analysis: Storage Temperature Factor
  const tempRange = storageLocation.temperature_range || ''
  console.log('🌡️ Analyzing storage temperature:', tempRange)
  
  if (tempRange) {
    const temp = tempRange.toLowerCase()
    if (temp.includes('-196') || temp.includes('liquid nitrogen')) {
      expiryDays = Math.floor(expiryDays * 3) // Triple for liquid nitrogen
      factors.push('Liquid nitrogen storage: +200% stability (cryogenic preservation)')
      reasoning.push('Cryogenic storage at -196°C provides exceptional long-term preservation')
      confidence += 15
    } else if (temp.includes('-80') || temp.includes('-86')) {
      expiryDays = Math.floor(expiryDays * 2) // Double for ultra-low
      factors.push('Ultra-low temperature: +100% stability (-80°C preservation)')
      reasoning.push('Ultra-low temperature storage significantly extends sample viability')
      confidence += 10
    } else if (temp.includes('-20')) {
      expiryDays = Math.floor(expiryDays * 1.5) // 50% increase for -20°C
      factors.push('Freezer storage: +50% stability (-20°C preservation)')
      reasoning.push('Standard freezer storage provides good preservation for most samples')
      confidence += 5
    } else if (temp.includes('2') && temp.includes('8')) {
      expiryDays = Math.floor(expiryDays * 0.8) // 20% decrease for refrigeration
      factors.push('Refrigerated storage: -20% stability (4°C storage)')
      reasoning.push('Refrigerated storage slows but does not stop degradation processes')
      confidence -= 5
    } else if (temp.includes('room') || temp.includes('ambient')) {
      expiryDays = Math.floor(expiryDays * 0.3) // 70% decrease for room temp
      factors.push('Room temperature: -70% stability (ambient storage)')
      reasoning.push('Room temperature storage significantly accelerates sample degradation')
      confidence -= 20
    }
  }

  // AI Safety Factor: Add buffer for safety
  expiryDays = Math.floor(expiryDays * 0.9) // 10% safety buffer
  factors.push('AI safety buffer: -10% (conservative estimate)')
  reasoning.push('AI applies conservative safety margin to ensure sample quality')

  // Ensure minimum 1 day expiry
  expiryDays = Math.max(1, expiryDays)

  // Calculate expiry date
  const expiryDate = new Date(currentDate)
  expiryDate.setDate(expiryDate.getDate() + expiryDays)

  // Ensure confidence is within reasonable bounds
  confidence = Math.max(60, Math.min(95, confidence))

  const result = {
    expiry_date: expiryDate.toISOString().split('T')[0],
    confidence: confidence,
    factors: factors,
    reasoning: reasoning,
    days_from_now: expiryDays
  }

  console.log('🎯 AI Prediction Complete:', result)
  return result
}
  **/

app.post("/api/register-sample", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "staff") {
    return res.status(401).json({ message: "Staff access required" })
  }

  try {
    const { sampleType, testType, storageLocation, patientName, patientId, collectionDate, notes } = req.body

    if (!sampleType || !testType || !storageLocation || !patientName || !patientId || !collectionDate) {
      return res.status(400).json({ message: "All required fields must be provided" })
    }

    const currentYear = new Date().getFullYear()

    await db.promise().beginTransaction()

    try {
      await db
        .promise()
        .query("UPDATE sample_sequence SET sequence_number = sequence_number + 1 WHERE year = ?", [currentYear])

      const [sequence] = await db
        .promise()
        .query("SELECT sequence_number FROM sample_sequence WHERE year = ?", [currentYear])

      const sampleId = `SMP-${currentYear}-${sequence[0].sequence_number.toString().padStart(4, "0")}`

      const freezerResponse = await fetch(
        `${req.protocol}://${req.get("host")}/api/assign-freezer/${storageLocation}`,
        {
          headers: { Cookie: req.headers.cookie },
        },
      )
      const freezerData = await freezerResponse.json()

      await db.promise().query(
        `INSERT INTO samples (
            sample_id, sample_type_id, test_id, storage_id, freezer_id, staff_id,
            patient_name, patient_id, collection_date, expiry_date, notes, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          sampleId,
          sampleType,
          testType,
          storageLocation,
          freezerData.freezer_id,
          req.session.user.id,
          patientName,
          patientId,
          collectionDate,
          req.body.expiryDate || null,
          notes || null,
        ],
      )

      await db.promise().commit()

      res.json({
        success: true,
        sample_id: sampleId,
        message: "Sample registered successfully",
        freezer_assigned: freezerData.freezer_name,
      })
    } catch (error) {
      await db.promise().rollback()
      throw error
    }
  } catch (error) {
    console.error("Error registering sample:", error)
    res.status(500).json({ message: "Error registering sample: " + error.message })
  }
})

app.get("/register-sample", (req, res) => {
  if (!req.session.user || req.session.user.type !== "staff") {
    return res.redirect("/login?error=Staff access required")
  }
  res.sendFile(path.join(__dirname, "public/html/register-sample.html"))
})

app.get("/api/samples", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    let query = `
      SELECT 
        s.*,
        st.type_name as sample_type_name,
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
    `

    const params = []

    if (req.session.user.type === "staff") {
      query += " WHERE s.staff_id = ?"
      params.push(req.session.user.id)
    }

    query += " ORDER BY s.registration_date DESC"

    const [samples] = await db.promise().query(query, params)

    res.json(samples)
  } catch (error) {
    console.error("Error fetching samples:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/samples/:sampleId", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { sampleId } = req.params

    let query = `
      SELECT 
        s.*,
        st.type_name as sample_type_name,
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
      WHERE s.sample_id = ?
    `

    const params = [sampleId]

    if (req.session.user.type === "staff") {
      query += " AND s.staff_id = ?"
      params.push(req.session.user.id)
    }

    const [samples] = await db.promise().query(query, params)

    if (samples.length === 0) {
      return res.status(404).json({ message: "Sample not found" })
    }

    res.json(samples[0])
  } catch (error) {
    console.error("Error fetching sample:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/api/samples/:sampleId/dispose", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const { sampleId } = req.params
    const { reason, notes } = req.body

    let checkQuery = "SELECT * FROM samples WHERE sample_id = ?"
    const checkParams = [sampleId]

    if (req.session.user.type === "staff") {
      checkQuery += " AND staff_id = ?"
      checkParams.push(req.session.user.id)
    }

    const [existingSamples] = await db.promise().query(checkQuery, checkParams)

    if (existingSamples.length === 0) {
      return res.status(404).json({ message: "Sample not found or access denied" })
    }

    const sample = existingSamples[0]

    if (sample.status !== "active") {
      return res.status(400).json({ message: "Sample is not active and cannot be disposed" })
    }

    await db.promise().query(
      `UPDATE samples SET 
         status = 'disposed', 
         updated_at = NOW(),
         disposal_reason = ?,
         disposal_notes = ?,
         disposed_by = ?,
         disposal_date = NOW()
       WHERE sample_id = ?`,
      [reason || "Not specified", notes || null, req.session.user.id, sampleId],
    )

    res.json({
      message: "Sample disposed successfully",
      sample_id: sampleId,
      disposed_by: req.session.user.username,
      disposal_reason: reason || "Not specified",
    })
  } catch (error) {
    console.error("Error disposing sample:", error)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/api/admin/staff-members", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    const [staff] = await db
      .promise()
      .query("SELECT staff_id, full_name, username, email, department FROM staff ORDER BY full_name")
    res.json(staff)
  } catch (error) {
    console.error("Error fetching staff members:", error)
    res.status(500).json({ message: "Server error" })
  }
})

async function sendOTPEmail(email, otp, name = "User") {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - Sample Storage System",
      text: `Your OTP for password reset is: ${otp} (valid for 15 minutes)`,
      html: `
                <h2>Password Reset Request</h2>
                <p>Hello ${name},</p>
                <p>You have requested to reset your password. Please use the following OTP to verify your identity:</p>
                <h3 style="color: #4361ee; font-size: 24px; letter-spacing: 2px;">${otp}</h3>
                <p>This OTP will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Sample Storage System Team</p>
            `,
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

async function sendExpiryNotificationEmail(email, sampleInfo, staffName = "Staff") {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `⚠️ Sample ${sampleInfo.sample_id} Expiry Notification`,
      html: `
        <h2>Sample Expiry Alert</h2>
        <p>Hello ${staffName},</p>
        <p>This is a reminder that the following sample is approaching its expiry date:</p>
        <ul>
          <li><strong>Sample ID:</strong> ${sampleInfo.sample_id}</li>
          <li><strong>Patient Name:</strong> ${sampleInfo.patient_name}</li>
          <li><strong>Test Type:</strong> ${sampleInfo.test_name}</li>
          <li><strong>Storage Location:</strong> ${sampleInfo.storage_name}</li>
          <li><strong>Expiry Date:</strong> ${sampleInfo.expiry_date}</li>
        </ul>
        <p>Please take appropriate action for disposal or further processing.</p>
        <br>
        <p>Best regards,<br>Sample Storage System Team</p>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Expiry email sent to ${email} for sample ${sampleInfo.sample_id}`)
  } catch (error) {
    console.error("Error sending expiry email:", error)
  }
}

async function sendExpiryNotifications() {
  try {
    console.log("🔎 Checking samples for expiry notifications...");

    const [expiredSamples] = await db
      .promise()
      .query(
        `
        SELECT s.*, st.full_name AS staff_name, st.email AS staff_email
        FROM samples s
        JOIN staff st ON s.staff_id = st.staff_id
        WHERE s.expiry_date IS NOT NULL AND s.expiry_date <= CURDATE()
      `
      );

    if (expiredSamples.length === 0) {
      console.log("✅ No expired samples found.");
      return;
    }

    for (const sample of expiredSamples) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: sample.staff_email,
        subject: `Sample Disposal Notification: ${sample.sample_id}`,
        html: `
          <h3>Sample Disposal Alert</h3>
          <p>Hello ${sample.staff_name},</p>
          <p>This is an automated notification that the following sample has expired and is due for disposal:</p>
          <ul>
            <li><strong>Sample ID:</strong> ${sample.sample_id}</li>
            <li><strong>Patient Name:</strong> ${sample.patient_name}</li>
            <li><strong>Expiry Date:</strong> ${sample.expiry_date}</li>
          </ul>
          <p>Please proceed with the disposal process according to your lab protocols.</p>
          <br>
          <p>Best regards,<br>Sample Storage System</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`📨 Sent expiry notification email to ${sample.staff_email} for sample ${sample.sample_id}`);
    }
  } catch (error) {
    console.error("❌ Error in sendExpiryNotifications:", error);
  }
}

// 🕒 Schedule to run every minute
if (ENABLE_EMAIL_CRON) {
cron.schedule("* * * * *", () => {
  sendExpiryNotifications();
});
}

async function sendOTPSMS(phoneNumber, otp) {
  console.log(`SMS OTP for ${phoneNumber}: ${otp}`)
}


app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).send("Error during logout")
    }
    res.redirect("/login?message=You have been logged out")
  })
})


app.get("/api/admin/system-activity", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ message: "Admin access required" })
  }

  try {
    // Get recent staff registrations
    const [recentStaff] = await db.promise().query(`
      SELECT full_name, created_at, 'staff_registration' as activity_type
      FROM staff 
      ORDER BY created_at DESC 
      LIMIT 3
    `)

    // Get recent sample registrations
    const [recentSamples] = await db.promise().query(`
      SELECT s.sample_id, s.registration_date, s.patient_name, st.full_name as staff_name, 'sample_registration' as activity_type
      FROM samples s
      LEFT JOIN staff st ON s.staff_id = st.staff_id
      ORDER BY s.registration_date DESC 
      LIMIT 3
    `)

    // Get recent sample disposals
    const [recentDisposals] = await db.promise().query(`
      SELECT s.sample_id, s.disposal_date, s.patient_name, st.full_name as staff_name, 'sample_disposal' as activity_type
      FROM samples s
      LEFT JOIN staff st ON s.staff_id = st.staff_id
      WHERE s.status = 'disposed' AND s.disposal_date IS NOT NULL
      ORDER BY s.disposal_date DESC 
      LIMIT 3
    `)

    // Combine all activities
    const activities = []

    // Add staff registrations
    recentStaff.forEach(staff => {
      activities.push({
        type: 'staff_registration',
        description: `New staff member ${staff.full_name} registered`,
        timestamp: staff.created_at,
        icon: 'fas fa-user-plus'
      })
    })

    // Add sample registrations
    recentSamples.forEach(sample => {
      activities.push({
        type: 'sample_registration',
        description: `Sample ${sample.sample_id} registered by ${sample.staff_name || 'Unknown'}`,
        timestamp: sample.registration_date,
        icon: 'fas fa-vial'
      })
    })

    // Add sample disposals
    recentDisposals.forEach(disposal => {
      activities.push({
        type: 'sample_disposal',
        description: `Sample ${disposal.sample_id} disposed by ${disposal.staff_name || 'Unknown'}`,
        timestamp: disposal.disposal_date,
        icon: 'fas fa-trash'
      })
    })

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Return top 5 activities
    res.json(activities.slice(0, 5))

  } catch (error) {
    console.error("Error fetching system activity:", error)
    res.status(500).json({ 
      message: "Server error",
      activities: []
    })
  }
})

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err)
      return res.status(500).send("Error during logout")
    }
    res.redirect("/login?message=You have been logged out")
  })
})


app.get('/api/admin/recent-activity', async (req, res) => {
  if (!req.session.user || req.session.user.type !== 'admin') {
    return res.status(401).json({ message: 'Admin access required' });
  }

  try {
    const [recentSamples] = await db.promise().query(`
      SELECT 
        s.sample_id,
        s.patient_name,
        s.registration_date,
        st.full_name as staff_name
      FROM samples s
      LEFT JOIN staff st ON s.staff_id = st.staff_id
      ORDER BY s.registration_date DESC
      LIMIT 10
    `);

    const activities = recentSamples.map(sample => ({
      type: 'registration',
      description: `Sample ${sample.sample_id} registered for ${sample.patient_name}`,
      staff: sample.staff_name || 'Unknown',
      timestamp: sample.registration_date
    }));

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




// Working Export Routes (No external dependencies)
app.get('/api/admin/export/samples/:format', async (req, res) => {
  if (!req.session.user || req.session.user.type !== 'admin') {
    return res.status(401).json({ message: 'Admin access required' });
  }

  try {
    const { format } = req.params;
    
    // Fetch samples data
    const [samples] = await db.promise().query(`
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
    `);

    if (format === 'csv') {
      // Create CSV manually
      const headers = [
        'Sample ID', 'Patient Name', 'Patient ID', 'Sample Type', 
        'Test Name', 'Storage Location', 'Freezer', 'Staff Name',
        'Collection Date', 'Registration Date', 'Status', 'Disposal Date', 'Disposal Reason'
      ];
      
      let csv = headers.join(',') + '\n';
      
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
        ].map(field => `"${String(field).replace(/"/g, '""')}"`);
        
        csv += row.join(',') + '\n';
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
    const [staffData] = await db.promise().query(`
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
    `);

    if (format === 'csv') {
      // Create CSV manually
      const headers = [
        'Staff ID', 'Full Name', 'Username', 'Email', 'Department', 
        'Phone Number', 'Samples Registered', 'Samples Disposed', 
        'Active Samples', 'Completion Rate (%)', 'Created Date'
      ];
      
      let csv = headers.join(',') + '\n';
      
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
        ].map(field => `"${String(field).replace(/"/g, '""')}"`);
        
        csv += row.join(',') + '\n';
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="staff_report.csv"');
      res.send(csv);
      
    } else if (format === 'pdf') {
      // Create HTML that can be printed as PDF
      let html = `
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
            <p class="date">Generated on: ${new Date().toLocaleDateString()}</p>
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
      `;
      
      staffData.forEach(staff => {
        html += `
          <tr>
            <td>${staff.full_name || 'N/A'}</td>
            <td>${staff.department || 'N/A'}</td>
            <td>${staff.email || 'N/A'}</td>
            <td>${staff.samples_registered || '0'}</td>
            <td>${staff.samples_disposed || '0'}</td>
            <td>${staff.completion_rate || '0'}%</td>
          </tr>
        `;
      });
      
      html += `
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 500);
            }
          </script>
        </body>
        </html>
      `;
      
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
        `Total Samples,${analyticsData.totalSamples}`,
        `Active Samples,${analyticsData.activeSamples}`,
        `Disposed Samples,${analyticsData.disposedSamples}`,
        `Total Staff,${analyticsData.totalStaff}`,
        `Generated At,${analyticsData.generatedAt}`
      ].join('\n');
      
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

cron.schedule("0 6 * * *", async () => {
  console.log("🕒 Checking for expiring samples...")

  try {
    const [samples] = await db.promise().query(`
      SELECT s.sample_id, s.expiry_date, s.patient_name, s.test_id, s.storage_id, st.email, st.full_name,
             tst.test_name, stor.storage_name
      FROM samples s
      JOIN staff st ON s.staff_id = st.staff_id
      JOIN tests tst ON s.test_id = tst.test_id
      JOIN storage stor ON s.storage_id = stor.storage_id
      WHERE s.status = 'active' AND s.expiry_date IS NOT NULL
    `)

    const today = new Date()

    for (const sample of samples) {
      const expiryDate = new Date(sample.expiry_date)
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

      // Send notification if expiry is within 7 days (adjust if you want)
      if (diffDays <= 7 && diffDays >= 0) {
        await sendExpiryNotificationEmail(sample.email, sample, sample.full_name)
      }
    }
  } catch (error) {
    console.error("❌ Error checking expiring samples:", error)
  }
})

app.get("/api/admin/generate-report/summary-pdf", (req, res) => {
  try {
    // Fetch all necessary data in one big nested query
    const summaryQuery = `
      SELECT 
        (SELECT COUNT(*) FROM samples) AS totalSamples,
        (SELECT COUNT(*) FROM samples WHERE status = 'active') AS activeSamples,
        (SELECT COUNT(*) FROM samples WHERE status = 'disposed') AS disposedSamples,
        (SELECT COUNT(*) FROM samples WHERE status = 'expired') AS expiredSamples,
        (SELECT COUNT(*) FROM staff) AS totalStaff
    `;
    
    db.query(summaryQuery, (err, summaryResults) => {
      if (err) {
        console.error("Error fetching summary:", err);
        return res.status(500).json({ error: "Failed to generate summary" });
      }

      const summary = summaryResults[0];

      // Get breakdown by sample type name
      const typeQuery = `
        SELECT st.type_name, COUNT(s.sample_id) AS count
        FROM samples s
        JOIN sample_types st ON s.sample_type_id = st.type_id
        GROUP BY st.type_name
      `;

      db.query(typeQuery, (err, typeResults) => {
        if (err) {
          console.error("Error fetching type breakdown:", err);
          return res.status(500).json({ error: "Failed to generate breakdown" });
        }

        // Get top staff registrations
        const staffQuery = `
          SELECT st.full_name, COUNT(s.sample_id) AS count
          FROM samples s
          JOIN staff st ON s.staff_id = st.staff_id
          GROUP BY s.staff_id
          ORDER BY count DESC
          LIMIT 5
        `;

        db.query(staffQuery, (err, staffResults) => {
          if (err) {
            console.error("Error fetching staff breakdown:", err);
            return res.status(500).json({ error: "Failed to generate staff breakdown" });
          }

          // Get recent disposed samples
          const disposedQuery = `
            SELECT sample_id, patient_name, disposal_date
            FROM samples
            WHERE status = 'disposed'
            ORDER BY disposal_date DESC
            LIMIT 5
          `;

          db.query(disposedQuery, (err, disposedResults) => {
            if (err) {
              console.error("Error fetching disposed samples:", err);
              return res.status(500).json({ error: "Failed to generate disposed samples list" });
            }

            // Get samples close to expiry
            const expiryQuery = `
              SELECT sample_id, patient_name, expiry_date
              FROM samples
              WHERE expiry_date IS NOT NULL
              AND expiry_date <= CURDATE() + INTERVAL 7 DAY
              AND status = 'active'
            `;

            db.query(expiryQuery, (err, expiryResults) => {
              if (err) {
                console.error("Error fetching expiry samples:", err);
                return res.status(500).json({ error: "Failed to generate expiry samples list" });
              }

              // ✅ All data ready, generate PDF
              doc = new PDFDocument({ margin: 50 });

              res.setHeader("Content-Type", "application/pdf");
              res.setHeader("Content-Disposition", "attachment; filename=summary_report.pdf");

              doc.pipe(res);

              // Report title
              doc.fontSize(20).text("Sample Storage System Summary Report", { align: "center" });
              doc.moveDown();

              // System summary
              doc.fontSize(14).text(`Total Samples: ${summary.totalSamples}`);
              doc.text(`Active Samples: ${summary.activeSamples}`);
              doc.text(`Disposed Samples: ${summary.disposedSamples}`);
              doc.text(`Expired Samples: ${summary.expiredSamples}`);
              doc.text(`Total Staff: ${summary.totalStaff}`);
              doc.moveDown();

              // Breakdown by type
              doc.fontSize(16).text("Breakdown by Sample Type");
              typeResults.forEach((type) => {
                doc.fontSize(12).text(`- ${type.type_name}: ${type.count} samples`);
              });
              doc.moveDown();

              // Top staff
              doc.fontSize(16).text("Top Staff Registrations");
              staffResults.forEach((staff) => {
                doc.fontSize(12).text(`- ${staff.full_name}: ${staff.count} samples`);
              });
              doc.moveDown();

              // Recent disposed samples
              doc.fontSize(16).text("Recent Disposed Samples");
              disposedResults.forEach((sample) => {
                doc.fontSize(12).text(`- ${sample.sample_id}, Patient: ${sample.patient_name}, Date: ${sample.disposal_date ? new Date(sample.disposal_date).toLocaleDateString() : 'N/A'}`);
              });
              doc.moveDown();

              // Samples close to expiry
              doc.fontSize(16).text("Samples Close to Expiry (Next 7 Days)");
              if (expiryResults.length === 0) {
                doc.fontSize(12).text("- None");
              } else {
                expiryResults.forEach((sample) => {
                  doc.fontSize(12).text(`- ${sample.sample_id}, Patient: ${sample.patient_name}, Expiry: ${sample.expiry_date ? new Date(sample.expiry_date).toLocaleDateString() : 'N/A'}`);
                });
              }

              // Finish
              doc.end();
            }); // expiry query
          }); // disposed query
        }); // staff query
      }); // type query
    }); // summary query
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// New staff performance PDF

// Staff performance PDF route
app.get("/api/admin/generate-report/staff-performance-pdf", async (req, res) => {
  try {
    // Query staff performance summary
    const [staffRows] = await db.promise().query(`
      SELECT 
        s.staff_id,
        s.full_name,
        COALESCE(total.total_samples, 0) AS total,
        COALESCE(active.active_samples, 0) AS active,
        COALESCE(disposed.disposed_samples, 0) AS disposed
      FROM staff s
      LEFT JOIN (
        SELECT staff_id, COUNT(*) AS total_samples
        FROM samples
        GROUP BY staff_id
      ) AS total ON s.staff_id = total.staff_id
      LEFT JOIN (
        SELECT staff_id, COUNT(*) AS active_samples
        FROM samples
        WHERE status = 'active'
        GROUP BY staff_id
      ) AS active ON s.staff_id = active.staff_id
      LEFT JOIN (
        SELECT staff_id, COUNT(*) AS disposed_samples
        FROM samples
        WHERE status = 'disposed'
        GROUP BY staff_id
      ) AS disposed ON s.staff_id = disposed.staff_id
      ORDER BY total DESC
    `);

    // Additional overall stats
    const [sampleSummaryRows] = await db.promise().query(`
      SELECT
        COUNT(*) AS totalSamples,
        SUM(status = 'active') AS activeSamples,
        SUM(status = 'disposed') AS disposedSamples,
        SUM(status = 'expired') AS expiredSamples
      FROM samples
    `);

    const summary = sampleSummaryRows[0];

    // Create PDF
    doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=staff_performance_report.pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Staff Performance Report", { align: "center" });
    doc.moveDown();

    // Overall summary
    doc.fontSize(14).text(`Total Staff: ${staffRows.length}`);
    doc.text(`Total Samples Registered: ${summary.totalSamples || 0}`);
    doc.text(`Active Samples: ${summary.activeSamples || 0}`);
    doc.text(`Disposed Samples: ${summary.disposedSamples || 0}`);
    doc.text(`Expired Samples: ${summary.expiredSamples || 0}`);
    doc.moveDown(2);

    // Table headers
    doc.fontSize(14).text("Name", 50, doc.y, { continued: true });
    doc.text("Total", 250, doc.y, { continued: true });
    doc.text("Active", 320, doc.y, { continued: true });
    doc.text("Disposed", 400, doc.y);
    doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke();
    doc.moveDown();

    // Table rows
    staffRows.forEach((staff) => {
      doc.fontSize(12).text(staff.full_name.trim(), 50, doc.y, { continued: true });
      doc.text(`${staff.total}`, 250, doc.y, { continued: true });
      doc.text(`${staff.active}`, 320, doc.y, { continued: true });
      doc.text(`${staff.disposed}`, 400, doc.y);

      // Draw line separator
      doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).strokeColor("#dddddd").stroke();
      doc.moveDown();
    });

    // Finish PDF
    doc.end();

  } catch (error) {
    console.error("Error generating staff performance PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.get('/api/admin/generate-report/:type', async (req, res) => {
  const reportType = req.params.type;

  if (reportType === 'samples-summary') {
    // Generate summary report logic
    try {
      // Example dummy code to simulate successful generation
      res.json({ success: true, message: 'Summary report generated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate summary report' });
    }
  } else {
    res.status(400).json({ error: 'Invalid report type' });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).send("Internal server error")
})

app.use((req, res) => {
  res.status(404).send("Page not found")
})

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, (err) => {
  if (err) {
    console.error("Failed to start server:", err)
    process.exit(1)
  }
  console.log(`Server running on port ${PORT}`)
})

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please try a different port or stop the other process.`)
  } else {
    console.error("Server error:", err)
  }
  process.exit(1)
})

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
    db.end()
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
    db.end()
  })
})
