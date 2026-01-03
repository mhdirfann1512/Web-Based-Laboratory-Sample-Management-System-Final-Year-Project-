// Add this to your app.js file (temporary debug route)

// Import necessary modules
const express = require("express")
const app = express()
const db = require("./db") // Assuming db.js exports your database connection

// Debug route to check password_resets table
app.get("/debug/password-resets", async (req, res) => {
  try {
    const [resets] = await db.promise().query("SELECT * FROM password_resets ORDER BY created_at DESC LIMIT 10")
    res.json(resets)
  } catch (err) {
    console.error("Debug error:", err)
    res.status(500).json({ error: err.message })
  }
})

// Debug route to check specific token
app.get("/debug/token/:token", async (req, res) => {
  try {
    const token = req.params.token
    const [resets] = await db
      .promise()
      .query("SELECT *, NOW() as current_time FROM password_resets WHERE reset_token = ?", [token])
    res.json(resets)
  } catch (err) {
    console.error("Debug error:", err)
    res.status(500).json({ error: err.message })
  }
})
