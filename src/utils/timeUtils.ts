// Utility functions for time formatting and recent update detection

/**
 * Check if a timestamp is considered "recent" (within the last 10 seconds)
 */
export function isRecentlyUpdated(updatedAt: Date): boolean {
  const now = new Date()
  const timeDiff = now.getTime() - updatedAt.getTime()
  return timeDiff <= 10000 // 10 seconds
}

/**
 * Format time difference as "Updated Xs ago"
 */
export function formatTimeAgo(updatedAt: Date): string {
  const now = new Date()
  const timeDiff = Math.floor((now.getTime() - updatedAt.getTime()) / 1000)
  
  if (timeDiff < 60) {
    return `Updated ${timeDiff}s ago`
  } else if (timeDiff < 3600) {
    const minutes = Math.floor(timeDiff / 60)
    return `Updated ${minutes}m ago`
  } else if (timeDiff < 86400) {
    const hours = Math.floor(timeDiff / 3600)
    return `Updated ${hours}h ago`
  } else {
    const days = Math.floor(timeDiff / 86400)
    return `Updated ${days}d ago`
  }
}

/**
 * Get the appropriate CSS classes for recently updated items
 */
export function getRecentUpdateClasses(updatedAt: Date): string {
  if (isRecentlyUpdated(updatedAt)) {
    return "ring-2 ring-blue-400 shadow-lg animate-pulse-slow"
  }
  return ""
}
