const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing JavaScript display error in register-sample.html...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Find and replace the broken printLabel function
  const brokenPrintFunction = /function printLabel$$$$ \{[\s\S]*?printWindow\.document\.close$$$$;\s*\}/

  const fixedPrintFunction = `function printLabel() {
            const sampleId = document.getElementById('displaySampleId').textContent;
            const freezerName = document.getElementById('displayFreezerName').textContent;
            const tempRange = document.getElementById('displayTemperatureRange').textContent;
            
            // Create a simple print-friendly label
            const printWindow = window.open('', '_blank');
            
            const htmlContent = '<!DOCTYPE html><html><head><title>Sample Label - ' + sampleId + '</title><style>body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }.label { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }.sample-id { font-size: 24px; font-weight: bold; margin: 10px 0; font-family: "Courier New", monospace; letter-spacing: 2px; }.info { margin: 10px 0; font-size: 14px; }.date { margin-top: 20px; font-size: 12px; color: #666; }</style></head><body><div class="label"><h2>SAMPLE LABEL</h2><div class="sample-id">' + sampleId + '</div><div class="info"><strong>Storage:</strong> ' + freezerName + '</div><div class="info">' + tempRange + '</div><div class="date">Registered: ' + new Date().toLocaleDateString() + '</div></div><script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script></body></html>';
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        }`

  // Replace the broken function
  content = content.replace(brokenPrintFunction, fixedPrintFunction)

  // Also ensure all other functions are properly contained within script tags
  // Look for any stray JavaScript code that might be outside script tags
  const lines = content.split("\n")
  let inScript = false
  const fixedLines = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if we're entering or leaving a script tag
    if (line.includes("<script")) {
      inScript = true
    } else if (line.includes("</script>")) {
      inScript = false
    }

    // If we find JavaScript code outside of script tags, skip it
    if (
      !inScript &&
      (line.trim().startsWith("function ") ||
        line.trim().includes("document.getElementById") ||
        line.trim().includes("window.location") ||
        line.trim().includes("printWindow.document"))
    ) {
      console.log("🗑️ Removing stray JavaScript line:", line.trim().substring(0, 50) + "...")
      continue
    }

    fixedLines.push(line)
  }

  content = fixedLines.join("\n")

  // Write the fixed content back
  fs.writeFileSync(filePath, content, "utf8")

  console.log("✅ Fixed JavaScript display error successfully!")
  console.log("📄 The register-sample.html page should now display properly without visible JavaScript code")
} catch (error) {
  console.error("❌ Error fixing JavaScript display error:", error.message)
}
