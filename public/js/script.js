// Function to display error messages
function showMessage(message, isError = true) {
  const messageDiv = document.getElementById("message")
  if (!messageDiv) return

  messageDiv.textContent = message
  messageDiv.style.display = "block"
  messageDiv.className = isError ? "alert alert-error" : "alert alert-success"

  // Hide after 5 seconds
  setTimeout(() => {
    messageDiv.style.display = "none"
  }, 5000)
}

// Check URL for error messages and success messages
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search)
  const error = urlParams.get("error")
  const message = urlParams.get("message")

  if (error) {
    showMessage(error, true)
  }

  if (message) {
    showMessage(message, false) // Show as success message
  }
})

// Form submission handling - FIXED VERSION
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", async function (e) {
    e.preventDefault()

    const formData = new FormData(this)
    const action = this.getAttribute("action")
    const method = this.getAttribute("method")

    // Convert FormData to URLSearchParams for proper encoding
    const urlEncodedData = new URLSearchParams()
    for (const [key, value] of formData) {
      urlEncodedData.append(key, value)
    }

    try {
      const response = await fetch(action, {
        method: method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlEncodedData,
      })

      if (response.redirected) {
        window.location.href = response.url
      } else if (response.ok) {
        // Handle successful response
        window.location.href = response.url || "/login"
      } else {
        const result = await response.text()
        throw new Error(result)
      }
    } catch (error) {
      showMessage(error.message)
    }
  })
})

// Add a function to check if the user is logged in
// Add this at the end of the file:

// Check if user is logged in
function checkAuth() {
  // This is a simple check - you might want to implement a more robust solution
  fetch("/api/profile")
    .then((response) => {
      if (!response.ok) {
        // If not authorized, redirect to login
        window.location.href = "/login?error=Please login to access this page"
      }
    })
    .catch((error) => {
      console.error("Auth check failed:", error)
      window.location.href = "/login?error=Please login to access this page"
    })
}

// Add a logout function
function logout() {
  fetch("/logout", { method: "POST" })
    .then(() => {
      window.location.href = "/login?message=You have been logged out"
    })
    .catch((error) => {
      console.error("Logout failed:", error)
    })
}
