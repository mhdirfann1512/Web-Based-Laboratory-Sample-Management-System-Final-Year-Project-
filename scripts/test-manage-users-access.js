const http = require("http")

function testManageUsersAccess() {
  console.log("🧪 Testing manage-users route access...\n")

  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/manage-users",
    method: "GET",
    headers: {
      "User-Agent": "Node.js Test Script",
    },
  }

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`)
    console.log(`📋 Headers:`, res.headers)

    if (res.statusCode === 200) {
      console.log("✅ Route is accessible!")
    } else if (res.statusCode === 302) {
      console.log("🔄 Redirected (probably to login) - this is expected if not logged in")
      console.log(`🔗 Redirect location: ${res.headers.location}`)
    } else if (res.statusCode === 404) {
      console.log("❌ Route not found - check if route is properly defined in app.js")
    } else {
      console.log(`⚠️ Unexpected status code: ${res.statusCode}`)
    }

    let data = ""
    res.on("data", (chunk) => {
      data += chunk
    })

    res.on("end", () => {
      if (res.statusCode === 404) {
        console.log("\n📄 Response body (first 200 chars):")
        console.log(data.substring(0, 200))
      }
    })
  })

  req.on("error", (e) => {
    console.error(`❌ Request failed: ${e.message}`)
    console.log("💡 Make sure your server is running on port 3000")
  })

  req.end()
}

testManageUsersAccess()
