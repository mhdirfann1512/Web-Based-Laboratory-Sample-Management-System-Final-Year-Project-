const fs = require("fs")
const path = require("path")

function verifyRoutes() {
  console.log("🔍 Verifying all routes in app.js...\n")

  const appPath = path.join(__dirname, "..", "app.js")
  const appContent = fs.readFileSync(appPath, "utf8")

  const routes = [
    { path: "/view-samples", method: "GET" },
    { path: "/api/samples", method: "GET" },
    { path: "/api/samples/:sampleId", method: "GET" },
    { path: "/api/samples/:sampleId/dispose", method: "POST" },
    { path: "/test-samples", method: "GET" },
  ]

  routes.forEach((route) => {
    const routePattern = `app.${route.method.toLowerCase()}("${route.path.replace(":sampleId", "")}`
    const exists = appContent.includes(routePattern)
    console.log(`${exists ? "✅" : "❌"} ${route.method} ${route.path}`)
  })

  console.log("\n📊 Route positions:")
  const viewSamplesIndex = appContent.indexOf('app.get("/view-samples"')
  const apiSamplesIndex = appContent.indexOf('app.get("/api/samples"')
  const errorHandlerIndex = appContent.indexOf("app.use((err, req, res, next)")

  console.log(`📄 /view-samples at position: ${viewSamplesIndex}`)
  console.log(`🔌 /api/samples at position: ${apiSamplesIndex}`)
  console.log(`⚠️  Error handler at position: ${errorHandlerIndex}`)

  if (apiSamplesIndex > errorHandlerIndex && errorHandlerIndex > -1) {
    console.log("❌ WARNING: API routes are after error handler - this will cause 404s!")
  } else {
    console.log("✅ Route order looks good")
  }
}

verifyRoutes()
