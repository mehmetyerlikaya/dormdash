// Utility functions for machine ownership and user identification

import { getDeviceUserId } from "./userIdentification"
import type { Machine } from "@/src/hooks/useSupabaseData"

/**
 * Check if the current user owns/started a specific machine
 */
export function isCurrentUserOwner(machine: Machine): boolean {
  const currentUserId = getDeviceUserId()
  return machine.startedByUserId === currentUserId
}

/**
 * Check if a machine has an owner (was started by someone)
 * Only show ownership for machines that are actually in use
 */
export function hasOwner(machine: Machine): boolean {
  return !!machine.startedByUserId && (machine.status === "running" || machine.status === "finishedGrace")
}

/**
 * Get display text for machine ownership
 */
export function getOwnershipDisplay(machine: Machine): string {
  if (!hasOwner(machine)) {
    return ""
  }
  
  if (isCurrentUserOwner(machine)) {
    return "Your Machine"
  }
  
  return `Started by ${machine.startedByUserId}`
}

/**
 * Get ownership badge color classes
 */
export function getOwnershipBadgeClasses(machine: Machine): string {
  if (!hasOwner(machine)) {
    return ""
  }
  
  if (isCurrentUserOwner(machine)) {
    return "bg-green-100 text-green-800 border-green-200"
  }
  
  return "bg-blue-100 text-blue-800 border-blue-200"
}

/**
 * Check if current user can adjust time for a machine
 * Only available after 10 minutes of machine running
 */
export function canAdjustTime(machine: Machine): boolean {
  if (machine.status !== "running" || !isCurrentUserOwner(machine)) {
    return false
  }

  // Check if machine has been running for at least 10 minutes
  if (machine.startAt) {
    const now = new Date()
    const timeSinceStart = now.getTime() - machine.startAt.getTime()
    const tenMinutesInMs = 10 * 60 * 1000
    return timeSinceStart >= tenMinutesInMs
  }

  return false
}

/**
 * Get time remaining until adjustment is available (in minutes)
 * Returns 0 if adjustment is already available or not applicable
 */
export function getTimeUntilAdjustmentAvailable(machine: Machine): number {
  if (machine.status !== "running" || !isCurrentUserOwner(machine) || !machine.startAt) {
    return 0
  }

  const now = new Date()
  const timeSinceStart = now.getTime() - machine.startAt.getTime()
  const tenMinutesInMs = 10 * 60 * 1000

  if (timeSinceStart >= tenMinutesInMs) {
    return 0 // Already available
  }

  const timeRemaining = tenMinutesInMs - timeSinceStart
  return Math.ceil(timeRemaining / (60 * 1000)) // Convert to minutes
}
