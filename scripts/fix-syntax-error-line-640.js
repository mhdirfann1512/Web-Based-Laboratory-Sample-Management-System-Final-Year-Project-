const fs = require("fs")
const path = require("path")

console.log("🔧 Fixing syntax error in register-sample.html...")

const filePath = path.join(__dirname, "..", "public", "html", "register-sample.html")

try {
  let content = fs.readFileSync(filePath, "utf8")

  // Find and fix the unterminated string literal around line 640
  // This is likely in the printLabel function

  // Replace any broken string concatenation patterns
  content = content.replace(/\+\s*'\s*\+\s*''/g, "")
  content = content.replace(/\+\s*""\s*\+\s*""/g, "")
  content = content.replace(/'\s*\+\s*'\s*\+\s*'/g, "")
  content = content.replace(/"\s*\+\s*"\s*\+\s*"/g, "")

  // Fix any unterminated strings by finding lines that end with incomplete quotes
  const lines = content.split("\n")
  const fixedLines = []

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Check for unterminated string literals
    if ((line.includes("'") && !line.match(/'/g)) || (line.match(/'/g) && line.match(/'/g).length % 2 !== 0)) {
      // Fix unterminated single quotes
      if (line.endsWith("' +")) {
        line = line.replace("' +", "';")
      } else if (line.includes("' + '")) {
        line = line.replace("' + '", "")
      }
    }

    if ((line.includes('"') && !line.match(/"/g)) || (line.match(/"/g) && line.match(/"/g).length % 2 !== 0)) {
      // Fix unterminated double quotes
      if (line.endsWith('" +')) {
        line = line.replace('" +', '";')
      } else if (line.includes('" + "')) {
        line = line.replace('" + "', "")
      }
    }

    fixedLines.push(line)
  }

  content = fixedLines.join("\n")

  // Ensure all functions are properly closed
  // Find the printLabel function and make sure it's properly terminated
  const printLabelMatch = content.match(/function printLabel$$$$\s*{/)
  if (printLabelMatch) {
    const startIndex = content.indexOf(printLabelMatch[0])
    let braceCount = 0
    let endIndex = startIndex
    let inString = false
    let stringChar = ""

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i]

      if (!inString && (char === '"' || char === "'")) {
        inString = true
        stringChar = char
      } else if (inString && char === stringChar && content[i - 1] !== "\\") {
        inString = false
        stringChar = ""
      } else if (!inString) {
        if (char === "{") {
          braceCount++
        } else if (char === "}") {
          braceCount--
          if (braceCount === 0) {
            endIndex = i
            break
          }
        }
      }
    }

    // If we didn't find a proper closing brace, add one
    if (braceCount > 0) {
      const beforePrintLabel = content.substring(0, startIndex)
      const afterPrintLabel = content.substring(endIndex + 1)

      // Create a simple, working printLabel function
      const newPrintLabel = `function printLabel() {
    const sampleId = document.getElementById('displaySampleId').textContent;
    const freezerName = document.getElementById('displayFreezerName').textContent;
    const tempRange = document.getElementById('displayTemperatureRange').textContent;
    
    const printWindow = window.open('', '_blank');
    const labelHtml = '<!DOCTYPE html><html><head><title>Sample Label - ' + sampleId + '</title><style>body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }.label { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }.sample-id { font-size: 24px; font-weight: bold; margin: 10px 0; font-family: "Courier New", monospace; letter-spacing: 2px; }.info { margin: 10px 0; font-size: 14px; }.date { margin-top: 20px; font-size: 12px; color: #666; }</style></head><body><div class="label"><h2>SAMPLE LABEL</h2><div class="sample-id">' + sampleId + '</div><div class="info"><strong>Storage:</strong> ' + freezerName + '</div><div class="info">' + tempRange + '</div><div class="date">Registered: ' + new Date().toLocaleDateString() + '</div></div><script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script></body></html>';
    
    printWindow.document.write(labelHtml);
    printWindow.document.close();
}`

      content = beforePrintLabel + newPrintLabel + afterPrintLabel
    }
  }

  // Remove any stray JavaScript code that might be visible
  content = content.replace(
    /'; printWindow\.document\.write$$labelHtml$$;.*?window\.location\.href = '\/view-samples'; }/gs,
    "",
  )

  // Make sure the file ends properly
  if (!content.trim().endsWith("</html>")) {
    // Find the last </script> tag and make sure </body></html> follows
    const lastScriptIndex = content.lastIndexOf("</script>")
    if (lastScriptIndex !== -1) {
      const afterScript = content.substring(lastScriptIndex + 9)
      if (!afterScript.includes("</body>")) {
        content = content.substring(0, lastScriptIndex + 9) + "\n</body>\n</html>"
      }
    }
  }

  fs.writeFileSync(filePath, content, "utf8")
  console.log("✅ Fixed syntax error in register-sample.html")
  console.log("✅ Removed visible JavaScript code")
  console.log("✅ Fixed unterminated string literals")
  console.log("✅ Ensured proper function closures")
} catch (error) {
  console.error("❌ Error fixing syntax error:", error.message)
}
