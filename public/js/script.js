// Tab switching functionality
const tabTriggers = document.querySelectorAll(".tab-trigger")
const tabContents = document.querySelectorAll(".tab-content")
const switchButtons = document.querySelectorAll("[data-switch]")

function switchTab(targetTab) {
  // Update tab triggers
  tabTriggers.forEach((trigger) => {
    trigger.classList.remove("active")
    if (trigger.dataset.tab === targetTab) {
      trigger.classList.add("active")
    }
  })

  // Update tab contents
  tabContents.forEach((content) => {
    content.classList.remove("active")
    if (content.id === `${targetTab}-tab`) {
      content.classList.add("active")
    }
  })
}

// Tab trigger event listeners
tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    switchTab(trigger.dataset.tab)
  })
})

// Switch button event listeners
switchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchTab(button.dataset.switch)
  })
})

// Message display functions
function showMessage(elementId, message, isError = true) {
  const messageEl = document.getElementById(elementId)
  messageEl.textContent = message
  messageEl.className = isError ? "alert alert-error" : "alert alert-success"
  messageEl.classList.remove("hidden")
}

function hideMessage(elementId) {
  const messageEl = document.getElementById(elementId)
  messageEl.classList.add("hidden")
}

// Loading state functions
function setLoading(buttonId, isLoading, loadingText, normalText) {
  const button = document.getElementById(buttonId)
  button.disabled = isLoading
  button.textContent = isLoading ? loadingText : normalText
}

// API helper function (replace with your actual API endpoint)
async function apiCall(url, method, data) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Request failed")
  }

  return result
}

// Login form handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  hideMessage("login-message")
  setLoading("login-btn", true, "Signing in...", "Sign In")

  const formData = new FormData(e.target)
  const email = formData.get("email").trim()
  const password = formData.get("password")

  try {
    const result = await apiCall("/api/auth/login", "POST", { email, password })

    // Save token
    localStorage.setItem("token", result.token)

    // Redirect based on role
    const redirectUrl = result.user?.role === "Admin" ? "/customers.html" : "/customers.html"
    window.location.href = redirectUrl
  } catch (error) {
    showMessage("login-message", error.message, true)
  } finally {
    setLoading("login-btn", false, "Signing in...", "Sign In")
  }
})

// Signup form handler
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault()
  hideMessage("signup-message")
  setLoading("signup-btn", true, "Creating account...", "Create Account")

  const formData = new FormData(e.target)
  const name = formData.get("name").trim()
  const email = formData.get("email").trim()
  const password = formData.get("password")
  const role = formData.get("role")

  try {
    await apiCall("/api/auth/register", "POST", { name, email, password, role })

    showMessage("signup-message", "Registration successful! Please login with your credentials.", false)

    // Switch to login tab after success
    setTimeout(() => {
      switchTab("login")
    }, 1500)
  } catch (error) {
    showMessage("signup-message", error.message, true)
  } finally {
    setLoading("signup-btn", false, "Creating account...", "Create Account")
  }
})
