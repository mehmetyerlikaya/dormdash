"use client"

import { useState, useEffect, useCallback } from "react"

// Simulate a shared state system using multiple sync mechanisms
class SharedStateManager {
  private static instance: SharedStateManager
  private syncKey = "dorm-dashboard-sync-timestamp"
  private heartbeatKey = "dorm-dashboard-heartbeat"
  private listeners: Set<() => void> = new Set()

  static getInstance(): SharedStateManager {
    if (!SharedStateManager.instance) {
      SharedStateManager.instance = new SharedStateManager()
    }
    return SharedStateManager.instance
  }

  addListener(callback: () => void) {
    this.listeners.add(callback)
  }

  removeListener(callback: () => void) {
    this.listeners.delete(callback)
  }

  notifyChange() {
    // Update sync timestamp
    if (typeof window !== "undefined") {
      localStorage.setItem(this.syncKey, Date.now().toString())
      localStorage.setItem(this.heartbeatKey, Date.now().toString())
    }

    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error("Sync callback error:", error)
      }
    })
  }

  getLastSyncTime(): number {
    if (typeof window === "undefined") return 0
    const timestamp = localStorage.getItem(this.syncKey)
    return timestamp ? Number.parseInt(timestamp) : 0
  }

  startHeartbeat() {
    if (typeof window === "undefined") return

    // Update heartbeat every 2 seconds
    const heartbeatInterval = setInterval(() => {
      localStorage.setItem(this.heartbeatKey, Date.now().toString())
    }, 2000)

    // Check for external changes every 1 second
    const checkInterval = setInterval(() => {
      const lastHeartbeat = localStorage.getItem(this.heartbeatKey)
      const lastSync = localStorage.getItem(this.syncKey)

      if (lastHeartbeat && lastSync) {
        const heartbeatTime = Number.parseInt(lastHeartbeat)
        const syncTime = Number.parseInt(lastSync)
        const now = Date.now()

        // If sync timestamp is newer than our last known sync, trigger update
        if (syncTime > this.getLastSyncTime()) {
          console.log("External change detected, syncing...")
          this.listeners.forEach((callback) => callback())
        }
      }
    }, 1000)

    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(checkInterval)
    }
  }
}

export default function useSharedState() {
  const [lastSync, setLastSync] = useState(0)
  const manager = SharedStateManager.getInstance()

  const triggerSync = useCallback(() => {
    console.log("Triggering sync across all instances")
    manager.notifyChange()
    setLastSync(Date.now())
  }, [manager])

  const addSyncListener = useCallback(
    (callback: () => void) => {
      manager.addListener(callback)
      return () => manager.removeListener(callback)
    },
    [manager],
  )

  useEffect(() => {
    // Start heartbeat system
    const cleanup = manager.startHeartbeat()
    return cleanup
  }, [manager])

  return {
    triggerSync,
    addSyncListener,
    lastSync: manager.getLastSyncTime(),
  }
}
