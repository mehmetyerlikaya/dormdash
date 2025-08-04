// Generate a consistent user ID for this device
export function getDeviceUserId(): string {
  // Return a default value during SSR
  if (typeof window === "undefined") return "anonymous-ssr"

  try {
    let userId = localStorage.getItem("dorm-dashboard-user-id")

    if (!userId) {
      // Use a more stable ID generation method to avoid hydration issues
      // Use a combination of timestamp and a hash of user agent for consistency
      const timestamp = Math.floor(Date.now() / 1000) // Use seconds instead of milliseconds for more stability
      const userAgentHash = hashString(navigator.userAgent)
      const stableRandom = ((timestamp * 9301 + userAgentHash * 49297) % 233280) / 233280
      const randomNum = Math.floor(stableRandom * 10000)
      userId = `dormie-${randomNum.toString().padStart(4, "0")}`
      localStorage.setItem("dorm-dashboard-user-id", userId)
    }

    return userId
  } catch (error) {
    console.warn("Error getting device user ID:", error)
    return "anonymous-fallback"
  }
}

// Generate a device fingerprint
function generateDeviceFingerprint(): string {
  if (typeof window === "undefined") return "ssr-fingerprint"

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  let fingerprint = ""

  if (ctx) {
    ctx.textBaseline = "top"
    ctx.font = "14px Arial"
    ctx.fillText("Device fingerprint", 2, 2)
    fingerprint += canvas.toDataURL()
  }

  // Add more device characteristics
  fingerprint += navigator.userAgent
  fingerprint += navigator.language
  fingerprint += screen.width + "x" + screen.height
  fingerprint += new Date().getTimezoneOffset()
  fingerprint += navigator.hardwareConcurrency || "unknown"

  return fingerprint
}

// Simple hash function
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) // Ensure positive value
}

// Get a display name for the user
export function getUserDisplayName(): string {
  if (typeof window === "undefined") return "Anonymous"

  try {
    const displayName = localStorage.getItem("dorm-dashboard-display-name")
    if (displayName) {
      return displayName
    }
    return getDeviceUserId()
  } catch (error) {
    return "Anonymous"
  }
}

// Set a custom display name
export function setUserDisplayName(name: string): void {
  if (typeof window === "undefined") return

  try {
    // Sanitize the display name
    const sanitized = name.trim().slice(0, 20) // Max 20 characters
    if (sanitized) {
      localStorage.setItem("dorm-dashboard-display-name", sanitized)
    }
  } catch (error) {
    console.warn("Could not save display name:", error)
  }
}

// Check if current user owns a post
export function isCurrentUserPost(postUserId: string): boolean {
  if (typeof window === "undefined") return false

  const currentUserId = getDeviceUserId()
  const currentDisplayName = getUserDisplayName()

  // Check both user ID and display name for backwards compatibility
  return postUserId === currentUserId || postUserId === currentDisplayName
}
