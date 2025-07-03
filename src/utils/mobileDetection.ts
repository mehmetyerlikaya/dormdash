/**
 * Mobile detection utilities for browser optimization
 */

export const isMobile = () => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

export const isIOS = () => {
  if (typeof window === 'undefined') return false
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export const isAndroid = () => {
  if (typeof window === 'undefined') return false
  
  return /Android/i.test(navigator.userAgent)
} 