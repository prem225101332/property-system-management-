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

// Password visibility toggle
document.querySelectorAll(".password-toggle").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const targetId = toggle.dataset.target
    const passwordInput = document.getElementById(targetId)

    if (passwordInput.type === "password") {
      passwordInput.type = "text"
      toggle.textContent = "🙈"
    } else {
      passwordInput.type = "password"
      toggle.textContent = "👁️"
    }
  })
})

// Role selection handler for admin ID
document.getElementById("signup-role").addEventListener("change", (e) => {
  const adminIdGroup = document.getElementById("admin-id-group")
  const adminIdInput = document.getElementById("admin-id")

  if (e.target.value === "Admin") {
    adminIdGroup.classList.remove("hidden")
    adminIdInput.required = true
  } else {
    adminIdGroup.classList.add("hidden")
    adminIdInput.required = false
    adminIdInput.value = ""
  }
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

  if (isLoading) {
    button.classList.add("loading")
    button.textContent = loadingText
  } else {
    button.classList.remove("loading")
    button.textContent = normalText
  }
}

// API helper function
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
    const redirectUrl = result.user?.role === "Admin" ? "/customers.html" : "/customer.html"
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
  const adminId = formData.get("adminId")

  // Validate admin ID if role is Admin
  if (role === "Admin") {
    if (!adminId || adminId.trim() !== "2694") {
      showMessage("signup-message", "Invalid admin ID. Please contact administrator for correct ID.", true)
      setLoading("signup-btn", false, "Creating account...", "Create Account")
      return
    }
  }

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

// Enhanced form validation with real-time feedback
document.addEventListener("input", (e) => {
  const input = e.target

  // Email validation
  if (input.type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (input.value && !emailRegex.test(input.value)) {
      input.style.borderColor = "#dc2626"
    } else {
      input.style.borderColor = ""
    }
  }

  // Password strength indicator
  if (input.type === "password") {
    if (input.value.length > 0 && input.value.length < 6) {
      input.style.borderColor = "#dc2626"
    } else {
      input.style.borderColor = ""
    }
  }
})
