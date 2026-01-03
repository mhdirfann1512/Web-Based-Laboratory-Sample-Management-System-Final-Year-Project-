const http = require("http")

console.log("🔍 Testing admin API directly...")

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/api/admin/system-overview",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
}

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`)
  console.log(`Headers:`, res.headers)

  let data = ""
  res.on("data", (chunk) => {
    data += chunk
  })

  res.on("end", () => {
    console.log("Response:", data)
    try {
      const parsed = JSON.parse(data)
      console.log("Parsed JSON:", parsed)
    } catch (e) {
      console.log("Not valid JSON")
    }
  })
})

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`)
})

req.end()
