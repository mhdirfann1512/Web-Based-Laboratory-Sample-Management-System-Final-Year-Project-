const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing syntax error in app.js...")

try {
  // Read the current app.js file
  const appPath = path.join(__dirname, "..", "app.js")

  if (!fs.existsSync(appPath)) {
    console.log("❌ app.js file not found")
    // Exit the script if app.js is not found
    process.exit(1)
  }

  // Read the file content
  const content = fs.readFileSync(appPath, "utf8")

  // Check for common syntax issues around database connection
  console.log("🔍 Checking for syntax errors...")

  // Look for the problematic area around line 106
  const lines = content.split("\n")

  // Find and fix common issues
  let fixed = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Check for orphaned closing braces
    if (line.trim() === "}" && lineNum > 100 && lineNum < 120) {
      console.log(`🔍 Found potential issue at line ${lineNum}: "${line.trim()}"`)

      // Check if previous line needs completion
      const prevLine = lines[i - 1]
      if (
        prevLine &&
        !prevLine.trim().endsWith(";") &&
        !prevLine.trim().endsWith("{") &&
        !prevLine.trim().endsWith("}")
      ) {
        console.log(`🔧 Adding missing semicolon to line ${lineNum - 1}`)
        lines[i - 1] = prevLine + ";"
        fixed = true
      }
    }

    // Check for missing semicolons after console.log
    if (line.includes("console.log") && !line.trim().endsWith(";") && !line.trim().endsWith("{")) {
      console.log(`🔧 Adding missing semicolon to line ${lineNum}`)
      lines[i] = line + ";"
      fixed = true
    }
  }

  if (fixed) {
    // Write the fixed content back
    const fixedContent = lines.join("\n")
    fs.writeFileSync(appPath, fixedContent, "utf8")
    console.log("✅ Syntax errors fixed in app.js")
  } else {
    console.log("🔍 No obvious syntax errors found. Creating a clean app.js...")

    // Create a clean version of app.js
    const cleanAppJs = `require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");

// Import upload middleware
const upload = require("./middleware/upload");

const app = express();

// Database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fyp2",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to database");
});

// Email configuration using environment variables
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready");
  }
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Serve static files
app.use(express.static("public"));

// Basic routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/home.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

app.get("/staff-dashboard", (req, res) => {
  if (!req.session.user || req.session.user.type !== "staff") {
    return res.redirect("/login?error=Please login to access the dashboard");
  }
  res.sendFile(path.join(__dirname, "public/html/staff-dashboard.html"));
});

app.get("/admin-dashboard", (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.redirect("/login?error=Please login to access the dashboard");
  }
  res.sendFile(path.join(__dirname, "public/html/admin-dashboard.html"));
});

// Start server
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
  console.log(\`Server running on port \${PORT}\`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(\`Port \${PORT} is already in use\`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});`

    // Backup the current file
    fs.writeFileSync(appPath + ".backup", content, "utf8")
    console.log("📁 Created backup: app.js.backup")

    // Write the clean version
    fs.writeFileSync(appPath, cleanAppJs, "utf8")
    console.log("✅ Created clean app.js file")
  }

  console.log('🎯 Try running "npm start" again')
} catch (error) {
  console.error("❌ Error fixing app.js:", error.message)
}

fs.writeFileSync(path.join(__dirname, "fix-app-syntax-error.js"), cleanAppJs)
console.log("✅ Created fix-app-syntax-error.js script")
